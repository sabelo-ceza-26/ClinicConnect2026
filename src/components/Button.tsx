import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'text';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) => {
  const { theme } = useTheme();

  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  const containerStyle: ViewStyle = {
    backgroundColor: isPrimary
      ? theme.colors.primary
      : 'transparent',
    borderWidth: isOutline ? 1 : 0,
    borderColor: isOutline ? theme.colors.primary : 'transparent',
    opacity: disabled ? 0.5 : 1,
  };

  const textColor = isPrimary
    ? '#FFFFFF'
    : isOutline
    ? theme.colors.primary
    : theme.colors.primary;

  return (
    <TouchableOpacity
      style={[styles.button, containerStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#FFFFFF' : theme.colors.primary} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
});
