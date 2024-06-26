import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Button, ProgressBar } from 'react-native-paper';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/FontAwesome';
import { UserContext } from '../context/UserContext';
import config from '../assets/config/colorsConfig';
import { db, storage } from '../firebaseConfig';

const EventPictures = ({ route, navigation }) => {
  const { user } = useContext(UserContext);
  const { eventId } = route.params;
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'events', eventId), doc => {
      if (doc.exists()) {
        setPhotos(doc.data().photos || []);
      }
    });
    return unsubscribe;
  }, [eventId]);

  const pickImages = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 0,
      });

      if (!result.didCancel) {
        const uris = result.assets.map(asset => asset.uri);
        await uploadImages(uris);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while picking the images.');
    }
  }, [uploadImages]);

  const uploadImages = useCallback(async uris => {
    try {
      setUploading(true);
      const uploadedUrls = [];

      for (const uri of uris) {
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref(storage, `EventPictures/${eventId}/${Date.now()}`);
        const uploadTask = uploadBytesResumable(storageRef, blob);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            snapshot => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setProgress(progress);
            },
            error => {
              console.error('Error uploading image: ', error);
              Alert.alert(
                'Error',
                'An error occurred while uploading the photo.',
              );
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              uploadedUrls.push(downloadURL);
              resolve();
            },
          );
        });
      }

      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        photos: [...photos, ...uploadedUrls],
      });

      setUploading(false);
      setProgress(0);
      Alert.alert('Success', 'Photos added successfully');
    } catch (error) {
      setUploading(false);
      console.error('Error uploading images: ', error);
      Alert.alert('Error', 'An error occurred while uploading the photos.');
    }
  }, [eventId, photos]);

  const renderPhotoItem = useCallback(({ item, index }) => (
    <TouchableOpacity onPress={() => openModal(index)}>
      <Image source={{ uri: item }} style={styles.photo} />
    </TouchableOpacity>
  ), [openModal]);

  const openModal = useCallback(index => {
    setSelectedPhotoIndex(index);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedPhotoIndex(null);
    setModalVisible(false);
  }, []);

  const downloadPhoto = useCallback(async () => {
    try {
      const permission = await RNFS.requestPermissionWriteExternal();
      if (!permission) {
        Alert.alert(
          'Permission denied',
          'Permission to access media library is required to download the photo.',
        );
        return;
      }
      const fileUri = photos[selectedPhotoIndex];
      const fileName = fileUri.substring(fileUri.lastIndexOf('/') + 1);
      const localFilePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

      const { promise } = RNFS.downloadFile({
        fromUrl: fileUri,
        toFile: localFilePath,
      });

      await promise;
      Alert.alert(
        'Download complete',
        'The photo has been downloaded to your gallery.',
      );
    } catch (error) {
      console.error('Error downloading photo: ', error);
      Alert.alert('Error', 'An error occurred while downloading the photo.');
    }
  }, [photos, selectedPhotoIndex]);

  const navigatePhoto = useCallback(direction => {
    setSelectedPhotoIndex(prevIndex => 
      direction === 'next' ? (prevIndex + 1) % photos.length : (prevIndex - 1 + photos.length) % photos.length
    );
  }, [photos.length]);

  return (
    <ImageBackground source={config.backgroundImage} style={styles.container}>
      {user && user.role === 'admin' && (
        <View style={styles.addButtonContainer}>
          <Button
            onPress={pickImages}
            mode="contained"
            style={styles.addButton}
            disabled={uploading}>
            Ajouter des photos
          </Button>
          {uploading && (
            <ProgressBar
              progress={progress / 100}
              style={styles.uploadProgressBar}
            />
          )}
        </View>
      )}
      <FlatList
        data={photos}
        renderItem={renderPhotoItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        contentContainerStyle={styles.photosContainer}
        initialNumToRender={6}
        windowSize={10}
        removeClippedSubviews={true}
      />
      {selectedPhotoIndex !== null && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}>
          <View style={styles.modalView}>
            <Icon
              style={styles.arrowButtonLeft}
              name="arrow-left"
              size={30}
              color="white"
              onPress={() => navigatePhoto('prev')}
            />
            <Image
              source={{ uri: photos[selectedPhotoIndex] }}
              style={styles.modalPhoto}
            />
            <Icon
              style={styles.arrowButtonRight}
              name="arrow-right"
              size={30}
              color="white"
              onPress={() => navigatePhoto('next')}
            />
            <Button
              onPress={downloadPhoto}
              mode="contained"
              style={styles.downloadButton}>
              Télécharger la photo
            </Button>
            <Button
              onPress={closeModal}
              mode="contained-tonal"
              style={styles.closeButton}>
              Fermer
            </Button>
          </View>
        </Modal>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  addButtonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  addButton: {
    marginBottom: 10,
  },
  uploadProgressBar: {
    width: '80%',
    height: 10,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: 100,
    height: 75,
    margin: 5,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalPhoto: {
    width: 300,
    height: 425,
    marginBottom: 20,
  },
  arrowButtonLeft: {
    position: 'absolute',
    top: '50%',
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  arrowButtonRight: {
    position: 'absolute',
    top: '50%',
    right: 10,
    padding: 10,
    borderRadius: 5,
  },
  downloadButton: {
    marginBottom: 10,
  },
  closeButton: {
    marginBottom: 20,
  },
});

export default EventPictures;
