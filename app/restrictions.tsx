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

const dietaryOptions = [
  "Vegan",
  "Vegetarian",
  "Pescatarian",
  "Keto",
  "Paleo",
  "Halal",
  "Kosher",
  "Low Carb",
  "Low Sodium",
  "Diabetic-Friendly",
];

export default function DietaryRestrictionsScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user } = useAuth();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const toggleOption = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  const handleSubmit = async () => {
    console.log("Selected dietary restrictions:", selectedOptions);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/users/${user?.userId}`, // Make sure `user` is available in scope
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dietary_preferences: selectedOptions,
          }),
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();
        console.log("User updated:", updatedUser);
        router.push("/cravings"); // or wherever you want to go next
      } else {
        console.error("Failed to update dietary preferences:", response.status);
      }
    } catch (err) {
      console.warn("Failed to sync dietary preferences to backend:", err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Select Your Dietary Restrictions</Text>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {dietaryOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionItem,
                selectedOptions.includes(option) && {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() => toggleOption(option)}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name={
                  selectedOptions.includes(option)
                    ? "check-box"
                    : "check-box-outline-blank"
                }
                size={22}
                color={
                  selectedOptions.includes(option) ? colors.card : colors.text
                }
              />
              <Text
                style={[
                  styles.optionText,
                  selectedOptions.includes(option) && { color: colors.card },
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Temp for allergies */}
        <TouchableOpacity onPress={() => router.push("/cravings")}>
          <Text style={styles.title}>Cravings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Save Preferences</Text>
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
