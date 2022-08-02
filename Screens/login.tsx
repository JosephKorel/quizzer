import { useContext, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
} from "firebase/auth";
import { auth, db } from "../firebase_config";
import { AppContext } from "../Context";
import { useNavigation } from "@react-navigation/native";
import { propsStack } from "./RootStackParams";
import tailwind from "twrnc";
import { Button } from "native-base";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Login() {
  const { setUser, setIsAuth } = useContext(AppContext);
  const navigation = useNavigation<propsStack>();
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId:
      "494904537547-jmd1np75cd9dab6cla7jculb9gketsre.apps.googleusercontent.com",
  });

  const newUser = async (name: string, uid: string, avatar: string) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    //Se o usuário já tá cadastrado
    if (docSnap.exists()) {
      setIsAuth(true);
      setUser({
        name,
        uid,
        avatar,
      });
      navigation.navigate("Home");
    } else {
      const newDocument = { name, uid, avatar, followers: [], following: [] };

      await setDoc(docRef, newDocument);
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        newUser(user.displayName!, user.uid, user.photoURL!);
      }
    });
  }, [onAuthStateChanged]);

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((res) => {
          setIsAuth(true);
          setUser({
            name: res.user.displayName,
            uid: res.user.uid,
            avatar: res.user.photoURL,
          });
          navigation.navigate("Home");
          console.log("Success");
        })
        .catch((err) => {
          setIsAuth(false);
          console.log(err);
        });
    }
  }, [response]);

  return (
    <View
      style={tailwind`absolute top-0 w-full text-center flex flex-col justify-center items-center bg-[#2c3e6d] h-full`}
    >
      <StatusBar />
      <Text
        style={tailwind`absolute top-1/4 text-2xl text-center text-slate-50`}
      >
        Quizzer
      </Text>
      <Button onPress={() => promptAsync()} colorScheme="indigo">
        ENTRAR COM O GOOGLE
      </Button>
    </View>
  );
}
