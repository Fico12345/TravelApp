import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function DestinationsScreen() {
  return (
    <View style={styles.container}>
      <Text>Destinacije</Text>
      {}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
