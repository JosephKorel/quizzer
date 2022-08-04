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
  user: null | UserInt;
  setUser: (data: UserInt) => void;
  scaleTxt: string[];
  setScaleTxt: (data: string[]) => void;
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
  scaleTxt: ["Meh", "Cool", "Amazing"],
  setScaleTxt: () => {},
  theme: "dark",
  setTheme: () => {},
  questions: null,
  setQuestions: () => {},
};

export const AppContext = createContext<ContextType>(initialValue);

export const AppContextProvider = ({ children }: Props) => {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<null | UserInt>(null);
  const [question, setQuestion] = useState("");
  const [scaleTxt, setScaleTxt] = useState(["Meh", "Cool", "Amazing"]);
  const [theme, setTheme] = useState("dark");
  const [questions, setQuestions] = useState<Questions[] | null>(null);

  return (
    <AppContext.Provider
      value={{
        isAuth,
        setIsAuth,
        user,
        setUser,
        scaleTxt,
        setScaleTxt,
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
