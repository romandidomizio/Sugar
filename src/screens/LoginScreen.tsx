import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { PaperInput } from '../components/paper';
import { PaperButton } from '../components/paper';
import { PaperModal } from '../components/paper';
import { useAppContext } from '../contexts/AppContext';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  BottomTab: undefined;
};

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

const LoginScreen: React.FC = () => {
  const theme = useTheme();
  type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, state, clearError } = useAppContext();
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (values: { username: string; password: string }) => {
    const success = await login(values.username, values.password);
    if (success) {
      if (rememberMe) {
        await AsyncStorage.setItem('username', values.username);
        await AsyncStorage.setItem('password', values.password);
      } else {
        await AsyncStorage.removeItem('username');
        await AsyncStorage.removeItem('password');
      }
      navigation.navigate('BottomTab');
    } else {
      setErrorModalVisible(true);
    }
  };

  const handleErrorModalDismiss = () => {
    setErrorModalVisible(false);
    clearError();
  };

  const CustomCheckbox = ({ status, onPress }: { status: boolean; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: theme.colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: status ? theme.colors.primary : 'transparent',
        }}
      >
        {status && <Text style={{ color: theme.colors.surface }}>✓</Text>}
      </View>
    </TouchableOpacity>
  );

  const loadCredentials = async (setFieldValue: (field: string, value: any) => void) => {
    try {
      const savedUsername = await AsyncStorage.getItem('username');
      const savedPassword = await AsyncStorage.getItem('password');
      if (savedUsername && savedPassword) {
        setFieldValue('username', savedUsername);
        setFieldValue('password', savedPassword);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Failed to load credentials:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      keyboardVerticalOffset={20}
      enabled
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={false}
      >
        <Image
          source={require('../../assets/sugar_logo.gif')}
          style={styles.logo}
          resizeMode="contain"
        />

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
            touched,
            setFieldValue,
          }) => {
            useEffect(() => {
              const loadCredentials = async () => {
                try {
                  const savedUsername = await AsyncStorage.getItem('username');
                  const savedPassword = await AsyncStorage.getItem('password');
                  if (savedUsername && savedPassword) {
                    setFieldValue('username', savedUsername);
                    setFieldValue('password', savedPassword);
                    setRememberMe(true);
                  }
                } catch (error) {
                  console.error('Failed to load credentials:', error);
                }
              };
              loadCredentials();
            }, [setFieldValue]);

            return (
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

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <CustomCheckbox
                    status={rememberMe}
                    onPress={() => setRememberMe(!rememberMe)}
                  />
                  <Text style={{ color: theme.colors.primary, marginLeft: 10 }}>Remember Me</Text>
                </View>

                <PaperButton
                  variant="primary"
                  onPress={() => handleSubmit()}
                  style={styles.loginButton}
                  width="full"
                >
                  Login
                </PaperButton>

                <PaperButton
                  variant="tertiary"
                  onPress={() => navigation.navigate('Register')}
                  style={styles.createAccountButton}
                  width="full"
                >
                  Create an Account
                </PaperButton>
              </View>
            );
          }}
        </Formik>

        <PaperModal
          visible={errorModalVisible}
          onDismiss={handleErrorModalDismiss}
          title="Login Error"
          content={state.auth.error || 'Authentication failed'}
          confirmText="Try Again"
          onConfirm={handleErrorModalDismiss}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: { 
    width: 200,       
    height: 200,      
    alignSelf: 'center', 
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
