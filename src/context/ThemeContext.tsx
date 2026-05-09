import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Theme {
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    success: string;
    border: string;
  };
}

const lightTheme: Theme = {
  colors: {
    primary: '#2E7D32',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#212121',
    textSecondary: '#757575',
    error: '#f44336',
    success: '#4caf50',
    border: '#E0E0E0',
  },
};

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = lightTheme;

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
