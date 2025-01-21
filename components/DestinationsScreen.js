import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
  ImageBackground,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { supabase } from "../supabaseClient"; 
import { firestore } from "../firebaseConfig"; 
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import MapView, { Marker } from 'react-native-maps'; 

export default function DestinationsScreen() {
  const [destinacije, setDestinacije] = useState([]);
  const [naziv, setNaziv] = useState("");
  const [opis, setOpis] = useState("");
  const [kategorija, setKategorija] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [slika, setSlika] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Funkcija za dohvat destinacija iz Firestore
  useEffect(() => {
    const fetchDestinacije = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "destinations"));
        const fetchedDestinacije = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDestinacije(fetchedDestinacije);
      } catch (error) {
        console.error("Greška pri dohvaćanju destinacija:", error);
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

  // Funkcija za odabir i upload slike
  const handleImageUpload = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: "photo",
        quality: 0.8,
      });

      if (result.didCancel) {
        console.log("Korisnik je otkazao odabir slike.");
        return;
      }

      const image = result.assets[0];
      const fileName = image.fileName ? `${Date.now()}_${image.fileName}` : `${Date.now()}.jpg`;  
      const fileUri = image.uri;

      const response = await fetch(fileUri);
      const blob = await response.blob();

      
      const { data, error } = await supabase.storage
        .from('destinations') 
        .upload(fileName, blob);

      if (error) {
        throw error;
      }

      const imageUrl = supabase.storage.from('destinations').getPublicUrl(fileName).publicURL;

      setSlika(imageUrl); 
      console.log('URL slike:', imageUrl);

    } catch (error) {
      console.error("Greška pri uploadu slike:", error);
      setErrorMsg("Došlo je do greške pri uploadu slike.");
    }
  };

  
  const handleSaveDestination = async () => {
    if (!validateInput()) return;

    try {
      await addDoc(collection(firestore, "destinations"), {
        name: naziv,
        description: opis,
        category: kategorija,
        location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
        imageUrl: slika, // Spremi URL slike
        createdAt: new Date(),
      });

      Alert.alert("Odredište uspješno spremljeno!");
      setNaziv("");
      setOpis("");
      setKategorija("");
      setLatitude("");
      setLongitude("");
      setSlika("");
      setErrorMsg("");

      const fetchedDestinacije = await fetchDestinacije();
      setDestinacije(fetchedDestinacije);
    } catch (error) {
      console.error("Greška pri spremanju odredišta:", error);
      Alert.alert("Nije moguće spremiti odredište.");
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
        imageUrl: slika, // Ažuriraj URL slike
      };

      const destinationRef = doc(firestore, "destinations", id);
      await updateDoc(destinationRef, updatedData);
      Alert.alert("Odredište uspješno ažurirano!");

      setNaziv("");
      setOpis("");
      setKategorija("");
      setLatitude("");
      setLongitude("");
      setSlika("");
      setErrorMsg("");

      const fetchedDestinacije = await fetchDestinacije();
      setDestinacije(fetchedDestinacije);
    } catch (error) {
      console.error("Greška pri ažuriranju odredišta:", error);
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
      console.error("Greška pri brisanju odredišta:", error);
      Alert.alert("Nije moguće obrisati odredište.");
    }
  };

  const renderDestinationItem = ({ item }) => (
    <View style={styles.destinationItem}>
      <Text style={styles.destinationName}>{item.name}</Text>
      <Text>{item.description}</Text>
      <Text>{item.category}</Text>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.destinationImage} />
      ) : (
        <Text>Nema slike</Text>
      )}

      {}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: item.location.latitude,
          longitude: item.location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker coordinate={{ latitude: item.location.latitude, longitude: item.location.longitude }} />
      </MapView>

      <TouchableOpacity
        onPress={() => {
          setNaziv(item.name);
          setOpis(item.description);
          setKategorija(item.category);
          setLatitude(item.location.latitude.toString());
          setLongitude(item.location.longitude.toString());
          setSlika(item.imageUrl || "");
        }}
      >
        <Text style={styles.buttonText}>Ažuriraj</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDeleteDestination(item.id)}>
        <Text style={styles.buttonText}>Obriši</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground
      source={require("../assets/background.jpg")} 
      style={styles.background} 
    >
      <View style={styles.container}>
        <Text style={styles.title}>Destinacije</Text>

        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

        <View style={styles.form}>
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
          <Button title="Odaberi sliku" onPress={handleImageUpload} />
          {slika ? (
            <Image source={{ uri: slika }} style={styles.previewImage} />
          ) : (
            <Text>Nema odabrane slike</Text>
          )}
          <Button title="Spremi Destinaciju" onPress={handleSaveDestination} />
        </View>

        <FlatList
          data={destinacije}
          keyExtractor={(item) => item.id}
          renderItem={renderDestinationItem}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: '#fff', 
    textShadowColor: 'rgba(0, 0, 0, 0.6)', 
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
    backgroundColor: '#fff', 
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
  destinationImage: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
  map: {
    height: 200,
    marginVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: "#007BFF",
    textAlign: "center",
    marginTop: 10,
  },
  previewImage: {
    width: 150,
    height: 150,
    marginTop: 10,
    borderRadius: 10,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
});
