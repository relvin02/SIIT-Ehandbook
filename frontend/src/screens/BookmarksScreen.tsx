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
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { bookmarksService } from '../services/apiClient';
import { bookmarksActions } from '../store';
import { RootState } from '../store';
import { Bookmark } from '../types';

type BookmarksScreenProps = {
  navigation: any;
};

type AlertType = 'success' | 'error' | 'confirm';
type AlertState = {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  onConfirm?: () => void;
};

const BookmarksScreen: React.FC<BookmarksScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { bookmarks, loading } = useSelector(
    (state: RootState) => state.bookmarks
  );
  const [refreshing, setRefreshing] = useState(false);

  const [alertState, setAlertState] = useState<AlertState>({
    visible: false, type: 'success', title: '', message: '',
  });
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);
  const showAlert = (type: AlertType, title: string, message: string, onConfirm?: () => void) => {
    setAlertState({ visible: true, type, title, message, onConfirm });
  };
  const closeAlert = () => setAlertState(prev => ({ ...prev, visible: false }));

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      dispatch(bookmarksActions.setLoading(true));
      const data = await bookmarksService.getBookmarks();
      dispatch(bookmarksActions.setBookmarks(data));
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
      dispatch(bookmarksActions.setError('Failed to load bookmarks'));
    } finally {
      dispatch(bookmarksActions.setLoading(false));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookmarks();
    setRefreshing(false);
  };

  const handleRemoveBookmark = (bookmark: Bookmark) => {
    showAlert('confirm', 'Remove Bookmark', `Remove "${bookmark.section?.title}" from bookmarks?`, async () => {
      try {
        await bookmarksService.removeBookmark(bookmark.sectionId);
        dispatch(bookmarksActions.removeBookmark(bookmark.sectionId));
        showAlert('success', 'Removed!', 'Bookmark removed successfully');
      } catch (error) {
        showAlert('error', 'Error', 'Failed to remove bookmark');
      }
    });
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
        {bookmarks.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="bookmark-outline"
              size={50}
              color="#ddd"
            />
            <Text style={styles.emptyStateTitle}>No bookmarks yet</Text>
            <Text style={styles.emptyStateText}>
              Start bookmarking important handbook sections
            </Text>
            <TouchableOpacity style={styles.browseButton}>
              <Text style={styles.browseButtonText}>Browse Handbook</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.bookmarksList}>
            {bookmarks.map(bookmark => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onPress={() => setSelectedBookmark(bookmark)}
                onRemove={() => handleRemoveBookmark(bookmark)}
              />
            ))}
          </View>
        )}
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
                    <Text style={styles.sweetConfirmText}>Yes, Remove</Text>
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
 * Bookmark Card Component
 */
const BookmarkCard: React.FC<{
  bookmark: Bookmark;
  onPress: () => void;
  onRemove: () => void;
}> = ({ bookmark, onPress, onRemove }) => {
  const section = bookmark.section;

  return (
    <View style={styles.bookmarkCard}>
      <TouchableOpacity style={styles.cardContent} onPress={onPress}>
        <MaterialCommunityIcons
          name="bookmark"
          size={24}
          color="#004BA8"
          style={styles.bookmarkIcon}
        />
        <View style={styles.cardTextContainer}>
          <Text style={styles.bookmarkTitle} numberOfLines={2}>
            {section?.title}
          </Text>
          <Text style={styles.bookmarkCategory}>{section?.categoryName}</Text>
          <Text style={styles.bookmarkDate}>
            Saved {new Date(bookmark.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
        <MaterialCommunityIcons name="close" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  bookmarksList: {
    padding: 15,
  },
  bookmarkCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 15,
    alignItems: 'flex-start',
  },
  bookmarkIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  cardTextContainer: {
    flex: 1,
  },
  bookmarkTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  bookmarkCategory: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  bookmarkDate: {
    fontSize: 11,
    color: '#999',
  },
  removeButton: {
    padding: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
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
    textAlign: 'center',
  },
  browseButton: {
    marginTop: 20,
    backgroundColor: '#004BA8',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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

export default BookmarksScreen;
