import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import SplashScreen from './src/screens/SplashScreen';
import EnhancedDashboardScreen from './src/screens/EnhancedDashboardScreen';
import BayDetailScreen from './src/screens/BayDetailScreen';
import FacilityDetailScreen from './src/screens/FacilityDetailScreen';
import PriceManagementScreen from './src/screens/PriceManagementScreen';
import OrderConfirmationScreen from './src/screens/OrderConfirmationScreen';
import LoginScreen from './src/screens/LoginScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <SplashScreen onComplete={() => setShowSplash(false)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator 
            screenOptions={{ headerShown: false }}
            initialRouteName="Login"
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Dashboard" component={EnhancedDashboardScreen} />
            <Stack.Screen name="BayDetail" component={BayDetailScreen} />
            <Stack.Screen name="FacilityDetail" component={FacilityDetailScreen} />
            <Stack.Screen name="PriceManagement" component={PriceManagementScreen} />
            <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
};


export default App;