# DineOutBuddy Color Theme System

This directory contains constants used throughout the app, primarily the color theme system.

## Color Theming

The app uses a dynamic theming system that automatically adapts to the device's light/dark mode settings using React Native's `useColorScheme()` hook.

### How to Use Colors in Components

1. Import the `useThemeColors` hook:
   ```javascript
   import { useThemeColors } from './constants/colors';
   ```

2. Get the current theme colors:
   ```javascript
   const colors = useThemeColors();
   ```

3. Use colors in your styles:
   ```javascript
   // Inline style
   <Text style={{ color: colors.text }}>Hello World</Text>
   
   // StyleSheet with dynamic colors
   <View style={[styles.container, { backgroundColor: colors.background }]}>

   // For more complex components, use useMemo to create styles:
   const styles = useMemo(() => createStyles(colors), [colors]);
   ```

### Creating StyleSheets with Theme Colors

For better performance and type safety, use this pattern:

```javascript
// Type for theme colors
type ThemeColors = ReturnType<typeof useThemeColors>;

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  text: {
    color: colors.text,
  },
  // ...other styles
});

// In your component:
const colors = useThemeColors();
const styles = useMemo(() => createStyles(colors), [colors]);
```

### Available Colors

The theme includes the following colors:

#### Base Colors
- `primary`: Main app color (#4392F1 blue)
- `secondary`: Accent color
- `background`: Screen background
- `card`: Card/component background
- `text`: Primary text color
- `border`: Border color

#### Semantic Colors
- `success`: Success states (green)
- `warning`: Warning states (yellow)
- `danger`: Error/danger states (red)
- `info`: Information states (blue)
- `disabled`: Disabled elements (gray)

The exact color values will automatically adjust between light and dark themes. 