import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Appbar, useTheme } from 'react-native-paper';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import ComponentPlaygroundScreen from '../screens/ComponentPlaygroundScreen';
import CommunityScreen from '../screens/CommunityScreen'; // Import the CommunityScreen
import BottomTabNavigator from './BottomTabNavigator';

import { SugarTheme } from '../theme/SugarTheme';

const Stack = createStackNavigator();

const CustomNavigationBar = ({ navigation, back, route }: any) => {
  const theme = useTheme();
  const routeName = route?.name || 'Sugar';

  return (
    <Appbar.Header
      mode="small"
      style={{
        backgroundColor: theme.colors.primary
      }}
    >
      {back ? (
        <Appbar.BackAction
          onPress={() => navigation.goBack()}
          iconColor={theme.colors.surface}
        />
      ) : null}
      <Appbar.Content
        title={routeName}
        titleStyle={{ color: theme.colors.surface }}
      />
    </Appbar.Header>
  );
};

const MainNavigator = () => {
  return (
    <NavigationContainer theme={SugarTheme}>
      <Stack.Navigator
        screenOptions={({ navigation, route }) => ({
          header: (props) => (
            <CustomNavigationBar
              {...props}
              navigation={navigation}
              route={route}
            />
          ),
        })}
        initialRouteName="ComponentPlayground"
      >
        <Stack.Screen
          name="ComponentPlayground"
          component={ComponentPlaygroundScreen}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
        />
        <Stack.Screen
          name="Community"
          component={CommunityScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator;
