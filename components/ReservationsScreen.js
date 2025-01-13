import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Keyboard,
  Platform,
} from "react-native";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { firestore } from "../firebaseConfig";
import { getAuth } from "firebase/auth";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function ReservationsScreen() {
  const [reservations, setReservations] = useState([]);
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showDestinations, setShowDestinations] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Dohvati sve destinacije iz Firestore
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "destinations"));
        const fetchedDestinations = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDestinations(fetchedDestinations);
      } catch (error) {
        console.error("Greška pri dohvaćanju destinacija: ", error);
      }
    };

    fetchDestinations();
  }, []);

  // Provjeri ispravnost unosa
  const validateInput = () => {
    if (!destination || !date || !type) {
      setErrorMsg("Molimo ispunite sva polja.");
      return false;
    }
    return true;
  };

  // Dodaj novu rezervaciju
  const handleSaveReservation = async () => {
    if (!validateInput()) return;

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Niste prijavljeni!");
      return;
    }

    try {
      await addDoc(collection(firestore, "reservations"), {
        destination,
        date,
        type,
        createdAt: new Date(),
        userId: user.uid,
      });

      Alert.alert("Rezervacija uspješno spremljena!");
      setDestination("");
      setDate("");
      setType("");
      setErrorMsg("");
    } catch (error) {
      console.error("Greška pri spremanju rezervacije: ", error);
      Alert.alert("Nije moguće spremiti rezervaciju.");
    }
  };

  // Odabir datuma
  const onDateChange = (event, dateValue) => {
    if (Platform.OS !== "web") {
      setShowDatePicker(false);
    }
    if (dateValue) {
      setSelectedDate(dateValue);
      setDate(dateValue.toLocaleDateString());
    }
  };

  // Odabir destinacije
  const handleSelectDestination = (destName) => {
    setDestination(destName);
    setShowDestinations(false);
    Keyboard.dismiss();
  };

  const renderDestinationItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleSelectDestination(item.name)}
      style={styles.destinationItem}
    >
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={() => setShowDestinations(false)} // Zatvara popis destinacija
    >
      <Text style={styles.title}>Rezervacije</Text>

      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

      {/* Odabir destinacije */}
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDestinations(!showDestinations)}
      >
        <Text style={{ color: destination ? "#000" : "#aaa" }}>
          {destination || "Izaberite destinaciju"}
        </Text>
      </TouchableOpacity>
      {showDestinations && (
        <FlatList
          data={destinations}
          keyExtractor={(item) => item.id}
          renderItem={renderDestinationItem}
          style={styles.dropdown}
        />
      )}

      {/* Odabir datuma */}
      {Platform.OS === "web" ? (
        <TextInput
          style={styles.input}
          placeholder="Unesite datum (DD.MM.YYYY)"
          value={date}
          onChangeText={setDate}
        />
      ) : (
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={{ color: date ? "#000" : "#aaa" }}>
            {date || "Izaberite datum"}
          </Text>
        </TouchableOpacity>
      )}
      {showDatePicker && Platform.OS !== "web" && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {/* Tip rezervacije */}
      <TextInput
        style={styles.input}
        placeholder="Tip rezervacije (npr. Hotel, Let, Auto)"
        value={type}
        onChangeText={setType}
      />
      <Button title="Spremi Rezervaciju" onPress={handleSaveReservation} />
    </TouchableOpacity>
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
    paddingHorizontal: 10,
    justifyContent: "center",
    borderRadius: 5,
  },
  dropdown: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  destinationItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  error: {
    color: "red",
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "bold",
  },
});
