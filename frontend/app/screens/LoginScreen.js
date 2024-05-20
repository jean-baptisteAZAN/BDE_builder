import React, { useState } from "react";
import {
  TextInput,
  Pressable,
  StyleSheet,
  Text,
  View,
  Button,
  ImageBackground,
} from "react-native";
import { styled } from "nativewind";
import Icon from "react-native-vector-icons/FontAwesome";
import config from "../../assets/config/colorsConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

const StyledText = styled(Text);

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const onLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      const token = user.accessToken;
      await AsyncStorage.setItem("userToken", token);
      navigation.navigate("/home");
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert("Adresse email ou mot de passe incorrect.");
    }
  };

  const onCreateUser = () => {
    navigation.navigate("/signup");
  };

  return (
    <ImageBackground source={config.backgroundImage} style={styles.container}>
      <StyledText className="text-2xl text-white">Connectez-vous</StyledText>
      <View style={styles.inputContainer}>
        <View style={styles.iconContainer}>
          <Icon name="envelope" size={20} color="#fff" />
        </View>
        <TextInput
          style={[styles.input, emailFocused && styles.inputFocused]}
          placeholder="Email"
          value={email}
          placeholderTextColor="white"
          onChangeText={setEmail}
          keyboardType="email-address"
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.iconContainer}>
          <Icon name="lock" size={20} color="#fff" />
        </View>
        <TextInput
          style={[styles.input, passwordFocused && styles.inputFocused]}
          placeholder="Mot de passe"
          value={password}
          placeholderTextColor="white"
          onChangeText={setPassword}
          secureTextEntry
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
        />
      </View>
      <Pressable onPress={onLogin} style={styles.button}>
        <StyledText className="text-white">Connexion</StyledText>
      </Pressable>
      <Button
        onPress={onCreateUser}
        color={"white"}
        title="Créer un compte"
      ></Button>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: "black",
  },
  container: {
    width: "100%",
    flex: 1,
    gap: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: 40,
    width: "100%",
    borderColor: "gray",
    borderWidth: 1,
    color: "white",
    marginBottom: 12,
    padding: 8,
    paddingLeft: 40,
    borderRadius: 100,
  },
  inputFocused: {
    borderColor: "black",
  },
  error: {
    color: "red",
    marginBottom: 12,
  },
  inputContainer: {
    width: "80%",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    marginBottom: 12,
  },
  iconContainer: {
    position: "absolute",
    left: 10,
    top: -5,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoginScreen;
