import React from 'react';
import { NavigationContainer, NavigatorScreenParams, DefaultTheme, Theme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Appbar, useTheme } from 'react-native-paper';

import LoadingScreen from '../screens/LoadingScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import NotifsScreen from '../screens/NotifsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ComponentPlaygroundScreen from '../screens/ComponentPlaygroundScreen';
import CommunityScreen from '../screens/CommunityScreen';
import PostScreen from '../screens/PostScreen';
import MessagesScreen from '../screens/MessagesScreen';
import MyListingsScreen from '../screens/MyListingsScreen';
import EditListingScreen from '../screens/EditListingScreen';
import { SugarTheme } from '../theme/SugarTheme';

// --- Define Param List Types --- //

// Type for screens within the Bottom Tab Navigator
export type BottomTabParamList = {
  Home: undefined; // No params expected
  Community: undefined;
  Post: { listingId?: string }; // Add optional listingId for editing
  'My Listings': undefined;
  Messages: undefined;
};

// Type for screens within the main Stack Navigator
export type RootStackParamList = {
  ComponentPlayground: undefined;
  Loading: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  // Use NavigatorScreenParams to type the nested BottomTab navigator
  // Allows navigating to 'BottomTab' and specifying a screen inside it like { screen: 'Home' }
  BottomTab: NavigatorScreenParams<BottomTabParamList>; 
  Cart: undefined;
  Notifs: undefined;
  Profile: undefined;
  EditListing: { listingId: string }; 
};

// --- Create Navigators with Types --- //
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

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
        title={routeName === 'BottomTab' ? 'Sugar Logo' : routeName}
        titleStyle={{ color: theme.colors.surface }}
      />
      <Appbar.Action icon="cart" onPress={() => navigation.navigate('Cart')} />
      <Appbar.Action icon="bell" onPress={() => navigation.navigate('Notifs')} />
      <Appbar.Action icon="account" onPress={() => navigation.navigate('Profile')} />
    </Appbar.Header>
  );
};

const MainNavigator = () => {
  return (
    <NavigationContainer theme={SugarTheme as unknown as Theme}>
      <Stack.Navigator
        screenOptions={({ navigation, route }) => ({
          header: (props) => {
            if (route.name === 'BottomTab') {
              return (
                <CustomNavigationBar
                  {...props}
                  navigation={navigation}
                  route={route}
                />
              );
            }
            return null; // No header for ComponentPlayground, Login, Register
          },
        })}
        initialRouteName="ComponentPlayground"
      >
        <Stack.Screen
          name="ComponentPlayground"
          component={ComponentPlaygroundScreen}
        />
        <Stack.Screen
          name="Loading"
          component={LoadingScreen}
        />
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
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
          name="BottomTab"
          component={MainBottomTabNavigator}
          // Header is handled by the screenOptions on the Navigator
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={({ navigation, route }) => ({
            header: (props) => (
              <CustomNavigationBar
                {...props}
                navigation={navigation}
                route={route}
              />
            ),
          })}
        />
        <Stack.Screen
          name="Notifs"
          component={NotifsScreen}
          options={({ navigation, route }) => ({
            header: (props) => (
              <CustomNavigationBar
                {...props}
                navigation={navigation}
                route={route}
              />
            ),
          })}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={({ navigation, route }) => ({
            header: (props) => (
              <CustomNavigationBar
                {...props}
                navigation={navigation}
                route={route}
              />
            ),
          })}
        />
        <Stack.Screen
          name="EditListing" 
          component={EditListingScreen}
          options={({ navigation, route }) => ({
            header: (props) => (
              <CustomNavigationBar
                {...props}
                navigation={navigation}
                route={route}
              />
            ),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const MainBottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string = 'help-circle'; // Default fallback icon
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Community') {
            iconName = 'account-group';
          } else if (route.name === 'My Listings') {
            iconName = 'clipboard-list';
          } else if (route.name === 'Post') {
            iconName = 'plus-circle';
          } else if (route.name === 'Messages') {
            iconName = 'message';
          }
          // iconName is guaranteed to be a string here
          return <Appbar.Action icon={iconName} color={color} size={size} />;
        },
        headerShown: false,
      })}
    >
      {/* Define screens within the BottomTab navigator */}
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerTitle: 'Home' }} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ headerTitle: 'Community' }} />
      <Tab.Screen name="Post" component={PostScreen} options={{ headerTitle: 'Post' }} />
      <Tab.Screen name="My Listings" component={MyListingsScreen} options={{ headerTitle: 'My Listings' }} />
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ headerTitle: 'Messages' }} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
