import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  Dimensions,
  Modal,
} from 'react-native';

const seahawksLogo = require('../assets/seahawks.png');
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { announcementsService, mediaService } from '../services/apiClient';
import { announcementsActions } from '../store';
import { RootState } from '../store';
import { Announcement } from '../types';

const SCREEN_WIDTH = Dimensions.get('window').width;

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { announcements, loading } = useSelector(
    (state: RootState) => state.announcements
  );
  const [refreshing, setRefreshing] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    fetchAnnouncements();
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const data = await mediaService.getVideos();
      setVideos(data || []);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    }
  };



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
    await Promise.all([fetchAnnouncements(), fetchVideos()]);
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
                onPress={() => setSelectedAnnouncement(announcement)}
              />
            ))
          )}
        </View>

        {/* Through the Years */}
        {videos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎬 Through the Years</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.videoScrollContainer}
            >
              {videos.map((video: any) => (
                <TouchableOpacity
                  key={video._id || video.id}
                  style={styles.videoCard}
                  onPress={() => setActiveVideo(video)}
                  activeOpacity={0.9}
                >
                  <Video
                    source={{ uri: video.url }}
                    style={styles.videoThumbnail}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay
                    isMuted
                    isLooping
                  />
                  <View style={styles.playOverlay}>
                    <MaterialCommunityIcons name="play-circle" size={40} color="rgba(255,255,255,0.9)" />
                  </View>
                  <View style={styles.videoCardBottom}>
                    <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
                    <Text style={styles.videoTapHint}>Tap to play with sound</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* SIIT Hymn Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.hymnButton}
            onPress={() => navigation.navigate('SIITHymn')}
          >
            <MaterialCommunityIcons name="music-note" size={28} color="#fff" />
            <View style={styles.hymnTextContainer}>
              <Text style={styles.hymnButtonTitle}>SIIT Hymn</Text>
              <Text style={styles.hymnButtonSubtitle}>Listen & view lyrics</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Org Chart Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.hymnButton, { backgroundColor: '#004BA8' }]}
            onPress={() => navigation.navigate('OrgChart')}
          >
            <MaterialCommunityIcons name="sitemap" size={28} color="#fff" />
            <View style={styles.hymnTextContainer}>
              <Text style={styles.hymnButtonTitle}>Organizational Chart</Text>
              <Text style={styles.hymnButtonSubtitle}>Board of Trustees & Officers</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Photo Gallery Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.hymnButton, { backgroundColor: '#6A1B9A' }]}
            onPress={() => navigation.navigate('Gallery')}
          >
            <MaterialCommunityIcons name="image-multiple" size={28} color="#fff" />
            <View style={styles.hymnTextContainer}>
              <Text style={styles.hymnButtonTitle}>Photo Gallery</Text>
              <Text style={styles.hymnButtonSubtitle}>Passers, events & highlights</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
          </TouchableOpacity>
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

      {/* In-App Video Player Modal */}
      <Modal
        visible={!!activeVideo}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveVideo(null)}
      >
        <View style={styles.videoModal}>
          <TouchableOpacity style={styles.videoModalClose} onPress={() => setActiveVideo(null)}>
            <MaterialCommunityIcons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.videoModalTitle} numberOfLines={2}>{activeVideo?.title}</Text>
          {activeVideo && (
            <Video
              source={{ uri: activeVideo.url }}
              style={styles.videoPlayer}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
            />
          )}
        </View>
      </Modal>

      <Modal
        visible={!!selectedAnnouncement}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedAnnouncement(null)}
      >
        <View style={styles.announcementModalOverlay}>
          <View style={styles.announcementModalContent}>
            <Text style={styles.announcementModalTitle}>{selectedAnnouncement?.title}</Text>
            <Text style={styles.announcementModalDate}>{selectedAnnouncement ? new Date(selectedAnnouncement.createdAt).toLocaleDateString() : ''}</Text>
            <ScrollView style={styles.announcementModalBody}>
              <Text style={styles.announcementModalText}>{selectedAnnouncement?.content}</Text>
            </ScrollView>
            <TouchableOpacity style={styles.announcementModalCloseBtn} onPress={() => setSelectedAnnouncement(null)}>
              <Text style={styles.announcementModalCloseText}>Close</Text>
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
      style={styles.announcementCard}
    >
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
    </TouchableOpacity>
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
    paddingTop: 45,
    paddingBottom: 45,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
    paddingHorizontal: 12,
    marginTop: -25,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    width: '31%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  quickActionText: {
    fontSize: 11,
    color: '#004BA8',
    fontWeight: '700',
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
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
  announcementModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  announcementModalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 15,
  },
  announcementModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22313F',
    marginBottom: 6,
  },
  announcementModalDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  announcementModalBody: {
    marginBottom: 12,
  },
  announcementModalText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    textAlign: 'justify',
  },
  announcementModalCloseBtn: {
    backgroundColor: '#004BA8',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  announcementModalCloseText: {
    color: '#fff',
    fontWeight: '700',
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
  videoCard: {
    width: SCREEN_WIDTH * 0.8,
    maxWidth: 360,
    marginRight: 12,
    borderRadius: 14,
    backgroundColor: '#000',
    alignSelf: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  videoScrollContainer: {
    paddingHorizontal: 15,
    flexGrow: 1,
    justifyContent: 'center',
  },
  videoThumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: '#111',
  },
  videoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  videoCardBottom: {
    padding: 12,
    backgroundColor: '#fff',
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  videoTapHint: {
    fontSize: 11,
    color: '#999',
    marginTop: 3,
  },
  videoModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  videoModalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 6,
  },
  videoModalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 40,
  },
  videoPlayer: {
    width: SCREEN_WIDTH - 32,
    height: (SCREEN_WIDTH - 32) * 9 / 16,
    borderRadius: 10,
    backgroundColor: '#000',
  },
  hymnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B5E20',
    borderRadius: 14,
    padding: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  hymnTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  hymnButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  hymnButtonSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
});

export default HomeScreen;
