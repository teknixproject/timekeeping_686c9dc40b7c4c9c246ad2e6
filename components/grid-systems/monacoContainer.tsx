"use client"

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";

// Định nghĩa kiểu dữ liệu cho Context
interface AppContextType {
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
  handleClick: () => void;
  computedValue: number;
}

// Tạo Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider Component
function AppProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log("Button clicked", count);
    setCount(count + 1);
  }, [count]);

  const computedValue = useMemo(() => count * 2, [count]);

  const value: AppContextType = {
    count,
    setCount,
    handleClick,
    computedValue,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom Hook để sử dụng Context
function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

const MonacoContainer = ({ children }: { children: ReactNode }) => {
  return <AppProvider>{children}</AppProvider>;
};

export default MonacoContainer;

export { AppProvider, useAppContext };
