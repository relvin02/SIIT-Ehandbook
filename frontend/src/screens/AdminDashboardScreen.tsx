import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { announcementsService, handbookService, userManagementService } from '../services/apiClient';

type AlertType = 'success' | 'error' | 'confirm';
type AlertState = {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  onConfirm?: () => void;
};
import { Announcement } from '../types';

type AdminDashboardScreenProps = {
  navigation: any;
};

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  navigation,
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', isPinned: false });
  const [sectionCount, setSectionCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);

  const [alertState, setAlertState] = useState<AlertState>({
    visible: false, type: 'success', title: '', message: '',
  });
  const showAlert = (type: AlertType, title: string, message: string, onConfirm?: () => void) => {
    setAlertState({ visible: true, type, title, message, onConfirm });
  };
  const closeAlert = () => setAlertState(prev => ({ ...prev, visible: false }));

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const [data, sections, students] = await Promise.all([
        announcementsService.getAnnouncements(),
        handbookService.getAllSections(),
        userManagementService.getStudents(),
      ]);
      setAnnouncements(data);
      setSectionCount(sections.length);
      setStudentCount(students.length);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showAlert('error', 'Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      showAlert('error', 'Error', 'Please fill in all fields');
      return;
    }

    try {
      const newAnnouncement = await announcementsService.createAnnouncement(formData);
      setAnnouncements([newAnnouncement, ...announcements]);
      setFormData({ title: '', content: '', isPinned: false });
      setShowForm(false);
      showAlert('success', 'Success', 'Announcement created');
    } catch (error) {
      showAlert('error', 'Error', 'Failed to create announcement');
    }
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    showAlert('confirm', 'Delete', 'Are you sure you want to delete this announcement?', async () => {
      try {
        await announcementsService.deleteAnnouncement(announcementId);
        setAnnouncements(announcements.filter(a => a.id !== announcementId));
        showAlert('success', 'Success', 'Announcement deleted');
      } catch (error) {
        showAlert('error', 'Error', 'Failed to delete announcement');
      }
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
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard icon="file-document" label="Sections" count={sectionCount.toString()} />
          <StatCard icon="bullhorn" label="Announcements" count={announcements.length.toString()} />
          <StatCard icon="account-group" label="Students" count={studentCount.toString()} />
        </View>

        {/* Media Management Button */}
        <TouchableOpacity
          style={styles.mediaButton}
          onPress={() => navigation.navigate('ManageMedia')}
        >
          <MaterialCommunityIcons name="multimedia" size={20} color="#fff" />
          <Text style={styles.mediaButtonText}>Manage Videos & SIIT Hymn</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Org Chart Button */}
        <TouchableOpacity
          style={[styles.mediaButton, { backgroundColor: '#004BA8' }]}
          onPress={() => navigation.navigate('OrgChart')}
        >
          <MaterialCommunityIcons name="sitemap" size={20} color="#fff" />
          <Text style={styles.mediaButtonText}>Organizational Chart</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Photo Gallery Button */}
        <TouchableOpacity
          style={[styles.mediaButton, { backgroundColor: '#6A1B9A' }]}
          onPress={() => navigation.navigate('Gallery')}
        >
          <MaterialCommunityIcons name="image-multiple" size={20} color="#fff" />
          <Text style={styles.mediaButtonText}>Photo Gallery</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Emergency Alerts Button */}
        <TouchableOpacity
          style={[styles.mediaButton, { backgroundColor: '#D32F2F' }]}
          onPress={() => navigation.navigate('EmergencyAlerts')}
        >
          <MaterialCommunityIcons name="alert-octagon" size={20} color="#fff" />
          <Text style={styles.mediaButtonText}>Emergency Alerts</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>

        {/* School Calendar Button */}
        <TouchableOpacity
          style={[styles.mediaButton, { backgroundColor: '#00796B' }]}
          onPress={() => navigation.navigate('SchoolCalendar')}
        >
          <MaterialCommunityIcons name="calendar-month" size={20} color="#fff" />
          <Text style={styles.mediaButtonText}>School Calendar</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Student Feedback Button */}
        <TouchableOpacity
          style={[styles.mediaButton, { backgroundColor: '#E65100' }]}
          onPress={() => navigation.navigate('FeedbackManagement')}
        >
          <MaterialCommunityIcons name="comment-text-multiple" size={20} color="#fff" />
          <Text style={styles.mediaButtonText}>Student Feedback</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Create Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowForm(!showForm)}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#fff" />
          <Text style={styles.createButtonText}>
            {showForm ? 'Cancel' : 'Create Announcement'}
          </Text>
        </TouchableOpacity>

        {/* Form */}
        {showForm && (
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor="#888"
              value={formData.title}
              onChangeText={text => setFormData({ ...formData, title: text })}
            />
            <TextInput
              style={[styles.input, styles.contentInput]}
              placeholder="Content"
              placeholderTextColor="#888"
              multiline
              numberOfLines={4}
              value={formData.content}
              onChangeText={text => setFormData({ ...formData, content: text })}
            />
            <TouchableOpacity
              style={styles.pinnedToggle}
              onPress={() =>
                setFormData({ ...formData, isPinned: !formData.isPinned })
              }
            >
              <MaterialCommunityIcons
                name={formData.isPinned ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={20}
                color="#004BA8"
              />
              <Text style={styles.pinnedToggleText}>Pin this announcement</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateAnnouncement}
            >
              <Text style={styles.submitButtonText}>Post Announcement</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Announcements List */}
        <View style={styles.announcementsContainer}>
          <Text style={styles.announcementsTitle}>Recent Announcements</Text>
          {announcements.map(announcement => (
            <AdminAnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onDelete={() => handleDeleteAnnouncement(announcement.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* SweetAlert-style Modal */}
      <Modal visible={alertState.visible} transparent animationType="fade" onRequestClose={closeAlert}>
        <View style={styles.sweetOverlay}>
          <View style={styles.sweetCard}>
            <View style={[
              styles.sweetIconCircle,
              alertState.type === 'success' && { backgroundColor: '#E8F5E9' },
              alertState.type === 'error' && { backgroundColor: '#FFEBEE' },
              alertState.type === 'confirm' && { backgroundColor: '#FFF3E0' },
            ]}>
              <MaterialCommunityIcons
                name={alertState.type === 'success' ? 'check-circle' : alertState.type === 'error' ? 'alert-circle' : 'help-circle'}
                size={44}
                color={alertState.type === 'success' ? '#4CAF50' : alertState.type === 'error' ? '#FF6B6B' : '#FF9800'}
              />
            </View>
            <Text style={styles.sweetTitle}>{alertState.title}</Text>
            <Text style={styles.sweetMessage}>{alertState.message}</Text>
            <View style={styles.sweetButtons}>
              {alertState.type === 'confirm' ? (
                <>
                  <TouchableOpacity style={styles.sweetCancelBtn} onPress={closeAlert}>
                    <Text style={styles.sweetCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sweetConfirmBtn, { backgroundColor: '#FF6B6B' }]}
                    onPress={() => { closeAlert(); alertState.onConfirm?.(); }}
                  >
                    <Text style={styles.sweetConfirmText}>Yes, Delete</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.sweetConfirmBtn, { backgroundColor: alertState.type === 'success' ? '#4CAF50' : '#FF6B6B' }]}
                  onPress={closeAlert}
                >
                  <Text style={styles.sweetConfirmText}>OK</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

/**
 * Stat Card Component
 */
const StatCard: React.FC<{ icon: string; label: string; count: string }> = ({
  icon,
  label,
  count,
}) => (
  <View style={styles.statCard}>
    <MaterialCommunityIcons name={icon as any} size={32} color="#004BA8" />
    <Text style={styles.statCount}>{count}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

/**
 * Admin Announcement Card
 */
const AdminAnnouncementCard: React.FC<{
  announcement: Announcement;
  onDelete: () => void;
}> = ({ announcement, onDelete }) => (
  <View style={styles.announcementCard}>
    <View style={styles.announcementHeader}>
      <View style={styles.announcementTitleContainer}>
        <Text style={styles.announcementTitle}>{announcement.title}</Text>
        {announcement.isPinned && (
          <MaterialCommunityIcons name="pin" size={14} color="#FF6B6B" />
        )}
      </View>
      <TouchableOpacity onPress={onDelete}>
        <MaterialCommunityIcons name="trash-can" size={18} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
    <Text style={styles.announcementDate}>
      {new Date(announcement.createdAt).toLocaleDateString()}
    </Text>
    <Text style={styles.announcementContent} numberOfLines={2}>
      {announcement.content}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    elevation: 2,
  },
  statCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#004BA8',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#1B5E20',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  mediaButtonText: {
    flex: 1,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#004BA8',
    borderRadius: 8,
    paddingVertical: 12,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  formContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
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
  contentInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pinnedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pinnedToggleText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#004BA8',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  announcementsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  announcementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  announcementCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#004BA8',
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  announcementTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  announcementTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  announcementDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  announcementContent: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    textAlign: 'justify',
  },
  sweetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sweetCard: {
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
  sweetIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  sweetTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sweetMessage: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  sweetButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  sweetCancelBtn: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sweetCancelText: {
    color: '#666',
    fontWeight: '700',
    fontSize: 14,
  },
  sweetConfirmBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sweetConfirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default AdminDashboardScreen;
