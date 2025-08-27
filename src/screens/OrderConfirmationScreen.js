import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
  TextInput,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const OrderConfirmationScreen = ({ route, navigation }) => {
  const { orderData } = route.params;
  const { user } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [orderNumber] = useState(() => `MM${Date.now().toString().slice(-8)}`);
  const [showEmailDemo, setShowEmailDemo] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const sendOrder = () => {
    // Validate required fields
    if (!customerName.trim()) {
      Alert.alert('Missing Information', 'Please enter the customer contact name.');
      return;
    }
    
    if (!deliveryAddress.trim()) {
      Alert.alert('Missing Information', 'Please enter the delivery address.');
      return;
    }
    
    setShowEmailDemo(true);
    
    // Simulate order processing
    setTimeout(() => {
      Alert.alert(
        'Order Submitted Successfully',
        `Order #${orderNumber} has been sent to ${orderData.contactEmail}\n\nThe facility will confirm availability and delivery details within 2 business hours.`,
        [
          {
            text: 'View Email Demo',
            onPress: () => setShowEmailDemo(true)
          },
          {
            text: 'Back to Dashboard',
            onPress: () => navigation.navigate('Dashboard'),
            style: 'default'
          }
        ]
      );
    }, 1500);
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString()}`;
  };

  const generateEmailContent = () => {
    const now = new Date();
    const deliveryDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
    
    return `Subject: New Order Request - #${orderNumber} - ${orderData.material}

Dear ${orderData.facility} Sales Team,

We have received a new order request from ${user?.name || 'Sales Agent'}:

ORDER DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order Number: ${orderNumber}
Date: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}

MATERIAL INFORMATION:
Product: ${orderData.material}
Product Code: ${orderData.materialCode}
Requested Quantity: ${orderData.quantity.toLocaleString()} ${orderData.unitType}
Price per Unit: ${formatCurrency(orderData.pricePerUnit)}
Total Order Value: ${formatCurrency(orderData.totalPrice)}

FACILITY INFORMATION:
Location: ${orderData.facility}
Address: ${orderData.facilityAddress}
Phone: ${orderData.contactPhone}
Email: ${orderData.contactEmail}
Hours: ${orderData.facilityHours}
Available Stock: ${orderData.availableStock.toLocaleString()} ${orderData.unitType}

CUSTOMER INFORMATION:
Sales Agent: ${user?.name || 'Unknown'}
Company: Martin Marietta Sales
Customer Name: ${customerName || 'To be confirmed'}
Customer Company: ${customerCompany || 'To be confirmed'}
Customer Phone: ${customerPhone || 'To be confirmed'}
Delivery Address: ${deliveryAddress || 'To be confirmed'}
Request Date: ${now.toLocaleDateString()}
Estimated Delivery: ${deliveryDate.toLocaleDateString()}

SPECIAL INSTRUCTIONS:
${specialInstructions || 'None specified'}

NEXT STEPS:
1. Confirm material availability
2. Schedule pickup/delivery
3. Send confirmation to sales agent
4. Update inventory system

Please confirm this order and provide delivery details within 2 business hours.

Best regards,
Quvo Sales System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is an automated message from the Quvo Sales Application.
For questions, please contact the sales agent directly.`;
  };

  if (showEmailDemo) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2C3E50" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => setShowEmailDemo(false)} 
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Email Demo</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Dashboard')} 
            style={styles.closeButton}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.emailContainer}>
          <View style={styles.emailHeader}>
            <Text style={styles.emailTitle}>📧 Order Email Sent</Text>
            <Text style={styles.emailSubtitle}>To: {orderData.contactEmail}</Text>
            <Text style={styles.emailTimestamp}>
              Sent: {new Date().toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.emailContent}>
            <Text style={styles.emailText}>{generateEmailContent()}</Text>
          </View>
          
          <View style={styles.emailActions}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <Text style={styles.primaryButtonText}>Back to Dashboard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => setShowEmailDemo(false)}
            >
              <Text style={styles.secondaryButtonText}>Back to Order</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
        <Text style={styles.headerTitle}>Order Confirmation</Text>
        <View style={styles.placeholder} />
      </View>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Success Icon */}
          <View style={styles.successIcon}>
            <Text style={styles.successText}>✓</Text>
          </View>

          {/* Order Summary Card */}
          <View style={styles.orderCard}>
            <Text style={styles.orderTitle}>Order Summary</Text>
            <Text style={styles.orderNumber}>Order #: {orderNumber}</Text>
            
            <View style={styles.divider} />
            
            <View style={styles.orderDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Material:</Text>
                <Text style={styles.detailValue}>{orderData.material}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Product Code:</Text>
                <Text style={styles.detailValue}>{orderData.materialCode}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Quantity:</Text>
                <Text style={styles.detailValue}>
                  {orderData.quantity.toLocaleString()} {orderData.unitType}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Unit Price:</Text>
                <Text style={styles.detailValue}>
                  {formatCurrency(orderData.pricePerUnit)}
                </Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={[styles.detailRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(orderData.totalPrice)}
                </Text>
              </View>
            </View>
          </View>

          {/* Facility Info Card */}
          <View style={styles.facilityCard}>
            <Text style={styles.facilityTitle}>Facility Information</Text>
            
            <View style={styles.facilityDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location:</Text>
                <Text style={styles.detailValue}>{orderData.facility}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address:</Text>
                <Text style={styles.detailValue}>{orderData.facilityAddress}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>{orderData.contactPhone}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{orderData.contactEmail}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Hours:</Text>
                <Text style={styles.detailValue}>{orderData.facilityHours}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Available Stock:</Text>
                <Text style={styles.detailValue}>
                  {orderData.availableStock.toLocaleString()} {orderData.unitType}
                </Text>
              </View>
            </View>
          </View>

          {/* Customer Information Form */}
          <View style={styles.customerFormCard}>
            <Text style={styles.customerFormTitle}>Customer & Delivery Information</Text>
            
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Contact Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="John Smith"
                  placeholderTextColor="#95A5A6"
                />
              </View>
              
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Company</Text>
                <TextInput
                  style={styles.formInput}
                  value={customerCompany}
                  onChangeText={setCustomerCompany}
                  placeholder="ABC Construction"
                  placeholderTextColor="#95A5A6"
                />
              </View>
            </View>
            
            <View style={styles.formFieldFull}>
              <Text style={styles.formLabel}>Delivery Address *</Text>
              <TextInput
                style={styles.formInput}
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                placeholder="123 Construction Site Rd, Tampa, FL 33602"
                placeholderTextColor="#95A5A6"
                multiline={true}
                numberOfLines={2}
              />
            </View>
            
            <View style={styles.formFieldFull}>
              <Text style={styles.formLabel}>Customer Phone</Text>
              <TextInput
                style={styles.formInput}
                value={customerPhone}
                onChangeText={setCustomerPhone}
                placeholder="(813) 555-0123"
                placeholderTextColor="#95A5A6"
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.formFieldFull}>
              <Text style={styles.formLabel}>Special Instructions</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                placeholder="Delivery preferences, site access instructions, etc."
                placeholderTextColor="#95A5A6"
                multiline={true}
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Order Status */}
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>📋 Next Steps</Text>
            <View style={styles.statusSteps}>
              <View style={styles.statusStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>Order will be sent to facility</Text>
              </View>
              
              <View style={styles.statusStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>Facility confirms availability</Text>
              </View>
              
              <View style={styles.statusStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>Delivery details provided</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={sendOrder}
            >
              <Text style={styles.primaryButtonText}>
                📧 Send Order to Facility
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.secondaryButtonText}>← Back to Edit</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#2C3E50',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  successIcon: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  successText: {
    fontSize: 60,
    color: '#27AE60',
    backgroundColor: '#E8F5E8',
    width: 100,
    height: 100,
    textAlign: 'center',
    textAlignVertical: 'center',
    borderRadius: 50,
    overflow: 'hidden',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8EAED',
    marginVertical: 12,
  },
  orderDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  totalRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E8EAED',
  },
  totalLabel: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: 'bold',
    flex: 1,
  },
  totalValue: {
    fontSize: 18,
    color: '#27AE60',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  facilityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  facilityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  facilityDetails: {
    marginTop: 8,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  statusSteps: {
    marginTop: 8,
  },
  statusStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 1,
  },
  actionButtons: {
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#27AE60',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  secondaryButtonText: {
    color: '#5D6D7E',
    fontSize: 16,
    fontWeight: '600',
  },
  emailContainer: {
    flex: 1,
    padding: 16,
  },
  emailHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 8,
  },
  emailSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  emailTimestamp: {
    fontSize: 12,
    color: '#95A5A6',
  },
  emailContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emailText: {
    fontSize: 12,
    color: '#2C3E50',
    lineHeight: 18,
    fontFamily: 'Courier New',
  },
  emailActions: {
    marginBottom: 30,
  },
  customerFormCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  customerFormTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  formField: {
    flex: 1,
  },
  formFieldFull: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E8EAED',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#2C3E50',
    backgroundColor: '#F8F9FA',
  },
  formTextArea: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
});

export default OrderConfirmationScreen;