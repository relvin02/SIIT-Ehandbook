import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mediaService } from '../services/apiClient';

const siitLogo = require('../assets/siitlogo.png');

const SIITHymnScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [hymn, setHymn] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHymn();
  }, []);

  const fetchHymn = async () => {
    try {
      setLoading(true);
      const data = await mediaService.getHymn();
      setHymn(data);
    } catch (error) {
      console.error('Failed to fetch hymn:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAudio = () => {
    if (hymn?.url) {
      Linking.openURL(hymn.url);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B5E20" />
      </View>
    );
  }

  // Default lyrics if no hymn in database yet
  const defaultLyrics = `SIIT HYMN

(Lyrics to be added by Admin)

Please ask your administrator to add the SIIT Hymn
through the Admin Dashboard > Media Management.`;

  const lyrics = hymn?.lyrics || defaultLyrics;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.headerCard}>
          <Image source={siitLogo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.headerTitle}>SIIT Hymn</Text>
          <Text style={styles.headerSubtitle}>Siargao Island Institute of Technology</Text>
        </View>

        {/* Play Button */}
        {hymn?.url && (
          <TouchableOpacity style={styles.playButton} onPress={openAudio}>
            <MaterialCommunityIcons name="play-circle" size={32} color="#fff" />
            <Text style={styles.playButtonText}>Play SIIT Hymn</Text>
          </TouchableOpacity>
        )}

        {/* Lyrics */}
        <View style={styles.lyricsContainer}>
          <View style={styles.lyricsHeader}>
            <MaterialCommunityIcons name="music-note" size={20} color="#1B5E20" />
            <Text style={styles.lyricsTitle}>Lyrics</Text>
          </View>
          <View style={styles.lyricsDivider} />
          <Text style={styles.lyricsText}>{lyrics}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    backgroundColor: '#1B5E20',
    padding: 30,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B5E20',
    margin: 15,
    borderRadius: 12,
    paddingVertical: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  lyricsContainer: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  lyricsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  lyricsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginLeft: 8,
  },
  lyricsDivider: {
    height: 2,
    backgroundColor: '#1B5E20',
    opacity: 0.3,
    marginBottom: 16,
  },
  lyricsText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 26,
    textAlign: 'center',
  },
});

export default SIITHymnScreen;
