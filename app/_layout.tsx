import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { useColorScheme } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "./constants/colors";
import { AuthProvider } from "./context/AuthContext";

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const colors = useThemeColors();

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar
          style={colorScheme === "dark" ? "light" : "dark"}
          backgroundColor="transparent"
          translucent
        />
        <SafeAreaView
          style={{ flex: 1, backgroundColor: colors.background }}
          edges={["top", "right", "left"]}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="confirm" />
            <Stack.Screen name="allergies" />
            <Stack.Screen name="restrictions" />
            <Stack.Screen name="cravings" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
