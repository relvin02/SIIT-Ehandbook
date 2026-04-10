import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
  Modal,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { profileService } from '../services/apiClient';
import { authActions } from '../store';
import { RootState } from '../store';
import locationService from '../services/locationService';
import { useTheme } from '../config/ThemeContext';
import { disconnectSocket } from '../services/socketService';

type ProfileScreenProps = {
  navigation: any;
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, role } = useSelector((state: RootState) => state.auth);
  const { theme, isDark, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState<string | null>(null);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [sendingLocation, setSendingLocation] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    fetchProfile();
    if (role === 'student') {
      checkLocationPermission();
      checkTrackingStatus();
    }
  }, []);

  const checkLocationPermission = async () => {
    const hasPermission = await locationService.hasLocationPermission();
    setLocationPermission(hasPermission ? 'Granted' : 'Denied');
  };

  const checkTrackingStatus = () => {
    const isActive = locationService.isTrackingActive();
    setIsTrackingActive(isActive);
  };

  const testSendLocation = async () => {
    try {
      setSendingLocation(true);
      const location = await locationService.getCurrentLocation();
      
      if (!location) {
        Alert.alert('Error', 'Cannot get location. Check if permission is granted and GPS is enabled.');
        return;
      }

      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch('https://siit-ehandbook-api.onrender.com/api/location/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', `Location sent!\nLat: ${location.latitude.toFixed(4)}\nLng: ${location.longitude.toFixed(4)}`);
        checkTrackingStatus();
      } else {
        Alert.alert('Error', data.message || 'Failed to send location');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send location test');
    } finally {
      setSendingLocation(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
      setFormData(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const updated = await profileService.updateProfile(formData);
      setProfile(updated);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload an avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (result.canceled || !result.assets?.[0]?.base64) return;

    const asset = result.assets[0];
    const mimeType = asset.mimeType || 'image/jpeg';
    const base64Uri = `data:${mimeType};base64,${asset.base64}`;

    try {
      setUploadingAvatar(true);
      const updated = await profileService.updateProfile({ avatar: base64Uri });
      setProfile({ ...profile, avatar: updated.avatar || base64Uri });
      Alert.alert('Success', 'Avatar updated!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim()) {
      Alert.alert('Error', 'Please fill in both fields');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }
    try {
      setPasswordLoading(true);
      await profileService.changePassword(currentPassword, newPassword);
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert('Success', 'Password changed successfully');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userRole');
    disconnectSocket();
    dispatch(authActions.logout());
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#004BA8" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: theme.dark ? '#1E1E1E' : '#004BA8' }]}>
          <TouchableOpacity style={styles.profileAvatar} onPress={handlePickAvatar} disabled={uploadingAvatar}>
            {profile?.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
            ) : (
              <MaterialCommunityIcons name="account-circle" size={100} color="rgba(255,255,255,0.7)" />
            )}
            <View style={styles.avatarEditBadge}>
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MaterialCommunityIcons name="camera" size={16} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{profile?.name || 'User'}</Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>
              {role === 'admin' ? '🔐 Admin' : role === 'faculty' ? '🏫 Faculty' : '👤 Student'}
            </Text>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Personal Information</Text>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <MaterialCommunityIcons name="pencil" size={20} color="#004BA8" />
              </TouchableOpacity>
            )}
          </View>

          {isEditing ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={formData?.name}
                onChangeText={text => setFormData({ ...formData, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={formData?.email}
                onChangeText={text =>
                  setFormData({ ...formData, email: text })
                }
                editable={false}
              />
              {role !== 'admin' && role !== 'faculty' && (
                <TextInput
                  style={styles.input}
                  placeholder="Student ID"
                  value={formData?.studentId}
                  onChangeText={text =>
                    setFormData({ ...formData, studentId: text })
                  }
                  editable={false}
                />
              )}

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.buttonCancel}
                  onPress={() => {
                    setIsEditing(false);
                    setFormData(profile);
                  }}
                >
                  <Text style={styles.buttonCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonSave}
                  onPress={handleSaveProfile}
                >
                  <Text style={styles.buttonSaveText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <InfoField label="Email" value={profile?.email} />
              <InfoField label="Name" value={profile?.name} />
              {role !== 'admin' && role !== 'faculty' && (
                <InfoField label="Student ID" value={profile?.studentId} />
              )}
              <InfoField label="Role" value={role === 'admin' ? 'Administrator' : role === 'faculty' ? 'Faculty' : 'Student'} />
              <InfoField
                label="Member Since"
                value={new Date(profile?.createdAt).toLocaleDateString()}
              />
            </>
          )}
        </View>

        {/* Location Tracking Info - For Students Only */}
        {role === 'student' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location Tracking</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name={locationPermission === 'Granted' ? 'check-circle' : 'alert-circle'}
                  size={20}
                  color={locationPermission === 'Granted' ? '#4CAF50' : '#FF9800'}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Permission Status</Text>
                  <Text style={styles.infoValue}>{locationPermission || 'Checking...'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name={isTrackingActive ? 'signal-variant' : 'signal-off'}
                  size={20}
                  color={isTrackingActive ? '#4CAF50' : '#FF9800'}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Tracking Status</Text>
                  <Text style={styles.infoValue}>{isTrackingActive ? 'Active' : 'Inactive'}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.helperText}>
              📍 Location updates automatically in the background after login.
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Actions</Text>

          <TouchableOpacity
            style={[styles.actionItem, { backgroundColor: theme.card }]}
            onPress={() => { setShowPasswordModal(true); setCurrentPassword(''); setNewPassword(''); }}
          >
            <MaterialCommunityIcons name="lock-reset" size={20} color={theme.primary} />
            <Text style={[styles.actionText, { color: theme.text }]}>Change Password</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, { backgroundColor: theme.card }]}>
            <MaterialCommunityIcons name="bell" size={20} color={theme.primary} />
            <Text style={[styles.actionText, { color: theme.text }]}>Notification Preferences</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, { backgroundColor: theme.card }]} onPress={toggleTheme}>
            <MaterialCommunityIcons name={isDark ? 'weather-sunny' : 'weather-night'} size={20} color={isDark ? '#FFB300' : '#5C6BC0'} />
            <Text style={[styles.actionText, { color: theme.text }]}>{isDark ? 'Light Mode' : 'Dark Mode'}</Text>
            <MaterialCommunityIcons name={isDark ? 'toggle-switch' : 'toggle-switch-off'} size={28} color={isDark ? '#4CAF50' : theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, { backgroundColor: theme.card }]}>
            <MaterialCommunityIcons name="help-circle" size={20} color={theme.primary} />
            <Text style={[styles.actionText, { color: theme.text }]}>Help & Support</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={20} color="#FF6B6B" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIconCircle, { backgroundColor: '#E3F2FD' }]}>
              <MaterialCommunityIcons name="lock-reset" size={40} color="#004BA8" />
            </View>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.passwordInput}
              placeholder="New Password (min 6 characters)"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: '#004BA8' }, passwordLoading && { opacity: 0.6 }]}
                onPress={handleChangePassword}
                disabled={passwordLoading}
              >
                <Text style={styles.modalConfirmText}>{passwordLoading ? 'Saving...' : 'Change'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* SweetAlert-style Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <MaterialCommunityIcons name="logout" size={40} color="#FF6B6B" />
            </View>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to logout?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={confirmLogout}
              >
                <Text style={styles.modalConfirmText}>Yes, Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

/**
 * Info Field Component
 */
const InfoField: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View style={styles.infoField}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    backgroundColor: '#004BA8',
    paddingVertical: 40,
    alignItems: 'center',
  },
  profileAvatar: {
    marginBottom: 15,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    backgroundColor: '#004BA8',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  roleTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleTagText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  section: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  infoField: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    color: '#333',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  buttonCancel: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonCancelText: {
    color: '#666',
    fontWeight: '600',
  },
  buttonSave: {
    flex: 1,
    backgroundColor: '#004BA8',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonSaveText: {
    color: '#fff',
    fontWeight: '600',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
    marginBottom: 30,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  logoutButtonText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '85%',
    maxWidth: 340,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#666',
    fontWeight: '700',
    fontSize: 14,
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#004BA8',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 10,
    marginBottom: 12,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  passwordInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    color: '#333',
    width: '100%',
  },
});

export default ProfileScreen;
