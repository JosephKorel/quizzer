import {
  arrayUnion,
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query,
  updateDoc,
} from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../firebase_config";
import { useNavigation } from "@react-navigation/native";
import { propsStack } from "./RootStackParams";
import { Slider } from "@miblanchard/react-native-slider";
import { AppContext, Questions, UserInt } from "../Context";
import tw from "../Components/tailwind_config";
import { Avatar, IconButton } from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { AlertComponent, BottomNav } from "../Components/nativeBase_Components";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import {
  HomeQuestionComponent,
  QuestionComponent,
} from "../Components/questions_components";
import {
  LoadingComponent,
  LoadingScreen,
} from "../Components/custom_components";
import { onAuthStateChanged, User } from "firebase/auth";

function Home() {
  const {
    user,
    setUser,
    setIsAuth,
    theme,
    setTheme,
    questions,
    setQuestions,
    loading,
    setLoading,
  } = useContext(AppContext);
  const [feedQuestions, setFeedQuestions] = useState<Questions[] | null>(null);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const navigation = useNavigation<propsStack>();

  const getUser = async (authUser: User) => {
    //Query do usuário
    const docRef = doc(db, "users", authUser.uid);
    const docSnap = await getDoc(docRef);
    const userData = docSnap.data() as UserInt;

    //Array que recebe cada documento
    let questionDocs: Questions[] = [];

    //Query da coleção
    const questionCol = collection(db, "questionsdb");
    const colQuery = query(questionCol);
    const querySnapshot = await getDocs(colQuery);
    querySnapshot.forEach((doc: DocumentData) => questionDocs.push(doc.data()));

    //Pega as perguntas apenas de quem estou seguindo
    const showQuestions = questionDocs.filter((item) => {
      if (userData.following.some((obj) => item.author.uid === obj.uid)) {
        return true;
      }
    });

    //Sort pelo número de votos
    showQuestions.sort((a, b) => {
      if (a.views > b.views) return -1;
      else return 1;
    });

    //Sort pelas perguntas ainda não respondidas
    showQuestions.sort((a, b) => {
      if (a.hasVoted.includes(user?.uid!)) return 1;
      else return -1;
    });

    setFeedQuestions(showQuestions);
    setQuestions(questionDocs);
    setUser({
      name: authUser.displayName,
      uid: authUser.uid,
      avatar: authUser.photoURL,
      followers: userData.followers,
      following: userData.following,
    });
  };

  const retrieveCollection = async () => {
    //Array que recebe cada documento
    let questionDocs: Questions[] = [];

    //Query do usuário
    const docRef = doc(db, "users", user?.uid!);
    const docSnap = await getDoc(docRef);
    const userData = docSnap.data() as UserInt;

    //Query da coleção
    const questionCol = collection(db, "questionsdb");
    const colQuery = query(questionCol);
    const querySnapshot = await getDocs(colQuery);
    querySnapshot.forEach((doc: DocumentData) => questionDocs.push(doc.data()));

    //Pega as perguntas apenas de quem estou seguindo
    const showQuestions = questionDocs.filter((item) => {
      if (userData.following.some((obj) => item.author.uid === obj.uid)) {
        return true;
      }
    });

    //Sort pelo número de votos
    showQuestions.sort((a, b) => {
      if (a.views > b.views) return -1;
      else return 1;
    });

    //Sort pelas perguntas ainda não respondidas
    showQuestions.sort((a, b) => {
      if (a.hasVoted.includes(user?.uid!)) return 1;
      else return -1;
    });

    setFeedQuestions(showQuestions);
    setQuestions(questionDocs);
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        getUser(user);
        setIsAuth(true);
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } else {
        setIsAuth(false);
        navigation.navigate("Login");
      }
    });
  }, [onAuthStateChanged]);

  useEffect(() => {
    setTimeout(() => {
      setError("");
    }, 2000);
  }, [error]);

  useEffect(() => {
    setTimeout(() => {
      setIsUpdating(false);
    }, 500);
  }, [isUpdating]);

  type Context = {
    translateX: number;
    translateY: number;
  };

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const GestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    Context
  >({
    onStart: (event, context) => {},
    onActive: ({ translationX, translationY, x }) => {
      translateX.value = translationX;
      translateY.value = translationY;
      opacity.value = 1 - Math.abs(translationX) / 250;
    },
  });

  const HomeQuestions = ({ item }: { item: Questions }) => {
    return (
      <View>
        <View style={tw.style("text-center")}>
          <View style={tw`flex flex-col items-center`}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("UsersProfile", {
                  name: item.author.name,
                  userUid: item.author.uid,
                  avatar: item.author.avatar,
                })
              }
            >
              <Avatar
                source={{
                  uri: item.author.avatar,
                }}
              />
            </TouchableOpacity>
            <Text style={tw`text-slate-300 text-base`}>{item.author.name}</Text>
          </View>
        </View>
        <HomeQuestionComponent
          item={item}
          filter={questions!}
          setFilter={setQuestions}
        />
        <View
          style={tw`w-full mt-2 mb-5 p-[1px] bg-slate-300 rounded-br-lg rounded-tl-lg`}
        ></View>
      </View>
    );
  };

  return (
    <View
      style={tw.style(
        theme === "light" ? "bg-red-200" : "bg-dark",
        "w-full h-full"
      )}
    >
      {isUpdating && <LoadingComponent />}
      {loading && <LoadingScreen />}
      <View style={tw`w-[98%] mx-auto`}>
        <View
          style={tw`absolute top-10 flex-row w-full justify-between items-center z-10`}
        >
          {theme === "dark" ? (
            <TouchableOpacity
              onPress={() => setTheme("light")}
              style={tw.style("rounded-full")}
            >
              <MaterialIcons name="wb-sunny" size={24} color="#F72585" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setTheme("dark")}
              style={tw.style("rounded-full")}
            >
              <MaterialIcons
                name="nightlight-round"
                size={24}
                color="#0d0f47"
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => {
              setIsUpdating(true);
              retrieveCollection();
            }}
            style={tw.style("rounded-full")}
          >
            <MaterialIcons name="refresh" size={24} color="#2ecfc0" />
          </TouchableOpacity>
        </View>
        <StatusBar
          barStyle={theme === "light" ? "dark-content" : "light-content"}
          backgroundColor={theme === "light" ? "#fecaca" : "#0D0F47"}
        />
        <View style={tw.style("h-full flex-col justify-center")}>
          <View style={tw.style("h-5/6")}>
            <FlatList data={feedQuestions} renderItem={HomeQuestions} />
          </View>
        </View>
      </View>
      {error !== "" && <AlertComponent success={""} error={error} />}
      <BottomNav />
    </View>
  );
}

export default Home;

/* {questions?.length ? (
            <GestureHandlerRootView>
              <PanGestureHandler onGestureEvent={GestureHandler}>
                <Animated.View style={rStyle}>
                  <View
                    style={
                      (tw.style(""),
                      {
                        transform: [{ translateY: 80 }],
                      })
                    }
                  >
                    <View style={tw.style("text-center")}>
                      <View style={tw`flex flex-col items-center`}>
                        <Avatar
                          source={{
                            uri: user?.avatar ? user.avatar : undefined,
                          }}
                          style={rStyle}
                        />

                        <Text style={tw`text-slate-300 text-base`}>
                          {questions[index].author.name}
                        </Text>
                      </View>
                      <View
                        style={tw`mt-6 flex flex-row justify-between items-center`}
                      >
                        <View
                          style={tw`w-[46%] p-[2px] bg-[#B9FAF8] rounded-br-lg rounded-tl-lg`}
                        ></View>
                        <View
                          style={tailwind`w-[46%] p-[2px] bg-[#B9FAF8]  rounded-bl-lg rounded-tr-lg`}
                        ></View>
                      </View>
                    </View>
                    <View style={tailwind``}>{qstComponent(index)}</View>
                  </View>
                </Animated.View>
              </PanGestureHandler>
            </GestureHandlerRootView>
          ) : (
            <View></View>
          )} */
