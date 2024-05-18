import React, { useState, useEffect, useContext } from "react";
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import config from "../../assets/config/colorsConfig";
import { styled } from "nativewind";
import AddPartyModal from "../components/addPartyModal";
import { UserContext } from "../context/UserContext";
import { Button } from 'react-native-paper';

const StyledView = styled(View);
const StyledImage = styled(ImageBackground);

const Party = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [parties, setParties] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [nextParty, setNextParty] = useState(null);
  const [pastParties, setPastParties] = useState([]);

  useEffect(() => {
    const db = getFirestore();
    const unsubscribe = onSnapshot(collection(db, "parties"), (snapshot) => {
      const partiesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (partiesList.length > 0) {
        const currentDate = new Date();
        const futureParties = partiesList.filter(party => new Date(party.date) >= currentDate);
        let pastPartiesList = partiesList.filter(party => new Date(party.date) < currentDate);
        pastPartiesList = pastPartiesList.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

        if (futureParties.length > 0) {
          const closestParty = futureParties.reduce((closest, party) => {
            const partyDate = new Date(party.date);
            const closestDate = new Date(closest.date);

            return (partyDate < closestDate) ? party : closest;
          }, futureParties[0]);

          setNextParty(closestParty);
        } else {
          setNextParty(null);
        }

        setPastParties(pastPartiesList);
      } else {
        setNextParty(null);
        setPastParties([]);
      }
    });
    return unsubscribe;
  }, []);

  const renderPartyItem = ({ item }) => (
    <StyledImage source={{ uri: item.imageUrl }} className="w-28 h-28 flex items-center justify-center rounded-2xl m-1">
      <View style={styles.smallMask}>
        <Text style={styles.smallPartyTitle}>
          {item.title}
        </Text>
      </View>
    </StyledImage>
  );

  return (
    <ImageBackground source={config.backgroundImage} style={styles.container}>
      {user && user.role === "admin" && (
        <>
          <Button onPress={() => setModalVisible(true)} mode="contained" style={styles.addButton}>
            Ajouter une soirée
          </Button>
          <AddPartyModal visible={isModalVisible} onClose={() => setModalVisible(false)} />
        </>
      )}
      <StyledView className="flex flex-row bg-gray-400 rounded-2xl w-[90%] p-4 items-center justify-between">
        <TouchableOpacity onPress={() => navigation.navigate("Ticketing")}>
          <Text>Billetterie</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Calendar")}>
          <Text>Calendrier</Text>
        </TouchableOpacity>
      </StyledView>
      {nextParty ? (
        <StyledImage source={{ uri: nextParty.imageUrl }} className="w-80 h-60 flex items-center justify-center rounded-2xl mt-10">
          <View style={styles.mask}>
            <Text style={styles.partyTitle}>
              {new Date(nextParty.date).toLocaleDateString()}
            </Text>
            <Text style={styles.partyTitle}>
              {nextParty.title}
            </Text>
          </View>
        </StyledImage>
      ) : (
        <Text style={styles.text}>No upcoming parties</Text>
      )}
      <FlatList
        data={pastParties}
        renderItem={renderPartyItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.pastPartiesContainer}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  addButton: {
    marginBottom: 10,
  },
  partyImage: {
    width: 300,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  partyTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  text: {
    color: "white",
    fontSize: 18,
    marginTop: 20,
  },
  mask: {
    backgroundColor: "rgba(0,0,0,0.5)",
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  smallMask: {
    backgroundColor: "rgba(0,0,0,0.5)",
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  smallPartyTitle: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  pastPartiesContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
});

export default Party;
