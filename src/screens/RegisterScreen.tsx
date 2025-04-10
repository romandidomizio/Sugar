import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { PaperInput } from '../components/paper';
import { PaperButton } from '../components/paper';
import { PaperModal } from '../components/paper';
import { useAppContext } from '../contexts/AppContext';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Register: undefined;
};

const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .required('Username is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
});

const RegisterScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { register, state, clearError } = useAppContext();
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  const handleRegister = async (values: { 
    username: string; 
    password: string; 
    name: string; 
    email: string; 
    phone: string 
  }) => {
    const success = await register(
      values.username, 
      values.password, 
      values.name, 
      values.email, 
      values.phone
    );
    
    if (success) {
      navigation.navigate('Home');
    } else {
      setErrorModalVisible(true);
    }
  };

  const handleErrorModalDismiss = () => {
    setErrorModalVisible(false);
    clearError();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text 
          variant="headlineLarge" 
          style={[
            styles.title, 
            { color: theme.colors.primary }
          ]}
        >
          Register
        </Text>

        <Formik
          initialValues={{ 
            username: '', 
            password: '', 
            name: '', 
            email: '', 
            phone: '' 
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleRegister}
        >
          {({ 
            handleChange, 
            handleBlur, 
            handleSubmit, 
            values, 
            errors, 
            touched 
          }) => (
            <View style={styles.formContainer}>
              <PaperInput
                label="Username"
                value={values.username}
                onChangeText={handleChange('username')}
                onBlur={handleBlur('username')}
                error={touched.username ? errors.username : undefined}
                autoCapitalize="none"
              />

              <PaperInput
                label="Password"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                error={touched.password ? errors.password : undefined}
                secureTextEntry
              />

              <PaperInput
                label="Name"
                value={values.name}
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                error={touched.name ? errors.name : undefined}
              />

              <PaperInput
                label="Email"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email ? errors.email : undefined}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <PaperInput
                label="Phone"
                value={values.phone}
                onChangeText={handleChange('phone')}
                onBlur={handleBlur('phone')}
                error={touched.phone ? errors.phone : undefined}
                keyboardType="phone-pad"
              />

              <PaperButton
                mode="contained"
                onPress={handleSubmit}
                style={styles.registerButton}
                width="full"
              >
                Create Account
              </PaperButton>

              <PaperButton
                  variant="tertiary"
                  onPress={() => navigation.navigate('Login')}
                  width='full'
                  style={styles.registerButton}
              >
                Login
              </PaperButton>

            </View>
          )}
        </Formik>

        <PaperModal
          visible={errorModalVisible}
          onDismiss={handleErrorModalDismiss}
          title="Registration Error"
          content={state.auth.error || 'Registration failed'}
          confirmText="Try Again"
          onConfirm={handleErrorModalDismiss}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
  },
  registerButton: {
    marginTop: 10,
    alignSelf: 'center',
    width: '100%',
  },
});

export default RegisterScreen;
