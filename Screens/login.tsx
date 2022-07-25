import { useContext, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
} from "firebase/auth";
import { auth } from "../firebase_config";
import { AppContext } from "../Context";
import { useNavigation } from "@react-navigation/native";
import { propsStack } from "./RootStackParams";
import tailwind from "twrnc";
import { Button, FavouriteIcon, Icon } from "native-base";

export default function Login() {
  const { user, setUser, setIsAuth, isAuth } = useContext(AppContext);
  const navigation = useNavigation<propsStack>();
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId:
      "494904537547-jmd1np75cd9dab6cla7jculb9gketsre.apps.googleusercontent.com",
  });

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuth(true);
        setUser({
          name: user.displayName,
          uid: user.uid,
          avatar: user.photoURL,
        });
        navigation.navigate("Home");
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

      <Button
        onPress={() => promptAsync()}
        leftIcon={<Icon as={FavouriteIcon} name="Login" size="xl" />}
        colorScheme="indigo"
      >
        ENTRAR COM O GOOGLE
      </Button>
    </View>
  );
}
