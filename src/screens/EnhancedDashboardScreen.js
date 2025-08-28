import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { FlatGrid } from 'react-native-super-grid';
import { useAuth } from '../context/AuthContext';
import EnhancedBayCard from '../components/EnhancedBayCard';
import MinimalFilterControls from '../components/MinimalFilterControls';
import api from '../services/api';
import martinMariettaDataService from '../services/martinMariettaData';
import customerDataService from '../services/customerDataService';

const { width, height } = Dimensions.get('window');

const EnhancedDashboardScreen = ({ navigation }) => {
  const { user, logout, userRole, switchRole, canEditPrices, canViewAllSites } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('all');
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [facilityGroups, setFacilityGroups] = useState({});
  const [selectedState, setSelectedState] = useState('all');
  const [showStateModal, setShowStateModal] = useState(false);
  const [facilitySearchQuery, setFacilitySearchQuery] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState('martin-marietta');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadCustomers();
    loadFacilities();
  }, []);

  useEffect(() => {
    // Reload facilities when customer changes
    if (selectedCustomer) {
      loadFacilities();
      setSelectedFacility('all'); // Reset facility selection
    }
  }, [selectedCustomer]);

  const loadCustomers = () => {
    try {
      const allCustomers = customerDataService.getAllCustomers();
      setCustomers(allCustomers);
      console.log(`Loaded ${allCustomers.length} customers:`, allCustomers.map(c => c.name).join(', '));
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const loadFacilities = () => {
    try {
      if (selectedCustomer === 'martin-marietta') {
        // Use Martin Marietta data service for backward compatibility
        const allFacilities = martinMariettaDataService.getAllFacilities();
        const facilitiesByState = martinMariettaDataService.facilitiesByState;
        
        // Create facilities list with "All" option
        const facilityOptions = [
          { id: 'all', name: 'All Facilities', state: 'all' }
        ];
        
        allFacilities.forEach(facility => {
          facilityOptions.push({
            id: facility.facilityId.toString(),
            name: facility.name,
            state: facility.state,
            facility: facility
          });
        });

        setFacilities(facilityOptions);
        setFacilityGroups(facilitiesByState);
        
        console.log(`Loaded ${allFacilities.length} Martin Marietta facilities across ${Object.keys(facilitiesByState).length} states`);
      } else {
        // Use customer data service for specific customer sites
        const customerSites = customerDataService.getCustomerSites(selectedCustomer);
        
        const facilityOptions = [
          { id: 'all', name: 'All Sites', state: 'all' }
        ];
        
        customerSites.forEach(site => {
          facilityOptions.push({
            id: site.id,
            name: site.name,
            state: site.state,
            city: site.city,
            facility: site
          });
        });

        // Group by state for consistency
        const sitesByState = {};
        customerSites.forEach(site => {
          if (!sitesByState[site.state]) sitesByState[site.state] = [];
          sitesByState[site.state].push(site);
        });

        setFacilities(facilityOptions);
        setFacilityGroups(sitesByState);
        
        const customer = customerDataService.getCustomer(selectedCustomer);
        console.log(`Loaded ${customerSites.length} ${customer?.name || 'Customer'} sites across ${Object.keys(sitesByState).length} states`);
      }
    } catch (error) {
      console.error('Failed to load facilities:', error);
    }
  };

  // Filter facilities for display in modal
  const getFilteredFacilities = () => {
    let facilitiesToShow = [];
    
    if (selectedCustomer === 'martin-marietta') {
      facilitiesToShow = martinMariettaDataService.getAllFacilities();
    } else {
      facilitiesToShow = customerDataService.getCustomerSites(selectedCustomer);
    }
    
    // Filter by search query
    if (facilitySearchQuery.trim()) {
      const query = facilitySearchQuery.toLowerCase();
      facilitiesToShow = facilitiesToShow.filter(facility =>
        facility.name.toLowerCase().includes(query) ||
        facility.city.toLowerCase().includes(query) ||
        facility.state.toLowerCase().includes(query) ||
        facility.productsAvailable?.toLowerCase().includes(query) ||
        Object.values(facility.products || {}).some(product =>
          product.name?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
        )
      );
    }

    // Filter by state
    if (selectedState !== 'all') {
      facilitiesToShow = facilitiesToShow.filter(facility => facility.state === selectedState);
    }

    // Filter by product category
    if (selectedProductCategory !== 'all') {
      if (selectedCustomer === 'martin-marietta') {
        facilitiesToShow = facilitiesToShow.filter(facility =>
          facility.products?.includes(selectedProductCategory) ||
          facility.detailedProducts?.some(p => p.category === selectedProductCategory)
        );
      } else {
        facilitiesToShow = facilitiesToShow.filter(facility =>
          Object.values(facility.products || {}).some(product => 
            product.category === selectedProductCategory
          )
        );
      }
    }

    return facilitiesToShow;
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadProjects(),
        loadDashboardData(),
      ]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const projectsData = await api.getProjects();
      console.log('Projects data:', JSON.stringify(projectsData, null, 2));
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      const data = await api.getBayData();
      console.log('Raw API data structure:', JSON.stringify(data, null, 2));
      console.log('Records sample:', data?.recordsById ? Object.keys(data.recordsById).slice(0, 5) : 'No records');
      console.log('Storages sample:', data?.storagesById ? Object.keys(data.storagesById).slice(0, 5) : 'No storages');
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      throw error;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
    } catch (error) {
      Alert.alert('Refresh Failed', 'Unable to update data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  // Generate facility-specific bays using customer data
  const generateFacilityBays = () => {
    const facilityBays = {};
    
    facilities.forEach(facility => {
      if (facility.id === 'all') return;
      
      const facilityData = facility.facility;
      if (!facilityData) return;
      
      if (selectedCustomer === 'martin-marietta') {
        // Use Martin Marietta data service for backward compatibility
        const bays = martinMariettaDataService.generateFacilityBays(facilityData.facilityId);
        facilityBays[facility.id] = bays;
      } else {
        // Use customer data service for other customers
        const bays = customerDataService.generateCustomerBays(selectedCustomer, facility.id);
        facilityBays[facility.id] = bays;
      }
    });

    return facilityBays;
  };

  // Group and filter bays logic
  const filteredBays = useMemo(() => {
    const facilityBays = generateFacilityBays();
    let baysToShow = [];

    if (selectedFacility === 'all') {
      // Show bays from all facilities
      Object.entries(facilityBays).forEach(([facilityId, bays]) => {
        const facilityInfo = facilities.find(f => f.id === facilityId);
        bays.forEach(bay => {
          baysToShow.push({
            ...bay,
            facilityId: facilityId,
            facilityName: facilityInfo?.name || bay.facilityName || 'Unknown Facility',
            zoneName: bay.name,
            materialType: bay.materialType || bay.material,
            volume: bay.volume.toString(),
            pricePerTon: bay.pricePerTon || 0,
            datetime: bay.datetime || new Date().toISOString(),
            name: bay.name,
            storageId: bay.storageId,
            uniqueId: bay.uniqueId
          });
        });
      });
    } else {
      // Show bays from selected facility only
      const selectedBays = facilityBays[selectedFacility] || [];
      
      selectedBays.forEach(bay => {
        baysToShow.push({
          ...bay,
          zoneName: bay.name,
          materialType: bay.materialType || bay.material,
          volume: bay.volume.toString(),
          pricePerTon: bay.pricePerTon || 0,
          datetime: bay.datetime || new Date().toISOString(),
          name: bay.name,
          storageId: bay.storageId,
          uniqueId: bay.uniqueId
        });
      });
    }

    let uniqueRecords = baysToShow;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      uniqueRecords = uniqueRecords.filter(record => 
        record.zoneName.toLowerCase().includes(query) ||
        record.materialType.toLowerCase().includes(query) ||
        (record.name && record.name.toLowerCase().includes(query)) ||
        (storages[record.storageId]?.name?.toLowerCase().includes(query))
      );
    }

    // Availability filter
    if (availabilityFilter !== 'all') {
      uniqueRecords = uniqueRecords.filter(record => {
        const volume = parseFloat(record.volume || 0);
        const maxVolume = parseFloat(record.maxVolume || 1000);
        const utilization = (volume / maxVolume) * 100;

        switch (availabilityFilter) {
          case 'available':
            return utilization >= 30 && utilization < 70;
          case 'high':
            return utilization >= 70 && utilization < 90;
          case 'nearly_full':
            return utilization >= 90;
          case 'low':
            return utilization < 30;
          default:
            return true;
        }
      });
    }


    // Sort by zone name first, then by material type for consistent display
    return uniqueRecords.sort((a, b) => {
      const zoneCompare = a.zoneName.localeCompare(b.zoneName);
      if (zoneCompare !== 0) return zoneCompare;
      return a.materialType.localeCompare(b.materialType);
    });
  }, [selectedFacility, searchQuery, availabilityFilter, facilities]);

  // Calculate statistics based on filtered bays
  const stats = useMemo(() => {
    let totalVolume = 0;
    let availableBays = 0;
    let highLevelBays = 0;
    let nearlyFullBays = 0;
    let lowStockBays = 0;
    let criticalBays = 0;

    filteredBays.forEach(record => {
      const volume = parseFloat(record.volume || 0);
      const maxVolume = parseFloat(record.maxVolume || 1000);
      const utilization = (volume / maxVolume) * 100;
      const criticalLevel = record.criticalLevel || 10;
      
      totalVolume += volume;
      
      if (utilization <= criticalLevel) {
        criticalBays++;
      } else if (utilization >= 90) {
        nearlyFullBays++;
      } else if (utilization >= 70) {
        highLevelBays++;
      } else if (utilization >= 30) {
        availableBays++;
      } else {
        lowStockBays++;
      }
    });

    return {
      totalBays: filteredBays.length,
      totalVolume,
      availableBays,
      highLevelBays,
      nearlyFullBays,
      lowStockBays,
      criticalBays
    };
  }, [filteredBays]);

  const formatVolume = (volume, unitType = 'tons') => {
    let formattedNumber;
    if (volume >= 1000000) {
      formattedNumber = `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      formattedNumber = `${(volume / 1000).toFixed(1)}K`;
    } else {
      formattedNumber = volume.toFixed(0);
    }
    return `${formattedNumber} ${unitType}`;
  };

  const renderBayCard = ({ item }) => (
    <EnhancedBayCard
      record={item}
      storage={{ maxVolume: item.maxVolume }} // Pass the max volume directly
      onPress={() => {
        navigation.navigate('BayDetail', {
          bayName: item.name,
          currentRecord: item
        });
      }}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
      
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.brandingRow}>
              <View style={styles.logoRow}>
                <TouchableOpacity 
                  style={styles.customerSelector}
                  onPress={() => setShowCustomerModal(true)}
                >
                  <Text style={styles.brandText}>
                    QUVO × {customers.find(c => c.id === selectedCustomer)?.name || 'Select Customer'}
                  </Text>
                  <Text style={styles.customerArrow}>▼</Text>
                </TouchableOpacity>
                <View style={styles.partnerLogoContainer}>
                  <Image 
                    source={require('../../assets/images/marietta.png')} 
                    style={styles.partnerLogo}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </View>
            <Text style={styles.welcomeText}>Hello, {user?.name?.split('.')[0] || 'User'}</Text>
            <Text style={styles.territoryText}>Territory: Florida West Coast</Text>
            <TouchableOpacity 
              style={styles.facilitySelector}
              onPress={() => setShowFacilityModal(true)}
            >
              <Text style={styles.projectText}>
                {facilities.find(f => f.id === selectedFacility)?.name || 'All Facilities'}
              </Text>
              <Text style={styles.projectArrow}>▼</Text>
            </TouchableOpacity>
            {selectedFacility !== 'all' && (
              <View style={styles.facilityInfoRow}>
                <Text style={styles.facilityDetails}>
                  {facilities.find(f => f.id === selectedFacility)?.facility?.city}, {facilities.find(f => f.id === selectedFacility)?.facility?.state}
                </Text>
                <TouchableOpacity 
                  style={styles.facilityInfoButton}
                  onPress={() => {
                    const selectedFacilityData = facilities.find(f => f.id === selectedFacility);
                    if (selectedFacilityData?.facility) {
                      navigation.navigate('FacilityDetail', {
                        facilityId: selectedFacilityData.facility.facilityId
                      });
                    }
                  }}
                >
                  <Text style={styles.facilityInfoButtonText}>ℹ️ Details</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <View style={styles.logoutIcon} />
          </TouchableOpacity>
        </View>

        {/* Enhanced Stats Summary */}
        <View style={styles.simpleStats}>
          <Text style={styles.simpleStatsText}>
            {filteredBays.length} of {stats.totalBays} bays
          </Text>
          {stats.criticalBays > 0 && (
            <View style={styles.criticalAlert}>
              <Text style={styles.criticalAlertText}>
                ⚠️ {stats.criticalBays} critical (≤10%)
              </Text>
            </View>
          )}
          {!canViewAllSites() && (
            <Text style={styles.restrictedAccessText}>
              📍 Limited to assigned sites
            </Text>
          )}
        </View>
      </View>

      {/* Minimal Filter Controls */}
      <MinimalFilterControls
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        availabilityFilter={availabilityFilter}
        onAvailabilityFilter={setAvailabilityFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />


      {/* Enhanced Bay Grid */}
      {filteredBays.length > 0 ? (
        <FlatGrid
          itemDimension={150}
          data={filteredBays}
          style={styles.gridList}
          spacing={12}
          renderItem={renderBayCard}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              tintColor="#3498DB"
            />
          }
          contentContainerStyle={styles.gridContent}
          staticDimension={width - 32}
          maxItemsPerRow={2}
          itemContainerStyle={styles.gridItemContainer}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyStateIcon} />
          <Text style={styles.emptyStateTitle}>No Bays Found</Text>
          <Text style={styles.emptyStateMessage}>
            Try adjusting your filters or search terms
          </Text>
          <TouchableOpacity 
            onPress={() => {
              setAvailabilityFilter('all');
              setSearchQuery('');
            }}
            style={styles.resetButton}
          >
            <Text style={styles.resetButtonText}>Show All Bays</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Facility Selection Modal */}
      <Modal
        visible={showFacilityModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFacilityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.largeModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Facility</Text>
              <Text style={styles.facilityCount}>
                {facilities.length - 1} facilities across {Object.keys(facilityGroups).length} states
              </Text>
              
              {/* Search Input */}
              <TextInput
                style={styles.searchInput}
                placeholder="Search facilities, cities, or materials..."
                value={facilitySearchQuery}
                onChangeText={setFacilitySearchQuery}
                placeholderTextColor="#95A5A6"
              />

              {/* Filters */}
              <View style={styles.filtersRow}>
                {/* State Filter */}
                <TouchableOpacity 
                  style={[styles.filterChip, selectedState !== 'all' && styles.activeFilterChip]}
                  onPress={() => setShowStateModal(true)}
                >
                  <Text style={[styles.filterChipText, selectedState !== 'all' && styles.activeFilterChipText]}>
                    {selectedState === 'all' ? '📍 All States' : `📍 ${selectedState}`}
                  </Text>
                </TouchableOpacity>

                {/* Product Filter */}
                <TouchableOpacity 
                  style={[styles.filterChip, selectedProductCategory !== 'all' && styles.activeFilterChip]}
                  onPress={() => {
                    const categories = martinMariettaDataService.getProductCategories();
                    Alert.alert(
                      'Filter by Product',
                      'Choose a product category',
                      [
                        { text: 'All Products', onPress: () => setSelectedProductCategory('all') },
                        ...categories.map(cat => ({
                          text: cat,
                          onPress: () => setSelectedProductCategory(cat)
                        })),
                        { text: 'Cancel', style: 'cancel' }
                      ]
                    );
                  }}
                >
                  <Text style={[styles.filterChipText, selectedProductCategory !== 'all' && styles.activeFilterChipText]}>
                    {selectedProductCategory === 'all' ? '🏗️ All Products' : `🏗️ ${selectedProductCategory}`}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Clear Filters */}
              {(facilitySearchQuery || selectedState !== 'all' || selectedProductCategory !== 'all') && (
                <TouchableOpacity 
                  style={styles.clearFiltersButton}
                  onPress={() => {
                    setFacilitySearchQuery('');
                    setSelectedState('all');
                    setSelectedProductCategory('all');
                  }}
                >
                  <Text style={styles.clearFiltersText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <ScrollView style={styles.facilityScrollView}>
              {/* All Facilities Option */}
              <TouchableOpacity
                style={[
                  styles.facilityOption,
                  selectedFacility === 'all' && styles.selectedFacilityOption
                ]}
                onPress={() => {
                  setSelectedFacility('all');
                  setShowFacilityModal(false);
                }}
              >
                <Text style={[
                  styles.facilityOptionText,
                  selectedFacility === 'all' && styles.selectedFacilityOptionText
                ]}>
                  🏢 All Facilities
                </Text>
                {selectedFacility === 'all' && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
              
              {/* Filtered Facilities */}
              {(() => {
                const filteredFacilities = getFilteredFacilities();
                if (filteredFacilities.length === 0) {
                  return (
                    <View style={styles.noResultsContainer}>
                      <Text style={styles.noResultsText}>No facilities match your search criteria</Text>
                      <Text style={styles.noResultsSubText}>Try adjusting your filters or search terms</Text>
                    </View>
                  );
                }

                // Group by state for display
                const groupedFacilities = {};
                filteredFacilities.forEach(facility => {
                  if (!groupedFacilities[facility.state]) {
                    groupedFacilities[facility.state] = [];
                  }
                  groupedFacilities[facility.state].push(facility);
                });

                return Object.entries(groupedFacilities)
                  .sort(([, a], [, b]) => b.length - a.length) // Sort states by facility count
                  .map(([state, facilities]) => (
                    <View key={state} style={styles.stateGroup}>
                      <Text style={styles.stateHeader}>{state} ({facilities.length} facilities)</Text>
                      {facilities.slice(0, 10).map(facility => (
                        <TouchableOpacity
                          key={facility.facilityId || facility.id}
                          style={[
                            styles.facilitySubOption,
                            selectedFacility === (selectedCustomer === 'martin-marietta' ? facility.facilityId?.toString() : facility.id) && styles.selectedFacilityOption
                          ]}
                          onPress={() => {
                            const facilityKey = selectedCustomer === 'martin-marietta' 
                              ? facility.facilityId.toString() 
                              : facility.id;
                            setSelectedFacility(facilityKey);
                            setShowFacilityModal(false);
                            // Clear filters when facility is selected
                            setFacilitySearchQuery('');
                            setSelectedState('all');
                            setSelectedProductCategory('all');
                          }}
                        >
                          <View style={styles.facilityInfo}>
                            <Text style={[
                              styles.facilityOptionText,
                              selectedFacility === (selectedCustomer === 'martin-marietta' ? facility.facilityId?.toString() : facility.id) && styles.selectedFacilityOptionText
                            ]}>
                              {facility.name}
                            </Text>
                            <Text style={[
                              styles.facilitySubText,
                              selectedFacility === (selectedCustomer === 'martin-marietta' ? facility.facilityId?.toString() : facility.id) && styles.selectedFacilitySubText
                            ]}>
                              {facility.city} • {facility.products?.join(', ') || Object.keys(facility.products || {}).length + ' products'}
                            </Text>
                          </View>
                          {selectedFacility === (selectedCustomer === 'martin-marietta' ? facility.facilityId?.toString() : facility.id) && (
                            <Text style={styles.checkmark}>✓</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                      {facilities.length > 10 && (
                        <Text style={styles.moreText}>... and {facilities.length - 10} more facilities in {state}</Text>
                      )}
                    </View>
                  ));
              })()}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowFacilityModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* State Selection Modal */}
      <Modal
        visible={showStateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by State</Text>
            
            <ScrollView style={styles.stateModalScrollView}>
              {/* All States Option */}
              <TouchableOpacity
                style={[
                  styles.facilityOption,
                  selectedState === 'all' && styles.selectedFacilityOption
                ]}
                onPress={() => {
                  setSelectedState('all');
                  setShowStateModal(false);
                }}
              >
                <Text style={[
                  styles.facilityOptionText,
                  selectedState === 'all' && styles.selectedFacilityOptionText
                ]}>
                  📍 All States
                </Text>
                {selectedState === 'all' && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>

              {/* State List */}
              {martinMariettaDataService.getAllStates().map(state => (
                <TouchableOpacity
                  key={state}
                  style={[
                    styles.facilityOption,
                    selectedState === state && styles.selectedFacilityOption
                  ]}
                  onPress={() => {
                    setSelectedState(state);
                    setShowStateModal(false);
                  }}
                >
                  <Text style={[
                    styles.facilityOptionText,
                    selectedState === state && styles.selectedFacilityOptionText
                  ]}>
                    {state} ({martinMariettaDataService.getFacilitiesByState(state).length} facilities)
                  </Text>
                  {selectedState === state && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowStateModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Customer Selection Modal */}
      <Modal
        visible={showCustomerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCustomerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Customer</Text>
            
            {customers.map((customer) => (
              <TouchableOpacity
                key={customer.id}
                style={[
                  styles.customerOption,
                  selectedCustomer === customer.id && styles.selectedCustomerOption
                ]}
                onPress={() => {
                  setSelectedCustomer(customer.id);
                  setShowCustomerModal(false);
                  // Reset facility selection when customer changes
                  setSelectedFacility('all');
                  setFacilitySearchQuery('');
                  setSelectedState('all');
                  setSelectedProductCategory('all');
                }}
              >
                <View style={styles.customerInfo}>
                  <Text style={[
                    styles.customerName,
                    selectedCustomer === customer.id && styles.selectedCustomerName
                  ]}>
                    {customer.name}
                  </Text>
                  <Text style={[
                    styles.customerSiteCount,
                    selectedCustomer === customer.id && styles.selectedCustomerSiteCount
                  ]}>
                    {Object.keys(customer.sites).length} sites
                  </Text>
                </View>
                <View 
                  style={[
                    styles.customerColorIndicator,
                    { backgroundColor: customer.color }
                  ]}
                />
                {selectedCustomer === customer.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowCustomerModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#2C3E50',
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  brandingRow: {
    marginBottom: 12,
    marginTop: 8,
  },
  customerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    color: '#3498DB',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  customerArrow: {
    color: '#3498DB',
    fontSize: 10,
    marginLeft: 6,
    marginTop: 1,
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 2,
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  territoryText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '400',
    flex: 1,
    marginBottom: 8,
  },
  roleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '600',
  },
  roleArrow: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 8,
    marginLeft: 4,
  },
  facilitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  facilityInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  facilityDetails: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '400',
    flex: 1,
  },
  facilityInfoButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  facilityInfoButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  projectSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  projectArrow: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginLeft: 8,
    marginTop: 2,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
  },
  simpleStats: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  simpleStatsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginBottom: 4,
  },
  criticalAlert: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  criticalAlertText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  restrictedAccessText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
  },
  priceManagementButton: {
    backgroundColor: 'rgba(39, 174, 96, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  priceManagementButtonText: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: 'bold',
  },
  statsScroll: {
    paddingLeft: 20,
  },
  statsContainer: {
    paddingRight: 20,
  },
  statCard: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryStatCard: {
    backgroundColor: '#3498DB',
  },
  secondaryStatCard: {
    backgroundColor: '#4CAF50',
  },
  warningStatCard: {
    backgroundColor: '#FFB74D',
  },
  dangerStatCard: {
    backgroundColor: '#FF6B6B',
  },
  infoStatCard: {
    backgroundColor: '#9B59B6',
  },
  primaryStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  primaryStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  secondaryStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  secondaryStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
  warningStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  warningStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
  dangerStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dangerStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
  infoStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  infoStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 14,
    color: '#5D6D7E',
    fontWeight: '500',
  },
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#E8EAED',
  },
  clearFiltersText: {
    fontSize: 12,
    color: '#5D6D7E',
    fontWeight: '600',
  },
  gridList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  gridContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8EAED',
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: width * 0.8,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  largeModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: width * 0.9,
    height: height * 0.8,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
    paddingBottom: 15,
  },
  facilityCount: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
    marginTop: 5,
  },
  facilityScrollView: {
    flex: 1,
    marginBottom: 20,
  },
  stateGroup: {
    marginBottom: 20,
  },
  stateHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  facilitySubOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
    marginLeft: 12,
    backgroundColor: 'rgba(52, 152, 219, 0.05)',
  },
  facilityInfo: {
    flex: 1,
  },
  facilitySubText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  selectedFacilitySubText: {
    color: 'rgba(255,255,255,0.8)',
  },
  moreText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontStyle: 'italic',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#2C3E50',
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  filterChip: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E8EAED',
    flex: 1,
  },
  activeFilterChip: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  filterChipText: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  clearFiltersButton: {
    alignSelf: 'center',
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 8,
  },
  clearFiltersText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  noResultsContainer: {
    padding: 30,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '600',
    textAlign: 'center',
  },
  noResultsSubText: {
    fontSize: 12,
    color: '#95A5A6',
    textAlign: 'center',
    marginTop: 5,
  },
  stateModalScrollView: {
    maxHeight: 300,
    marginBottom: 20,
  },
  customerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  selectedCustomerOption: {
    backgroundColor: '#3498DB',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
    marginBottom: 2,
  },
  selectedCustomerName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  customerSiteCount: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  selectedCustomerSiteCount: {
    color: 'rgba(255,255,255,0.8)',
  },
  customerColorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  roleModalSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 5,
  },
  roleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedRoleOption: {
    backgroundColor: '#3498DB',
    borderColor: '#2980B9',
  },
  roleOptionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  roleEmoji: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  roleInfo: {
    flex: 1,
  },
  roleOptionTitle: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  selectedRoleOptionTitle: {
    color: '#FFFFFF',
  },
  roleOptionDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    lineHeight: 16,
  },
  selectedRoleOptionDescription: {
    color: 'rgba(255,255,255,0.9)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 20,
  },
  facilityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedFacilityOption: {
    backgroundColor: '#3498DB',
  },
  facilityOptionText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  selectedFacilityOptionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  modalCancelText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  partnerLogoContainer: {
    marginLeft: 12,
  },
  partnerLogo: {
    width: 60,
    height: 20,
    opacity: 1.0,
    tintColor: '#FFFFFF',
  },
  gridItemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EnhancedDashboardScreen;