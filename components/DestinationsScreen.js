import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { firestore } from "../firebaseConfig"; // Provjerite ispravnost putanje do firebaseConfig

export default function DestinationsScreen() {
  const [destinacije, setDestinacije] = useState([]);
  const [naziv, setNaziv] = useState("");
  const [opis, setOpis] = useState("");
  const [kategorija, setKategorija] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Dohvati destinacije prilikom montiranja komponente
  useEffect(() => {
    const fetchDestinacije = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "destinations"));
        const fetchedDestinacije = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDestinacije(fetchedDestinacije);
      } catch (error) {
        console.error("Greška pri dohvaćanju destinacija: ", error);
      }
    };

    fetchDestinacije();
  }, []);

  // Provjeri ispravnost unosa
  const validateInput = () => {
    if (!naziv || !opis || !kategorija || !latitude || !longitude) {
      setErrorMsg("Molimo ispunite sva polja.");
      return false;
    }
    if (isNaN(latitude) || isNaN(longitude)) {
      setErrorMsg("Latitude i Longitude moraju biti numeričke vrijednosti.");
      return false;
    }
    return true;
  };

  // Spremi novo odredište
  const handleSaveDestination = async () => {
    if (!validateInput()) return;

    try {
      // Dodaj novo odredište u Firestore
      await addDoc(collection(firestore, "destinations"), {
        name: naziv,
        description: opis,
        category: kategorija,
        location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
        createdAt: new Date(),
      });
      
      Alert.alert("Odredište uspješno spremljeno!");
      setNaziv("");
      setOpis("");
      setKategorija("");
      setLatitude("");
      setLongitude("");
      setErrorMsg("");

      // Ponovno dohvatiti destinacije
      const fetchedDestinacije = await fetchDestinacije();
      setDestinacije(fetchedDestinacije);
    } catch (error) {
      console.error("Greška pri spremanju odredišta: ", error);
      Alert.alert("Nije moguće spremiti odredište.");
    }
  };

  // Funkcija za dohvat svih destinacija
  const fetchDestinacije = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "destinations"));
      const fetchedDestinacije = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return fetchedDestinacije;
    } catch (error) {
      console.error("Greška pri dohvaćanju destinacija: ", error);
      return [];
    }
  };

  // Ažuriraj odredište
  const handleUpdateDestination = async (id) => {
    if (!validateInput()) return;

    try {
      const updatedData = {
        name: naziv,
        description: opis,
        category: kategorija,
        location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      };

      const destinationRef = doc(firestore, "destinations", id);
      await updateDoc(destinationRef, updatedData);
      Alert.alert("Odredište uspješno ažurirano!");

      setNaziv("");
      setOpis("");
      setKategorija("");
      setLatitude("");
      setLongitude("");
      setErrorMsg("");

      const fetchedDestinacije = await fetchDestinacije();
      setDestinacije(fetchedDestinacije);
    } catch (error) {
      console.error("Greška pri ažuriranju odredišta: ", error);
      Alert.alert("Nije moguće ažurirati odredište.");
    }
  };

  // Obriši odredište
  const handleDeleteDestination = async (id) => {
    try {
      const destinationRef = doc(firestore, "destinations", id);
      await deleteDoc(destinationRef);
      Alert.alert("Odredište uspješno obrisano!");

      const fetchedDestinacije = await fetchDestinacije();
      setDestinacije(fetchedDestinacije);
    } catch (error) {
      console.error("Greška pri brisanju odredišta: ", error);
      Alert.alert("Nije moguće obrisati odredište.");
    }
  };

  const renderDestinationItem = ({ item }) => (
    <View style={styles.destinationItem}>
      <Text style={styles.destinationName}>{item.name}</Text>
      <Text>{item.description}</Text>
      <Text>{item.category}</Text>

      {/* Ažuriraj odredište */}
      <TouchableOpacity
        onPress={() => {
          setNaziv(item.name);
          setOpis(item.description);
          setKategorija(item.category);
          setLatitude(item.location.latitude.toString());
          setLongitude(item.location.longitude.toString());
          handleUpdateDestination(item.id);
        }}
      >
        <Text style={styles.buttonText}>Ažuriraj</Text>
      </TouchableOpacity>

      {/* Obriši odredište */}
      <TouchableOpacity onPress={() => handleDeleteDestination(item.id)}>
        <Text style={styles.buttonText}>Obriši</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Destinacije</Text>

      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

      {/* Forma za dodavanje/azuriranje destinacije */}
      <TextInput
        style={styles.input}
        placeholder="Naziv destinacije"
        value={naziv}
        onChangeText={setNaziv}
      />
      <TextInput
        style={styles.input}
        placeholder="Opis destinacije"
        value={opis}
        onChangeText={setOpis}
      />
      <TextInput
        style={styles.input}
        placeholder="Kategorija (npr. Plaže, Povijest)"
        value={kategorija}
        onChangeText={setKategorija}
      />
      <TextInput
        style={styles.input}
        placeholder="Latitude"
        value={latitude}
        onChangeText={setLatitude}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Longitude"
        value={longitude}
        onChangeText={setLongitude}
        keyboardType="numeric"
      />
      <Button title="Spremi Destinaciju" onPress={handleSaveDestination} />

      {/* Popis destinacija */}
      <FlatList
        data={destinacije}
        keyExtractor={(item) => item.id}
        renderItem={renderDestinationItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
  },
  destinationItem: {
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
  },
  destinationName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonText: {
    color: "blue",
    textDecorationLine: "underline",
    marginTop: 5,
  },
  error: {
    color: "red",
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "bold",
  },
});