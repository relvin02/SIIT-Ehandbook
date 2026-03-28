import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

interface FAQ {
  id: number;
  keywords: { exact: string[]; priority: string[]; general: string[] };
  response: string;
}

const FAQ_DATA: FAQ[] = [
  {
    id: 1,
    keywords: {
      exact: ['what programs', 'what courses', 'what do you offer', 'what programs do you have'],
      priority: ['program', 'programs', 'course', 'courses', 'major', 'degree', 'bachelors', 'bachelor', 'engineering', 'computer science', 'information technology'],
      general: ['study', 'offered', 'bs', 'it'],
    },
    response: 'SIIT offers several programs including Bachelor of Science in Information Technology, Computer Science, and Engineering. For more details, visit the Handbook or contact the Admissions Office at admissions@siit.edu.',
  },
  {
    id: 2,
    keywords: {
      exact: ['scholarship', 'financial aid', 'grants', 'how to get scholarship'],
      priority: ['scholarship', 'scholarships', 'grant', 'grants', 'financial', 'funding', 'fund'],
      general: ['assistance', 'sponsorship', 'money', 'afford'],
    },
    response: 'SIIT has scholarship programs available for qualified students. Contact the Financial Aid Office at finaid@siit.edu or visit the Scholarship section in your Handbook for eligibility requirements and how to apply.',
  },
  {
    id: 3,
    keywords: {
      exact: ['how to apply', 'how do i apply', 'admission requirements', 'how to enroll'],
      priority: ['admission', 'admissions', 'apply', 'application', 'entrance', 'requirements', 'enroll'],
      general: ['admit', 'intake', 'accept'],
    },
    response: 'To apply to SIIT, you\'ll need to submit: academic transcripts, entrance exam results, and a completed application form. Visit admissions@siit.edu or the Handbook for detailed step-by-step instructions and deadlines.',
  },
  {
    id: 4,
    keywords: {
      exact: ['academic transcript', 'official records', 'how to get transcript'],
      priority: ['transcript', 'transcripts', 'records', 'academic', 'gpa', 'grades'],
      general: ['document', 'certificate', 'copy'],
    },
    response: 'To request your academic transcript, visit the Registrar\'s Office or submit a request online at registrar@siit.edu. Standard processing takes 3-5 business days.',
  },
  {
    id: 5,
    keywords: {
      exact: ['student conduct', 'disciplinary policy', 'code of conduct', 'school rules'],
      priority: ['conduct', 'discipline', 'disciplinary', 'rules', 'code', 'violation', 'policy'],
      general: ['behavior', 'misconduct', 'penalties', 'punishment'],
    },
    response: 'Student conduct expectations are outlined in the Student Handbook. Contact the Office of Student Affairs at studentaffairs@siit.edu for questions about disciplinary policies, violations, and conduct codes.',
  },
  {
    id: 6,
    keywords: {
      exact: ['student clubs', 'how to join', 'student organizations', 'what clubs are there'],
      priority: ['clubs', 'club', 'activities', 'activity', 'organization', 'organizations', 'student life'],
      general: ['join', 'societies', 'extracurricular', 'sports', 'events'],
    },
    response: 'SIIT has various student clubs and organizations covering academics, sports, arts, and more. Check the Student Life section in the Handbook or visit the Student Affairs office to join clubs that match your interests.',
  },
  {
    id: 7,
    keywords: {
      exact: ['library resources', 'how to use library', 'library services'],
      priority: ['library', 'books', 'resources', 'research', 'borrowing'],
      general: ['study materials', 'references', 'reading materials', 'materials'],
    },
    response: 'The SIIT Library offers access to books, journals, and digital resources. Visit the Library section in the Handbook or contact library@siit.edu for research assistance, borrowing procedures, and resource guides.',
  },
  {
    id: 8,
    keywords: {
      exact: ['counseling services', 'mental health support', 'student counseling', 'need help'],
      priority: ['counseling', 'counselor', 'mental health', 'wellness', 'support', 'help'],
      general: ['stress', 'anxiety', 'personal', 'psychological', 'issues'],
    },
    response: 'SIIT provides counseling and wellness services to all students. Contact the Student Counseling Center at counseling@siit.edu or visit the office for confidential support with academic, personal, and mental health concerns.',
  },
  {
    id: 9,
    keywords: {
      exact: ['tuition payment', 'payment deadline', 'billing', 'when to pay', 'payment schedule'],
      priority: ['payment', 'tuition', 'billing', 'fee', 'deadline', 'bill'],
      general: ['installment', 'cost', 'fees', 'schedule'],
    },
    response: 'Tuition payment information and schedules are in the Billing section of the Handbook. For payment plans, deadline extensions, or billing questions, contact the Finance Office at finance@siit.edu.',
  },
  {
    id: 10,
    keywords: {
      exact: ['siit hymn', 'school hymn', 'school anthem', 'listen to hymn'],
      priority: ['hymn', 'anthem', 'music', 'song', 'lyrics'],
      general: ['listen', 'school', 'siit'],
    },
    response: 'The SIIT Hymn is available in the app! Go to the Home tab and look for the "SIIT Hymn" section to view the lyrics and listen to the music. It\'s a beautiful part of our school identity!',
  },
];

const ChatScreen = () => {
  const { user } = useSelector((state: any) => state.auth);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: 'Hi there! 👋 I\'m your SIIT Assistant. Ask me about programs, scholarships, admissions, student life, or anything in the handbook!',
      sender: 'bot',
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findAnswer = (question: string): string => {
    const lowerQuestion = question.toLowerCase().trim();
    
    let bestMatch: FAQ | null = null;
    let bestScore = 0;
    
    for (const faq of FAQ_DATA) {
      let score = 0;
      
      // Check EXACT phrase matches first (highest priority)
      for (const exactPhrase of faq.keywords.exact) {
        if (lowerQuestion.includes(exactPhrase.toLowerCase())) {
          score += 10; // Highest weight
        }
      }
      
      // Check PRIORITY keywords (medium priority)
      for (const priorityKeyword of faq.keywords.priority) {
        if (lowerQuestion.includes(priorityKeyword.toLowerCase())) {
          score += 5; // Medium weight
        }
      }
      
      // Check GENERAL keywords (lowest priority)
      for (const generalKeyword of faq.keywords.general) {
        if (lowerQuestion.includes(generalKeyword.toLowerCase())) {
          score += 1; // Low weight
        }
      }
      
      // Keep track of the FAQ with the highest score
      if (score > bestScore) {
        bestScore = score;
        bestMatch = faq;
      }
    }
    
    // If we found a good match, return the answer
    if (bestMatch && bestScore > 0) {
      return bestMatch.response;
    }
    
    // Fallback responses for common questions
    if (
      lowerQuestion.includes('hello') ||
      lowerQuestion.includes('hi') ||
      lowerQuestion.includes('how are you') ||
      lowerQuestion.includes('hey')
    ) {
      return 'Hello! 👋 I\'m here to help. Ask me about programs, scholarships, admissions, conduct, activities, library, counseling, payments, or student life at SIIT!';
    }
    
    if (
      lowerQuestion.includes('thank') ||
      lowerQuestion.includes('thanks') ||
      lowerQuestion.includes('appreciate')
    ) {
      return 'You\'re welcome! 😊 Feel free to ask me more questions about SIIT!';
    }

    // Check for name-related questions (what's my name, who am I, etc.)
    if (
      lowerQuestion.includes('what is my name') ||
      lowerQuestion.includes('what\'s my name') ||
      lowerQuestion.includes('my name') ||
      lowerQuestion.includes('who am i') ||
      lowerQuestion.includes('who am I')
    ) {
      const userName = user?.name || 'Student';
      return `Your name is ${userName}! 😊 It's nice to be assisting you. How can I help with your SIIT-related questions?`;
    }
    
    if (
      lowerQuestion.includes('who are you') ||
      lowerQuestion.includes('what are you') ||
      lowerQuestion.includes('your name')
    ) {
      return 'I\'m the SIIT Assistant! I\'m here to answer your questions about the SIIT E-Handbook, programs, policies, and student services. What would you like to know?';
    }
    
    // Generic fallback
    return 'I\'m not entirely sure about that. Try asking about: programs, scholarships, admissions, conduct, student activities, library, counseling, or payments. Or check the Handbook directly!';
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = findAnswer(inputText);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 500);

    scrollToBottom();
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '0',
        text: 'Hello! I\'m the SIIT Assistant 🎓 Ask me anything about SIIT E-Handbook, programs, scholarships, admissions, or student life!',
        sender: 'bot',
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 150 : 80}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SIIT Assistant</Text>
        <TouchableOpacity onPress={handleClearChat} style={styles.refreshButton}>
          <MaterialCommunityIcons name="refresh" size={24} color="#004BA8" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.messagesContent}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageWrapper,
              message.sender === 'user' ? styles.userMessageWrapper : styles.botMessageWrapper,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.sender === 'user' ? styles.userMessage : styles.botMessage,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.sender === 'user' ? styles.userMessageText : styles.botMessageText,
                ]}
              >
                {message.text}
              </Text>
            </View>
          </View>
        ))}

        {isTyping && (
          <View style={[styles.messageWrapper, styles.botMessageWrapper]}>
            <View style={[styles.messageBubble, styles.botMessage]}>
              <ActivityIndicator size="small" color="#004BA8" />
              <Text style={[styles.messageText, styles.botMessageText]}>Typing...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask me a question..."
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={setInputText}
          onFocus={() => {
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 200);
          }}
          multiline
          maxLength={500}
          editable={!isTyping}
        />
        <TouchableOpacity
          style={[styles.sendButton, isTyping && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={isTyping || inputText.trim() === ''}
        >
          <MaterialCommunityIcons
            name="send"
            size={20}
            color={isTyping || inputText.trim() === '' ? '#ccc' : '#fff'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f3f8',
  },
  header: {
    backgroundColor: 'linear-gradient(135deg, #004BA8 0%, #0066cc 100%)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  messageWrapper: {
    marginVertical: 6,
    flexDirection: 'row',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  botMessageWrapper: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userMessage: {
    backgroundColor: '#004BA8',
    shadowColor: '#004BA8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  botMessage: {
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '500',
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#1a1a1a',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'android' ? 16 : 12,
    backgroundColor: '#fff',
    borderTopColor: '#e8e8e8',
    borderTopWidth: 1,
    alignItems: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  input: {
    flex: 1,
    borderColor: '#d0d0d0',
    borderWidth: 1.5,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 11,
    maxHeight: 100,
    fontSize: 14,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    backgroundColor: '#004BA8',
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#004BA8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default ChatScreen;
