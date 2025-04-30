import React, { useEffect, useState } from 'react';
import {
  Button,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import ImageCropPicker from 'react-native-image-crop-picker';

function ScanScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const [image, setImage] = useState<string>("");
  const [text, setText] = useState<string>("");

  const pickImage = async () => {
    console.log("Opening Image Library...");
    let result = await launchImageLibrary({ mediaType: 'photo' });

    if (result && result.assets?.length) {
      setImage(result.assets[0].uri || "");
    }
  };

  const requestCameraPermission = async () => {
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
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      console.log("Camera permission denied");
      return;
    }

    console.log("Opening Camera...");
    const result = await launchCamera({ mediaType: 'photo' });

    if (result?.assets?.length) {
      setImage(result.assets[0].uri || "");
    } else {
      console.log("Camera cancelled or failed");
    }
  };

  const recognizeText = async () => {
    if (image) {
      const result = await TextRecognition.recognize(image);
      if (result && result.text) {
        setText(result.text);
      }
    }
  };

  const cropImage = () => {
    if (image) {
      ImageCropPicker.openCropper({
        path: image,
        width: 300,
        height: 300,
        cropping: true,
        mediaType: 'photo',
      }).then((image) => {
        setImage(image.path);
      }).catch((error) => {
        console.error('Crop failed:', error);
      });
    }
  };

  useEffect(() => {
    if (image) {
      recognizeText();
    }
  }, [image]);

  return (
    <SafeAreaView>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={{ justifyContent: 'center', alignItems: "center", marginTop: 64 }}>
          <Text>Testing</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Button onPress={pickImage} title='Pick Image' />
            <Button onPress={openCamera} title='Open Camera' />
          </View>
          {image ? (
            <Button onPress={cropImage} title='Crop Image' />
          ) : null}
          <Text style={{ textAlign: 'justify', fontSize: 20, marginTop: 20 }}>{text}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default ScanScreen;
