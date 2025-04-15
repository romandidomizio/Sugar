// import React from 'react';
// import { NavigationContainer, NavigatorScreenParams, DefaultTheme, Theme } from '@react-navigation/native';
// import { createStackNavigator, StackScreenProps } from '@react-navigation/stack'; // Import StackScreenProps
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { Appbar, useTheme } from 'react-native-paper';

// --- Screen Imports ---
import React from 'react';
import { NavigationContainer, NavigatorScreenParams, DefaultTheme, Theme } from '@react-navigation/native';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack'; // Import StackScreenProps
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Appbar, useTheme } from 'react-native-paper';

// --- Screen Imports ---
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
import SelectRecipientScreen from '../screens/SelectRecipientScreen'; // <-- 1. Import SelectRecipientScreen
import MyListingsScreen from '../screens/MyListingsScreen';
import ChatScreen from '../screens/ChatScreen'; // <-- 1. Import ChatScreen
import EditListingScreen from '../screens/EditListingScreen';
import { SugarTheme } from '../theme/SugarTheme';
import { TouchableOpacity, Image } from 'react-native';


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
  Chat: { // <-- 2. Define params for ChatScreen
    recipientUsername: string;
    recipientId: string;
  };
  SelectRecipient: undefined;
  EditListing: { listingId: string }; 
};

// --- Define Type for Screens needing navigation/route props ---
// (Optional but good practice)
export type ChatScreenProps = StackScreenProps<RootStackParamList, 'Chat'>;
// Define others like ProfileScreenProps, CartScreenProps etc. if needed

// --- Create Navigators with Types --- //
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

// --- Custom Navigation Bar (Keep as is) ---
const CustomNavigationBar = ({ navigation, back, route }: any) => {
  const theme = useTheme();
  const routeName = route?.name || 'Sugar';

  // Determine the title based on the route name
  let title = routeName;
  if (routeName === 'BottomTab') {
      title = 'Sugar'; // Use 'Sugar' or your logo placeholder for the main tab view
  } else if (route.params && 'recipientUsername' in route.params) {
      // Special case for Chat screen title (if using this header)
      title = route.params.recipientUsername;
  }
  // Add more conditions if needed for other screens using this header


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
      <TouchableOpacity onPress={() => navigation.navigate('BottomTab', {screen: 'Home',})}>
        <Image
          source={require('../../assets/sugar.png')}
          style={{ width: 100, height: 42, resizeMode: 'contain'}}
        />
      </TouchableOpacity>
      <Appbar.Content title="" />
      <Appbar.Action icon="heart" onPress={() => navigation.navigate('Cart')} />
      <Appbar.Action icon="bell" onPress={() => navigation.navigate('Notifs')} />
      <Appbar.Action icon="account" onPress={() => navigation.navigate('Profile')} />
    </Appbar.Header>
  );
};


// --- Main Stack Navigator ---
const MainNavigator = () => {
  return (
    <NavigationContainer theme={SugarTheme as unknown as Theme}>
      <Stack.Navigator
        // --- Default screen options ---
        // screenOptions={({ navigation, route }) => ({
        //   header: (props) => {
        //     // Only show custom header for specific screens in the main stack
        //     if (['BottomTab', 'Cart', 'Notifs', 'Profile'].includes(route.name)) {
        //       return (
        //         <CustomNavigationBar
        //           {...props}
        //           navigation={navigation}
        //           route={route}
        //         />
        //       );
        //     }
        //     // Return null for screens that should have no header from the StackNavigator
        //     // (e.g., Login, Register, ChatScreen if it has its own header)
        //     return null;
        //   },
        // })}
        initialRouteName="ComponentPlayground" // Change to Loading or Welcome for production
      >
        {/* Screens without the main CustomNavigationBar by default */}
        <Stack.Screen
          name="ComponentPlayground"
          component={ComponentPlaygroundScreen}
          options={{ headerShown: false }} // Explicitly hide header
        />
        <Stack.Screen
          name="Loading"
          component={LoadingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />

         {/* Chat Screen - Added here */}
         <Stack.Screen
             name="Chat"
             component={ChatScreen}
             options={{ headerShown: false }} // <-- 4. Hide Stack header because ChatScreen has its own Appbar
         />

         {/* --- NEW: Select Recipient Screen --- */}
        <Stack.Screen
          name="SelectRecipient"
          component={SelectRecipientScreen}
          options={{ headerShown: false }} // SelectRecipientScreen has its own header
        />
        {/* --- END NEW --- */}

        {/* Screens that DO use the CustomNavigationBar */}
        <Stack.Screen
          name="BottomTab"
          component={MainBottomTabNavigator}
           options={({ navigation, route }) => ({ // Use function form for options
              header: (props) => (
                 <CustomNavigationBar {...props} navigation={navigation} route={route} />
               ),
           })}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={({ navigation, route }) => ({
            header: (props) => (
              <CustomNavigationBar {...props} navigation={navigation} route={route} />
            ),
          })}
        />
        <Stack.Screen
          name="Notifs"
          component={NotifsScreen}
          options={({ navigation, route }) => ({
            header: (props) => (
              <CustomNavigationBar {...props} navigation={navigation} route={route} />
            ),
          })}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={({ navigation, route }) => ({
            header: (props) => (
              <CustomNavigationBar {...props} navigation={navigation} route={route} />
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

// --- Bottom Tab Navigator (Keep as is) ---
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
        headerShown: false, // Tabs themselves don't show a header, Stack navigator handles it
         // tabBarActiveTintColor: SugarTheme.colors.primary, // Example customization
         // tabBarInactiveTintColor: 'gray',
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