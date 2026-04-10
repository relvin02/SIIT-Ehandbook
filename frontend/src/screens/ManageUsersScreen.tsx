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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { userManagementService } from '../services/apiClient';

type AlertType = 'success' | 'error' | 'confirm';

type AlertState = {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  onConfirm?: () => void;
};

type UserRole = 'student' | 'faculty' | 'admin';
type FilterTab = 'all' | UserRole;

type UserAccount = {
  id: string;
  name: string;
  studentId?: string;
  email?: string;
  role: UserRole;
  createdAt: string;
};

const ROLE_COLORS: Record<UserRole, string> = {
  student: '#004BA8',
  faculty: '#7B1FA2',
  admin: '#E65100',
};

const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Student',
  faculty: 'Faculty',
  admin: 'Admin',
};

const ROLE_ICONS: Record<UserRole, string> = {
  student: 'account',
  faculty: 'school',
  admin: 'shield-account',
};

const ManageUsersScreen: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [resetUser, setResetUser] = useState<UserAccount | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // Add form
  const [addName, setAddName] = useState('');
  const [addStudentId, setAddStudentId] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState<UserRole>('student');

  // Edit form
  const [editName, setEditName] = useState('');

  // Reset password form
  const [resetPassword, setResetPasswordVal] = useState('');

  // Custom alert modal
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });

  const showAlert = (type: AlertType, title: string, message: string, onConfirm?: () => void) => {
    setAlertState({ visible: true, type, title, message, onConfirm });
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userManagementService.getUsers();
      setUsers(data);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      showAlert('error', 'Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = activeTab === 'all'
    ? users
    : users.filter(u => u.role === activeTab);

  const resetAddForm = () => {
    setAddName('');
    setAddStudentId('');
    setAddEmail('');
    setAddPassword('');
    setAddRole('student');
  };

  const handleAddUser = async () => {
    if (!addName.trim() || !addPassword.trim()) {
      showAlert('error', 'Error', 'Name and password are required');
      return;
    }
    if (addRole === 'student' && !addStudentId.trim()) {
      showAlert('error', 'Error', 'Student ID is required');
      return;
    }
    if ((addRole === 'faculty' || addRole === 'admin') && !addEmail.trim()) {
      showAlert('error', 'Error', 'Email is required for faculty/admin');
      return;
    }
    if (addPassword.length < 6) {
      showAlert('error', 'Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      const payload: any = {
        name: addName.trim(),
        password: addPassword,
        role: addRole,
      };
      if (addRole === 'student') {
        payload.studentId = addStudentId.trim();
      } else {
        payload.email = addEmail.trim();
      }

      const result = await userManagementService.createUser(payload);
      setUsers([result.data, ...users]);
      resetAddForm();
      setShowAddForm(false);
      showAlert('success', 'Success', `${ROLE_LABELS[addRole]} account created`);
    } catch (error: any) {
      showAlert('error', 'Error', error.response?.data?.message || 'Failed to create account');
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;
    if (!editName.trim()) {
      showAlert('error', 'Error', 'Name cannot be empty');
      return;
    }

    try {
      await userManagementService.updateStudent(editingUser.id, { name: editName.trim() });
      setUsers(users.map(u =>
        u.id === editingUser.id ? { ...u, name: editName.trim() } : u
      ));
      setEditingUser(null);
      showAlert('success', 'Success', 'Account updated');
    } catch (error: any) {
      showAlert('error', 'Error', error.response?.data?.message || 'Failed to update account');
    }
  };

  const handleDeleteUser = (user: UserAccount) => {
    const identifier = user.studentId || user.email || '';
    showAlert('confirm', 'Delete Account', `Delete account for ${user.name} (${identifier})?`, async () => {
      try {
        await userManagementService.deleteStudent(user.id);
        setUsers(users.filter(u => u.id !== user.id));
        showAlert('success', 'Success', 'Account deleted');
      } catch (error: any) {
        showAlert('error', 'Error', error.response?.data?.message || 'Failed to delete account');
      }
    });
  };

  const handleResetPassword = async () => {
    if (!resetUser) return;
    if (!resetPassword.trim() || resetPassword.length < 6) {
      showAlert('error', 'Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await userManagementService.resetPassword(resetUser.id, resetPassword);
      setResetUser(null);
      setResetPasswordVal('');
      showAlert('success', 'Success', 'Password reset successfully');
    } catch (error: any) {
      showAlert('error', 'Error', error.response?.data?.message || 'Failed to reset password');
    }
  };

  const getCounts = () => {
    const counts: Record<string, number> = { all: users.length };
    users.forEach(u => { counts[u.role] = (counts[u.role] || 0) + 1; });
    return counts;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#004BA8" />
      </View>
    );
  }

  const counts = getCounts();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView>
        {/* Header */}
        <View style={styles.headerBar}>
          <MaterialCommunityIcons name="account-group" size={24} color="#004BA8" />
          <Text style={styles.headerTitle}>Manage Users ({users.length})</Text>
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}>
          {(['all', 'student', 'faculty', 'admin'] as FilterTab[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'all' ? 'All' : ROLE_LABELS[tab as UserRole]} ({counts[tab] || 0})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => { setShowAddForm(!showAddForm); if (showAddForm) resetAddForm(); }}
        >
          <MaterialCommunityIcons name={showAddForm ? 'close' : 'plus'} size={20} color="#fff" />
          <Text style={styles.addButtonText}>{showAddForm ? 'Cancel' : 'Add Account'}</Text>
        </TouchableOpacity>

        {/* Add Form */}
        {showAddForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Create Account</Text>

            {/* Role Selector */}
            <Text style={styles.fieldLabel}>Role</Text>
            <View style={styles.roleSelector}>
              {(['student', 'faculty', 'admin'] as UserRole[]).map(r => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleOption, addRole === r && { backgroundColor: ROLE_COLORS[r] }]}
                  onPress={() => setAddRole(r)}
                >
                  <MaterialCommunityIcons
                    name={ROLE_ICONS[r] as any}
                    size={16}
                    color={addRole === r ? '#fff' : '#666'}
                  />
                  <Text style={[styles.roleOptionText, addRole === r && { color: '#fff' }]}>
                    {ROLE_LABELS[r]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#999"
              value={addName}
              onChangeText={setAddName}
            />

            {addRole === 'student' ? (
              <TextInput
                style={styles.input}
                placeholder="Student ID (e.g. STU001)"
                placeholderTextColor="#999"
                value={addStudentId}
                onChangeText={setAddStudentId}
                autoCapitalize="characters"
              />
            ) : (
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={addEmail}
                onChangeText={setAddEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Password (min 6 characters)"
              placeholderTextColor="#999"
              value={addPassword}
              onChangeText={setAddPassword}
              secureTextEntry
            />
            <TouchableOpacity style={[styles.submitButton, { backgroundColor: ROLE_COLORS[addRole] }]} onPress={handleAddUser}>
              <MaterialCommunityIcons name="account-plus" size={18} color="#fff" />
              <Text style={styles.submitButtonText}>Create {ROLE_LABELS[addRole]} Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-off" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No {activeTab === 'all' ? '' : ROLE_LABELS[activeTab as UserRole].toLowerCase() + ' '}accounts yet</Text>
            <Text style={styles.emptySubtext}>Tap "Add Account" to create one</Text>
          </View>
        ) : (
          filteredUsers.map(user => (
            <View key={user.id} style={[styles.studentCard, { borderLeftColor: ROLE_COLORS[user.role] }]}>
              <View style={styles.studentInfo}>
                <View style={[styles.studentAvatar, { backgroundColor: ROLE_COLORS[user.role] }]}>
                  <MaterialCommunityIcons name={ROLE_ICONS[user.role] as any} size={24} color="#fff" />
                </View>
                <View style={styles.studentDetails}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.studentName}>{user.name}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[user.role] + '20' }]}>
                      <Text style={[styles.roleBadgeText, { color: ROLE_COLORS[user.role] }]}>
                        {ROLE_LABELS[user.role]}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.studentIdText}>
                    {user.role === 'student' ? `ID: ${user.studentId}` : user.email}
                  </Text>
                  <Text style={styles.studentDate}>
                    Created: {new Date(user.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.editBtn]}
                  onPress={() => {
                    setEditingUser(user);
                    setEditName(user.name);
                  }}
                >
                  <MaterialCommunityIcons name="pencil" size={16} color="#004BA8" />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.resetBtn]}
                  onPress={() => {
                    setResetUser(user);
                    setResetPasswordVal('');
                  }}
                >
                  <MaterialCommunityIcons name="key-variant" size={16} color="#FF9800" />
                  <Text style={styles.resetBtnText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDeleteUser(user)}
                >
                  <MaterialCommunityIcons name="trash-can" size={16} color="#FF6B6B" />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Edit Modal */}
      {editingUser && (
        <Modal transparent animationType="fade" visible={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit {ROLE_LABELS[editingUser.role]}</Text>
              <Text style={styles.modalSubtitle}>
                {editingUser.role === 'student' ? `ID: ${editingUser.studentId}` : editingUser.email}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#999"
                value={editName}
                onChangeText={setEditName}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setEditingUser(null)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveBtn} onPress={handleEditUser}>
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {resetUser && (
        <Modal transparent animationType="fade" visible={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <Text style={styles.modalSubtitle}>
                {resetUser.name} ({resetUser.role === 'student' ? resetUser.studentId : resetUser.email})
              </Text>
              <TextInput
                style={styles.input}
                placeholder="New Password (min 6 characters)"
                placeholderTextColor="#999"
                value={resetPassword}
                onChangeText={setResetPasswordVal}
                secureTextEntry
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setResetUser(null)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveBtn} onPress={handleResetPassword}>
                  <Text style={styles.modalSaveText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* SweetAlert-style Alert Modal */}
      <Modal
        visible={alertState.visible}
        transparent
        animationType="fade"
        onRequestClose={closeAlert}
      >
        <View style={styles.sweetOverlay}>
          <View style={styles.sweetCard}>
            <View style={[
              styles.sweetIconCircle,
              alertState.type === 'success' && { backgroundColor: '#E8F5E9' },
              alertState.type === 'error' && { backgroundColor: '#FFEBEE' },
              alertState.type === 'confirm' && { backgroundColor: '#FFF3E0' },
            ]}>
              <MaterialCommunityIcons
                name={
                  alertState.type === 'success' ? 'check-circle' :
                  alertState.type === 'error' ? 'alert-circle' :
                  'help-circle'
                }
                size={44}
                color={
                  alertState.type === 'success' ? '#4CAF50' :
                  alertState.type === 'error' ? '#FF6B6B' :
                  '#FF9800'
                }
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
                    onPress={() => {
                      closeAlert();
                      alertState.onConfirm?.();
                    }}
                  >
                    <Text style={styles.sweetConfirmText}>Yes, Delete</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.sweetConfirmBtn,
                    { backgroundColor: alertState.type === 'success' ? '#4CAF50' : '#FF6B6B' },
                  ]}
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    gap: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  tabsRow: {
    paddingHorizontal: 15,
    marginBottom: 12,
    flexGrow: 0,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: '#004BA8',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#004BA8',
    borderRadius: 8,
    paddingVertical: 12,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginLeft: 8 },
  formCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  formTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 8 },
  roleSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    gap: 6,
  },
  roleOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
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
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#004BA8',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  submitButtonText: { color: '#fff', fontWeight: 'bold' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 10 },
  emptySubtext: { fontSize: 13, color: '#bbb', marginTop: 5 },
  studentCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#004BA8',
  },
  studentInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  studentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#004BA8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentDetails: { flex: 1 },
  studentName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  studentIdText: { fontSize: 13, color: '#666', marginTop: 2 },
  studentDate: { fontSize: 11, color: '#999', marginTop: 2 },
  actionButtons: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  editBtn: { backgroundColor: '#E3F2FD' },
  editBtnText: { color: '#004BA8', fontSize: 12, fontWeight: '600' },
  resetBtn: { backgroundColor: '#FFF3E0' },
  resetBtnText: { color: '#FF9800', fontSize: 12, fontWeight: '600' },
  deleteBtn: { backgroundColor: '#FFEBEE' },
  deleteBtnText: { color: '#FF6B6B', fontSize: 12, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#666', marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 4 },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  modalCancelText: { color: '#666', fontWeight: '600' },
  modalSaveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#004BA8',
  },
  modalSaveText: { color: '#fff', fontWeight: '600' },
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

export default ManageUsersScreen;
