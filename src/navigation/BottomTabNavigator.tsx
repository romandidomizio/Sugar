import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen'; // ← your marketplace screen

const Tab = createBottomTabNavigator();

const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>{name} Screen</Text>
  </View>
);

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = 'circle';

          switch (route.name) {
            case 'Community':
              iconName = 'account-group';
              break;
            case 'My Listings':
              iconName = 'format-list-bulleted';
              break;
            case 'Post':
              iconName = 'plus-box';
              break;
            case 'Messages':
              iconName = 'message-text';
              break;
            case 'Marketplace':
              iconName = 'storefront';
              break;
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Community">
        {() => <PlaceholderScreen name="Community" />}
      </Tab.Screen>
      <Tab.Screen name="My Listings">
        {() => <PlaceholderScreen name="My Listings" />}
      </Tab.Screen>
      <Tab.Screen name="Post">
        {() => <PlaceholderScreen name="Post" />}
      </Tab.Screen>
      <Tab.Screen name="Messages">
        {() => <PlaceholderScreen name="Messages" />}
      </Tab.Screen>

      {/* 🔥 Hook up your HomeScreen here */}
      <Tab.Screen
        name="Marketplace"
        component={HomeScreen}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;


