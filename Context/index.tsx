import { createContext, ReactNode, useState } from "react";

type Props = {
  children: ReactNode;
};

type user = {
  name: string | null;
  uid: string;
  avatar?: string | null;
};

export type Questions = {
  id: string;
  author: { name: string; uid: string };
  question: string;
  votes: {
    yes: { name: string | null }[];
    no: { name: string | null }[];
  } | null;
  options: { [item: string]: string[] } | null;
  scale: { name: string; value: number }[] | null;
  labels?: string[];
  media?: string;
  tags: string[];
  hasSpoiler: boolean;
  hasVoted: string[];
  views: number;
  date: string;
};

type ContextType = {
  isAuth: boolean;
  setIsAuth: (data: boolean) => void;
  user: null | user;
  setUser: (data: user) => void;
  scaleTxt: string[];
  setScaleTxt: (data: string[]) => void;
  light: boolean;
  setLight: (data: boolean) => void;
};

const initialValue = {
  isAuth: false,
  setIsAuth: () => {},
  user: null,
  setUser: () => {},
  scaleTxt: ["Meh", "Cool", "Amazing"],
  setScaleTxt: () => {},
  light: false,
  setLight: () => {},
};

export const AppContext = createContext<ContextType>(initialValue);

export const AppContextProvider = ({ children }: Props) => {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<null | user>(null);

  const [scaleTxt, setScaleTxt] = useState(["Meh", "Cool", "Amazing"]);
  const [light, setLight] = useState(false);

  return (
    <AppContext.Provider
      value={{
        isAuth,
        setIsAuth,
        user,
        setUser,
        scaleTxt,
        setScaleTxt,
        light,
        setLight,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
