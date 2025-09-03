import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatGrid } from 'react-native-super-grid';
import Icon from 'react-native-vector-icons/FontAwesome';
import EnhancedBayCard from '../components/EnhancedBayCard';
import martinMariettaDataService from '../services/martinMariettaData';

// Import logos to ensure they're bundled
const mariettaLogo = require('../../assets/images/marietta.png');
const cemexLogo = require('../../assets/images/cemex.png');

const EnhancedDashboardScreen = ({ navigation, route }) => {
  const companyData = route.params?.companyData || { 
    company: 'martinmarietta', 
    companyName: 'Martin Marietta' 
  };
  const [dashboardData, setDashboardData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [states, setStates] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Filter effect with material support
  useEffect(() => {
    let filtered = projects;
    
    if (selectedState) {
      filtered = filtered.filter(project => project.state === selectedState);
    }
    
    if (selectedMaterial) {
      filtered = filtered.filter(project => 
        project.materialType === selectedMaterial || 
        project.products?.includes(selectedMaterial)
      );
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.name?.toLowerCase().includes(query) ||
        project.city?.toLowerCase().includes(query) ||
        project.state?.toLowerCase().includes(query) ||
        project.materialType?.toLowerCase().includes(query) ||
        project.address?.toLowerCase().includes(query)
      );
    }
    
    setFilteredProjects(filtered);
  }, [projects, selectedState, selectedMaterial, searchQuery]);

  const generateCemexData = () => {
    // CEMEX facilities data focused on 4 Corners area with three key divisions
    const cemexFacilities = [
      // AGGREGATES DIVISION - The division you've already shown the product to
      {
        facilityId: 'CEX_AGG_001',
        name: 'CEMEX 4 Corners Sand Facility',
        division: 'Aggregates',
        address: '4 Corners Sand Facility',
        city: 'Farmington',
        state: 'New Mexico',
        zip: '87401',
        latitude: '36.7280',
        longitude: '-108.2187',
        contactName: 'Aggregates Division Manager',
        contactTitle: 'Division Manager - Aggregates',
        contactEmail: 'aggregates.4corners@cemex.com',
        contactPhone: '(505) 327-4000',
        products: ['Aggregates', 'Sand', 'Gravel'],
        hoursOfOperation: 'Mon - Fri | 6:00 AM - 5:00 PM',
        notes: 'Primary contact - already shown Quvo product'
      },
      {
        facilityId: 'CEX_AGG_002',
        name: 'CEMEX Durango Aggregates',
        division: 'Aggregates',
        address: '2500 Highway 550',
        city: 'Durango',
        state: 'Colorado',
        zip: '81301',
        latitude: '37.2753',
        longitude: '-107.8801',
        contactName: 'Site Operations Manager',
        contactTitle: 'Operations Manager',
        contactEmail: 'durango.ops@cemex.com',
        contactPhone: '(970) 247-3200',
        products: ['Aggregates', 'Crushed Stone'],
        hoursOfOperation: 'Mon - Fri | 6:00 AM - 4:30 PM'
      },
      
      // READY MIX DIVISION - President you know personally
      {
        facilityId: 'CEX_RMX_001',
        name: 'CEMEX Ready Mix - 4 Corners',
        division: 'Ready Mix',
        address: '4 Corners Ready Mix Plant',
        city: 'Farmington',
        state: 'New Mexico',
        zip: '87401',
        latitude: '36.7280',
        longitude: '-108.2187',
        contactName: 'Ready Mix Division President',
        contactTitle: 'Division President - Ready Mix',
        contactEmail: 'president.readymix@cemex.com',
        contactPhone: '(505) 327-5000',
        products: ['Ready Mixed Concrete', 'Specialty Concrete'],
        hoursOfOperation: 'Mon - Fri | 5:00 AM - 4:00 PM',
        notes: 'Key contact - Ready Mix Division President (known personally)'
      },
      {
        facilityId: 'CEX_RMX_002',
        name: 'CEMEX Ready Mix - Aztec',
        division: 'Ready Mix',
        address: '1200 West Aztec Blvd',
        city: 'Aztec',
        state: 'New Mexico',
        zip: '87410',
        latitude: '36.8379',
        longitude: '-108.0015',
        contactName: 'Plant Manager',
        contactTitle: 'Plant Manager',
        contactEmail: 'aztec.plant@cemex.com',
        contactPhone: '(505) 334-7500',
        products: ['Ready Mixed Concrete'],
        hoursOfOperation: 'Mon - Fri | 5:30 AM - 4:00 PM'
      },
      
      // CEMENT DIVISION - Target division
      {
        facilityId: 'CEX_CEM_001',
        name: 'CEMEX Cement - Lyons Terminal',
        division: 'Cement',
        address: '500 Industrial Drive',
        city: 'Lyons',
        state: 'Colorado',
        zip: '80540',
        latitude: '40.2236',
        longitude: '-105.2619',
        contactName: 'Cement Division Manager',
        contactTitle: 'Division Manager - Cement',
        contactEmail: 'cement.lyons@cemex.com',
        contactPhone: '(303) 823-6000',
        products: ['Cement', 'Bulk Cement'],
        hoursOfOperation: 'Mon - Fri | 6:00 AM - 5:00 PM',
        notes: 'Target division for Quvo expansion'
      },
      {
        facilityId: 'CEX_CEM_002',
        name: 'CEMEX Cement - Pueblo Terminal',
        division: 'Cement',
        address: '3400 Dillon Drive',
        city: 'Pueblo',
        state: 'Colorado',
        zip: '81008',
        latitude: '38.2544',
        longitude: '-104.6091',
        contactName: 'Terminal Operations Manager',
        contactTitle: 'Operations Manager',
        contactEmail: 'pueblo.terminal@cemex.com',
        contactPhone: '(719) 545-8200',
        products: ['Cement', 'Specialty Cement'],
        hoursOfOperation: 'Mon - Fri | 6:00 AM - 4:30 PM'
      }
    ];

    return cemexFacilities;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      let facilities = [];
      let allStates = [];
      
      if (companyData.company === 'cemex') {
        // Generate mock CEMEX data
        facilities = generateCemexData();
        allStates = [...new Set(facilities.map(f => f.state))].sort();
      } else {
        // Load Martin Marietta facility data
        facilities = martinMariettaDataService.getAllFacilities();
        allStates = martinMariettaDataService.getAllStates();
      }
      
      setDashboardData({ facilities });
      setStates(allStates);
      
      // Extract unique materials for filtering
      const uniqueMaterials = [...new Set(facilities.flatMap(f => f.products || []))].sort();
      setMaterials(uniqueMaterials);
      
      // Transform facilities into bay data with proper mapping for EnhancedBayCard
      const bayData = facilities.map((facility, index) => {
        const volume = Math.floor(Math.random() * 1000 + 500); // Random volume 500-1500
        const maxVolume = Math.floor(Math.random() * 500 + 1500); // Random max volume 1500-2000
        const allMaterials = facility.products || ['Aggregates'];
        
        // Shorten material names to fit better
        const shortenedMaterials = allMaterials.map(material => {
          return material
            .replace('Ready Mixed Concrete', 'RMC')
            .replace('Aggregates', 'Agg')
            .replace('Magnesia Specialties', 'Magnesia')
            .replace('Asphalt Paving Mix', 'Asphalt');
        });
        
        const materialType = shortenedMaterials.length > 1 
          ? shortenedMaterials.slice(0, 2).join(', ') + (shortenedMaterials.length > 2 ? '...' : '')
          : shortenedMaterials[0];
        
        return {
          // IDs and Keys
          id: facility.facilityId || index,
          facilityId: facility.facilityId,
          uniqueId: `facility_${facility.facilityId}_${index}`,
          
          // Names and Titles (for EnhancedBayCard)
          name: facility.name,
          zoneName: facility.name, // EnhancedBayCard looks for zoneName first
          facilityName: facility.name, // EnhancedBayCard looks for facilityName
          
          // Location Data
          location: `${facility.city}, ${facility.state}`,
          address: facility.address,
          city: facility.city,
          state: facility.state,
          zip: facility.zip,
          latitude: parseFloat(facility.latitude) || 0,
          longitude: parseFloat(facility.longitude) || 0,
          
          // Material and Product Data (for EnhancedBayCard)
          materialType: materialType,
          material: materialType,
          products: facility.products || ['Aggregates'],
          productsAvailable: facility.productsAvailable,
          originalMaterials: allMaterials, // Store original full names for ordering
          
          // Volume and Capacity Data (for EnhancedBayCard)
          volume: volume,
          maxVolume: maxVolume,
          unitType: materialType === 'Ready Mixed Concrete' ? 'cubic yards' : 'tons',
          
          // Pricing (random for now)
          pricePerTon: Math.floor(Math.random() * 50 + 20), // $20-70 per ton
          
          // Contact Information
          contactName: facility.contactName,
          contactTitle: facility.contactTitle,
          contactEmail: facility.contactEmail,
          contactPhone: facility.contactPhone,
          officePhone: facility.officePhone,
          hoursOfOperation: facility.hoursOfOperation,
          
          // Status
          status: 'Available',
          capacity: Math.floor(Math.random() * 40 + 60), // Random capacity 60-100%
          availability: Math.floor(Math.random() * 20 + 80), // Random availability 80-100%
          
          // Store original facility data
          originalFacility: facility
        };
      });
      
      setProjects(bayData);
      setFilteredProjects(bayData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const logout = () => {
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Clean Header */}
      <View style={styles.header}>
        <View style={styles.mainHeaderRow}>
          <View style={styles.brandSection}>
            <Image 
              source={require('../../assets/images/quvo_logo.png')}
              style={styles.quvoLogo}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <Icon name="sign-out" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.companyLogoRow}>
          {companyData.company === 'cemex' ? (
            <Image 
              source={cemexLogo} 
              style={styles.companyLogo}
              resizeMode="contain"
            />
          ) : (
            <Image 
              source={mariettaLogo} 
              style={styles.companyLogo}
              resizeMode="contain"
            />
          )}
        </View>
      </View>

      {/* Search with Filter Modal */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity 
          style={styles.searchContainer}
          onPress={() => setShowFilterModal(true)}
        >
          <Icon name="search" size={16} color="#666" style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>
            {(selectedState || selectedMaterial || searchQuery) 
              ? `${[selectedState, selectedMaterial, searchQuery].filter(Boolean).join(', ')}`
              : 'Search and filter facilities...'
            }
          </Text>
          <Icon name="filter" size={16} color="#5bbc9d" />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Icon name="times" size={20} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Search & Filter</Text>
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery('');
                setSelectedState('');
                setSelectedMaterial('');
              }}
            >
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Text Search */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>Search</Text>
              <View style={styles.modalSearchContainer}>
                <Icon name="search" size={16} color="#666" style={styles.searchIcon} />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Search by name, location, address..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* State Filter */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>Filter by State</Text>
              <View style={styles.chipContainer}>
                <TouchableOpacity 
                  style={[styles.modalFilterChip, !selectedState && styles.modalFilterChipActive]}
                  onPress={() => setSelectedState('')}
                >
                  <Text style={[styles.modalFilterChipText, !selectedState && styles.modalFilterChipTextActive]}>
                    All States
                  </Text>
                </TouchableOpacity>
                
                {states.map(state => (
                  <TouchableOpacity 
                    key={state}
                    style={[styles.modalFilterChip, selectedState === state && styles.modalFilterChipActive]}
                    onPress={() => setSelectedState(selectedState === state ? '' : state)}
                  >
                    <Text style={[styles.modalFilterChipText, selectedState === state && styles.modalFilterChipTextActive]}>
                      {state}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Material Filter */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>Filter by Material</Text>
              <View style={styles.chipContainer}>
                <TouchableOpacity 
                  style={[styles.modalFilterChip, !selectedMaterial && styles.modalFilterChipActive]}
                  onPress={() => setSelectedMaterial('')}
                >
                  <Text style={[styles.modalFilterChipText, !selectedMaterial && styles.modalFilterChipTextActive]}>
                    All Materials
                  </Text>
                </TouchableOpacity>
                
                {materials.map(material => (
                  <TouchableOpacity 
                    key={material}
                    style={[styles.modalFilterChip, selectedMaterial === material && styles.modalFilterChipActive]}
                    onPress={() => setSelectedMaterial(selectedMaterial === material ? '' : material)}
                  >
                    <Text style={[styles.modalFilterChipText, selectedMaterial === material && styles.modalFilterChipTextActive]}>
                      {material}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Results Preview */}
            <View style={styles.resultsPreview}>
              <Text style={styles.resultsText}>
                {filteredProjects.length} facilities match your filters
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5bbc9d" />
          <Text style={styles.loadingText}>Loading dashboard data...</Text>
        </View>
      ) : filteredProjects.length > 0 ? (
        <FlatGrid
          itemDimension={320}
          data={filteredProjects}
          style={styles.gridView}
          spacing={12}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item, index }) => (
            <EnhancedBayCard
              key={`${item.id}-${index}`}
              record={item}
              storage={{ maxVolume: item.maxVolume }}
              onPress={() => navigation.navigate('BayDetail', { 
                bayName: item.zoneName || item.name,
                currentRecord: item
              })}
            />
          )}
        />
      ) : (
        <ScrollView 
          style={styles.scrollView}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No bay data available</Text>
            <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  mainHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  quvoLogo: {
    width: 108,
    height: 32.4,
  },
  companyLogoRow: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  companyLogo: {
    width: '100%',
    height: 60,
    maxWidth: 400,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutBtn: {
    padding: 8,
    borderRadius: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  gridView: {
    marginTop: 8,
    flex: 1,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noDataText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#5bbc9d',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#1F2937',
  },
  stateFilters: {
    flexDirection: 'row',
  },
  filterChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#5bbc9d',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#999',
    marginHorizontal: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  clearAllText: {
    fontSize: 16,
    color: '#5bbc9d',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  modalSearchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#1F2937',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalFilterChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  modalFilterChipActive: {
    backgroundColor: '#5bbc9d',
  },
  modalFilterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  modalFilterChipTextActive: {
    color: '#ffffff',
  },
  resultsPreview: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resultsText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  applyButton: {
    backgroundColor: '#5bbc9d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default EnhancedDashboardScreen;