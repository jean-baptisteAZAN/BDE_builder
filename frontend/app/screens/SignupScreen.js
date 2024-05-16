import React, { useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Text,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { styled } from "nativewind";
import Icon from "react-native-vector-icons/FontAwesome";
import { Picker } from "@react-native-picker/picker";
import colorsConfig from "../../assets/config/colorsConfig";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from "../../firebaseConfig";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const StyledText = styled(Text);

const Signup = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [promotion, setPromotion] = useState("1ere année");
  const [association, setAssociation] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const db = getFirestore();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        firstName: firstName,
        lastName: lastName,
        promotion: promotion,
        association: association,
        uid: user.uid
      });

      console.log("User created and data saved in Firestore");
      navigation.navigate("/login");
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
    }
  };

  return (
    <ImageBackground
      source={colorsConfig.backgroundImage}
      style={styles.container}
    >
      <StyledText className="text-2xl text-white mt-40">Créer un compte</StyledText>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <Icon name="user" size={20} color="#fff" />
          </View>
          <TextInput
            style={[
              styles.input,
              emailFocused && styles.inputFocused,
            ]}
            placeholder="Prénom"
            value={firstName}
            placeholderTextColor="white"
            onChangeText={setFirstName}
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <Icon name="user" size={20} color="#fff" />
          </View>
          <TextInput
            style={[
              styles.input,
              emailFocused && styles.inputFocused,
            ]}
            placeholder="Nom"
            value={lastName}
            placeholderTextColor="white"
            onChangeText={setLastName}
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <Icon name="envelope" size={20} color="#fff" />
          </View>
          <TextInput
            style={[
              styles.input,
              emailFocused && styles.inputFocused,
            ]}
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
            style={[
              styles.input,
              passwordFocused && styles.inputFocused,
            ]}
            placeholder="Mot de passe"
            value={password}
            placeholderTextColor="white"
            onChangeText={setPassword}
            secureTextEntry
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <Icon name="group" size={20} color="#fff" />
          </View>
          <TextInput
            style={[
              styles.input,
              emailFocused && styles.inputFocused,
            ]}
            placeholder="Fais-tu partie d'une asso ?"
            value={association}
            placeholderTextColor="white"
            onChangeText={setAssociation}
          />
        </View>

        <Pressable onPress={onSubmit} style={styles.button}>
          <StyledText className="text-white">Créer mon compte !</StyledText>
        </Pressable>
      </ScrollView>
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
  scrollContainer: {
    width: "100%",
  },
  scrollContent: {
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
  picker: {
    justifyContent: 'center',
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
  pickerText: {
    color: "white",
  },
  hiddenPicker: {
    position: 'absolute',
    top: -1000,
    width: '100%',
  }
});

export default Signup;
