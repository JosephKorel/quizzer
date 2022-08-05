import { useContext, useEffect, useState } from "react";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
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
import { LoadingScreen } from "../Components/custom_components";
import { AntDesign } from "@expo/vector-icons";

export default function Login() {
  const { setUser, setIsAuth, loading, setLoading } = useContext(AppContext);
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
      setLoading(true);
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
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

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
          const currUser = res.user;
          newUser(currUser.displayName!, currUser.uid, currUser.photoURL!);
        })
        .catch((err) => {
          setIsAuth(false);
          console.log(err);
        });
    }
  }, [response]);

  return (
    <>
      {loading ? (
        <LoadingScreen />
      ) : (
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
          <TouchableOpacity
            onPress={() => promptAsync()}
            style={tw.style("bg-turquoise mt-20")}
          >
            <View
              style={tw.style(
                "bg-violet p-3 flex-row items-center",
                Translate.smallTranslate
              )}
            >
              <AntDesign
                name="google"
                size={24}
                color="white"
                style={tw.style("mr-2")}
              />
              <Text style={tw.style("text-slate-100 text-xl font-bold")}>
                ENTRAR COM O GOOGLE
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}
