import React, { useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

export default function FileSelector({ onFileSelected }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/wav', 'audio/mpeg', 'application/x-subrip'], // WAV, MP3, SRTファイルのみ許可
      });

      if (!result.canceled) {
        const file = result.assets[0];
        setSelectedFile(file);
        onFileSelected(file);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="ファイルを選択" onPress={handleFilePick} />
      {selectedFile && (
        <Text style={styles.selectedFile}>選択されたファイル: {selectedFile.name}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedFile: {
    marginTop: 10,
  },
});