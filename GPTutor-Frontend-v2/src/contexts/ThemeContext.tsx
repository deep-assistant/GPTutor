import { createContext, useContext, ReactNode } from 'react';

interface ThemeContextType {
  isDarkTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children, isDarkTheme }: {
  children: ReactNode;
  isDarkTheme: boolean;
}) => {
  return (
    <ThemeContext.Provider value={{ isDarkTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
