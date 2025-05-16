import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "./constants/colors";

// Define types
type Preference = string;

type Member = {
  id: string;
  name: string;
  preferences: Preference[];
};

type Group = {
  id: string;
  name: string;
  members: Member[];
};

type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  accommodates: string[];
  price: string;
};

// Mock data for groups
const initialGroups: Group[] = [
  {
    id: "1",
    name: "Weekend Foodies",
    members: [
      { id: "1", name: "You", preferences: ["Vegetarian", "Spicy"] },
      { id: "2", name: "Alex", preferences: ["Gluten-Free", "Seafood"] },
      { id: "3", name: "Jamie", preferences: ["Vegan", "Organic"] },
    ],
  },
  {
    id: "2",
    name: "Family Dinner",
    members: [
      { id: "1", name: "You", preferences: ["Vegetarian", "Spicy"] },
      { id: "4", name: "Mom", preferences: ["Low-Carb", "No Seafood"] },
      { id: "5", name: "Dad", preferences: ["Meat Lover", "Spicy"] },
      { id: "6", name: "Sister", preferences: ["Gluten-Free", "Dairy-Free"] },
    ],
  },
];

// Mock restaurant recommendations for groups
const groupRecommendations: Restaurant[] = [
  {
    id: "1",
    name: "Harmony Kitchen",
    cuisine: "Fusion",
    rating: 4.6,
    accommodates: ["Vegetarian", "Vegan", "Gluten-Free"],
    price: "$$",
  },
  {
    id: "2",
    name: "The Inclusive Table",
    cuisine: "American",
    rating: 4.4,
    accommodates: ["Vegetarian", "Gluten-Free", "Dairy-Free", "Low-Carb"],
    price: "$$$",
  },
  {
    id: "3",
    name: "Garden & Grill",
    cuisine: "International",
    rating: 4.7,
    accommodates: ["Vegan", "Meat Lover", "Organic", "Spicy Options"],
    price: "$$",
  },
];

// Mock friend data
const friendsList: Member[] = [
  { id: "2", name: "Alex", preferences: ["Gluten-Free", "Seafood"] },
  { id: "3", name: "Jamie", preferences: ["Vegan", "Organic"] },
  { id: "4", name: "Mom", preferences: ["Low-Carb", "No Seafood"] },
  { id: "5", name: "Dad", preferences: ["Meat Lover", "Spicy"] },
  { id: "6", name: "Sister", preferences: ["Gluten-Free", "Dairy-Free"] },
  { id: "7", name: "Taylor", preferences: ["Keto", "No Nuts"] },
  { id: "8", name: "Jordan", preferences: ["Pescatarian", "Spicy"] },
  { id: "9", name: "Casey", preferences: ["Halal", "No Shellfish"] },
];

// Common dietary preferences
const dietaryPreferences: Preference[] = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Halal",
  "Kosher",
  "Keto",
  "Paleo",
  "Low-Carb",
  "Pescatarian",
  "No Seafood",
  "No Shellfish",
  "Organic",
  "Spicy",
  "Meat Lover",
];

export default function Groups() {
  const colors = useThemeColors();
  const [groups, setGroups] = useState(initialGroups);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  // Create styles with the current theme
  const styles = useMemo(() => createStyles(colors), [colors]);

  const selectedGroupData = groups.find((group) => group.id === selectedGroup);

  const createNewGroup = () => {
    if (newGroupName.trim() === "") {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    const newGroup: Group = {
      id: String(Date.now()),
      name: newGroupName.trim(),
      members: [{ id: "1", name: "You", preferences: ["Vegetarian", "Spicy"] }],
    };

    setGroups([...groups, newGroup]);
    setNewGroupName("");
    setShowNewGroupModal(false);
    setSelectedGroup(newGroup.id);
  };

  const addMemberToGroup = () => {
    if (newMemberName.trim() === "") {
      Alert.alert("Error", "Please enter a member name");
      return;
    }

    if (selectedPreferences.length === 0) {
      Alert.alert("Error", "Please select at least one dietary preference");
      return;
    }

    if (!selectedGroup) return;

    const newMember: Member = {
      id: String(Date.now()),
      name: newMemberName.trim(),
      preferences: selectedPreferences,
    };

    const updatedGroups = groups.map((group) => {
      if (group.id === selectedGroup) {
        return {
          ...group,
          members: [...group.members, newMember],
        };
      }
      return group;
    });

    setGroups(updatedGroups);
    setNewMemberName("");
    setSelectedPreferences([]);
    setShowAddMemberModal(false);
  };

  const addFriendToGroup = (friend: Member) => {
    if (!selectedGroup) return;

    const updatedGroups = groups.map((group) => {
      if (group.id === selectedGroup) {
        // Check if friend is already in the group
        const isAlreadyMember = group.members.some(
          (member) => member.id === friend.id
        );
        
        if (isAlreadyMember) {
          Alert.alert("Already Added", `${friend.name} is already in this group`);
          return group;
        }
        
        return {
          ...group,
          members: [...group.members, friend],
        };
      }
      return group;
    });

    setGroups(updatedGroups);
    setShowAddMemberModal(false);
  };

  const togglePreference = (preference: Preference) => {
    if (selectedPreferences.includes(preference)) {
      setSelectedPreferences(
        selectedPreferences.filter((pref) => pref !== preference)
      );
    } else {
      setSelectedPreferences([...selectedPreferences, preference]);
    }
  };

  const removeMember = (groupId: string, memberId: string) => {
    // Don't allow removing yourself
    if (memberId === "1") {
      Alert.alert("Cannot Remove", "You cannot remove yourself from the group");
      return;
    }

    const updatedGroups = groups.map((group) => {
      if (group.id === groupId) {
        return {
          ...group,
          members: group.members.filter((member) => member.id !== memberId),
        };
      }
      return group;
    });

    setGroups(updatedGroups);
  };

  const deleteGroup = (groupId: string) => {
    Alert.alert(
      "Delete Group",
      "Are you sure you want to delete this group?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedGroups = groups.filter((group) => group.id !== groupId);
            setGroups(updatedGroups);
            setSelectedGroup(null);
          },
        },
      ]
    );
  };

  if (selectedGroup) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedGroup(null)}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{selectedGroupData?.name}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteGroup(selectedGroup)}
          >
            <MaterialIcons name="delete" size={24} color="#ff3b30" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Group Members</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddMemberModal(true)}
            >
              <MaterialIcons name="person-add" size={20} color={colors.card} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.membersContainer}>
            {selectedGroupData?.members.map((member) => (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>
                    {member.name} {member.id === "1" && "(You)"}
                  </Text>
                  <View style={styles.preferencesContainer}>
                    {member.preferences.map((pref, index) => (
                      <View key={index} style={styles.preferenceTag}>
                        <Text style={styles.preferenceText}>{pref}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                {member.id !== "1" && (
                  <TouchableOpacity
                    style={styles.removeMemberButton}
                    onPress={() => removeMember(selectedGroup, member.id)}
                  >
                    <MaterialIcons name="close" size={18} color="#777" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended Restaurants</Text>
          </View>

          <View style={styles.recommendationsContainer}>
            {groupRecommendations.map((restaurant) => (
              <TouchableOpacity key={restaurant.id} style={styles.restaurantCard}>
                <View style={styles.restaurantHeader}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <View style={styles.ratingContainer}>
                    <MaterialIcons name="star" size={16} color="#FFD700" />
                    <Text style={styles.rating}>{restaurant.rating}</Text>
                  </View>
                </View>
                <View style={styles.restaurantDetails}>
                  <Text style={styles.cuisine}>
                    {restaurant.cuisine} • {restaurant.price}
                  </Text>
                </View>
                <View style={styles.accommodatesContainer}>
                  <Text style={styles.accommodatesLabel}>Accommodates:</Text>
                  <View style={styles.tagsContainer}>
                    {restaurant.accommodates.map((tag, index) => (
                      <View key={index} style={styles.accommodateTag}>
                        <Text style={styles.accommodateText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <TouchableOpacity style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>View Restaurant</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Add Member Modal */}
        <Modal
          visible={showAddMemberModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowAddMemberModal(false)}
        >
          <SafeAreaView edges={[]} style={{ flex: 1 }}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Add to Group</Text>
                  <TouchableOpacity
                    onPress={() => setShowAddMemberModal(false)}
                  >
                    <MaterialIcons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalTabContainer}>
                  <TouchableOpacity style={styles.modalTabActive}>
                    <Text style={styles.modalTabTextActive}>Friends</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalTab}>
                    <Text style={styles.modalTabText}>New Person</Text>
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={friendsList}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.friendItem}
                      onPress={() => addFriendToGroup(item)}
                    >
                      <View style={styles.friendInfo}>
                        <Text style={styles.friendName}>{item.name}</Text>
                        <View style={styles.friendPrefs}>
                          {item.preferences.slice(0, 2).map((pref, index) => (
                            <Text key={index} style={styles.friendPref}>
                              {pref}{index < Math.min(item.preferences.length - 1, 1) ? ', ' : ''}
                            </Text>
                          ))}
                          {item.preferences.length > 2 && (
                            <Text style={styles.friendPref}>...</Text>
                          )}
                        </View>
                      </View>
                      <MaterialIcons name="add" size={24} color="#FF6347" />
                    </TouchableOpacity>
                  )}
                  style={styles.friendsList}
                />
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Groups</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.groupsContainer}>
          {groups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={styles.groupCard}
              onPress={() => setSelectedGroup(group.id)}
            >
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.memberCount}>
                  {group.members.length} {group.members.length === 1 ? "member" : "members"}
                </Text>

                <View style={styles.memberPreviewContainer}>
                  {group.members.slice(0, 3).map((member, index) => (
                    <View key={member.id} style={[styles.memberAvatar, { zIndex: 3 - index, marginLeft: index > 0 ? -10 : 0 }]}>
                      <Text style={styles.memberInitial}>{member.name.charAt(0)}</Text>
                    </View>
                  ))}
                  {group.members.length > 3 && (
                    <View style={[styles.memberAvatar, styles.moreMembersAvatar, { zIndex: 0, marginLeft: -10 }]}>
                      <Text style={styles.memberInitial}>+{group.members.length - 3}</Text>
                    </View>
                  )}
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.createGroupButton}
          onPress={() => setShowNewGroupModal(true)}
        >
          <MaterialIcons name="add-circle" size={20} color="#FFF" />
          <Text style={styles.createGroupText}>Create New Group</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Create New Group Modal */}
      <Modal
        visible={showNewGroupModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowNewGroupModal(false)}
      >
        <SafeAreaView edges={[]} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create New Group</Text>
                <TouchableOpacity onPress={() => setShowNewGroupModal(false)}>
                  <MaterialIcons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Group Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter group name"
                  value={newGroupName}
                  onChangeText={setNewGroupName}
                />
              </View>

              <Text style={styles.modalInfoText}>
                You&apos;ll be automatically added to the group. You can add more people later.
              </Text>

              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={createNewGroup}
              >
                <Text style={styles.modalButtonText}>Create Group</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  groupsContainer: {
    padding: 16,
  },
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 14,
    color: "#777",
    marginBottom: 8,
  },
  memberPreviewContainer: {
    flexDirection: "row",
    marginTop: 4,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.card,
  },
  moreMembersAvatar: {
    backgroundColor: "#ddd",
  },
  memberInitial: {
    color: colors.card,
    fontWeight: "bold",
    fontSize: 14,
  },
  createGroupButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  createGroupText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalInfoText: {
    fontSize: 14,
    color: "#777",
    marginBottom: 20,
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  membersContainer: {
    padding: 16,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  preferencesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  preferenceTag: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  preferenceText: {
    fontSize: 12,
    color: "#555",
  },
  removeMemberButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  recommendationsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  restaurantCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  restaurantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rating: {
    marginLeft: 4,
    fontWeight: "bold",
    color: colors.text,
  },
  restaurantDetails: {
    marginBottom: 10,
  },
  cuisine: {
    fontSize: 14,
    color: "#777",
  },
  accommodatesContainer: {
    marginBottom: 15,
  },
  accommodatesLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    marginBottom: 6,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  accommodateTag: {
    backgroundColor: "#e8f5e9",
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  accommodateText: {
    fontSize: 12,
    color: "#388e3c",
  },
  viewButton: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  modalTabContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  modalTabActive: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  modalTabText: {
    fontSize: 16,
    color: "#777",
  },
  modalTabTextActive: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  friendsList: {
    maxHeight: 400,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  friendPrefs: {
    flexDirection: "row",
    marginTop: 2,
  },
  friendPref: {
    fontSize: 14,
    color: "#777",
  },
}); 