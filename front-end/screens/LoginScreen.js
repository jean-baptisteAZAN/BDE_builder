import React, {useState, useContext} from 'react';
import {
  TextInput,
  StyleSheet,
  Text,
  View,
  ImageBackground,
} from 'react-native';
import {Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import config from '../assets/config/colorsConfig';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {auth} from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {UserContext} from '../context/UserContext';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const {login} = useContext(UserContext);

  const onLogin = async e => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      const token = await user.getIdToken();
      await AsyncStorage.setItem('userToken', token);
      await login(token);
      navigation.navigate('/hubAssociations');
    } catch (error) {
      alert('Adresse email ou mot de passe incorrect.');
    }
  };

  const onCreateUser = () => {
    navigation.navigate('/signup');
  };

  return (
    <ImageBackground source={config.backgroundImage} style={styles.containerImage}>
    <View style={styles.container}>
        <Text style={{color: 'black', fontSize: 20}}>Connectez-vous</Text>

        <View style={styles.inputContainer}>
        <View style={styles.iconContainer}>
          <Icon name="envelope" size={20} color="black" />
        </View>
        <TextInput
          style={[styles.input, emailFocused && styles.inputFocused]}
          placeholder="Adresse email"
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
      <Button mode="elevated" onPress={onLogin}>
        Connexion
      </Button>
      <Button onPress={onCreateUser} mode="contained-tonal">
        Créer un compte
      </Button>
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
    backgroundColor: 'red',
  },
  container: {
    borderRadius: 20,
    padding: 20,
    gap: 5,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
  },
  containerImage: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    color: 'black',
    marginBottom: 12,
    padding: 8,
    paddingLeft: 40,
    borderRadius: 100,
  },
  inputFocused: {
    borderColor: 'black',
  },
  error: {
    color: 'red',
    marginBottom: 12,
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
});

export default LoginScreen;
