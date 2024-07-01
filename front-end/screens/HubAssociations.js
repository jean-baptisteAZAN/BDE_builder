import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, ImageBackground, ScrollView } from 'react-native';
import { db } from '../firebaseConfig';
import { Button } from 'react-native-paper';
import { collection, getDocs } from 'firebase/firestore';
import config from '../assets/config/colorsConfig';
import { UserContext } from '../context/UserContext';
import AddAssociationModal from '../components/AddAssociationModal';

const HubAssociations = ({ navigation }) => {
  const [associations, setAssociations] = useState([]);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const { user } = useContext(UserContext);
  useEffect(() => {
    const fetchAssociations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'associations'));
        const associationsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAssociations(associationsList);
      } catch (error) {
        console.error('Error fetching associations: ', error);
        Alert.alert('Error', 'Unable to fetch associations');
      }
    };

    fetchAssociations();
  }, []);

  const handlePress = (id) => {
    navigation.navigate('/associationHome', { associationId: id });
  };

  return (
    <ImageBackground source={config.backgroundImage} style={styles.container}>
            {user && user.role === 'admin' && (
        <>
          <Button
            onPress={() => setAddModalVisible(true)}
            mode="contained"
            style={{marginBottom: 20}}
          >
            Ajouter une association
          </Button>
          <AddAssociationModal
            visible={isAddModalVisible}
            onClose={() => setAddModalVisible(false)}
          />
        </>
      )}
      <FlatList
        data={associations}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handlePress(item.id)}>
            <Image source={{ uri: item.logo }} style={styles.logo} />
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'gray',
    borderRadius: 8,
    width: '100%',
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  name: {
    fontSize: 18,
  },
});

export default HubAssociations;
