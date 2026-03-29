import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  RefreshControl,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://siit-ehandbook-api.onrender.com/api';

interface StudentLocation {
  id: string;
  name: string;
  email: string;
  studentId: string;
  location: {
    latitude: number;
    longitude: number;
    lastUpdate: string;
  };
  isOnline: boolean;
}

const StudentLocationsScreen: React.FC = () => {
  const [students, setStudents] = useState<StudentLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedStudent, setSelectedStudent] = useState<StudentLocation | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 14.5995,
    longitude: 120.9842,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentLocations();
  }, []);

  const fetchStudentLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/location/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && response.data.success) {
        const validStudents = response.data.data.filter(
          (student: StudentLocation) =>
            student.location && student.location.latitude && student.location.longitude
        );
        setStudents(validStudents);
        // Update map region if students exist
        if (validStudents.length > 0) {
          const avgLat =
            validStudents.reduce((sum: number, s: StudentLocation) => sum + s.location.latitude, 0) /
            validStudents.length;
          const avgLng =
            validStudents.reduce((sum: number, s: StudentLocation) => sum + s.location.longitude, 0) /
            validStudents.length;
          setMapRegion((prev) => ({
            ...prev,
            latitude: avgLat,
            longitude: avgLng,
          }));
        }
      } else {
        setError('Failed to fetch student locations.');
        setStudents([]);
      }
    } catch (err) {
      setError('Error fetching student locations. Please check your connection or try again.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStudentLocations();
    setRefreshing(false);
  };


  const formatTime = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#004BA8" />
          <Text style={styles.loadingText}>Loading student locations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#FF5252" />
          <Text style={styles.loadingText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRefresh}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with toggle buttons */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]}
          onPress={() => setViewMode('map')}
        >
          <MaterialCommunityIcons
            name="map"
            size={20}
            color={viewMode === 'map' ? '#fff' : '#004BA8'}
          />
          <Text style={[styles.toggleBtnText, viewMode === 'map' && styles.toggleBtnTextActive]}>
            Map
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
          onPress={() => setViewMode('list')}
        >
          <MaterialCommunityIcons
            name="format-list-bulleted"
            size={20}
            color={viewMode === 'list' ? '#fff' : '#004BA8'}
          />
          <Text style={[styles.toggleBtnText, viewMode === 'list' && styles.toggleBtnTextActive]}>
            List
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
          <MaterialCommunityIcons name="refresh" size={20} color="#004BA8" />
        </TouchableOpacity>
      </View>

      {/* Map View */}
      {viewMode === 'map' && students.length > 0 && (
        <MapView style={styles.map} region={mapRegion}>
          {students.map((student) => (
            <Marker
              key={student.id}
              coordinate={{
                latitude: student.location.latitude,
                longitude: student.location.longitude,
              }}
              title={student.name}
              description={student.studentId}
              pinColor={student.isOnline ? '#4CAF50' : '#FF9800'}
              onPress={() => setSelectedStudent(student)}
            />
          ))}
        </MapView>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <ScrollView
          style={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {students.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="map-marker-off" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No student locations available</Text>
            </View>
          ) : (
            students.map((student) => (
              <TouchableOpacity
                key={student.id}
                style={styles.studentCard}
                onPress={() => setSelectedStudent(student)}
              >
                <View style={styles.studentHeader}>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <Text style={styles.studentId}>ID: {student.studentId}</Text>
                    <Text style={styles.studentEmail}>{student.email}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      student.isOnline ? styles.statusOnline : styles.statusOffline,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={student.isOnline ? 'circle' : 'circle-outline'}
                      size={8}
                      color="#fff"
                    />
                    <Text style={styles.statusText}>
                      {student.isOnline ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
                {student.location && (
                  <View style={styles.locationInfo}>
                    <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
                    <Text style={styles.coordinates}>
                      {student.location.latitude.toFixed(6)}, {student.location.longitude.toFixed(6)}
                    </Text>
                    <Text style={styles.timestamp}>
                      Last: {formatTime(student.location.lastUpdate)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <Modal
          animationType="slide"
          transparent
          visible={!!selectedStudent}
          onRequestClose={() => setSelectedStudent(null)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedStudent(null)}>
                <MaterialCommunityIcons name="close" size={24} color="#004BA8" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Student Details</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.detailCard}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailValue}>{selectedStudent.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Student ID:</Text>
                  <Text style={styles.detailValue}>{selectedStudent.studentId}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{selectedStudent.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      selectedStudent.isOnline ? { color: '#4CAF50' } : { color: '#FF9800' },
                    ]}
                  >
                    {selectedStudent.isOnline ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailCard}>
                <Text style={styles.cardTitle}>Location Information</Text>
                {selectedStudent.location ? (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Latitude:</Text>
                      <Text style={styles.detailValue}>
                        {selectedStudent.location.latitude.toFixed(8)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Longitude:</Text>
                      <Text style={styles.detailValue}>
                        {selectedStudent.location.longitude.toFixed(8)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Last Update:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedStudent.location.lastUpdate).toLocaleString()}
                      </Text>
                    </View>
                  </>
                ) : (
                  <Text style={styles.noDataText}>No location data available</Text>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}

      {/* Empty state when no student locations */}
      {viewMode === 'map' && students.length === 0 && (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="map-marker-off" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No student locations available</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRefresh}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Student count at bottom */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Total: {students.length} | Active: {students.filter((s) => s.isOnline).length}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#004BA8',
  },
  toggleBtnActive: {
    backgroundColor: '#004BA8',
  },
  toggleBtnText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#004BA8',
  },
  toggleBtnTextActive: {
    color: '#fff',
  },
  refreshBtn: {
    padding: 8,
  },
  map: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  studentId: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  studentEmail: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusOnline: {
    backgroundColor: '#4CAF50',
  },
  statusOffline: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  coordinates: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#004BA8',
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  footerText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004BA8',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  detailCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  noDataText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default StudentLocationsScreen;
