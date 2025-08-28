import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../context/AuthContext';


const LoginScreen = () => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('Allan.kane');
  const [password, setPassword] = useState('Allan1234!');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Auto-login on component mount
  useEffect(() => {
    handleAutoLogin();
  }, []);

  const handleAutoLogin = async () => {
    if (email && password) {
      await handleLogin();
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      setIsLoggingIn(true);
      await login({ email, password });
    } catch (error) {
      Alert.alert('Login Failed', 'Please check your credentials and try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f8f9fa', '#e9ecef', '#dee2e6']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.content}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.quvoLogoContainer}>
                <Image 
                  source={require('../../assets/images/quvo_logo.png')} 
                  style={styles.quvoLogo}
                  resizeMode="contain"
                />
              </View>
              
              {/* Martin Marietta Logo */}
              <View style={styles.martinMariettaContainer}>
                <Image 
                  source={require('../../assets/images/marietta.png')} 
                  style={styles.martinMariettaLogo}
                  resizeMode="contain"
                />
              </View>
              
              <Text style={styles.subtitle}>Sales Management Platform</Text>
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Enter your email"
                  placeholderTextColor="#6c757d"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Enter your password"
                  placeholderTextColor="#6c757d"
                />
              </View>

              <TouchableOpacity
                style={[styles.loginButton, (loading || isLoggingIn) && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading || isLoggingIn}
              >
                <LinearGradient
                  colors={['#5bbc9d', '#4a9d82']}
                  style={styles.loginButtonGradient}
                >
                  {(loading || isLoggingIn) ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.loginButtonText}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.forgotPasswordButton}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Monitor stockpile volumes and bay availability across all sites
              </Text>
              <Text style={styles.versionText}>Powered by Digital Tide • Version 1.0</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 60,
  },
  quvoLogoContainer: {
    marginBottom: 20,
  },
  quvoLogo: {
    width: 200,
    height: 110,
  },
  martinMariettaContainer: {
    marginBottom: 20,
  },
  martinMariettaLogo: {
    width: 180,
    height: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#495057',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  forgotPasswordButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#5bbc9d',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#adb5bd',
  },
});

export default LoginScreen;