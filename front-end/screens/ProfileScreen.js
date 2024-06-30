import React, {useEffect, useState, useContext} from 'react';
import {Text, StyleSheet, Image, ImageBackground, View} from 'react-native';
import {Button} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary} from 'react-native-image-picker';
import config from '../assets/config/colorsConfig';
import { ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import { doc, updateDoc} from 'firebase/firestore';
import {API_URL} from '@env';
import {UserContext} from '../context/UserContext';
import { db } from '../firebaseConfig';


const ProfileScreen = ({navigation}) => {
  const [userInfo, setUserInfo] = useState(null);
  const [image, setImage] = useState(null);
  const {logout} = useContext(UserContext);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const response = await fetch(`${API_URL}/api/userinfo`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          setUserInfo(data);
          if (data.profilePictureUrl) {
            setImage(data.profilePictureUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
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

    launchImageLibrary(options, async response => {
     if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.assets && response.assets.length > 0) {
        const {uri} = response.assets[0];
        await uploadImage(uri);
      }
    });
  };

  const uploadImage = async uri => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `profilePictures/${userInfo.uid}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      setImage(downloadURL);
      await updateDoc(doc(db, 'users', userInfo.uid), {
        profilePictureUrl: downloadURL,
      });

      setUserInfo(prev => ({...prev, profilePictureUrl: downloadURL}));
    }
    catch (error) {
    console.error('Error uploading image:', error);
    }
  };


  const handleLogout = async () => {
    await logout();
    navigation.navigate('/login');
  };

  return (
    <ImageBackground source={config.backgroundImage} style={styles.container}>
      <View style={styles.containerWrapper}>
        {userInfo ? (
          <>
            <View style={styles.profileContainer}>
              {image ? (
                <Image source={{uri: image}} style={styles.profileImage} />
              ) : (
                <Button onPress={pickImage} mode="contained">
                  Ajoute une photo de profile
                </Button>
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
              <Button
                mode="contained-tonal"
                onPress={handleLogout}
                color="#FF0000">
                Déconnexion
              </Button>
            </View>
          </>
        ) : (
          <Text style={styles.text}>No user is logged in</Text>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 20,
  },
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 50,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5,
    width: '100%',
  },
  infoContainer: {
    paddingLeft: 10,
    justifyContent: 'center',
  },
  detailsContainer: {
    alignItems: 'center',
  },
  text: {
    fontSize: 25,
    color: 'black',
    marginBottom: 10,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 100,
    marginBottom: 20,
  },
});

export default ProfileScreen;
