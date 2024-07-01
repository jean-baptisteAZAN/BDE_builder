import React, { useState, useContext, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
} from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';
import { UserContext } from '../context/UserContext';
import { db, storage } from '../firebaseConfig';

const AddAssociationModal = ({ visible, onClose }) => {
  const { user } = useContext(UserContext);
  const [name, setName] = useState('');
  const [logoUri, setLogoUri] = useState(null);
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);

  useEffect(() => {
    if (visible && user.role === 'admin') {
      const fetchUsers = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'users'));
          const usersList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUsers(usersList);
        } catch (error) {
          console.error('Error fetching users: ', error);
          Alert.alert('Error', 'Unable to fetch users');
        }
      };

      fetchUsers();
    }
  }, [visible, user]);

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
        setLogoUri(response.assets[0].uri);
      }
    });
  };

  const uploadImage = async uri => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `associationLogos/${Date.now()}`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleAddAssociation = async () => {
    if (!name) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    if (!logoUri) {
      Alert.alert('Error', 'Please pick a logo');
      return;
    }

    try {
      const logoUrl = await uploadImage(logoUri);
      await addDoc(collection(db, 'associations'), {
        name,
        logo: logoUrl,
        members: members.map(member => member.id),
        createdBy: user.uid,
      });
      Alert.alert('Success', 'Association added successfully');
      resetValues();
      onClose();
    } catch (error) {
      console.error('Error adding association: ', error);
      Alert.alert('Error', 'An error occurred while adding the association.');
    }
  };

  const resetValues = () => {
    setName('');
    setLogoUri(null);
    setMembers([]);
  };

  const handleSelectMember = (selectedUser) => {
    setMembers(prev =>
      prev.some(member => member.id === selectedUser.id)
        ? prev.filter(member => member.id !== selectedUser.id)
        : [...prev, selectedUser]
    );
  };

  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalView}>
        <TextInput
          placeholder="Nom de l'association"
          value={name}
          onChangeText={setName}
        />
        <Button
          mode={'contained-tonal'}
          onPress={pickImage}
          style={{ marginVertical: 20 }}>
          Choisir le logo de l'association
        </Button>
        {logoUri && (
          <Image source={{ uri: logoUri }} style={styles.imagePreview} />
        )}
        <Button
          mode={'contained-tonal'}
          onPress={() => setIsUserModalVisible(true)}
          style={{ marginVertical: 20 }}>
          Choisir les membres de l'association
        </Button>
        <ScrollView style={[styles.membersList, { maxHeight: 150 }]}>
          {members.map(member => (
            <View key={member.id} style={styles.memberItem}>
              <Image source={{ uri: member.profilePictureUrl }} style={styles.memberImage} />
              <Text style={styles.memberName}>{`${member.firstName} ${member.lastName}`}</Text>
            </View>
          ))}
        </ScrollView>
        <Button
          onPress={handleAddAssociation}
          mode={'contained'}
          style={{ marginTop: 20 }}>
          Ajouter l'association
        </Button>
        <Button
          mode={'contained-tonal'}
          style={{ marginTop: 20 }}
          onPress={() => {
            resetValues();
            onClose();
          }}>
          Fermer
        </Button>
      </View>

      <Modal visible={isUserModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalView}>
          <TextInput
            placeholder="Chercher un utilisateur"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.input}
          />
          <FlatList
            data={filteredUsers}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.userItem,
                  members.some(member => member.id === item.id) && styles.selectedUserItem,
                ]}
                onPress={() => handleSelectMember(item)}>
                <Image source={{ uri: item.profilePictureUrl }} style={styles.userImage} />
                <Text style={styles.userName}>{`${item.firstName} ${item.lastName}`}</Text>
              </TouchableOpacity>
            )}
          />
          <Button
            mode={'contained-tonal'}
            style={{ marginTop: 20 }}
            onPress={() => setIsUserModalVisible(false)}>
            Close User Selection
          </Button>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
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
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  selectedUserItem: {
    backgroundColor: 'lightgray',
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userName: {
    fontSize: 18,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  memberImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  memberName: {
    fontSize: 18,
  },
  membersList: {
    width: '80%',
    marginTop: 10,
  },
});

export default AddAssociationModal;
