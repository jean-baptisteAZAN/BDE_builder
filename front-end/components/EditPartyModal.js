import React, {useState, useContext, useEffect} from 'react';
import {
  Modal,
  View,
  TextInput,
  StyleSheet,
  Image,
  Platform,
  Alert,
} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {getStorage, ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import {launchImageLibrary} from 'react-native-image-picker';
import {UserContext} from '../context/UserContext';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditPartyModal = ({visible, onClose, party, onEditParty}) => {
  const {user} = useContext(UserContext);
  const [title, setTitle] = useState(party.title);
  const [imageUri, setImageUri] = useState(party.imageUrl);
  const [date, setDate] = useState(new Date(party.date));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    setTitle(party.title);
    setImageUri(party.imageUrl);
    setDate(new Date(party.date));
  }, [party]);

  const pickImage = async () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 300,
      quality: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  const uploadImage = async uri => {
    if (uri.startsWith('http')) {
      return uri; // L'image est déjà en ligne
    }
    const response = await fetch(uri);
    const blob = await response.blob();
    const storage = getStorage();
    const storageRef = ref(storage, `partyHeader/${Date.now()}`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleEditParty = async () => {
    if (!title) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!imageUri) {
      Alert.alert('Error', 'Please pick an image');
      return;
    }

    try {
      const imageUrl = await uploadImage(imageUri);
      const updatedParty = {
        ...party,
        title,
        imageUrl,
        date: date.toISOString(),
      };
      await onEditParty(updatedParty);
    } catch (error) {
      console.error('Error editing party: ', error);
      Alert.alert('Error', 'An error occurred while editing the party.');
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

  const resetValues = () => {
    setTitle(party.title);
    setImageUri(party.imageUrl);
    setDate(new Date(party.date));
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalView}>
        <TextInput
          placeholder="Party Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
        <Button
          mode={'contained-tonal'}
          onPress={pickImage}
          style={{marginVertical: 20}}>
          Pick an image
        </Button>
        {imageUri && (
          <Image source={{uri: imageUri}} style={styles.imagePreview} />
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
          onPress={handleEditParty}
          mode={'contained'}
          style={{marginTop: 20}}>
          Save Changes
        </Button>
        <Button
          mode={'contained-tonal'}
          style={{marginTop: 20}}
          onPress={() => {
            resetValues();
            onClose();
          }}>
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

export default EditPartyModal;
