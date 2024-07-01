import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import config from '../assets/config/colorsConfig';
import AddEventModal from '../components/AddEventModal';
import EditEventModal from '../components/EditEventModal';
import { UserContext } from '../context/UserContext';
import { Button } from 'react-native-paper';
import { db } from '../firebaseConfig';

const AssociationEvents = ({ route, navigation }) => {
  const { associationId } = route.params;
  const { user } = useContext(UserContext);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [nextEvent, setNextEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [pastEvents, setPastEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'events'), where('associationId', '==', associationId));
    const unsubscribe = onSnapshot(q, snapshot => {
      const eventsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (eventsList.length > 0) {
        const currentDate = new Date();
        const futureEvents = eventsList.filter(
          event => new Date(event.date) >= currentDate,
        );
        let pastEventsList = eventsList.filter(
          event => new Date(event.date) < currentDate,
        );
        pastEventsList = pastEventsList
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 3);

        if (futureEvents.length > 0) {
          const closestEvent = futureEvents.reduce((closest, event) => {
            const eventDate = new Date(event.date);
            const closestDate = new Date(closest.date);
            return eventDate < closestDate ? event : closest;
          }, futureEvents[0]);

          setNextEvent(closestEvent);
        } else {
          setNextEvent(null);
        }

        setPastEvents(pastEventsList);
      } else {
        setNextEvent(null);
        setPastEvents([]);
      }
    });

    return unsubscribe;
  }, [associationId]);

  const handleAddEvent = useCallback(async newEvent => {
    setIsLoading(true);
    setError(null);
    try {
      await db.collection('events').add({ ...newEvent, associationId });
      setAddModalVisible(false);
    } catch (err) {
      setError("Erreur lors de l'ajout de l'événement");
    } finally {
      setIsLoading(false);
    }
  }, [associationId]);

  const handleEditEvent = useCallback(async updatedEvent => {
    setIsLoading(true);
    setError(null);
    try {
      await db.collection('events').doc(updatedEvent.id).update(updatedEvent);
      setEditModalVisible(false);
      Alert.alert('Succès', 'L\'événement a été mis à jour avec succès');
    } catch (err) {
      setError('Erreur lAddEventModalors de la mise à jour de l\'événement');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renderEventItem = useCallback(({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('/eventPicture', { eventId: item.id })}>
      <ImageBackground
        source={{ uri: item.imageUrl }}
        style={styles.eventImage}
        imageStyle={styles.eventImageRounded}>
        <View style={styles.smallMask}>
          <Text style={styles.smallEventTitle}>{item.title}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  ), [navigation]);

  const memoizedNextEventComponent = useMemo(() => (
    nextEvent ? (
      <TouchableOpacity
        onPress={() => {
          if (user && user.role === 'admin') {
            setSelectedEvent(nextEvent);
            setEditModalVisible(true);
          }
        }}>
        <ImageBackground
          source={{ uri: nextEvent.imageUrl }}
          style={styles.nextEventImage}
          imageStyle={styles.nextEventImageRounded}>
          <View style={styles.mask}>
            <Text style={styles.eventTitle}>
              {new Date(nextEvent.date).toLocaleDateString()}
            </Text>
            <Text style={styles.eventTitle}>{nextEvent.title}</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    ) : (
      <Text style={styles.text}>No upcoming events</Text>
    )
  ), [nextEvent, user]);

  return (
    <ImageBackground source={config.backgroundImage} style={styles.container}>
      {user && user.role === 'admin' && (
        <>
          <Button
            onPress={() => setAddModalVisible(true)}
            mode="contained"
            style={styles.addButton}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              'Ajouter un événement'
            )}
          </Button>
          <AddEventModal
            visible={isAddModalVisible}
            onClose={() => setAddModalVisible(false)}
            onAddEvent={handleAddEvent}
            associationId={associationId}
          />
        </>
      )}
      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Ticketing')}>
          <Text>Billetterie</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('/calendar')}>
          <Text>Calendrier</Text>
        </TouchableOpacity>
      </View>
      {memoizedNextEventComponent}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <FlatList
        data={pastEvents}
        renderItem={renderEventItem}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.pastEventsContainer}
        initialNumToRender={6}
        windowSize={10}
        removeClippedSubviews={true}
      />
      {selectedEvent && (
        <EditEventModal
          visible={isEditModalVisible}
          onClose={() => setEditModalVisible(false)}
          event={selectedEvent}
          onEditEvent={handleEditEvent}
          associationId={associationId}
        />
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
  addButton: {
    marginBottom: 10,
  },
  eventImage: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  eventImageRounded: {
    borderRadius: 20,
  },
  nextEventImage: {
    width: 320,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  nextEventImageRounded: {
    borderRadius: 20,
  },
  eventTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  text: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
  mask: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallMask: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallEventTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pastEventsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    backgroundColor: 'gray',
    borderRadius: 20,
    width: '90%',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default AssociationEvents;
