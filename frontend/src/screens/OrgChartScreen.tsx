import React, { useEffect, useState, useCallback } from 'react';
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
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { orgChartService } from '../services/apiClient';

interface OrgMember {
  _id: string;
  name: string;
  position: string;
  image: string | null;
  parentId: string | null;
  order: number;
  level: number;
  department: string | null;
}

const LEVEL_LABELS: Record<number, string> = {
  0: 'Chairman / President',
  1: 'Board of Trustees',
  2: 'Officers / Directors',
  3: 'Department Heads',
};

const DEPARTMENTS = ['BSIT', 'BSOA', 'BSTM', 'BSAIS', 'BSCRIM', 'BSED/BEED'] as const;

const OrgChartScreen = () => {
  const { role, user } = useSelector((state: any) => state.auth);
  const isAdmin = role === 'admin';
  const userDepartment: string | null = user?.department || null;

  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    isAdmin ? null : userDepartment
  );

  // Add/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<OrgMember | null>(null);
  const [formName, setFormName] = useState('');
  const [formPosition, setFormPosition] = useState('');
  const [formImage, setFormImage] = useState<string | null>(null);
  const [formLevel, setFormLevel] = useState(1);
  const [formOrder, setFormOrder] = useState(0);
  const [formDepartment, setFormDepartment] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      const dept = isAdmin ? (selectedDepartment || undefined) : (userDepartment || undefined);
      const data = await orgChartService.getAll(dept);
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch org chart:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDepartment, isAdmin, userDepartment]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMembers();
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setFormImage(base64);
    }
  };

  const openAddModal = (level: number) => {
    setEditingMember(null);
    setFormName('');
    setFormPosition('');
    setFormImage(null);
    setFormLevel(level);
    setFormOrder(members.filter(m => m.level === level).length);
    setFormDepartment(selectedDepartment);
    setShowModal(true);
  };

  const openEditModal = (member: OrgMember) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormPosition(member.position);
    setFormImage(member.image);
    setFormLevel(member.level);
    setFormOrder(member.order);
    setFormDepartment(member.department);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formPosition.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: formName.trim(),
        position: formPosition.trim(),
        image: formImage || undefined,
        level: formLevel,
        order: formOrder,
        department: formDepartment || undefined,
      };

      if (editingMember) {
        await orgChartService.update(editingMember._id, payload);
      } else {
        await orgChartService.create(payload);
      }

      setShowModal(false);
      fetchMembers();
    } catch (error) {
      console.error('Failed to save member:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await orgChartService.remove(id);
      fetchMembers();
    } catch (error) {
      console.error('Failed to delete member:', error);
    }
  };

  // Group members by level
  const groupedMembers = members.reduce<Record<number, OrgMember[]>>((acc, member) => {
    const level = member.level ?? 0;
    if (!acc[level]) acc[level] = [];
    acc[level].push(member);
    return acc;
  }, {});

  const sortedLevels = Object.keys(groupedMembers)
    .map(Number)
    .sort((a, b) => a - b);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#004BA8" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="sitemap" size={32} color="#004BA8" />
          <Text style={styles.headerTitle}>Organizational Chart</Text>
          <Text style={styles.headerSubtitle}>
            {selectedDepartment
              ? `${selectedDepartment} Department`
              : 'SIIT Board of Trustees & Officers'}
          </Text>
        </View>

        {/* Department Filter Tabs (Admin) */}
        {isAdmin && (
          <View style={styles.deptFilterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deptFilterScroll}>
              <TouchableOpacity
                style={[styles.deptTab, !selectedDepartment && styles.deptTabActive]}
                onPress={() => setSelectedDepartment(null)}
              >
                <Text style={[styles.deptTabText, !selectedDepartment && styles.deptTabTextActive]}>
                  All / General
                </Text>
              </TouchableOpacity>
              {DEPARTMENTS.map(dept => (
                <TouchableOpacity
                  key={dept}
                  style={[styles.deptTab, selectedDepartment === dept && styles.deptTabActive]}
                  onPress={() => setSelectedDepartment(dept)}
                >
                  <Text style={[styles.deptTabText, selectedDepartment === dept && styles.deptTabTextActive]}>
                    {dept}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Student: Show which department they see */}
        {!isAdmin && userDepartment && (
          <View style={styles.deptBanner}>
            <MaterialCommunityIcons name="school" size={16} color="#004BA8" />
            <Text style={styles.deptBannerText}>{userDepartment} Department</Text>
          </View>
        )}

        {sortedLevels.length === 0 && !isAdmin && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-group-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No org chart data available yet</Text>
          </View>
        )}

        {/* Render each level */}
        {sortedLevels.map((level) => (
          <View key={level} style={styles.levelSection}>
            <View style={styles.levelHeader}>
              <View style={[styles.levelBadge, { backgroundColor: getLevelColor(level) }]}>
                <Text style={styles.levelBadgeText}>
                  {LEVEL_LABELS[level] || `Level ${level}`}
                </Text>
              </View>
            </View>

            {/* Connector line from top */}
            {level > 0 && <View style={styles.connectorVertical} />}

            <View style={styles.membersRow}>
              {groupedMembers[level]
                .sort((a, b) => a.order - b.order)
                .map((member, idx) => (
                  <View key={member._id} style={styles.memberCardWrapper}>
                    {/* Horizontal connector between siblings */}
                    {idx > 0 && <View style={styles.connectorHorizontal} />}

                    <View style={[styles.memberCard, { borderTopColor: getLevelColor(level) }]}>
                      {/* Photo */}
                      <View style={styles.photoContainer}>
                        {member.image ? (
                          <Image source={{ uri: member.image }} style={styles.memberPhoto} />
                        ) : (
                          <View style={[styles.memberPhotoPlaceholder, { backgroundColor: getLevelColor(level) + '20' }]}>
                            <MaterialCommunityIcons name="account" size={40} color={getLevelColor(level)} />
                          </View>
                        )}
                      </View>

                      {/* Info */}
                      <Text style={styles.memberName} numberOfLines={2}>{member.name}</Text>
                      <Text style={styles.memberPosition} numberOfLines={2}>{member.position}</Text>

                      {/* Admin actions */}
                      {isAdmin && (
                        <View style={styles.memberActions}>
                          <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() => openEditModal(member)}
                          >
                            <MaterialCommunityIcons name="pencil" size={14} color="#004BA8" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => handleDelete(member._id)}
                          >
                            <MaterialCommunityIcons name="delete" size={14} color="#D32F2F" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
            </View>

            {/* Admin: Add member button per level */}
            {isAdmin && (
              <TouchableOpacity
                style={[styles.addMemberBtn, { borderColor: getLevelColor(level) }]}
                onPress={() => openAddModal(level)}
              >
                <MaterialCommunityIcons name="plus" size={16} color={getLevelColor(level)} />
                <Text style={[styles.addMemberBtnText, { color: getLevelColor(level) }]}>
                  Add {LEVEL_LABELS[level] || 'Member'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Admin: Add new level section */}
        {isAdmin && (
          <View style={styles.addLevelSection}>
            {[0, 1, 2, 3].filter(l => !sortedLevels.includes(l)).map(level => (
              <TouchableOpacity
                key={level}
                style={styles.addLevelBtn}
                onPress={() => openAddModal(level)}
              >
                <MaterialCommunityIcons name="plus-circle" size={20} color="#004BA8" />
                <Text style={styles.addLevelText}>Add {LEVEL_LABELS[level] || `Level ${level}`}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal transparent animationType="slide" visible={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingMember ? 'Edit Member' : 'Add Member'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {LEVEL_LABELS[formLevel] || `Level ${formLevel}`}
              </Text>

              {/* Photo picker */}
              <TouchableOpacity style={styles.photoPicker} onPress={handlePickImage}>
                {formImage ? (
                  <Image source={{ uri: formImage }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPickerPlaceholder}>
                    <MaterialCommunityIcons name="camera-plus" size={32} color="#999" />
                    <Text style={styles.photoPickerText}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#999"
                value={formName}
                onChangeText={setFormName}
              />
              <TextInput
                style={styles.input}
                placeholder="Position / Title"
                placeholderTextColor="#999"
                value={formPosition}
                onChangeText={setFormPosition}
              />

              {/* Department Picker */}
              {isAdmin && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 8 }}>
                    Department (optional — leave empty for general)
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <TouchableOpacity
                        style={[styles.formDeptOption, !formDepartment && styles.formDeptOptionActive]}
                        onPress={() => setFormDepartment(null)}
                      >
                        <Text style={[styles.formDeptText, !formDepartment && styles.formDeptTextActive]}>
                          General
                        </Text>
                      </TouchableOpacity>
                      {DEPARTMENTS.map(dept => (
                        <TouchableOpacity
                          key={dept}
                          style={[styles.formDeptOption, formDepartment === dept && styles.formDeptOptionActive]}
                          onPress={() => setFormDepartment(dept)}
                        >
                          <Text style={[styles.formDeptText, formDepartment === dept && styles.formDeptTextActive]}>
                            {dept}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowModal(false)}
                >
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
                    <Text style={styles.saveBtnText}>
                      {editingMember ? 'Update' : 'Add'}
                    </Text>
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

function getLevelColor(level: number): string {
  const colors = ['#004BA8', '#7B1FA2', '#E65100', '#2E7D32'];
  return colors[level % colors.length];
}

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
  deptFilterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  deptFilterScroll: {
    paddingHorizontal: 12,
    gap: 8,
    flexDirection: 'row',
  },
  deptTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
  },
  deptTabActive: {
    backgroundColor: '#004BA8',
  },
  deptTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  deptTabTextActive: {
    color: '#fff',
  },
  deptBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
  },
  deptBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#004BA8',
  },
  formDeptOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  formDeptOptionActive: {
    backgroundColor: '#004BA8',
    borderColor: '#004BA8',
  },
  formDeptText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  formDeptTextActive: {
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  levelSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  levelHeader: {
    marginBottom: 8,
  },
  levelBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  connectorVertical: {
    width: 2,
    height: 20,
    backgroundColor: '#ccc',
    marginBottom: 4,
  },
  connectorHorizontal: {
    width: 8,
    height: 2,
    backgroundColor: '#ccc',
    alignSelf: 'center',
  },
  membersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 8,
  },
  memberCardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: 130,
    borderTopWidth: 3,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  photoContainer: {
    marginBottom: 8,
  },
  memberPhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  memberPhotoPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  memberName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  memberPosition: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  editBtn: {
    backgroundColor: '#E3F2FD',
    padding: 6,
    borderRadius: 6,
  },
  deleteBtn: {
    backgroundColor: '#FFEBEE',
    padding: 6,
    borderRadius: 6,
  },
  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10,
  },
  addMemberBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addLevelSection: {
    padding: 16,
    gap: 8,
  },
  addLevelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addLevelText: {
    color: '#004BA8',
    fontWeight: '600',
    fontSize: 14,
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
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  photoPicker: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#004BA8',
  },
  photoPickerPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  photoPickerText: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
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

export default OrgChartScreen;
