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

const { width } = Dimensions.get("window");

const allergyOptions = [
  "Peanuts",
  "Tree Nuts",
  "Dairy",
  "Gluten",
  "Shellfish",
  "Eggs",
  "Soy",
  "Wheat",
  "Sesame",
];

export default function AllergySelectionScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergy)
        ? prev.filter((a) => a !== allergy)
        : [...prev, allergy]
    );
  };

  const handleSubmit = () => {
    console.log("Selected allergies:", selectedAllergies);
    // Save or continue to next step
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Select Your Allergies</Text>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {allergyOptions.map((allergy) => (
            <TouchableOpacity
              key={allergy}
              style={[
                styles.allergyItem,
                selectedAllergies.includes(allergy) && {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() => toggleAllergy(allergy)}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name={
                  selectedAllergies.includes(allergy)
                    ? "check-box"
                    : "check-box-outline-blank"
                }
                size={22}
                color={
                  selectedAllergies.includes(allergy)
                    ? colors.card
                    : colors.text
                }
              />
              <Text
                style={[
                  styles.allergyText,
                  selectedAllergies.includes(allergy) && { color: colors.card },
                ]}
              >
                {allergy}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Temp for allergies */}
        <TouchableOpacity onPress={() => router.push("/restrictions")}>
          <Text style={styles.title}>Restrictions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Save Allergies</Text>
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
    allergyItem: {
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
    allergyText: {
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
