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
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { calendarService } from '../services/apiClient';

type EventType = 'enrollment' | 'exam' | 'holiday' | 'graduation' | 'sembreak' | 'event' | 'other';

type CalendarEventItem = {
  id: string;
  title: string;
  description: string;
  eventType: EventType;
  startDate: string;
  endDate: string | null;
  isAllDay: boolean;
  createdBy: string;
};

const EVENT_CONFIG: Record<EventType, { label: string; color: string; icon: string }> = {
  enrollment: { label: 'Enrollment', color: '#1976D2', icon: 'account-plus' },
  exam: { label: 'Exam', color: '#D32F2F', icon: 'file-document-edit' },
  holiday: { label: 'Holiday', color: '#4CAF50', icon: 'party-popper' },
  graduation: { label: 'Graduation', color: '#6A1B9A', icon: 'school' },
  sembreak: { label: 'Sem Break', color: '#FF9800', icon: 'umbrella-beach' },
  event: { label: 'Event', color: '#00796B', icon: 'calendar-star' },
  other: { label: 'Other', color: '#757575', icon: 'calendar' },
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const SchoolCalendarScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { role } = useSelector((state: RootState) => state.auth);
  const isAdmin = role === 'admin';

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'event' as EventType,
    startDate: '',
    endDate: '',
  });

  const [alertModal, setAlertModal] = useState<{ visible: boolean; type: 'success' | 'error' | 'confirm'; title: string; message: string; onConfirm?: () => void }>({
    visible: false, type: 'success', title: '', message: '',
  });
  const showAlert = (type: any, title: string, message: string, onConfirm?: () => void) => {
    setAlertModal({ visible: true, type, title, message, onConfirm });
  };
  const closeAlert = () => setAlertModal(prev => ({ ...prev, visible: false }));

  useEffect(() => {
    fetchEvents();
  }, [currentMonth, currentYear]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await calendarService.getEvents(currentMonth, currentYear);
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleCreateEvent = async () => {
    if (!formData.title.trim() || !formData.startDate.trim()) {
      showAlert('error', 'Error', 'Title and start date are required');
      return;
    }

    // Basic date validation (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.startDate)) {
      showAlert('error', 'Error', 'Start date must be in YYYY-MM-DD format');
      return;
    }

    setSaving(true);
    try {
      const newEvent = await calendarService.createEvent({
        title: formData.title,
        description: formData.description,
        eventType: formData.eventType,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
      });
      setEvents([...events, newEvent].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()));
      setFormData({ title: '', description: '', eventType: 'event', startDate: '', endDate: '' });
      setShowForm(false);
      showAlert('success', 'Success', 'Calendar event created');
    } catch (error) {
      showAlert('error', 'Error', 'Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = (id: string) => {
    showAlert('confirm', 'Delete Event', 'Are you sure you want to delete this event?', async () => {
      try {
        await calendarService.deleteEvent(id);
        setEvents(events.filter(e => e.id !== id));
      } catch (error) {
        showAlert('error', 'Error', 'Failed to delete event');
      }
    });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Month Navigator */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.navArrow}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#004BA8" />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{MONTHS[currentMonth - 1]} {currentYear}</Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navArrow}>
            <MaterialCommunityIcons name="chevron-right" size={28} color="#004BA8" />
          </TouchableOpacity>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          {Object.entries(EVENT_CONFIG).slice(0, 4).map(([key, cfg]) => (
            <View key={key} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: cfg.color }]} />
              <Text style={styles.legendText}>{cfg.label}</Text>
            </View>
          ))}
        </View>

        {/* Admin Add Event */}
        {isAdmin && (
          <TouchableOpacity
            style={[styles.addButton, showForm && { backgroundColor: '#777' }]}
            onPress={() => setShowForm(!showForm)}
          >
            <MaterialCommunityIcons name={showForm ? 'close' : 'plus'} size={20} color="#fff" />
            <Text style={styles.addButtonText}>{showForm ? 'Cancel' : 'Add Event'}</Text>
          </TouchableOpacity>
        )}

        {/* Add Event Form */}
        {showForm && isAdmin && (
          <View style={styles.formCard}>
            <Text style={styles.formLabel}>Event Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
              {(Object.keys(EVENT_CONFIG) as EventType[]).map(type => {
                const cfg = EVENT_CONFIG[type];
                const selected = formData.eventType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeChip, { borderColor: cfg.color }, selected && { backgroundColor: cfg.color }]}
                    onPress={() => setFormData({ ...formData, eventType: type })}
                  >
                    <MaterialCommunityIcons name={cfg.icon as any} size={14} color={selected ? '#fff' : cfg.color} />
                    <Text style={[styles.typeChipText, selected && { color: '#fff' }]}>{cfg.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.formLabel}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Midterm Examination"
              placeholderTextColor="#999"
              value={formData.title}
              onChangeText={text => setFormData({ ...formData, title: text })}
            />
            <Text style={styles.formLabel}>Description (optional)</Text>
            <TextInput
              style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
              placeholder="Additional details..."
              placeholderTextColor="#999"
              multiline
              value={formData.description}
              onChangeText={text => setFormData({ ...formData, description: text })}
            />
            <Text style={styles.formLabel}>Start Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2026-06-15"
              placeholderTextColor="#999"
              value={formData.startDate}
              onChangeText={text => setFormData({ ...formData, startDate: text })}
            />
            <Text style={styles.formLabel}>End Date (optional, YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2026-06-20"
              placeholderTextColor="#999"
              value={formData.endDate}
              onChangeText={text => setFormData({ ...formData, endDate: text })}
            />
            <TouchableOpacity
              style={[styles.submitButton, saving && { opacity: 0.6 }]}
              onPress={handleCreateEvent}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Add to Calendar</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* Events List */}
        {loading ? (
          <ActivityIndicator size="large" color="#004BA8" style={{ marginTop: 40 }} />
        ) : events.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="calendar-blank" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No events for {MONTHS[currentMonth - 1]}</Text>
          </View>
        ) : (
          events.map(event => {
            const cfg = EVENT_CONFIG[event.eventType] || EVENT_CONFIG.other;
            return (
              <View key={event.id} style={[styles.eventCard, { borderLeftColor: cfg.color }]}>
                <View style={styles.eventDateBox}>
                  <Text style={[styles.eventDay, { color: cfg.color }]}>
                    {new Date(event.startDate).getDate()}
                  </Text>
                  <Text style={styles.eventMonth}>
                    {MONTHS[new Date(event.startDate).getMonth()].substring(0, 3).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.eventContent}>
                  <View style={styles.eventHeaderRow}>
                    <View style={[styles.eventTypeBadge, { backgroundColor: cfg.color }]}>
                      <MaterialCommunityIcons name={cfg.icon as any} size={12} color="#fff" />
                      <Text style={styles.eventTypeBadgeText}>{cfg.label}</Text>
                    </View>
                    {isAdmin && (
                      <TouchableOpacity onPress={() => handleDeleteEvent(event.id)}>
                        <MaterialCommunityIcons name="trash-can-outline" size={18} color="#D32F2F" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  {event.description ? <Text style={styles.eventDesc}>{event.description}</Text> : null}
                  <Text style={styles.eventDateRange}>
                    {formatDate(event.startDate)}
                    {event.endDate ? ` — ${formatDate(event.endDate)}` : ''}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
      </KeyboardAvoidingView>

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
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalConfirmBtn, { backgroundColor: '#D32F2F' }]}
                    onPress={() => { closeAlert(); alertModal.onConfirm?.(); }}
                  >
                    <Text style={styles.modalConfirmText}>Yes, Delete</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.modalConfirmBtn, { backgroundColor: alertModal.type === 'success' ? '#4CAF50' : '#D32F2F' }]}
                  onPress={closeAlert}
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    elevation: 2,
    marginBottom: 12,
  },
  navArrow: { padding: 4 },
  monthTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: '#666' },
  addButton: {
    backgroundColor: '#004BA8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginBottom: 12,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  formLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 10 },
  typeScroll: { marginBottom: 4 },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 2,
    marginRight: 8,
    gap: 4,
  },
  typeChipText: { fontSize: 12, fontWeight: '600', color: '#333' },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#004BA8',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#999', marginTop: 8, fontSize: 14 },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  eventDateBox: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  eventDay: { fontSize: 22, fontWeight: 'bold' },
  eventMonth: { fontSize: 10, color: '#999', fontWeight: '600' },
  eventContent: { flex: 1, padding: 12 },
  eventHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  eventTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  eventTypeBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  eventTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  eventDesc: { fontSize: 13, color: '#666', marginBottom: 4 },
  eventDateRange: { fontSize: 12, color: '#999' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '85%', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 12, marginBottom: 6 },
  modalMessage: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, backgroundColor: '#f0f0f0' },
  modalCancelText: { color: '#666', fontWeight: '600' },
  modalConfirmBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  modalConfirmText: { color: '#fff', fontWeight: '600' },
});

export default SchoolCalendarScreen;
