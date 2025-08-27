import customersData from '../../assets/data/customers_data.json';

class CustomerDataService {
  constructor() {
    this.customers = customersData.customers || {};
    this.userRoles = customersData.userRoles || {};
    this.metadata = customersData.metadata || {};
    
    // Initialize current user role and permissions
    this.currentUserRole = 'sales-manager'; // Default for demo
    this.currentUserId = 'demo-user';
  }

  // Customer Management
  getAllCustomers() {
    return Object.values(this.customers);
  }

  getCustomer(customerId) {
    return this.customers[customerId];
  }

  getCustomerSites(customerId) {
    const customer = this.getCustomer(customerId);
    return customer ? Object.values(customer.sites) : [];
  }

  // Site Management
  getSite(customerId, siteId) {
    const customer = this.getCustomer(customerId);
    return customer?.sites?.[siteId];
  }

  getAllSites() {
    const sites = [];
    Object.entries(this.customers).forEach(([customerId, customer]) => {
      Object.values(customer.sites).forEach(site => {
        sites.push({
          ...site,
          customerId,
          customerName: customer.name,
          customerColor: customer.color
        });
      });
    });
    return sites;
  }

  // Product Management
  getSiteProducts(customerId, siteId) {
    const site = this.getSite(customerId, siteId);
    return site ? Object.values(site.products) : [];
  }

  getProduct(customerId, siteId, productCode) {
    const site = this.getSite(customerId, siteId);
    return site?.products?.[productCode];
  }

  // Bay Generation with Real Customer Data
  generateCustomerBays(customerId, siteId, lidarData = null) {
    const site = this.getSite(customerId, siteId);
    if (!site) return [];

    const customer = this.getCustomer(customerId);
    const bays = [];
    
    Object.entries(site.products).forEach(([productCode, product], index) => {
      const bayName = this.generateBayName(product, index);
      
      // Use LiDAR data if available, otherwise generate realistic mock data
      const bayData = lidarData ? this.mapLidarToBay(lidarData, product) : this.generateRealisticBayData(product);
      
      const bay = {
        id: `${customerId}_${siteId}_${productCode}`,
        name: bayName,
        customerId,
        customerName: customer.name,
        customerColor: customer.color,
        siteId,
        siteName: site.name,
        productCode,
        productName: product.name,
        productDescription: product.description,
        productCategory: product.category,
        material: product.name,
        materialType: product.name,
        maxVolume: product.maxCapacity,
        unitType: product.unit,
        pricePerTon: product.pricePerUnit,
        criticalLevel: product.criticalLevel,
        ...bayData,
        // Site context
        siteAddress: `${site.address}, ${site.city}, ${site.state}`,
        siteContact: site.contactPhone,
        salesRepPhone: site.salesRepPhone,
        siteEmail: site.contactEmail,
        contactName: site.contactName,
        contactTitle: site.contactTitle,
        siteHours: site.hoursOfOperation,
        railwayAccess: site.railwayAccess,
        datetime: new Date().toISOString(),
        storageId: `${customerId}_${siteId}_${productCode}`,
        uniqueId: `${customerId}_${siteId}_${productCode}_${index}`
      };
      
      // Contact info properly mapped from real Martin Marietta facility data
      
      bays.push(bay);
    });

    return bays;
  }

  // Generate all bays for all customers (respecting user permissions)
  generateAllBays(userRole = null, userId = null) {
    const role = userRole || this.currentUserRole;
    const visibleCustomers = this.getVisibleCustomers(role, userId);
    const visibleSites = this.getVisibleSites(role, userId);
    
    const allBays = [];
    
    visibleCustomers.forEach(customerId => {
      const customerSites = this.getCustomerSites(customerId);
      
      customerSites.forEach(site => {
        // Check if user has access to this specific site
        if (role === 'sales-person' && visibleSites.length > 0) {
          const siteKey = `${customerId}_${site.id}`;
          if (!visibleSites.includes(siteKey)) return;
        }
        
        const siteBays = this.generateCustomerBays(customerId, site.id);
        allBays.push(...siteBays);
      });
    });

    return allBays;
  }

  generateBayName(product, index) {
    const bayTypes = {
      'Aggregates': [`Stockpile ${index + 1}`, `Pile ${String.fromCharCode(65 + index)}`, `Bay ${index + 1}`],
      'Sand': [`Sand Pit ${index + 1}`, `Wash Plant ${String.fromCharCode(65 + index)}`, `Sand Bay ${index + 1}`],
      'Concrete': [`Plant ${index + 1}`, `Mixer ${String.fromCharCode(65 + index)}`, `Unit ${index + 1}`]
    };

    const names = bayTypes[product.category] || [`Storage ${index + 1}`, `Bay ${String.fromCharCode(65 + index)}`, `Unit ${index + 1}`];
    return names[index % names.length];
  }

  generateRealisticBayData(product) {
    // Generate realistic volume between 60-95% of capacity for normal operation
    const utilizationPercent = Math.random() * 35 + 60; // 60-95%
    const currentVolume = Math.floor((product.maxCapacity * utilizationPercent) / 100);
    
    // Add some variation to pricing (±5%)
    const priceVariation = (Math.random() - 0.5) * 0.1; // ±5%
    const adjustedPrice = Math.round(product.pricePerUnit * (1 + priceVariation));

    return {
      volume: currentVolume.toString(),
      maxVolume: product.maxCapacity,
      currentUtilization: utilizationPercent,
      pricePerTon: adjustedPrice,
      isCritical: utilizationPercent <= product.criticalLevel,
      lastUpdated: new Date().toISOString(),
      trend: this.generateTrend()
    };
  }

  generateTrend() {
    const trends = ['increasing', 'decreasing', 'stable'];
    const weights = [0.3, 0.4, 0.3]; // Slightly more likely to be decreasing (consumption)
    const rand = Math.random();
    let sum = 0;
    
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (rand <= sum) return trends[i];
    }
    return 'stable';
  }

  mapLidarToBay(lidarData, product) {
    // Map real LiDAR volume data to the product/bay
    // For now, use realistic data but this is where real integration happens
    return this.generateRealisticBayData(product);
  }

  // User Role and Permission Management
  setUserRole(role, userId = null, visibleSites = []) {
    this.currentUserRole = role;
    this.currentUserId = userId || this.currentUserId;
    
    if (role === 'sales-person' && visibleSites.length > 0) {
      this.userRoles['sales-person'].visibleSites = visibleSites;
    }
  }

  getCurrentUserRole() {
    return this.currentUserRole;
  }

  getUserPermissions(role = null) {
    const userRole = role || this.currentUserRole;
    return this.userRoles[userRole]?.permissions || {};
  }

  canEditPrices(role = null) {
    const permissions = this.getUserPermissions(role);
    return permissions.editPrices === true;
  }

  canViewAllSites(role = null) {
    const permissions = this.getUserPermissions(role);
    return permissions.viewAllSites === true;
  }

  getVisibleCustomers(role = null, userId = null) {
    const userRole = role || this.currentUserRole;
    const roleConfig = this.userRoles[userRole];
    
    if (!roleConfig) return Object.keys(this.customers);
    
    return roleConfig.visibleCustomers || Object.keys(this.customers);
  }

  getVisibleSites(role = null, userId = null) {
    const userRole = role || this.currentUserRole;
    const roleConfig = this.userRoles[userRole];
    
    if (userRole === 'sales-manager') return []; // Can see all sites
    
    return roleConfig?.visibleSites || [];
  }

  // Price Management (Sales Manager only)
  updateProductPrice(customerId, siteId, productCode, newPrice) {
    if (!this.canEditPrices()) {
      throw new Error('Insufficient permissions to edit prices');
    }

    const product = this.getProduct(customerId, siteId, productCode);
    if (product) {
      product.pricePerUnit = newPrice;
      return true;
    }
    return false;
  }

  // Search and Filter
  searchSites(query, customerId = null) {
    let sitesToSearch = customerId ? this.getCustomerSites(customerId) : this.getAllSites();
    
    if (!query.trim()) return sitesToSearch;

    const searchTerm = query.toLowerCase();
    return sitesToSearch.filter(site =>
      site.name.toLowerCase().includes(searchTerm) ||
      site.city.toLowerCase().includes(searchTerm) ||
      site.state.toLowerCase().includes(searchTerm) ||
      Object.values(site.products || {}).some(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      )
    );
  }

  filterByProductCategory(category, customerId = null) {
    const sites = customerId ? this.getCustomerSites(customerId) : this.getAllSites();
    
    return sites.filter(site =>
      Object.values(site.products || {}).some(product => 
        product.category === category
      )
    );
  }

  // Critical Level Management
  getCriticalBays() {
    const allBays = this.generateAllBays();
    return allBays.filter(bay => {
      const utilization = (parseFloat(bay.volume) / bay.maxVolume) * 100;
      return utilization <= bay.criticalLevel;
    });
  }

  getCriticalCount() {
    return this.getCriticalBays().length;
  }

  // Analytics and Trends
  getSiteUtilizationStats(customerId, siteId) {
    const bays = this.generateCustomerBays(customerId, siteId);
    
    let totalCapacity = 0;
    let totalVolume = 0;
    let criticalCount = 0;
    
    bays.forEach(bay => {
      totalCapacity += bay.maxVolume;
      totalVolume += parseFloat(bay.volume);
      if (bay.isCritical) criticalCount++;
    });

    const overallUtilization = totalCapacity > 0 ? (totalVolume / totalCapacity) * 100 : 0;

    return {
      totalBays: bays.length,
      totalCapacity,
      totalVolume,
      overallUtilization,
      criticalCount,
      baysAtRisk: criticalCount,
      averagePrice: bays.reduce((sum, bay) => sum + bay.pricePerTon, 0) / bays.length || 0
    };
  }

  getCustomerStats(customerId) {
    const customer = this.getCustomer(customerId);
    if (!customer) return null;

    const sites = this.getCustomerSites(customerId);
    const allBays = [];
    
    sites.forEach(site => {
      const siteBays = this.generateCustomerBays(customerId, site.id);
      allBays.push(...siteBays);
    });

    return {
      customerName: customer.name,
      totalSites: sites.length,
      totalBays: allBays.length,
      totalCapacity: allBays.reduce((sum, bay) => sum + bay.maxVolume, 0),
      totalVolume: allBays.reduce((sum, bay) => sum + parseFloat(bay.volume), 0),
      criticalBays: allBays.filter(bay => bay.isCritical).length,
      averagePrice: allBays.reduce((sum, bay) => sum + bay.pricePerTon, 0) / allBays.length || 0
    };
  }

  // Summary Statistics
  getSummaryStats() {
    const customers = this.getAllCustomers();
    const allSites = this.getAllSites();
    const allBays = this.generateAllBays();
    const criticalBays = this.getCriticalBays();

    return {
      totalCustomers: customers.length,
      totalSites: allSites.length,
      totalBays: allBays.length,
      criticalBays: criticalBays.length,
      criticalPercentage: allBays.length > 0 ? (criticalBays.length / allBays.length) * 100 : 0,
      totalCapacity: allBays.reduce((sum, bay) => sum + bay.maxVolume, 0),
      totalVolume: allBays.reduce((sum, bay) => sum + parseFloat(bay.volume), 0),
      customers: customers.map(customer => ({
        id: customer.id,
        name: customer.name,
        color: customer.color,
        siteCount: Object.keys(customer.sites).length
      }))
    };
  }
}

export default new CustomerDataService();