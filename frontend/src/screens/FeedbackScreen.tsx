import React, { useState } from 'react';
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
import { feedbackService } from '../services/apiClient';

type Category = 'academics' | 'facilities' | 'services' | 'faculty' | 'administration' | 'other';

const CATEGORIES: { key: Category; label: string; icon: string }[] = [
  { key: 'academics', label: 'Academics', icon: 'school' },
  { key: 'facilities', label: 'Facilities', icon: 'domain' },
  { key: 'services', label: 'Services', icon: 'headset' },
  { key: 'faculty', label: 'Faculty', icon: 'account-tie' },
  { key: 'administration', label: 'Admin', icon: 'briefcase' },
  { key: 'other', label: 'Other', icon: 'dots-horizontal' },
];

const FeedbackScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [category, setCategory] = useState<Category>('other');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [alertModal, setAlertModal] = useState<{ visible: boolean; type: 'success' | 'error'; title: string; message: string }>({
    visible: false, type: 'success', title: '', message: '',
  });

  const handleSubmit = async () => {
    if (rating === 0) {
      setAlertModal({ visible: true, type: 'error', title: 'Rating Required', message: 'Please select a star rating' });
      return;
    }
    if (!message.trim()) {
      setAlertModal({ visible: true, type: 'error', title: 'Message Required', message: 'Please write your feedback message' });
      return;
    }

    setSubmitting(true);
    try {
      await feedbackService.submit({ category, rating, message, isAnonymous });
      setSubmitted(true);
    } catch (error) {
      setAlertModal({ visible: true, type: 'error', title: 'Error', message: 'Failed to submit feedback. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewFeedback = () => {
    setCategory('other');
    setRating(0);
    setMessage('');
    setIsAnonymous(false);
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successCircle}>
            <MaterialCommunityIcons name="check" size={60} color="#4CAF50" />
          </View>
          <Text style={styles.successTitle}>Thank You!</Text>
          <Text style={styles.successMessage}>
            Your feedback has been submitted successfully. The school administration will review it.
          </Text>
          <TouchableOpacity style={styles.newFeedbackBtn} onPress={handleNewFeedback}>
            <Text style={styles.newFeedbackBtnText}>Submit Another Feedback</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Info */}
        <View style={styles.headerCard}>
          <MaterialCommunityIcons name="comment-text" size={32} color="#004BA8" />
          <Text style={styles.headerTitle}>Share Your Feedback</Text>
          <Text style={styles.headerSubtitle}>Help us improve SIIT by sharing your experience</Text>
        </View>

        {/* Category */}
        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(cat => {
            const selected = category === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                onPress={() => setCategory(cat.key)}
              >
                <MaterialCommunityIcons
                  name={cat.icon as any}
                  size={18}
                  color={selected ? '#fff' : '#004BA8'}
                />
                <Text style={[styles.categoryChipText, selected && { color: '#fff' }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Star Rating */}
        <Text style={styles.sectionLabel}>Rating</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <MaterialCommunityIcons
                name={star <= rating ? 'star' : 'star-outline'}
                size={40}
                color={star <= rating ? '#FFB300' : '#ccc'}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.ratingLabel}>
          {rating === 0 ? 'Tap to rate' : rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'}
        </Text>

        {/* Message */}
        <Text style={styles.sectionLabel}>Your Feedback</Text>
        <TextInput
          style={styles.messageInput}
          placeholder="Tell us about your experience, suggestions, or concerns..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={5}
          value={message}
          onChangeText={setMessage}
          maxLength={1000}
        />
        <Text style={styles.charCount}>{message.length}/1000</Text>

        {/* Anonymous Toggle */}
        <TouchableOpacity
          style={styles.anonymousToggle}
          onPress={() => setIsAnonymous(!isAnonymous)}
        >
          <MaterialCommunityIcons
            name={isAnonymous ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={22}
            color="#004BA8"
          />
          <Text style={styles.anonymousText}>Submit anonymously</Text>
        </TouchableOpacity>
        {isAnonymous && (
          <Text style={styles.anonymousHint}>
            Your name will not be shown to the administration
          </Text>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="send" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Error Modal */}
      <Modal visible={alertModal.visible} transparent animationType="fade" onRequestClose={() => setAlertModal(prev => ({ ...prev, visible: false }))}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <MaterialCommunityIcons
              name={alertModal.type === 'success' ? 'check-circle' : 'alert-circle'}
              size={44}
              color={alertModal.type === 'success' ? '#4CAF50' : '#D32F2F'}
            />
            <Text style={styles.modalTitle}>{alertModal.title}</Text>
            <Text style={styles.modalMessage}>{alertModal.message}</Text>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: alertModal.type === 'success' ? '#4CAF50' : '#D32F2F' }]}
              onPress={() => setAlertModal(prev => ({ ...prev, visible: false }))}
            >
              <Text style={styles.modalBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    marginBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 8 },
  headerSubtitle: { fontSize: 13, color: '#666', marginTop: 4, textAlign: 'center' },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 12 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#004BA8',
    gap: 6,
    backgroundColor: '#fff',
  },
  categoryChipSelected: {
    backgroundColor: '#004BA8',
    borderColor: '#004BA8',
  },
  categoryChipText: { fontSize: 13, fontWeight: '600', color: '#004BA8' },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  messageInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#333',
    height: 120,
    textAlignVertical: 'top',
    elevation: 1,
  },
  charCount: { fontSize: 11, color: '#999', textAlign: 'right', marginTop: 4 },
  anonymousToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    marginTop: 6,
  },
  anonymousText: { fontSize: 14, color: '#333' },
  anonymousHint: { fontSize: 12, color: '#999', fontStyle: 'italic', marginLeft: 30 },
  submitButton: {
    backgroundColor: '#004BA8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
    elevation: 3,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  // Success screen
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  successMessage: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  newFeedbackBtn: {
    backgroundColor: '#004BA8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  newFeedbackBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '85%', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 12, marginBottom: 6 },
  modalMessage: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  modalBtn: { paddingHorizontal: 30, paddingVertical: 10, borderRadius: 8 },
  modalBtnText: { color: '#fff', fontWeight: '600' },
});

export default FeedbackScreen;
