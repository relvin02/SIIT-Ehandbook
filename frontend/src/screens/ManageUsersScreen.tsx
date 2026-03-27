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
import { userManagementService } from '../services/apiClient';

type AlertType = 'success' | 'error' | 'confirm';

type AlertState = {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  onConfirm?: () => void;
};

type Student = {
  id: string;
  name: string;
  studentId: string;
  email?: string;
  createdAt: string;
};

const ManageUsersScreen: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [resetStudent, setResetStudent] = useState<Student | null>(null);

  // Add form
  const [addName, setAddName] = useState('');
  const [addStudentId, setAddStudentId] = useState('');
  const [addPassword, setAddPassword] = useState('');

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
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await userManagementService.getStudents();
      setStudents(data);
    } catch (error: any) {
      console.error('Failed to fetch students:', error);
      showAlert('error', 'Error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!addName.trim() || !addStudentId.trim() || !addPassword.trim()) {
      showAlert('error', 'Error', 'Please fill in all fields');
      return;
    }
    if (addPassword.length < 6) {
      showAlert('error', 'Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      const result = await userManagementService.createStudent({
        name: addName.trim(),
        studentId: addStudentId.trim(),
        password: addPassword,
      });
      setStudents([result.data, ...students]);
      setAddName('');
      setAddStudentId('');
      setAddPassword('');
      setShowAddForm(false);
      showAlert('success', 'Success', 'Student account created');
    } catch (error: any) {
      showAlert('error', 'Error', error.response?.data?.message || 'Failed to create student');
    }
  };

  const handleEditStudent = async () => {
    if (!editingStudent) return;
    if (!editName.trim()) {
      showAlert('error', 'Error', 'Name cannot be empty');
      return;
    }

    try {
      await userManagementService.updateStudent(editingStudent.id, { name: editName.trim() });
      setStudents(students.map(s =>
        s.id === editingStudent.id ? { ...s, name: editName.trim() } : s
      ));
      setEditingStudent(null);
      showAlert('success', 'Success', 'Student account updated');
    } catch (error: any) {
      showAlert('error', 'Error', error.response?.data?.message || 'Failed to update student');
    }
  };

  const handleDeleteStudent = (student: Student) => {
    showAlert('confirm', 'Delete Student', `Delete account for ${student.name} (${student.studentId})?`, async () => {
      try {
        await userManagementService.deleteStudent(student.id);
        setStudents(students.filter(s => s.id !== student.id));
        showAlert('success', 'Success', 'Student account deleted');
      } catch (error: any) {
        showAlert('error', 'Error', error.response?.data?.message || 'Failed to delete student');
      }
    });
  };

  const handleResetPassword = async () => {
    if (!resetStudent) return;
    if (!resetPassword.trim() || resetPassword.length < 6) {
      showAlert('error', 'Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await userManagementService.resetPassword(resetStudent.id, resetPassword);
      setResetStudent(null);
      setResetPasswordVal('');
      showAlert('success', 'Success', 'Password reset successfully');
    } catch (error: any) {
      showAlert('error', 'Error', error.response?.data?.message || 'Failed to reset password');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#004BA8" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header Stats */}
        <View style={styles.headerBar}>
          <MaterialCommunityIcons name="account-group" size={24} color="#004BA8" />
          <Text style={styles.headerTitle}>Student Accounts ({students.length})</Text>
        </View>

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <MaterialCommunityIcons name={showAddForm ? 'close' : 'plus'} size={20} color="#fff" />
          <Text style={styles.addButtonText}>{showAddForm ? 'Cancel' : 'Add Student Account'}</Text>
        </TouchableOpacity>

        {/* Add Form */}
        {showAddForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Create Student Account</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={addName}
              onChangeText={setAddName}
            />
            <TextInput
              style={styles.input}
              placeholder="Student ID (e.g. STU001)"
              value={addStudentId}
              onChangeText={setAddStudentId}
              autoCapitalize="characters"
            />
            <TextInput
              style={styles.input}
              placeholder="Password (min 6 characters)"
              value={addPassword}
              onChangeText={setAddPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleAddStudent}>
              <MaterialCommunityIcons name="account-plus" size={18} color="#fff" />
              <Text style={styles.submitButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Students List */}
        {students.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-off" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No student accounts yet</Text>
            <Text style={styles.emptySubtext}>Tap "Add Student Account" to create one</Text>
          </View>
        ) : (
          students.map(student => (
            <View key={student.id} style={styles.studentCard}>
              <View style={styles.studentInfo}>
                <View style={styles.studentAvatar}>
                  <MaterialCommunityIcons name="account" size={28} color="#fff" />
                </View>
                <View style={styles.studentDetails}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentIdText}>ID: {student.studentId}</Text>
                  <Text style={styles.studentDate}>
                    Created: {new Date(student.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.editBtn]}
                  onPress={() => {
                    setEditingStudent(student);
                    setEditName(student.name);
                  }}
                >
                  <MaterialCommunityIcons name="pencil" size={16} color="#004BA8" />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.resetBtn]}
                  onPress={() => {
                    setResetStudent(student);
                    setResetPasswordVal('');
                  }}
                >
                  <MaterialCommunityIcons name="key-variant" size={16} color="#FF9800" />
                  <Text style={styles.resetBtnText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDeleteStudent(student)}
                >
                  <MaterialCommunityIcons name="trash-can" size={16} color="#FF6B6B" />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Edit Modal */}
      {editingStudent && (
        <Modal transparent animationType="fade" visible={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Student</Text>
              <Text style={styles.modalSubtitle}>ID: {editingStudent.studentId}</Text>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={editName}
                onChangeText={setEditName}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setEditingStudent(null)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveBtn} onPress={handleEditStudent}>
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {resetStudent && (
        <Modal transparent animationType="fade" visible={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <Text style={styles.modalSubtitle}>
                {resetStudent.name} ({resetStudent.studentId})
              </Text>
              <TextInput
                style={styles.input}
                placeholder="New Password (min 6 characters)"
                value={resetPassword}
                onChangeText={setResetPasswordVal}
                secureTextEntry
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setResetStudent(null)}
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
