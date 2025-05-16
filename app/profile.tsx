import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from './constants/colors';

// Types for dietary preferences and allergies
type DietaryPreference = {
  id: string;
  name: string;
  selected: boolean;
};

type Allergy = {
  id: string;
  name: string;
  selected: boolean;
};

type CuisinePreference = {
  id: string;
  name: string;
  selected: boolean;
};

export default function Profile() {
  const colors = useThemeColors();
  const [name, setName] = useState('Alex Johnson');
  const [email, setEmail] = useState('alex.johnson@example.com');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  
  // Dietary preferences
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>([
    { id: '1', name: 'Vegetarian', selected: true },
    { id: '2', name: 'Vegan', selected: false },
    { id: '3', name: 'Pescatarian', selected: false },
    { id: '4', name: 'Gluten-Free', selected: false },
    { id: '5', name: 'Dairy-Free', selected: false },
    { id: '6', name: 'Keto', selected: false },
    { id: '7', name: 'Paleo', selected: false },
    { id: '8', name: 'Low-Carb', selected: true },
  ]);
  
  // Allergies and intolerances
  const [allergies, setAllergies] = useState<Allergy[]>([
    { id: '1', name: 'Peanuts', selected: false },
    { id: '2', name: 'Tree Nuts', selected: false },
    { id: '3', name: 'Dairy', selected: false },
    { id: '4', name: 'Eggs', selected: false },
    { id: '5', name: 'Wheat', selected: false },
    { id: '6', name: 'Soy', selected: false },
    { id: '7', name: 'Fish', selected: false },
    { id: '8', name: 'Shellfish', selected: true },
  ]);
  
  // Cuisine preferences
  const [cuisinePreferences, setCuisinePreferences] = useState<CuisinePreference[]>([
    { id: '1', name: 'Italian', selected: true },
    { id: '2', name: 'Mexican', selected: false },
    { id: '3', name: 'Chinese', selected: true },
    { id: '4', name: 'Japanese', selected: false },
    { id: '5', name: 'Indian', selected: true },
    { id: '6', name: 'Thai', selected: false },
    { id: '7', name: 'French', selected: false },
    { id: '8', name: 'American', selected: false },
    { id: '9', name: 'Mediterranean', selected: false },
    { id: '10', name: 'Middle Eastern', selected: false },
  ]);
  
  // Toggle functions
  const toggleDietaryPreference = (id: string) => {
    const updatedPreferences = dietaryPreferences.map(pref => 
      pref.id === id ? { ...pref, selected: !pref.selected } : pref
    );
    setDietaryPreferences(updatedPreferences);
  };
  
  const toggleAllergy = (id: string) => {
    const updatedAllergies = allergies.map(allergy => 
      allergy.id === id ? { ...allergy, selected: !allergy.selected } : allergy
    );
    setAllergies(updatedAllergies);
  };
  
  const toggleCuisine = (id: string) => {
    const updatedCuisines = cuisinePreferences.map(cuisine => 
      cuisine.id === id ? { ...cuisine, selected: !cuisine.selected } : cuisine
    );
    setCuisinePreferences(updatedCuisines);
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: () => {
            // In a real app, implement actual logout logic here
            Alert.alert("Logged Out", "You have been logged out successfully");
          }
        }
      ]
    );
  };
  
  // Create styles with current theme colors
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity>
          <MaterialIcons name="edit" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={[styles.profileSection, { backgroundColor: colors.card }]}>
          <View style={styles.profileHeader}>
            <View style={[styles.profileImageContainer, { backgroundColor: colors.primary }]}>
              <Text style={[styles.profileInitials, { color: colors.card }]}>AJ</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>{name}</Text>
              <Text style={[styles.profileEmail, { color: colors.text }]}>{email}</Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Dietary Preferences</Text>
          <Text style={[styles.sectionDescription, { color: colors.text }]}>
            Select your dietary preferences to get better restaurant recommendations
          </Text>
          <View style={styles.preferencesContainer}>
            {dietaryPreferences.map((preference) => (
              <TouchableOpacity
                key={preference.id}
                style={[
                  styles.preferenceTag,
                  preference.selected && [styles.preferenceTagSelected, { backgroundColor: colors.primary }],
                  { backgroundColor: preference.selected ? colors.primary : colors.border }
                ]}
                onPress={() => toggleDietaryPreference(preference.id)}
              >
                <Text
                  style={[
                    styles.preferenceText,
                    preference.selected && [styles.preferenceTextSelected, { color: colors.card }],
                    { color: preference.selected ? colors.card : colors.text }
                  ]}
                >
                  {preference.name}
                </Text>
                {preference.selected && (
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
        
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Allergies & Intolerances</Text>
          <Text style={[styles.sectionDescription, { color: colors.text }]}>
            We&apos;ll help you avoid restaurants and dishes with these ingredients
          </Text>
          <View style={styles.preferencesContainer}>
            {allergies.map((allergy) => (
              <TouchableOpacity
                key={allergy.id}
                style={[
                  styles.allergyTag,
                  allergy.selected && [styles.allergyTagSelected, { backgroundColor: colors.danger }],
                  { backgroundColor: allergy.selected ? colors.danger : colors.border }
                ]}
                onPress={() => toggleAllergy(allergy.id)}
              >
                <Text
                  style={[
                    styles.preferenceText,
                    allergy.selected && [styles.preferenceTextSelected, { color: colors.card }],
                    { color: allergy.selected ? colors.card : colors.text }
                  ]}
                >
                  {allergy.name}
                </Text>
                {allergy.selected && (
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
        
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Favorite Cuisines</Text>
          <Text style={[styles.sectionDescription, { color: colors.text }]}>
            Select cuisines you enjoy to get better recommendations
          </Text>
          <View style={styles.preferencesContainer}>
            {cuisinePreferences.map((cuisine) => (
              <TouchableOpacity
                key={cuisine.id}
                style={[
                  styles.cuisineTag,
                  cuisine.selected && [styles.cuisineTagSelected, { backgroundColor: colors.success }],
                  { backgroundColor: cuisine.selected ? colors.success : colors.border }
                ]}
                onPress={() => toggleCuisine(cuisine.id)}
              >
                <Text
                  style={[
                    styles.preferenceText,
                    cuisine.selected && [styles.preferenceTextSelected, { color: colors.card }],
                    { color: cuisine.selected ? colors.card : colors.text }
                  ]}
                >
                  {cuisine.name}
                </Text>
                {cuisine.selected && (
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
        
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>App Settings</Text>
          
          <View style={styles.settingsRow}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="notifications" size={24} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.text }]}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#e0e0e0", true: colors.border }}
              thumbColor={notificationsEnabled ? colors.primary : "#f4f3f4"}
            />
          </View>
          
          <View style={styles.settingsRow}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="location-on" size={24} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.text }]}>Location Services</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: "#e0e0e0", true: colors.border }}
              thumbColor={locationEnabled ? colors.primary : "#f4f3f4"}
            />
          </View>
        </View>
        
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.card }]} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Log Out</Text>
        </TouchableOpacity>
        
        <View style={styles.versionInfo}>
          <Text style={[styles.versionText, { color: colors.text }]}>DineOutBuddy v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Type for theme colors
type ThemeColors = ReturnType<typeof useThemeColors>;

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 15,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  profileInitials: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#777',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#777',
    marginBottom: 15,
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  preferenceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
  },
  preferenceTagSelected: {
    
  },
  allergyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
  },
  allergyTagSelected: {
    
  },
  cuisineTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
  },
  cuisineTagSelected: {
    
  },
  preferenceText: {
    fontSize: 14,
  },
  preferenceTextSelected: {
    
  },
  checkIcon: {
    marginLeft: 4,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginBottom: 15,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  versionInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#888',
  },
}); 