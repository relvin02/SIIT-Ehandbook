import React, { useEffect, useState, useMemo } from 'react';
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
  Image,
  FlatList,
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
  avatar: string | null;
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
  const [clusterStudents, setClusterStudents] = useState<StudentLocation[]>([]);
  const [showClusterModal, setShowClusterModal] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 14.5995,
    longitude: 120.9842,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [error, setError] = useState<string | null>(null);

  // Cluster nearby students (within ~50m of each other)
  const CLUSTER_DISTANCE = 0.0005; // roughly 50 meters
  const clusteredMarkers = useMemo(() => {
    const clusters: { center: { latitude: number; longitude: number }; students: StudentLocation[] }[] = [];
    const assigned = new Set<string>();

    for (const student of students) {
      if (assigned.has(student.id) || !student.location) continue;

      const cluster: StudentLocation[] = [student];
      assigned.add(student.id);

      for (const other of students) {
        if (assigned.has(other.id) || !other.location) continue;
        const dLat = Math.abs(student.location.latitude - other.location.latitude);
        const dLng = Math.abs(student.location.longitude - other.location.longitude);
        if (dLat < CLUSTER_DISTANCE && dLng < CLUSTER_DISTANCE) {
          cluster.push(other);
          assigned.add(other.id);
        }
      }

      const avgLat = cluster.reduce((s, st) => s + st.location.latitude, 0) / cluster.length;
      const avgLng = cluster.reduce((s, st) => s + st.location.longitude, 0) / cluster.length;
      clusters.push({ center: { latitude: avgLat, longitude: avgLng }, students: cluster });
    }
    return clusters;
  }, [students]);

  useEffect(() => {
    fetchStudentLocations();
  }, []);

  const fetchStudentLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setStudents([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/location/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const validStudents = response.data.data.filter(
          (student: StudentLocation) =>
            student &&
            student.location &&
            typeof student.location.latitude === 'number' &&
            typeof student.location.longitude === 'number' &&
            isFinite(student.location.latitude) &&
            isFinite(student.location.longitude)
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
          
          // Validate region values
          if (isFinite(avgLat) && isFinite(avgLng)) {
            setMapRegion((prev) => ({
              ...prev,
              latitude: avgLat,
              longitude: avgLng,
            }));
          }
        }
      } else {
        setError('No student location data available.');
        setStudents([]);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      const errorMsg = err.response?.status === 403 
        ? 'You do not have permission to view student locations.'
        : err.message || 'Error fetching student locations. Please check your connection or try again.';
      setError(errorMsg);
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
        <MapView
          style={styles.map}
          initialRegion={mapRegion}
          mapType="hybrid"
        >
          {clusteredMarkers.map((cluster, index) => {
            const isCluster = cluster.students.length > 1;
            const student = cluster.students[0];

            if (isCluster) {
              // Cluster marker — teardrop pin with count
              return (
                <Marker
                  key={`cluster-${index}`}
                  coordinate={cluster.center}
                  onPress={() => {
                    setClusterStudents(cluster.students);
                    setShowClusterModal(true);
                  }}
                >
                  <View style={styles.pinContainer}>
                    <View style={[styles.pinTeardrop, { backgroundColor: '#004BA8' }]}>
                      <View style={styles.clusterBadge}>
                        <Text style={styles.clusterCount}>{cluster.students.length}</Text>
                      </View>
                      <MaterialCommunityIcons name="account-group" size={18} color="#fff" />
                    </View>
                    <View style={[styles.pinPoint, { borderTopColor: '#004BA8' }]} />
                  </View>
                </Marker>
              );
            }

            // Single student — standing pin with avatar
            if (!student.location || !isFinite(student.location.latitude) || !isFinite(student.location.longitude)) {
              return null;
            }

            return (
              <Marker
                key={student.id}
                coordinate={{
                  latitude: student.location.latitude,
                  longitude: student.location.longitude,
                }}
                onPress={() => setSelectedStudent(student)}
              >
                <View style={styles.pinContainer}>
                  {/* Teardrop pin body */}
                  <View style={[styles.pinTeardrop, { backgroundColor: student.isOnline ? '#004BA8' : '#FF9800' }]}>
                    {/* Avatar circle */}
                    <View style={styles.pinAvatarWrapper}>
                      {student.avatar ? (
                        <Image source={{ uri: student.avatar }} style={styles.pinAvatar} />
                      ) : (
                        <View style={[styles.pinAvatarPlaceholder, { backgroundColor: student.isOnline ? '#003380' : '#E65100' }]}>
                          <MaterialCommunityIcons name="account" size={20} color="#fff" />
                        </View>
                      )}
                    </View>
                  </View>
                  {/* Teardrop point */}
                  <View style={[styles.pinPoint, { borderTopColor: student.isOnline ? '#004BA8' : '#FF9800' }]} />
                </View>
              </Marker>
            );
          })}
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
                  {student.avatar ? (
                    <Image source={{ uri: student.avatar }} style={styles.studentAvatar} />
                  ) : (
                    <View style={styles.studentAvatarPlaceholder}>
                      <MaterialCommunityIcons name="account" size={28} color="#fff" />
                    </View>
                  )}
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

      {/* Cluster Students Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={showClusterModal}
        onRequestClose={() => setShowClusterModal(false)}
      >
        <View style={styles.clusterModalOverlay}>
          <View style={styles.clusterModalContent}>
            <View style={styles.clusterModalHeader}>
              <View style={styles.clusterModalHeaderLeft}>
                <MaterialCommunityIcons name="map-marker-multiple" size={24} color="#004BA8" />
                <Text style={styles.clusterModalTitle}>
                  {clusterStudents.length} Students at this location
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowClusterModal(false)}>
                <MaterialCommunityIcons name="close-circle" size={28} color="#999" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={clusterStudents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.clusterStudentRow}
                  onPress={() => {
                    setShowClusterModal(false);
                    setSelectedStudent(item);
                  }}
                >
                  {item.avatar ? (
                    <Image source={{ uri: item.avatar }} style={styles.clusterAvatar} />
                  ) : (
                    <View style={[styles.clusterAvatarPlaceholder, { backgroundColor: item.isOnline ? '#4CAF50' : '#FF9800' }]}>
                      <MaterialCommunityIcons name="account" size={22} color="#fff" />
                    </View>
                  )}
                  <View style={styles.clusterStudentInfo}>
                    <Text style={styles.clusterStudentName}>{item.name}</Text>
                    <Text style={styles.clusterStudentId}>ID: {item.studentId}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    item.isOnline ? styles.statusOnline : styles.statusOffline,
                  ]}>
                    <MaterialCommunityIcons
                      name={item.isOnline ? 'circle' : 'circle-outline'}
                      size={8}
                      color="#fff"
                    />
                    <Text style={styles.statusText}>
                      {item.isOnline ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.clusterSeparator} />}
            />
          </View>
        </View>
      </Modal>

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
              {/* Student Avatar */}
              <View style={styles.modalAvatarContainer}>
                {selectedStudent.avatar ? (
                  <Image source={{ uri: selectedStudent.avatar }} style={styles.modalAvatar} />
                ) : (
                  <View style={styles.modalAvatarPlaceholder}>
                    <MaterialCommunityIcons name="account" size={60} color="#fff" />
                  </View>
                )}
                <Text style={styles.modalStudentName}>{selectedStudent.name}</Text>
                <View style={[
                  styles.statusBadge,
                  selectedStudent.isOnline ? styles.statusOnline : styles.statusOffline,
                  { marginTop: 8 }
                ]}>
                  <MaterialCommunityIcons
                    name={selectedStudent.isOnline ? 'circle' : 'circle-outline'}
                    size={8}
                    color="#fff"
                  />
                  <Text style={styles.statusText}>
                    {selectedStudent.isOnline ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>

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
  // Google Maps-style teardrop pin marker
  pinContainer: {
    alignItems: 'center',
    width: 50,
    height: 62,
  },
  pinTeardrop: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    borderBottomLeftRadius: 23,
    borderBottomRightRadius: 4,
    transform: [{ rotate: '45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  pinAvatarWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    transform: [{ rotate: '-45deg' }],
    backgroundColor: '#fff',
  },
  pinAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  pinAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinPoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -6,
  },
  // Cluster badge
  clusterBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 3,
    transform: [{ rotate: '-45deg' }],
  },
  clusterCount: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  // Cluster modal
  clusterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  clusterModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: 20,
  },
  clusterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  clusterModalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clusterModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  clusterStudentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  clusterAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  clusterAvatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clusterStudentInfo: {
    flex: 1,
  },
  clusterStudentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  clusterStudentId: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  clusterSeparator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 70,
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
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  studentAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#004BA8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  modalAvatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#004BA8',
  },
  modalAvatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#004BA8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalStudentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
});

export default StudentLocationsScreen;
