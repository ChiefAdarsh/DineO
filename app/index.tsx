import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useThemeColors } from "./constants/colors";


type Restaurant = {
  id: string;
  name: string;
  image: any;
  cuisine: string;
  rating: number;
  dietaryOptions: string[];
  distance: string;
};

// Mock data for restaurants
const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Green Garden Vegan',
    image: require('../assets/restaurants/vegan.jpg'),
    cuisine: 'Vegan',
    rating: 4.5,
    dietaryOptions: ['Vegan', 'Gluten-Free', 'Organic'],
    distance: '0.8 mi'
  },
  {
    id: '2',
    name: 'Spice Delight',
    image: require('../assets/restaurants/indian.jpg'),
    cuisine: 'Indian',
    rating: 4.7,
    dietaryOptions: ['Vegetarian Options', 'Halal'],
    distance: '1.2 mi'
  },
  {
    id: '3',
    name: 'Seaside Seafood',
    image: require('../assets/restaurants/seafood.jpg'),
    cuisine: 'Seafood',
    rating: 4.3,
    dietaryOptions: ['Pescatarian', 'Gluten-Free Options'],
    distance: '2.0 mi'
  },
  {
    id: '4',
    name: 'Farm to Table',
    image: require('../assets/restaurants/farm.jpg'),
    cuisine: 'American',
    rating: 4.6,
    dietaryOptions: ['Organic', 'Locally Sourced', 'Keto-Friendly'],
    distance: '1.5 mi'
  },
];

const categories = [
  { id: '1', name: 'All', icon: 'restaurant' },
  { id: '2', name: 'Vegan', icon: 'eco' },
  { id: '3', name: 'Gluten-Free', icon: 'spa' },
  { id: '4', name: 'Dairy-Free', icon: 'no-meals' },
  { id: '5', name: 'Vegetarian', icon: 'grass' },
];

export default function Discover() {
  const colors = useThemeColors();
  const [activeCategory, setActiveCategory] = useState('1');
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(mockRestaurants);
  
  // Create styles with the current theme
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.header}>
        <Text style={styles.title}>Discover Restaurants</Text>
      </View>
        

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                activeCategory === category.id && [styles.activeCategoryButton, { backgroundColor: colors.primary }],
                { backgroundColor: activeCategory === category.id ? colors.primary : colors.card }
              ]}
              onPress={() => setActiveCategory(category.id)}
            >
              <MaterialIcons 
                name={category.icon as any} 
                size={22} 
                color={activeCategory === category.id ? colors.card : colors.text} 
              />
              <Text 
                style={[
                  styles.categoryText,
                  activeCategory === category.id && [styles.activeCategoryText, { color: colors.card }],
                  { color: activeCategory === category.id ? colors.card : colors.text }
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recommended Restaurants */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended for You</Text>
          {filteredRestaurants.map((restaurant) => (
            <View key={restaurant.id} style={[styles.restaurantCard, { backgroundColor: colors.card }]}>
              <Image source={restaurant.image} style={styles.restaurantImage} />
              <View style={styles.restaurantInfo}>
                <View style={styles.restaurantHeader}>
                  <Text style={[styles.restaurantName, { color: colors.text }]}>{restaurant.name}</Text>
                  <View style={styles.ratingContainer}>
                    <MaterialIcons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>{restaurant.rating}</Text>
                  </View>
                </View>
                <Text style={styles.cuisineText}>{restaurant.cuisine}</Text>
                <View style={styles.dietaryTagsContainer}>
                  {restaurant.dietaryOptions.map((option) => (
                    <View key={option} style={[styles.dietaryTag, { backgroundColor: colors.border }]}>
                      <Text style={[styles.dietaryTagText, { color: colors.text }]}>{option}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <MaterialIcons name="location-on" size={16} color={colors.primary} />
                    <Text style={styles.detailText}>{restaurant.distance}</Text>
                  </View>
                  <TouchableOpacity style={[styles.viewButton, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.viewButtonText, { color: colors.card }]}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// Type for the theme colors
type ThemeColors = ReturnType<typeof useThemeColors>;

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  heroSection: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.card,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.card,
    opacity: 0.9,
  },
  categories: {
    marginTop: 20,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.card,
    borderRadius: 20,
    marginRight: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeCategoryButton: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  activeCategoryText: {
    color: colors.card,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: colors.text,
  },
  restaurantCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantImage: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9C4",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 2,
  },
  cuisineText: {
    fontSize: 14,
    color: "#777",
    marginBottom: 8,
  },
  dietaryTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  dietaryTag: {
    backgroundColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  dietaryTagText: {
    fontSize: 12,
    color: colors.text,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 13,
    marginLeft: 4,
    color: "#777",
  },
  viewButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewButtonText: {
    color: colors.card,
    fontWeight: "500",
    fontSize: 14,
  },
});
