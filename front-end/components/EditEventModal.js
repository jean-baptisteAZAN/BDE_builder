import React, { useState, useContext } from 'react';
import {
  Modal,
  View,
  TextInput,
  StyleSheet,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { Button, Text } from 'react-native-paper';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';
import { UserContext } from '../context/UserContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db, storage } from '../firebaseConfig';

const EditEventModal = ({ visible, onClose, event }) => {
  const { user } = useContext(UserContext);
  const [title, setTitle] = useState(event.title);
  const [imageUri, setImageUri] = useState(event.imageUrl);
  const [date, setDate] = useState(new Date(event.date));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const pickImage = async () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 300,
      quality: 1,
    };

    launchImageLibrary(options, response => {
      if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  const uploadImage = async uri => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `eventHeader/${Date.now()}`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleEditEvent = async () => {
    if (!title) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    try {
      const imageUrl = imageUri.startsWith('http')
        ? imageUri
        : await uploadImage(imageUri);

      await updateDoc(doc(db, 'events', event.id), {
        title,
        imageUrl,
        date: date.toISOString(),
      });
      Alert.alert('Success', 'Event updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating event: ', error);
      Alert.alert('Error', 'An error occurred while updating the event.');
    }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime || date;
    setShowTimePicker(Platform.OS === 'ios');
    setDate(currentTime);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalView}>
        <TextInput
          placeholder="Event Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
        <Button
          mode={'contained-tonal'}
          onPress={pickImage}
          style={{ marginVertical: 20 }}>
          Pick a new image
        </Button>
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        )}

        <Button
          onPress={() => setShowDatePicker(true)}
          mode={'contained-tonal'}
          style={styles.dateButton}>
          Pick Date
        </Button>
        {showDatePicker && (
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onChangeDate}
              textColor="white"
              accentColor="#6200ea"
            />
          </View>
        )}

        <Button
          onPress={() => setShowTimePicker(true)}
          mode={'contained-tonal'}
          style={styles.dateButton}>
          Pick Time
        </Button>
        {showTimePicker && (
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={date}
              mode="time"
              display="default"
              onChange={onChangeTime}
              textColor="white"
              accentColor="#6200ea"
            />
          </View>
        )}

        <Text style={styles.selectedDateText}>
          Selected Date: {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </Text>

        <Button
          onPress={handleEditEvent}
          mode={'contained'}
          style={{ marginTop: 20 }}>
          Update Event
        </Button>
        <Button
          mode={'contained-tonal'}
          style={{ marginTop: 20 }}
          onPress={onClose}>
          Close panel
        </Button>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
  },
  input: {
    width: '80%',
    padding: 10,
    marginVertical: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  imagePreview: {
    width: 200,
    height: 200,
    marginVertical: 10,
    borderRadius: 10,
  },
  dateButton: {
    backgroundColor: '#6200ea',
    color: 'white',
    marginVertical: 10,
    width: '80%',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginVertical: 10,
    padding: 10,
  },
  selectedDateText: {
    marginTop: 10,
    fontSize: 16,
    color: 'white',
  },
});

export default EditEventModal;
