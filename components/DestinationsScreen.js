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
import { supabase } from "../supabaseClient"; 
import { firestore } from "../firebaseConfig"; 
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import * as ImagePicker from 'expo-image-picker'; 
import * as FileSystem from 'expo-file-system'; 
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

  useEffect(() => {
    fetchDestinacije();
  }, []);

  
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

  
  const handleImageUpload = async () => {
    try {
      
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
      if (!permissionResult.granted) {
        setErrorMsg("Dozvola za pristup galeriji je odbijena!");
        return;
      }
  
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        quality: 0.8, 
      });
  
      if (!result.canceled) {
        const fileUri = result.assets[0].uri;
        const fileName = `${Date.now()}.jpg`;
  
        
        const { data, error } = await supabase.storage
          .from('destinations') 
          .upload(fileName, {
            uri: fileUri,
            type: "image/jpeg",
            name: fileName,
          });
  
        if (error) {
          throw error;
        }
  
        
        const { data: publicData } = supabase.storage
          .from('destinations')
          .getPublicUrl(fileName);
  
        if (publicData.publicUrl) {
          setSlika(publicData.publicUrl);
          console.log('URL slike:', publicData.publicUrl);
        }
      }
    } catch (error) {
      console.error("Greška pri uploadu slike:", error);
      setErrorMsg("Došlo je do greške pri uploadu slike.");
    }
  };

  const handleSaveDestination = async () => {
    if (!validateInput()) return;
    if (!slika) {
      setErrorMsg("Molimo odaberite sliku prije spremanja.");
      return;
    }

    try {
      await addDoc(collection(firestore, "destinations"), {
        name: naziv,
        description: opis,
        category: kategorija,
        location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
        imageUrl: slika, 
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

      fetchDestinacije(); 

    } catch (error) {
      console.error("Greška pri spremanju odredišta:", error);
      Alert.alert("Nije moguće spremiti odredište.");
    }
  };

  
  const handleUpdateDestination = async (id) => {
    if (!validateInput()) return;

    try {
      const updatedData = {
        name: naziv,
        description: opis,
        category: kategorija,
        location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
        imageUrl: slika, 
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

      fetchDestinacije(); 

    } catch (error) {
      console.error("Greška pri ažuriranju odredišta:", error);
      Alert.alert("Nije moguće ažurirati odredište.");
    }
  };

  
  const handleDeleteDestination = async (id) => {
    try {
      const destinationRef = doc(firestore, "destinations", id);
      await deleteDoc(destinationRef);
      Alert.alert("Odredište uspješno obrisano!");

      fetchDestinacije(); 
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
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  buttonText: {
    color: "blue",
    fontSize: 16,
    marginBottom: 5,
  },
  destinationItem: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  destinationName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  destinationImage: {
    width: 200,
    height: 120,
    marginBottom: 10,
    borderRadius: 5,
  },
  map: {
    width: 300,
    height: 200,
    marginBottom: 10,
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
});
