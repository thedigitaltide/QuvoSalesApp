import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BayCard = ({ record, storage }) => {
  const volume = parseFloat(record.volume || 0);
  const maxVolume = parseFloat(storage?.maxVolume || 1000);
  const utilizationPercent = Math.min((volume / maxVolume) * 100, 100);

  // Determine status colors based on utilization
  const getStatusColor = () => {
    if (utilizationPercent >= 90) return '#e74c3c'; // Nearly full - Red
    if (utilizationPercent >= 70) return '#f39c12'; // High - Orange
    if (utilizationPercent >= 30) return '#27ae60'; // Good - Green
    return '#95a5a6'; // Low/Empty - Gray
  };

  const getStatusText = () => {
    if (utilizationPercent >= 90) return 'NEARLY FULL';
    if (utilizationPercent >= 70) return 'HIGH LEVEL';
    if (utilizationPercent >= 30) return 'AVAILABLE';
    return 'LOW LEVEL';
  };

  const formatVolume = (vol, unitType = 'tons') => {
    let formattedNumber;
    if (vol >= 1000) {
      formattedNumber = `${(vol / 1000).toFixed(1)}K`;
    } else {
      formattedNumber = vol.toFixed(0);
    }
    return `${formattedNumber} ${unitType}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No data';
    try {
      // Parse format "2025.08.11 05:01:50"
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
      return dateStr.slice(0, 10); // Fallback to first 10 chars
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.bayName}>{record.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      <View style={styles.volumeContainer}>
        <Text style={styles.volumeLabel}>Current Volume</Text>
        <Text style={styles.volumeValue}>
          {formatVolume(volume, record.unitType || 'tons')}
        </Text>
        <Text style={styles.capacityText}>
          of {formatVolume(maxVolume, record.unitType || 'tons')} max ({utilizationPercent.toFixed(0)}% full)
        </Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill,
              { 
                width: `${Math.max(utilizationPercent, 2)}%`,
                backgroundColor: getStatusColor()
              }
            ]} 
          />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.materialInfo}>
          <Text style={styles.materialLabel}>Material</Text>
          <Text style={styles.materialValue}>{record.material || 'Unknown'}</Text>
        </View>
        <View style={styles.updateInfo}>
          <Text style={styles.updateLabel}>Updated</Text>
          <Text style={styles.updateValue}>{formatDate(record.datetime)}</Text>
        </View>
      </View>

      {record.mass && (
        <View style={styles.additionalInfo}>
          <Text style={styles.massText}>
            Mass: {parseFloat(record.mass).toFixed(1)} units
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bayName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  volumeContainer: {
    marginBottom: 12,
  },
  volumeLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  volumeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  capacityText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  materialInfo: {
    flex: 1,
  },
  materialLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    textTransform: 'uppercase',
  },
  materialValue: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '600',
    marginTop: 2,
  },
  updateInfo: {
    alignItems: 'flex-end',
  },
  updateLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    textTransform: 'uppercase',
  },
  updateValue: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '600',
    marginTop: 2,
  },
  additionalInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  massText: {
    fontSize: 11,
    color: '#7f8c8d',
  },
});

export default BayCard;