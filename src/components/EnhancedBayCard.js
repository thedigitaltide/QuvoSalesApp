import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');
const cardWidth = width - 32; // Full width minus padding

const EnhancedBayCard = ({ record, storage, onPress }) => {
  const volume = parseFloat(record.volume || 0);
  const maxVolume = parseFloat(storage?.maxVolume || 1000);
  const utilizationPercent = Math.min((volume / maxVolume) * 100, 100);

  // Logical status colors based on material availability
  const getStatusInfo = () => {
    if (volume === 0) return {
      text: 'EMPTY',
      color: '#9E9E9E',
      icon: 'battery-empty',
      textColor: '#FFFFFF'
    };
    if (utilizationPercent >= 75) return {
      text: 'HIGH STOCK',
      color: '#10B981', // Green for high availability
      icon: 'battery-full',
      textColor: '#FFFFFF'
    };
    if (utilizationPercent >= 50) return {
      text: 'GOOD STOCK',
      color: '#3B82F6', // Blue for medium availability  
      icon: 'battery-three-quarters',
      textColor: '#FFFFFF'
    };
    if (utilizationPercent >= 25) return {
      text: 'LOW STOCK',
      color: '#F59E0B', // Yellow for low availability
      icon: 'battery-quarter',
      textColor: '#FFFFFF'
    };
    return {
      text: 'CRITICAL',
      color: '#EF4444', // Red for very low availability
      icon: 'exclamation-triangle',
      textColor: '#FFFFFF'
    };
  };

  const status = getStatusInfo();

  const formatVolume = (vol, unitType = 'tons') => {
    let formattedNumber;
    if (vol >= 1000000) {
      formattedNumber = `${(vol / 1000000).toFixed(1)}M`;
    } else if (vol >= 1000) {
      formattedNumber = `${(vol / 1000).toFixed(1)}K`;
    } else {
      formattedNumber = vol.toFixed(0);
    }
    return `${formattedNumber}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No data';
    try {
      const [datePart, timePart] = dateStr.split(' ');
      const [year, month, day] = datePart.split('.');
      const [hour, minute] = timePart.split(':');
      
      const date = new Date(year, month - 1, day, hour, minute);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffDays > 0) return `${diffDays}d ago`;
      if (diffHours > 0) return `${diffHours}h ago`;
      return 'Recent';
    } catch (error) {
      return dateStr.slice(0, 10);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.cardContainer} 
      onPress={onPress}
      activeOpacity={0.95}
    >
      <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: status.color }]}>
        {/* Left Side - Bay Info */}
        <View style={styles.leftSection}>
          <View style={styles.bayInfo}>
            <View style={styles.bayHeader}>
              <Text style={styles.zoneName} numberOfLines={1}>{record.zoneName || record.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                <Icon name={status.icon} size={11} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.facilityName} numberOfLines={1}>{record.facilityName}</Text>
          </View>
          
          {/* Material Type */}
          <View style={styles.materialSection}>
            <Icon name="cubes" size={12} color="#666" />
            <Text style={styles.materialText} numberOfLines={1}>
              {(record.materialType || record.material || 'Material').replace('Asphalt Paving Mix', 'Asphalt')}
            </Text>
          </View>
        </View>

        {/* Right Side - Metrics */}
        <View style={styles.rightSection}>
          <View style={styles.metricsContainer}>
            <View style={styles.volumeRow}>
              <Text style={styles.currentVolume}>{formatVolume(volume)}</Text>
              <Text style={styles.maxVolume}>/ {formatVolume(maxVolume)}</Text>
              <Text style={styles.unitType}>{record.unitType || 'tons'}</Text>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
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
              <Text style={[styles.percentageText, { color: status.color }]}>
                {utilizationPercent.toFixed(0)}%
              </Text>
            </View>

            {/* Price */}
            {record.pricePerTon && (
              <Text style={styles.priceText}>${record.pricePerTon}/ton</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
    marginRight: 16,
  },
  bayInfo: {
    marginBottom: 8,
  },
  bayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  zoneName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facilityName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  materialSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  materialText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
    minWidth: 120,
  },
  metricsContainer: {
    alignItems: 'flex-end',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  currentVolume: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  maxVolume: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
  unitType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
    marginLeft: 4,
  },
  progressContainer: {
    alignItems: 'flex-end',
    marginBottom: 4,
    width: 100,
  },
  progressTrack: {
    height: 6,
    width: 100,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
});

export default EnhancedBayCard;