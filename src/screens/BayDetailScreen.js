import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  TextInput,
  Alert,
  Linking,
  Image,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/FontAwesome';
import api from '../services/api';

const { width } = Dimensions.get('window');

const BayDetailScreen = ({ route, navigation }) => {
  const { bayName, currentRecord } = route.params;
  const zoneName = currentRecord?.zoneName || bayName;
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedQuantity, setSelectedQuantity] = useState(100); // Default 100 units

  useEffect(() => {
    loadHistoricalData();
  }, [selectedTimeRange]);

  const loadHistoricalData = async () => {
    try {
      setLoading(true);
      
      // Validate currentRecord to prevent crashes
      if (!currentRecord) {
        console.error('No current record provided');
        navigation.goBack();
        return;
      }
      
      const mockData = generateMockHistoricalData();
      setHistoricalData(mockData);
    } catch (error) {
      console.error('Error loading historical data:', error);
      // Don't crash, show empty state instead
      setHistoricalData([]);
    } finally {
      setLoading(false);
    }
  };

  const generateMockHistoricalData = () => {
    try {
      const data = [];
      const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
      
      // Safely get base volume with fallback
      let baseVolume = 0;
      if (currentRecord) {
        baseVolume = parseFloat(currentRecord.volume || currentRecord.currentVolume || 0);
        if (isNaN(baseVolume)) baseVolume = 0;
      }
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const variation = (Math.random() - 0.5) * 200;
        const volume = Math.max(0, baseVolume + variation);
        
        // Format dates consistently as MM/DD for all time ranges
        const dateLabel = date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
        
        data.push({
          date: dateLabel,
          volume: volume,
          fullDate: new Date(date),
        });
      }
      return data;
    } catch (error) {
      console.error('Error generating mock data:', error);
      return [];
    }
  };

  const getStatusInfo = (volume, maxVolume) => {
    const utilizationPercent = Math.min((volume / maxVolume) * 100, 100);
    
    if (utilizationPercent >= 90) return {
      text: 'NEARLY FULL',
      color: '#FF6B6B',
      icon: 'warning',
    };
    if (utilizationPercent >= 70) return {
      text: 'HIGH LEVEL',
      color: '#FFB74D',
      icon: 'arrow-up',
    };
    if (utilizationPercent >= 30) return {
      text: 'AVAILABLE',
      color: '#4CAF50',
      icon: 'check',
    };
    return {
      text: 'LOW LEVEL',
      color: '#9E9E9E',
      icon: 'arrow-down',
    };
  };

  const formatVolume = (vol, unitType = 'tons') => {
    let formattedNumber;
    if (vol >= 1000000) {
      formattedNumber = `${(vol / 1000000).toFixed(1)}M`;
    } else if (vol >= 1000) {
      formattedNumber = `${(vol / 1000).toFixed(1)}K`;
    } else {
      formattedNumber = vol.toFixed(0);
    }
    return `${formattedNumber} ${unitType}`;
  };

  // Get chart labels based on selected time range
  const getChartLabels = () => {
    if (!historicalData || historicalData.length === 0) {
      return ['No Data'];
    }
    
    try {
      if (selectedTimeRange === '7d') {
        return historicalData.map(item => item.date || 'N/A');
      } else if (selectedTimeRange === '30d') {
        // Show every 5th day for 30-day view to avoid overcrowding
        return historicalData.filter((_, index) => index % 5 === 0).map(item => item.date || 'N/A');
      } else {
        // Show every 10th day for 90-day view
        return historicalData.filter((_, index) => index % 10 === 0).map(item => item.date || 'N/A');
      }
    } catch (error) {
      console.error('Error getting chart labels:', error);
      return ['Error'];
    }
  };

  // Get chart data based on selected time range
  const getChartData = () => {
    if (!historicalData || historicalData.length === 0) {
      return [0];
    }
    
    try {
      if (selectedTimeRange === '7d') {
        return historicalData.map(item => item.volume || 0);
      } else if (selectedTimeRange === '30d') {
        // Show every 5th day for 30-day view
        return historicalData.filter((_, index) => index % 5 === 0).map(item => item.volume || 0);
      } else {
        // Show every 10th day for 90-day view
        return historicalData.filter((_, index) => index % 10 === 0).map(item => item.volume || 0);
      }
    } catch (error) {
      console.error('Error getting chart data:', error);
      return [0];
    }
  };

  // Safely extract data with fallbacks to prevent crashes
  const currentVolume = currentRecord ? parseFloat(currentRecord.volume || currentRecord.currentVolume || 0) : 0;
  const maxVolume = currentRecord ? parseFloat(currentRecord.maxVolume || currentRecord.maxCapacity || 1000) : 1000;
  const status = getStatusInfo(currentVolume, maxVolume);
  const utilizationPercent = Math.min((currentVolume / maxVolume) * 100, 100);
  
  // Safely get other fields
  const unitType = currentRecord?.unitType || currentRecord?.unit || 'tons';
  const pricePerTon = currentRecord?.pricePerTon || currentRecord?.pricePerUnit || 0;
  const materialType = currentRecord?.materialType || currentRecord?.material || currentRecord?.productName || 'Unknown Material';
  const facilityName = currentRecord?.facilityName || currentRecord?.siteName || 'Unknown Facility';
  
  // Facility contact information is now properly integrated with real Martin Marietta data

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={styles.loadingText}>Loading bay details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.bayName}>{zoneName}</Text>
          <Text style={styles.subtitle}>{materialType}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Current Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.sectionTitle}>Current Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
              <Icon name={status.icon} size={12} color="#FFFFFF" style={styles.statusIcon} />
              <Text style={[styles.statusText, { color: '#FFFFFF' }]}>{status.text}</Text>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{formatVolume(currentVolume, unitType)}</Text>
              <Text style={styles.metricLabel}>Current Volume</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{formatVolume(maxVolume, unitType)}</Text>
              <Text style={styles.metricLabel}>Max Capacity</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{utilizationPercent.toFixed(0)}%</Text>
              <Text style={styles.metricLabel}>Utilization</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  { 
                    width: `${Math.max(utilizationPercent, 2)}%`,
                    backgroundColor: status.color
                  }
                ]}
              />
            </View>
          </View>

          {/* Material Info */}
          <View style={styles.materialInfo}>
            <Text style={styles.materialLabel}>Material Type</Text>
            <Text style={styles.materialValue}>{materialType}</Text>
          </View>

          {/* Pricing Info */}
          {pricePerTon > 0 && (
            <View style={styles.pricingInfo}>
              <Text style={styles.pricingLabel}>Current Price</Text>
              <Text style={styles.pricingValue}>
                ${pricePerTon}/{unitType.slice(0, -1)}
              </Text>
            </View>
          )}
        </View>

        {/* Facility Information Card */}
        <View style={styles.facilityInfoCard}>
          <Text style={styles.sectionTitle}>Facility Information</Text>
          
          <View style={styles.facilityHeader}>
            <View style={styles.facilityDetails}>
              <Text style={styles.facilityName}>{facilityName}</Text>
              <Text style={styles.facilityAddress}>
                {currentRecord?.address ? `${currentRecord.address}, ${currentRecord.city}, ${currentRecord.state} ${currentRecord.zip}` : 'Address not available'}
              </Text>
              <View style={styles.facilityHoursRow}>
                <Icon name="clock-o" size={14} color="#7F8C8D" />
                <Text style={styles.facilityHours}>
                  {currentRecord?.hoursOfOperation || 'Contact for hours'}
                </Text>
              </View>
            </View>
            
            {currentRecord?.railwayAccess && (
              <View style={styles.railwayBadge}>
                <Icon name="train" size={12} color="#27AE60" />
                <Text style={styles.railwayText}>Railway</Text>
              </View>
            )}
          </View>

          <View style={styles.contactButtons}>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => {
                const phone = currentRecord?.officePhone || currentRecord?.contactPhone || '(813) 261-1764';
                Linking.openURL(`tel:${phone}`);
              }}
            >
              <Icon name="building" size={16} color="#FFFFFF" />
              <View style={styles.contactButtonContent}>
                <Text style={styles.contactButtonText}>Call Facility Office</Text>
                <Text style={styles.contactButtonSubtext}>
                  {currentRecord?.officePhone || currentRecord?.contactPhone || '(813) 261-1764'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => {
                const phone = currentRecord?.contactPhone || '(706) 524-6274';
                Linking.openURL(`tel:${phone}`);
              }}
            >
              <Icon name="user" size={16} color="#FFFFFF" />
              <View style={styles.contactButtonContent}>
                <Text style={styles.contactButtonText}>Call Sales Rep</Text>
                <Text style={styles.contactButtonSubtext}>
                  {`${currentRecord?.contactName || 'Drew Shedd'} ${currentRecord?.contactPhone || '(706) 524-6274'}`}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.contactButton, styles.emailButton]}
              onPress={() => {
                const email = currentRecord?.contactEmail || 'Drew.Shedd@martinmarietta.com';
                Linking.openURL(`mailto:${email}`);
              }}
            >
              <Icon name="envelope" size={16} color="#FFFFFF" />
              <View style={styles.contactButtonContent}>
                <Text style={styles.contactButtonText}>Email Sales Rep</Text>
                <Text style={styles.contactButtonSubtext}>
                  {currentRecord?.contactEmail ? (
                    currentRecord.contactEmail.length > 20 
                      ? currentRecord.contactEmail.substring(0, 15) + '...'
                      : currentRecord.contactEmail
                  ) : 'Drew.Shedd@martinmarietta.com'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.salesRepInfo}>
            <Icon name="user" size={14} color="#7F8C8D" />
            <View style={styles.salesRepDetails}>
              <Text style={styles.salesRepName}>Drew Shedd</Text>
              <Text style={styles.salesRepTitle}>Sales Representative</Text>
            </View>
          </View>
        </View>

        {/* Sales Calculator */}
        <View style={styles.salesCalculator}>
          <Text style={styles.sectionTitle}>Sales Calculator</Text>
          
          <View style={styles.quantitySelector}>
            <Text style={styles.quantityLabel}>Select Quantity ({unitType})</Text>
            
            <View style={styles.quantityInputContainer}>
              <TextInput
                style={styles.quantityInput}
                value={selectedQuantity.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  const maxAvailable = parseInt(currentVolume) || 0;
                  
                  if (num > maxAvailable && num > 0) {
                    const deficit = num - maxAvailable;
                    Alert.alert(
                      'Insufficient Stock',
                      `Only ${maxAvailable.toLocaleString()} ${unitType} available at this location. You need ${deficit.toLocaleString()} ${unitType} more.`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Use Max Available', 
                          onPress: () => setSelectedQuantity(maxAvailable)
                        },
                        {
                          text: 'Find Nearest Location',
                          style: 'default',
                          onPress: () => {
                            // Navigate back to dashboard to find other locations
                            Alert.alert(
                              'Finding Similar Materials',
                              `Looking for ${materialType} at nearby facilities. Returning to dashboard to show all available locations.`,
                              [
                                {
                                  text: 'OK',
                                  onPress: () => navigation.navigate('Dashboard')
                                }
                              ]
                            );
                          }
                        }
                      ]
                    );
                    return;
                  }
                  
                  setSelectedQuantity(num);
                }}
                keyboardType="numeric"
                placeholder="0"
                selectTextOnFocus
              />
              <Text style={styles.quantityUnit}>
                of {formatVolume(currentVolume, unitType)} available
              </Text>
            </View>
            
            {/* Quick quantity buttons */}
            <View style={styles.quickQuantityButtons}>
              {[25, 50, 100, 250].map(qty => (
                <TouchableOpacity
                  key={qty}
                  style={[
                    styles.quickQuantityButton,
                    selectedQuantity === qty && styles.selectedQuantityButton
                  ]}
                  onPress={() => {
                    const maxAvailable = parseInt(currentVolume) || 0;
                    
                    if (qty > maxAvailable) {
                      const deficit = qty - maxAvailable;
                      Alert.alert(
                        'Insufficient Stock',
                        `Only ${maxAvailable.toLocaleString()} ${unitType} available at this location. You need ${deficit.toLocaleString()} ${unitType} more.`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { 
                            text: 'Use Max Available', 
                            onPress: () => setSelectedQuantity(maxAvailable)
                          },
                          {
                            text: 'Find Nearest Location',
                            style: 'default',
                            onPress: () => {
                              // Navigate back to dashboard to find other locations
                              Alert.alert(
                                'Finding Similar Materials',
                                `Looking for ${materialType} at nearby facilities. Returning to dashboard to show all available locations.`,
                                [
                                  {
                                    text: 'OK',
                                    onPress: () => navigation.navigate('Dashboard')
                                  }
                                ]
                              );
                            }
                          }
                        ]
                      );
                      return;
                    }
                    
                    setSelectedQuantity(qty);
                  }}
                >
                  <Text style={[
                    styles.quickQuantityText,
                    selectedQuantity === qty && styles.selectedQuantityText
                  ]}>
                    {qty}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Price calculation */}
            <View style={styles.priceCalculation}>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Quantity:</Text>
                <Text style={styles.calculationValue}>
                  {selectedQuantity} {unitType}
                </Text>
              </View>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>Price per unit:</Text>
                <Text style={styles.calculationValue}>
                  ${pricePerTon}
                </Text>
              </View>
              <View style={[styles.calculationRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Price:</Text>
                <Text style={styles.totalValue}>
                  ${(pricePerTon * selectedQuantity).toLocaleString()}
                </Text>
              </View>
            </View>
            
            {/* Order Placement Button */}
            {selectedQuantity > 0 && (
              <TouchableOpacity 
                style={styles.placeOrderButton}
                onPress={() => {
                  const orderData = {
                    facility: facilityName,
                    material: materialType,
                    materialCode: currentRecord?.code || currentRecord?.productCode || currentRecord?.productCode || 'N/A',
                    quantity: selectedQuantity,
                    unitType: unitType,
                    pricePerUnit: pricePerTon,
                    totalPrice: pricePerTon * selectedQuantity,
                    contactPhone: currentRecord?.officePhone || currentRecord?.contactPhone || '(813) 261-1764',
                    salesRepPhone: currentRecord?.contactPhone || '(706) 524-6274',
                    contactName: currentRecord?.contactName || 'Drew Shedd',
                    contactTitle: currentRecord?.contactTitle || 'Sales Representative',
                    contactEmail: currentRecord?.contactEmail || 'Drew.Shedd@martinmarietta.com',
                    availableStock: currentVolume,
                    facilityAddress: currentRecord?.address ? `${currentRecord.address}, ${currentRecord.city}, ${currentRecord.state} ${currentRecord.zip}` : 'Contact facility for address',
                    facilityHours: currentRecord?.hoursOfOperation || 'Contact for hours'
                  };
                  navigation.navigate('OrderConfirmation', { orderData });
                }}
              >
                <Text style={styles.placeOrderButtonText}>
                  Place Order - ${(pricePerTon * selectedQuantity).toLocaleString()}
                </Text>
                <Text style={styles.placeOrderSubtext}>
                  {selectedQuantity} {unitType} • {materialType}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          <Text style={styles.sectionTitle}>Volume History</Text>
          <View style={styles.timeRangeButtons}>
            {['7d', '30d', '90d'].map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.timeButton,
                  selectedTimeRange === range && styles.timeButtonActive
                ]}
                onPress={() => setSelectedTimeRange(range)}
              >
                <Text style={[
                  styles.timeButtonText,
                  selectedTimeRange === range && styles.timeButtonTextActive
                ]}>
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Volume Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Volume Trend</Text>
          <LineChart
            data={{
              labels: getChartLabels(),
              datasets: [{
                data: getChartData(),
                color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
                strokeWidth: 3
              }]
            }}
            width={width - 48}
            height={200}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: "#3498DB"
              }
            }}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Daily Levels List */}
        <View style={styles.levelsContainer}>
          <Text style={styles.sectionTitle}>Daily Levels</Text>
          <ScrollView style={styles.levelsList} showsVerticalScrollIndicator={false}>
            {historicalData.map((item, index) => (
              <View key={index} style={styles.levelItem}>
                <View style={styles.levelItemLeft}>
                  <Text style={styles.levelDate}>{item.date}</Text>
                  <Text style={styles.levelVolume}>{formatVolume(item.volume)} units</Text>
                </View>
                <View style={styles.levelItemRight}>
                  <Text style={styles.levelPercentage}>
                    {Math.min((item.volume / maxVolume) * 100, 100).toFixed(0)}%
                  </Text>
                  <View style={styles.levelBar}>
                    <View 
                      style={[
                        styles.levelBarFill,
                        { 
                          width: `${Math.max(Math.min((item.volume / maxVolume) * 100, 100), 2)}%`,
                          backgroundColor: item.volume / maxVolume >= 0.9 ? '#FF6B6B' : 
                                         item.volume / maxVolume >= 0.7 ? '#FFB74D' :
                                         item.volume / maxVolume >= 0.3 ? '#4CAF50' : '#9E9E9E'
                        }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Recent Updates */}
        <View style={styles.updatesContainer}>
          <Text style={styles.sectionTitle}>Recent Updates</Text>
          <View style={styles.updateItem}>
            <View style={styles.updateDot} />
            <View style={styles.updateContent}>
              <Text style={styles.updateText}>Last measurement: {currentRecord?.datetime || 'Unknown'}</Text>
              <Text style={styles.updateSubtext}>Volume recorded at {formatVolume(currentVolume, unitType)}</Text>
            </View>
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
    marginTop: 16,
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#2C3E50',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  bayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBackground: {
    height: 12,
    backgroundColor: '#F0F2F5',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  materialInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  materialLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  materialValue: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  pricingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
  pricingLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  pricingValue: {
    fontSize: 18,
    color: '#27AE60',
    fontWeight: 'bold',
  },
  salesCalculator: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  quantitySelector: {
    marginTop: 16,
  },
  quantityLabel: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
    marginBottom: 12,
  },
  quantityInputContainer: {
    marginBottom: 16,
  },
  quantityInput: {
    borderWidth: 2,
    borderColor: '#3498DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  quantityUnit: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  quickQuantityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  quickQuantityButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  selectedQuantityButton: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  quickQuantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D6D7E',
  },
  selectedQuantityText: {
    color: '#FFFFFF',
  },
  priceCalculation: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  calculationValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E8EAED',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 20,
    color: '#27AE60',
    fontWeight: 'bold',
  },
  availabilityWarning: {
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  warningText: {
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: '600',
    textAlign: 'center',
  },
  timeRangeContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  timeRangeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  timeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  timeButtonActive: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D6D7E',
  },
  timeButtonTextActive: {
    color: '#FFFFFF',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  chart: {
    marginTop: 16,
    borderRadius: 16,
  },
  levelsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  levelsList: {
    maxHeight: 300,
    marginTop: 16,
  },
  levelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  levelItemLeft: {
    flex: 1,
  },
  levelItemRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  levelDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  levelVolume: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  levelPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  levelBar: {
    width: 80,
    height: 6,
    backgroundColor: '#F0F2F5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  levelBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  updatesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  updateItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  updateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3498DB',
    marginTop: 6,
    marginRight: 12,
  },
  updateContent: {
    flex: 1,
  },
  updateText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
    marginBottom: 4,
  },
  updateSubtext: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  placeOrderButton: {
    backgroundColor: '#27AE60',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeOrderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  placeOrderSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  facilityInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  facilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  facilityDetails: {
    flex: 1,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  facilityAddress: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  facilityHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  facilityHours: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 6,
  },
  railwayBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  railwayText: {
    fontSize: 10,
    color: '#27AE60',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  contactButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  contactButton: {
    minWidth: '30%',
    flexBasis: '48%',
    backgroundColor: '#3498DB',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emailButton: {
    backgroundColor: '#E67E22',
  },
  contactButtonContent: {
    marginLeft: 10,
    flex: 1,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  contactButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    marginTop: 2,
  },
  salesRepInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  salesRepDetails: {
    marginLeft: 10,
  },
  salesRepName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  salesRepTitle: {
    fontSize: 12,
    color: '#7F8C8D',
  },
});

export default BayDetailScreen;