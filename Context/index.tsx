import { createContext, ReactNode, useState } from "react";

type Props = {
  children: ReactNode;
};

type user = {
  name: string | null;
  uid: string;
  avatar?: string | null;
};

type ContextType = {
  isAuth: boolean;
  setIsAuth: (data: boolean) => void;
  user: null | user;
  setUser: (data: user) => void;
};

const initialValue = {
  isAuth: false,
  setIsAuth: () => {},
  user: null,
  setUser: () => {},
};

export const AppContext = createContext<ContextType>(initialValue);

export const AppContextProvider = ({ children }: Props) => {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<null | user>(null);

  return (
    <AppContext.Provider value={{ isAuth, setIsAuth, user, setUser }}>
      {children}
    </AppContext.Provider>
  );
};
