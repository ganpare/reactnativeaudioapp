import React, { useState, useRef, useEffect } from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';
import AudioPlayer from '@/components/AudioPlayer';
import SubtitleDisplay from '@/components/SubtitleDisplay';
import FileSelector from '@/components/FileSelector';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const [wavFile, setWavFile] = useState(null);
  const [srtFile, setSrtFile] = useState(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const soundRef = useRef(null);

  const handleFileSelected = (file, type) => {
    if (type === 'wav' || type === 'mp3') {
      setWavFile(file);
      console.log("WAV/MP3ファイルを選択しました:", file); // デバッグログを追加
    } else if (type === 'srt') {
      setSrtFile(file);
      console.log("SRTファイルを選択しました:", file); // デバッグログを追加
    }
  };

  // ファイル選択後、ファイル名を表示する
  const [selectedWavFileName, setSelectedWavFileName] = useState('');
  const [selectedSrtFileName, setSelectedSrtFileName] = useState('');

  useEffect(() => {
    if (wavFile) {
      setSelectedWavFileName(wavFile.name);
    }
    if (srtFile) {
      setSelectedSrtFileName(srtFile.name);
    }
  }, [wavFile, srtFile]);

  useEffect(() => {
    const updatePlaybackPosition = async () => {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        const position = status.positionMillis / 1000;
        setPlaybackPosition(position);
      }
    };

    const interval = setInterval(updatePlaybackPosition, 1000); // ログの頻度を減らすために1秒ごとに更新
    return () => clearInterval(interval);
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      {/* ファイル選択ボタンを追加 */}
      <View style={styles.stepContainer}>
        <FileSelector onFileSelected={(file) => handleFileSelected(file, 'wav')} />
        {selectedWavFileName && <Text style={styles.selectedFile}>選択されたWAVファイル: {selectedWavFileName}</Text>}
      </View>
      <View style={styles.stepContainer}>
        <FileSelector onFileSelected={(file) => handleFileSelected(file, 'srt')} />
        {selectedSrtFileName && <Text style={styles.selectedFile}>選択されたSRTファイル: {selectedSrtFileName}</Text>}
      </View>

      {/* 音声再生・字幕表示コンポーネントを追加 */}
      {wavFile && (
        <View style={styles.audioContainer}>
          <AudioPlayer fileUri={wavFile.uri} soundRef={soundRef} />
        </View>
      )}
      {srtFile && playbackPosition !== null && (
        <SubtitleDisplay fileUri={srtFile.uri} playbackPosition={playbackPosition} />
      )}
    </ParallaxScrollView>
  );
}

// ... (既存のstyles)
const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  audioContainer: { 
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  selectedFile: { 
    marginTop: 8,
    color: 'white',
  },
});