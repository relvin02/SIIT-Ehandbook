import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { searchService } from '../services/apiClient';
import { searchActions } from '../store';
import { RootState } from '../store';
import { SearchResult } from '../types';
import { useDebouncedCallback } from 'use-debounce';

type SearchScreenProps = {
  navigation: any;
};

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { query, results, isSearching } = useSelector(
    (state: RootState) => state.search
  );
  const [localQuery, setLocalQuery] = useState('');

  // Debounced search function
  const performSearch = useDebouncedCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      dispatch(searchActions.clearSearch());
      return;
    }

    try {
      dispatch(searchActions.setQuery(searchQuery));
      dispatch(searchActions.setIsSearching(true));

      const data = await searchService.search(searchQuery);
      dispatch(searchActions.setResults(data || []));
    } catch (error) {
      console.error('Search failed:', error);
      dispatch(searchActions.setResults([]));
    } finally {
      dispatch(searchActions.setIsSearching(false));
    }
  }, 500);

  const handleInputChange = (text: string) => {
    setLocalQuery(text);
    performSearch(text);
  };

  const clearSearch = () => {
    setLocalQuery('');
    dispatch(searchActions.clearSearch());
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search handbook, announcements..."
          placeholderTextColor="#999"
          value={localQuery}
          onChangeText={handleInputChange}
        />
        {localQuery && (
          <TouchableOpacity onPress={clearSearch}>
            <MaterialCommunityIcons name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#004BA8" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : results.length === 0 && query ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="magnify"
            size={50}
            color="#ddd"
          />
          <Text style={styles.emptyStateTitle}>No results found</Text>
          <Text style={styles.emptyStateText}>
            Try different keywords or check your spelling
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="information"
            size={50}
            color="#ddd"
          />
          <Text style={styles.emptyStateTitle}>Start searching</Text>
          <Text style={styles.emptyStateText}>
            Enter keywords to search handbook content
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ResultCard result={item} navigation={navigation} />
          )}
          contentContainerStyle={styles.resultsList}
        />
      )}
    </SafeAreaView>
  );
};

/**
 * Search Result Card Component
 */
const ResultCard: React.FC<{
  result: SearchResult;
  navigation: any;
}> = ({ result, navigation }) => {
  const handlePress = () => {
    if (result.type === 'section') {
      navigation.navigate('SectionDetail', { sectionId: result.id });
    }
  };

  return (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={handlePress}
      disabled={result.type !== 'section'}
    >
      <View style={styles.resultHeader}>
        <MaterialCommunityIcons
          name={result.type === 'section' ? 'file-document' : 'bullhorn'}
          size={24}
          color="#004BA8"
          style={styles.resultIcon}
        />
        <View style={styles.resultTitleContainer}>
          <Text style={styles.resultType}>
            {result.type === 'section' ? '📖 Section' : '📢 Announcement'}
          </Text>
          <Text style={styles.resultTitle} numberOfLines={2}>
            {result.title}
          </Text>
        </View>
      </View>

      <View style={styles.relevanceContainer}>
        <View style={styles.relevanceBars}>
          {[...Array(5)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.relevanceBar,
                i < Math.round(result.relevance * 5) &&
                  styles.relevanceBarFilled,
              ]}
            />
          ))}
        </View>
        <Text style={styles.relevanceText}>
          {Math.round(result.relevance * 100)}% match
        </Text>
      </View>

      <Text style={styles.resultContent} numberOfLines={3}>
        {result.highlightedContent}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  resultsList: {
    padding: 15,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  resultIcon: {
    marginRight: 12,
  },
  resultTitleContainer: {
    flex: 1,
  },
  resultType: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  relevanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  relevanceBars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  relevanceBar: {
    width: 4,
    height: 12,
    backgroundColor: '#e0e0e0',
    marginRight: 3,
    borderRadius: 2,
  },
  relevanceBarFilled: {
    backgroundColor: '#004BA8',
  },
  relevanceText: {
    fontSize: 11,
    color: '#999',
  },
  resultContent: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    textAlign: 'justify',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
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
});

export default SearchScreen;
