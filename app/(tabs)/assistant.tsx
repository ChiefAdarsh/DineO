import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../constants/colors";

type Message = {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
};

// Sample responses for demo purposes
const sampleResponses: Record<string, string> = {
  default: "I'm your dining assistant. I can help with dietary questions and restaurant recommendations. What would you like to know?",
  hello: "Hello! I'm your DineOutBuddy assistant. I can help you with food-related questions, dietary information, or restaurant recommendations. How can I assist you today?",
  gluten: "Gluten is a group of proteins found in certain grains like wheat, barley, and rye. People with celiac disease or gluten sensitivity should avoid it. Some naturally gluten-free foods include fruits, vegetables, meat, poultry, fish, dairy, beans, legumes, and nuts. There are also many gluten-free alternatives available for bread, pasta, and baked goods.",
  vegan: "A vegan diet excludes all animal products, including meat, dairy, eggs, and honey. It consists of fruits, vegetables, grains, legumes, nuts, and seeds. Many restaurants now offer vegan options, and you can search for vegan-friendly restaurants in the Discover tab.",
  keto: "The keto diet is a low-carb, high-fat diet that can help some people lose weight. It involves drastically reducing carbohydrate intake and replacing it with fat. This reduction in carbs puts your body into a metabolic state called ketosis. Foods allowed include meat, fatty fish, eggs, butter, cream, cheese, nuts, healthy oils, avocados, and low-carb vegetables.",
  paleo: "The paleo diet is based on foods similar to what might have been eaten during the Paleolithic era. It typically includes lean meats, fish, fruits, vegetables, nuts, and seeds — foods that could be obtained by hunting and gathering. It limits foods that became common when farming emerged, such as dairy products, legumes, and grains.",
  allergy: "Food allergies can be serious. Common allergens include milk, eggs, peanuts, tree nuts, fish, shellfish, soy, and wheat. When dining out, always inform the restaurant staff about your allergies, and check if they can accommodate your needs. The DineOutBuddy app can help you find restaurants that are allergy-friendly.",
};

// Suggested questions for the user
const suggestedQuestions = [
  "What is gluten and what foods contain it?",
  "What can I eat on a vegan diet?",
  "What is the keto diet?",
  "What is the paleo diet?",
  "How do I handle food allergies when dining out?",
  "Can you recommend a restaurant for a gluten-free diet?",
];

export default function Assistant() {
  const colors = useThemeColors();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi there! I'm your DineOutBuddy AI assistant. I can answer questions about diets, food allergies, and help you find suitable restaurants. What would you like to know?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  // Create styles with the current theme colors
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleSend = () => {
    if (inputText.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Simulate AI response time
    setTimeout(() => {
      const botResponse = generateResponse(inputText.toLowerCase());
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateResponse = (input: string): string => {
    // Very simple pattern matching for demo purposes
    if (input.includes("hello") || input.includes("hi ") || input.includes("hey")) {
      return sampleResponses.hello;
    } else if (input.includes("gluten")) {
      return sampleResponses.gluten;
    } else if (input.includes("vegan")) {
      return sampleResponses.vegan;
    } else if (input.includes("keto")) {
      return sampleResponses.keto;
    } else if (input.includes("paleo")) {
      return sampleResponses.paleo;
    } else if (
      input.includes("allergy") ||
      input.includes("allergic") ||
      input.includes("allergen")
    ) {
      return sampleResponses.allergy;
    } else {
      return "I don't have specific information about that yet. In a real app, I would connect to an AI service like OpenAI to provide you with accurate answers to your food and dining questions.";
    }
  };

  const handleQuestionSuggestion = (question: string) => {
    setInputText(question);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Food Assistant</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.sender === "user"
                  ? styles.userBubble
                  : styles.assistantBubble,
              ]}
            >
              {item.sender === "assistant" && (
                <View style={[styles.assistantIcon, { backgroundColor: colors.primary }]}>
                  <FontAwesome name="cutlery" size={14} color={colors.card} />
                </View>
              )}
              <View
                style={[
                  styles.messageContent,
                  item.sender === "user"
                    ? [styles.userMessageContent, { backgroundColor: colors.primary }]
                    : [styles.assistantMessageContent, { backgroundColor: colors.card, borderColor: colors.border }],
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    item.sender === "user"
                      ? [styles.userMessageText, { color: colors.card }]
                      : [styles.assistantMessageText, { color: colors.text }],
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {isTyping && (
          <View style={styles.typingIndicator}>
            <View style={[styles.assistantIconSmall, { backgroundColor: colors.primary }]}>
              <FontAwesome name="cutlery" size={10} color={colors.card} />
            </View>
            <Text style={styles.typingText}>Assistant is typing</Text>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}

        {messages.length === 1 && (
          <View style={styles.suggestionsContainer}>
            <Text style={[styles.suggestionsTitle, { color: colors.text }]}>
              Suggested questions:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {suggestedQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.suggestionBubble, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => handleQuestionSuggestion(question)}
                >
                  <Text style={[styles.suggestionText, { color: colors.text }]}>{question}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.border }]}
            placeholder="Ask me about food, diets, or restaurants..."
            placeholderTextColor={colors.text === "#F0F0F0" ? "#999" : "#aaa"}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim() ? colors.primary : colors.border },
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <MaterialIcons
              name="send"
              size={24}
              color={!inputText.trim() ? "#ccc" : colors.card}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  messageBubble: {
    marginBottom: 12,
    maxWidth: "80%",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  userBubble: {
    alignSelf: "flex-end",
  },
  assistantBubble: {
    alignSelf: "flex-start",
  },
  assistantIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  messageContent: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userMessageContent: {
    
  },
  assistantMessageContent: {
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    
  },
  assistantMessageText: {
    
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 10,
  },
  assistantIconSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  typingText: {
    fontSize: 14,
    color: "#777",
    marginRight: 8,
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  suggestionBubble: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
  },
}); 