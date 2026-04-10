import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { feedbackService } from '../services/apiClient';

type FeedbackItem = {
  id: string;
  category: string;
  rating: number;
  message: string;
  isAnonymous: boolean;
  submittedBy: string;
  studentId: string | null;
  status: string;
  createdAt: string;
};

type Stats = {
  total: number;
  pending: number;
  reviewed: number;
  resolved: number;
  averageRating: string;
  byCategory: { _id: string; count: number; avgRating: number }[];
};

const STATUS_CONFIG: Record<string, { color: string; icon: string }> = {
  pending: { color: '#FF9800', icon: 'clock-outline' },
  reviewed: { color: '#1976D2', icon: 'eye-check' },
  resolved: { color: '#4CAF50', icon: 'check-circle' },
};

const FeedbackManagementScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  const [alertModal, setAlertModal] = useState<{ visible: boolean; type: string; title: string; message: string; onConfirm?: () => void }>({
    visible: false, type: 'success', title: '', message: '',
  });
  const showAlert = (type: string, title: string, message: string, onConfirm?: () => void) => {
    setAlertModal({ visible: true, type, title, message, onConfirm });
  };
  const closeAlert = () => setAlertModal(prev => ({ ...prev, visible: false }));

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feedbackData, statsData] = await Promise.all([
        feedbackService.getAll(filter ? { status: filter } : undefined),
        feedbackService.getStats(),
      ]);
      setFeedbacks(feedbackData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await feedbackService.updateStatus(id, newStatus);
      setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, status: newStatus } : f));
    } catch (error) {
      showAlert('error', 'Error', 'Failed to update status');
    }
  };

  const handleDelete = (id: string) => {
    showAlert('confirm', 'Delete Feedback', 'Are you sure?', async () => {
      try {
        await feedbackService.remove(id);
        setFeedbacks(feedbacks.filter(f => f.id !== id));
      } catch (error) {
        showAlert('error', 'Error', 'Failed to delete');
      }
    });
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <MaterialCommunityIcons
        key={i}
        name={i < count ? 'star' : 'star-outline'}
        size={16}
        color={i < count ? '#FFB300' : '#ddd'}
      />
    ));
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#004BA8" /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Stats Overview */}
        {stats && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
              <Text style={[styles.statNumber, { color: '#FF9800' }]}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.resolved}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#FFFDE7' }]}>
              <MaterialCommunityIcons name="star" size={18} color="#FFB300" />
              <Text style={[styles.statNumber, { color: '#FFB300' }]}>{stats.averageRating}</Text>
              <Text style={styles.statLabel}>Avg</Text>
            </View>
          </View>
        )}

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {[{ key: '', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'reviewed', label: 'Reviewed' }, { key: 'resolved', label: 'Resolved' }].map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterChipText, filter === f.key && { color: '#fff' }]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Feedback List */}
        {feedbacks.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="inbox-arrow-down" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No feedback found</Text>
          </View>
        ) : (
          feedbacks.map(fb => {
            const statusCfg = STATUS_CONFIG[fb.status] || STATUS_CONFIG.pending;
            return (
              <View key={fb.id} style={styles.feedbackCard}>
                <View style={styles.fbHeader}>
                  <View style={styles.starsContainer}>{renderStars(fb.rating)}</View>
                  <View style={[styles.statusBadge, { backgroundColor: statusCfg.color }]}>
                    <MaterialCommunityIcons name={statusCfg.icon as any} size={12} color="#fff" />
                    <Text style={styles.statusBadgeText}>{fb.status.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.fbCategoryRow}>
                  <Text style={styles.fbCategory}>{fb.category}</Text>
                  <Text style={styles.fbDate}>{new Date(fb.createdAt).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.fbMessage}>{fb.message}</Text>
                <Text style={styles.fbSubmitter}>
                  {fb.isAnonymous ? '👤 Anonymous' : `By: ${fb.submittedBy}${fb.studentId ? ` (${fb.studentId})` : ''}`}
                </Text>

                {/* Actions */}
                <View style={styles.fbActions}>
                  {fb.status === 'pending' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#E3F2FD' }]}
                      onPress={() => handleStatusUpdate(fb.id, 'reviewed')}
                    >
                      <MaterialCommunityIcons name="eye-check" size={14} color="#1976D2" />
                      <Text style={[styles.actionBtnText, { color: '#1976D2' }]}>Mark Reviewed</Text>
                    </TouchableOpacity>
                  )}
                  {fb.status !== 'resolved' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#E8F5E9' }]}
                      onPress={() => handleStatusUpdate(fb.id, 'resolved')}
                    >
                      <MaterialCommunityIcons name="check-circle" size={14} color="#4CAF50" />
                      <Text style={[styles.actionBtnText, { color: '#4CAF50' }]}>Resolve</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#FFEBEE' }]}
                    onPress={() => handleDelete(fb.id)}
                  >
                    <MaterialCommunityIcons name="trash-can" size={14} color="#D32F2F" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal */}
      <Modal visible={alertModal.visible} transparent animationType="fade" onRequestClose={closeAlert}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <MaterialCommunityIcons
              name={alertModal.type === 'success' ? 'check-circle' : alertModal.type === 'error' ? 'alert-circle' : 'help-circle'}
              size={44}
              color={alertModal.type === 'success' ? '#4CAF50' : alertModal.type === 'error' ? '#D32F2F' : '#FF9800'}
            />
            <Text style={styles.modalTitle}>{alertModal.title}</Text>
            <Text style={styles.modalMessage}>{alertModal.message}</Text>
            <View style={styles.modalButtons}>
              {alertModal.type === 'confirm' ? (
                <>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={closeAlert}>
                    <Text style={{ color: '#666', fontWeight: '600' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalConfirmBtn, { backgroundColor: '#D32F2F' }]}
                    onPress={() => { closeAlert(); alertModal.onConfirm?.(); }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Yes</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.modalConfirmBtn, { backgroundColor: alertModal.type === 'success' ? '#4CAF50' : '#D32F2F' }]}
                  onPress={closeAlert}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>OK</Text>
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
  scrollContent: { padding: 16, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 10, color: '#999', marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterChipActive: { backgroundColor: '#004BA8', borderColor: '#004BA8' },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#666' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#999', marginTop: 8 },
  feedbackCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  fbHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  starsContainer: { flexDirection: 'row', gap: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  statusBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  fbCategoryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  fbCategory: { fontSize: 12, color: '#004BA8', fontWeight: '600', textTransform: 'capitalize' },
  fbDate: { fontSize: 11, color: '#999' },
  fbMessage: { fontSize: 14, color: '#333', marginBottom: 8, lineHeight: 20 },
  fbSubmitter: { fontSize: 12, color: '#999', marginBottom: 8 },
  fbActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  actionBtnText: { fontSize: 12, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '85%', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 12, marginBottom: 6 },
  modalMessage: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, backgroundColor: '#f0f0f0' },
  modalConfirmBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
});

export default FeedbackManagementScreen;
