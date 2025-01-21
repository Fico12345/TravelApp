import React, { useState, useContext } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ImageBackground } from "react-native";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, firestore } from "../firebaseConfig";
import { AuthContext } from "../AuthContext";

export default function LoginScreen() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { login } = useContext(AuthContext);

  const handleRegister = async () => {
    if (!name || !surname) {
      setErrorMsg("Ime i prezime su obavezni za registraciju.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(firestore, "users", user.uid), {
        name,
        surname,
        email,
        createdAt: new Date(),
      });

      login();
      setErrorMsg("");
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      login();
      setErrorMsg("");
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/background.jpg")} 
      style={styles.background} 
    >
      <View style={styles.container}>
        {isRegistering && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Ime"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Prezime"
              value={surname}
              onChangeText={setSurname}
            />
          </>
        )}
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Lozinka"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

        {isRegistering ? (
          <>
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Registracija</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonAlt}
              onPress={() => setIsRegistering(false)}
            >
              <Text style={styles.buttonTextAlt}>Prijavite se</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Prijava</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonAlt}
              onPress={() => setIsRegistering(true)}
            >
              <Text style={styles.buttonTextAlt}> Registracija</Text>
            </TouchableOpacity>
          </>
        )}
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
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(100, 100, 100, 0.7)", 
    borderRadius: 10,
  },
  input: {
    width: "80%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  button: {
    width: "80%",
    backgroundColor: "#2196F3",
    padding: 10,
    alignItems: "center",
    marginVertical: 10,
    borderRadius: 5,
  },
  buttonAlt: {
    width: "80%",
    backgroundColor: "transparent",
    padding: 10,
    alignItems: "center",
    marginVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonTextAlt: {
    color: "#2196F3",
    fontSize: 16,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    marginTop: 10,
  },
});