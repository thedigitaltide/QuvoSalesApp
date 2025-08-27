import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const MinimalFilterControls = ({ 
  onDateChange, 
  onAvailabilityFilter, 
  onSearchChange,
  selectedDate,
  availabilityFilter,
  searchQuery 
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      onDateChange(selectedDate);
    }
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      {/* Single Row with Search and Quick Filters */}
      <View style={styles.mainRow}>
        {/* Compact Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search bays..."
            placeholderTextColor="#95A5A6"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>

        {/* Quick Date */}
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{formatDisplayDate(selectedDate)}</Text>
        </TouchableOpacity>

        {/* Quick Status Filter */}
        <TouchableOpacity
          style={[
            styles.statusButton,
            availabilityFilter === 'available' && styles.statusButtonActive
          ]}
          onPress={() => onAvailabilityFilter(
            availabilityFilter === 'available' ? 'all' : 'available'
          )}
        >
          <Text style={[
            styles.statusText,
            availabilityFilter === 'available' && styles.statusTextActive
          ]}>
            Available Only
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(2025, 7, 1)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  searchInput: {
    fontSize: 14,
    color: '#2C3E50',
    paddingVertical: 0,
  },
  dateButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  statusButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  statusButtonActive: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5D6D7E',
  },
  statusTextActive: {
    color: '#FFFFFF',
  },
});

export default MinimalFilterControls;