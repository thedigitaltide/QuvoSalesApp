import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const ProjectSwitcher = ({ projects, selectedProject, onSelectProject, visible, onClose }) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Facility</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.projectList}>
          {projects.map((project) => (
            <TouchableOpacity
              key={project._id}
              style={[
                styles.projectItem,
                selectedProject?._id === project._id && styles.selectedProject
              ]}
              onPress={() => {
                onSelectProject(project);
                onClose();
              }}
            >
              <View style={styles.projectInfo}>
                <Text style={[
                  styles.projectName,
                  selectedProject?._id === project._id && styles.selectedProjectText
                ]}>
                  {project.name.toUpperCase()}
                </Text>
                <Text style={[
                  styles.projectDetails,
                  selectedProject?._id === project._id && styles.selectedProjectText
                ]}>
                  {project.sensorAmount} sensors • {project.storageAmount} storage zones
                </Text>
                {project.location && (
                  <Text style={[
                    styles.projectLocation,
                    selectedProject?._id === project._id && styles.selectedProjectText
                  ]}>
                    📍 {project.location}
                  </Text>
                )}
              </View>
              
              {selectedProject?._id === project._id && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 20,
    maxHeight: '70%',
    minWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: 'bold',
  },
  projectList: {
    maxHeight: 400,
  },
  projectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  selectedProject: {
    backgroundColor: '#3498db',
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  projectDetails: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  projectLocation: {
    fontSize: 12,
    color: '#95a5a6',
  },
  selectedProjectText: {
    color: 'white',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProjectSwitcher;