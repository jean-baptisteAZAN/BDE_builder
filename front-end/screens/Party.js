import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import config from "../assets/config/colorsConfig";
import AddPartyModal from "../components/AddPartyModal";
import { UserContext } from "../context/UserContext";
import { Button } from "react-native-paper";

const Party = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [parties, setParties] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [nextParty, setNextParty] = useState(null);
  const [pastParties, setPastParties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const db = getFirestore();
    const unsubscribe = onSnapshot(collection(db, "parties"), (snapshot) => {
      const partiesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (partiesList.length > 0) {
        const currentDate = new Date();
        const futureParties = partiesList.filter(
          (party) => new Date(party.date) >= currentDate
        );
        let pastPartiesList = partiesList.filter(
          (party) => new Date(party.date) < currentDate
        );
        pastPartiesList = pastPartiesList
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 3);

        if (futureParties.length > 0) {
          const closestParty = futureParties.reduce((closest, party) => {
            const partyDate = new Date(party.date);
            const closestDate = new Date(closest.date);

            return partyDate < closestDate ? party : closest;
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

  const handleAddParty = async (newParty) => {
    setIsLoading(true);
    setError(null);
    try {
      const db = getFirestore();
      await db.collection("parties").add(newParty);
      setModalVisible(false);
    } catch (err) {
      setError("Erreur lors de l'ajout de la soirée");
    } finally {
      setIsLoading(false);
    }
  };

  const renderPartyItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("/partyPhotos", { partyId: item.id })}
    >
      <ImageBackground
        source={{ uri: item.imageUrl }}
        style={styles.partyImage}
        imageStyle={styles.partyImageRounded}
      >
        <View style={styles.smallMask}>
          <Text style={styles.smallPartyTitle}>{item.title}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <ImageBackground source={config.backgroundImage} style={styles.container}>
      {user && user.role === "admin" && (
        <>
          <Button
            onPress={() => setModalVisible(true)}
            mode="contained"
            style={styles.addButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              "Ajouter une soirée"
            )}
          </Button>
          <AddPartyModal
            visible={isModalVisible}
            onClose={() => setModalVisible(false)}
            onAddParty={handleAddParty} // Passer la fonction d'ajout
          />
        </>
      )}
      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("Ticketing")}>
          <Text>Billetterie</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("/calendar")}>
          <Text>Calendrier</Text>
        </TouchableOpacity>
      </View>
      {nextParty ? (
        <ImageBackground
          source={{ uri: nextParty.imageUrl }}
          style={styles.nextPartyImage}
          imageStyle={styles.nextPartyImageRounded}
        >
          <View style={styles.mask}>
            <Text style={styles.partyTitle}>
              {new Date(nextParty.date).toLocaleDateString()}
            </Text>
            <Text style={styles.partyTitle}>{nextParty.title}</Text>
          </View>
        </ImageBackground>
      ) : (
        <Text style={styles.text}>No upcoming parties</Text>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
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
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
  },
  partyImageRounded: {
    borderRadius: 20,
  },
  nextPartyImage: {
    width: 320,
    height: 240,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  nextPartyImageRounded: {
    borderRadius: 20,
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
  errorText: {
    color: "red",
    marginTop: 10,
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
  navigationContainer: {
    flexDirection: "row",
    backgroundColor: "gray",
    borderRadius: 20,
    width: "90%",
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

export default Party;
