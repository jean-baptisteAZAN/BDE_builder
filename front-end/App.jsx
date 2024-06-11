import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, TouchableOpacity, Image, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import config from './assets/config/colorsConfig';
import { UserProvider, UserContext } from './context/UserContext';
import HomeScreen from './screens/HomeScreen';
import Login from './screens/LoginScreen';
import Signup from './screens/SignupScreen';
import ProfileScreen from './screens/ProfileScreen';
import Party from './screens/Party';
import PartyPhotos from './screens/PartyPhotos';
import CalendarScreen from './screens/CalendarScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user } = useContext(UserContext);

  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: 'black' },
        headerTintColor: '#fff',
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.navigate('/home')}>
            <Image
              source={config.logo}
              style={{
                width: 40,
                height: 40,
                marginLeft: 10,
                borderRadius: 20,
              }}
            />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity onPress={() => navigation.navigate('/profile')}>
            <Image
              source={
                user && user.profilePictureUrl
                  ? { uri: user.profilePictureUrl }
                  : require('./assets/images/placeholder_pdp.jpeg')
              }
              style={{
                width: 40,
                height: 40,
                marginLeft: 10,
                borderRadius: 20,
              }}
            />
          </TouchableOpacity>
        ),
      })}>
      {user ? (
        <>
          <Stack.Screen
            name="/home"
            component={HomeScreen}
            options={{ headerTitle: config.BdeName }}
          />
          <Stack.Screen
            name="/party"
            component={Party}
            options={{ headerTitle: 'Nos Soirées' }}
          />
          <Stack.Screen
            name="/profile"
            component={ProfileScreen}
            options={{ headerTitle: 'Ton Profil' }}
          />
          <Stack.Screen
            name="/partyPhotos"
            component={PartyPhotos}
            options={{ headerTitle: 'Photos' }}
          />
          <Stack.Screen
            name="/calendar"
            component={CalendarScreen}
            options={{ headerTitle: 'Calendrier' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="/login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="/signup"
            component={Signup}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    const checkUser = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        onAuthStateChanged(auth, user => {
          if (user) {
            setUser(user);
          }
          setInitializing(false);
        });
      } else {
        setInitializing(false);
      }
    };
    checkUser();
  }, [setUser]);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'black',
  },
});

const Root = () => (
  <UserProvider>
    <App />
  </UserProvider>
);

export default Root;
