import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ReservationsScreen() {
  return (
    <View style={styles.container}>
      <Text>Rezervacije</Text>
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
