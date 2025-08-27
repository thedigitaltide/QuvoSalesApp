import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import BayCard from '../components/BayCard';
import ProjectSwitcher from '../components/ProjectSwitcher';
import api from '../services/api';

const DashboardScreen = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showProjectSwitcher, setShowProjectSwitcher] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadProjects(),
        loadDashboardData(),
      ]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const projectsData = await api.getProjects();
      setProjects(projectsData);
      if (projectsData.length > 0) {
        setSelectedProject(projectsData[0]);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      const data = await api.getBayData();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      throw error;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
    } catch (error) {
      Alert.alert('Refresh Failed', 'Unable to update data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const calculateTotalStats = () => {
    if (!dashboardData?.recordsById) return { totalVolume: 0, totalBays: 0, avgUtilization: 0 };

    const records = Object.values(dashboardData.recordsById);
    const storages = dashboardData.storagesById || {};
    
    const totalVolume = records.reduce((sum, record) => sum + parseFloat(record.volume || 0), 0);
    const totalBays = records.length;
    
    const utilizationSum = records.reduce((sum, record) => {
      const storage = storages[record.storageId];
      if (storage) {
        const utilization = (parseFloat(record.volume || 0) / parseFloat(storage.maxVolume || 1)) * 100;
        return sum + Math.min(utilization, 100);
      }
      return sum;
    }, 0);
    
    const avgUtilization = totalBays > 0 ? utilizationSum / totalBays : 0;

    return { totalVolume, totalBays, avgUtilization };
  };

  const formatVolume = (volume) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toFixed(0);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading bay data...</Text>
      </View>
    );
  }

  const records = dashboardData?.recordsById ? Object.values(dashboardData.recordsById) : [];
  const storages = dashboardData?.storagesById || {};
  const stats = calculateTotalStats();

  // Sort bays by name for consistent display
  const sortedRecords = records.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.welcomeText}>Welcome back, {user?.name}</Text>
          <TouchableOpacity 
            onPress={() => setShowProjectSwitcher(true)}
            style={styles.projectSelector}
          >
            <Text style={styles.projectText}>
              {selectedProject?.name.toUpperCase()} Facility
            </Text>
            <Text style={styles.projectArrow}>▼</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalBays}</Text>
          <Text style={styles.statLabel}>Active Bays</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatVolume(stats.totalVolume)}</Text>
          <Text style={styles.statLabel}>Total Volume</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.avgUtilization.toFixed(0)}%</Text>
          <Text style={styles.statLabel}>Avg Utilization</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>Bay Status Overview</Text>
        
        {sortedRecords.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No bay data available</Text>
            <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          sortedRecords.map((record) => (
            <BayCard
              key={record._id}
              record={record}
              storage={storages[record.storageId]}
            />
          ))
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Last updated: {new Date().toLocaleTimeString()}
          </Text>
          <Text style={styles.footerText}>Pull down to refresh</Text>
        </View>
      </ScrollView>

      <ProjectSwitcher
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        visible={showProjectSwitcher}
        onClose={() => setShowProjectSwitcher(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '300',
  },
  projectSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  projectText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  projectArrow: {
    color: 'white',
    fontSize: 12,
    marginLeft: 8,
    marginTop: 2,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 6,
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    marginTop: 8,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
});

export default DashboardScreen;