import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import customerDataService from '../services/customerDataService';

const { width } = Dimensions.get('window');

const PriceManagementScreen = ({ navigation }) => {
  const { canEditPrices, userRole } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('martin-marietta');
  const [loading, setLoading] = useState(true);
  const [priceChanges, setPriceChanges] = useState({});

  useEffect(() => {
    if (!canEditPrices()) {
      Alert.alert(
        'Access Denied',
        'You need Sales Manager permissions to manage pricing.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }
    
    loadPricingData();
  }, [canEditPrices]);

  const loadPricingData = () => {
    try {
      const allCustomers = customerDataService.getAllCustomers();
      setCustomers(allCustomers);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load pricing data:', error);
      Alert.alert('Error', 'Failed to load pricing information');
      navigation.goBack();
    }
  };

  const handlePriceChange = (customerId, siteId, productCode, newPrice) => {
    const key = `${customerId}_${siteId}_${productCode}`;
    setPriceChanges(prev => ({
      ...prev,
      [key]: parseFloat(newPrice) || 0
    }));
  };

  const savePriceChanges = async () => {
    if (Object.keys(priceChanges).length === 0) {
      Alert.alert('No Changes', 'No price changes to save.');
      return;
    }

    try {
      let successCount = 0;
      
      for (const [key, newPrice] of Object.entries(priceChanges)) {
        const [customerId, siteId, productCode] = key.split('_');
        const success = customerDataService.updateProductPrice(customerId, siteId, productCode, newPrice);
        if (success) successCount++;
      }

      Alert.alert(
        'Success',
        `Updated ${successCount} product prices successfully.`,
        [{ text: 'OK', onPress: () => {
          setPriceChanges({});
          loadPricingData(); // Refresh data
        }}]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update prices');
    }
  };

  const resetChanges = () => {
    setPriceChanges({});
    Alert.alert('Reset', 'All pending changes have been discarded.');
  };

  const getCurrentPrice = (customerId, siteId, productCode) => {
    const key = `${customerId}_${siteId}_${productCode}`;
    if (priceChanges.hasOwnProperty(key)) {
      return priceChanges[key];
    }
    
    const product = customerDataService.getProduct(customerId, siteId, productCode);
    return product?.pricePerUnit || 0;
  };

  const hasChanges = (customerId, siteId, productCode) => {
    const key = `${customerId}_${siteId}_${productCode}`;
    return priceChanges.hasOwnProperty(key);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading pricing data...</Text>
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
        <Text style={styles.headerTitle}>Price Management</Text>
        <Text style={styles.roleIndicator}>👨‍💼 Manager</Text>
      </View>

      {/* Customer Selection */}
      <View style={styles.customerTabs}>
        {customers.map(customer => (
          <TouchableOpacity
            key={customer.id}
            style={[
              styles.customerTab,
              selectedCustomer === customer.id && styles.selectedCustomerTab,
              { borderBottomColor: customer.color }
            ]}
            onPress={() => setSelectedCustomer(customer.id)}
          >
            <Text style={[
              styles.customerTabText,
              selectedCustomer === customer.id && styles.selectedCustomerTabText
            ]}>
              {customer.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Price Change Summary */}
        {Object.keys(priceChanges).length > 0 && (
          <View style={styles.changesSummary}>
            <Text style={styles.changesSummaryTitle}>
              Pending Changes ({Object.keys(priceChanges).length})
            </Text>
            <View style={styles.changesActions}>
              <TouchableOpacity style={styles.saveButton} onPress={savePriceChanges}>
                <Text style={styles.saveButtonText}>Save All Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resetButton} onPress={resetChanges}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Sites and Products */}
        {customers.find(c => c.id === selectedCustomer) && 
         Object.entries(customers.find(c => c.id === selectedCustomer).sites).map(([siteId, site]) => (
          <View key={siteId} style={styles.siteSection}>
            <View style={styles.siteHeader}>
              <Text style={styles.siteName}>{site.name}</Text>
              <Text style={styles.siteLocation}>{site.city}, {site.state}</Text>
            </View>
            
            <View style={styles.productsGrid}>
              {Object.entries(site.products).map(([productCode, product]) => {
                const currentPrice = getCurrentPrice(selectedCustomer, siteId, productCode);
                const hasChange = hasChanges(selectedCustomer, siteId, productCode);
                
                return (
                  <View key={productCode} style={[
                    styles.productCard,
                    hasChange && styles.productCardChanged
                  ]}>
                    <View style={styles.productHeader}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productCode}>#{productCode}</Text>
                    </View>
                    
                    <Text style={styles.productDescription}>{product.description}</Text>
                    <Text style={styles.productCapacity}>
                      Max: {product.maxCapacity.toLocaleString()} {product.unit}
                    </Text>
                    
                    <View style={styles.priceSection}>
                      <Text style={styles.priceLabel}>Price per {product.unit.slice(0, -1)}:</Text>
                      <View style={styles.priceInputContainer}>
                        <Text style={styles.priceCurrency}>$</Text>
                        <TextInput
                          style={[
                            styles.priceInput,
                            hasChange && styles.priceInputChanged
                          ]}
                          value={currentPrice.toString()}
                          onChangeText={(value) => handlePriceChange(selectedCustomer, siteId, productCode, value)}
                          keyboardType="numeric"
                          placeholder="0"
                        />
                        <Text style={styles.priceUnit}>/{product.unit.slice(0, -1)}</Text>
                      </View>
                    </View>
                    
                    {hasChange && (
                      <View style={styles.changeIndicator}>
                        <Text style={styles.changeIndicatorText}>
                          Modified (was ${product.pricePerUnit})
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}
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
    justifyContent: 'space-between',
  },
  backButton: {
    flex: 0.2,
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
    flex: 0.6,
    textAlign: 'center',
  },
  roleIndicator: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    flex: 0.2,
    textAlign: 'right',
  },
  customerTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  customerTab: {
    flex: 1,
    paddingVertical: 15,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    alignItems: 'center',
  },
  selectedCustomerTab: {
    borderBottomWidth: 3,
  },
  customerTabText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  selectedCustomerTabText: {
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  changesSummary: {
    backgroundColor: '#3498DB',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changesSummaryTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  changesActions: {
    flexDirection: 'row',
    gap: 10,
  },
  saveButton: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  siteSection: {
    marginBottom: 25,
  },
  siteHeader: {
    marginBottom: 15,
  },
  siteName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  siteLocation: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  productsGrid: {
    gap: 15,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#E8EAED',
  },
  productCardChanged: {
    borderLeftColor: '#3498DB',
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.3)',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  productCode: {
    fontSize: 12,
    color: '#7F8C8D',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontWeight: '600',
  },
  productDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  productCapacity: {
    fontSize: 11,
    color: '#95A5A6',
    marginBottom: 15,
  },
  priceSection: {
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '600',
    marginBottom: 8,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  priceCurrency: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: 'bold',
    marginRight: 5,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  priceInputChanged: {
    color: '#3498DB',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  priceUnit: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 5,
  },
  changeIndicator: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  changeIndicatorText: {
    fontSize: 10,
    color: '#3498DB',
    fontWeight: 'bold',
  },
});

export default PriceManagementScreen;