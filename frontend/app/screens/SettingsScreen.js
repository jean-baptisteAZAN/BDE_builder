// screens/SettingsScreen.js
import React from "react";
import { View, Text, Button } from "react-native";

const SettingsScreen = ({ navigation }) => {
  return (
    <View className="flex-1 items-center justify-center">
      <Text>Settings Screen</Text>
      <Button title="Button 1" onPress={() => navigation.navigate("Party")} />
    </View>
  );
};

export default SettingsScreen;
