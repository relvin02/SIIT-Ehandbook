import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mediaService } from '../services/apiClient';

type AlertType = 'success' | 'error' | 'confirm';
type AlertState = {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  onConfirm?: () => void;
};

const ManageMediaScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'video' as 'video' | 'audio',
    url: '',
    description: '',
    lyrics: '',
  });

  const [alertState, setAlertState] = useState<AlertState>({
    visible: false, type: 'success', title: '', message: '',
  });
  const showAlert = (type: AlertType, title: string, message: string, onConfirm?: () => void) => {
    setAlertState({ visible: true, type, title, message, onConfirm });
  };
  const closeAlert = () => setAlertState(prev => ({ ...prev, visible: false }));

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const data = await mediaService.getAll();
      setMediaList(data || []);
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', type: 'video', url: '', description: '', lyrics: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.url.trim()) {
      showAlert('error', 'Error', 'Title and URL are required');
      return;
    }

    try {
      if (editingId) {
        const updated = await mediaService.update(editingId, formData);
        setMediaList(mediaList.map(m => m.id === editingId ? updated : m));
        showAlert('success', 'Updated!', 'Media updated successfully');
      } else {
        const created = await mediaService.create(formData);
        setMediaList([created, ...mediaList]);
        showAlert('success', 'Added!', 'Media added successfully');
      }
      resetForm();
    } catch (error) {
      showAlert('error', 'Error', 'Failed to save media');
    }
  };

  const handleEdit = (item: any) => {
    setFormData({
      title: item.title,
      type: item.type,
      url: item.url,
      description: item.description || '',
      lyrics: item.lyrics || '',
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    showAlert('confirm', 'Delete', 'Are you sure you want to delete this?', async () => {
      try {
        await mediaService.delete(id);
        setMediaList(mediaList.filter(m => m.id !== id));
        showAlert('success', 'Deleted!', 'Media deleted successfully');
      } catch (error) {
        showAlert('error', 'Error', 'Failed to delete media');
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#004BA8" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Media Management</Text>
          <Text style={styles.headerSubtitle}>Manage videos & SIIT Hymn</Text>
        </View>

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => { resetForm(); setShowForm(!showForm); }}
        >
          <MaterialCommunityIcons name={showForm ? 'close' : 'plus'} size={20} color="#fff" />
          <Text style={styles.addButtonText}>{showForm ? 'Cancel' : 'Add Media'}</Text>
        </TouchableOpacity>

        {/* Form */}
        {showForm && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>{editingId ? 'Edit Media' : 'Add New Media'}</Text>

            {/* Type Toggle */}
            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={[styles.typeBtn, formData.type === 'video' && styles.typeBtnActive]}
                onPress={() => setFormData({ ...formData, type: 'video' })}
              >
                <MaterialCommunityIcons name="video" size={18} color={formData.type === 'video' ? '#fff' : '#666'} />
                <Text style={[styles.typeBtnText, formData.type === 'video' && styles.typeBtnTextActive]}>Video</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, formData.type === 'audio' && styles.typeBtnActive]}
                onPress={() => setFormData({ ...formData, type: 'audio' })}
              >
                <MaterialCommunityIcons name="music-note" size={18} color={formData.type === 'audio' ? '#fff' : '#666'} />
                <Text style={[styles.typeBtnText, formData.type === 'audio' && styles.typeBtnTextActive]}>SIIT Hymn</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Title (e.g., Through the Years 2024)"
              value={formData.title}
              onChangeText={text => setFormData({ ...formData, title: text })}
            />

            <TextInput
              style={styles.input}
              placeholder={formData.type === 'video' ? 'YouTube URL' : 'Audio URL (YouTube/Drive link)'}
              value={formData.url}
              onChangeText={text => setFormData({ ...formData, url: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={formData.description}
              onChangeText={text => setFormData({ ...formData, description: text })}
            />

            {formData.type === 'audio' && (
              <TextInput
                style={[styles.input, styles.lyricsInput]}
                placeholder="Paste SIIT Hymn lyrics here..."
                value={formData.lyrics}
                onChangeText={text => setFormData({ ...formData, lyrics: text })}
                multiline
                numberOfLines={10}
              />
            )}

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>{editingId ? 'Update' : 'Add Media'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Media List */}
        <View style={styles.listContainer}>
          {mediaList.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="multimedia" size={40} color="#ccc" />
              <Text style={styles.emptyText}>No media added yet</Text>
            </View>
          ) : (
            mediaList.map((item: any) => (
              <View key={item.id} style={styles.mediaCard}>
                <View style={styles.mediaCardHeader}>
                  <MaterialCommunityIcons
                    name={item.type === 'video' ? 'video' : 'music-note'}
                    size={24}
                    color="#1B5E20"
                  />
                  <View style={styles.mediaCardInfo}>
                    <Text style={styles.mediaCardTitle}>{item.title}</Text>
                    <Text style={styles.mediaCardType}>
                      {item.type === 'video' ? 'Video' : 'SIIT Hymn'}
                    </Text>
                  </View>
                  <View style={styles.mediaCardActions}>
                    <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionBtn}>
                      <MaterialCommunityIcons name="pencil" size={18} color="#004BA8" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                      <MaterialCommunityIcons name="trash-can" size={18} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.mediaCardUrl} numberOfLines={1}>{item.url}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* SweetAlert Modal */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#1B5E20',
    padding: 20,
    paddingTop: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
    marginVertical: 15,
    backgroundColor: '#004BA8',
    borderRadius: 8,
    paddingVertical: 12,
  },
  addButtonText: {
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
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  typeToggle: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 10,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  typeBtnActive: {
    backgroundColor: '#1B5E20',
    borderColor: '#1B5E20',
  },
  typeBtnText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  typeBtnTextActive: {
    color: '#fff',
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
  lyricsInput: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#1B5E20',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  mediaCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#1B5E20',
  },
  mediaCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediaCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  mediaCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  mediaCardType: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  mediaCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 6,
  },
  mediaCardUrl: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
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

export default ManageMediaScreen;
