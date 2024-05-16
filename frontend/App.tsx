import * as React from "react";
import { Image, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import HomeScreen from "./app/screens/HomeScreen";
import SettingsScreen from "./app/screens/SettingsScreen";
import Party from "./app/screens/Party";
import Login from "./app/screens/LoginScreen";
import Signup from "./app/screens/SignupScreen";
import ProfileScreen from "./app/screens/ProfileScreen";
import { AuthProvider } from "./app/context/AuthContext";
import colorsConfig from "./assets/config/colorsConfig";

const Stack = createNativeStackNavigator();

function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <NavigationContainer independent={true}>
            <Stack.Navigator
              initialRouteName="/login"
              screenOptions={({ navigation }) => ({
                headerStyle: { backgroundColor: "black" },
                headerTintColor: "#fff",
                headerLeft: () => (
                  <TouchableOpacity onPress={() => navigation.navigate("/home")}>
                    <Image
                      source={colorsConfig.logo}
                      style={{ width: 40, height: 40, marginLeft: 10, borderRadius: 20}}
                    />
                  </TouchableOpacity>
                ),
                headerRight: () => (
                  <TouchableOpacity onPress={() => navigation.navigate("/profile")}>
                    <Image
                      source={require("./assets/images/placeholder_pdp.jpeg")}
                      style={{ width: 40, height: 40, marginLeft: 10, borderRadius: 20}}
                    />
                  </TouchableOpacity>
                ),
              })}
            >
              <Stack.Screen name="/login" component={Login} options={{ headerShown: false }}/>
              <Stack.Screen name="/signup" component={Signup} options={{ headerShown: false }} />
              <Stack.Screen name="/home" component={HomeScreen} options={{ headerTitle: colorsConfig.BdeName}}/>
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="Party" component={Party} />
              <Stack.Screen name="/profile" component={ProfileScreen} options={{ headerTitle: "Ton Profil"}}/>
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "black",
  },
});

export default App;
