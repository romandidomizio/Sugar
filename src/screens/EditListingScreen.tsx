import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Platform,
  Alert,
  Text,
  Dimensions,
} from 'react-native';
import {
  TextInput,
  Button,
  RadioButton,
  Switch,
  HelperText,
  useTheme,
  Menu,
  TouchableRipple,
  ActivityIndicator,
  Snackbar,
  Divider,
  MD3Theme, // Import MD3Theme type
} from 'react-native-paper';
import { Formik, FormikProps, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { useRoute, RouteProp, useNavigation, NavigationProp } from '@react-navigation/native';
import axios from 'axios';
import { useAppContext } from '../contexts/AppContext';
import axiosInstance from '../utils/axiosInstance';
import { API_BASE_URL } from '@env';
import CustomMultiSelect from '../components/CustomMultiSelect';
import { RootStackParamList } from '../navigation/MainNavigator';

// --- Type Definitions --- 

// Type for the form values
interface FormValues {
  title: string;
  producer: string;
  price: string; // Changed from number to string
  unitType: 'unit' | 'size' | '';
  quantity: string; // Keep as string for input handling
  sizeMeasurement: string;
  description: string;
  origin: string;
  certifications: string[];
  contactMethod: 'Email' | 'Phone' | 'Direct Message' | '';
  expiryDate: Date | null;
  shareLocation: boolean;
  location: { latitude: number; longitude: number; type?: 'Point'; coordinates?: [number, number] } | null; // Include backend structure possibility
  imageUri: string | null; // URI for display/upload
  // Helper fields for Formik, not sent directly to backend
  imageName?: string;
  imageType?: string;
  // Field to track if a *new* image has been selected by the user
  newImageSelected?: boolean; 
}

// Type for route parameters expected by this screen
type EditListingScreenRouteProp = RouteProp<RootStackParamList, 'EditListing'>;

// Define the expected type for Dropdown options
type DropdownOption = { label: string; value: string; };

// --- Constants and Options --- 

const originOptions: DropdownOption[] = [
  { label: 'Local Farm', value: 'local_farm' },
  { label: 'Community Garden', value: 'community_garden' },
  { label: 'Home Garden', value: 'home_garden' },
  { label: 'Imported', value: 'imported' },
  { label: 'Other', value: 'other' },
];

const certificationOptions: DropdownOption[] = [
  { label: 'Organic', value: 'Organic' },
  { label: 'Non-GMO', value: 'Non-GMO' },
  { label: 'Fair Trade', value: 'Fair Trade' },
  { label: 'Gluten-Free', value: 'Gluten-Free' },
  { label: 'Vegan', value: 'Vegan' },
  { label: 'Kosher', value: 'Kosher' },
  { label: 'Halal', value: 'Halal' },
];

const contactMethodOptions: DropdownOption[] = [
  { label: 'Prefer Email', value: 'Email' },
  { label: 'Prefer Phone', value: 'Phone' },
  { label: 'Prefer Direct Message', value: 'Direct Message' },
];

// --- Validation Schema --- 

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required.'),
  producer: Yup.string().required('Producer is required.'),
  // Price validation: Required, must match currency format ($##.##)
  price: Yup.string()
    .required('Price is required')
    .matches(/^\$?(\d+(\.\d{2})?)$/, 'Price must be in $0.00 format (e.g., $10.50 or 5.00)')
    .test('is-valid-number', 'Price must be a valid number', value => {
      // Remove optional '$' before checking if it's a number
      const numericValue = value?.startsWith('$') ? value.substring(1) : value;
      return !isNaN(parseFloat(numericValue)) && isFinite(parseFloat(numericValue));
    }),
  description: Yup.string().required('Description is required.'),
  origin: Yup.string().required('Origin is required.'),
  certifications: Yup.array().of(Yup.string()).ensure(),
  unitType: Yup.string().oneOf(['unit', 'size'], 'Please select a unit type.').required('Unit type selection is required.'),
  quantity: Yup.string()
    .when('unitType', {
      is: 'unit',
      then: (schema) => schema
        .required('Quantity is required when pricing per unit.')
        .matches(/^[0-9]+$/, 'Quantity must be a whole number')
        .test('positive', 'Quantity must be positive', (value) => parseInt(value || '0', 10) > 0),
      otherwise: (schema) => schema.nullable().strip(),
    }),
  sizeMeasurement: Yup.string()
    .when('unitType', {
      is: 'size',
      then: (schema) => schema.required('Size/weight description is required when pricing by size.')
                            .trim()
                            .min(1, 'Size/weight description cannot be empty.'),
      otherwise: (schema) => schema.nullable().strip(),
    }),
  expiryDate: Yup.date().nullable().required('Expiry date is required.').min(new Date(), 'Expiry date cannot be in the past.'),
  contactMethod: Yup.string().required('Please select a preferred contact method'),
  shareLocation: Yup.boolean(),
  location: Yup.object()
    .shape({
      latitude: Yup.number().required(),
      longitude: Yup.number().required(),
    })
    .nullable(),
});

// Default initial values (mostly empty for the edit screen, will be overwritten by fetched data)
const defaultInitialValues: FormValues = {
  title: '',
  producer: '',
  price: '', // Changed from number to string
  unitType: '',
  quantity: '',
  sizeMeasurement: '',
  description: '',
  origin: '',
  certifications: [],
  contactMethod: '',
  expiryDate: new Date(), // Default to today, will be overwritten
  shareLocation: false,
  location: null,
  imageUri: null,
  newImageSelected: false,
};

// --- Styles --- 
const createStyles = (theme: MD3Theme) => StyleSheet.create({ // Use MD3Theme type
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100, // Extra padding at bottom
    backgroundColor: theme.colors.background,
  },
  title: {
    ...theme.fonts.headlineSmall, // Use headlineSmall font specs
    marginBottom: 20,
    textAlign: 'center',
    color: theme.colors.primary, // Use primary color
  },
  formErrorText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
  },
  formContainer: {
    // Styles for the main form area
  },
  input: {
    marginBottom: 15,
    backgroundColor: theme.colors.surface, // Ensure contrast
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align items to the top for inputs
    marginBottom: 15, // Add margin below the row
  },
  priceInput: {
    flex: 1,
    marginRight: 10,
  },
  unitDropdown: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  dropdownMenu: {
    backgroundColor: theme.colors.surface,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePreview: {
    width: Dimensions.get('window').width * 0.8,
    height: Dimensions.get('window').width * 0.6, // Aspect ratio 4:3
    borderRadius: theme.roundness,
    marginBottom: 10,
    backgroundColor: theme.colors.surfaceVariant, // Placeholder bg
  },
  locationContainer: {
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: theme.roundness,
    padding: 15,
    marginBottom: 15,
    backgroundColor: theme.colors.surfaceVariant, // Slightly different bg
  },
  locationSwitchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 16,
    marginBottom: 5,
    color: theme.colors.onSurfaceVariant,
  },
  locationCoords: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  certificationSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: theme.colors.onBackground,
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow checkboxes to wrap
    marginBottom: 10,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 10,
    width: '45%', // Roughly two columns
  },
  radioGroupContainer: {
    marginBottom: 15,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
  menuStyle: {
    marginTop: 50, // Adjust as needed to position below anchor
  },
});

// --- Component --- 

const EditListingScreen: React.FC = () => {
  const theme = useTheme(); // Use theme hook without explicit type
  const styles = createStyles(theme);
  const { state } = useAppContext(); // Use AppContext hook
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<EditListingScreenRouteProp>();
  const listingId = route.params?.listingId;

  // --- State Variables --- 
  const [initialFormValues, setInitialFormValues] = useState<FormValues | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Start loading immediately
  const [formError, setFormError] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null); // Stores the URI of the image to display/upload
  const [newImageSelected, setNewImageSelected] = useState<boolean>(false); // Track if user picked a NEW image
  const [selectedCertifications, setSelectedCertifications] = useState<Set<string>>(new Set());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState<Date>(new Date()); // Date picker state
  const [location, setLocation] = useState<FormValues['location']>(null); // Location state
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<Location.PermissionStatus | null>(null);

  const formikRef = useRef<FormikProps<FormValues>>(null);

  // --- Local State for Origin Menu --- 
  const [originMenuVisible, setOriginMenuVisible] = useState(false);
  const openOriginMenu = () => setOriginMenuVisible(true);
  const closeOriginMenu = () => setOriginMenuVisible(false);

  // --- Permissions --- 
  useEffect(() => {
    (async () => {
      // Request Camera and Media Library permissions
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus.status !== 'granted' || mediaLibraryStatus.status !== 'granted') {
        // Alert.alert('Permissions Required', 'Camera and media library permissions are needed to select images.');
        console.warn('[EditListingScreen] Camera or Media Library permissions not granted.');
      }
      // Request Location permissions
      const locationStatus = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionStatus(locationStatus.status);
      if (locationStatus.status !== 'granted') {
        // Alert.alert('Permissions Required', 'Location permission is needed to share your current location.');
         console.warn('[EditListingScreen] Location permission not granted.');
      }
    })();
  }, []);

  // --- Fetch Listing Data --- 
  const fetchListingData = useCallback(async () => {
    if (!listingId) {
      setFormError('No listing ID provided.');
      setLoading(false);
      return;
    }
    console.log(`[EditListingScreen] Fetching data for listing ID: ${listingId}`);
    setLoading(true);
    setFormError(null);
    try {
      const response = await axiosInstance.get(`/api/user/listings/${listingId}`);
      const listingData = response.data;

      // --- Transform fetched data --- 
      // Correctly transform location data from backend { coordinates: [lon, lat] } to frontend { latitude, longitude }
      let locationForState: FormValues['location'] = null;
      if (
        listingData.location && 
        listingData.location.coordinates && 
        Array.isArray(listingData.location.coordinates) &&
        listingData.location.coordinates.length === 2 &&
        typeof listingData.location.coordinates[0] === 'number' &&
        typeof listingData.location.coordinates[1] === 'number'
      ) {
        // Backend sends [longitude, latitude]
        locationForState = {
          longitude: listingData.location.coordinates[0],
          latitude: listingData.location.coordinates[1],
        };
        console.log('[EditListingScreen] Transformed location:', locationForState);
      } else {
        console.warn('[EditListingScreen] Received invalid or missing location data from backend:', listingData.location);
      }

      const transformedData: FormValues = {
        title: listingData.title || '',
        producer: listingData.producer || '',
        // Ensure price is initialized as a string, handle potential null/undefined
        price: listingData.price != null ? String(listingData.price) : '', 
        unitType: listingData.unitType || '',
        // Ensure quantity is initialized as a string
        quantity: listingData.quantity != null ? String(listingData.quantity) : '',
        sizeMeasurement: listingData.sizeMeasurement || '',
        description: listingData.description || '',
        origin: listingData.origin || '',
        certifications: listingData.certifications || [],
        contactMethod: listingData.contactMethod || '',
        expiryDate: listingData.expiryDate ? new Date(listingData.expiryDate) : new Date(),
        shareLocation: !!listingData.location, // If location exists, assume it was shared
        location: locationForState, // Use the transformed location object for Formik initial values
        imageUri: listingData.imageUri ? `${API_BASE_URL}${listingData.imageUri.startsWith('/') ? listingData.imageUri : '/' + listingData.imageUri}` : null, // Ensure leading slash for base url concat
        newImageSelected: false, // Start assuming no new image selected
      };
      console.log('[EditListingScreen] Fetched and transformed data:', transformedData);

      // --- Update State --- 
      setInitialFormValues(transformedData); // Set initial values for Formik
      setImage(transformedData.imageUri); // Set image for display
      setDate(transformedData.expiryDate || new Date()); // Set date picker state
      setSelectedCertifications(new Set(transformedData.certifications)); // Set certifications state
      setLocation(locationForState); // Set local location state using the correctly transformed object
      
      // IMPORTANT: Reset Formik with the fetched values AFTER setting initialFormValues state
      // Use a timeout to ensure state update has propagated before reset
      setTimeout(() => {
         if (formikRef.current) {
             formikRef.current.resetForm({ values: transformedData });
             console.log('[EditListingScreen] Formik form reset with fetched values.');
         }
      }, 0);

    } catch (err: any) {
      console.error('[EditListingScreen] Error fetching listing for edit:', err);
      const message = err.response?.data?.message || err.message || 'Failed to load listing data.';
      setFormError(message);
      Alert.alert('Error Loading Data', message);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  // Fetch data when the screen focuses or listingId changes
  useEffect(() => {
    fetchListingData();
  }, [fetchListingData]); // fetchListingData depends on listingId

  // --- Image Picker Logic ---

  // Function to handle taking a photo with the camera
  const handleTakePhoto = async (setFieldValue: Function) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setFieldValue('imageUri', asset.uri);
      setFieldValue('imageType', asset.mimeType || 'image/jpeg');
      setFieldValue('imageName', asset.fileName || `photo_${Date.now()}.jpg`);
      setFieldValue('newImageSelected', true); // Mark that a new image was chosen
    } else if (result.canceled) {
      console.log('Camera cancelled');
    }
  };

  // Function to handle choosing an image from the library
  const handleChooseFromLibrary = async (setFieldValue: Function) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Media library permission is needed to choose photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setFieldValue('imageUri', asset.uri);
      setFieldValue('imageType', asset.mimeType || 'image/jpeg');
      setFieldValue('imageName', asset.fileName || `library_${Date.now()}.jpg`);
      setFieldValue('newImageSelected', true); // Mark that a new image was chosen
    } else if (result.canceled) {
      console.log('Library selection cancelled');
    }
  };

  // Function to show image selection options
  const showImagePickerOptions = (setFieldValue: Function) => {
    Alert.alert(
      'Select Image Source',
      'Choose where to get the image from:',
      [
        { text: 'Take Photo', onPress: () => handleTakePhoto(setFieldValue) },
        { text: 'Choose from Library', onPress: () => handleChooseFromLibrary(setFieldValue) },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  // --- Form Handlers --- 

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    // Keep date picker open on iOS until user dismisses it
    setShowDatePicker(Platform.OS === 'ios'); 
    setDate(currentDate);
    formikRef.current?.setFieldValue('expiryDate', currentDate);
    // Hide picker on Android after selection or dismissal
    if (Platform.OS === 'android') {
        setShowDatePicker(false);
    }
  };

  // Function to explicitly hide date picker (e.g., for iOS 'Done' button)
  const hideDatePicker = () => {
      setShowDatePicker(false);
  }

  const handleGetCurrentLocation = async () => {
    if (locationPermissionStatus !== 'granted') {
      Alert.alert('Location Permission Needed', 'Please grant location permission in your device settings to use this feature.');
      return;
    }
    setIsFetchingLocation(true);
    try {
      // Get current location
      const locationResult = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      };
      setLocation(newLocation); // Update local state
      // Update Formik state
      formikRef.current?.setFieldValue('location', newLocation);
      formikRef.current?.setFieldValue('shareLocation', true); // Assume user wants to share if they fetch
      console.log('[EditListingScreen] Fetched location:', newLocation);
    } catch (error) {
      console.error('[EditListingScreen] Error fetching location:', error);
      Alert.alert('Error', 'Could not fetch current location. Please ensure GPS is enabled.');
    } finally {
      setIsFetchingLocation(false);
    }
  };

  // --- Form Submission (PUT Request) --- 
  const onSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
    console.log('[EditListingScreen] onSubmit triggered. Values:', values);
    setFormError('');
    setSubmitting(true);

    // --- Token Check --- 
    if (!state.auth.token) { // Access token from AppContext state
      Alert.alert('Error', 'Authentication token not found. Please log in again.');
      setSubmitting(false);
      return;
    }
    if (!listingId) {
       Alert.alert('Error', 'Listing ID is missing. Cannot update.');
       setSubmitting(false);
       return;
    }

    // --- Contact Info Logic (Same as PostScreen) --- 
    const userEmail = state.auth.user?.email;
    const userPhone = state.auth.user?.phone;
    let contactInfoToSend = '';
    switch (values.contactMethod) {
      case 'Email':
        if (!userEmail) {
          setFormError('Your email is not set in your profile.');
          setSubmitting(false);
          return;
        }
        contactInfoToSend = userEmail;
        break;
      case 'Phone':
        if (!userPhone) {
          setFormError('Your phone number is not set in your profile.');
          setSubmitting(false);
          return;
        }
        contactInfoToSend = userPhone;
        break;
      case 'Direct Message':
        contactInfoToSend = 'DM'; // Backend expects 'DM' string or similar
        break;
      default:
        // This case should ideally not be hit due to validation, but handle defensively
        setFormError('Invalid contact method selected.');
        setSubmitting(false);
        return;
    }

    // --- Prepare FormData --- 
    const formData = new FormData();
    // Create a mutable copy of values for manipulation
    const listingDetails: any = { ...values }; // Use 'any' temporarily for easier property deletion

    // Delete helper fields not needed by backend
    delete listingDetails.imageName;
    delete listingDetails.imageType;
    delete listingDetails.newImageSelected; // Don't send this flag

    // **Critical Image Handling:** Only delete imageUri if NO new image was selected.
    // If a new image *was* selected, imageUri is needed by the backend logic (though file takes precedence)
    // If no new image was selected, sending imageUri might cause issues if backend tries to re-validate it.
    // Best practice: If no new image, don't send imageUri or the 'image' field.
    if (!newImageSelected) { 
      delete listingDetails.imageUri;
    } else {
        // If a new image IS selected, the backend should ignore this `imageUri` from `listingDetails`
        // because the `image` file part will be present. We can optionally delete it here too.
        delete listingDetails.imageUri; 
    }

    // Handle location based on shareLocation flag
    if (!values.shareLocation) {
      listingDetails.location = null; // Explicitly set to null if not sharing
    } else {
       // Ensure location object has the correct 'Point' structure if sharing
      if (location && location.latitude && location.longitude) {
          listingDetails.location = {
              type: 'Point',
              coordinates: [location.longitude, location.latitude] // Backend expects [lon, lat]
          };
      } else {
          // If shareLocation is true but location state is somehow null, don't send it
          listingDetails.location = null; 
      }
    }

    // Add contact info and certifications
    listingDetails.contactInfo = contactInfoToSend;
    listingDetails.certifications = Array.from(selectedCertifications);

    // Append details as JSON string
    formData.append('listingDetails', JSON.stringify(listingDetails));
    console.log('[EditListingScreen] FormData prepared. listingDetails appended as JSON string.');
    console.log('[EditListingScreen] Stringified details:', JSON.stringify(listingDetails));

    // Append *new* image file ONLY if one was selected by the user
    if (newImageSelected && image) {
      const uriParts = image.split('/');
      const fileName = uriParts[uriParts.length - 1];
      // Basic mime type detection from extension
      let fileExtension = fileName.split('.').pop()?.toLowerCase();
      let mimeType = 'image/jpeg'; // Default
      if (fileExtension === 'png') mimeType = 'image/png';
      else if (fileExtension === 'gif') mimeType = 'image/gif';
      else if (fileExtension === 'webp') mimeType = 'image/webp';
      // Add more types as needed
      
      console.log(`[EditListingScreen] Appending new image to FormData: ${fileName}, Type: ${mimeType}`);
      formData.append('image', {
        uri: image,
        name: fileName,
        type: mimeType,
      } as any); // Type assertion needed for FormData append
    } else {
      console.log('[EditListingScreen] No new image selected, not appending image file.');
    }

    // --- API Call (PUT) --- 
    const apiUrl = `${API_BASE_URL}/api/user/listings/${listingId}`;
    const apiMethod = 'put';

    console.log(`[EditListingScreen] Sending ${apiMethod.toUpperCase()} request to ${apiUrl}`);

    try {
      const response = await axiosInstance[apiMethod](apiUrl, formData, {
        headers: {
          // Axios might set multipart/form-data automatically, but being explicit is safer
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${state.auth.token}`,
        }
      });

      console.log('[EditListingScreen] Update successful:', response.data);
      Alert.alert('Success', 'Listing updated successfully!');
      
      // --- Post-Success Navigation --- 
      // Decide where to go: Back to MyListings is usually appropriate
      // Or potentially to a detail screen for the updated listing if one exists
      navigation.navigate('BottomTab', { screen: 'My Listings' }); // Navigate back to the list

    } catch (err: any) {
      console.error('[EditListingScreen] Error updating listing:', err);
      let message = 'Failed to update listing.';
      if (axios.isAxiosError(err)) {
         console.error('Axios error details:', { 
            status: err.response?.status, 
            data: err.response?.data, 
            headers: err.response?.headers 
         });
         message = err.response?.data?.message || err.response?.data?.error || err.message;
      } else {
         console.error('Non-Axios error:', err.message);
         message = err.message;
      }
      setFormError(message);
      Alert.alert('Update Failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Render Logic --- 

  // Show loading indicator while fetching initial data
  if (loading || !initialFormValues) { // Check !initialFormValues as well
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10, color: theme.colors.onBackground }}>Loading Listing Data...</Text>
      </View>
    );
  }

  // --- Main JSX Render --- 
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Edit Your Listing</Text>
      
      {/* Display overall form error */}
      {formError && (
        <HelperText type="error" visible={!!formError} style={styles.formErrorText}>
          {formError}
        </HelperText>
      )}

      <Formik
        initialValues={initialFormValues} // Use fetched data loaded into state
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        innerRef={formikRef}
        enableReinitialize={true} // IMPORTANT: Allow Formik to reinitialize when initialFormValues state changes after fetch
      >
        {({ 
          handleChange, 
          handleBlur, 
          handleSubmit, 
          setFieldValue, 
          values, 
          errors, 
          touched, 
          isSubmitting 
        }) => {
          return (
            <View style={styles.formContainer}>
              {/* --- Title --- */}
              <TextInput
                label="Title*"
                mode="outlined"
                value={values.title}
                onChangeText={handleChange('title')}
                onBlur={handleBlur('title')}
                error={touched.title && !!errors.title}
                style={styles.input}
                theme={{ colors: { primary: theme.colors.primary } }}
              />
              <HelperText type="error" visible={touched.title && !!errors.title}>
                {errors.title}
              </HelperText>

              {/* --- Producer --- */}
               <TextInput
                label="Producer*"
                mode="outlined"
                value={values.producer}
                onChangeText={handleChange('producer')}
                onBlur={handleBlur('producer')}
                error={touched.producer && !!errors.producer}
                style={styles.input}
              />
              <HelperText type="error" visible={touched.producer && !!errors.producer}>
                {errors.producer}
              </HelperText>

              {/* --- Price & Unit Type Row --- */}
              <View style={styles.row}>
                <TextInput
                  label="Price ($)*"
                  mode="outlined"
                  value={values.price} // Value is now correctly typed as string
                  onChangeText={handleChange('price')}
                  onBlur={handleBlur('price')}
                  keyboardType="decimal-pad" // Set keyboard type
                  error={touched.price && !!errors.price}
                  style={styles.input}
                  left={<TextInput.Affix text="$ " />} // Add fixed dollar sign prefix
                />
                <View style={styles.radioGroupContainer}>
                  <Text style={styles.certificationSectionTitle}>Unit Type*</Text>
                  <RadioButton.Group 
                    onValueChange={newValue => setFieldValue('unitType', newValue)} 
                    value={values.unitType}
                  >
                    <View style={styles.radioRow}>
                      <RadioButton value="unit" color={theme.colors.primary} />
                      <Text onPress={() => setFieldValue('unitType', 'unit')}>Unit</Text>
                    </View>
                    <View style={styles.radioRow}>
                      <RadioButton value="size" color={theme.colors.primary} />
                      <Text onPress={() => setFieldValue('unitType', 'size')}>Size/Weight</Text>
                    </View>
                  </RadioButton.Group>
                  <HelperText type="error" visible={touched.unitType && !!errors.unitType}>
                    {errors.unitType}
                  </HelperText>
                </View>
              </View>
               <HelperText type="error" visible={!!((touched.price && errors.price) || (touched.unitType && errors.unitType))}>
                {errors.price || errors.unitType}
              </HelperText>

              {/* --- Quantity (Conditional based on Unit Type) --- */}
              {values.unitType === 'unit' && (
                <>
                  <TextInput
                    label="Quantity*"
                    mode="outlined"
                    value={values.quantity}
                    onChangeText={handleChange('quantity')}
                    onBlur={handleBlur('quantity')}
                    error={touched.quantity && !!errors.quantity}
                    style={styles.input}
                    keyboardType="numeric"
                  />
                  <HelperText type="error" visible={touched.quantity && !!errors.quantity}>
                    {errors.quantity}
                  </HelperText>
                </>
              )}

              {/* --- Size/Measurement (Conditional based on Unit Type) --- */}
              {values.unitType === 'size' && (
                <>
                  <TextInput
                    label="Size/Weight Description*"
                    placeholder='e.g., 1 lb, 500g bunch, dozen' 
                    mode="outlined"
                    value={values.sizeMeasurement}
                    onChangeText={handleChange('sizeMeasurement')}
                    onBlur={handleBlur('sizeMeasurement')}
                    error={touched.sizeMeasurement && !!errors.sizeMeasurement}
                    style={styles.input}
                  />
                  <HelperText type="error" visible={touched.sizeMeasurement && !!errors.sizeMeasurement}>
                    {errors.sizeMeasurement}
                  </HelperText>
                </>
              )}

              {/* --- Description --- */}
              <TextInput
                label="Description*"
                mode="outlined"
                value={values.description}
                onChangeText={handleChange('description')}
                onBlur={handleBlur('description')}
                error={touched.description && !!errors.description}
                style={styles.input}
                multiline
                numberOfLines={4}
              />
               <HelperText type="error" visible={touched.description && !!errors.description}>
                {errors.description}
              </HelperText>

              {/* --- Origin Menu (using TextInput + Menu) --- */}
              <View>
                <Menu
                  visible={originMenuVisible}
                  onDismiss={closeOriginMenu}
                  anchor={
                    // Wrap TextInput in TouchableRipple to trigger menu
                    <TouchableRipple onPress={openOriginMenu} style={styles.input}>
                       {/* Display selected value, non-editable */}
                      <TextInput
                        label="Origin*"
                        mode="outlined"
                        value={values.origin} // Directly use Formik value
                        editable={false} // Prevent manual typing
                        error={touched.origin && !!errors.origin}
                        // Add dropdown arrow icon
                        right={<TextInput.Icon icon="menu-down" onPress={openOriginMenu} />}
                        // Need pointerEvents none so TouchableRipple is pressed
                        pointerEvents="none" 
                        style={styles.input} // Inherit standard input style
                      />
                    </TouchableRipple>
                  }
                  style={styles.menuStyle} // Optional: Style the menu itself
                >
                  {/* Map options to Menu items */} 
                  {originOptions.map((option) => (
                    <Menu.Item
                      key={option.value}
                      onPress={() => {
                        setFieldValue('origin', option.value); // Update Formik directly
                        closeOriginMenu(); // Close menu on selection
                      }}
                      title={option.label}
                    />
                  ))}
                </Menu>
                {/* Display validation error from Formik */} 
                 <HelperText type="error" visible={touched.origin && !!errors.origin}>
                  {errors.origin}
                </HelperText>
              </View>

              {/* --- Image Picker --- */}
              <View style={styles.imagePreviewContainer}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                ) : (
                  <View style={[styles.imagePreview, { justifyContent: 'center', alignItems: 'center' }]}>
                      <Text style={{color: theme.colors.onSurfaceVariant}}>No Image Selected</Text>
                  </View>
                )}
                <Button 
                  icon="camera" 
                  mode="contained" 
                  onPress={() => showImagePickerOptions(setFieldValue)} 
                  style={{ marginTop: 10 }}
                >
                  {image ? 'Change Image' : 'Select Image'}
                </Button>
                {/* Note: Validation for image might be complex here if allowing pre-existing images */} 
              </View>

              {/* --- Expiry Date Picker --- */}
              <Button 
                icon="calendar" 
                mode="outlined" 
                onPress={() => setShowDatePicker(true)} 
                style={styles.input}
              >
                Expiry Date: {date.toLocaleDateString()}
              </Button>
              {/* Display error for expiryDate */} 
              <HelperText type="error" visible={touched.expiryDate && !!errors.expiryDate}>
                {errors.expiryDate}
              </HelperText>
               {showDatePicker && (
                  <DateTimePicker
                      testID="dateTimePicker"
                      value={date} // Use state variable for picker value
                      mode="date"
                      is24Hour={true}
                      display="default"
                      onChange={handleDateChange}
                      // Add minimumDate to prevent past dates
                      minimumDate={new Date()} 
                  />
              )}
              {/* iOS requires a manual dismiss button */}
               {Platform.OS === 'ios' && showDatePicker && (
                  <Button onPress={hideDatePicker} mode="text">Done</Button>
              )}

              {/* --- Certifications MultiSelect --- */}
              <Text style={styles.certificationSectionTitle}>Certifications (Optional)</Text>
              {/* Ensure CustomMultiSelect is imported and props are correct */}
              <CustomMultiSelect
                  label="Certifications" 
                  options={certificationOptions.map(opt => ({ label: opt.label, value: opt.value }))} 
                  selectedValues={Array.from(selectedCertifications)} 
                  onSelectionChange={(newValues: string[]) => { 
                      setSelectedCertifications(new Set(newValues));
                      // Formik update (optional)
                      // setFieldValue('certifications', newValues);
                  }}
                  placeholder="Select certifications" 
              />

              {/* --- Location --- */}
              <View style={styles.locationContainer}>
                <View style={styles.locationSwitchContainer}>
                  <Text style={styles.locationText}>Share My Location</Text>
                  {/* Corrected Switch onValueChange */}
                  <Switch 
                    value={values.shareLocation} 
                    // Wrap setFieldValue in a plain function block
                    onValueChange={(newValue: boolean) => { 
                      setFieldValue('shareLocation', newValue); 
                    }}
                    color={theme.colors.primary}
                  />
                </View>
                {values.shareLocation && (
                  <View>
                    {location ? (
                      <Text style={styles.locationCoords}>
                        Lat: {location.latitude.toFixed(4)}, Lon: {location.longitude.toFixed(4)}
                      </Text>
                    ) : (
                      <Text style={styles.locationCoords}>Location not yet set.</Text>
                    )}
                    <Button 
                      icon="map-marker" 
                      mode="outlined" 
                      onPress={handleGetCurrentLocation} 
                      loading={isFetchingLocation}
                      disabled={isFetchingLocation}
                      style={{ marginBottom: 5 }}
                    >
                      {isFetchingLocation ? 'Fetching...' : (location ? 'Update Location' : 'Get Current Location')}
                    </Button>
                    {locationPermissionStatus !== 'granted' && (
                      <HelperText type="info">
                        Location permission needed to fetch automatically.
                      </HelperText>
                    )}
                  </View>
                )}
              </View>

               {/* --- Contact Method Radio Buttons --- */}
              <View style={styles.radioGroupContainer}>
                <Text style={styles.certificationSectionTitle}>Preferred Contact*</Text>
                <RadioButton.Group 
                  onValueChange={newValue => setFieldValue('contactMethod', newValue)} 
                  value={values.contactMethod}
                >
                  {contactMethodOptions.map(option => (
                     <View key={option.value} style={styles.radioRow}>
                       <RadioButton value={option.value} color={theme.colors.primary} />
                       <Text onPress={() => setFieldValue('contactMethod', option.value)}>{option.label}</Text>
                     </View>
                  ))}
                </RadioButton.Group>
                <HelperText type="error" visible={touched.contactMethod && !!errors.contactMethod}>
                  {errors.contactMethod}
                </HelperText>
              </View>

              {/* --- Submit Button --- */}
              <Button 
                mode="contained" 
                onPress={() => handleSubmit()} // Use Formik's handleSubmit
                style={styles.submitButton}
                disabled={isSubmitting} // Disable during submit
                loading={isSubmitting}
              >
                Update Listing
              </Button>
            </View>
          );
        }}
      </Formik>
    </ScrollView>
  );
};

export default EditListingScreen;
