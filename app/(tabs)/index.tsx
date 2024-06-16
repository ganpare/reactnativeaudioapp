import React, { useState, useRef, useEffect, useContext } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import SubtitleDisplay from '@/components/SubtitleDisplay';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as FileSystem from 'expo-file-system';
import parser from 'subtitles-parser';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Audio } from 'expo-av';
import { FileContext } from '../../context/FileContext';

export default function HomeScreen() {
  const { wavFile, srtFile, setWavFile, setSrtFile, fileList } = useContext(FileContext);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef(null);
  const [subtitles, setSubtitles] = useState([]);
  const [orientation, setOrientation] = useState('PORTRAIT_UP');

  useEffect(() => {
    changeOrientation('PORTRAIT_UP');
  }, []);

  useEffect(() => {
    if (srtFile) {
      console.log('Loading subtitles from', srtFile.uri);
      loadSubtitles(srtFile.uri);
    }
  }, [srtFile]);

  useEffect(() => {
    const loadAudio = async () => {
      try {
        console.log('Loading Sound', wavFile.uri); // デバッグログ
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }
        const { sound } = await Audio.Sound.createAsync({ uri: wavFile.uri });
        soundRef.current = sound;
        console.log('Sound loaded successfully'); // デバッグログ
      } catch (error) {
        console.error("Error loading sound:", error);
      }
    };

    if (wavFile) {
      loadAudio();
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [wavFile]);

  useEffect(() => {
    const updatePlaybackPosition = async () => {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          const position = status.positionMillis / 1000;
          setPlaybackPosition(position);
          console.log('Playback position updated to', position);
        }
      }
    };

    const interval = setInterval(updatePlaybackPosition, 1000); // 1秒ごとに再生位置を更新
    return () => clearInterval(interval);
  }, []);

  const changeOrientation = async (newOrientation) => {
    try {
      switch (newOrientation) {
        case 'PORTRAIT_UP':
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
          console.log("縦向きに変更されました");
          break;
        case 'LANDSCAPE_LEFT':
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
          console.log("横向きに変更されました");
          break;
        default:
          console.log("不明な向き:", newOrientation);
          break;
      }
      setOrientation(newOrientation);
    } catch (error) {
      console.error("向き変更エラー:", error);
    }
  };

  const toggleOrientation = () => {
    const newOrientation = orientation === 'PORTRAIT_UP' ? 'LANDSCAPE_LEFT' : 'PORTRAIT_UP';
    changeOrientation(newOrientation);
  };

  const loadSubtitles = async (uri) => {
    try {
      const fileContent = await FileSystem.readAsStringAsync(uri);
      const parsedSubtitles = parser.fromSrt(fileContent);
      setSubtitles(parsedSubtitles);
      console.log('Subtitles loaded successfully');
    } catch (error) {
      console.error("Error loading subtitles:", error);
    }
  };

  const handlePlayPause = async () => {
    if (soundRef.current) {
      const status = await soundRef.current.getStatusAsync();
      if (status.isPlaying) {
        console.log('Pausing playback');
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        console.log('Starting playback');
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

  const handleNext = () => {
    console.log("Current wavFile:", wavFile); // デバッグログ
    console.log("File list:", fileList); // デバッグログ
    const currentIndex = fileList.findIndex(file => `file:///storage/5BC9-9B1F/Download/luna/${file}.wav` === wavFile?.uri);
    console.log('Current index:', currentIndex); // デバッグログ
    if (currentIndex < fileList.length - 1 && currentIndex !== -1) {
      const nextFile = fileList[currentIndex + 1];
      console.log('Next file:', nextFile); // デバッグログ
      setWavFile({ uri: `file:///storage/5BC9-9B1F/Download/luna/${nextFile}.wav`, name: `${nextFile}.wav` });
      setSrtFile({ uri: `file:///storage/5BC9-9B1F/Download/luna/${nextFile}.srt`, name: `${nextFile}.srt` });
    } else {
      console.log('No next file available'); // デバッグログ
    }
  };

  const handlePrevious = () => {
    console.log("Current wavFile:", wavFile); // デバッグログ
    console.log("File list:", fileList); // デバッグログ
    const currentIndex = fileList.findIndex(file => `file:///storage/5BC9-9B1F/Download/luna/${file}.wav` === wavFile?.uri);
    console.log('Current index:', currentIndex); // デバッグログ
    if (currentIndex > 0) {
      const previousFile = fileList[currentIndex - 1];
      console.log('Previous file:', previousFile); // デバッグログ
      setWavFile({ uri: `file:///storage/5BC9-9B1F/Download/luna/${previousFile}.wav`, name: `${previousFile}.wav` });
      setSrtFile({ uri: `file:///storage/5BC9-9B1F/Download/luna/${previousFile}.srt`, name: `${previousFile}.srt` });
    } else {
      console.log('No previous file available'); // デバッグログ
    }
  };

  return (
    <View style={styles.container}>
      {wavFile?.name && (
        <View style={styles.fileNameContainer}>
          <Text style={styles.fileNameText}>{wavFile.name.replace('.wav', '')}</Text>
        </View>
      )}
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
        <TouchableOpacity style={styles.button} onPress={handlePrevious}>
          <Icon name="skip-previous" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Icon name="skip-next" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={toggleOrientation}>
          <Icon name={orientation === 'PORTRAIT_UP' ? "screen-lock-portrait" : "screen-lock-landscape"} size={30} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.contentContainer}>
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
  fileNameContainer: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1D3D47',
  },
  fileNameText: {
    fontSize: 18,
    color: 'white',
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
});
