import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
};

const API_URL = process.env.API_URL || 'http://localhost:3000/api/users';

const LoginScreen = ({ navigation }: { navigation: NativeStackScreenProps<RootStackParamList, 'Login'>['navigation'] }) => {
  const loginValidationSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required'),
  });

  const handleLogin = async (values: { username: string; password: string }) => {
    try {
      const response = await axios.post(`${API_URL}/login`, values);
      console.log('Login successful:', response.data);
      navigation.navigate('Home');
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      Alert.alert('Login failed', 'Please check your credentials.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Formik
        initialValues={{ username: '', password: '' }}
        validationSchema={loginValidationSchema}
        onSubmit={handleLogin}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Username"
              onChangeText={handleChange('username')}
              onBlur={handleBlur('username')}
              value={values.username}
            />
            {errors.username && touched.username && <Text style={styles.error}>{errors.username}</Text>}
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
            />
            {errors.password && touched.password && <Text style={styles.error}>{errors.password}</Text>}
            <Button title="Login" onPress={handleSubmit as any} color="#2E8B57" />
          </View>
        )}
      </Formik>
      <Button title="Go to Register" onPress={() => navigation.navigate('Register')} color="#006400" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F0FFF0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2E8B57',
  },
  input: {
    borderWidth: 1,
    borderColor: '#8FBC8F',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#FFF',
  },
  error: {
    fontSize: 12,
    color: 'red',
    marginBottom: 10,
  },
});

export default LoginScreen;
