import { createContext, useContext, useState, ReactNode } from 'react';

type EmailContextType = {
  userEmail: string;
  setUserEmail: (userEmail: string) => void;
};

const EmailContext = createContext<EmailContextType | undefined>(undefined);

export const EmailProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userEmail, setUserEmail] = useState("");

  return (
    <EmailContext.Provider value={{ userEmail, setUserEmail }}>
        {children}
    </EmailContext.Provider>
  );
};

export const useEmail = () => {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('useEmail must be used within an EmailProvider');
  }
  return context;
};
