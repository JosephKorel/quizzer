import { createContext, ReactNode, useState } from "react";

type Props = {
  children: ReactNode;
};

export interface BaseInfo {
  name: string;
  uid: string;
  avatar: string;
}

export interface UserInt {
  name: string | null;
  uid: string;
  avatar?: string | null;
  followers: UserInt[];
  following: UserInt[];
}

export type Questions = {
  id: string;
  author: { name: string; uid: string; avatar: string };
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
  user: null | UserInt;
  setUser: (data: UserInt) => void;
  loading: boolean;
  setLoading: (data: boolean) => void;
  theme: string;
  setTheme: (data: string) => void;
  questions: Questions[] | null;
  setQuestions: (data: Questions[]) => void;
};

const initialValue = {
  isAuth: false,
  setIsAuth: () => {},
  user: null,
  setUser: () => {},
  loading: true,
  setLoading: () => {},
  theme: "light",
  setTheme: () => {},
  questions: null,
  setQuestions: () => {},
};

export const AppContext = createContext<ContextType>(initialValue);

export const AppContextProvider = ({ children }: Props) => {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<null | UserInt>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");
  const [questions, setQuestions] = useState<Questions[] | null>(null);

  return (
    <AppContext.Provider
      value={{
        isAuth,
        setIsAuth,
        user,
        setUser,
        loading,
        setLoading,
        theme,
        setTheme,
        questions,
        setQuestions,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
