import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Snackbar } from '@vkontakte/vkui';

export interface SnackbarMessage {
  id: string;
  text: string;
  subtitle?: string;
  action?: string;
  mode?: 'default' | 'dark';
  duration?: number;
  onActionClick?: () => void;
}

interface SnackbarContextType {
  showSnackbar: (message: Omit<SnackbarMessage, 'id'>) => void;
  showSuccess: (text: string, subtitle?: string) => void;
  showError: (text: string, subtitle?: string) => void;
  showInfo: (text: string, subtitle?: string) => void;
}

const SnackbarContext = createContext<SnackbarContextType | null>(null);

interface SnackbarProviderProps {
  children: ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [snackbars, setSnackbars] = useState<SnackbarMessage[]>([]);

  const removeSnackbar = useCallback((id: string) => {
    setSnackbars(prev => prev.filter(snackbar => snackbar.id !== id));
  }, []);

  const showSnackbar = useCallback((message: Omit<SnackbarMessage, 'id'>) => {
    const id = `snackbar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const snackbarMessage: SnackbarMessage = {
      id,
      duration: 4000,
      ...message,
    };
    
    setSnackbars(prev => [...prev, snackbarMessage]);
  }, []);

  const showSuccess = useCallback((text: string, subtitle?: string) => {
    showSnackbar({
      text,
      subtitle,
    });
  }, [showSnackbar]); 

  const showError = useCallback((text: string, subtitle?: string) => {
    showSnackbar({
      text,
      subtitle,
      duration: 6000, // Ошибки показываем дольше
    });
  }, [showSnackbar]);

  const showInfo = useCallback((text: string, subtitle?: string) => {
    showSnackbar({
      text,
      subtitle,
    });
  }, [showSnackbar]);

  const contextValue: SnackbarContextType = {
    showSnackbar,
    showSuccess,
    showError,
    showInfo,
  };

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
      {snackbars.map((snackbar) => (
        <Snackbar
          key={snackbar.id}
          onClose={() => removeSnackbar(snackbar.id)}
          duration={snackbar.duration}
          mode={snackbar.mode}
          action={snackbar.action}
          onActionClick={snackbar.onActionClick}
          subtitle={snackbar.subtitle}
        >
          {snackbar.text}
        </Snackbar>
      ))}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};
