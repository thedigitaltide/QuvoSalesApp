import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with spacing

const EnhancedBayCard = ({ record, storage, onPress }) => {
  const volume = parseFloat(record.volume || 0);
  const maxVolume = parseFloat(storage?.maxVolume || 1000);
  const utilizationPercent = Math.min((volume / maxVolume) * 100, 100);

  // Enhanced status colors and gradients
  const getStatusInfo = () => {
    if (utilizationPercent >= 90) return {
      text: 'NEARLY FULL',
      color: '#FF6B6B',
      gradient: ['#FF6B6B', '#FF5252'],
      icon: '●',
      textColor: '#FFFFFF'
    };
    if (utilizationPercent >= 70) return {
      text: 'HIGH LEVEL',
      color: '#FFB74D',
      gradient: ['#FFB74D', '#FFA726'],
      icon: '●',
      textColor: '#FFFFFF'
    };
    if (utilizationPercent >= 30) return {
      text: 'AVAILABLE',
      color: '#4CAF50',
      gradient: ['#4CAF50', '#66BB6A'],
      icon: '●',
      textColor: '#FFFFFF'
    };
    return {
      text: 'LOW LEVEL',
      color: '#9E9E9E',
      gradient: ['#9E9E9E', '#BDBDBD'],
      icon: '●',
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

  const getMaterialIcon = (material) => {
    return '●';
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
      activeOpacity={0.8}
    >
      <View style={styles.card}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
          <Text style={[styles.statusIcon, { color: status.textColor }]}>
            {status.icon}
          </Text>
          <Text style={[styles.statusText, { color: status.textColor }]}>
            {status.text}
          </Text>
        </View>

        {/* Zone Name & Material Type */}
        <View style={styles.bayHeader}>
          <View style={styles.bayTitleSection}>
            <Text style={styles.zoneName}>{record.zoneName || record.name}</Text>
            <Text style={styles.facilityName}>{record.facilityName}</Text>
            <Text style={styles.materialTypeName}>{record.materialType || record.material || 'Unknown Material'}</Text>
          </View>
        </View>

        {/* Volume Display */}
        <View style={styles.volumeSection}>
          <Text style={styles.volumeValue}>
            {formatVolume(volume)}
          </Text>
          <Text style={styles.volumeUnit}>{record.unitType || 'tons'}</Text>
        </View>

        {/* Capacity Progress */}
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
          <Text style={styles.percentageText}>
            {utilizationPercent.toFixed(0)}%
          </Text>
        </View>

        {/* Capacity Info */}
        <Text style={styles.capacityText}>
          {formatVolume(maxVolume)} {record.unitType || 'tons'} max capacity
        </Text>

        {/* Pricing Info */}
        {record.pricePerTon && (
          <Text style={styles.pricingText}>
            ${record.pricePerTon}/{(record.unitType || 'tons').slice(0, -1)}
          </Text>
        )}

        {/* Material & Update Info */}
        <View style={styles.footer}>
          <View style={styles.materialInfo}>
            <Text style={styles.materialLabel}>Material</Text>
            <Text style={styles.materialValue} numberOfLines={1}>
              {record.material || 'Unknown'}
            </Text>
          </View>
          <View style={styles.updateInfo}>
            <Text style={styles.updateLabel}>Updated</Text>
            <Text style={styles.updateValue}>{formatDate(record.datetime)}</Text>
          </View>
        </View>

        {/* Subtle shadow overlay for depth */}
        <View style={styles.shadowOverlay} pointerEvents="none" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: cardWidth,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  shadowOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.01)',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statusIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  bayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    marginTop: 8,
  },
  bayTitleSection: {
    flex: 1,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  facilityName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3498DB',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  materialTypeName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7F8C8D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  materialIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#5D6D7E',
  },
  volumeSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  volumeValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2C3E50',
    letterSpacing: -0.5,
  },
  volumeUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7F8C8D',
    marginLeft: 4,
    marginBottom: 2,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#F0F2F5',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5D6D7E',
    textAlign: 'right',
  },
  capacityText: {
    fontSize: 11,
    color: '#95A5A6',
    marginBottom: 8,
    fontWeight: '500',
  },
  pricingText: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  materialInfo: {
    flex: 1,
    marginRight: 8,
  },
  materialLabel: {
    fontSize: 9,
    color: '#95A5A6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
    marginBottom: 2,
  },
  materialValue: {
    fontSize: 11,
    color: '#5D6D7E',
    fontWeight: '600',
  },
  updateInfo: {
    alignItems: 'flex-end',
  },
  updateLabel: {
    fontSize: 9,
    color: '#95A5A6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
    marginBottom: 2,
  },
  updateValue: {
    fontSize: 11,
    color: '#5D6D7E',
    fontWeight: '600',
  },
});

export default EnhancedBayCard;