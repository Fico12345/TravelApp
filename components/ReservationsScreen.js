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
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { firestore } from "../firebaseConfig";
import { getAuth } from "firebase/auth";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as Animatable from "react-native-animatable";


const theme = {
  primary: "#4CAF50",
  secondary: "#FF5722",
  background: "#F5F5F5",
  text: "#212121",
  error: "#F44336",
};

export default function ReservationsScreen() {
  const [reservations, setReservations] = useState([]);
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showDestinations, setShowDestinations] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  
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
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  
  const validateInput = () => {
    if (!destination || !date || !type) {
      setErrorMsg("Molimo ispunite sva polja.");
      return false;
    }
    return true;
  };

  
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

  
  const onDateChange = (event, dateValue) => {
    if (Platform.OS !== "web") {
      setShowDatePicker(false);
    }
    if (dateValue) {
      setSelectedDate(dateValue);
      setDate(dateValue.toLocaleDateString());
    }
  };

  
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
      <Text style={styles.destinationText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require("../assets/background.jpg")} 
      style={styles.background}
    >
      <TouchableOpacity
        style={styles.container}
        activeOpacity={1}
        onPress={() => setShowDestinations(false)} 
      >
        <Text style={styles.title}>Rezervacije</Text>

        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

        {/* Odabir destinacije */}
        <TouchableOpacity
          style={[styles.input, { flexDirection: "row", alignItems: "center" }]}
          onPress={() => setShowDestinations(!showDestinations)}
        >
          <Icon name="place" size={20} color={destination ? theme.primary : "#aaa"} />
          <Text style={{ marginLeft: 10, color: destination ? theme.text : "#aaa" }}>
            {destination || "Izaberite destinaciju"}
          </Text>
        </TouchableOpacity>
        {showDestinations && (
          <Animatable.View animation="fadeIn" duration={300}>
            {loading ? (
              <ActivityIndicator size="large" color={theme.primary} />
            ) : (
              <FlatList
                data={destinations}
                keyExtractor={(item) => item.id}
                renderItem={renderDestinationItem}
                style={styles.dropdown}
              />
            )}
          </Animatable.View>
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
            style={[styles.input, { flexDirection: "row", alignItems: "center" }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="event" size={20} color={date ? theme.primary : "#aaa"} />
            <Text style={{ marginLeft: 10, color: date ? theme.text : "#aaa" }}>
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

        {/* Gumb za spremanje */}
        <TouchableOpacity style={styles.button} onPress={handleSaveReservation}>
          <Text style={styles.buttonText}>Spremi Rezervaciju</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Poluprozirna pozadina
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: theme.primary,
  },
  input: {
    height: 40,
    borderColor: theme.primary,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    justifyContent: "center",
    borderRadius: 5,
    backgroundColor: "#fff",
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
  destinationText: {
    color: theme.text,
  },
  error: {
    color: theme.error,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: theme.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});