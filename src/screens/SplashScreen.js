import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';


const SplashScreen = ({ onComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-navigate after animation
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete, fadeAnim, scaleAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#ffffff', '#ffffff']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Image 
              source={require('../../assets/images/quvo_logo.png')} 
              style={styles.quvoLogo}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>Materials Management Platform</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.footer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.loadingContainer}>
              <View style={styles.loadingDots}>
                {[0, 1, 2].map((index) => (
                  <LoadingDot key={index} index={index} />
                ))}
              </View>
            </View>
          </Animated.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const LoadingDot = ({ index }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = () => {
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => animation());
    };

    const timeout = setTimeout(animation, index * 200);
    return () => clearTimeout(timeout);
  }, [animValue, index]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          opacity: animValue,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 100,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  quvoLogo: {
    width: 210,
    height: 120,
    marginBottom: 25,
  },
  tagline: {
    fontSize: 18,
    color: '#2C3E50',
    fontWeight: '300',
    marginTop: 20,
    letterSpacing: 1,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '300',
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 4,
  },
});

export default SplashScreen;