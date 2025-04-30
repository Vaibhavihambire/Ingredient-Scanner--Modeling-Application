import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  TextInput,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import ImageCropPicker from 'react-native-image-crop-picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/StackNavigator';
import LinearGradient from 'react-native-linear-gradient';

const ScanScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [image, setImage] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to your camera to scan ingredients',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (result?.assets?.[0]?.uri) {
      setImage(result.assets[0].uri);
    }
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await launchCamera({ mediaType: 'photo' });
    if (result?.assets?.[0]?.uri) {
      setImage(result.assets[0].uri);
    }
  };

  const recognizeText = async () => {
    if (image) {
      try {
        const result = await TextRecognition.recognize(image);
        setText(result?.text || '');
      } catch (error) {
        console.error('Text recognition failed:', error);
      }
    }
  };

  const cropImage = () => {
    if (image) {
      ImageCropPicker.openCropper({
        path: image,
        width: 1024,
        height: 1024,
        cropping: true,
        freeStyleCropEnabled: true,
        enableRotationGesture: true,
        showCropGuidelines: true,
        mediaType: 'photo',
      })
        .then((cropped) => setImage(cropped.path))
        .catch((error) => console.error('Crop failed:', error));
    }
  };

  const analyzeIngredients = async () => {
    if (!text) {
      Alert.alert('Please scan an image first!');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://172.20.10.4:5000/predict', {
        ingredients: text,
      });

      const { explanations, risk_level } = response.data;

      navigation.navigate('Result', { result: { risk_level, explanations } });
    } catch (error) {
      console.error('Error analyzing ingredients:', error);
      Alert.alert('Error', 'Failed to analyze ingredients.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (image) recognizeText();
  }, [image]);

  return (
    <LinearGradient colors={['#4B0082', '#6A0DAD']} style={styles.container}>
      <StatusBar barStyle={'light-content'} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Scan Ingredients</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>Pick Image</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={openCamera}>
            <Text style={styles.buttonText}>Open Camera</Text>
          </TouchableOpacity>
        </View>

        {image && (
          <TouchableOpacity style={styles.button} onPress={cropImage}>
            <Text style={styles.buttonText}>Crop Image</Text>
          </TouchableOpacity>
        )}

        {text ? (
          <View style={styles.resultBox}>
            <TextInput
              multiline
              style={styles.textInput}
              value={text}
              onChangeText={setText}
            />
            <TouchableOpacity style={styles.analyzeButton} onPress={analyzeIngredients}>
              <Text style={styles.analyzeButtonText}>Analyze Ingredients</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {isLoading && <ActivityIndicator color="#FFD700" size="large" style={{ marginTop: 20 }} />}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 80,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FFD700',
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#4B0082',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultBox: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 10,
    width: '100%',
  },
  textInput: {
    color: '#fff',
    fontSize: 16,
    borderColor: '#FFD700',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  analyzeButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: '#4B0082',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ScanScreen;
