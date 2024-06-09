import React, { useState, useEffect } from 'react';
import { Button, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

export default function AudioPlayer({ fileUri, soundRef }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const loadSound = async () => {
      console.log('Loading Sound', fileUri); // デバッグログ
      const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
      soundRef.current = sound;
    };

    if (fileUri) {
      loadSound();
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [fileUri]);

  const playSound = async () => {
    await soundRef.current?.playAsync();
    setIsPlaying(true);
  };

  const pauseSound = async () => {
    await soundRef.current?.pauseAsync();
    setIsPlaying(false);
  };

  return (
    <Button title={isPlaying ? '一時停止' : '再生'} onPress={isPlaying ? pauseSound : playSound} />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});