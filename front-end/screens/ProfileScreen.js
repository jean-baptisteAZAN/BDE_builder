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
import { launchImageLibrary } from "react-native-image-picker";
import config from "../assets/config/colorsConfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { API_URL } from "@env";

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
    const options = {
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 300,
      quality: 1,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.assets && response.assets.length > 0) {
        const { uri } = response.assets[0];
        await uploadImage(uri);
      }
    });
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
          <View style={styles.profileContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.profileImage} />
            ) : (
              <Button title="Ajoute une photo de profile" onPress={pickImage} />
            )}
            <View style={styles.infoContainer}>
              <Text style={styles.text}>{userInfo.firstName}</Text>
              <Text style={styles.text}>{userInfo.lastName}</Text>
            </View>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.text}>Email: {userInfo.email}</Text>
            <Text style={styles.text}>Promotion: {userInfo.promotion}</Text>
            <Text style={styles.text}>Association: {userInfo.association}</Text>
          </View>
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
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    width: "100%",
  },
  infoContainer: {
    paddingLeft: 50,
    justifyContent: "center",
  },
  detailsContainer: {
    alignItems: "center",
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
