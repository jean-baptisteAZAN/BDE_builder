import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList } from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const PartyPhotos = ({ route }) => {
  const { partyId } = route.params;
  const [photos, setPhotos] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const fetchPhotos = async () => {
      const db = getFirestore();
      const partyDoc = await getDoc(doc(db, 'parties', partyId));
      if (partyDoc.exists) {
        const partyData = partyDoc.data();
        setPhotos(partyData.photos || []);
        setTitle(partyData.title);
      }
    };

    fetchPhotos();
  }, [partyId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={photos}
        renderItem={({ item }) => <Image source={{ uri: item }} style={styles.photo} />}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  photo: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 10,
  },
});

export default PartyPhotos;
