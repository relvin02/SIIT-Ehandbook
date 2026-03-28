import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { handbookService, bookmarksService } from '../services/apiClient';
import { bookmarksActions } from '../store';
import { RootState } from '../store';
import { HandbookSection } from '../types';

type SectionDetailScreenProps = {
  route: any;
  navigation: any;
};

const SectionDetailScreen: React.FC<SectionDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { sectionId } = route.params;
  const [section, setSection] = useState<HandbookSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [alertState, setAlertState] = useState<{ visible: boolean; type: 'success' | 'error'; title: string; message: string }>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });
  const bookmarks = useSelector((state: RootState) => state.bookmarks.bookmarks);
  const dispatch = useDispatch();

  const showAlert = (type: 'success' | 'error', title: string, message: string) => {
    setAlertState({ visible: true, type, title, message });
  };
  const closeAlert = () => setAlertState(prev => ({ ...prev, visible: false }));

  useEffect(() => {
    fetchSection();
    checkIfBookmarked();
  }, [sectionId]);

  useEffect(() => {
    checkIfBookmarked();
  }, [bookmarks]);

  const fetchSection = async () => {
    try {
      setLoading(true);
      const data = await handbookService.getSectionDetail(sectionId);
      setSection(data);
    } catch (error) {
      console.error('Failed to fetch section:', error);
      showAlert('error', 'Error', 'Failed to load section');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const checkIfBookmarked = () => {
    const bookmarked = bookmarks.some(b => b.sectionId === sectionId);
    setIsBookmarked(bookmarked);
  };

  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        await bookmarksService.removeBookmark(sectionId);
        dispatch(bookmarksActions.removeBookmark(sectionId));
        setIsBookmarked(false);
        showAlert('success', 'Removed!', 'Bookmark removed');
      } else {
        const bookmark = await bookmarksService.addBookmark(sectionId);
        dispatch(bookmarksActions.addBookmark(bookmark));
        setIsBookmarked(true);
        showAlert('success', 'Success', 'Bookmark added');
      }
    } catch (error) {
      showAlert('error', 'Error', 'Failed to toggle bookmark');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out "${section?.title}" from SIIT E-Handbook`,
        title: section?.title,
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#004BA8" />
      </View>
    );
  }

  if (!section) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Section not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <MaterialCommunityIcons
            name="file-document"
            size={40}
            color="#fff"
          />
          <Text style={styles.headerTitle}>{section.title}</Text>
          <Text style={styles.headerCategory}>{section.categoryName}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, isBookmarked && styles.bookmarkActive]}
            onPress={handleBookmark}
          >
            <MaterialCommunityIcons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isBookmarked ? '#004BA8' : '#999'}
            />
            <Text
              style={[
                styles.actionButtonText,
                isBookmarked && styles.bookmarkActiveText,
              ]}
            >
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <MaterialCommunityIcons name="share" size={20} color="#999" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <View style={styles.metaInfo}>
            <View style={styles.metaPart}>
              <MaterialCommunityIcons name="calendar" size={14} color="#999" />
              <Text style={styles.metaText}>
                {new Date(section.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.metaPart}>
              <MaterialCommunityIcons name="account" size={14} color="#999" />
              <Text style={styles.metaText}>{section.createdBy}</Text>
            </View>
          </View>

          <Text style={styles.content}>{section.content}</Text>
        </View>

        {/* Related Sections Placeholder */}
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Other Sections in This Category</Text>
          <View style={styles.relatedItem}>
            <MaterialCommunityIcons
              name="file-document"
              size={16}
              color="#004BA8"
            />
            <Text style={styles.relatedItemText}>Browse related content</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={16}
              color="#999"
            />
          </View>
        </View>
      </ScrollView>

      {/* SweetAlert Modal */}
      <Modal
        visible={alertState.visible}
        transparent
        animationType="fade"
        onRequestClose={closeAlert}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertCard}>
            <View style={[
              styles.alertIconCircle,
              alertState.type === 'success' && { backgroundColor: '#E8F5E9' },
              alertState.type === 'error' && { backgroundColor: '#FFEBEE' },
            ]}>
              <MaterialCommunityIcons
                name={alertState.type === 'success' ? 'check-circle' : 'alert-circle'}
                size={44}
                color={alertState.type === 'success' ? '#4CAF50' : '#FF6B6B'}
              />
            </View>
            <Text style={styles.alertTitle}>{alertState.title}</Text>
            <Text style={styles.alertMessage}>{alertState.message}</Text>
            <TouchableOpacity
              style={[styles.alertBtn, { backgroundColor: alertState.type === 'success' ? '#4CAF50' : '#FF6B6B' }]}
              onPress={closeAlert}
            >
              <Text style={styles.alertBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    backgroundColor: '#004BA8',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    textAlign: 'center',
  },
  headerCategory: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#eee',
  },
  bookmarkActive: {
    borderColor: '#004BA8',
    backgroundColor: '#f0f7ff',
  },
  actionButtonText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  bookmarkActiveText: {
    color: '#004BA8',
  },
  contentContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 8,
    padding: 20,
    elevation: 1,
  },
  metaInfo: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 15,
  },
  metaPart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    color: '#999',
  },
  content: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    textAlign: 'justify',
  },
  relatedSection: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  relatedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  relatedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    elevation: 1,
  },
  relatedItemText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    marginLeft: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '85%',
    maxWidth: 320,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  alertIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  alertMessage: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 20,
  },
  alertBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  alertBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default SectionDetailScreen;
