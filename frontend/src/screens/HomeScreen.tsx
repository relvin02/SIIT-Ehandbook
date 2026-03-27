import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';

const seahawksLogo = require('../assets/seahawks.png');
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { announcementsService } from '../services/apiClient';
import { announcementsActions } from '../store';
import { RootState } from '../store';
import { Announcement } from '../types';

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { announcements, loading } = useSelector(
    (state: RootState) => state.announcements
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      dispatch(announcementsActions.setLoading(true));
      const data = await announcementsService.getAnnouncements();
      dispatch(announcementsActions.setAnnouncements(data));
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      dispatch(
        announcementsActions.setError('Failed to load announcements')
      );
    } finally {
      dispatch(announcementsActions.setLoading(false));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnnouncements();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#004BA8" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Image source={require('../assets/siitlogo.png')} style={styles.headerLogo} resizeMode="contain" />
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>SIIT E-Handbook</Text>
              <Text style={styles.headerSubtitle}>Welcome, Seahawk!</Text>
            </View>
            <Image source={seahawksLogo} style={styles.headerLogo} resizeMode="contain" />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('HandbookTab')}
          >
            <MaterialCommunityIcons name="book" size={24} color="#004BA8" />
            <Text style={styles.quickActionText}>Browse Handbook</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('SearchTab')}
          >
            <MaterialCommunityIcons name="magnify" size={24} color="#004BA8" />
            <Text style={styles.quickActionText}>Search</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('BookmarksTab')}
          >
            <MaterialCommunityIcons name="bookmark" size={24} color="#004BA8" />
            <Text style={styles.quickActionText}>Bookmarks</Text>
          </TouchableOpacity>
        </View>

        {/* Latest Announcements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📢 Latest Announcements</Text>

          {announcements.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="inbox" size={40} color="#ccc" />
              <Text style={styles.emptyStateText}>No announcements yet</Text>
            </View>
          ) : (
            announcements.slice(0, 3).map((announcement: Announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
              />
            ))
          )}
        </View>

        {/* Info Cards */}
        <View style={styles.infoCardsContainer}>
          <InfoCard
            title="📚 Handbook"
            description="Access complete school policies and guidelines"
          />
          <InfoCard
            title="📞 Need Help?"
            description="Contact student services for support"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Announcement Card Component
 */
const AnnouncementCard: React.FC<{ announcement: Announcement }> = ({
  announcement,
}) => {
  const isNew = announcement.isNew ?? false;
  const createdDate = new Date(announcement.createdAt).toLocaleDateString();

  return (
    <View style={styles.announcementCard}>
      <View style={styles.announcementHeader}>
        <View style={styles.announcementTitleContainer}>
          <Text style={styles.announcementTitle}>{announcement.title}</Text>
          {isNew && <View style={styles.newBadge} />}
        </View>
        {announcement.isPinned && (
          <MaterialCommunityIcons name="pin" size={16} color="#FF6B6B" />
        )}
      </View>
      <Text style={styles.announcementDate}>{createdDate}</Text>
      <Text style={styles.announcementContent} numberOfLines={3}>
        {announcement.content}
      </Text>
    </View>
  );
};

/**
 * Info Card Component
 */
const InfoCard: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => (
  <View style={styles.infoCard}>
    <Text style={styles.infoTitle}>{title}</Text>
    <Text style={styles.infoDescription}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    backgroundColor: '#1B5E20',
    padding: 25,
    paddingTop: 40,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerLogo: {
    width: 60,
    height: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 5,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: -20,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: '30%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionText: {
    fontSize: 11,
    color: '#004BA8',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  newBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B6B',
    marginLeft: 10,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  infoCardsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  infoDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    textAlign: 'justify',
  },
});

export default HomeScreen;
