import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../constants/colors";
import { useAuth } from "../context/AuthContext";

type SelectableItem = {
  name: string;
  selected: boolean;
};

type UserData = {
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  profile_picture: string;
  allergies: string[];
  cravings: string[];
  dietary_preferences: string[];
  groups: string[];
  reviews: any[];
  created: string;
};

export default function Profile() {
  const colors = useThemeColors();
  const { user } = useAuth();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPhone, setEditedPhone] = useState("");
  const [comments, setComments] = useState("");
  const [editedName, setEditedName] = useState("");
  const [editedPicture, setEditedPicture] = useState("");
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  const [dietaryPreferences, setDietaryPreferences] = useState<
    SelectableItem[]
  >([
    { name: "Vegetarian", selected: false },
    { name: "Vegan", selected: false },
    { name: "Pescatarian", selected: false },
    { name: "Gluten-Free", selected: false },
    { name: "Dairy-Free", selected: false },
    { name: "Keto", selected: false },
    { name: "Paleo", selected: false },
    { name: "Low-Carb", selected: false },
  ]);

  const [allergies, setAllergies] = useState<SelectableItem[]>([
    { name: "Peanuts", selected: false },
    { name: "Tree Nuts", selected: false },
    { name: "Dairy", selected: false },
    { name: "Eggs", selected: false },
    { name: "Wheat", selected: false },
    { name: "Soy", selected: false },
    { name: "Fish", selected: false },
    { name: "Shellfish", selected: false },
  ]);

  const [cuisinePreferences, setCuisinePreferences] = useState<
    SelectableItem[]
  >([
    { name: "Italian", selected: false },
    { name: "Mexican", selected: false },
    { name: "Chinese", selected: false },
    { name: "Japanese", selected: false },
    { name: "Indian", selected: false },
    { name: "Thai", selected: false },
    { name: "French", selected: false },
    { name: "American", selected: false },
    { name: "Mediterranean", selected: false },
    { name: "Middle Eastern", selected: false },
  ]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/users/${user?.userId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const parsed = JSON.parse(data.body);
          setUserData(parsed.user);
        } else {
          console.error("Failed to fetch user:", response.status);
        }
      } catch (err) {
        console.warn("Error fetching user:", err);
      }
    };

    if (user?.userId) {
      fetchUser();
    }
  }, [user?.userId]);

  useEffect(() => {
    if (userData) {
      setEditedPhone(userData.phoneNumber);
      setDietaryPreferences((prefs) =>
        prefs.map((p) => ({
          ...p,
          selected: userData.dietary_preferences.includes(p.name),
        }))
      );
      setAllergies((prefs) =>
        prefs.map((p) => ({
          ...p,
          selected: userData.allergies.includes(p.name),
        }))
      );
      setCuisinePreferences((prefs) =>
        prefs.map((p) => ({
          ...p,
          selected: userData.cravings.includes(p.name),
        }))
      );
      setEditedName(userData.name);
      setEditedPicture(userData.profile_picture);
    }
  }, [userData]);

  const toggleItem = (
    name: string,
    list: SelectableItem[],
    setList: React.Dispatch<React.SetStateAction<SelectableItem[]>>
  ) => {
    setList(
      list.map((item) =>
        item.name === name ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => router.replace("/login"),
      },
    ]);
  };

  const uploadImageToS3 = async (
    localUri: string,
    filename: string,
    mimeType: string
  ) => {
    try {
      const presignRes = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/s3/presign?filename=${filename}&type=${mimeType}`
      );
      const { signedUrl, fileUrl } = await presignRes.json();

      const response = await fetch(localUri);
      const blob = await response.blob();

      const s3Res = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": mimeType,
        },
        body: blob,
      });

      if (!s3Res.ok) throw new Error("S3 upload failed");
      return fileUrl;
    } catch (err) {
      console.error("S3 upload error:", err);
      return null;
    }
  };

  const handleSave = async () => {
    let finalProfilePicture = editedPicture;

    if (localImageUri) {
      const fileName =
        localImageUri.split("/").pop() || `profile-${Date.now()}.jpg`;
      const fileType = "image/jpeg";
      const uploadedUrl = await uploadImageToS3(
        localImageUri,
        fileName,
        fileType
      );

      if (uploadedUrl) {
        finalProfilePicture = uploadedUrl;
      } else {
        console.warn("Image upload failed, skipping profile picture update");
      }
    }

    const updatedData = {
      name: editedName,
      profile_picture: finalProfilePicture,
      phoneNumber: editedPhone,
      comments: comments,
      dietary_preferences: dietaryPreferences
        .filter((p) => p.selected)
        .map((p) => p.name),
      allergies: allergies.filter((a) => a.selected).map((a) => a.name),
      cravings: cuisinePreferences.filter((c) => c.selected).map((c) => c.name),
    };

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/users/${user?.userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (response.ok) {
        setEditedPicture(finalProfilePicture);
        setLocalImageUri(null);
        setIsEditing(false);
        console.log("Profile updated.");
      } else {
        console.error("Failed to update user:", response.status);
      }
    } catch (error) {
      console.error("Error submitting updated data:", error);
    }
  };

  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission denied", "You need to allow gallery access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setLocalImageUri(asset.uri); // only save to state
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Profile
        </Text>
        <TouchableOpacity onPress={() => setIsEditing((prev) => !prev)}>
          <MaterialIcons
            name={isEditing ? "close" : "edit"}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={[styles.profileSection, { backgroundColor: colors.card }]}>
          <View style={styles.profileHeader}>
            <TouchableOpacity
              onPress={isEditing ? handlePickImage : undefined}
              style={styles.profileImageContainer}
            >
              {editedPicture ? (
                <Image
                  source={{ uri: localImageUri || editedPicture }}
                  style={{ width: 70, height: 70, borderRadius: 35 }}
                />
              ) : (
                <View
                  style={[
                    styles.profileImageFallback,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[styles.profileInitials, { color: colors.card }]}
                  >
                    {editedName ? editedName.charAt(0).toUpperCase() : "?"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.profileName,
                    {
                      color: colors.text,
                      borderBottomWidth: 1,
                      borderColor: colors.border,
                      paddingBottom: 2,
                    },
                  ]}
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder="Your name"
                  placeholderTextColor={colors.border}
                />
              ) : (
                <Text style={[styles.profileName, { color: colors.text }]}>
                  {editedName || "Name"}
                </Text>
              )}
              <Text style={[styles.profileEmail, { color: colors.text }]}>
                {userData?.email}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Phone Number
          </Text>
          <TextInput
            editable={isEditing}
            value={editedPhone}
            onChangeText={setEditedPhone}
            style={[
              styles.input,
              {
                backgroundColor: isEditing ? colors.background : colors.card,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            keyboardType="phone-pad"
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Comments
          </Text>
          <TextInput
            editable={isEditing}
            value={comments}
            onChangeText={setComments}
            multiline
            style={[
              styles.input,
              {
                backgroundColor: isEditing ? colors.background : colors.card,
                color: colors.text,
                borderColor: colors.border,
                minHeight: 80,
                textAlignVertical: "top",
              },
            ]}
            placeholder="Add any notes or comments here..."
            placeholderTextColor={colors.border}
          />
        </View>

        <PreferenceSection
          title="Dietary Preferences"
          description="Select your dietary preferences to get better restaurant recommendations"
          items={dietaryPreferences}
          onToggle={(name) =>
            toggleItem(name, dietaryPreferences, setDietaryPreferences)
          }
          colors={colors}
          isEditing={isEditing}
        />

        <PreferenceSection
          title="Allergies & Intolerances"
          description="We'll help you avoid restaurants and dishes with these ingredients"
          items={allergies}
          onToggle={(name) => toggleItem(name, allergies, setAllergies)}
          colors={colors}
          isEditing={isEditing}
        />

        <PreferenceSection
          title="Favorite Cuisines"
          description="Select cuisines you enjoy to get better recommendations"
          items={cuisinePreferences}
          onToggle={(name) =>
            toggleItem(name, cuisinePreferences, setCuisinePreferences)
          }
          colors={colors}
          isEditing={isEditing}
        />
        {isEditing && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginVertical: 20,
            }}
          >
            <TouchableOpacity onPress={handleSave}>
              <Text style={{ color: colors.primary, fontWeight: "bold" }}>
                Save
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsEditing(false)}>
              <Text style={{ color: colors.danger, fontWeight: "bold" }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.card }]}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={20} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

type PreferenceSectionProps = {
  title: string;
  description: string;
  items: SelectableItem[];
  onToggle: (name: string) => void;
  colors: ReturnType<typeof useThemeColors>;
  isEditing: boolean;
};

function PreferenceSection({
  title,
  description,
  items,
  onToggle,
  colors,
  isEditing,
}: PreferenceSectionProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.section, { backgroundColor: colors.card }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.sectionDescription, { color: colors.text }]}>
        {description}
      </Text>
      <View style={styles.preferencesContainer}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.name}
            disabled={!isEditing}
            style={[
              styles.preferenceTag,
              item.selected && [{ backgroundColor: colors.primary }],
              {
                backgroundColor: item.selected ? colors.primary : colors.border,
                opacity: isEditing ? 1 : 0.5,
              },
            ]}
            onPress={() => isEditing && onToggle(item.name)}
          >
            <Text
              style={[
                styles.preferenceText,
                { color: item.selected ? colors.card : colors.text },
              ]}
            >
              {item.name}
            </Text>
            {item.selected && (
              <MaterialIcons
                name="check"
                size={16}
                color={colors.card}
                style={styles.checkIcon}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: { fontSize: 20, fontWeight: "bold" },
    scrollView: { flex: 1 },
    profileSection: { padding: 20, marginBottom: 15 },
    profileHeader: { flexDirection: "row", alignItems: "center" },
    profileImageContainer: {
      width: 70,
      height: 70,
      borderRadius: 35,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 15,
    },
    profileInitials: { fontSize: 24, fontWeight: "bold" },
    profileInfo: { flex: 1 },
    profileName: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
    profileEmail: { fontSize: 14, color: "#777" },
    section: { padding: 20, marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
    sectionDescription: { fontSize: 14, color: "#777", marginBottom: 15 },
    preferencesContainer: { flexDirection: "row", flexWrap: "wrap" },
    preferenceTag: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginRight: 10,
      marginBottom: 10,
    },
    preferenceText: { fontSize: 14 },
    checkIcon: { marginLeft: 4 },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 15,
      marginBottom: 15,
    },
    logoutText: { fontSize: 16, fontWeight: "500", marginLeft: 8 },
    versionInfo: { alignItems: "center", marginBottom: 20 },
    versionText: { fontSize: 12, color: "#888" },
    input: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      marginTop: 8,
    },
    profileImageFallback: {
      width: 70,
      height: 70,
      borderRadius: 35,
      alignItems: "center",
      justifyContent: "center",
    },
  });
