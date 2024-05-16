import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import colorsConfig from '../../assets/config/colorsConfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { auth } from "../../firebaseConfig";
import { API_URL } from '@env';

const ProfileScreen = () => {
  console.log(API_URL, "API_URL")
  const { user } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const response = await fetch(`${API_URL}/api/userinfo`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          setUserInfo(data);
          if (data.profilePicture) {
            setImage(data.profilePicture);
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      await uploadImage(uri);
    }
  };

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storage = getStorage();
    const storageRef = ref(storage, `profilePictures/${user.uid}`);
    await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(storageRef);
    setImage(downloadURL);

    const db = getFirestore();
    await updateDoc(doc(db, "users", user.uid), {
      profilePicture: downloadURL,
    });

    setUserInfo((prev) => ({ ...prev, profilePicture: downloadURL }));
  };

  return (
    <ImageBackground
      source={colorsConfig.backgroundImage}
      style={styles.container}
    >
      {userInfo ? (
        <>
          {image && <Image source={{ uri: image }} style={styles.profileImage} />}
          <Button title="Change Profile Picture" onPress={pickImage} />
          <Text style={styles.text}>Prénom: {userInfo.firstName}</Text>
          <Text style={styles.text}>Nom: {userInfo.lastName}</Text>
          <Text style={styles.text}>Email: {userInfo.email}</Text>
          <Text style={styles.text}>Promotion: {userInfo.promotion}</Text>
          <Text style={styles.text}>Association: {userInfo.association}</Text>
          <Text style={styles.text}>UID: {userInfo.uid}</Text>
        </>
      ) : (
        <Text style={styles.text}>No user is logged in</Text>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
});

export default ProfileScreen;
