import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/StackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Result">;

const ResultScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  // Dummy scanned ingredient data (Replace with actual data from OCR processing)
  const scannedData = [
    { name: "Sodium Nitrate", category: "Harmful", color: "red" },
    { name: "Citric Acid", category: "Moderate", color: "yellow" },
    { name: "Vitamin C", category: "Not Harmful", color: "green" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan Results</Text>

      <ScrollView contentContainerStyle={styles.resultContainer}>
        {scannedData.map((item, index) => (
          <View key={index} style={[styles.resultItem, { borderLeftColor: item.color }]}>
            <Text style={styles.ingredientName}>{item.name}</Text>
            <Text style={[styles.categoryText, { color: item.color }]}>{item.category}</Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Home")}>
        <Text style={styles.buttonText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 20,
    color: "#333",
  },
  resultContainer: {
    width: "100%",
    paddingBottom: 20,
  },
  resultItem: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 10,
    borderRadius: 12,
    borderLeftWidth: 10,
    borderLeftColor: "#333", // Default border color
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  ingredientName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "400",
    marginTop: 5,
  },
  button: {
    backgroundColor: "#6200ea",
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 50,
    marginTop: 20,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default ResultScreen;
