import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  ScrollView,
  TextInput 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

const FilterControls = ({ 
  onDateChange, 
  onAvailabilityFilter, 
  onMaterialFilter, 
  onSearchChange,
  selectedDate,
  availabilityFilter,
  materialFilter,
  searchQuery 
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const availabilityOptions = [
    { key: 'all', label: 'All Bays', color: '#6C7B7F' },
    { key: 'available', label: 'Available', color: '#4CAF50' },
    { key: 'high', label: 'High Level', color: '#FFB74D' },
    { key: 'nearly_full', label: 'Nearly Full', color: '#FF6B6B' },
    { key: 'low', label: 'Low Stock', color: '#9E9E9E' }
  ];

  const materialOptions = [
    { key: 'all', label: 'All Materials', icon: '●' },
    { key: 'plastic', label: 'Plastics/Cans', icon: '●' },
    { key: 'recyclate', label: 'Recyclate', icon: '●' },
    { key: 'msw', label: 'MSW', icon: '●' }
  ];

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      onDateChange(selectedDate);
    }
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchIconContainer}>
          <View style={styles.searchIcon} />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search bays, materials, zones..."
          placeholderTextColor="#95A5A6"
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <View style={styles.clearButton} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Date Selector */}
      <View style={styles.dateContainer}>
        <Text style={styles.sectionLabel}>View Data For</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {formatDisplayDate(selectedDate)}
          </Text>
          <View style={styles.dateArrow} />
        </TouchableOpacity>
      </View>

      {/* Availability Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.sectionLabel}>Bay Status</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {availabilityOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterChip,
                { borderColor: option.color },
                availabilityFilter === option.key && { 
                  backgroundColor: option.color,
                  borderColor: option.color 
                }
              ]}
              onPress={() => onAvailabilityFilter(option.key)}
            >
              <Text style={[
                styles.filterChipText,
                { color: availabilityFilter === option.key ? '#FFFFFF' : option.color }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Material Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.sectionLabel}>Materials</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {materialOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.materialChip,
                materialFilter === option.key && styles.materialChipActive
              ]}
              onPress={() => onMaterialFilter(option.key)}
            >
              <View style={styles.materialIcon} />
              <Text style={[
                styles.materialChipText,
                materialFilter === option.key && styles.materialChipTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(2025, 7, 1)} // August 1, 2025
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchIconContainer: {
    marginRight: 8,
  },
  searchIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#95A5A6',
    opacity: 0.7,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    paddingVertical: 0,
  },
  clearButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#95A5A6',
    marginLeft: 8,
  },
  dateContainer: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D6D7E',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
  },
  dateArrow: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#95A5A6',
    opacity: 0.7,
  },
  filterSection: {
    marginBottom: 12,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingRight: 16,
    paddingLeft: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    marginRight: 12,
    marginVertical: 4,
    backgroundColor: '#FFFFFF',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  materialChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 12,
    marginVertical: 4,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  materialChipActive: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  materialIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5D6D7E',
    marginRight: 6,
  },
  materialChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5D6D7E',
    letterSpacing: 0.2,
  },
  materialChipTextActive: {
    color: '#FFFFFF',
  },
});

export default FilterControls;