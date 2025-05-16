import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { useColorScheme } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "./constants/colors";

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const colors = useThemeColors();
  
  return (
    <SafeAreaProvider>
      <StatusBar style={colorScheme === 'dark' ? "light" : "dark"} backgroundColor="transparent" translucent />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'right', 'left']}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colorScheme === 'dark' ? "#999" : "#777",
            tabBarStyle: { 
              backgroundColor: colors.card,
            },
            headerShown: false,
            tabBarHideOnKeyboard: true,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Discover",
              tabBarIcon: ({ color }) => (
                <FontAwesome name="compass" size={24} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              title: "Search",
              tabBarIcon: ({ color }) => (
                <FontAwesome name="search" size={24} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="groups"
            options={{
              title: "Groups",
              tabBarIcon: ({ color }) => (
                <FontAwesome name="users" size={24} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="assistant"
            options={{
              title: "Assistant",
              tabBarIcon: ({ color }) => (
                <FontAwesome name="comment" size={24} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color }) => (
                <FontAwesome name="user" size={24} color={color} />
              ),
            }}
          />
        </Tabs>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
