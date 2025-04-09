import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
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
  Register: undefined;
  Home: undefined;
  Register: undefined;
};

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

const LoginScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { login, state, clearError } = useAppContext();
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  const handleLogin = async (values: { username: string; password: string }) => {
    const success = await login(values.username, values.password);
    
    if (success) {
      navigation.navigate('BottomTab');
    } else {
      setErrorModalVisible(true);
    }
  };

  const handleErrorModalDismiss = () => {
    setErrorModalVisible(false);
    clearError();
  };

  return (
    <View 
      style={[
        styles.container, 
        { backgroundColor: theme.colors.background }
      ]}
    >
      <View style={styles.content}>
        <Text 
          variant="headlineLarge" 
          style={[
            styles.title, 
            { color: theme.colors.primary }
          ]}
        >
          Sugar
        </Text>

        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
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

              <PaperButton
                mode="contained"
                onPress={handleSubmit}
                style={styles.loginButton}
                width="full"
              >
                Login
              </PaperButton>

              <PaperButton
                mode="text"
                onPress={() => navigation.navigate('Register')}
                style={styles.createAccountButton}
                width="full"
              >
                Create an Account
              </PaperButton>
            </View>
          )}
        </Formik>

        <PaperModal
          visible={errorModalVisible}
          onDismiss={handleErrorModalDismiss}
          title="Login Error"
          content={state.auth.error || 'Authentication failed'}
          confirmText="Try Again"
          onConfirm={handleErrorModalDismiss}
        />
      </View>
    </View>
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
  loginButton: {
    marginTop: 10,
    alignSelf: 'center',
  },
  createAccountButton: {
    marginTop: 10,
    alignSelf: 'center',
  },
});

export default LoginScreen;
