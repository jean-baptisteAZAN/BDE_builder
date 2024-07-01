import React, { useState, useEffect } from 'react';
import { StyleSheet, ImageBackground, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import config from '../assets/config/colorsConfig';
import CardHome from '../components/CardHome';

const AssociationHome = ({ route, navigation }) => {
  const { associationId } = route.params;
  const [association, setAssociation] = useState(null);

  useEffect(() => {
    const fetchAssociation = async () => {
      try {
        const docRef = doc(db, 'associations', associationId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setAssociation(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error('Error fetching association: ', error);
      }
    };

    fetchAssociation();
  }, [associationId]);

  const handlePress = (route) => {
    navigation.navigate(route, { associationId });
  };

  if (!association) {
    return (
        <ActivityIndicator size="large" color="blue" />
    );
  }

  return (
    <ImageBackground source={config.backgroundImage} style={styles.container}>
      <CardHome
        title="Nos Événements"
        path={association.eventsImageUrl || 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
        onPress={() => handlePress('/associationEvents')}
      />
      <CardHome
        title="Nos Partenaires"
        path={association.partnersImageUrl || 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
        onPress={() => handlePress('AssociationPartners')}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});

export default AssociationHome;
