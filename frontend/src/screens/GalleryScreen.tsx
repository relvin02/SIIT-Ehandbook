import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Dimensions,
  FlatList,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { galleryService } from '../services/apiClient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GalleryImage {
  _id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  order: number;
  createdAt: string;
}

const GalleryScreen = () => {
  const { role } = useSelector((state: any) => state.auth);
  const isAdmin = role === 'admin';

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fullscreen slideshow
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Admin: Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState<string | null>(null);
  const [formCategory, setFormCategory] = useState('General');
  const [saving, setSaving] = useState(false);

  // Admin: Edit
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);

  const fetchImages = useCallback(async () => {
    try {
      const category = activeCategory === 'All' ? undefined : activeCategory;
      const data = await galleryService.getAll(category);
      setImages(data || []);
    } catch (error) {
      console.error('Failed to fetch gallery:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCategory]);

  const fetchCategories = async () => {
    try {
      const cats = await galleryService.getCategories();
      setCategories(cats || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchImages();
    fetchCategories();
  }, [fetchImages]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchImages();
    fetchCategories();
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setFormImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const openAddModal = () => {
    setEditingImage(null);
    setFormTitle('');
    setFormDescription('');
    setFormImage(null);
    setFormCategory('General');
    setShowAddModal(true);
  };

  const openEditModal = (img: GalleryImage) => {
    setEditingImage(img);
    setFormTitle(img.title);
    setFormDescription(img.description);
    setFormImage(img.image);
    setFormCategory(img.category);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formImage) return;
    setSaving(true);
    try {
      const payload = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        image: formImage,
        category: formCategory.trim() || 'General',
      };

      if (editingImage) {
        await galleryService.update(editingImage._id, payload);
      } else {
        await galleryService.create(payload);
      }

      setShowAddModal(false);
      fetchImages();
      fetchCategories();
    } catch (error) {
      console.error('Failed to save image:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await galleryService.remove(id);
      fetchImages();
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const openSlideshow = (index: number) => {
    setCurrentIndex(index);
    setShowSlideshow(true);
  };

  const filteredImages = images;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#004BA8" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="image-multiple" size={32} color="#004BA8" />
          <Text style={styles.headerTitle}>Photo Gallery</Text>
          <Text style={styles.headerSubtitle}>SIIT Highlights & Memories</Text>
        </View>

        {/* Category Tabs */}
        {categories.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabs}
          >
            <TouchableOpacity
              style={[styles.categoryTab, activeCategory === 'All' && styles.categoryTabActive]}
              onPress={() => setActiveCategory('All')}
            >
              <Text style={[styles.categoryTabText, activeCategory === 'All' && styles.categoryTabTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryTab, activeCategory === cat && styles.categoryTabActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.categoryTabText, activeCategory === cat && styles.categoryTabTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Admin: Add button */}
        {isAdmin && (
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <MaterialCommunityIcons name="image-plus" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Upload Photo</Text>
          </TouchableOpacity>
        )}

        {/* Gallery Grid */}
        {filteredImages.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="image-off-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No photos yet</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredImages.map((img, index) => (
              <TouchableOpacity
                key={img._id}
                style={styles.gridItem}
                onPress={() => openSlideshow(index)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: img.image }} style={styles.gridImage} />
                <View style={styles.gridOverlay}>
                  <Text style={styles.gridTitle} numberOfLines={1}>{img.title}</Text>
                  {img.category !== 'General' && (
                    <View style={styles.gridBadge}>
                      <Text style={styles.gridBadgeText}>{img.category}</Text>
                    </View>
                  )}
                </View>

                {/* Admin actions */}
                {isAdmin && (
                  <View style={styles.gridActions}>
                    <TouchableOpacity
                      style={styles.gridEditBtn}
                      onPress={() => openEditModal(img)}
                    >
                      <MaterialCommunityIcons name="pencil" size={14} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.gridDeleteBtn}
                      onPress={() => handleDelete(img._id)}
                    >
                      <MaterialCommunityIcons name="delete" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Fullscreen Slideshow Modal */}
      {showSlideshow && (
        <Modal transparent animationType="fade" visible={true}>
          <View style={styles.slideshowContainer}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.slideshowClose}
              onPress={() => setShowSlideshow(false)}
            >
              <MaterialCommunityIcons name="close" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Counter */}
            <View style={styles.slideshowCounter}>
              <Text style={styles.slideshowCounterText}>
                {currentIndex + 1} / {filteredImages.length}
              </Text>
            </View>

            {/* Swipeable images */}
            <FlatList
              ref={flatListRef}
              data={filteredImages}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={currentIndex}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
              onMomentumScrollEnd={(e) => {
                const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setCurrentIndex(newIndex);
              }}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.slideshowSlide}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.slideshowImage}
                    resizeMode="contain"
                  />
                  <View style={styles.slideshowInfo}>
                    <Text style={styles.slideshowTitle}>{item.title}</Text>
                    {item.description ? (
                      <Text style={styles.slideshowDesc}>{item.description}</Text>
                    ) : null}
                  </View>
                </View>
              )}
            />

            {/* Dot indicators */}
            {filteredImages.length <= 20 && (
              <View style={styles.dotsContainer}>
                {filteredImages.map((_, idx) => (
                  <View
                    key={idx}
                    style={[styles.dot, idx === currentIndex && styles.dotActive]}
                  />
                ))}
              </View>
            )}
          </View>
        </Modal>
      )}

      {/* Admin: Add/Edit Modal */}
      {showAddModal && (
        <Modal transparent animationType="slide" visible={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingImage ? 'Edit Photo' : 'Upload Photo'}
              </Text>

              {/* Image picker */}
              <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
                {formImage ? (
                  <Image source={{ uri: formImage }} style={styles.imagePreview} />
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <MaterialCommunityIcons name="camera-plus" size={40} color="#999" />
                    <Text style={styles.imagePickerText}>Tap to select photo</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="Title (e.g. Passers List 2026)"
                placeholderTextColor="#999"
                value={formTitle}
                onChangeText={setFormTitle}
              />
              <TextInput
                style={[styles.input, { height: 60 }]}
                placeholder="Description (optional)"
                placeholderTextColor="#999"
                value={formDescription}
                onChangeText={setFormDescription}
                multiline
              />
              <TextInput
                style={styles.input}
                placeholder="Category (e.g. Passers, Events, Campus)"
                placeholderTextColor="#999"
                value={formCategory}
                onChangeText={setFormCategory}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>{editingImage ? 'Update' : 'Upload'}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#004BA8',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  // Category tabs
  categoryTabs: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
  },
  categoryTabActive: {
    backgroundColor: '#004BA8',
  },
  categoryTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  categoryTabTextActive: {
    color: '#fff',
  },
  // Add button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#004BA8',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  // Empty
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  gridItem: {
    width: (SCREEN_WIDTH - 24) / 2,
    height: (SCREEN_WIDTH - 24) / 2,
    margin: 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  gridTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  gridBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  gridBadgeText: {
    color: '#fff',
    fontSize: 10,
  },
  gridActions: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    gap: 4,
  },
  gridEditBtn: {
    backgroundColor: 'rgba(0,75,168,0.8)',
    padding: 6,
    borderRadius: 6,
  },
  gridDeleteBtn: {
    backgroundColor: 'rgba(211,47,47,0.8)',
    padding: 6,
    borderRadius: 6,
  },
  // Slideshow
  slideshowContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  slideshowClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 6,
  },
  slideshowCounter: {
    position: 'absolute',
    top: 55,
    left: 20,
    zIndex: 10,
  },
  slideshowCounterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  slideshowSlide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideshowImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  slideshowInfo: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
  },
  slideshowTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  slideshowDesc: {
    color: '#ddd',
    fontSize: 14,
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 20,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  imagePicker: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  imagePreview: {
    width: SCREEN_WIDTH - 96,
    height: 160,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#004BA8',
  },
  imagePickerPlaceholder: {
    width: SCREEN_WIDTH - 96,
    height: 160,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  imagePickerText: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
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
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#666',
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#004BA8',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default GalleryScreen;
