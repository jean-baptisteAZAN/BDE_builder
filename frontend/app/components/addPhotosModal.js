import React, { useState } from "react";
import { Modal, View, Text, Image, StyleSheet, FlatList } from "react-native";
import { Button } from "react-native-paper";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, updateDoc, doc, arrayUnion } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";

const AddPhotosModal = ({ visible, onClose, partyId }) => {
  const [images, setImages] = useState([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      const imageUrl = await uploadImage(uri);
      setImages((prevImages) => [...prevImages, imageUrl]);
    }
  };

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storage = getStorage();
    const storageRef = ref(storage, `partyPhotos/${partyId}/${Date.now()}`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleSavePhotos = async () => {
    if (images.length > 0) {
      const db = getFirestore();
      const partyDoc = doc(db, "parties", partyId);
      await updateDoc(partyDoc, {
        photos: arrayUnion(...images),
      });
      Alert.alert("Success", "Photos added successfully");
      onClose();
    } else {
      Alert.alert("Error", "No photos selected");
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalView}>
        <Text style={styles.title}>Add Photos</Text>
        <Button onPress={pickImage} mode="contained" style={styles.button}>
          Pick an Image
        </Button>
        <FlatList
          data={images}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.imagePreview} />
          )}
          keyExtractor={(item, index) => index.toString()}
          horizontal
        />
        <Button
          onPress={handleSavePhotos}
          mode="contained"
          style={styles.button}
        >
          Save Photos
        </Button>
        <Button onPress={onClose} mode="contained-tonal" style={styles.button}>
          Close
        </Button>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  button: {
    marginVertical: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginHorizontal: 5,
    borderRadius: 10,
  },
});

export default AddPhotosModal;
