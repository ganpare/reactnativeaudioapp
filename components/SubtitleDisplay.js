// components/SubtitleDisplay.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';
import parser from 'subtitles-parser';

export default function SubtitleDisplay({ fileUri, playbackPosition }) {
  const [subtitles, setSubtitles] = useState([]);

  useEffect(() => {
    const loadSubtitles = async () => {
      try {
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        const parsedSubtitles = parser.fromSrt(fileContent);
        // console.log('Parsed Subtitles:', parsedSubtitles); // デバッグログをコメントアウト
        setSubtitles(parsedSubtitles);
      } catch (error) {
        console.error('Error loading subtitles:', error);
      }
    };

    if (fileUri) {
      loadSubtitles();
    }
  }, [fileUri]);

  const currentSubtitle = subtitles.find(
    subtitle =>
      playbackPosition >= convertTimeToSeconds(subtitle.startTime) && playbackPosition < convertTimeToSeconds(subtitle.endTime)
  );

  // console.log('Current Subtitle:', currentSubtitle); // デバッグログをコメントアウト

  return (
    <View style={styles.container}>
      {currentSubtitle ? (
        <Text style={styles.subtitleText}>{currentSubtitle.text}</Text>
      ) : (
        <Text style={styles.subtitleText}>字幕がありません</Text> // デバッグ用のテキスト
      )}
    </View>
  );
}

const convertTimeToSeconds = (time) => {
  const [hours, minutes, seconds] = time.split(':');
  const [secs, millis] = seconds.split(',');
  const totalSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(secs) + parseInt(millis) / 1000;
  return totalSeconds;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitleText: {
    fontSize: 24, // 字幕テキストを大きくする
    color: 'white',
    textAlign: 'center', // テキストを中央揃え
    paddingHorizontal: 16, // テキストの左右に余白を追加
  },
});