import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity, Image, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import config from './assets/config/colorsConfig';
import { UserProvider, UserContext } from './context/UserContext';
import Login from './screens/LoginScreen';
import Signup from './screens/SignupScreen';
import ProfileScreen from './screens/ProfileScreen';
import CalendarScreen from './screens/CalendarScreen';
import HubAssociations from './screens/HubAssociations';
import AssociationHome from './screens/AssociationHome';
import AssociationEvents from './screens/AssociationEvents';
import EventPictures from './screens/EventPictures';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user } = useContext(UserContext);

  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: 'black' },
        headerTintColor: '#fff',
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.navigate('/hubAssociations')}>
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
            name="/hubAssociations"
            component={HubAssociations}
            options={{ headerTitle: 'Les Associations de l\'école' }}
          />
          <Stack.Screen
            name="/associationHome"
            component={AssociationHome}
            options={{ headerTitle: 'Association' }}
          />
          <Stack.Screen
            name="/eventPicture"
            component={EventPictures}
            options={{ headerTitle: 'Photos' }}
          />

          <Stack.Screen
            name='/associationEvents'
            component={AssociationEvents}
            options={{ headerTitle: 'Nos Événements' }}
          />
          <Stack.Screen
            name="/profile"
            component={ProfileScreen}
            options={{ headerTitle: 'Ton Profil' }}
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
