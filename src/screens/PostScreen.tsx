import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import {
  TextInput,
  Button,
  useTheme,
  HelperText,
  Text,
  Modal,
  Checkbox,
  RadioButton,
  Switch,
  ActivityIndicator,
  MD3Theme,
} from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { API_BASE_URL } from '@env';
import { useAppContext } from '../contexts/AppContext';
import { useRoute, RouteProp, useNavigation, useFocusEffect, NavigationProp } from '@react-navigation/native';
import { RootStackParamList, BottomTabParamList } from '../navigation/MainNavigator';
import CustomMultiSelect from '../components/CustomMultiSelect';
import axiosInstance from '../utils/axiosInstance'; 
import axios from 'axios'; // Import the core axios object

interface FormValues {
  title: string;
  producer: string;
  price: string; // Changed from number | string to string
  description: string;
  imageUri: string;
  imageType: string; // Add field for MIME type
  imageName: string; // Add field for filename
  origin: string;
  certifications: string[];
  expiryDate: Date | null;
  unitType: 'unit' | 'size' | '';
  quantity: number | string;
  sizeMeasurement: string;
  contactMethod: 'Direct Message' | 'Phone Call' | 'Text' | 'Email' | '';
  shareLocation: boolean;
  location: { latitude: number; longitude: number } | null;
}

// type PostScreenRouteProp = RouteProp<RootStackParamList, 'Post'>;

const originOptions = [
  { label: 'Local Farm', value: 'local_farm' },
  { label: 'Imported', value: 'imported' },
  { label: 'Homegrown', value: 'homegrown' },
  { label: 'Grocery Store', value: 'grocery_store' },
  { label: 'Co-op', value: 'coop' },
];

const certificationsOptions = [
  { label: 'Organic', value: 'Organic' },
  { label: 'Non-GMO', value: 'Non-GMO' },
  { label: 'Fair Trade', value: 'Fair Trade' },
  { label: 'Gluten-Free', value: 'Gluten-Free' },
  { label: 'Vegan', value: 'Vegan' },
  { label: 'Kosher', value: 'Kosher' },
  { label: 'Halal', value: 'Halal' },
  { label: 'Allergen-Free', value: 'Allergen-Free' },
];

const createStyles = (theme: MD3Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    padding: 20,
    marginBottom: 20,
    paddingBottom: 100,
  },
  screenTitle: { // Apply headlineSmall style and primary color
    ...theme.fonts.headlineSmall, // Use headlineSmall font specs
    marginBottom: 20,
    textAlign: 'center',
    color: theme.colors.primary, // Use primary color (exists in theme)
  },
  input: {
    marginBottom: 10,
  },
  prefixTextStyle: {
    color: theme.colors.onSurfaceVariant,
  },
  dropdownContainer: {
    marginBottom: 4,
  },
  dropdownStyle: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.outline,
  },
  dropdownItemStyle: {
    justifyContent: 'flex-start',
  },
  dropdownLabelStyle: {
    color: theme.colors.onSurface,
  },
  expiryDateButton: {
    marginBottom: 4,
  },
  selectImageButton: {
    marginBottom: 4,
  },
  customCheckboxGroupContainer: {
    marginBottom: 4,
  },
  customCheckboxGroupLabel: {
    marginBottom: 8,
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
  },
  customCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
  },
  customCheckboxOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderColor: theme.colors.primary,
  },
  customCheckboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  customCheckboxLabel: {
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  conditionalInputContainer: {
    marginTop: -25,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    marginTop: 10,
    marginBottom: 16,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
  },
  formErrorText: {
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
    fontSize: 14,
  },
  datePickerInlineContainer: {
    alignItems: 'center',
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: theme.roundness,
  },
  datePickerSpinner: {
    width: '100%',
    marginBottom: 10,
  },
  datePickerDoneButton: {
    marginTop: 15,
    width: '80%',
  },
  priceContextHelper: {
    marginTop: -16,
    marginBottom: 8,
  },
  radioGroupContainer: {
    marginBottom: 4,
  },
  radioGroupLabel: {
    marginBottom: 8,
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
  },
  switchRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    color: theme.colors.onSurface,
    marginRight: 8,
  },
  activityIndicator: {
    marginLeft: 8,
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.onBackground,
  },
});

const ListingSchema = Yup.object().shape({
  title: Yup.string().required('Title is required.'),
  producer: Yup.string().required('Producer is required.'),
  price: Yup.string()
    .required('Price is required')
    .matches(/^\$?(\d+(\.\d{2})?)$/, 'Price must be in $0.00 format (e.g., $10.50 or 5.00)')
    .test('is-valid-number', 'Price must be a valid number', value => {
      // Remove optional '$' before checking if it's a number
      const numericValue = value?.startsWith('$') ? value.substring(1) : value;
      return !isNaN(parseFloat(numericValue)) && isFinite(parseFloat(numericValue));
    }),
  description: Yup.string().required('Description is required.'),
  imageUri: Yup.string().required('An image is required.'),
  origin: Yup.string().required('Origin is required.'),
  certifications: Yup.array().of(Yup.string()).ensure(),
  unitType: Yup.string().oneOf(['unit', 'size'], 'Please select a unit type.').required('Unit type selection is required.'),
  quantity: Yup.string()
    .when('unitType', {
      is: 'unit',
      then: schema => schema
        .required('Quantity is required when pricing per unit.')
        .matches(/^[0-9]+$/, 'Quantity must be a whole number')
        .test('positive', 'Quantity must be positive', (value) => parseInt(value || '0', 10) > 0),
      otherwise: schema => schema.nullable().strip(), // Remove if not unit type
    }),
  sizeMeasurement: Yup.string()
    .when('unitType', {
      is: 'size',
      then: schema => schema.required('Size/weight description is required when pricing by size.')
                            .trim()
                            .min(1, 'Size/weight description cannot be empty.'),
      otherwise: schema => schema.nullable().strip(), // Remove if not size type
    }),
  expiryDate: Yup.date().nullable().required('Expiry date is required.').min(new Date(), 'Expiry date cannot be in the past.'),
  contactMethod: Yup.string().required('Please select a preferred contact method'),
  shareLocation: Yup.boolean(),
  location: Yup.object()
    .shape({
      latitude: Yup.number().required(),
      longitude: Yup.number().required(),
    })
    .nullable(), // Allow location to be null if not shared
});

const PostScreen: React.FC = () => {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const { state } = useAppContext();
  const { token } = state.auth;

  const navigation = useNavigation<NavigationProp<BottomTabParamList>>();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitCount, setSubmitCount] = useState(0);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [initialFormValues, setInitialFormValues] = useState<FormValues | null>(null);

  const formikRef = useRef<any>(null);

  const defaultInitialValues: FormValues = {
    title: '',
    producer: '',
    price: '', // Initialize price as an empty string
    description: '',
    imageUri: '',
    imageType: '',
    imageName: '',
    origin: '',
    certifications: [],
    expiryDate: null,
    unitType: '',
    quantity: '',
    sizeMeasurement: '',
    contactMethod: '',
    shareLocation: false,
    location: null,
  };

  const handleDateChange = useCallback((event: DateTimePickerEvent, selectedDate?: Date | undefined, setFieldValue?: (field: string, value: any, shouldValidate?: boolean) => void) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (event.type === 'set' && selectedDate && setFieldValue) {
      setFieldValue('expiryDate', selectedDate);
    }
  }, []);

  const handleTakePhoto = useCallback(async (setFieldValue: Function) => {
    // Request camera permissions
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // Reduce quality slightly for faster uploads
    });

    // Handle result
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setFieldValue('imageUri', asset.uri);
      setFieldValue('imageType', asset.mimeType || 'image/jpeg'); // Default type if needed
      setFieldValue('imageName', asset.fileName || `photo_${Date.now()}.jpg`); // Default name if needed
    } else if (result.canceled) {
      console.log('Camera cancelled');
    }
  }, []);

  const handleChooseFromLibrary = useCallback(async (setFieldValue: Function) => {
    // Request library permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Media library permission is needed to choose photos.');
      return;
    }

    // Launch image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only allow images
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // Reduce quality slightly
    });

    // Handle result
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setFieldValue('imageUri', asset.uri);
      setFieldValue('imageType', asset.mimeType || 'image/jpeg'); // Default type if needed
      setFieldValue('imageName', asset.fileName || `library_${Date.now()}.jpg`); // Default name if needed
    } else if (result.canceled) {
      console.log('Library selection cancelled');
    }
  }, []);

  const showImagePickerOptions = useCallback((setFieldValue: Function) => {
    Alert.alert(
      'Select Image Source',
      'Choose where to get the image from:',
      [
        {
          text: 'Take Photo',
          onPress: () => handleTakePhoto(setFieldValue),
        },
        {
          text: 'Choose from Library',
          onPress: () => handleChooseFromLibrary(setFieldValue),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  }, []);

  const handleLocationToggle = async (
    newValue: boolean,
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void
  ) => {
    console.log(`Location toggle changed to: ${newValue}`);
    setFieldValue('shareLocation', newValue);

    if (newValue) {
      setIsFetchingLocation(true);
      let success = false;

      try {
        let currentStatus = locationPermissionStatus;

        if (currentStatus !== Location.PermissionStatus.GRANTED) {
          try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            setLocationPermissionStatus(status);
            currentStatus = status;
          } catch (permError) {
            console.error('Error requesting location permissions:', permError);
            Alert.alert('Error', 'Could not request location permissions. Please try again.');
            currentStatus = Location.PermissionStatus.DENIED;
          }
        }

        if (currentStatus === Location.PermissionStatus.GRANTED) {
          try {
            const locationData = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = locationData.coords;
            setFieldValue('location', { latitude, longitude });
            Alert.alert('Location Shared', 'Your current location will be added to the listing.');
            success = true;
          } catch (error) {
            console.error('Error fetching location:', error);
            Alert.alert('Error', 'Could not fetch location. Please try again.');
            setFieldValue('location', null);
          }
        } else {
          console.log('Location permission denied.');
          Alert.alert(
            'Permission Denied',
            'Location permission is needed to share your listing location. Please enable it in your device settings if you wish to use this feature.',
          );
          setFieldValue('location', null);
        }
      } catch(e) {
        console.error('Unexpected error during location handling:', e);
        Alert.alert('Error', 'An unexpected error occurred while handling location sharing.');
      } finally {
        setIsFetchingLocation(false);

        if (!success) {
          console.log('Reverting shareLocation to false due to failure.');
          setFieldValue('shareLocation', false);
          setFieldValue('location', null);
        }
      }
    } else {
      setFieldValue('location', null);
    }
  };

  const onSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    setFormError(''); // Clear previous errors
    setSubmitting(true);

    // --- Get token from Context State --- 
    const token = state.auth?.token; // Get token from AppContext state
    if (!token) {
      Alert.alert('Error', 'Authentication token not found. Please log in again.');
      setSubmitting(false);
      return;
    }

    // --- Contact Info Logic --- 
    const userEmail = state.auth?.user?.email;
    const userPhone = state.auth?.user?.phone;

    let contactInfoToSend = '';
    switch (values.contactMethod) {
      case 'Email':
        if (!userEmail) {
          Alert.alert('Error', 'Your email is missing. Cannot select Email contact method.');
          setSubmitting(false);
          return;
        }
        contactInfoToSend = userEmail;
        break;
      case 'Phone Call':
      case 'Text':
        if (!userPhone) {
          Alert.alert('Error', 'Your phone number is missing. Cannot select Phone or Text contact method.');
          setSubmitting(false);
          return;
        }
        contactInfoToSend = userPhone;
        break;
      case 'Direct Message':
        contactInfoToSend = userEmail || 'direct_message_fallback';
        break;
      default:
        Alert.alert('Error', 'Invalid contact method selected.');
        setSubmitting(false);
        return;
    }

    if (!contactInfoToSend && values.contactMethod !== 'Direct Message') {
      Alert.alert('Error', 'Could not determine contact information.');
      setSubmitting(false);
      return;
    }

    const apiUrl = `${API_BASE_URL}/api/user/listings`;
    const apiMethod = 'post';

    console.log(`[PostScreen] Sending ${apiMethod.toUpperCase()} request to ${apiUrl}`);

    const formData = new FormData();

    // Append the image file if it exists
    if (values.imageUri) {
      // Determine the file type and name
      const uriParts = values.imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const fileName = values.imageUri.split('/').pop();
      
      formData.append('image', {
        uri: values.imageUri,
        name: fileName || `photo.${fileType}`, // Use original name or default
        type: `image/${fileType}`, // Adjust mime type if needed
      } as any); // Type assertion needed for FormData append with file object
    }

    // Prepare listing details (excluding the image URI itself)
    const listingData = { ...values };
    if ('imageUri' in listingData) { // Check if property exists before deleting
      delete (listingData as Partial<FormValues>).imageUri; // Safely delete optional property
    }

    // Append the stringified listing details
    formData.append('listingDetails', JSON.stringify(listingData));

    try {
      const response = await axiosInstance[apiMethod](apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`, // Pass token from context state
        }
      });

      console.log('Submission successful:', response.data);
      Alert.alert('Success', 'Listing posted successfully!');
      resetForm({ values: defaultInitialValues });
    } catch (error) {
      console.error('Error posting listing:', error);
      let errorMessage = 'An error occurred while posting the listing.';
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error Response Data:', error.response.data);
        console.error('Error Response Status:', error.response.status);
        const backendError = error.response.data?.error || error.response.data?.details || error.response.data;
        if (typeof backendError === 'string') {
          errorMessage = backendError;
        }
      } else if (error instanceof Error) { 
          errorMessage = error.message;
      }
      setFormError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const CustomCheckbox = ({ label, status, onPress }: { label: string; status: boolean; onPress: () => void }) => {
    return (
      <TouchableOpacity onPress={onPress} style={styles.customCheckboxContainer}>
        <View
          style={[
            styles.customCheckboxOuter,
            { borderColor: status ? theme.colors.primary : theme.colors.outline },
          ]}
        >
          {status && (
            <View
              style={[
                styles.customCheckboxInner,
                { backgroundColor: theme.colors.primary },
              ]}
            />
          )}
        </View>
        <Text style={styles.customCheckboxLabel}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.screenTitle}>Create New Listing</Text>
        <Formik
          innerRef={formikRef}
          initialValues={defaultInitialValues}
          validationSchema={ListingSchema}
          onSubmit={onSubmit}
          enableReinitialize={false}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isSubmitting,
            setFieldValue,
            isValid,
          }: FormikProps<FormValues>) => (
            <View>
              {/* Title Input */}
              <TextInput
                label="Title*"
                value={values.title}
                onChangeText={handleChange('title')}
                onBlur={handleBlur('title')}
                mode="outlined"
                style={styles.input}
                error={submitCount > 0 && Boolean(touched.title && errors.title)}
              />
              <HelperText type="error" visible={submitCount > 0 && Boolean(touched.title && errors.title)}>
                {errors.title}
              </HelperText>

              {/* Description Input */}
              <TextInput
                label="Description*"
                value={values.description}
                onChangeText={handleChange('description')}
                onBlur={handleBlur('description')}
                mode="outlined"
                style={styles.input}
                multiline
                numberOfLines={4}
                error={submitCount > 0 && Boolean(touched.description && errors.description)}
              />
              <HelperText type="error" visible={submitCount > 0 && Boolean(touched.description && errors.description)}>
                {errors.description}
              </HelperText>

              {/* Producer Input */}
              <TextInput
                label="Producer/Brand*"
                value={values.producer}
                onChangeText={handleChange('producer')}
                onBlur={handleBlur('producer')}
                mode="outlined"
                style={styles.input}
                error={submitCount > 0 && Boolean(touched.producer && errors.producer)}
              />
              <HelperText type="error" visible={submitCount > 0 && Boolean(touched.producer && errors.producer)}>
                {errors.producer}
              </HelperText>

              {/* Price Input */}
              <TextInput
                mode="outlined"
                label="Price*"
                value={values.price} // Now correctly typed as string
                onChangeText={handleChange('price')}
                onBlur={handleBlur('price')}
                keyboardType="decimal-pad" // Use decimal pad keyboard
                error={submitCount > 0 && touched.price && !!errors.price}
                style={styles.input}
                left={<TextInput.Affix text="$ " />} // Add fixed dollar sign prefix
              />
              <HelperText type="error" visible={submitCount > 0 && touched.price && !!errors.price}>
                {errors.price}
              </HelperText>

              {/* Helper text for price context */}
              <HelperText 
                type="info" 
                visible={!!values.unitType}
                style={styles.priceContextHelper}
              >
                {values.unitType === 'unit' 
                  ? 'Price is per individual unit.' 
                  : values.unitType === 'size' && values.sizeMeasurement
                    ? `Price is per ${values.sizeMeasurement}.`
                    : values.unitType === 'size' 
                      ? 'Price is per specified size/weight.'
                      : ''}
              </HelperText>

              {/* Unit Type Selection using CustomCheckbox */}
              <View style={styles.customCheckboxGroupContainer}>
                <Text style={styles.customCheckboxGroupLabel}>Price Method*:</Text>
                <CustomCheckbox
                  label="Per Unit"
                  status={values.unitType === 'unit'}
                  onPress={() => setFieldValue('unitType', 'unit')}
                />
                <CustomCheckbox
                  label="Per Size/Weight"
                  status={values.unitType === 'size'}
                  onPress={() => setFieldValue('unitType', 'size')}
                />
                <HelperText type="error" visible={submitCount > 0 && Boolean(touched.unitType && errors.unitType)}>
                  {errors.unitType}
                </HelperText>
              </View>

              {/* Conditional Quantity Input */}
              {values.unitType === 'unit' && (
                <View style={styles.conditionalInputContainer}>
                  <TextInput
                    label="Available Quantity*"
                    keyboardType="numeric"
                    onChangeText={handleChange('quantity')}
                    onBlur={handleBlur('quantity')}
                    value={values.quantity.toString()}
                    error={submitCount > 0 && Boolean(touched.quantity && errors.quantity)}
                    style={styles.input} 
                  />
                  <HelperText type="error" visible={submitCount > 0 && Boolean(touched.quantity && errors.quantity)}>
                    {errors.quantity}
                  </HelperText>
                </View>
              )}

              {/* Conditional Size Measurement Input */}
              {values.unitType === 'size' && (
                <View style={styles.conditionalInputContainer}>
                  <TextInput
                    mode="outlined"
                    label="Size Measurement (e.g., 16 oz, 5 lbs)*"
                    value={values.sizeMeasurement}
                    onChangeText={handleChange('sizeMeasurement')}
                    onBlur={handleBlur('sizeMeasurement')}
                    error={submitCount > 0 && touched.sizeMeasurement && !!errors.sizeMeasurement}
                    style={styles.input} 
                  />
                  <HelperText type="error" visible={submitCount > 0 && touched.sizeMeasurement && !!errors.sizeMeasurement}>
                    {errors.sizeMeasurement}
                  </HelperText>
                </View>
              )}

              {/* Origin Dropdown */}
              <View style={styles.dropdownContainer}>
                <Dropdown
                  label={"Origin*"}
                  mode={"outlined"}
                  value={values.origin}
                  options={originOptions}
                  onSelect={(value) => setFieldValue('origin', value)}
                  placeholder="Select Origin"
                />
              </View>
              <HelperText type="error" visible={submitCount > 0 && Boolean(touched.origin && errors.origin)}>
                {errors.origin}
              </HelperText>

              {/* Certifications Custom MultiSelect - Wrapped in View for margin control */}
              <View style={styles.dropdownContainer}>
                <CustomMultiSelect
                  label="Certifications"
                  options={certificationsOptions}
                  selectedValues={values.certifications as string[]} 
                  onSelectionChange={(selected) => setFieldValue('certifications', selected)} 
                  placeholder="Select Certifications"
                  error={submitCount > 0 && Boolean(touched.certifications && errors.certifications)} 
                  // style prop is handled by the wrapper View using styles.dropdownContainer
                />
                {/* Error for Certifications */}
                <HelperText type="error" visible={submitCount > 0 && Boolean(touched.certifications && errors.certifications)}>
                  {/* Ensure error message is accessible, even if array-based */}
                  {typeof errors.certifications === 'string' ? errors.certifications : 'Invalid selection'}
                </HelperText>
              </View>

              {/* Expiry Date Picker */}
              <Button
                icon="calendar"
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                style={styles.expiryDateButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                {values.expiryDate
                  ? `Expires: ${(values.expiryDate as Date).toLocaleDateString()}`
                  : 'Select Expiry Date*'}
              </Button>
              <HelperText type="error" visible={submitCount > 0 && Boolean(touched.expiryDate && errors.expiryDate)}>
                {errors.expiryDate}
              </HelperText>

              {showDatePicker && (
                <View style={styles.datePickerInlineContainer}>
                  <DateTimePicker
                    value={values.expiryDate || new Date()} 
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
                    onChange={(event, date) => handleDateChange(event, date, setFieldValue)}
                    minimumDate={new Date()} 
                    style={styles.datePickerSpinner}
                  />
                  <Button 
                    mode="contained"
                    onPress={() => setShowDatePicker(false)} 
                    style={styles.datePickerDoneButton}
                  >
                    Done
                  </Button>
                </View>
              )}

              {/* Image Picker */}
               <Button 
                 mode="outlined" 
                 onPress={() => showImagePickerOptions(setFieldValue)} 
                 style={styles.selectImageButton}
                 icon="camera"
               >
                 Select Image*
               </Button>
               {/* Display selected image preview */}
               {values.imageUri ? (
                 <Image source={{ uri: values.imageUri }} style={styles.imagePreview} />
               ) : (
                 <HelperText type="info">No image selected.</HelperText>
               )}
               <HelperText type="error" visible={submitCount > 0 && touched.imageUri && !!errors.imageUri}>
                 {errors.imageUri}
               </HelperText>

              {/* Contact Method Selection */}
              <View style={styles.customCheckboxGroupContainer}>
                <Text style={styles.customCheckboxGroupLabel}>The buyer should contact me via:*</Text>
                <CustomCheckbox
                  label="Direct Message"
                  status={values.contactMethod === 'Direct Message'}
                  onPress={() => setFieldValue('contactMethod', 'Direct Message')}
                />
                <CustomCheckbox
                  label="Phone Call"
                  status={values.contactMethod === 'Phone Call'}
                  onPress={() => setFieldValue('contactMethod', 'Phone Call')}
                />
                <CustomCheckbox
                  label="Text"
                  status={values.contactMethod === 'Text'}
                  onPress={() => setFieldValue('contactMethod', 'Text')}
                />
                <CustomCheckbox
                  label="Email"
                  status={values.contactMethod === 'Email'}
                  onPress={() => setFieldValue('contactMethod', 'Email')}
                />
                <HelperText type="error" visible={submitCount > 0 && Boolean(touched.contactMethod && errors.contactMethod)}>
                  {errors.contactMethod}
                </HelperText>
              </View>

              {/* Location Sharing Switch */}
              <View style={styles.switchRowContainer}>
                <View style={styles.switchLabelContainer}>
                  <Text style={styles.switchLabel}>Share Listing Location</Text>
                  {isFetchingLocation && (
                    <ActivityIndicator size="small" style={styles.activityIndicator} />
                  )}
                </View>
                <Switch
                  value={values.shareLocation}
                  onValueChange={(newValue) => handleLocationToggle(newValue, setFieldValue)}
                  color={theme.colors.primary} 
                  disabled={isFetchingLocation} 
                />
              </View>

              {/* General Form Error Message Area */}
              {formError && (
                <HelperText type="error" visible={Boolean(formError)} style={styles.formErrorText}>
                  {formError}
                </HelperText>
              )}

              {/* Submit Button */}
              <Button
                mode="contained"
                onPress={() => { 
                  setSubmitCount((prev: number) => prev + 1); 
                  handleSubmit(); 
                }}
                style={styles.submitButton}
                disabled={isSubmitting} // Disable during submit
                loading={isSubmitting}
              >
                Post Listing
              </Button>
            </View>
          )}
        </Formik>
      </ScrollView>
    </View>
  );
};

export default PostScreen;