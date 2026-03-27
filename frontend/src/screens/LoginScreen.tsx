import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const siitSeal = require('../assets/siitlogo.png');
const seahawksLogo = require('../assets/seahawks.png');
import { authService } from '../services/apiClient';
import { authActions } from '../store';

const showAlert = (title: string, msg: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}: ${msg}`);
  } else {
    const { Alert } = require('react-native');
    Alert.alert(title, msg);
  }
};

type LoginScreenProps = {
  navigation: any;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const dispatch = useDispatch();

  const handleLogin = async () => {
    setErrorMsg('');

    if (!studentId.trim() || !password.trim()) {
      setErrorMsg('Please enter your Student ID and Password');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login(studentId.trim(), password);

      if (response.success) {
        dispatch(authActions.setUser(response.data.user));
        dispatch(authActions.setToken(response.data.token));
        dispatch(
          authActions.setRole(
            response.data.user.role === 'admin' ? 'admin' : 'student'
          )
        );
      } else {
        setErrorMsg(response.message || 'Login failed');
      }
    } catch (error: any) {
      setErrorMsg(
        error.response?.data?.message || 'Invalid Student ID or Password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Image source={siitSeal} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>SIIT E-Handbook</Text>
            <Text style={styles.subtitle}>Siargao Island Institute of Technology</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Login</Text>

            {/* Error Message */}
            {errorMsg !== '' && (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons name="alert-circle" size={18} color="#FF6B6B" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <TextInput
              style={styles.input}
              placeholder="Student ID"
              value={studentId}
              onChangeText={(text) => {
                setStudentId(text);
                setErrorMsg('');
              }}
              editable={!loading}
              autoCapitalize="characters"
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrorMsg('');
                }}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialCommunityIcons
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={24}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={styles.noteContainer}>
              <MaterialCommunityIcons name="information-outline" size={16} color="#999" />
              <Text style={styles.noteText}>
                Student accounts are created by the Admin. Contact your administrator if you don't have an account.
              </Text>
            </View>

            <View style={styles.demoContainer}>
              <Text style={styles.demoTitle}>Demo Credentials</Text>
              <Text style={styles.demoText}>Admin:</Text>
              <Text style={styles.demoValue}>
                ADMIN001 / password123
              </Text>
              <Text style={styles.demoText}>Student:</Text>
              <Text style={styles.demoValue}>
                STU001 / password123
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFD0D0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    flex: 1,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 14,
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#1B5E20',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    gap: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#999',
    flex: 1,
    lineHeight: 18,
    textAlign: 'justify',
  },
  demoContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  demoText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  demoValue: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginTop: 3,
  },
});

export default LoginScreen;
