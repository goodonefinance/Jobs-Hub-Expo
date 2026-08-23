import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Linking, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LangContext } from '../../App';

export default function ProfileScreen() {
  const { lang, toggleLang } = useContext(LangContext);
  const [notifications, setNotifications] = useState(true);

  // User Auth State
  const [user, setUser] = useState(null); // null = logged out

  const handleGoogleSignIn = () => {
    // Standard User Simulation (Google Auth Flow)
    setUser({
      name: 'Aman Sharma',
      email: 'aman.sharma@example.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop'
    });
    Alert.alert(lang === 'EN' ? 'Success' : 'सफल', lang === 'EN' ? 'Signed in with Google successfully!' : 'गूगल से सफलतापूर्वक लॉगिन हो गया!');
  };

  const handleSignOut = () => {
    setUser(null);
    Alert.alert(lang === 'EN' ? 'Signed Out' : 'लॉगआउट', lang === 'EN' ? 'You have been logged out.' : 'आप लॉगआउट हो चुके हैं।');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* FLAT HEADER (Market Screen Style) */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{lang === 'EN' ? 'Account & Settings' : 'मेरी प्रोफाइल'}</Text>
            <Text style={styles.headerTagline}>{lang === 'EN' ? 'Manage your identity and app preferences' : 'अपनी सेटिंग्स और प्रोफाइल मैनेज करें'}</Text>
          </View>
          <TouchableOpacity style={styles.langBtn} onPress={toggleLang}>
            <Text style={styles.langBtnText}>{lang === 'EN' ? 'हिंदी' : 'EN'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 30 }}>
        {/* Auth Profile Card */}
        {user ? (
          <View style={styles.profileCard}>
            <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userSub}>{user.email}</Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
                <Text style={styles.verifiedText}>{lang === 'EN' ? 'Google Verified' : 'गूगल सत्यापित'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleSignOut} style={styles.logoutIconBtn}>
              <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.loginBannerCard}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person-circle-outline" size={44} color="#4630EB" />
            </View>
            <Text style={styles.loginTitle}>{lang === 'EN' ? 'Sign in to Jobs Hub' : 'जॉब्स हब में लॉगिन करें'}</Text>
            <Text style={styles.loginSub}>
              {lang === 'EN' ? 'Save favorite jobs, fast-apply & sync resumes' : 'पसंदीदा जॉब्स सेव करने व सीधे अप्लाई करने के लिए लॉगिन करें'}
            </Text>
            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignIn}>
              <Ionicons name="logo-google" size={18} color="#FFFFFF" />
              <Text style={styles.googleBtnText}>{lang === 'EN' ? 'Continue with Google' : 'गूगल से लॉगिन करें'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Stats Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>120+</Text>
            <Text style={styles.statLabel}>{lang === 'EN' ? 'Live Jobs' : 'लाइव नौकरियां'}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>25+</Text>
            <Text style={styles.statLabel}>{lang === 'EN' ? 'Programs' : 'प्रोग्राम्स'}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>{lang === 'EN' ? 'Career Tools' : 'करियर टूल्स'}</Text>
          </View>
        </View>

        {/* Preferences Section */}
        <Text style={styles.sectionHeading}>{lang === 'EN' ? 'Preferences' : 'प्राथमिकताएं'}</Text>

        <View style={styles.menuContainer}>
          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="language-outline" size={20} color="#4630EB" />
              </View>
              <Text style={styles.menuText}>{lang === 'EN' ? 'App Language (भाषा)' : 'ऐप की भाषा'}</Text>
            </View>
            <TouchableOpacity style={styles.langPill} onPress={toggleLang}>
              <Text style={styles.langPillText}>{lang === 'EN' ? 'हिंदी में बदलें' : 'Switch to English'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="notifications-outline" size={20} color="#4630EB" />
              </View>
              <Text style={styles.menuText}>{lang === 'EN' ? 'Daily Job Alerts' : 'डेली जॉब अलर्ट'}</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#CBD5E1', true: '#4630EB' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Support & Legal */}
        <Text style={styles.sectionHeading}>{lang === 'EN' ? 'Support & Info' : 'सहायता व जानकारी'}</Text>

        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL('https://google.com')}>
            <View style={styles.menuLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#4630EB" />
              </View>
              <Text style={styles.menuText}>{lang === 'EN' ? 'Privacy Policy' : 'गोपनीयता नीति (Privacy)'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL('https://google.com')}>
            <View style={styles.menuLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="information-circle-outline" size={20} color="#4630EB" />
              </View>
              <Text style={styles.menuText}>{lang === 'EN' ? 'About App' : 'ऐप के बारे में'}</Text>
            </View>
            <Text style={styles.versionText}>v1.0.0</Text>
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="lock-closed-outline" size={20} color="#4630EB" />
              </View>
              <View>
                <Text style={styles.menuText}>{lang === 'EN' ? 'Data Security' : 'डेटा सुरक्षा'}</Text>
                <Text style={styles.menuSubText}>{lang === 'EN' ? '256-bit encryption enabled' : '256-बिट एन्क्रिप्शन सक्रिय'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="eye-off-outline" size={20} color="#4630EB" />
              </View>
              <View>
                <Text style={styles.menuText}>{lang === 'EN' ? 'Privacy First' : 'प्राइवेसी'}</Text>
                <Text style={styles.menuSubText}>{lang === 'EN' ? 'On-device AI processing' : 'ऑन-डिवाइस एआई प्रोसेसिंग'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer Brand Note */}
        <View style={styles.footerBox}>
          <Text style={styles.footerText}>JOBS HUB INDIA</Text>
          <Text style={styles.footerSubText}>
            {lang === 'EN' ? 'Empowering Careers Across 50+ Cities' : '50+ शहरों में युवाओं के लिए करियर अवसर'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#4630EB', paddingHorizontal: 16, paddingVertical: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  headerTagline: { fontSize: 11, color: '#E0E7FF', fontWeight: '700' },
  langBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  langBtnText: { color: '#4630EB', fontSize: 10, fontWeight: '900' },

  profileCard: { backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#4630EB', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, marginBottom: 14 },
  avatarImg: { width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, borderColor: '#4630EB' },
  profileInfo: { marginLeft: 12, flex: 1 },
  userName: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  userSub: { fontSize: 12, color: '#64748B', marginTop: 1, fontWeight: '600' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  verifiedText: { fontSize: 10, color: '#16A34A', fontWeight: '800', marginLeft: 3 },
  logoutIconBtn: { padding: 8 },

  loginBannerCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#4630EB', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, marginBottom: 14 },
  avatarCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  loginTitle: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  loginSub: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 3, marginBottom: 14, fontWeight: '600', paddingHorizontal: 10 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4630EB', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, width: '100%', justifyContent: 'center' },
  googleBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13, marginLeft: 8 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: '#FFFFFF', paddingVertical: 14, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginHorizontal: 4 },
  statNumber: { fontSize: 16, fontWeight: '900', color: '#4630EB' },
  statLabel: { fontSize: 11, color: '#64748B', fontWeight: '700', marginTop: 2 },

  sectionHeading: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginTop: 8, marginBottom: 8, paddingLeft: 4 },
  menuContainer: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden', marginBottom: 14 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  menuSubText: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  langPill: { backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  langPillText: { color: '#4630EB', fontSize: 11, fontWeight: '800' },
  versionText: { fontSize: 12, color: '#94A3B8', fontWeight: '700' },

  footerBox: { alignItems: 'center', marginVertical: 16 },
  footerText: { fontSize: 12, fontWeight: '900', color: '#4630EB', letterSpacing: 1 },
  footerSubText: { fontSize: 11, color: '#94A3B8', marginTop: 2, fontWeight: '600' }
});