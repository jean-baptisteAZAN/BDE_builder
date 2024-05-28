import React from 'react';
import {useContext} from 'react';
import {StyleSheet, TouchableOpacity, Image} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import config from './assets/config/colorsConfig';
import {UserProvider, UserContext} from './context/UserContext';
import HomeScreen from './screens/HomeScreen';
import Login from './screens/LoginScreen';
import Signup from './screens/SignupScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const {user} = useContext(UserContext);

  return (
    <Stack.Navigator
      initialRouteName="/login"
      screenOptions={({navigation}) => ({
        headerStyle: {backgroundColor: 'black'},
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
                  ? {uri: user.profilePictureUrl}
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
      <Stack.Screen
        name="/login"
        component={Login}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="/signup"
        component={Signup}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="/home"
        component={HomeScreen}
        options={{headerTitle: config.BdeName}}
      />
      {/*<Stack.Screen name="Settings" component={SettingsScreen} />*/}
      {/*<Stack.Screen*/}
      {/*  name="Party"*/}
      {/*  component={Party}*/}
      {/*  options={{ headerTitle: "Nos Soirées" }}*/}
      {/*/>*/}
      <Stack.Screen
        name="/profile"
        component={ProfileScreen}
        options={{ headerTitle: "Ton Profil" }}
      />
      {/*<Stack.Screen*/}
      {/*  name="PartyPhotos"*/}
      {/*  component={PartyPhotos}*/}
      {/*  options={{ headerTitle: "Photos" }}*/}
      {/*/>*/}
      {/*<Stack.Screen*/}
      {/*  name="/calendar"*/}
      {/*  component={CalendarScreen}*/}
      {/*  options={{ headerTitle: "Calendrier" }}*/}
      {/*/>*/}
    </Stack.Navigator>
  );
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </UserProvider>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default App;
