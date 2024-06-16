import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

export default function FileListScreen() {
  const [files, setFiles] = useState([]);
  const [permissionGranted, setPermissionGranted] = useState(false);

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
          setFiles(files);
        } catch (err) {
          console.error('Error reading directory:', err);
        }
      }
    };

    loadFiles();
  }, [permissionGranted]);

  return (
    <View style={styles.container}>
      <FlatList
        data={files}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.fileItem}>
            <Text style={styles.fileText}>{item}</Text>
          </View>
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
