import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';

// Import logos to ensure they're bundled
const mariettaLogo = require('../../assets/images/marietta.png');
const cemexLogo = require('../../assets/images/cemex.png');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      let companyData = null;

      // Determine company based on email
      if (email.toLowerCase() === 'demo@martinmarietta.com') {
        companyData = {
          company: 'martinmarietta',
          companyName: 'Martin Marietta',
          user: {
            name: 'Demo User',
            email: email,
            company: 'Martin Marietta'
          }
        };
      } else if (email.toLowerCase() === 'demo@cemex.com') {
        companyData = {
          company: 'cemex',
          companyName: 'CEMEX',
          user: {
            name: 'Demo User',
            email: email,
            company: 'CEMEX'
          }
        };
      } else {
        setLoading(false);
        Alert.alert('Login Failed', 'Invalid credentials. Please use demo@martinmarietta.com or demo@cemex.com');
        return;
      }

      setLoading(false);
      
      // Navigate to dashboard with company data
      navigation.replace('Dashboard', { companyData });
    }, 1500);
  };

  const fillDemoCredentials = (type) => {
    if (type === 'marietta') {
      setEmail('demo@martinmarietta.com');
      setPassword('demo123');
    } else if (type === 'cemex') {
      setEmail('demo@cemex.com');
      setPassword('demo123');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image 
              source={require('../../assets/images/quvo_logo.png')}
              style={styles.quvoLogo}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>Materials Management Platform</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to access your dashboard</Text>

            <View style={styles.inputContainer}>
              <Icon name="envelope" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#999"
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Icon name={showPassword ? "eye" : "eye-slash"} size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Demo Buttons */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>Demo Accounts:</Text>
              
              <TouchableOpacity 
                style={styles.demoButton}
                onPress={() => fillDemoCredentials('marietta')}
              >
                <Image 
                  source={mariettaLogo}
                  style={styles.demoLogo}
                  resizeMode="contain"
                />
                <Text style={styles.demoButtonText}>Martin Marietta Demo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.demoButton}
                onPress={() => fillDemoCredentials('cemex')}
              >
                <Image 
                  source={cemexLogo}
                  style={styles.demoLogo}
                  resizeMode="contain"
                />
                <Text style={styles.demoButtonText}>CEMEX Demo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  quvoLogo: {
    width: 160,
    height: 48,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    backgroundColor: '#5bbc9d',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  demoSection: {
    marginTop: 40,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  demoLogo: {
    width: 60,
    height: 20,
    marginRight: 12,
  },
  demoButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
});

export default LoginScreen;