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
import { searchService } from '../services/apiClient';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

// Quick-reply suggestions
const QUICK_REPLIES = [
  'Admission requirements',
  'Tuition fees',
  'Scholarship',
  'Student conduct',
  'Grading system',
  'Uniform policy',
];

const ChatScreen = () => {
  const { user } = useSelector((state: any) => state.auth);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: 'Hi there! 👋 I\'m your SIIT Handbook Assistant. Ask me anything about school policies, rules, admissions, or student life — I\'ll search the official handbook for you!',
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

  /**
   * Check for simple conversational messages (greetings, thanks, identity)
   */
  const getConversationalReply = (question: string): string | null => {
    const q = question.toLowerCase().trim();

    if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|kumusta|musta)/i.test(q)) {
      return 'Hello! 👋 I\'m here to help you with anything in the SIIT Student Handbook. What would you like to know?';
    }
    if (/^(thanks?|thank\s*you|salamat|appreciate)/i.test(q)) {
      return 'You\'re welcome! 😊 Feel free to ask me anything else about the handbook!';
    }
    if (/what.*(my|is my)\s*name|who\s*am\s*i/i.test(q)) {
      const userName = user?.name || 'Student';
      return `Your name is ${userName}! 😊 How can I help you today?`;
    }
    if (/who\s*are\s*you|what\s*are\s*you|your\s*name/i.test(q)) {
      return 'I\'m the SIIT Handbook Assistant! I search the official Student Manual to give you accurate answers about policies, rules, and school information. Try asking me something! 📖';
    }
    if (/^(bye|goodbye|see\s*you)/i.test(q)) {
      return 'Goodbye! 👋 Come back anytime you need help with the handbook!';
    }
    return null;
  };

  /**
   * Extract keywords from user question for searching
   */
  const extractSearchTerms = (question: string): string[] => {
    const stopWords = new Set([
      'what', 'is', 'the', 'a', 'an', 'are', 'how', 'do', 'does', 'can', 'i',
      'to', 'in', 'of', 'for', 'and', 'or', 'my', 'me', 'we', 'you', 'your',
      'this', 'that', 'it', 'be', 'will', 'would', 'should', 'could', 'about',
      'have', 'has', 'had', 'was', 'were', 'been', 'being', 'with', 'from',
      'at', 'on', 'if', 'there', 'their', 'they', 'them', 'any', 'all',
      'when', 'where', 'who', 'which', 'why', 'tell', 'know', 'get', 'give',
      'sa', 'ang', 'ng', 'mga', 'na', 'po', 'ko', 'mo', 'ba', 'ano', 'paano',
      'saan', 'kailan', 'sino', 'yung', 'may', 'naman', 'lang', 'din', 'rin',
      'alam', 'pano', 'gusto', 'kasi', 'talaga', 'dito', 'doon', 'ito', 'iyon',
      'namin', 'natin', 'nila', 'kami', 'tayo', 'sila', 'kayo', 'nya', 'niya',
      'pwede', 'pwedeng', 'meron', 'wala', 'ganun', 'ganon', 'ganito', 'ganyan',
      'pa', 'pala', 'daw', 'raw', 'nga', 'eh', 'oh', 'ha', 'oo', 'hindi',
      'magkano', 'need', 'like', 'just', 'also', 'please', 'want', 'really',
    ]);

    // Tagalog → English keyword mappings for common handbook topics
    const tagalogMap: Record<string, string> = {
      'bayad': 'tuition fees payment',
      'magbayad': 'tuition fees payment',
      'bayarin': 'tuition fees payment',
      'pera': 'tuition fees payment',
      'pasok': 'admission enrollment',
      'pumasok': 'admission enrollment',
      'papasok': 'admission enrollment',
      'enroll': 'enrollment admission',
      'uniporme': 'uniform dress code',
      'damit': 'uniform dress code',
      'grado': 'grading system grades',
      'grades': 'grading system',
      'bawal': 'prohibited violations conduct',
      'parusa': 'sanctions penalty violations',
      'suspension': 'suspension disciplinary',
      'late': 'tardiness attendance',
      'absent': 'absence attendance',
      'liban': 'absence attendance',
      'ID': 'identification card',
      'scholarship': 'scholarship financial',
      'iskolar': 'scholarship financial',
      'libre': 'scholarship financial',
      'exam': 'examination',
      'pasahan': 'requirements submission',
      'requirements': 'requirements admission',
    };
    
    const words = question.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 1 && !stopWords.has(w));

    // Expand Tagalog words to English equivalents
    const expanded: string[] = [];
    for (const word of words) {
      if (tagalogMap[word]) {
        expanded.push(...tagalogMap[word].split(' '));
      } else {
        expanded.push(word);
      }
    }

    // Deduplicate and put English words first (more likely to match handbook)
    const unique = [...new Set(expanded)];
    return unique;
  };

  /**
   * Format handbook search results into a readable bot response
   */
  const formatSearchResults = (results: any[], originalQuestion: string): string => {
    if (!results || results.length === 0) {
      return `I couldn't find specific information about "${originalQuestion}" in the handbook. Try rephrasing your question, or you can browse the Handbook tab directly for more details! 📖`;
    }

    // Take top 2 most relevant results
    const topResults = results.slice(0, 2);
    let response = '';

    for (let i = 0; i < topResults.length; i++) {
      const result = topResults[i];
      const title = result.title || 'Untitled';
      // Get a meaningful excerpt (up to 500 chars)
      let content = (result.content || '').trim();
      
      // Strip HTML tags if present
      content = content.replace(/<[^>]*>/g, '');
      
      if (content.length > 500) {
        // Try to cut at sentence boundary
        const cutContent = content.substring(0, 500);
        const lastPeriod = cutContent.lastIndexOf('.');
        content = lastPeriod > 200 ? cutContent.substring(0, lastPeriod + 1) : cutContent + '...';
      }

      if (topResults.length > 1) {
        response += `📌 **${title}**\n${content}\n\n`;
      } else {
        response += `📌 **${title}**\n\n${content}`;
      }
    }

    if (results.length > 2) {
      response += `\n\n💡 Found ${results.length} results. Check the Search tab for more details!`;
    }

    return response.trim();
  };

  /**
   * Main answer logic: conversational check → handbook search
   */
  const findAnswer = async (question: string): Promise<string> => {
    // 1. Check for conversational replies first
    const conversationalReply = getConversationalReply(question);
    if (conversationalReply) return conversationalReply;

    // 2. Search the actual handbook
    try {
      // Try full question first
      let results = await searchService.search(question);
      
      // If no results, try extracted/translated keywords
      if ((!results || results.length === 0)) {
        const keywords = extractSearchTerms(question);
        
        // Try combining top keywords (e.g. "tuition fees payment")
        if (keywords.length >= 2) {
          const combined = keywords.slice(0, 3).join(' ');
          results = await searchService.search(combined);
        }

        // If still no results, try individual keywords
        if (!results || results.length === 0) {
          for (const keyword of keywords) {
            if (keyword.length >= 3) {
              results = await searchService.search(keyword);
              if (results && results.length > 0) break;
            }
          }
        }
      }

      return formatSearchResults(results, question);
    } catch (error) {
      console.error('Handbook search error:', error);
      return 'Sorry, I\'m having trouble searching the handbook right now. Please try again in a moment or browse the Handbook tab directly! 📖';
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === '' || isTyping) return;

    const userText = inputText.trim();

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    scrollToBottom();

    // Get answer (may involve API call)
    const botResponse = await findAnswer(userText);
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponse,
      sender: 'bot',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, botMessage]);
    setIsTyping(false);
    scrollToBottom();
  };

  const handleQuickReply = (text: string) => {
    setInputText(text);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '0',
        text: 'Hello! I\'m the SIIT Handbook Assistant 🎓 Ask me anything about the Student Manual — policies, rules, admissions, or student life!',
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
              <Text style={[styles.messageText, styles.botMessageText]}>Searching handbook...</Text>
            </View>
          </View>
        )}

        {/* Quick Reply Chips - show only when no conversation yet */}
        {messages.length <= 1 && !isTyping && (
          <View style={styles.quickRepliesContainer}>
            <Text style={styles.quickRepliesLabel}>Try asking about:</Text>
            <View style={styles.quickRepliesRow}>
              {QUICK_REPLIES.map((text, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickReplyChip}
                  onPress={() => handleQuickReply(text)}
                >
                  <Text style={styles.quickReplyText}>{text}</Text>
                </TouchableOpacity>
              ))}
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
  quickRepliesContainer: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  quickRepliesLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    fontWeight: '600',
  },
  quickRepliesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickReplyChip: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  quickReplyText: {
    color: '#004BA8',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ChatScreen;
