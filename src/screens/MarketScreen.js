import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Modal, ScrollView, Linking, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getJobsFromFirestore, getProgramsFromFirestore } from '../services/firebase';
import { LangContext } from '../../App';

const ALL_CITIES = [
  'All Cities', 'Work From Home', 'Morena', 'Gwalior', 'Indore', 'Bhopal',
  'Jabalpur', 'Ujjain', 'Delhi-NCR', 'Mumbai', 'Pune', 'Nagpur', 'Bengaluru',
  'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur'
];

export default function JobsProgramsScreen() {
  const { lang, toggleLang } = useContext(LangContext);
  const [activeTab, setActiveTab] = useState('Jobs');

  // Jobs State
  const [jobsData, setJobsData] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobSearch, setJobSearch] = useState('');
  const [jobFilterVisible, setJobFilterVisible] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All Cities');

  // Programs State
  const [programsData, setProgramsData] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [selectedFee, setSelectedFee] = useState('All');

  useEffect(() => {
    loadJobs();
    loadPrograms();
  }, []);

  const loadJobs = async () => {
    setJobsLoading(true);
    const data = await getJobsFromFirestore();
    setJobsData(data);
    setJobsLoading(false);
  };

  const loadPrograms = async () => {
    setProgramsLoading(true);
    const data = await getProgramsFromFirestore();
    setProgramsData(data);
    setProgramsLoading(false);
  };

  const filteredJobs = jobsData.filter(job => {
    const title = lang === 'EN' ? job.title_en : job.title_hi;
    const matchSearch = (title || '').toLowerCase().includes(jobSearch.toLowerCase()) ||
                        (job.company || '').toLowerCase().includes(jobSearch.toLowerCase());
    const matchType = selectedJobType === 'All' || job.type === selectedJobType;
    const matchCity = selectedCity === 'All Cities' || job.city === selectedCity;
    return matchSearch && matchType && matchCity;
  });

  const filteredPrograms = programsData.filter(p => {
    if (selectedFee === 'All') return true;
    const isFree = (p.fee_en || '').toLowerCase().includes('free');
    return selectedFee === 'Free' ? isFree : !isFree;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* FLAT HEADER */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{lang === 'EN' ? 'Jobs Marketplace' : 'जॉब्स मार्केट'}</Text>
            <Text style={styles.headerTagline}>{lang === 'EN' ? 'Find your dream career in Bharat' : 'अपना सपनों का करियर ढूंढें'}</Text>
          </View>
          <TouchableOpacity style={styles.langBtn} onPress={toggleLang}>
            <Text style={styles.langBtnText}>{lang === 'EN' ? 'हिंदी' : 'EN'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.topTabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Jobs' && styles.activeTab]}
          onPress={() => setActiveTab('Jobs')}
        >
          <Text style={[styles.tabText, activeTab === 'Jobs' && styles.activeTabText]}>
            {lang === 'EN' ? 'Jobs' : 'जॉब्स'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Programs' && styles.activeTab]}
          onPress={() => setActiveTab('Programs')}
        >
          <Text style={[styles.tabText, activeTab === 'Programs' && styles.activeTabText]}>
            {lang === 'EN' ? 'Programs' : 'प्रोग्राम्स'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {activeTab === 'Jobs' ? (
          <View style={{ flex: 1 }}>
            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={18} color="#4630EB" />
                <TextInput
                  placeholder={lang === 'EN' ? "Search jobs..." : "खोजें..."}
                  placeholderTextColor="#94A3B8"
                  style={styles.searchInput}
                  value={jobSearch}
                  onChangeText={setJobSearch}
                />
              </View>
              <TouchableOpacity style={styles.filterBtn} onPress={() => setJobFilterVisible(true)}>
                <Ionicons name="options-outline" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.activePillsRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['All', 'Work From Home', 'Government', 'Private'].map(filter => (
                  <TouchableOpacity
                    key={filter}
                    style={[styles.miniPill, selectedJobType === filter && styles.activeMiniPill]}
                    onPress={() => setSelectedJobType(filter)}
                  >
                    <Text style={[styles.miniPillText, selectedJobType === filter && styles.activeMiniPillText]}>{filter}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {jobsLoading ? (
              <ActivityIndicator size="large" color="#4630EB" style={{ marginTop: 40 }} />
            ) : (
              <FlatList
                data={filteredJobs}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.jobCard}>
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.jobTitle}>{lang === 'EN' ? item.title_en : item.title_hi}</Text>
                        <Text style={styles.companyName}>{item.company}</Text>
                      </View>
                      <View style={styles.sectorPill}><Text style={styles.sectorPillText}>{item.type}</Text></View>
                    </View>
                    <Text style={styles.jobDesc} numberOfLines={2}>{lang === 'EN' ? item.desc_en : item.desc_hi}</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoBadge}><Ionicons name="location-outline" size={10} color="#4630EB" /> {item.city}</Text>
                      <Text style={styles.infoBadge}><Ionicons name="cash-outline" size={10} color="#4630EB" /> {item.salary}</Text>
                    </View>
                    <TouchableOpacity style={styles.applyBtn} onPress={() => Linking.openURL(item.url)}>
                      <Text style={styles.applyBtnText}>{lang === 'EN' ? 'View Details' : 'देखें'}</Text>
                      <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <View style={styles.filterRow}>
              {['All', 'Free', 'Paid'].map(f => (
                <TouchableOpacity key={f} style={[styles.miniPill, selectedFee === f && styles.activeMiniPill]} onPress={() => setSelectedFee(f)}>
                  <Text style={[styles.miniPillText, selectedFee === f && styles.activeMiniPillText]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {programsLoading ? (
              <ActivityIndicator size="large" color="#4630EB" style={{ marginTop: 40 }} />
            ) : (
              <FlatList
                data={filteredPrograms}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.programCard}>
                    <View style={styles.topRow}>
                      <Text style={styles.provider}>{item.provider}</Text>
                      <Text style={styles.feeBadge}>{lang === 'EN' ? item.fee_en : item.fee_hi}</Text>
                    </View>
                    <Text style={styles.jobTitle}>{lang === 'EN' ? item.title_en : item.title_hi}</Text>
                    <View style={styles.badgeRow}>
                      <Text style={styles.badge}><Ionicons name="time-outline" size={10} color="#4630EB" /> {lang === 'EN' ? item.duration_en : item.duration_hi}</Text>
                      <Text style={styles.badge}><Ionicons name="laptop-outline" size={10} color="#4630EB" /> {lang === 'EN' ? item.mode_en : item.mode_hi}</Text>
                    </View>
                    <TouchableOpacity style={styles.applyBtn} onPress={() => Linking.openURL(item.url)}>
                      <Text style={styles.applyBtnText}>{lang === 'EN' ? 'Join Program' : 'जॉइन करें'}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View>
        )}
      </View>

      {/* Shared Job Filter Modal */}
      <Modal visible={jobFilterVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Openings</Text>
              <TouchableOpacity onPress={() => setJobFilterVisible(false)}><Ionicons name="close" size={24} color="#0F172A" /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionHeading}>City / Location</Text>
              <TextInput placeholder="Search city..." style={styles.modalSearchBox} value={citySearch} onChangeText={setCitySearch} />
              <View style={styles.chipGrid}>
                {ALL_CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase())).map(c => (
                  <TouchableOpacity key={c} style={[styles.chip, selectedCity === c && styles.activeChip]} onPress={() => setSelectedCity(c)}>
                    <Text style={[styles.chipText, selectedCity === c && styles.activeChipText]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.modalApplyBtn} onPress={() => setJobFilterVisible(false)}>
              <Text style={styles.modalApplyText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  topTabContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 4, marginHorizontal: 16, marginTop: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#4630EB' },
  tabText: { fontSize: 13, fontWeight: '800', color: '#64748B' },
  activeTabText: { color: '#FFFFFF' },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, height: 44, borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: '#0F172A', fontWeight: '600' },
  filterBtn: { backgroundColor: '#4630EB', width: 44, height: 44, borderRadius: 10, marginLeft: 8, justifyContent: 'center', alignItems: 'center' },
  activePillsRow: { marginBottom: 12 },
  miniPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#FFFFFF', marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  activeMiniPill: { backgroundColor: '#4630EB', borderColor: '#4630EB' },
  miniPillText: { fontSize: 11, fontWeight: '800', color: '#64748B' },
  activeMiniPillText: { color: '#FFFFFF' },
  jobCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  jobTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  companyName: { fontSize: 12, color: '#64748B', fontWeight: '600', marginTop: 2 },
  sectorPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#EEF2FF' },
  sectorPillText: { fontSize: 10, fontWeight: '800', color: '#4630EB' },
  jobDesc: { fontSize: 12, color: '#475569', marginVertical: 8 },
  infoRow: { flexDirection: 'row', gap: 10 },
  infoBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#F1F5F9', fontSize: 10, fontWeight: '700', color: '#0F172A' },
  applyBtn: { backgroundColor: '#4630EB', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 40, borderRadius: 8, marginTop: 10 },
  applyBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13, marginRight: 6 },
  filterRow: { flexDirection: 'row', marginBottom: 16 },
  programCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  provider: { fontSize: 11, color: '#4630EB', fontWeight: '800' },
  feeBadge: { fontSize: 10, color: '#4630EB', fontWeight: '800', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#EEF2FF' },
  badgeRow: { flexDirection: 'row', marginTop: 8 },
  badge: { fontSize: 10, color: '#0F172A', fontWeight: '700', marginRight: 8, backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  sectionHeading: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginTop: 12, marginBottom: 8 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: '#F1F5F9', marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  activeChip: { backgroundColor: '#4630EB', borderColor: '#4630EB' },
  chipText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  activeChipText: { color: '#FFFFFF' },
  modalSearchBox: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', marginBottom: 10, fontSize: 13, color: '#0F172A' },
  modalApplyBtn: { backgroundColor: '#4630EB', height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  modalApplyText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' }
});