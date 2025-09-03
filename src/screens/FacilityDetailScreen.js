import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import martinMariettaDataService from '../services/martinMariettaData';

const { width } = Dimensions.get('window');

const FacilityDetailScreen = ({ route, navigation }) => {
  const { facilityId } = route.params;
  const [facility, setFacility] = useState(null);
  const [bays, setBays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFacilityData();
  }, [facilityId]);

  const loadFacilityData = () => {
    try {
      const facilityData = martinMariettaDataService.getFacilityById(parseInt(facilityId));
      const facilityBays = martinMariettaDataService.generateFacilityBays(parseInt(facilityId));
      
      setFacility(facilityData);
      setBays(facilityBays);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load facility data:', error);
      Alert.alert('Error', 'Failed to load facility information');
      navigation.goBack();
    }
  };

  const handlePhoneCall = (phoneNumber) => {
    if (!phoneNumber) {
      Alert.alert('No Phone Number', 'Phone number not available for this contact.');
      return;
    }
    const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
    Linking.openURL(`tel:${cleanPhone}`);
  };

  const handleEmail = (email) => {
    if (!email) {
      Alert.alert('No Email', 'Email address not available for this contact.');
      return;
    }
    Linking.openURL(`mailto:${email}`);
  };

  const handleWebsite = () => {
    if (facility?.hyperlink) {
      Linking.openURL(facility.hyperlink);
    } else {
      Alert.alert('No Website', 'Website not available for this facility.');
    }
  };

  const getDirections = () => {
    if (facility?.latitude && facility?.longitude) {
      const url = `maps:${facility.latitude},${facility.longitude}`;
      Linking.openURL(url);
    } else {
      Alert.alert('No Location', 'GPS coordinates not available for this facility.');
    }
  };

  if (loading || !facility) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading facility details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Facility Details</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Facility Name & Location */}
        <View style={styles.facilityHeader}>
          <Text style={styles.facilityName}>{facility.name}</Text>
          <Text style={styles.facilityAddress}>
            {facility.address}{facility.address && facility.city && ', '}
            {facility.city}{facility.city && facility.state && ', '}
            {facility.state} {facility.zip}
          </Text>
          <View style={styles.locationButtons}>
            <TouchableOpacity style={styles.directionsButton} onPress={getDirections}>
              <Text style={styles.directionsButtonText}>📍 Get Directions</Text>
            </TouchableOpacity>
            {facility.hyperlink && (
              <TouchableOpacity style={styles.websiteButton} onPress={handleWebsite}>
                <Text style={styles.websiteButtonText}>🌐 Website</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          {/* Primary Contact */}
          <View style={styles.contactCard}>
            <Text style={styles.contactType}>Primary Contact</Text>
            <Text style={styles.contactName}>
              {facility.contactName || 'Contact Available'}
              {facility.contactTitle && ` (${facility.contactTitle})`}
            </Text>
            <View style={styles.contactActions}>
              {facility.contactPhone && (
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={() => handlePhoneCall(facility.contactPhone)}
                >
                  <Text style={styles.contactButtonText}><Icon name="phone" size={14} color="#FFFFFF" /> {facility.contactPhone}</Text>
                </TouchableOpacity>
              )}
              {facility.contactEmail && (
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={() => handleEmail(facility.contactEmail)}
                >
                  <Text style={styles.contactButtonText}>✉️ {facility.contactEmail}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Secondary Contact */}
          {facility.secondaryContactName && (
            <View style={styles.contactCard}>
              <Text style={styles.contactType}>Secondary Contact</Text>
              <Text style={styles.contactName}>
                {facility.secondaryContactName}
                {facility.secondaryContactTitle && ` (${facility.secondaryContactTitle})`}
              </Text>
              <View style={styles.contactActions}>
                {facility.secondaryContactPhone && (
                  <TouchableOpacity 
                    style={styles.contactButton}
                    onPress={() => handlePhoneCall(facility.secondaryContactPhone)}
                  >
                    <Text style={styles.contactButtonText}><Icon name="phone" size={14} color="#FFFFFF" /> {facility.secondaryContactPhone}</Text>
                  </TouchableOpacity>
                )}
                {facility.secondaryContactEmail && (
                  <TouchableOpacity 
                    style={styles.contactButton}
                    onPress={() => handleEmail(facility.secondaryContactEmail)}
                  >
                    <Text style={styles.contactButtonText}>✉️ {facility.secondaryContactEmail}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Sales Contact */}
          {facility.salesDistributionEmail && (
            <View style={styles.contactCard}>
              <Text style={styles.contactType}>Sales Contact</Text>
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => handleEmail(facility.salesDistributionEmail)}
              >
                <Text style={styles.contactButtonText}>✉️ {facility.salesDistributionEmail}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Operations Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operations</Text>
          <View style={styles.infoCard}>
            {facility.hoursOfOperation && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Hours:</Text>
                <Text style={styles.infoValue}>{facility.hoursOfOperation}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Railway Access:</Text>
              <Text style={styles.infoValue}>{facility.railwayAccess ? 'Yes' : 'No'}</Text>
            </View>
            {facility.divisionName && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Division:</Text>
                <Text style={styles.infoValue}>{facility.divisionName}</Text>
              </View>
            )}
            {facility.districtName && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>District:</Text>
                <Text style={styles.infoValue}>{facility.districtName}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Products Available */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Materials Available</Text>
          <View style={styles.productsContainer}>
            {facility.detailedProducts?.length > 0 ? (
              facility.detailedProducts.map((product, index) => (
                <View key={product.code || index} style={styles.productCard}>
                  <View style={styles.productHeader}>
                    <Text style={styles.productCode}>#{product.code}</Text>
                    <Text style={styles.productCategory}>{product.category}</Text>
                  </View>
                  <Text style={styles.productDescription}>{product.description}</Text>
                  {product.notes && (
                    <Text style={styles.productNotes}>{product.notes}</Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.noProducts}>Product details not available</Text>
            )}
          </View>
        </View>

        {/* Current Inventory Bays */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Inventory ({bays.length} bays)</Text>
          <View style={styles.baysContainer}>
            {bays.map((bay, index) => (
              <TouchableOpacity 
                key={bay.uniqueId || index}
                style={styles.bayCard}
                onPress={() => {
                  navigation.navigate('BayDetail', {
                    bayName: bay.name,
                    currentRecord: bay
                  });
                }}
              >
                <Text style={styles.bayName}>{bay.name}</Text>
                <Text style={styles.bayMaterial}>{bay.materialType}</Text>
                <View style={styles.bayStats}>
                  <Text style={styles.bayVolume}>
                    {parseInt(bay.volume).toLocaleString()} / {parseInt(bay.maxVolume).toLocaleString()} {bay.unitType}
                  </Text>
                  <Text style={styles.bayPrice}>${bay.pricePerTon}/{bay.unitType === 'cubic yards' ? 'cy' : 'ton'}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
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
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#2C3E50',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  facilityHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  facilityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  facilityAddress: {
    fontSize: 16,
    color: '#7F8C8D',
    lineHeight: 24,
    marginBottom: 15,
  },
  locationButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  directionsButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
  },
  directionsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  websiteButton: {
    backgroundColor: '#9B59B6',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
  },
  websiteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  contactType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3498DB',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  contactActions: {
    gap: 8,
  },
  contactButton: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
  },
  contactButtonText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F6',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  infoValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  productsContainer: {
    gap: 12,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  productCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7F8C8D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 5,
  },
  productNotes: {
    fontSize: 12,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  noProducts: {
    fontSize: 14,
    color: '#7F8C8D',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  baysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    width: (width - 60) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bayName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  bayMaterial: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  bayStats: {
    gap: 4,
  },
  bayVolume: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '500',
  },
  bayPrice: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default FacilityDetailScreen;