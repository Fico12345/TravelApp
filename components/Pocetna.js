import React from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";

export default function Pocetna() {
    return (
        <ImageBackground
            source={require("../assets/background.jpg")}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.overlay}>
                <Text style={styles.title}>
                    Dobrodošli u Aplikaciju za Planiranje Putovanja!
                </Text>

                <Text style={styles.description}>
                    Ovdje možete upravljati rezervacijama, destinacijama i
                    planirati svoje savršeno putovanje.
                </Text>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Tamni sloj za bolju čitljivost teksta
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
        color: "#ffffff", // Bijeli tekst za kontrast
    },
    description: {
        fontSize: 18,
        textAlign: "center",
        color: "#dddddd", // Svijetlosivi tekst
        lineHeight: 24,
    },
});





