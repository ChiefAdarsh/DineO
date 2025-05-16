import { useColorScheme } from 'react-native';

// Define theme colors
const Colors = {
  light: {
    primary: "#4392F1", // Main blue color
    secondary: "#FF6347", // For accent elements 
    background: "#F8F9FA",
    card: "#FFFFFF",
    text: "#333333",
    border: "#E8F1F9",
    notification: "#FF3B30",
    success: "#4CAF50",
    warning: "#FFD700",
    danger: "#FF3B30",
    info: "#0A84FF",
    disabled: "#CCCCCC",
    shadow: "#000000",
  },
  dark: {
    primary: "#4392F1", // Keep the blue consistent
    secondary: "#FF6347",
    background: "#121212",
    card: "#1E1E1E",
    text: "#F0F0F0",
    border: "#2C2C2C",
    notification: "#FF453A",
    success: "#32D74B",
    warning: "#FFD60A",
    danger: "#FF453A",
    info: "#0A84FF",
    disabled: "#666666",
    shadow: "#000000",
  },
};

// Function to get the current color scheme
export const useThemeColors = () => {
  const colorScheme = useColorScheme();
  return Colors[colorScheme] || Colors.light; // Default to light if undefined
};

// Export both schemes for direct access if needed
export const { light, dark } = Colors;

export default Colors; 