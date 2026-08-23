import React, { useState, createContext, useEffect } from 'react';
import { StatusBar, TouchableOpacity, Text, StyleSheet, View, Animated, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import MarketScreen from './src/screens/MarketScreen';
import AiStudioScreen from './src/screens/AiStudioScreen';
import EarnScreen from './src/screens/EarnScreen';
import ProfileScreen from './src/screens/ProfileScreen';

export const LangContext = createContext();
const Tab = createBottomTabNavigator();

function SplashScreen({ onFinish }) {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 2200);
  }, []);

  return (
    <View style={styles.splashContainer}>
      <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
        <View style={styles.splashLogoBox}>
          <Ionicons name="briefcase" size={60} color="#4630EB" />
        </View>
        <Text style={styles.splashTitle}>Jobs Hub India</Text>
        <Text style={styles.splashTagline}>Empowering Bharat's Youth</Text>
      </Animated.View>
    </View>
  );
}

export default function App() {
  const [lang, setLang] = useState('EN');
  const [isSplashDone, setIsSplashDone] = useState(false);

  const toggleLang = () => {
    setLang(prev => (prev === 'EN' ? 'HI' : 'EN'));
  };

  if (!isSplashDone) {
    return <SplashScreen onFinish={() => setIsSplashDone(true)} />;
  }

  return (
    <LangContext.Provider value={{ lang, toggleLang }}>
      <StatusBar barStyle="light-content" backgroundColor="#4630EB" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: '#4630EB',
            tabBarInactiveTintColor: '#94A3B8',
            tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E2E8F0', height: 60, paddingBottom: 8 },
            tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
            tabBarIcon: ({ color, size }) => {
              let iconName;
              if (route.name === 'Market') iconName = 'briefcase';
              else if (route.name === 'AI Studio') iconName = 'sparkles';
              else if (route.name === 'Earn') iconName = 'wallet';
              else if (route.name === 'Profile') iconName = 'person';
              return <Ionicons name={iconName} size={size} color={color} />;
            }
          })}
        >
          <Tab.Screen
            name="Market"
            component={MarketScreen}
            options={{ title: lang === 'EN' ? 'Jobs & Training' : 'जॉब्स और ट्रेनिंग', tabBarLabel: lang === 'EN' ? 'Market' : 'मार्केट' }}
          />
          <Tab.Screen 
            name="AI Studio"
            component={AiStudioScreen}
            options={{ title: lang === 'EN' ? 'AI Career Studio' : 'एआई करियर स्टूडियो', tabBarLabel: lang === 'EN' ? 'AI Studio' : 'एआई स्टूडियो' }}
          />
          <Tab.Screen
            name="Earn"
            component={EarnScreen}
            options={{ title: lang === 'EN' ? 'Financial Services' : 'वित्तीय सेवाएं', tabBarLabel: lang === 'EN' ? 'Earn' : 'कमाएं' }}
          />
          <Tab.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ title: lang === 'EN' ? 'My Profile' : 'मेरी प्रोफाइल', tabBarLabel: lang === 'EN' ? 'Profile' : 'प्रोफाइल' }} 
          />
        </Tab.Navigator>
      </NavigationContainer>
    </LangContext.Provider>
  );
}

const styles = StyleSheet.create({
  splashContainer: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  splashLogoBox: { width: 100, height: 100, borderRadius: 25, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  splashTitle: { fontSize: 28, fontWeight: '900', color: '#0F172A' },
  splashTagline: { fontSize: 14, color: '#4630EB', fontWeight: '700', marginTop: 8 },
  langBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4630EB', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, marginRight: 16 },
  langBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 11, marginLeft: 4 }
});