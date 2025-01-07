import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet,Button, Alert } from "react-native";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, firestore } from "../firebaseConfig";
import { AuthContext } from "../AuthContext";

export default function HomeScreen() {
  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <View style={styles.container}>
      <Text>Dobrodošli u aplikacijuuuuuuuuuuuuuuuuuuuu?</Text>
      <Button title="Odjavi se" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
});
