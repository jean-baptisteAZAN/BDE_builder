import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Modal, Image, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import config from '../assets/config/colorsConfig';
import { Button } from 'react-native-paper';

const CalendarScreen = () => {
  const [events, setEvents] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore();
    const unsubscribe = onSnapshot(collection(db, 'parties'), (snapshot) => {
      const eventsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const marked = {};
      eventsList.forEach((event) => {
        const date = event.date.split('T')[0];
        marked[date] = {
          marked: true,
          dotColor: "red",
          activeOpacity: 0,
        };
      });

      setEvents(eventsList);
      setMarkedDates(marked);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleDayPress = (day) => {
    const selectedEvents = events.filter(
      (event) => event.date.split('T')[0] === day.dateString
    );
    if (selectedEvents.length > 0) {
      setSelectedEvent(selectedEvents[0]);
    }
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={config.primaryColor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={markedDates}
        onDayPress={handleDayPress}
        theme={{
          calendarBackground: config.backgroundColor,
          textSectionTitleColor: config.textColor,
          selectedDayBackgroundColor: config.primaryColor,
          selectedDayTextColor: '#ffffff',
          todayTextColor: config.primaryColor,
          dayTextColor: config.textColor,
          textDisabledColor: config.disabledColor,
          dotColor: config.primaryColor,
          selectedDotColor: '#ffffff',
          arrowColor: config.primaryColor,
          monthTextColor: config.textColor,
        }}
      />
      {selectedEvent && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={true}
          onRequestClose={closeModal}
        >
          <View style={styles.modalView}>
            <Text style={styles.eventTitle}>{selectedEvent.title}</Text>
            <Image source={{ uri: selectedEvent.imageUrl }} style={styles.eventImage} />
            <Text style={styles.eventDate}>{new Date(selectedEvent.date).toLocaleDateString()}</Text>
            <Button mode="contained"  onPress={closeModal}>
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
    backgroundColor: config.backgroundColor,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  eventImage: {
    width: 300,
    height: 200,
    marginBottom: 10,
  },
  eventDate: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: config.primaryColor,
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default CalendarScreen;
