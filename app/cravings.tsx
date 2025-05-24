import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "./constants/colors";
import { useAuth } from "./context/AuthContext";

const { width } = Dimensions.get("window");

const cravingOptions = [
  "Chinese",
  "Japanese",
  "Korean",
  "Thai",
  "Mexican",
  "Italian",
  "Indian",
  "Mediterranean",
  "American",
  "Vietnamese",
  "French",
  "Middle Eastern",
];

export default function CravingsScreen() {
  const colors = useThemeColors();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selectedCravings, setSelectedCravings] = useState<string[]>([]);

  const toggleCraving = (craving: string) => {
    setSelectedCravings((prev) =>
      prev.includes(craving)
        ? prev.filter((c) => c !== craving)
        : [...prev, craving]
    );
  };

  const handleSubmit = async () => {
    console.log("Selected cravings:", selectedCravings);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/users/${user?.userId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cravings: selectedCravings,
          }),
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();
        console.log("User updated:", updatedUser);
        router.replace("/(tabs)"); // or wherever you'd like to route after submission
      } else {
        console.error("Failed to update cravings:", response.status);
      }
    } catch (err) {
      console.warn("Failed to sync cravings to backend:", err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>What Are You Craving?</Text>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {cravingOptions.map((craving) => (
            <TouchableOpacity
              key={craving}
              style={[
                styles.optionItem,
                selectedCravings.includes(craving) && {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() => toggleCraving(craving)}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name={
                  selectedCravings.includes(craving)
                    ? "check-box"
                    : "check-box-outline-blank"
                }
                size={22}
                color={
                  selectedCravings.includes(craving) ? colors.card : colors.text
                }
              />
              <Text
                style={[
                  styles.optionText,
                  selectedCravings.includes(craving) && { color: colors.card },
                ]}
              >
                {craving}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Save Cravings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      paddingHorizontal: width * 0.05,
      paddingTop: 20,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 20,
      textAlign: "center",
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 20,
    },
    optionItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 12,
      backgroundColor: colors.card,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    optionText: {
      fontSize: 16,
      marginLeft: 10,
      color: colors.text,
      flexShrink: 1,
    },
    submitButton: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
    },
    submitText: {
      color: colors.card,
      fontWeight: "600",
      fontSize: 16,
    },
  });
