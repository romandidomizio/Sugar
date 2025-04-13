import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Appbar, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Original screens
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

// New cart-related screens
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderConfirmationScreen from '../screens/OrderConfirmationScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';

// Theme and contexts
import { SugarTheme } from '../theme/SugarTheme';
import { useAuth } from '../contexts/AppContext';
import { useCart } from '../contexts/CartContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const CustomNavigationBar = ({ navigation, back, route }) => {
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

const MainBottomTabNavigator = () => {
  const { items } = useCart ? useCart() : { items: [] };
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
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
          } else if (route.name === 'Cart') {
            iconName = 'cart';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          }
          return <Appbar.Action icon={iconName} color={color} size={size} />;
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerTitle: 'Home' }} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ headerTitle: 'Community' }} />
      <Tab.Screen name="Post" component={PostScreen} options={{ headerTitle: 'Post' }} />
      <Tab.Screen name="My Listings" component={MyListingsScreen} options={{ headerTitle: 'My Listings' }} />
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ headerTitle: 'Messages' }} />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          headerTitle: 'Cart',
          tabBarBadge: cartItemCount > 0 ? cartItemCount : undefined,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerTitle: 'Profile' }} />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  const { user, isLoading } = useAuth ? useAuth() : { user: null, isLoading: false };
  const [initialScreen, setInitialScreen] = useState('Loading');

  // Handle the initial loading flow as in the original navigation
  useEffect(() => {
    // Show loading screen for 3 seconds then navigate to ComponentPlayground
    const timer = setTimeout(() => {
      setInitialScreen('ComponentPlayground');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <NavigationContainer theme={SugarTheme}>
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
            return null; // No header for certain screens
          },
        })}
        initialRouteName={initialScreen}
      >
        {/* Initial and Auth Screens - Always Available */}
        <Stack.Screen
          name="Loading"
          component={LoadingScreen}
        />
        <Stack.Screen
          name="ComponentPlayground"
          component={ComponentPlaygroundScreen}
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

        {/* Main App Screens */}
        <Stack.Screen
          name="BottomTab"
          component={MainBottomTabNavigator}
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
        {/* New cart-related screens */}
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
        <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator;

// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { Appbar, useTheme } from 'react-native-paper';
//
// import LoadingScreen from '../screens/LoadingScreen';
// import WelcomeScreen from '../screens/WelcomeScreen';
// import LoginScreen from '../screens/LoginScreen';
// import RegisterScreen from '../screens/RegisterScreen';
// import HomeScreen from '../screens/HomeScreen';
// import CartScreen from '../screens/CartScreen';
// import NotifsScreen from '../screens/NotifsScreen';
// import ProfileScreen from '../screens/ProfileScreen';
// import ComponentPlaygroundScreen from '../screens/ComponentPlaygroundScreen';
// import CommunityScreen from '../screens/CommunityScreen';
// import PostScreen from '../screens/PostScreen';
// import MessagesScreen from '../screens/MessagesScreen';
// import MyListingsScreen from '../screens/MyListingsScreen';
// import { SugarTheme } from '../theme/SugarTheme';
//
// const Stack = createStackNavigator();
// const Tab = createBottomTabNavigator();
//
// const CustomNavigationBar = ({ navigation, back, route }: any) => {
//   const theme = useTheme();
//   const routeName = route?.name || 'Sugar';
//
//   return (
//     <Appbar.Header
//       mode="small"
//       style={{
//         backgroundColor: theme.colors.primary
//       }}
//     >
//       {back ? (
//         <Appbar.BackAction
//           onPress={() => navigation.goBack()}
//           iconColor={theme.colors.surface}
//         />
//       ) : null}
//       <Appbar.Content
//         title={routeName === 'BottomTab' ? 'Sugar Logo' : routeName}
//         titleStyle={{ color: theme.colors.surface }}
//       />
//       <Appbar.Action icon="cart" onPress={() => navigation.navigate('Cart')} />
//       <Appbar.Action icon="bell" onPress={() => navigation.navigate('Notifs')} />
//       <Appbar.Action icon="account" onPress={() => navigation.navigate('Profile')} />
//     </Appbar.Header>
//   );
// };
//
// const MainNavigator = () => {
//   return (
//     <NavigationContainer theme={SugarTheme}>
//       <Stack.Navigator
//         screenOptions={({ navigation, route }) => ({
//           header: (props) => {
//             if (route.name === 'BottomTab') {
//               return (
//                 <CustomNavigationBar
//                   {...props}
//                   navigation={navigation}
//                   route={route}
//                 />
//               );
//             }
//             return null; // No header for ComponentPlayground, Login, Register
//           },
//         })}
//         initialRouteName="ComponentPlayground"
//       >
//         <Stack.Screen
//           name="ComponentPlayground"
//           component={ComponentPlaygroundScreen}
//         />
//         <Stack.Screen
//           name="Loading"
//           component={LoadingScreen}
//         />
//         <Stack.Screen
//           name="Welcome"
//           component={WelcomeScreen}
//         />
//         <Stack.Screen
//           name="Login"
//           component={LoginScreen}
//         />
//         <Stack.Screen
//           name="Register"
//           component={RegisterScreen}
//         />
//         <Stack.Screen
//           name="BottomTab"
//           component={MainBottomTabNavigator}
//         />
//         <Stack.Screen
//           name="Cart"
//           component={CartScreen}
//           options={({ navigation, route }) => ({
//             header: (props) => (
//               <CustomNavigationBar
//                 {...props}
//                 navigation={navigation}
//                 route={route}
//               />
//             ),
//           })}
//         />
//         <Stack.Screen
//           name="Notifs"
//           component={NotifsScreen}
//           options={({ navigation, route }) => ({
//             header: (props) => (
//               <CustomNavigationBar
//                 {...props}
//                 navigation={navigation}
//                 route={route}
//               />
//             ),
//           })}
//         />
//         <Stack.Screen
//           name="Profile"
//           component={ProfileScreen}
//           options={({ navigation, route }) => ({
//             header: (props) => (
//               <CustomNavigationBar
//                 {...props}
//                 navigation={navigation}
//                 route={route}
//               />
//             ),
//           })}
//         />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// };
//
// const MainBottomTabNavigator = () => {
//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         tabBarIcon: ({ color, size }) => {
//           let iconName;
//           if (route.name === 'Home') {
//             iconName = 'home';
//           } else if (route.name === 'Community') {
//             iconName = 'account-group';
//           } else if (route.name === 'My Listings') {
//             iconName = 'clipboard-list';
//           } else if (route.name === 'Post') {
//             iconName = 'plus-circle';
//           } else if (route.name === 'Messages') {
//             iconName = 'message';
//           }
//           return <Appbar.Action icon={iconName} color={color} size={size} />;
//         },
//         headerShown: false,
//       })}
//     >
//       <Tab.Screen name="Home" component={HomeScreen} options={{ headerTitle: 'Home' }} />
//       <Tab.Screen name="Community" component={CommunityScreen} options={{ headerTitle: 'Community' }} />
//       <Tab.Screen name="Post" component={PostScreen} options={{ headerTitle: 'Post' }} />
//       <Tab.Screen name="My Listings" component={MyListingsScreen} options={{ headerTitle: 'My Listings' }} />
//       <Tab.Screen name="Messages" component={MessagesScreen} options={{ headerTitle: 'Messages' }} />
//     </Tab.Navigator>
//   );
// };
//
// export default MainNavigator;
