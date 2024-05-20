import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Button, ProgressBar } from "react-native-paper";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, updateDoc, onSnapshot } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { UserContext } from "../context/UserContext";

const PartyPhotos = ({ route, navigation }) => {
  const { user } = useContext(UserContext);
  const { partyId } = route.params;
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const db = getFirestore();
    const unsubscribe = onSnapshot(doc(db, "parties", partyId), (doc) => {
      if (doc.exists()) {
        setPhotos(doc.data().photos || []);
      }
    });
    return unsubscribe;
  }, [partyId]);

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const uris = result.assets.map(asset => asset.uri);
        await uploadImages(uris);
      }
    } catch (error) {
      console.error("Error picking images: ", error);
      Alert.alert("Error", "An error occurred while picking the images.");
    }
  };

  const uploadImages = async (uris) => {
    try {
      setUploading(true);
      const db = getFirestore();
      const storage = getStorage();
      const uploadedUrls = [];

      for (const uri of uris) {
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref(storage, `partyPhotos/${partyId}/${Date.now()}`);
        const uploadTask = uploadBytesResumable(storageRef, blob);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setProgress(progress);
            },
            (error) => {
              console.error("Error uploading image: ", error);
              Alert.alert("Error", "An error occurred while uploading the photo.");
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              uploadedUrls.push(downloadURL);
              resolve();
            }
          );
        });
      }

      const partyRef = doc(db, "parties", partyId);
      await updateDoc(partyRef, {
        photos: [...photos, ...uploadedUrls],
      });

      setUploading(false);
      setProgress(0);
      Alert.alert("Success", "Photos added successfully");
    } catch (error) {
      setUploading(false);
      console.error("Error uploading images: ", error);
      Alert.alert("Error", "An error occurred while uploading the photos.");
    }
  };

  const renderPhotoItem = ({ item }) => (
    <TouchableOpacity onPress={() => openModal(item)}>
      <Image source={{ uri: item }} style={styles.photo} />
    </TouchableOpacity>
  );

  const openModal = (photo) => {
    setSelectedPhoto(photo);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
    setModalVisible(false);
  };

  const downloadPhoto = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission denied", "Permission to access media library is required to download the photo.");
        return;
      }
      const downloadResumable = FileSystem.createDownloadResumable(
        selectedPhoto,
        FileSystem.documentDirectory + 'downloaded_photo.jpg'
      );

      const { uri } = await downloadResumable.downloadAsync();
      await MediaLibrary.createAssetAsync(uri);
      Alert.alert("Download complete", "The photo has been downloaded to your gallery.");
    } catch (error) {
      console.error("Error downloading photo: ", error);
      Alert.alert("Error", "An error occurred while downloading the photo.");
    }
  };

  return (
    <View style={styles.container}>
      {user && user.role === "admin" && (
        <Button onPress={pickImages} mode="contained" style={styles.addButton} disabled={uploading}>
          {uploading ? "Uploading..." : "Add Photos"}
        </Button>
      )}
      {uploading && (
        <View style={styles.progressBarContainer}>
          <Text>Uploading: {Math.round(progress)}%</Text>
          <ProgressBar progress={progress / 100} style={styles.progressBar} />
        </View>
      )}
      <FlatList
        data={photos}
        renderItem={renderPhotoItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        contentContainerStyle={styles.photosContainer}
      />
      {selectedPhoto && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalView}>
            <Image source={{ uri: selectedPhoto }} style={styles.modalPhoto} />
            <Button onPress={downloadPhoto} mode="contained" style={styles.downloadButton}>
              Download Photo
            </Button>
            <Button onPress={closeModal} mode="outlined" style={styles.closeButton}>
              Close
            </Button>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  addButton: {
    marginBottom: 10,
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  progressBar: {
    width: '80%',
    height: 10,
  },
  photosContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  photo: {
    width: 100,
    height: 100,
    margin: 5,
  },
  modalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  modalPhoto: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  downloadButton: {
    marginBottom: 10,
  },
  closeButton: {
    marginBottom: 20,
  },
});

export default PartyPhotos;
