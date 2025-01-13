import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Pocetna() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dobrodošli u Aplikaciju za Planiranje putovanja!</Text>

            {/* Pozdravna poruka */}
            <Text style={styles.description}>
                Ovdje možete upravljati rezervacijama, destinacijama i planirati svoje putovanje.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f2f2f2",
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
        color: "#333",
    },
    description: {
        fontSize: 18,
        textAlign: "center",
        marginBottom: 30,
        color: "#666",
    },
});


