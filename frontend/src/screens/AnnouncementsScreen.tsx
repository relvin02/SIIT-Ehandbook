import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { announcementsService } from '../services/apiClient';
import { Announcement } from '../types';

type AnnouncementsScreenProps = {
  navigation: any;
};

const AnnouncementsScreen: React.FC<AnnouncementsScreenProps> = ({
  navigation,
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementsService.getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnnouncements();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#004BA8" />
      </View>
    );
  }

  const pinnedAnnouncements = announcements.filter(a => a.isPinned);
  const otherAnnouncements = announcements.filter(a => !a.isPinned);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="bullhorn" size={40} color="#fff" />
          <Text style={styles.headerTitle}>Announcements</Text>
          <Text style={styles.headerSubtitle}>
            {announcements.length} announcement
            {announcements.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Pinned Announcements */}
        {pinnedAnnouncements.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="pin"
                size={18}
                color="#FF6B6B"
              />
              <Text style={styles.sectionTitle}>Pinned</Text>
            </View>

            {pinnedAnnouncements.map(announcement => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onPress={() => setSelectedAnnouncement(announcement)}
              />
            ))}
          </View>
        )}

        {/* Regular Announcements */}
        {otherAnnouncements.length > 0 && (
          <View style={styles.section}>
            {pinnedAnnouncements.length > 0 && (
              <Text style={styles.sectionTitle}>Recent</Text>
            )}

            {otherAnnouncements.map(announcement => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onPress={() => setSelectedAnnouncement(announcement)}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {announcements.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="inbox"
              size={50}
              color="#ddd"
            />
            <Text style={styles.emptyStateTitle}>No announcements</Text>
            <Text style={styles.emptyStateText}>
              Check back later for updates
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={!!selectedAnnouncement}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAnnouncement(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sweetAlertCard}>
            <View style={styles.sweetAlertIconContainer}>
              <MaterialCommunityIcons name="bullhorn" size={46} color="#4CAF50" />
            </View>
            <Text style={styles.sweetAlertTitle}>Announcement</Text>
            <Text style={styles.modalTitle}>{selectedAnnouncement?.title}</Text>
            <Text style={styles.modalDate}>{selectedAnnouncement ? new Date(selectedAnnouncement.createdAt).toLocaleDateString() : ''}</Text>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator>
              <Text style={styles.modalText}>{selectedAnnouncement?.content}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setSelectedAnnouncement(null)}
            >
              <Text style={styles.modalCloseText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

/**
 * Announcement Card Component
 */
const AnnouncementCard: React.FC<{ announcement: Announcement; onPress?: () => void }> = ({
  announcement,
  onPress,
}) => {
  const isNew = announcement.isNew ?? false;
  const createdDate = new Date(announcement.createdAt).toLocaleDateString();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.announcementCard,
        announcement.isPinned && styles.pinnedCard,
      ]}
    >
      <View style={styles.announcementHeader}>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Text style={styles.announcementTitle} numberOfLines={2}>
              {announcement.title}
            </Text>
            {announcement.isPinned && (
              <MaterialCommunityIcons
                name="pin"
                size={14}
                color="#FF6B6B"
                style={styles.pinIcon}
              />
            )}
          </View>
          <Text style={styles.announcementDate}>{createdDate}</Text>
        </View>
        {isNew && <View style={styles.newBadge} />}
      </View>

      <Text style={styles.announcementContent} numberOfLines={3}>
        {announcement.content}
      </Text>

      {announcement.content.length > 100 && (
        <TouchableOpacity
          style={styles.readMoreButton}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.readMoreText}>Read More</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={16}
            color="#004BA8"
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#004BA8',
    paddingVertical: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#ccc',
    marginTop: 5,
  },
  section: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  announcementCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#004BA8',
  },
  pinnedCard: {
    borderLeftColor: '#FF6B6B',
    backgroundColor: '#fff8fa',
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  announcementTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  pinIcon: {
    marginLeft: 8,
    marginTop: 2,
  },
  announcementDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  newBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B6B',
  },
  announcementContent: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 10,
    textAlign: 'justify',
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 12,
    color: '#004BA8',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#22313F',
  },
  modalDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  modalBody: {
    marginBottom: 14,
  },
  modalText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    textAlign: 'justify',
  },
  modalCloseBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCloseText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  sweetAlertCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
  },
  sweetAlertIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  sweetAlertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});

export default AnnouncementsScreen;
