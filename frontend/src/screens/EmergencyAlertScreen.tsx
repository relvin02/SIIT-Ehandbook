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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { emergencyAlertService } from '../services/apiClient';

type Severity = 'critical' | 'warning' | 'info';

type Alert = {
  id: string;
  title: string;
  message: string;
  severity: Severity;
  isActive: boolean;
  expiresAt: string | null;
  createdBy: string;
  createdAt: string;
};

type AlertModalState = {
  visible: boolean;
  type: 'success' | 'error' | 'confirm';
  title: string;
  message: string;
  onConfirm?: () => void;
};

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; icon: string; emoji: string }> = {
  critical: { label: 'Critical', color: '#D32F2F', icon: 'alert-octagon', emoji: '🔴' },
  warning: { label: 'Warning', color: '#F57C00', icon: 'alert', emoji: '🟡' },
  info: { label: 'Info', color: '#1976D2', icon: 'information', emoji: '🔵' },
};

const EmergencyAlertScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    severity: 'critical' as Severity,
  });

  const [alertModal, setAlertModal] = useState<AlertModalState>({
    visible: false, type: 'success', title: '', message: '',
  });

  const showAlertModal = (type: AlertModalState['type'], title: string, message: string, onConfirm?: () => void) => {
    setAlertModal({ visible: true, type, title, message, onConfirm });
  };
  const closeAlertModal = () => setAlertModal(prev => ({ ...prev, visible: false }));

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await emergencyAlertService.getAllAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendAlert = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      showAlertModal('error', 'Error', 'Please fill in title and message');
      return;
    }

    setSending(true);
    try {
      const newAlert = await emergencyAlertService.createAlert(formData);
      setAlerts([newAlert, ...alerts]);
      setFormData({ title: '', message: '', severity: 'critical' });
      setShowForm(false);
      showAlertModal('success', 'Alert Sent!', 'Emergency alert has been sent to all users via push notification.');
    } catch (error) {
      showAlertModal('error', 'Error', 'Failed to send emergency alert');
    } finally {
      setSending(false);
    }
  };

  const handleDeactivate = (alertId: string) => {
    showAlertModal('confirm', 'Deactivate Alert', 'This will dismiss the alert for all users.', async () => {
      try {
        await emergencyAlertService.deactivateAlert(alertId);
        setAlerts(alerts.map(a => a.id === alertId ? { ...a, isActive: false } : a));
      } catch (error) {
        showAlertModal('error', 'Error', 'Failed to deactivate alert');
      }
    });
  };

  const handleDelete = (alertId: string) => {
    showAlertModal('confirm', 'Delete Alert', 'This will permanently delete this alert record.', async () => {
      try {
        await emergencyAlertService.deleteAlert(alertId);
        setAlerts(alerts.filter(a => a.id !== alertId));
      } catch (error) {
        showAlertModal('error', 'Error', 'Failed to delete alert');
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#D32F2F" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Send Alert Button */}
        <TouchableOpacity
          style={[styles.sendButton, showForm && { backgroundColor: '#777' }]}
          onPress={() => setShowForm(!showForm)}
        >
          <MaterialCommunityIcons
            name={showForm ? 'close' : 'alert-plus'}
            size={22}
            color="#fff"
          />
          <Text style={styles.sendButtonText}>
            {showForm ? 'Cancel' : 'Send Emergency Alert'}
          </Text>
        </TouchableOpacity>

        {/* Form */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formLabel}>Severity</Text>
            <View style={styles.severityRow}>
              {(['critical', 'warning', 'info'] as Severity[]).map(sev => {
                const config = SEVERITY_CONFIG[sev];
                const selected = formData.severity === sev;
                return (
                  <TouchableOpacity
                    key={sev}
                    style={[
                      styles.severityChip,
                      { borderColor: config.color },
                      selected && { backgroundColor: config.color },
                    ]}
                    onPress={() => setFormData({ ...formData, severity: sev })}
                  >
                    <Text style={[styles.severityChipText, selected && { color: '#fff' }]}>
                      {config.emoji} {config.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.formLabel}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Class Suspension"
              placeholderTextColor="#999"
              value={formData.title}
              onChangeText={text => setFormData({ ...formData, title: text })}
            />

            <Text style={styles.formLabel}>Message</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="e.g. Classes are suspended due to Typhoon Signal #2..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={formData.message}
              onChangeText={text => setFormData({ ...formData, message: text })}
            />

            <TouchableOpacity
              style={[styles.confirmSendButton, sending && { opacity: 0.6 }]}
              onPress={handleSendAlert}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="send" size={20} color="#fff" />
                  <Text style={styles.confirmSendText}>Send to All Users</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.formHint}>
              ⚠️ This will send a loud push notification to ALL students and faculty immediately.
            </Text>
          </View>
        )}

        {/* Alert History */}
        <Text style={styles.historyTitle}>Alert History</Text>
        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="shield-check" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No emergency alerts sent yet</Text>
          </View>
        ) : (
          alerts.map(alert => {
            const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.critical;
            return (
              <View key={alert.id} style={[styles.alertCard, { borderLeftColor: config.color }]}>
                <View style={styles.alertHeader}>
                  <View style={[styles.severityBadge, { backgroundColor: config.color }]}>
                    <MaterialCommunityIcons name={config.icon as any} size={14} color="#fff" />
                    <Text style={styles.severityBadgeText}>{config.label.toUpperCase()}</Text>
                  </View>
                  {alert.isActive ? (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>ACTIVE</Text>
                    </View>
                  ) : (
                    <View style={[styles.activeBadge, { backgroundColor: '#9E9E9E' }]}>
                      <Text style={styles.activeBadgeText}>DISMISSED</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <Text style={styles.alertMeta}>
                  By {alert.createdBy} • {new Date(alert.createdAt).toLocaleString()}
                </Text>
                <View style={styles.alertActions}>
                  {alert.isActive && (
                    <TouchableOpacity
                      style={styles.deactivateBtn}
                      onPress={() => handleDeactivate(alert.id)}
                    >
                      <MaterialCommunityIcons name="bell-off" size={16} color="#F57C00" />
                      <Text style={styles.deactivateBtnText}>Dismiss</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(alert.id)}
                  >
                    <MaterialCommunityIcons name="trash-can" size={16} color="#D32F2F" />
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Alert Modal */}
      <Modal visible={alertModal.visible} transparent animationType="fade" onRequestClose={closeAlertModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[
              styles.modalIconCircle,
              alertModal.type === 'success' && { backgroundColor: '#E8F5E9' },
              alertModal.type === 'error' && { backgroundColor: '#FFEBEE' },
              alertModal.type === 'confirm' && { backgroundColor: '#FFF3E0' },
            ]}>
              <MaterialCommunityIcons
                name={alertModal.type === 'success' ? 'check-circle' : alertModal.type === 'error' ? 'alert-circle' : 'help-circle'}
                size={44}
                color={alertModal.type === 'success' ? '#4CAF50' : alertModal.type === 'error' ? '#D32F2F' : '#FF9800'}
              />
            </View>
            <Text style={styles.modalTitle}>{alertModal.title}</Text>
            <Text style={styles.modalMessage}>{alertModal.message}</Text>
            <View style={styles.modalButtons}>
              {alertModal.type === 'confirm' ? (
                <>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={closeAlertModal}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalConfirmBtn, { backgroundColor: '#D32F2F' }]}
                    onPress={() => { closeAlertModal(); alertModal.onConfirm?.(); }}
                  >
                    <Text style={styles.modalConfirmText}>Yes</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.modalConfirmBtn, { backgroundColor: alertModal.type === 'success' ? '#4CAF50' : '#D32F2F' }]}
                  onPress={closeAlertModal}
                >
                  <Text style={styles.modalConfirmText}>OK</Text>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sendButton: {
    backgroundColor: '#D32F2F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 10,
    elevation: 3,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    elevation: 2,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 10,
  },
  severityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  severityChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  severityChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  confirmSendButton: {
    backgroundColor: '#D32F2F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    marginTop: 14,
    gap: 8,
  },
  confirmSendText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  formHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#999',
    marginTop: 8,
    fontSize: 14,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  severityBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  alertMeta: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 12,
  },
  deactivateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FFF3E0',
  },
  deactivateBtnText: {
    color: '#F57C00',
    fontSize: 13,
    fontWeight: '600',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
  },
  deleteBtnText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  modalIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  modalCancelText: {
    color: '#666',
    fontWeight: '600',
  },
  modalConfirmBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalConfirmText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default EmergencyAlertScreen;
