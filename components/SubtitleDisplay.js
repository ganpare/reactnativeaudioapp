import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';
import parser from 'subtitles-parser';

export default function SubtitleDisplay({ fileUri, playbackPosition }) {
  const [subtitles, setSubtitles] = useState([]);
  const [displaySubtitles, setDisplaySubtitles] = useState([]);

  useEffect(() => {
    const loadSubtitles = async () => {
      try {
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        const parsedSubtitles = parser.fromSrt(fileContent);
        setSubtitles(parsedSubtitles);
      } catch (error) {
        console.error('Error loading subtitles:', error);
      }
    };

    if (fileUri) {
      loadSubtitles();
    }
  }, [fileUri]);

  useEffect(() => {
    const currentIndex = subtitles.findIndex(
      subtitle =>
        playbackPosition >= convertTimeToSeconds(subtitle.startTime) &&
        playbackPosition < convertTimeToSeconds(subtitle.endTime)
    );

    if (currentIndex !== -1) {
      const newDisplaySubtitles = subtitles.slice(Math.max(0, currentIndex - 2), currentIndex + 1);
      setDisplaySubtitles(newDisplaySubtitles);
    } else {
      setDisplaySubtitles([]);
    }
  }, [playbackPosition, subtitles]);

  return (
    <View style={styles.container}>
      {displaySubtitles.map((subtitle, index) => {
        const isCurrentSubtitle = index === displaySubtitles.length - 1;
        return (
          <Text
            key={index}
            style={[
              styles.subtitleText,
              isCurrentSubtitle && styles.currentSubtitleText,
            ]}
          >
            {subtitle.text}
          </Text>
        );
      })}
    </View>
  );
}

const convertTimeToSeconds = (time) => {
  const [hours, minutes, seconds] = time.split(':');
  const [secs, millis] = seconds.split(',');
  return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(secs) + parseInt(millis) / 1000;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 50,
  },
  subtitleText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  currentSubtitleText: {
    color: 'yellow',
    fontSize: 24,
  },
});
