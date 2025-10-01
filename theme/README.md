# Theme System

This app uses a centralized theme system that provides consistent styling across all components.

## Usage

### Accessing Theme in Components

```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

function MyComponent() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.palette.background.default }]}>
      <Text style={[styles.title, { color: theme.palette.text.primary }]}>
        Hello World
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
```

### Using Theme with Dynamic Styles

```javascript
import { useTheme } from '../theme';

function MyComponent() {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.palette.background.paper,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.md,
    },
    text: {
      color: theme.palette.text.primary,
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.medium,
    },
    button: {
      backgroundColor: theme.palette.primary.main,
      padding: theme.spacing.md,
      borderRadius: theme.components.button.borderRadius,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Themed Component</Text>
    </View>
  );
}
```

## Theme Structure

### Palette
- **primary**: Main brand color
- **secondary**: Secondary brand color
- **error**: Error states
- **warning**: Warning states
- **info**: Informational states
- **success**: Success states
- **background**: Background colors (default, paper, elevated)
- **text**: Text colors (primary, secondary, disabled, hint)

### Typography
- **fontFamily**: Font families
- **fontSize**: Font sizes (xs, sm, base, md, lg, xl, xxl, xxxl)
- **fontWeight**: Font weights (light, regular, medium, semibold, bold)
- **lineHeight**: Line heights (tight, normal, relaxed)

### Spacing
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **xxl**: 48px

### Border Radius
- **none**: 0
- **sm**: 4px
- **md**: 8px
- **lg**: 12px
- **xl**: 16px
- **full**: 9999px

### Shadows
- **none**: No shadow
- **sm**: Small shadow
- **md**: Medium shadow
- **lg**: Large shadow
- **xl**: Extra large shadow

### Components
Pre-configured styles for common components:
- **button**: Button styles
- **input**: Input field styles
- **card**: Card styles

## Customizing the Theme

Edit `/theme/darkTheme.js` to customize colors, spacing, typography, and other theme values.

```javascript
// Example: Change primary color
palette: {
  primary: {
    main: '#FF6B6B',  // Change to red
    light: '#FF9999',
    dark: '#CC5555',
    contrastText: '#FFFFFF',
  },
  // ... rest of palette
}
```

## Creating a Light Theme

Create a new file `/theme/lightTheme.js` and export it:

```javascript
const lightTheme = {
  mode: 'light',
  palette: {
    primary: {
      main: '#007AFF',
      // ...
    },
    background: {
      default: '#FFFFFF',
      paper: '#F5F5F5',
      elevated: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
      // ...
    },
    // ... rest of palette
  },
  // ... rest of theme
};

export default lightTheme;
```

Then use it in App.js:

```javascript
import { ThemeProvider } from './theme';
import lightTheme from './theme/lightTheme';

<ThemeProvider theme={lightTheme}>
  {/* Your app */}
</ThemeProvider>
```
