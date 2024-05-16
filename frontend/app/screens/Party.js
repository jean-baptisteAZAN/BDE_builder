import React from "react";
import { View, Text, Button } from "react-native";

const Party = ({ navigation }) => {
  return (
    <View>
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center" }}>
        Party Page
      </Text>
      <Button
        title="Button 1"
        onPress={() => navigation.navigate("Settings")}
      />
      <Button
        title="Button 2"
        onPress={() => console.log("Button 2 pressed")}
      />
    </View>
  );
};

export default Party;
