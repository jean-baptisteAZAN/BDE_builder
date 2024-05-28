import React from 'react';
import {StyleSheet, ImageBackground} from 'react-native';
import config from '../assets/config/colorsConfig';
import CardHome from '../components/CardHome';

const HomeScreen = ({navigation}) => {
  const handlePress = route => {
    navigation.navigate(route);
  };

  return (
    <ImageBackground source={config.backgroundImage} style={styles.container}>
      <CardHome
        title="Nos Soirées"
        path={
          "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        }
        onPress={() => handlePress("/party")}
      />
      <CardHome
        title="Notre Merch"
        path={
          "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        }
        onPress={() => handlePress("Route2")}
      />
      <CardHome
        title="Contactez-nous"
        path={
          "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        }
        onPress={() => handlePress("Route3")}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});

export default HomeScreen;
