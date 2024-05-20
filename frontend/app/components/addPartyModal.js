import React, { useState, useContext } from "react";
import {
  Modal,
  View,
  TextInput,
  StyleSheet,
  Image,
  Platform,
  Alert,
} from "react-native";
import { Button, Text } from "react-native-paper";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, addDoc, collection } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { UserContext } from "../context/UserContext";
import DateTimePicker from "@react-native-community/datetimepicker";

const AddPartyModal = ({ visible, onClose }) => {
  const { user } = useContext(UserContext);
  const [title, setTitle] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storage = getStorage();
    const storageRef = ref(storage, `partyHeader/${Date.now()}`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleAddParty = async () => {
    if (!title) {
      Alert.alert("Error", "Please enter a title");
      return;
    }
    if (!imageUri) {
      Alert.alert("Error", "Please pick an image");
      return;
    }

    // const currentDate = new Date();
    // if (date < currentDate) {
    //   Alert.alert('Error', 'The date and time selected have already passed. Please choose a future date and time.');
    //   return;
    // }

    try {
      const imageUrl = await uploadImage(imageUri);
      const db = getFirestore();
      await addDoc(collection(db, "parties"), {
        title,
        imageUrl,
        date: date.toISOString(),
        createdBy: user.uid,
      });
      Alert.alert("Success", "Party added successfully");
      resetValues();
      onClose();
    } catch (error) {
      console.error("Error adding party: ", error);
      Alert.alert("Error", "An error occurred while adding the party.");
    }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);
  };

  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime || date;
    setShowTimePicker(Platform.OS === "ios");
    setDate(currentTime);
  };

  const resetValues = () => {
    setTitle("");
    setImageUri(null);
    setDate(new Date());
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
          mode={"contained-tonal"}
          onPress={pickImage}
          style={{ marginVertical: 20 }}
        >
          Pick an image
        </Button>
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        )}

        <Button
          onPress={() => setShowDatePicker(true)}
          mode={"contained-tonal"}
          style={styles.dateButton}
        >
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
          mode={"contained-tonal"}
          style={styles.dateButton}
        >
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
          onPress={handleAddParty}
          mode={"contained"}
          style={{ marginTop: 20 }}
        >
          Add Party
        </Button>
        <Button
          mode={"contained-tonal"}
          style={{ marginTop: 20 }}
          onPress={() => {
            resetValues();
            onClose();
          }}
        >
          Close panel
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
  input: {
    width: "80%",
    padding: 10,
    marginVertical: 10,
    backgroundColor: "white",
    borderRadius: 5,
  },
  imagePreview: {
    width: 200,
    height: 200,
    marginVertical: 10,
    borderRadius: 10,
  },
  dateButton: {
    backgroundColor: "#6200ea",
    color: "white",
    marginVertical: 10,
    width: "80%",
  },
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    marginVertical: 10,
    padding: 10,
  },
  selectedDateText: {
    marginTop: 10,
    fontSize: 16,
    color: "white",
  },
});

export default AddPartyModal;
