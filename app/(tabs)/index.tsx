import React, { useState, useRef, useEffect, useContext } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions } from 'react-native';
import SubtitleDisplay from '@/components/SubtitleDisplay';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as FileSystem from 'expo-file-system';
import parser from 'subtitles-parser';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Audio } from 'expo-av';
import { FileContext } from '../../context/FileContext';
import Slider from '@react-native-community/slider';

export default function HomeScreen() {
  const { wavFile, srtFile, setWavFile, setSrtFile, fileList } = useContext(FileContext);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef(null);
  const [subtitles, setSubtitles] = useState([]);
  const [orientation, setOrientation] = useState('PORTRAIT_UP');

  useEffect(() => {
    changeOrientation('PORTRAIT_UP');
  }, []);

  useEffect(() => {
    if (srtFile) {
      loadSubtitles(srtFile.uri);
    }
  }, [srtFile]);

  useEffect(() => {
    const loadAudio = async () => {
      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }
        const { sound } = await Audio.Sound.createAsync({ uri: wavFile.uri });
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
        await sound.playAsync();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error loading sound:", error);
      }
    };

    if (wavFile) {
      loadAudio();
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [wavFile]);

  const onPlaybackStatusUpdate = status => {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis);
      setPlaybackDuration(status.durationMillis);

      if (status.didJustFinish && !status.isLooping) {
        handleNext();
      }
    }
  };

  const changeOrientation = async (newOrientation) => {
    try {
      switch (newOrientation) {
        case 'PORTRAIT_UP':
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
          break;
        case 'LANDSCAPE_LEFT':
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
          break;
        default:
          break;
      }
      setOrientation(newOrientation);
    } catch (error) {
      console.error("向き変更エラー:", error);
    }
  };

  const toggleOrientation = () => {
    const newOrientation = orientation === 'PORTRAIT_UP' ? 'LANDSCAPE_LEFT' : 'PORTRAIT_UP';
    changeOrientation(newOrientation);
  };

  const loadSubtitles = async (uri) => {
    try {
      const fileContent = await FileSystem.readAsStringAsync(decodeURIComponent(uri));
      const parsedSubtitles = parser.fromSrt(fileContent);
      setSubtitles(parsedSubtitles);
    } catch (error) {
      console.error("Error loading subtitles:", error);
    }
  };

  const handlePlayPause = async () => {
    if (soundRef.current) {
      const status = await soundRef.current.getStatusAsync();
      if (status.isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const handleRewind = () => {
    if (subtitles.length > 0) {
      const currentSubtitleIndex = subtitles.findIndex(
        subtitle =>
          playbackPosition >= convertTimeToSeconds(subtitle.startTime) * 1000 &&
          playbackPosition < convertTimeToSeconds(subtitle.endTime) * 1000
      );
      if (currentSubtitleIndex > 0) {
        const previousSubtitle = subtitles[currentSubtitleIndex - 1];
        const newPosition = convertTimeToSeconds(previousSubtitle.startTime) * 1000;
        soundRef.current.setPositionAsync(newPosition);
        setPlaybackPosition(newPosition);
      }
    }
  };

  const handleFastForward = () => {
    if (subtitles.length > 0) {
      const currentSubtitleIndex = subtitles.findIndex(
        subtitle =>
          playbackPosition >= convertTimeToSeconds(subtitle.startTime) * 1000 &&
          playbackPosition < convertTimeToSeconds(subtitle.endTime) * 1000
      );
      if (currentSubtitleIndex < subtitles.length - 1) {
        const nextSubtitle = subtitles[currentSubtitleIndex + 1];
        const newPosition = convertTimeToSeconds(nextSubtitle.startTime) * 1000;
        soundRef.current.setPositionAsync(newPosition);
        setPlaybackPosition(newPosition);
      }
    }
  };

  const convertTimeToSeconds = (time) => {
    const [hours, minutes, seconds] = time.split(':');
    const [secs, millis] = seconds.split(',');
    const totalSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(secs) + parseInt(millis) / 1000;
    return totalSeconds;
  };

  const handleNext = () => {
    if (!wavFile) return;
    const currentFileName = decodeURIComponent(wavFile.uri.split('/').pop().replace('.wav', ''));
    const currentIndex = fileList.findIndex(file => file === currentFileName);

    if (currentIndex !== -1 && currentIndex < fileList.length - 1) {
      const nextFile = fileList[currentIndex + 1];
      setWavFile({ uri: `file:///storage/5BC9-9B1F/Download/luna/${encodeURIComponent(nextFile)}.wav`, name: `${nextFile}.wav` });
      setSrtFile({ uri: `file:///storage/5BC9-9B1F/Download/luna/${encodeURIComponent(nextFile)}.srt`, name: `${nextFile}.srt` });
    }
  };

  const handlePrevious = () => {
    if (!wavFile) return;
    const currentFileName = decodeURIComponent(wavFile.uri.split('/').pop().replace('.wav', ''));
    const currentIndex = fileList.findIndex(file => file === currentFileName);

    if (currentIndex > 0) {
      const previousFile = fileList[currentIndex - 1];
      setWavFile({ uri: `file:///storage/5BC9-9B1F/Download/luna/${encodeURIComponent(previousFile)}.wav`, name: `${previousFile}.wav` });
      setSrtFile({ uri: `file:///storage/5BC9-9B1F/Download/luna/${encodeURIComponent(previousFile)}.srt`, name: `${previousFile}.srt` });
    }
  };

  const handleSliderValueChange = async (value) => {
    if (soundRef.current) {
      const newPosition = value * playbackDuration;
      await soundRef.current.setPositionAsync(newPosition);
      setPlaybackPosition(newPosition);
    }
  };

  return (
    <View style={styles.container}>
      {wavFile?.name && (
        <View style={styles.fileNameContainer}>
          <Text style={styles.fileNameText}>{wavFile.name.replace('.wav', '')}</Text>
        </View>
      )}
      <View style={styles.fileSelectorContainer}>
        <TouchableOpacity style={styles.button} onPress={handleRewind}>
          <Icon name="fast-rewind" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handlePlayPause}>
          <Icon name={isPlaying ? "pause" : "play-arrow"} size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleFastForward}>
          <Icon name="fast-forward" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handlePrevious}>
          <Icon name="skip-previous" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Icon name="skip-next" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={toggleOrientation}>
          <Icon name={orientation === 'PORTRAIT_UP' ? "screen-lock-portrait" : "screen-lock-landscape"} size={30} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.sliderContainer}>
        <Text style={styles.timeText}>{(playbackPosition / 1000).toFixed(0)} s</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={playbackDuration ? playbackPosition / playbackDuration : 0}
          onValueChange={handleSliderValueChange}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
        />
        <Text style={styles.timeText}>{(playbackDuration / 1000).toFixed(0)} s</Text>
      </View>
      <View style={styles.contentContainer}>
        {srtFile && playbackPosition !== null && (
          <SubtitleDisplay fileUri={srtFile.uri} playbackPosition={playbackPosition / 1000} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  fileNameContainer: {
    padding: 10,
    alignItems: 'center',
  },
  fileNameText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  fileSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1D3D47',
  },
  button: {
    padding: 10,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: Dimensions.get('window').width - 32,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  timeText: {
    color: 'white',
    width: 50,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
