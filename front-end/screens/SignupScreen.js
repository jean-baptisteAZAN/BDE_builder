import React, {useState} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  ImageBackground,
  ScrollView,
} from 'react-native';
import {Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import config from '../assets/config/colorsConfig';
import {createUserWithEmailAndPassword} from 'firebase/auth';
import {auth, db} from '../firebaseConfig';
import {doc, setDoc} from 'firebase/firestore';

const Signup = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [promotion, setPromotion] = useState('1ere année');
  const [association, setAssociation] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        firstName: firstName,
        lastName: lastName,
        promotion: promotion,
        association: association,
        uid: user.uid,
        role: 'user',
      });
      navigation.navigate('/login');
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert('Erreur lors de la création du compte.' + errorMessage);
    }
  };

  return (
    <ImageBackground source={config.backgroundImage} style={styles.container}>
      <View style={styles.containerWhite}>
      <Text style={{fontSize: 20}}>Créer un compte</Text>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <Icon name="user" size={20} color="black" />
          </View>
          <TextInput
            style={[styles.input, emailFocused && styles.inputFocused]}
            placeholder="Prénom"
            value={firstName}
            placeholderTextColor="black"
            onChangeText={setFirstName}
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <Icon name="user" size={20} color="black" />
          </View>
          <TextInput
            style={[styles.input, emailFocused && styles.inputFocused]}
            placeholder="Nom"
            value={lastName}
            placeholderTextColor="black"
            onChangeText={setLastName}
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <Icon name="envelope" size={20} color="black" />
          </View>
          <TextInput
            style={[styles.input, emailFocused && styles.inputFocused]}
            placeholder="Email"
            value={email}
            placeholderTextColor="black"
            onChangeText={setEmail}
            keyboardType="email-address"
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <Icon name="lock" size={20} color="black" />
          </View>
          <TextInput
            style={[styles.input, passwordFocused && styles.inputFocused]}
            placeholder="Mot de passe"
            value={password}
            placeholderTextColor="black"
            onChangeText={setPassword}
            secureTextEntry
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <Icon name="group" size={20} color="black" />
          </View>
          <TextInput
            style={[styles.input, emailFocused && styles.inputFocused]}
            placeholder="Fais-tu partie d'une asso ?"
            value={association}
            placeholderTextColor="black"
            onChangeText={setAssociation}
          />
        </View>
        <Button onPress={onSubmit} mode="contained-tonal">
          Créer mon compte !
        </Button>
      </ScrollView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: 'black',
  },
  container: {
    width: '100%',
    flex: 1,
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    color: 'white',
    marginBottom: 12,
    padding: 8,
    paddingLeft: 40,
    borderRadius: 100,
  },
  inputFocused: {
    borderColor: 'black',
  },
  inputContainer: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 12,
  },
  iconContainer: {
    position: 'absolute',
    left: 10,
    top: -5,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  containerWhite: {
    borderRadius: 20,
    padding: 20,
    gap: 5,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    height: '52%',
  },
});

export default Signup;
