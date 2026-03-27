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
  FlatList,
  Image,
} from 'react-native';

const siitLogo = require('../assets/siitlogo.png');
const seahawksLogo = require('../assets/seahawks.png');
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { handbookService } from '../services/apiClient';
import { handbookActions } from '../store';
import { RootState } from '../store';
import { HandbookCategory, HandbookSection } from '../types';

type HandbookScreenProps = {
  navigation: any;
};

const HandbookScreen: React.FC<HandbookScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { sections, selectedCategory, loading } = useSelector(
    (state: RootState) => state.handbook
  );
  const [categories, setCategories] = useState<HandbookCategory[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      dispatch(handbookActions.setLoading(true));

      // Load categories
      const categoriesData = await handbookService.getCategories();
      setCategories(categoriesData);

      // Load all sections initially
      const sectionsData = await handbookService.getAllSections();
      dispatch(handbookActions.setSections(sectionsData));

      // Set first category as default
      if (categoriesData.length > 0) {
        dispatch(handbookActions.setSelectedCategory(categoriesData[0].id));
      }
    } catch (error) {
      console.error('Failed to load handbook data:', error);
      dispatch(handbookActions.setError('Failed to load handbook'));
    } finally {
      dispatch(handbookActions.setLoading(false));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleCategoryChange = (categoryId: string) => {
    dispatch(handbookActions.setSelectedCategory(categoryId));
  };

  const filteredSections = selectedCategory
    ? sections.filter(s => s.categoryId === selectedCategory)
    : sections;

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
        {/* Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Image source={siitLogo} style={styles.headerLogo} resizeMode="contain" />
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>SIIT Handbook</Text>
            </View>
            <Image source={seahawksLogo} style={styles.headerLogo} resizeMode="contain" />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.categoriesLabel}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesList}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryBtn,
                  selectedCategory === category.id && styles.activeCategoryBtn,
                ]}
                onPress={() => handleCategoryChange(category.id)}
              >
                <Text
                  style={[
                    styles.categoryBtnText,
                    selectedCategory === category.id &&
                      styles.activeCategoryBtnText,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sections List */}
        <View style={styles.sectionsContainer}>
          {filteredSections.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="inbox" size={40} color="#ccc" />
              <Text style={styles.emptyStateText}>
                No sections in this category
              </Text>
            </View>
          ) : (
            filteredSections.map(section => (
              <SectionCard
                key={section.id}
                section={section}
                onPress={() =>
                  navigation.navigate('SectionDetail', { sectionId: section.id })
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Section Card Component
 */
const SectionCard: React.FC<{
  section: HandbookSection;
  onPress: () => void;
}> = ({ section, onPress }) => {
  // Truncate content to 100 characters
  const preview = section.content.substring(0, 100) + '...';

  return (
    <TouchableOpacity style={styles.sectionCard} onPress={onPress}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons
          name="file-document"
          size={24}
          color="#004BA8"
          style={styles.sectionIcon}
        />
        <Text style={styles.sectionTitle} numberOfLines={2}>
          {section.title}
        </Text>
      </View>
      <Text style={styles.sectionCategory}>{section.categoryName}</Text>
      <Text style={styles.sectionPreview} numberOfLines={2}>
        {preview}
      </Text>
      <View style={styles.sectionFooter}>
        <Text style={styles.sectionDate}>
          {new Date(section.createdAt).toLocaleDateString()}
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color="#999"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    backgroundColor: '#1B5E20',
    padding: 20,
    paddingTop: 30,
    paddingBottom: 30,
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
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerLogo: {
    width: 55,
    height: 55,
  },
  categoriesContainer: {
    paddingTop: 15,
    paddingBottom: 10,
  },
  categoriesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  categoriesList: {
    paddingHorizontal: 15,
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  activeCategoryBtn: {
    backgroundColor: '#004BA8',
    borderColor: '#004BA8',
  },
  categoryBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeCategoryBtnText: {
    color: '#fff',
  },
  sectionsContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 20,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sectionIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionCategory: {
    fontSize: 12,
    color: '#999',
    marginVertical: 8,
  },
  sectionPreview: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginVertical: 8,
    textAlign: 'justify',
  },
  sectionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  sectionDate: {
    fontSize: 11,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
});

export default HandbookScreen;
