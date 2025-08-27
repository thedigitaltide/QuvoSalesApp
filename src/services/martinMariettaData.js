import martinMariettaData from '../../assets/data/martin_marietta_enhanced_data.json';
import productCodes from '../../assets/data/martin_marietta_product_codes.json';

class MartinMariettaDataService {
  constructor() {
    this.facilities = martinMariettaData.facilities || [];
    this.productMapping = martinMariettaData.productCodeMapping || productCodes;
    this.metadata = martinMariettaData.metadata || {};
    
    // Group facilities by state for easy filtering
    this.facilitiesByState = this.facilities.reduce((acc, facility) => {
      const state = facility.state;
      if (!acc[state]) acc[state] = [];
      acc[state].push(facility);
      return acc;
    }, {});

    // Create quick lookup maps
    this.facilityById = this.facilities.reduce((acc, facility) => {
      acc[facility.facilityId] = facility;
      return acc;
    }, {});
  }

  // Get all facilities
  getAllFacilities() {
    return this.facilities;
  }

  // Get facilities by state
  getFacilitiesByState(state) {
    return this.facilitiesByState[state] || [];
  }

  // Get all states with facilities
  getAllStates() {
    return Object.keys(this.facilitiesByState).sort();
  }

  // Get top states by facility count
  getTopStates(limit = 10) {
    return Object.entries(this.facilitiesByState)
      .map(([state, facilities]) => ({ state, count: facilities.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // Search facilities by name, city, or products
  searchFacilities(query, filters = {}) {
    let results = this.facilities;

    // Text search
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      results = results.filter(facility =>
        facility.name.toLowerCase().includes(searchTerm) ||
        facility.city.toLowerCase().includes(searchTerm) ||
        facility.state.toLowerCase().includes(searchTerm) ||
        facility.productsAvailable.toLowerCase().includes(searchTerm) ||
        facility.detailedProducts?.some(p => 
          p.description.toLowerCase().includes(searchTerm)
        )
      );
    }

    // State filter
    if (filters.state) {
      results = results.filter(f => f.state === filters.state);
    }

    // Product category filter
    if (filters.productCategory) {
      results = results.filter(f => 
        f.products?.includes(filters.productCategory) ||
        f.detailedProducts?.some(p => p.category === filters.productCategory)
      );
    }

    // Product code filter
    if (filters.productCode) {
      results = results.filter(f =>
        f.detailedProducts?.some(p => p.code === filters.productCode)
      );
    }

    // Location filter (within radius)
    if (filters.latitude && filters.longitude && filters.radius) {
      results = results.filter(f => {
        const distance = this.calculateDistance(
          filters.latitude, filters.longitude,
          parseFloat(f.latitude), parseFloat(f.longitude)
        );
        return distance <= filters.radius;
      });
    }

    return results;
  }

  // Get facility by ID
  getFacilityById(id) {
    return this.facilityById[id];
  }

  // Get facilities by product category
  getFacilitiesByProductCategory(category) {
    return this.facilities.filter(f => 
      f.products?.includes(category) ||
      f.detailedProducts?.some(p => p.category === category)
    );
  }

  // Get facilities with specific product code
  getFacilitiesByProductCode(productCode) {
    return this.facilities.filter(f =>
      f.detailedProducts?.some(p => p.code === productCode)
    );
  }

  // Get product categories
  getProductCategories() {
    return Object.keys(this.productMapping.categories || {});
  }

  // Get product codes for category
  getProductCodesForCategory(category) {
    return this.productMapping.categories?.[category] || [];
  }

  // Get product info by code
  getProductInfo(code) {
    return this.productMapping.productCodes?.[code];
  }

  // Get all product codes
  getAllProductCodes() {
    return Object.keys(this.productMapping.productCodes || {});
  }

  // Generate bays with LiDAR data for a specific facility
  generateFacilityBays(facilityId, lidarData = null) {
    const facility = this.getFacilityById(facilityId);
    if (!facility) return [];

    const bays = [];
    
    // Generate bays based on facility's products
    facility.detailedProducts?.forEach((product, index) => {
      const bayName = this.generateBayName(facility, index);
      
      // Use LiDAR data if available, otherwise generate mock data
      const bayData = lidarData ? this.mapLidarToBay(lidarData, product) : this.generateMockBayData(product);
      
      bays.push({
        id: `${facilityId}_${product.code}_${index}`,
        name: bayName,
        facilityId: facilityId,
        facility: facility,
        productCode: product.code,
        productDescription: product.description,
        productCategory: product.category,
        material: product.description,
        materialType: product.description,
        ...bayData,
        // Facility context
        facilityName: facility.name,
        facilityAddress: `${facility.address}, ${facility.city}, ${facility.state}`,
        facilityContact: facility.contactPhone,
        facilityEmail: facility.contactEmail,
        datetime: new Date().toISOString(),
        storageId: `${facilityId}_${product.code}`,
        uniqueId: `${facilityId}_${product.code}_${index}`
      });
    });

    return bays;
  }

  // Generate appropriate bay name based on facility type and location
  generateBayName(facility, index) {
    const facilityType = this.getFacilityType(facility);
    const bayNames = {
      'Aggregates': [`Stockpile ${index + 1}`, `Pile ${String.fromCharCode(65 + index)}`, `Bay ${index + 1}`],
      'Ready Mixed Concrete': [`Plant ${index + 1}`, `Mixer ${String.fromCharCode(65 + index)}`, `Unit ${index + 1}`],
      'Asphalt': [`Tank ${index + 1}`, `Silo ${String.fromCharCode(65 + index)}`, `Storage ${index + 1}`],
      'Magnesia': [`Kiln ${index + 1}`, `Unit ${String.fromCharCode(65 + index)}`, `Processing ${index + 1}`]
    };

    const names = bayNames[facilityType] || [`Bay ${index + 1}`, `Storage ${String.fromCharCode(65 + index)}`, `Unit ${index + 1}`];
    return names[index % names.length];
  }

  // Determine facility type from products
  getFacilityType(facility) {
    if (facility.products?.includes('Aggregates')) return 'Aggregates';
    if (facility.products?.includes('Ready Mixed Concrete')) return 'Ready Mixed Concrete';
    if (facility.products?.includes('Asphalt')) return 'Asphalt';
    if (facility.products?.includes('Magnesia Specialties')) return 'Magnesia';
    return 'Aggregates'; // Default
  }

  // Generate mock bay data (volume, pricing, etc.)
  generateMockBayData(product) {
    // Base volumes by product category
    const volumeRanges = {
      'Aggregates': { min: 5000, max: 50000, unit: 'tons', price: [18, 45] },
      'Ready Mixed Concrete': { min: 200, max: 2000, unit: 'cubic yards', price: [85, 150] },
      'Asphalt': { min: 1000, max: 15000, unit: 'tons', price: [45, 85] },
      'Magnesia': { min: 50, max: 500, unit: 'tons', price: [200, 800] }
    };

    const range = volumeRanges[product.category] || volumeRanges['Aggregates'];
    
    const volume = Math.floor(Math.random() * (range.max - range.min) + range.min);
    const maxVolume = Math.floor(volume * (1.2 + Math.random() * 0.8)); // 120%-200% of current
    const pricePerTon = Math.floor(Math.random() * (range.price[1] - range.price[0]) + range.price[0]);

    return {
      volume: volume.toString(),
      maxVolume: maxVolume,
      unitType: range.unit,
      pricePerTon: pricePerTon
    };
  }

  // Map real LiDAR data to bay (when available)
  mapLidarToBay(lidarData, product) {
    // This would map real LiDAR volume data to the product/bay
    // For now, we'll use the mock data but this is where real integration happens
    return this.generateMockBayData(product);
  }

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Get metadata
  getMetadata() {
    return this.metadata;
  }

  // Get summary statistics
  getSummaryStats() {
    const totalFacilities = this.facilities.length;
    const stateCount = Object.keys(this.facilitiesByState).length;
    const productCategories = this.getProductCategories();
    const totalProductCodes = this.getAllProductCodes().length;

    return {
      totalFacilities,
      stateCount,
      productCategories: productCategories.length,
      totalProductCodes,
      topStates: this.getTopStates(5),
      productCategoryBreakdown: productCategories.map(cat => ({
        category: cat,
        facilityCount: this.getFacilitiesByProductCategory(cat).length
      }))
    };
  }
}

export default new MartinMariettaDataService();