import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LangContext } from '../../App';

const CARDS_DATA = [
  { id: 'c1', bank: 'AU Small Finance', name: 'LIT Credit Card', reward: 'Earn 1500+ (Lifetime Free)', link: 'https://www.goodonefinance.com/credit-cards' },
  { id: 'c2', bank: 'IDFC FIRST', name: 'Classic Credit Card', reward: 'Earn 1200+ (Lifetime Free)', link: 'https://www.goodonefinance.com/credit-cards' },
  { id: 'c3', bank: 'IndusInd Bank', name: 'Platinum Card', reward: 'Earn 1000+ (Lifetime Free)', link: 'https://www.goodonefinance.com/credit-cards' },
  { id: 'c4', bank: 'SBI Card', name: 'SimplyClick', reward: 'Earn 800+', link: 'https://www.goodonefinance.com/credit-cards' }
];

export default function EarnScreen() {
  const { lang, toggleLang } = useContext(LangContext);

  const handleApply = (link) => {
    Linking.openURL(link || 'https://goodonefinance.com/apply?source=jobshub');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* FLAT HEADER */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{lang === 'EN' ? 'Financial Services' : 'वित्तीय सेवाएं'}</Text>
            <Text style={styles.headerTagline}>{lang === 'EN' ? 'Explore cards, loans & track earnings' : 'कार्ड, लोन देखें और कमाई ट्रैक करें'}</Text>
          </View>
          <TouchableOpacity style={styles.langBtn} onPress={toggleLang}>
            <Text style={styles.langBtnText}>{lang === 'EN' ? 'हिंदी' : 'EN'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 25, paddingTop: 12 }}>
        {/* Compact Balanced Wallet Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletTop}>
            <View>
              <Text style={styles.walletLabel}>{lang === 'EN' ? 'Earnings Wallet' : 'आपकी कुल कमाई'}</Text>
              <Text style={styles.walletAmount}>₹ 0.00</Text>
            </View>
            <TouchableOpacity style={styles.withdrawBtn}>
              <Text style={styles.withdrawText}>{lang === 'EN' ? 'Withdraw' : 'निकालें'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.walletDivider} />

          <View style={styles.walletBottom}>
            <Text style={styles.subLabel}>{lang === 'EN' ? 'Pending Payout' : 'बाकी राशि'}:</Text>
            <Text style={styles.subValue}>₹ 0.00</Text>
          </View>
        </View>

        {/* Cards Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{lang === 'EN' ? 'Verified Lifetime Free Cards' : 'वेरिफ़ाइड फ्री क्रेडिट कार्ड्स'}</Text>
          {CARDS_DATA.map((card) => (
            <View key={card.id} style={styles.cardItem}>
              <View style={styles.cardIcon}>
                <Ionicons name="card-outline" size={20} color="#4630EB" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.bankName}>{card.bank}</Text>
                <Text style={styles.cardName}>{card.name}</Text>
                <Text style={styles.rewardText}>{card.reward}</Text>
              </View>
              <TouchableOpacity style={styles.applyBtn} onPress={() => handleApply(card.link)}>
                <Text style={styles.applyText}>{lang === 'EN' ? 'Apply' : 'आवेदन'}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Refer & Earn Banner */}
        <TouchableOpacity style={styles.referCard}>
          <View style={styles.referInfo}>
            <Text style={styles.referTitle}>{lang === 'EN' ? 'Refer & Earn' : 'रेफर करें और कमाएं'}</Text>
            <Text style={styles.referDesc}>
              {lang === 'EN'
                ? 'Invite friends and earn ₹50 on their first successful application.'
                : 'दोस्तों को इनवाइट करें और ₹50 कमाएं।'}
            </Text>
          </View>
          <Ionicons name="share-social-outline" size={22} color="#4630EB" />
        </TouchableOpacity>
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

  walletCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#4630EB',
    padding: 16,
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#4630EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  walletTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  walletLabel: { color: '#E0E7FF', fontSize: 12, fontWeight: '600' },
  walletAmount: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', marginTop: 2 },
  withdrawBtn: {
    backgroundColor: '#FFFFFF',
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  withdrawText: { color: '#4630EB', fontWeight: '800', fontSize: 12 },
  walletDivider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.15)', marginVertical: 10 },
  walletBottom: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  subLabel: { color: '#E0E7FF', fontSize: 11, fontWeight: '600' },
  subValue: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },

  section: { paddingHorizontal: 16, marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 10 },
  cardItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  cardIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  bankName: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  cardName: { fontSize: 11, color: '#64748B', marginTop: 1 },
  rewardText: { fontSize: 11, color: '#10B981', fontWeight: '700', marginTop: 2 },
  applyBtn: { backgroundColor: '#4630EB', height: 32, paddingHorizontal: 14, borderRadius: 8, justifyContent: 'center' },
  applyText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },

  referCard: {
    marginHorizontal: 16,
    marginTop: 6,
    padding: 14,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE'
  },
  referInfo: { flex: 1, marginRight: 8 },
  referTitle: { fontSize: 13, fontWeight: '800', color: '#4630EB' },
  referDesc: { fontSize: 11, color: '#475569', marginTop: 2, lineHeight: 15 }
});