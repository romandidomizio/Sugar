import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, ScrollView, Image, Platform, Alert, StyleSheet, Dimensions } from 'react-native';
import { TextInput, Button, Text, HelperText, useTheme, ActivityIndicator, Switch, Modal, RadioButton, MD3Theme } from 'react-native-paper';
import { Formik, FormikProps, FormikErrors } from 'formik';
import * as Yup from 'yup';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Dropdown } from 'react-native-paper-dropdown';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import axios from 'axios';

// --- Project Imports ---
import { useAppContext } from '../contexts/AppContext';
import axiosInstance from '../utils/axiosInstance';
import { RootStackParamList } from '../navigation/MainNavigator';
import CustomMultiSelect from '../components/CustomMultiSelect';
import CustomCheckbox from '../components/CustomCheckbox';

// --- AI: Define constants locally like in PostScreen ---
const originOptions = [
  { label: 'Local Farm', value: 'local_farm' },
  { label: 'Imported', value: 'imported' },
  { label: 'Homegrown', value: 'homegrown' },
  { label: 'Grocery Store', value: 'grocery_store' }, 
  { label: 'Garden', value: 'garden' },            
  { label: 'Co-op', value: 'coop' },              
];

const certificationOptions = [
  { label: 'Organic', value: 'Organic' },
  { label: 'Non-GMO', value: 'Non-GMO' },
  { label: 'Fair Trade', value: 'Fair Trade' },
  { label: 'Gluten-Free', value: 'Gluten-Free' },
  { label: 'Vegan', value: 'Vegan' },
  { label: 'Kosher', value: 'Kosher' },
  { label: 'Halal', value: 'Halal' },
  { label: 'Allergen-Free', value: 'Allergen-Free' },
];

// --- Types ---
type EditListingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditListing'>;
type EditListingScreenRouteProp = RouteProp<RootStackParamList, 'EditListing'>;

interface FormValues {
  title: string;
  producer: string;
  description: string;
  price: number; // AI: Changed type to number
  origin: string;
  certifications: string[];
  expiryDate: string | null; 
  unitType: 'unit' | 'size' | ''; 
  quantity: string; 
  sizeMeasurement: string;
  imageUri: string | null; 
  contactMethod: string; 
  shareLocation: boolean;
  location: { latitude: number; longitude: number } | null;
}

// --- AI: Copied validation schema from PostScreen ---
const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').max(100, 'Title must be 100 characters or less'),
  producer: Yup.string().required('Producer/Brand is required').max(100, 'Producer must be 100 characters or less'),
  description: Yup.string().required('Description is required').max(500, 'Description must be 500 characters or less'),
  price: Yup.number()
    .typeError('Price must be a number') // Ensure the input is a number
    .required('Price is required')      
    .min(0, 'Price cannot be negative') // Allow 0, but not negative numbers
    .test(
      'maxDigits',
      'Price must have at most two decimal places',
      (value) => {
        if (value === undefined || value === null) return true; // Allow empty or null values initially
        // Convert number to string to check decimal places
        const valueStr = String(value);
        const decimalPart = valueStr.split('.')[1];
        return !decimalPart || decimalPart.length <= 2;
      }
    ),
  origin: Yup.string().required('Origin is required'),
  certifications: Yup.array().of(Yup.string()),
  expiryDate: Yup.date().nullable().min(new Date(), "Expiry date cannot be in the past"),
  unitType: Yup.string().required('You must select a pricing unit type').oneOf(['unit', 'size']),
  quantity: Yup.string().when('unitType', {
    is: 'unit',
    then: (schema) => schema
      .required('Quantity is required when pricing per unit')
      .matches(/^[1-9]\d*$/, 'Quantity must be a whole number greater than 0'),
    otherwise: (schema) => schema.notRequired(),
  }),
  sizeMeasurement: Yup.string().when('unitType', {
    is: 'size',
    then: (schema) => schema.required('Size/Measurement description is required when pricing by size/weight').max(50, 'Must be 50 characters or less'),
    otherwise: (schema) => schema.notRequired(),
  }),
  imageUri: Yup.string().required('An image is required'),
  contactMethod: Yup.string().required('Contact method is required').oneOf(['Direct Message', 'Phone Call', 'Text', 'Email']),
  shareLocation: Yup.boolean(),
  location: Yup.object().nullable().when('shareLocation', {
      is: true,
      then: (schema) => schema.required('Location data is required when sharing location').shape({
          latitude: Yup.number().required(),
          longitude: Yup.number().required(),
      }),
      otherwise: (schema) => schema.notRequired(),
  }),
});

// --- AI: Copied createStyles from PostScreen --- 
const createStyles = (theme: MD3Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    padding: 16,
    paddingBottom: 60, 
  },
  formContainer: {
    // Use this if Formik is wrapped inside ScrollView
  },
  input: {
    marginBottom: 8,
    backgroundColor: theme.colors.background,
  },
  inputContainer: {
    marginBottom: 16,
    backgroundColor: theme.colors.background,
  },
  dropdownContainer: {
    marginBottom: 16, 
  },
  dropdown: {
    // Style for the dropdown menu itself if needed
  },
  radioGroupContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.outline, 
    borderRadius: theme.roundness,
    padding: 12,
  },
  radioGroupLabel: {
    marginBottom: 8,
    fontSize: 16,
    color: theme.colors.onSurfaceVariant, 
  },
  radioButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4, 
  },
  expiryDateButton: {
    marginBottom: 4, 
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
    // Style the spinner if needed, e.g., width
    width: '100%', 
  },
  datePickerDoneButton: {
    marginTop: 15,
    alignSelf: 'center', 
  },
  selectImageButton: {
    marginBottom: 4, 
  },
  imagePreview: {
    width: '100%',
    height: 200,
    marginTop: 10,
    marginBottom: 16,
    resizeMode: 'cover', 
    borderRadius: 10, 
  },
  customCheckboxGroupContainer: {
    marginBottom: 16,
    padding: 12,
  },
  customCheckboxGroupLabel: {
    marginBottom: 8,
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
  },
  switchRowContainer: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10, 
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    marginRight: 8, 
    color: theme.colors.onSurface, 
  },
  activityIndicator: {
    marginLeft: 8, 
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 8, 
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  formErrorText: {
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
    fontSize: 14,
  },
  priceContextHelper: {
    marginTop: -4, 
    marginBottom: 8,
    fontSize: theme.fonts.bodySmall.fontSize,
    color: theme.colors.onSurfaceVariant,
  },
});

// --- Component ---
const EditListingScreen: React.FC = () => {
  const navigation = useNavigation<EditListingScreenNavigationProp>();
  const route = useRoute<EditListingScreenRouteProp>();
  const { listingId } = route.params;
  const { state } = useAppContext();
  const { user } = state.auth;
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const formikRef = useRef<FormikProps<FormValues>>(null);

  // --- AI: State variables aligned with PostScreen ---
  const [initialFormValues, setInitialFormValues] = useState<FormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<Location.PermissionStatus | null>(null);

  // --- Fetch Listing Data ---
  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true);
      setFormError(null); // Clear previous errors
      try {
        // AI: Correct the API endpoint URL
        const apiUrl = `/api/listings/${listingId}`; 
        console.log(`[EditListingScreen] Fetching listing data from: ${apiUrl}`); 
        const response = await axiosInstance.get(apiUrl); 
        const listingData = response.data;

        // AI: Log the received data
        console.log('[EditListingScreen] Received listing data:', listingData);

        const transformedData: FormValues = {
          title: listingData.title || '',
          producer: listingData.producer || '',
          description: listingData.description || '',
          price: listingData.price != null ? Number(listingData.price) : 0, // Convert price to number
          origin: listingData.origin || '',
          certifications: listingData.certifications || [],
          expiryDate: listingData.expiryDate ? new Date(listingData.expiryDate).toISOString() : null,
          unitType: listingData.unitType || '',
          quantity: listingData.quantity != null ? String(listingData.quantity) : '',
          sizeMeasurement: listingData.sizeMeasurement || '',
          imageUri: listingData.imageUri ? listingData.imageUri : null,
          contactMethod: listingData.contactMethod || '',
          shareLocation: !!listingData.location,
          location: listingData.location ? { latitude: listingData.location.coordinates[1], longitude: listingData.location.coordinates[0] } : null,
        };

        setInitialFormValues(transformedData);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error fetching listing:', error);
        const message = error.response?.data?.message || error.message || 'Failed to load listing data.';
        setFormError(message);
        Alert.alert('Error Loading Data', message);
        setIsLoading(false);
      }
    };
    fetchListing();
  }, [listingId]);

  // AI: Show options for picking image or taking photo
  const showImagePickerOptions = (setFieldValue: FormikProps<FormValues>['setFieldValue']) => {
    Alert.alert(
      "Select Image Source",
      "Choose an option",
      [
        { text: "Camera Roll", onPress: () => pickImage(setFieldValue) },
        { text: "Take Photo", onPress: () => takePhoto(setFieldValue) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  // --- Date Picker Logic (Copied from PostScreen) ---
  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined,
  ) => {
    const currentDate = selectedDate || (formikRef.current?.values.expiryDate ? new Date(formikRef.current.values.expiryDate) : new Date());
    if (Platform.OS === 'android') {
      setIsDatePickerVisible(false);
    }
    if (event.type === 'set' && currentDate) {
      formikRef.current?.setFieldValue('expiryDate', currentDate.toISOString());
    }
  };

  // --- AI: Image Picker Logic (Copied from PostScreen) ---
  const pickImage = async (setFieldValue: FormikProps<FormValues>['setFieldValue']) => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8, 
      });

      if (!result.canceled) {
        setFieldValue('imageUri', result.assets[0].uri);
      }
    } catch (error) {
      console.error("ImagePicker Error: ", error);
      Alert.alert('Error', 'Could not open camera roll.');
    }
  };

  const takePhoto = async (setFieldValue: FormikProps<FormValues>['setFieldValue']) => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Camera access is needed to take photos.");
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFieldValue('imageUri', result.assets[0].uri);
      }
    } catch (error) {
      console.error("Camera Error: ", error);
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  // --- AI: Location Handling Logic (Copied from PostScreen) ---
  const handleLocationToggle = async (
    newValue: boolean,
    setFieldValue: FormikProps<FormValues>['setFieldValue']
  ) => {
    setFieldValue('shareLocation', newValue);
    if (newValue) {
      setIsFetchingLocation(true);
      try {
        let currentStatus = locationPermissionStatus;
        if (!currentStatus) {
           const { status } = await Location.getForegroundPermissionsAsync();
           setLocationPermissionStatus(status);
           currentStatus = status;
        }

        if (currentStatus !== Location.PermissionStatus.GRANTED) {
            console.log('Requesting location permission...');
            const { status } = await Location.requestForegroundPermissionsAsync();
            setLocationPermissionStatus(status);
            currentStatus = status;
        }

        if (currentStatus === Location.PermissionStatus.GRANTED) {
          console.log('Location permission granted. Fetching location...');
          let locationResult = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced, 
          });
          console.log('Location fetched:', locationResult);
          const locationData = {
            latitude: locationResult.coords.latitude,
            longitude: locationResult.coords.longitude,
          };
          setFieldValue('location', locationData);
        } else {
          console.log('Location permission denied.');
          Alert.alert('Permission Denied', 'Cannot get location without permission.');
          setFieldValue('shareLocation', false); 
        }
      } catch (error) {
        console.error("Error fetching location: ", error);
        Alert.alert('Location Error', 'Could not fetch current location. Ensure location services are enabled.');
        setFieldValue('shareLocation', false); 
      } finally {
        setIsFetchingLocation(false);
      }
    } else {
      setFieldValue('location', null);
      console.log('Location sharing disabled.');
    }
  };

  // --- Form Submission ---
  const onSubmit = async (values: FormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    setFormError(null); 
    if (!user) {
      setFormError('Authentication error. Please log in again.');
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    let imageChanged = false;

    Object.keys(values).forEach(key => {
      if (key === 'imageUri') return;

      const formKey = key as keyof FormValues;
      let valueToAppend = values[formKey];

      if (formKey === 'location' && valueToAppend) {
          valueToAppend = JSON.stringify(valueToAppend);
      }

      if (formKey === 'certifications' && Array.isArray(valueToAppend)) {
          if (valueToAppend.length > 0) {
              valueToAppend.forEach(cert => formData.append('certifications[]', cert));
          }
      } else if (valueToAppend !== null && valueToAppend !== undefined) {
          formData.append(formKey, valueToAppend as any); 
      }
    });

    if (values.imageUri && values.imageUri !== initialFormValues?.imageUri) {
      imageChanged = true;
      const uriParts = values.imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const fileName = `photo.${fileType}`;

      formData.append('image', {
        uri: values.imageUri,
        name: fileName,
        type: `image/${fileType}`,
      } as any); 
    }

    console.log("Submitting FormData:", formData); 
 
    try {
      // AI: Corrected API endpoint URL
      const response = await axiosInstance.put(`/api/listings/${listingId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        console.log('Listing updated successfully:', response.data);
        Alert.alert('Success', 'Listing updated successfully!');
        navigation.goBack(); 
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error: any) {
      console.error('Error updating listing:', error);
      let errorMessage = 'An unknown error occurred while updating the listing.';
      if (axios.isAxiosError(error)) { 
        console.error('Error response data:', error.response?.data);
        console.error('Error response status:', error.response?.status);
        errorMessage = error.response?.data?.message || `Server error: ${error.response?.status}`;
      } else if (error.request) {
        console.error('Error request:', error.request);
        errorMessage = 'No response from server. Check your network connection.';
      } else {
        console.error('Error message:', error.message);
        errorMessage = error.message;
      }
      setFormError(errorMessage);
      Alert.alert('Update Failed', errorMessage); 
    } finally {
      setSubmitting(false);
    }
  };

  // --- Render Loading/Error State ---
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10, color: theme.colors.onBackground }}>Loading Listing Data...</Text>
      </View>
    );
  }

  if (!initialFormValues) {
    return (
      <View style={styles.container}>
        <Text style={{ color: theme.colors.error, textAlign: 'center' }}>Failed to load listing data.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView} keyboardShouldPersistTaps="handled">
        <Formik
          initialValues={initialFormValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
          enableReinitialize
          innerRef={formikRef}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue, isSubmitting, setFieldTouched }) => (
            <View style={styles.formContainer}>
              <TextInput
                label="Title*"
                value={values.title}
                onChangeText={handleChange('title')}
                onBlur={() => setFieldTouched('title')}
                error={touched.title && !!errors.title}
                mode="outlined"
                style={styles.input}
                theme={theme}
              />
              <HelperText type="error" visible={touched.title && !!errors.title}>
                {errors.title}
              </HelperText>

              <TextInput
                label="Producer/Brand*"
                value={values.producer}
                onChangeText={handleChange('producer')}
                onBlur={() => setFieldTouched('producer')}
                error={touched.producer && !!errors.producer}
                mode="outlined"
                style={styles.input}
                theme={theme}
              />
              <HelperText type="error" visible={touched.producer && !!errors.producer}>
                {errors.producer}
              </HelperText>

              <TextInput
                label="Description*"
                value={values.description}
                onChangeText={handleChange('description')}
                onBlur={() => setFieldTouched('description')}
                error={touched.description && !!errors.description}
                mode="outlined"
                style={styles.input}
                theme={theme}
                multiline
                numberOfLines={3}
              />
              <HelperText type="error" visible={touched.description && !!errors.description}>
                {errors.description}
              </HelperText>

              <View style={styles.inputContainer}>
                <TextInput
                  label="Price*"
                  value={String(values.price)} // Convert price to string for TextInput
                  onChangeText={(text) => handleChange('price')(text.replace(/[^0-9.]/g, ''))} // Allow only numbers and decimal point
                  onBlur={handleBlur('price')}
                  error={submitCount > 0 && touched.price && !!errors.price}
                  style={styles.input}
                  theme={theme}
                  keyboardType="numeric"
                  left={<TextInput.Affix text="$" />}
                  mode="outlined"
                />
                <HelperText type="error" visible={submitCount > 0 && touched.price && !!errors.price}>
                  {errors.price}
                </HelperText>
              </View>

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
                  onPress={() => {
                    setFieldValue('unitType', 'unit');
                    setFieldValue('sizeMeasurement', '');
                  }}
                />
                <CustomCheckbox
                  label="Per Size/Weight"
                  status={values.unitType === 'size'}
                  onPress={() => {
                    setFieldValue('unitType', 'size');
                    setFieldValue('quantity', '');
                  }}
                />
                <HelperText type="error" visible={submitCount > 0 && Boolean(touched.unitType && errors.unitType)}>
                  {errors.unitType}
                </HelperText>
              </View>

              {/* Conditional Quantity Input */}
              {values.unitType === 'unit' && (
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Quantity Available*"
                    keyboardType="numeric"
                    onChangeText={handleChange('quantity')}
                    onBlur={handleBlur('quantity')}
                    value={values.quantity?.toString() ?? ''}
                    error={submitCount > 0 && Boolean(touched.quantity && errors.quantity)}
                    style={styles.input} 
                    theme={theme}
                    mode="outlined"
                    placeholder="e.g., 50"
                  />
                  <HelperText type="error" visible={submitCount > 0 && Boolean(touched.quantity && errors.quantity)}>
                    {errors.quantity}
                  </HelperText>
                </View>
              )}

              {/* Conditional Size Measurement Input */}
              {values.unitType === 'size' && (
                <View style={styles.inputContainer}>
                  <TextInput
                    mode="outlined"
                    label="Size/Weight Description*"
                    value={values.sizeMeasurement}
                    onChangeText={handleChange('sizeMeasurement')}
                    onBlur={handleBlur('sizeMeasurement')}
                    error={submitCount > 0 && touched.sizeMeasurement && !!errors.sizeMeasurement}
                    style={styles.input} 
                    theme={theme}
                    placeholder="e.g., 1 lb bag, 16 oz jar"
                  />
                  <HelperText type="error" visible={submitCount > 0 && touched.sizeMeasurement && !!errors.sizeMeasurement}>
                    {errors.sizeMeasurement}
                  </HelperText>
                </View>
              )}

              <View style={styles.dropdownContainer}>
                <Dropdown
                  label="Origin*"
                  mode="outlined"
                  value={values.origin}
                  onSelect={(value: string | undefined) => { 
                    setFieldValue('origin', value ?? ''); 
                  }}
                  options={originOptions} // AI: Use 'options' prop instead
                />
                <HelperText type="error" visible={touched.origin && !!errors.origin}>
                  {errors.origin}
                </HelperText>
              </View>

              <View style={styles.inputContainer}>
                <CustomMultiSelect
                  label="Certifications"
                  options={certificationOptions}
                  selectedValues={values.certifications}
                  onSelectionChange={(newValues: string[]) => setFieldValue('certifications', newValues)}
                  placeholder="Select certifications (optional)"
                />
              </View>

              <View style={styles.inputContainer}>
                <Button
                  mode="outlined"
                  onPress={() => setIsDatePickerVisible(true)}
                  icon="calendar"
                  style={styles.expiryDateButton}
                >
                  {values.expiryDate ? `Expires: ${new Date(values.expiryDate).toLocaleDateString()}` : 'Select Expiry Date (Optional)'}
                </Button>
                <HelperText type="error" visible={touched.expiryDate && !!errors.expiryDate}>
                  {errors.expiryDate}
                </HelperText>
              </View>

              {isDatePickerVisible && (
                <View style={styles.datePickerInlineContainer}>
                  <DateTimePicker
                    value={values.expiryDate ? new Date(values.expiryDate) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    style={styles.datePickerSpinner}
                  />
                  <Button
                    mode="contained"
                    onPress={() => setIsDatePickerVisible(false)}
                    style={styles.datePickerDoneButton}
                  >
                    Done
                  </Button>
                </View>
              )}

              <Button
                mode="outlined"
                onPress={() => showImagePickerOptions(setFieldValue)}
                style={styles.selectImageButton}
                icon="camera"
              >
                Select Image*
              </Button>
              {values.imageUri ? (
                <Image source={{ uri: values.imageUri }} style={styles.imagePreview} />
              ) : (
                <HelperText type="info">No image selected.</HelperText>
              )}
              <HelperText type="error" visible={touched.imageUri && !!errors.imageUri}>
                {errors.imageUri}
              </HelperText>

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
                <HelperText type="error" visible={touched.contactMethod && !!errors.contactMethod}>
                  {errors.contactMethod}
                </HelperText>
              </View>

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

              {formError && (
                <HelperText type="error" style={styles.formErrorText}>
                  {formError}
                </HelperText>
              )}
              <Button
                mode="contained"
                onPress={() => { 
                    setSubmitCount((prev: number) => prev + 1); 
                    handleSubmit(); 
                }} 
                style={styles.submitButton}
                disabled={isSubmitting} 
                loading={isSubmitting}
              >
                Update Listing
              </Button>
            </View>
          )}
        </Formik>
      </ScrollView>
    </View>
  );
};

export default EditListingScreen;
