import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/StackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Result">;
type RouteResultProp = RouteProp<RootStackParamList, "Result">;

const ResultScreen = ({ route }: { route: RouteResultProp }) => {
  const navigation = useNavigation<NavigationProp>();

  const initialResult = route.params.result as {
    risk_level: string;
    explanations: string[];
  };

  const [editedExplanations, setEditedExplanations] = useState<string[]>(
    initialResult.explanations
  );

  const handleExplanationChange = (text: string, index: number) => {
    const updated = [...editedExplanations];
    updated[index] = text;
    setEditedExplanations(updated);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan Result</Text>

      <View style={styles.riskBox}>
        <Text style={styles.riskLabel}>Risk Level:</Text>
        <Text style={[
    styles.riskValue,
    {
      color:
        initialResult.risk_level === "High"
          ? "#e53935" // red
          : initialResult.risk_level === "Moderate"
          ? "#fbc02d" // yellow
          : "#43a047", // green for Low
    },
  ]}>{initialResult.risk_level}</Text>
      </View>

      <Text style={styles.sectionTitle}>Edit Explanations</Text>

      <ScrollView contentContainerStyle={styles.resultContainer}>
        {editedExplanations && editedExplanations.length > 0 ? (
          editedExplanations.map((explanation, index) => (
            <TextInput
              key={index}
              style={styles.textInput}
              value={explanation}
              onChangeText={(text) => handleExplanationChange(text, index)}
              multiline
            />
          ))
        ) : (
          <Text style={styles.noDataText}>No explanation available.</Text>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Home")}
      >
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
    marginBottom: 20,
    color: "#333",
  },
  riskBox: {
    backgroundColor: "#f2f2f2",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    marginBottom: 20,
    alignItems: "center",
  },
  riskLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
  },
  riskValue: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
    // color: "#e53935",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  resultContainer: {
    width: "100%",
    paddingBottom: 20,
  },
  textInput: {
    backgroundColor: "#f9f9f9",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    color: "#333",
  },
  noDataText: {
    textAlign: "center",
    fontSize: 16,
    color: "#999",
    marginTop: 20,
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
