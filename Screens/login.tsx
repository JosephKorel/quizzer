import { useContext, useEffect } from "react";
import { StatusBar, Text, View } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
} from "firebase/auth";
import { auth, db } from "../firebase_config";
import { AppContext, UserInt } from "../Context";
import { useNavigation } from "@react-navigation/native";
import { propsStack } from "./RootStackParams";
import tw from "../Components/tailwind_config";
import { Button } from "native-base";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Translate } from "../Components/nativeBase_Components";

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
      const data = docSnap.data() as UserInt;
      setIsAuth(true);
      setUser({
        name,
        uid,
        avatar,
        followers: data.followers,
        following: data.following,
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
          const currUser = res.user;
          newUser(currUser.displayName!, currUser.uid, currUser.photoURL!);
          navigation.navigate("Home");
        })
        .catch((err) => {
          setIsAuth(false);
          console.log(err);
        });
    }
  }, [response]);

  return (
    <View
      style={tw`absolute top-0 w-full text-center flex flex-col justify-center items-center bg-dark h-full`}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0D0F47" />
      <Text
        style={tw.style(
          "tracking-widest absolute top-1/4 text-6xl text-center text-persian font-bold"
        )}
      >
        QUI
        <Text style={tw.style("italic text-6xl")}>ZZ</Text>
        ER
      </Text>
      <Text
        style={tw.style(
          "tracking-widest absolute top-1/4 text-6xl text-center text-emerald font-bold",
          Translate.translate
        )}
      >
        QUI
        <Text style={tw.style("italic text-6xl")}>ZZ</Text>
        ER
      </Text>
      <Text
        style={tw.style(
          "tracking-widest absolute top-1/4 text-6xl text-center text-violet font-bold",
          Translate.smallTranslate
        )}
      >
        QUI
        <Text style={tw.style("italic text-6xl")}>ZZ</Text>
        ER
      </Text>
      <Button onPress={() => promptAsync()} colorScheme="indigo">
        ENTRAR COM O GOOGLE
      </Button>
      <Text
        style={tw.style(
          "text-7xl text-emerald font-bold absolute top-1/6 right-10"
        )}
      >
        ?
      </Text>
      <Text
        style={tw.style(
          "text-8xl text-emerald font-bold absolute top-1/3 left-10"
        )}
      >
        ?
      </Text>
    </View>
  );
}
