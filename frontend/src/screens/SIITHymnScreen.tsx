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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { mediaService } from '../services/apiClient';

const siitLogo = require('../assets/siitlogo.png');

const SIITHymnScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [hymn, setHymn] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    fetchHymn();
    return () => {
      // Cleanup sound on unmount
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
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

  const loadAndPlay = async () => {
    if (!hymn?.url) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) {
            await soundRef.current.pauseAsync();
            setIsPlaying(false);
          } else {
            await soundRef.current.playAsync();
            setIsPlaying(true);
          }
          return;
        }
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: hymn.url },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
      setIsPlaying(true);
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
        soundRef.current?.setPositionAsync(0);
      }
    }
  };

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B5E20" />
      </View>
    );
  }

  const defaultLyrics = `SIIT HYMN\n\n(Lyrics to be added by Admin)\n\nPlease ask your administrator to add the SIIT Hymn\nthrough the Admin Dashboard > Media Management.`;
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

        {/* Audio Player */}
        {hymn?.url && (
          <View style={styles.playerContainer}>
            <TouchableOpacity style={styles.playBtn} onPress={loadAndPlay}>
              <MaterialCommunityIcons
                name={isPlaying ? 'pause-circle' : 'play-circle'}
                size={56}
                color="#1B5E20"
              />
            </TouchableOpacity>

            <View style={styles.playerInfo}>
              <Text style={styles.playerTitle}>{hymn.title || 'SIIT Hymn'}</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
            </View>
          </View>
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
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  playBtn: {
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1B5E20',
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeText: {
    fontSize: 11,
    color: '#999',
  },
  lyricsContainer: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
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
