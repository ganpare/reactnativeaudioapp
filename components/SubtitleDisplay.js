import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import * as FileSystem from 'expo-file-system';
import parser from 'subtitles-parser';

export default function SubtitleDisplay({ fileUri, playbackPosition }) {
  const [subtitles, setSubtitles] = useState([]);
  const [displaySubtitles, setDisplaySubtitles] = useState([]);
  const [animation] = useState(new Animated.Value(0));

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

      // アニメーション効果
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        animation.setValue(0);
      });
    }
  }, [playbackPosition, subtitles]);

  const renderSubtitle = (subtitle, index) => {
    const isCurrentSubtitle = index === displaySubtitles.length - 1;
    const style = [
      styles.subtitleText,
      isCurrentSubtitle && styles.currentSubtitleText,
      {
        transform: [
          {
            translateY: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          },
        ],
        opacity: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
      },
    ];

    return (
      <Animated.Text key={index} style={style}>
        {subtitle.text}
      </Animated.Text>
    );
  };

  return (
    <View style={styles.container}>
      {displaySubtitles.map(renderSubtitle)}
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