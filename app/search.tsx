import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "./constants/colors";

// Mock restaurant data
const allRestaurants = [
  {
    id: '1',
    name: 'Green Garden Vegan',
    image: require('../assets/restaurants/vegan.jpg'),
    cuisine: 'Vegan',
    rating: 4.5,
    price: '$$',
    dietaryOptions: ['Vegan', 'Gluten-Free', 'Organic'],
    distance: '0.8 mi'
  },
  {
    id: '2',
    name: 'Spice Delight',
    image: require('../assets/restaurants/indian.jpg'),
    cuisine: 'Indian',
    rating: 4.7,
    price: '$$',
    dietaryOptions: ['Vegetarian Options', 'Halal'],
    distance: '1.2 mi'
  },
  {
    id: '3',
    name: 'Seaside Seafood',
    image: require('../assets/restaurants/seafood.jpg'),
    cuisine: 'Seafood',
    rating: 4.3,
    price: '$$$',
    dietaryOptions: ['Pescatarian', 'Gluten-Free Options'],
    distance: '2.0 mi'
  },
  {
    id: '4',
    name: 'Farm to Table',
    image: require('../assets/restaurants/farm.jpg'),
    cuisine: 'American',
    rating: 4.6,
    price: '$$$',
    dietaryOptions: ['Organic', 'Locally Sourced', 'Keto-Friendly'],
    distance: '1.5 mi'
  },
  {
    id: '5',
    name: 'Mamma Mia Pizza',
    image: require('../assets/restaurants/italian.jpg'),
    cuisine: 'Italian',
    rating: 4.2,
    price: '$$',
    dietaryOptions: ['Vegetarian Options', 'Gluten-Free Options'],
    distance: '1.1 mi'
  },
  {
    id: '6',
    name: 'Sushi Heaven',
    image: require('../assets/restaurants/sushi.jpg'),
    cuisine: 'Japanese',
    rating: 4.8,
    price: '$$$',
    dietaryOptions: ['Pescatarian', 'Gluten-Free Options'],
    distance: '2.3 mi'
  },
];

// Dietary restriction options
const dietaryRestrictions = [
  { id: 'vegan', label: 'Vegan' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'dairy-free', label: 'Dairy-Free' },
  { id: 'nut-free', label: 'Nut-Free' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' },
  { id: 'keto', label: 'Keto-Friendly' },
  { id: 'paleo', label: 'Paleo' },
];

export default function Search() {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [openNow, setOpenNow] = useState(false);
  const [priceRange, setPriceRange] = useState<string[]>(['$', '$$', '$$$', '$$$$']);
  const [filteredRestaurants, setFilteredRestaurants] = useState(allRestaurants);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  // Create styles with the current theme
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    // Simple search filtering (in a real app, this would be more sophisticated)
    if (text) {
      const filtered = allRestaurants.filter(restaurant => 
        restaurant.name.toLowerCase().includes(text.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(text.toLowerCase()) ||
        restaurant.dietaryOptions.some(option => 
          option.toLowerCase().includes(text.toLowerCase())
        )
      );
      setFilteredRestaurants(filtered);
    } else {
      setFilteredRestaurants(allRestaurants);
    }
  };

  const toggleDietaryOption = (id: string) => {
    if (selectedDietary.includes(id)) {
      setSelectedDietary(selectedDietary.filter(item => item !== id));
    } else {
      setSelectedDietary([...selectedDietary, id]);
    }
  };

  const togglePriceRange = (price: string) => {
    if (priceRange.includes(price)) {
      if (priceRange.length > 1) { // Don't allow empty selection
        setPriceRange(priceRange.filter(p => p !== price));
      }
    } else {
      setPriceRange([...priceRange, price]);
    }
  };

  const applyFilters = () => {
    // In a real app, this would filter based on selected options
    // For now, just hide the filter panel
    setShowFilters(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Find a Restaurant</Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={24} color={colors.text} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Find restaurants, cuisines, dishes..."
            placeholderTextColor={colors.text === '#F0F0F0' ? '#999' : '#aaa'}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialIcons name="clear" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setFilterModalVisible(true)}
        >
          <MaterialIcons name="tune" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          <Text style={styles.filterSectionTitle}>Dietary Restrictions</Text>
          <View style={styles.dietaryOptions}>
            {dietaryRestrictions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.dietaryOption,
                  selectedDietary.includes(option.id) && styles.selectedDietaryOption
                ]}
                onPress={() => toggleDietaryOption(option.id)}
              >
                <Text
                  style={[
                    styles.dietaryOptionText,
                    selectedDietary.includes(option.id) && styles.selectedDietaryOptionText
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterSectionTitle}>Price Range</Text>
            <View style={styles.priceOptions}>
              {['$', '$$', '$$$', '$$$$'].map((price) => (
                <TouchableOpacity
                  key={price}
                  style={[
                    styles.priceOption,
                    priceRange.includes(price) && styles.selectedPriceOption
                  ]}
                  onPress={() => togglePriceRange(price)}
                >
                  <Text
                    style={[
                      styles.priceOptionText,
                      priceRange.includes(price) && styles.selectedPriceOptionText
                    ]}
                  >
                    {price}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterSectionTitle}>Open Now</Text>
            <Switch
              value={openNow}
              onValueChange={setOpenNow}
              trackColor={{ false: "#e0e0e0", true: colors.border }}
              thumbColor={openNow ? colors.primary : "#f4f3f4"}
            />
          </View>

          <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.resultsContainer}>
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((restaurant) => (
            <View key={restaurant.id} style={[styles.restaurantItem, { backgroundColor: colors.card }]}>
              <Image 
                source={restaurant.image} 
                style={styles.restaurantImage}
                defaultSource={require('../assets/placeholder.png')}
              />
              <View style={styles.restaurantInfo}>
                <Text style={[styles.restaurantName, { color: colors.text }]}>{restaurant.name}</Text>
                <View style={styles.restaurantMetaRow}>
                  <Text style={styles.cuisineText}>{restaurant.cuisine}</Text>
                  <Text style={styles.dotSeparator}>•</Text>
                  <Text style={styles.priceText}>{restaurant.price}</Text>
                  <Text style={styles.dotSeparator}>•</Text>
                  <View style={styles.ratingContainer}>
                    <MaterialIcons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>{restaurant.rating}</Text>
                  </View>
                </View>
                <View style={styles.tagsRow}>
                  {restaurant.dietaryOptions.slice(0, 2).map((option, index) => (
                    <View key={index} style={[styles.dietaryTag, { backgroundColor: colors.border }]}>
                      <Text style={[styles.dietaryTagText, { color: colors.text }]}>{option}</Text>
                    </View>
                  ))}
                  <View style={styles.distanceContainer}>
                    <Ionicons name="location-outline" size={12} color="#777" />
                    <Text style={[styles.distanceText, { color: colors.text }]}>{restaurant.distance}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noResultsContainer}>
            <MaterialIcons name="search-off" size={60} color="#ccc" />
            <Text style={styles.noResultsText}>No restaurants found</Text>
            <Text style={styles.noResultsSubText}>Try adjusting your search or filters</Text>
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filter Options</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Dietary Restrictions</Text>
              <View style={styles.dietaryOptions}>
                {dietaryRestrictions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.dietaryOption,
                      selectedDietary.includes(option.id) && [
                        styles.selectedDietaryOption,
                        { backgroundColor: colors.primary }
                      ],
                      { backgroundColor: selectedDietary.includes(option.id) ? colors.primary : colors.border }
                    ]}
                    onPress={() => toggleDietaryOption(option.id)}
                  >
                    <Text
                      style={[
                        styles.dietaryOptionText,
                        selectedDietary.includes(option.id) && [
                          styles.selectedDietaryOptionText,
                          { color: colors.card }
                        ],
                        { color: selectedDietary.includes(option.id) ? colors.card : colors.text }
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Price Range</Text>
              <View style={styles.filterRow}>
                <View style={styles.priceOptions}>
                  {['$', '$$', '$$$', '$$$$'].map((price) => (
                    <TouchableOpacity
                      key={price}
                      style={[
                        styles.priceOption,
                        priceRange.includes(price) && [
                          styles.selectedPriceOption,
                          { backgroundColor: colors.primary, borderColor: colors.primary }
                        ],
                        { borderColor: colors.border }
                      ]}
                      onPress={() => togglePriceRange(price)}
                    >
                      <Text
                        style={[
                          styles.priceOptionText,
                          priceRange.includes(price) && [
                            styles.selectedPriceOptionText,
                            { color: colors.card }
                          ],
                          { color: priceRange.includes(price) ? colors.card : colors.text }
                        ]}
                      >
                        {price}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Open Now</Text>
              <View style={styles.filterRow}>
                <Switch
                  value={openNow}
                  onValueChange={setOpenNow}
                  trackColor={{ false: "#e0e0e0", true: colors.border }}
                  thumbColor={openNow ? colors.primary : "#f4f3f4"}
                />
              </View>

              <TouchableOpacity 
                style={[styles.applyButton, { backgroundColor: colors.primary }]}
                onPress={applyFilters}
              >
                <Text style={[styles.applyButtonText, { color: colors.card }]}>Apply Filters</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  filterButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.border,
  },
  filtersPanel: {
    backgroundColor: colors.card,
    margin: 10,
    borderRadius: 12,
    padding: 15,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  dietaryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  dietaryOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedDietaryOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dietaryOptionText: {
    fontSize: 14,
    color: '#555',
  },
  selectedDietaryOptionText: {
    color: colors.card,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  priceOptions: {
    flexDirection: 'row',
  },
  priceOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 5,
  },
  selectedPriceOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  priceOptionText: {
    fontSize: 14,
    color: '#555',
  },
  selectedPriceOptionText: {
    color: colors.card,
  },
  applyButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  applyButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  restaurantItem: {
    flexDirection: 'row',
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 4,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  restaurantImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  restaurantInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  restaurantMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cuisineText: {
    fontSize: 14,
    color: '#555',
  },
  dotSeparator: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 4,
  },
  priceText: {
    fontSize: 14,
    color: '#555',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dietaryTag: {
    backgroundColor: colors.border,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 6,
  },
  dietaryTagText: {
    fontSize: 12,
    color: colors.text,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  distanceText: {
    fontSize: 12,
    color: '#777',
    marginLeft: 2,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
    marginTop: 12,
  },
  noResultsSubText: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
}); 