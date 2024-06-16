import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { FileContext } from '../../context/FileContext';
import { useNavigation } from '@react-navigation/native';

export default function FileListScreen() {
  const [files, setFiles] = useState([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const { setWavFile, setSrtFile } = useContext(FileContext);
  const navigation = useNavigation();

  useEffect(() => {
    const getPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'External Storage Permission',
              message: 'This app needs access to your external storage to read files.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            setPermissionGranted(true);
          } else {
            console.log('External storage permission denied');
          }
        } catch (err) {
          console.warn(err);
        }
      } else {
        setPermissionGranted(true);
      }
    };

    getPermission();
  }, []);

  useEffect(() => {
    const loadFiles = async () => {
      if (permissionGranted) {
        try {
          const files = await FileSystem.readDirectoryAsync('file:///storage/5BC9-9B1F/Download/luna/');
          const filteredFiles = filterFiles(files);
          setFiles(filteredFiles);
        } catch (err) {
          console.error('Error reading directory:', err);
        }
      }
    };

    loadFiles();
  }, [permissionGranted]);

  const filterFiles = (fileList) => {
    const wavFiles = fileList.filter(file => file.endsWith('.wav')).map(file => file.replace('.wav', ''));
    const srtFiles = fileList.filter(file => file.endsWith('.srt')).map(file => file.replace('.srt', ''));
    const commonFiles = wavFiles.filter(file => srtFiles.includes(file));
    return commonFiles;
  };

  const handleFileSelect = async (fileName) => {
    try {
      const wavUri = `file:///storage/5BC9-9B1F/Download/luna/${fileName}.wav`;
      const srtUri = `file:///storage/5BC9-9B1F/Download/luna/${fileName}.srt`;

      const wavFile = await FileSystem.getInfoAsync(wavUri);
      const srtFile = await FileSystem.getInfoAsync(srtUri);

      if (wavFile.exists && srtFile.exists) {
        setWavFile(wavFile);
        setSrtFile(srtFile);
        console.log('WAV and SRT files selected:', wavFile, srtFile);
        navigation.navigate('index'); // Home画面に遷移
      } else {
        console.error('Both files not found:', wavUri, srtUri);
      }
    } catch (err) {
      console.error('Error selecting files:', err);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={files}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.fileItem} onPress={() => handleFileSelect(item)}>
            <Text style={styles.fileText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  fileItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  fileText: {
    fontSize: 16,
  },
});
