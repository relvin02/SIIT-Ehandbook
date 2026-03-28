import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { handbookService } from '../services/apiClient';
import { HandbookSection, HandbookCategory } from '../types';

type AlertType = 'success' | 'error' | 'confirm';
type AlertState = {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  onConfirm?: () => void;
};

type EditSectionScreenProps = {
  navigation: any;
};

const EditSectionScreen: React.FC<EditSectionScreenProps> = ({ navigation }) => {
  const [sections, setSections] = useState<HandbookSection[]>([]);
  const [categories, setCategories] = useState<HandbookCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
  });

  // Edit state
  const [editingSection, setEditingSection] = useState<HandbookSection | null>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '', categoryId: '' });

  // Alert state
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false, type: 'success', title: '', message: '',
  });
  const showAlert = (type: AlertType, title: string, message: string, onConfirm?: () => void) => {
    setAlertState({ visible: true, type, title, message, onConfirm });
  };
  const closeAlert = () => setAlertState(prev => ({ ...prev, visible: false }));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sectionsData, categoriesData] = await Promise.all([
        handbookService.getAllSections(),
        handbookService.getCategories(),
      ]);
      setSections(sectionsData);
      setCategories(categoriesData);
    } catch (error) {
      showAlert('error', 'Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = async () => {
    if (
      !formData.title.trim() ||
      !formData.content.trim() ||
      !formData.categoryId
    ) {
      showAlert('error', 'Error', 'Please fill in all fields');
      return;
    }

    try {
      const newSection = await handbookService.createSection(formData);
      setSections([newSection, ...sections]);
      setFormData({ title: '', content: '', categoryId: '' });
      setShowForm(false);
      showAlert('success', 'Success', 'Section created');
    } catch (error: any) {
      console.error('Create section error:', error.response?.data || error.message);
      showAlert('error', 'Error', error.response?.data?.message || 'Failed to create section');
    }
  };

  const handleDeleteSection = (sectionId: string) => {
    showAlert('confirm', 'Delete', 'Are you sure you want to delete this section?', async () => {
      try {
        await handbookService.deleteSection(sectionId);
        setSections(sections.filter(s => s.id !== sectionId));
        showAlert('success', 'Success', 'Section deleted');
      } catch (error) {
        showAlert('error', 'Error', 'Failed to delete section');
      }
    });
  };

  const handleEditSection = (section: HandbookSection) => {
    setEditingSection(section);
    setEditForm({
      title: section.title,
      content: section.content,
      categoryId: section.categoryId,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingSection) return;
    if (!editForm.title.trim() || !editForm.content.trim() || !editForm.categoryId) {
      showAlert('error', 'Error', 'Please fill in all fields');
      return;
    }
    try {
      const updated = await handbookService.updateSection(editingSection.id, editForm);
      setSections(sections.map(s => s.id === editingSection.id ? { ...s, ...updated } : s));
      setEditingSection(null);
      showAlert('success', 'Success', 'Section updated');
    } catch (error: any) {
      showAlert('error', 'Error', error.response?.data?.message || 'Failed to update section');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#004BA8" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Create Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowForm(!showForm)}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#fff" />
          <Text style={styles.createButtonText}>
            {showForm ? 'Cancel' : 'Create New Section'}
          </Text>
        </TouchableOpacity>

        {/* Form */}
        {showForm && (
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Section Title"
              value={formData.title}
              onChangeText={text => setFormData({ ...formData, title: text })}
            />

            {/* Category Dropdown */}
            <View style={styles.categoryDropdown}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryList}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryOption,
                      formData.categoryId === cat.id &&
                        styles.categoryOptionActive,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, categoryId: cat.id })
                    }
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        formData.categoryId === cat.id &&
                          styles.categoryOptionTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={[styles.input, styles.contentInput]}
              placeholder="Section Content"
              multiline
              numberOfLines={6}
              value={formData.content}
              onChangeText={text =>
                setFormData({ ...formData, content: text })
              }
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateSection}
            >
              <Text style={styles.submitButtonText}>Create Section</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sections List */}
        <View style={styles.sectionsContainer}>
          <Text style={styles.sectionsTitle}>All Sections ({sections.length})</Text>
          {sections.map(section => (
            <AdminSectionCard
              key={section.id}
              section={section}
              onEdit={() => handleEditSection(section)}
              onDelete={() => handleDeleteSection(section.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Edit Section Modal */}
      {editingSection && (
        <Modal transparent animationType="fade" visible={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.editModalContent}>
              <Text style={styles.editModalTitle}>Edit Section</Text>
              <ScrollView
                style={styles.editModalScroll}
                contentContainerStyle={{ paddingBottom: 16 }}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
              >
                <TextInput
                  style={styles.input}
                  placeholder="Section Title"
                  value={editForm.title}
                  onChangeText={text => setEditForm({ ...editForm, title: text })}
                />
                <View style={styles.categoryDropdown}>
                  <Text style={styles.label}>Category</Text>
                  <View style={styles.categoryList}>
                    {categories.map(cat => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryOption,
                          editForm.categoryId === cat.id && styles.categoryOptionActive,
                        ]}
                        onPress={() => setEditForm({ ...editForm, categoryId: cat.id })}
                      >
                        <Text
                          style={[
                            styles.categoryOptionText,
                            editForm.categoryId === cat.id && styles.categoryOptionTextActive,
                          ]}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <TextInput
                  style={[styles.input, styles.editContentInput]}
                  placeholder="Section Content"
                  multiline
                  value={editForm.content}
                  onChangeText={text => setEditForm({ ...editForm, content: text })}
                />
              </ScrollView>
              <View style={styles.editModalButtons}>
                <TouchableOpacity
                  style={styles.editCancelBtn}
                  onPress={() => setEditingSection(null)}
                >
                  <Text style={styles.editCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.editSaveBtn} onPress={handleSaveEdit}>
                  <Text style={styles.editSaveText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

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

/**
 * Admin Section Card
 */
const AdminSectionCard: React.FC<{
  section: HandbookSection;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ section, onEdit, onDelete }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        <MaterialCommunityIcons
          name="file-document"
          size={20}
          color="#004BA8"
        />
        <View style={styles.sectionInfo}>
          <Text style={styles.sectionTitle} numberOfLines={2}>
            {section.title}
          </Text>
          <Text style={styles.sectionCategory}>{section.categoryName}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editIconBtn} onPress={onEdit}>
          <MaterialCommunityIcons name="pencil" size={18} color="#004BA8" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteIconBtn} onPress={onDelete}>
          <MaterialCommunityIcons name="trash-can" size={18} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
    <Text style={styles.sectionDate}>
      {new Date(section.createdAt).toLocaleDateString()}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
    marginVertical: 15,
    backgroundColor: '#004BA8',
    borderRadius: 8,
    paddingVertical: 12,
  },
  createButtonText: {
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
  contentInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  categoryDropdown: {
    marginBottom: 12,
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  categoryOptionActive: {
    backgroundColor: '#004BA8',
    borderColor: '#004BA8',
  },
  categoryOptionText: {
    fontSize: 12,
    color: '#666',
  },
  categoryOptionTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#004BA8',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  sectionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sectionTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sectionInfo: {
    flex: 1,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionCategory: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  sectionDate: {
    fontSize: 11,
    color: '#999',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editIconBtn: {
    padding: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
  },
  deleteIconBtn: {
    padding: 6,
    backgroundColor: '#FFEBEE',
    borderRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '85%',
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  editContentInput: {
    minHeight: 200,
    textAlignVertical: 'top',
  },
  editModalScroll: {
    maxHeight: '72%',
  },
  editModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  editCancelBtn: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  editCancelText: {
    color: '#666',
    fontWeight: '700',
    fontSize: 14,
  },
  editSaveBtn: {
    flex: 1,
    backgroundColor: '#004BA8',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  editSaveText: {
    color: '#fff',
    fontWeight: '700',
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

export default EditSectionScreen;
