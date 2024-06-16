// components/FileSelector.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function FileSelector({ onFileSelected, iconName, fileType }) {
  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: fileType, // 指定されたファイルタイプを使用
      });

      if (!result.canceled) {
        const file = result.assets[0];
        onFileSelected(file);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleFilePick}>
      <Icon name={iconName} size={30} color="white" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 10,
  },
});