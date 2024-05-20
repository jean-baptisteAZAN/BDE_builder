import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Button,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import config from "../../assets/config/colorsConfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { API_URL } from "@env";

import { styled } from "nativewind";

const StyledView = styled(View);

const ProfileScreen = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          const response = await fetch(`${API_URL}/api/userinfo`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          const data = await response.json();
          setUserInfo(data);
          if (data.profilePictureUrl) {
            setImage(data.profilePictureUrl);
          }
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [0.5, 0.5],
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
    const storageRef = ref(storage, `profilePictures/${userInfo.uid}`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    setImage(downloadURL);
    const db = getFirestore();
    await updateDoc(doc(db, "users", userInfo.uid), {
      profilePictureUrl: downloadURL,
    });

    setUserInfo((prev) => ({ ...prev, profilePictureUrl: downloadURL }));
  };

  return (
    <ImageBackground source={config.backgroundImage} style={styles.container}>
      {userInfo ? (
        <>
          <StyledView className="flex flex-row items-center justify-between p-10 w-full">
            {image && (
              <Image source={{ uri: image }} style={styles.profileImage} />
            )}
            {!image && (
              <Button title="Ajoute une photo de profile" onPress={pickImage} />
            )}
            <StyledView className="flex flex-col justify-center">
              <Text style={styles.text}>{userInfo.firstName}</Text>
              <Text style={styles.text}>{userInfo.lastName}</Text>
            </StyledView>
          </StyledView>
          <StyledView className="flex flex-col items-center">
            <Text style={styles.text}>Email: {userInfo.email}</Text>
            <Text style={styles.text}>Promotion: {userInfo.promotion}</Text>
            <Text style={styles.text}>Association: {userInfo.association}</Text>
          </StyledView>
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
  },
  text: {
    fontSize: 25,
    color: "white",
    marginBottom: 10,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 50,
    marginBottom: 20,
  },
});

export default ProfileScreen;
