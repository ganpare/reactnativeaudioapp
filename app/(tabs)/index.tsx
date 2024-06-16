import React, { useState, useRef, useEffect, useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import AudioPlayer from '@/components/AudioPlayer';
import SubtitleDisplay from '@/components/SubtitleDisplay';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as FileSystem from 'expo-file-system';
import parser from 'subtitles-parser';
import * as ScreenOrientation from 'expo-screen-orientation';
import { FileContext } from '../../context/FileContext';

export default function HomeScreen() {
  const { wavFile, srtFile } = useContext(FileContext);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef(null);
  const [subtitles, setSubtitles] = useState([]);

  useEffect(() => {
    // 初期向きを設定（初期化時に PORTRAIT_UP にロック）
    changeOrientation('PORTRAIT_UP');
  }, []);

  useEffect(() => {
    if (srtFile) {
      loadSubtitles(srtFile.uri);
    }
  }, [srtFile]);

  useEffect(() => {
    if (wavFile && soundRef.current) {
      soundRef.current.loadAsync({ uri: wavFile.uri });
      setIsPlaying(false);  // 再生状態をリセット
    }
  }, [wavFile]);

  const changeOrientation = async (orientation) => {
    try {
      switch (orientation) {
        case 'PORTRAIT_UP':
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
          console.log("縦向きに変更されました");
          break;
        case 'LANDSCAPE_LEFT':
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
          console.log("横向きに変更されました");
          break;
        default:
          console.log("不明な向き:", orientation);
          break;
      }
    } catch (error) {
      console.error("向き変更エラー:", error);
    }
  };

  const loadSubtitles = async (uri) => {
    const fileContent = await FileSystem.readAsStringAsync(uri);
    const parsedSubtitles = parser.fromSrt(fileContent);
    setSubtitles(parsedSubtitles);
  };

  const handlePlayPause = async () => {
    if (soundRef.current) {
      const status = await soundRef.current.getStatusAsync();
      if (status.isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const handleRewind = () => {
    console.log("巻き戻しボタンが押されました");
    if (subtitles.length > 0) {
      const currentSubtitleIndex = subtitles.findIndex(
        subtitle =>
          playbackPosition >= convertTimeToSeconds(subtitle.startTime) &&
          playbackPosition < convertTimeToSeconds(subtitle.endTime)
      );
      console.log("現在の字幕インデックス:", currentSubtitleIndex);
      if (currentSubtitleIndex > 0) {
        const previousSubtitle = subtitles[currentSubtitleIndex - 1];
        const newPosition = convertTimeToSeconds(previousSubtitle.startTime);
        console.log("新しい再生位置 (秒):", newPosition);
        soundRef.current.setPositionAsync(newPosition * 1000);
        setPlaybackPosition(newPosition);
      }
    }
  };

  const handleFastForward = () => {
    console.log("早送りボタンが押されました");
    if (subtitles.length > 0) {
      const currentSubtitleIndex = subtitles.findIndex(
        subtitle =>
          playbackPosition >= convertTimeToSeconds(subtitle.startTime) &&
          playbackPosition < convertTimeToSeconds(subtitle.endTime)
      );
      console.log("現在の字幕インデックス:", currentSubtitleIndex);
      if (currentSubtitleIndex < subtitles.length - 1) {
        const nextSubtitle = subtitles[currentSubtitleIndex + 1];
        const newPosition = convertTimeToSeconds(nextSubtitle.startTime);
        console.log("新しい再生位置 (秒):", newPosition);
        soundRef.current.setPositionAsync(newPosition * 1000);
        setPlaybackPosition(newPosition);
      }
    }
  };

  const convertTimeToSeconds = (time) => {
    const [hours, minutes, seconds] = time.split(':');
    const [secs, millis] = seconds.split(',');
    const totalSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(secs) + parseInt(millis) / 1000;
    return totalSeconds;
  };

  return (
    <View style={styles.container}>
      <View style={styles.fileSelectorContainer}>
        <TouchableOpacity style={styles.button} onPress={handleRewind}>
          <Icon name="fast-rewind" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handlePlayPause}>
          <Icon name={isPlaying ? "pause" : "play-arrow"} size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleFastForward}>
          <Icon name="fast-forward" size={30} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.orientationButtonContainer}>
        <TouchableOpacity style={styles.orientationButton} onPress={() => changeOrientation('PORTRAIT_UP')}>
          <Text style={styles.orientationButtonText}>縦向き</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.orientationButton} onPress={() => changeOrientation('LANDSCAPE_LEFT')}>
          <Text style={styles.orientationButtonText}>横向き</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.contentContainer}>
        {wavFile && (
          <View style={styles.audioContainer}>
            <AudioPlayer fileUri={wavFile.uri} soundRef={soundRef} />
          </View>
        )}
        {srtFile && playbackPosition !== null && (
          <SubtitleDisplay fileUri={srtFile.uri} playbackPosition={playbackPosition} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  fileSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1D3D47',
  },
  button: {
    padding: 10,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  orientationButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
  },
  orientationButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  orientationButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
