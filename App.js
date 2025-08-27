import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import EnhancedDashboardScreen from './src/screens/EnhancedDashboardScreen';
import BayDetailScreen from './src/screens/BayDetailScreen';
import FacilityDetailScreen from './src/screens/FacilityDetailScreen';
import PriceManagementScreen from './src/screens/PriceManagementScreen';
import OrderConfirmationScreen from './src/screens/OrderConfirmationScreen';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Dashboard" component={EnhancedDashboardScreen} />
            <Stack.Screen name="BayDetail" component={BayDetailScreen} />
            <Stack.Screen name="FacilityDetail" component={FacilityDetailScreen} />
            <Stack.Screen name="PriceManagement" component={PriceManagementScreen} />
            <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});

export default App;