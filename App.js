// App.js
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import FileSelector from './components/FileSelector';
import AudioPlayer from './components/AudioPlayer';
import SubtitleDisplay from './components/SubtitleDisplay';

export default function App() {
  const [wavFile, setWavFile] = useState(null);
  const [srtFile, setSrtFile] = useState(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const soundRef = useRef(null);

  const handleWavFileSelected = file => {
    setWavFile(file);
  };

  const handleSrtFileSelected = file => {
    setSrtFile(file);
  };

  useEffect(() => {
    const updatePlaybackPosition = async () => {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        setPlaybackPosition(status.positionMillis / 1000);
      }
    };

    const interval = setInterval(updatePlaybackPosition, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.fileSelectors}>
        <FileSelector onFileSelected={handleWavFileSelected} iconName="music-note" fileType="audio/*" />
        <FileSelector onFileSelected={handleSrtFileSelected} iconName="subtitles" fileType="text/*" />
      </View>
      <View style={styles.playerContainer}>
        {wavFile && (
          <AudioPlayer
            fileUri={wavFile.uri}
            ref={soundRef}
          />
        )}
      </View>
      <View style={styles.subtitleContainer}>
        {srtFile && (
          <SubtitleDisplay
            fileUri={srtFile.uri}
            playbackPosition={playbackPosition}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  fileSelectors: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  subtitleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150, // 複数の字幕を表示するのに十分な高さ
    backgroundColor: 'rgba(0,0,0,0.5)', // 背景を少し暗くして読みやすくする
  },
});