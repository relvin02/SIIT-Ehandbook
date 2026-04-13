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
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { userManagementService } from '../services/apiClient';

type AlertType = 'success' | 'error' | 'confirm';

type AlertState = {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  onConfirm?: () => void;
  confirmText?: string;
  confirmColor?: string;
};

type UserRole = 'student' | 'faculty' | 'admin';
type FilterTab = 'all' | UserRole;

type UserAccount = {
  id: string;
  name: string;
  studentId?: string;
  email?: string;
  role: UserRole;
  department?: string;
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

const DEPARTMENTS = ['BSIT', 'BSOA', 'BSTM', 'BSAIS', 'BSCRIM', 'BSED/BEED'] as const;

const ManageUsersScreen: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [resetUser, setResetUser] = useState<UserAccount | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const toggleDept = (dept: string) => {
    setExpandedDepts(prev => ({ ...prev, [dept]: !prev[dept] }));
  };

  // Add form
  const [addName, setAddName] = useState('');
  const [addStudentId, setAddStudentId] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState<UserRole>('student');
  const [addDepartment, setAddDepartment] = useState<string>('');

  // Edit form
  const [editName, setEditName] = useState('');
  const [editDepartment, setEditDepartment] = useState<string>('');

  // Reset password form
  const [resetPassword, setResetPasswordVal] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: any[]; failed: any[] } | null>(null);
  const [showImportPicker, setShowImportPicker] = useState(false);

  // Custom alert modal
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });

  const showAlert = (type: AlertType, title: string, message: string, onConfirm?: () => void, confirmText?: string, confirmColor?: string) => {
    setAlertState({ visible: true, type, title, message, onConfirm, confirmText, confirmColor });
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

  const filteredUsers = (activeTab === 'all'
    ? users
    : users.filter(u => u.role === activeTab)
  ).filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      (u.studentId && u.studentId.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q))
    );
  });

  // Group students by department when student tab is active
  const groupedByDept = activeTab === 'student'
    ? filteredUsers.reduce<Record<string, UserAccount[]>>((acc, user) => {
        const dept = user.department || 'Unassigned';
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(user);
        return acc;
      }, {})
    : null;

  const deptOrder = [...DEPARTMENTS, 'Unassigned'] as string[];
  const sortedDepts = groupedByDept
    ? deptOrder.filter(d => groupedByDept[d]?.length > 0)
    : [];

  const resetAddForm = () => {
    setAddName('');
    setAddStudentId('');
    setAddEmail('');
    setAddPassword('');
    setAddRole('student');
    setAddDepartment('');
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
    if (addRole === 'student' && !addDepartment) {
      showAlert('error', 'Error', 'Department/Program is required for students');
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
        payload.department = addDepartment;
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
      const updatePayload: any = { name: editName.trim() };
      if (editingUser.role === 'student') {
        updatePayload.department = editDepartment || undefined;
      }
      await userManagementService.updateStudent(editingUser.id, updatePayload);
      setUsers(users.map(u =>
        u.id === editingUser.id ? { ...u, name: editName.trim(), department: editDepartment || u.department } : u
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

  const handleImportCSV = async (importType: 'student' | 'faculty') => {
    setShowImportPicker(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel', 'text/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const file = result.assets[0];
      const response = await fetch(file.uri);
      const content = await response.text();
      const lines = content.split(/\r?\n/).filter(line => line.trim());

      if (lines.length < 2) {
        showAlert('error', 'Error', 'CSV file must have a header row and at least one data row');
        return;
      }

      const header = lines[0].split(',').map(h => h.trim().toLowerCase());
      const nameIdx = header.findIndex(h => h === 'name' || h === 'full name' || h === 'fullname');
      const pwIdx = header.findIndex(h => h === 'password' || h === 'pw');

      if (importType === 'student') {
        const idIdx = header.findIndex(h => h === 'studentid' || h === 'student id' || h === 'id' || h === 'student_id');
        const deptIdx = header.findIndex(h => h === 'department' || h === 'dept' || h === 'program' || h === 'course');

        if (nameIdx === -1 || idIdx === -1) {
          showAlert('error', 'Error', 'CSV must have "Name" and "Student ID" columns.\n\nExpected format:\nName, Student ID, Department, Password');
          return;
        }

        const students: { name: string; studentId: string; department?: string; password?: string }[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim());
          const name = cols[nameIdx]?.trim();
          const studentId = cols[idIdx]?.trim();
          if (!name || !studentId) continue;

          const student: any = { name, studentId };
          if (deptIdx !== -1 && cols[deptIdx]?.trim()) student.department = cols[deptIdx].trim();
          if (pwIdx !== -1 && cols[pwIdx]?.trim()) student.password = cols[pwIdx].trim();
          students.push(student);
        }

        if (students.length === 0) {
          showAlert('error', 'Error', 'No valid student rows found in CSV');
          return;
        }

        showAlert('confirm', 'Import Students', `Import ${students.length} students from CSV?\n\nStudents without a password will use their Student ID as default password.`, async () => {
          setImporting(true);
          try {
            const res = await userManagementService.bulkImport(students);
            setImportResult(res.data);
            fetchUsers();
          } catch (error: any) {
            showAlert('error', 'Error', error.response?.data?.message || 'Import failed');
          } finally {
            setImporting(false);
          }
        }, 'Yes, Import', '#2E7D32');
      } else {
        // Faculty import
        const emailIdx = header.findIndex(h => h === 'email' || h === 'e-mail' || h === 'email address');

        if (nameIdx === -1 || emailIdx === -1) {
          showAlert('error', 'Error', 'CSV must have "Name" and "Email" columns.\n\nExpected format:\nName, Email, Password');
          return;
        }

        const faculty: { name: string; email: string; password?: string }[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim());
          const name = cols[nameIdx]?.trim();
          const email = cols[emailIdx]?.trim();
          if (!name || !email) continue;

          const member: any = { name, email };
          if (pwIdx !== -1 && cols[pwIdx]?.trim()) member.password = cols[pwIdx].trim();
          faculty.push(member);
        }

        if (faculty.length === 0) {
          showAlert('error', 'Error', 'No valid faculty rows found in CSV');
          return;
        }

        showAlert('confirm', 'Import Faculty', `Import ${faculty.length} faculty from CSV?\n\nFaculty without a password will use "faculty123" as default password.`, async () => {
          setImporting(true);
          try {
            const res = await userManagementService.bulkImportFaculty(faculty);
            setImportResult(res.data);
            fetchUsers();
          } catch (error: any) {
            showAlert('error', 'Error', error.response?.data?.message || 'Import failed');
          } finally {
            setImporting(false);
          }
        }, 'Yes, Import', '#7B1FA2');
      }
    } catch (error: any) {
      showAlert('error', 'Error', error?.message || 'Failed to read file');
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

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, ID, email, or department..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.addButton, { flex: 1 }]}
            onPress={() => { setShowAddForm(!showAddForm); if (showAddForm) resetAddForm(); }}
          >
            <MaterialCommunityIcons name={showAddForm ? 'close' : 'plus'} size={20} color="#fff" />
            <Text style={styles.addButtonText}>{showAddForm ? 'Cancel' : 'Add Account'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.importButton, importing && { opacity: 0.6 }]}
            onPress={() => setShowImportPicker(true)}
            disabled={importing}
          >
            {importing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="file-import" size={20} color="#fff" />
                <Text style={styles.importButtonText}>Import CSV</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

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
              <>
              <TextInput
                style={styles.input}
                placeholder="Student ID (e.g. STU001)"
                placeholderTextColor="#999"
                value={addStudentId}
                onChangeText={setAddStudentId}
                autoCapitalize="characters"
              />

              {/* Department Picker */}
              <Text style={styles.fieldLabel}>Department / Program</Text>
              <View style={styles.departmentSelector}>
                {DEPARTMENTS.map(dept => (
                  <TouchableOpacity
                    key={dept}
                    style={[styles.deptOption, addDepartment === dept && styles.deptOptionActive]}
                    onPress={() => setAddDepartment(dept)}
                  >
                    <Text style={[styles.deptOptionText, addDepartment === dept && styles.deptOptionTextActive]}>
                      {dept}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              </>
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
        ) : groupedByDept ? (
          // Students grouped by department
          sortedDepts.map(dept => (
            <View key={dept}>
              <TouchableOpacity style={styles.deptSectionHeader} onPress={() => toggleDept(dept)} activeOpacity={0.7}>
                <MaterialCommunityIcons name="school" size={18} color="#004BA8" />
                <Text style={styles.deptSectionTitle}>{dept}</Text>
                <View style={styles.deptSectionBadge}>
                  <Text style={styles.deptSectionCount}>{groupedByDept[dept].length}</Text>
                </View>
                <MaterialCommunityIcons
                  name={expandedDepts[dept] ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color="#004BA8"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
              {expandedDepts[dept] && groupedByDept[dept].map(user => (
                <View key={user.id} style={[styles.studentCard, { borderLeftColor: ROLE_COLORS[user.role] }]}>
                  <View style={styles.studentInfo}>
                    <View style={[styles.studentAvatar, { backgroundColor: ROLE_COLORS[user.role] }]}>
                      <MaterialCommunityIcons name={ROLE_ICONS[user.role] as any} size={24} color="#fff" />
                    </View>
                    <View style={styles.studentDetails}>
                      <Text style={styles.studentName}>{user.name}</Text>
                      <Text style={styles.studentIdText}>ID: {user.studentId}</Text>
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
                        setEditDepartment(user.department || '');
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
              ))}
            </View>
          ))
        ) : (
          // All / Faculty / Admin — flat list
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
                  {user.role === 'student' && user.department && (
                    <Text style={styles.departmentText}>{user.department}</Text>
                  )}
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
                    setEditDepartment(user.department || '');
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
              {editingUser.role === 'student' && (
                <>
                  <Text style={[styles.fieldLabel, { marginTop: 4 }]}>Department / Program</Text>
                  <View style={styles.departmentSelector}>
                    {DEPARTMENTS.map(dept => (
                      <TouchableOpacity
                        key={dept}
                        style={[styles.deptOption, editDepartment === dept && styles.deptOptionActive]}
                        onPress={() => setEditDepartment(dept)}
                      >
                        <Text style={[styles.deptOptionText, editDepartment === dept && styles.deptOptionTextActive]}>
                          {dept}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
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
                    style={[styles.sweetConfirmBtn, { backgroundColor: alertState.confirmColor || '#FF6B6B' }]}
                    onPress={() => {
                      closeAlert();
                      alertState.onConfirm?.();
                    }}
                  >
                    <Text style={styles.sweetConfirmText}>{alertState.confirmText || 'Confirm'}</Text>
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

      {/* Import Type Picker Modal */}
      <Modal visible={showImportPicker} transparent animationType="fade" onRequestClose={() => setShowImportPicker(false)}>
        <View style={styles.sweetOverlay}>
          <View style={styles.sweetCard}>
            <MaterialCommunityIcons name="file-import" size={44} color="#004BA8" />
            <Text style={styles.sweetTitle}>Import CSV</Text>
            <Text style={[styles.sweetMessage, { marginBottom: 16 }]}>Choose which type of accounts to import:</Text>
            <TouchableOpacity
              style={styles.importPickerOption}
              onPress={() => handleImportCSV('student')}
            >
              <MaterialCommunityIcons name="account" size={24} color="#004BA8" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.importPickerLabel}>Students</Text>
                <Text style={styles.importPickerDesc}>CSV: Name, Student ID, Department, Password</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.importPickerOption}
              onPress={() => handleImportCSV('faculty')}
            >
              <MaterialCommunityIcons name="school" size={24} color="#7B1FA2" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.importPickerLabel}>Faculty</Text>
                <Text style={styles.importPickerDesc}>CSV: Name, Email, Password</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.sweetCancelBtn, { marginTop: 12, alignSelf: 'center' }]} onPress={() => setShowImportPicker(false)}>
              <Text style={styles.sweetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Import Result Modal */}
      {importResult && (
        <Modal transparent animationType="fade" visible={true}>
          <View style={styles.sweetOverlay}>
            <View style={styles.sweetCard}>
              <MaterialCommunityIcons
                name={importResult.failed.length === 0 ? 'check-circle' : 'alert-circle'}
                size={48}
                color={importResult.failed.length === 0 ? '#4CAF50' : '#FF9800'}
              />
              <Text style={styles.sweetTitle}>Import Results</Text>
              <Text style={styles.sweetMessage}>
                {`✅ ${importResult.success.length} imported successfully`}
                {importResult.failed.length > 0 && `\n❌ ${importResult.failed.length} failed`}
              </Text>
              {importResult.failed.length > 0 && (
                <ScrollView style={{ maxHeight: 150, width: '100%', marginTop: 8 }}>
                  {importResult.failed.map((f: any, i: number) => (
                    <Text key={i} style={{ fontSize: 12, color: '#D32F2F', marginBottom: 4 }}>
                      • {f.studentId} ({f.name}): {f.reason}
                    </Text>
                  ))}
                </ScrollView>
              )}
              <View style={styles.sweetButtons}>
                <TouchableOpacity
                  style={[styles.sweetConfirmBtn, { backgroundColor: '#4CAF50' }]}
                  onPress={() => setImportResult(null)}
                >
                  <Text style={styles.sweetConfirmText}>OK</Text>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    paddingVertical: 0,
  },
  importPickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    width: '100%',
  },
  importPickerLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  importPickerDesc: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
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
    backgroundColor: '#004BA8',
    borderRadius: 8,
    paddingVertical: 12,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginLeft: 8 },
  actionRow: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 15,
    gap: 10,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  importButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginLeft: 8 },
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
  departmentSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  deptOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  deptOptionActive: {
    backgroundColor: '#004BA8',
    borderColor: '#004BA8',
  },
  deptOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  deptOptionTextActive: {
    color: '#fff',
  },
  departmentText: {
    fontSize: 11,
    color: '#004BA8',
    fontWeight: '600',
    marginTop: 2,
  },
  deptSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#004BA8',
  },
  deptSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#004BA8',
    marginLeft: 8,
    flex: 1,
  },
  deptSectionBadge: {
    backgroundColor: '#004BA8',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  deptSectionCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
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
