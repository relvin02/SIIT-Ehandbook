import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
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

const BookmarksScreen: React.FC<BookmarksScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { bookmarks, loading } = useSelector(
    (state: RootState) => state.bookmarks
  );
  const [refreshing, setRefreshing] = useState(false);

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
    Alert.alert(
      'Remove Bookmark',
      `Remove "${bookmark.section?.title}" from bookmarks?`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: async () => {
            try {
              await bookmarksService.removeBookmark(bookmark.sectionId);
              dispatch(bookmarksActions.removeBookmark(bookmark.sectionId));
              Alert.alert('Success', 'Bookmark removed');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove bookmark');
            }
          },
          style: 'destructive',
        },
      ]
    );
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
                onPress={() =>
                  navigation.navigate('SectionDetail', {
                    sectionId: bookmark.sectionId,
                  })
                }
                onRemove={() => handleRemoveBookmark(bookmark)}
              />
            ))}
          </View>
        )}
      </ScrollView>
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
});

export default BookmarksScreen;
