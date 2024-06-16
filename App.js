// App.js
import React, { useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import FileSelector from './components/FileSelector';
import AudioPlayer from './components/AudioPlayer';
import SubtitleDisplay from './components/SubtitleDisplay';

export default function App() {
  const [wavFile, setWavFile] = useState(null);
  const [srtFile, setSrtFile] = useState(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);+
  const soundRef = useRef<Audio.Sound | null>(null);

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
      {wavFile && (
        <AudioPlayer
          fileUri={wavFile.uri}
          soundRef={soundRef} // soundRef を渡す
        />
      )}
      {srtFile && (
        <SubtitleDisplay fileUri={srtFile.uri} playbackPosition={playbackPosition} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});