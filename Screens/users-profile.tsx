import React, { useContext, useEffect, useState } from "react";
import {
  FlatList,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { propsStack, RootStackParamList } from "./RootStackParams";
import { AppContext, Questions, UserInt } from "../Context";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase_config";
import tw from "../Components/tailwind_config";
import { BottomNav, Translate } from "../Components/nativeBase_Components";
import { MaterialIcons } from "@expo/vector-icons";
import { Avatar } from "native-base";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  CustomQuestionModal,
  UserListModal,
} from "../Components/custom_components";
import { QuestionComponent } from "../Components/questions_components";

type ScreenProps = NativeStackScreenProps<RootStackParamList, "UsersProfile">;

const UsersProfile = ({ route }: ScreenProps) => {
  const { user, colorScheme, toggleColorScheme, questions } =
    useContext(AppContext);
  const [userQuestions, setUserQuestions] = useState<Questions[]>([]);
  const [currUser, setCurrUser] = useState<UserInt | null>(null);
  const [answers, setAnswers] = useState(0);
  const [show, setShow] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showQst, setShowQst] = useState(false);
  const [group, setGroup] = useState<UserInt[]>([]);
  const [index, setIndex] = useState(0);

  const navigation = useNavigation<propsStack>();

  const { name, userUid, avatar } = route.params;

  const getTargetUser = async (uid: string) => {
    //Número de respostas
    let totalAnswers: number = 0;

    //Query do doc
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    const userData = docSnap.data() as UserInt;

    //Filtra as perguntas do usuário
    const targetUserQuestions = questions?.filter(
      (item) => item.author.uid === userUid
    );

    //Quantidade de perguntas já respondidas
    questions?.forEach((item) => {
      item.hasVoted.includes(userUid) && (totalAnswers += 1);
    });
    targetUserQuestions?.length && setUserQuestions(targetUserQuestions);
    setAnswers(totalAnswers);
    setCurrUser(userData);
  };

  useEffect(() => {
    getTargetUser(userUid);
  }, []);

  //Checa se está seguindo
  const isFollowing = currUser?.followers.filter(
    (item) => item.uid === user?.uid
  ).length
    ? true
    : false;

  const goToProfile = async (item: UserInt) => {
    if (item.uid === user?.uid) {
      navigation.navigate("Profile");
      setShowModal(false);
    } else {
      navigation.navigate("UsersProfile", {
        name: item.name!,
        userUid: item.uid,
        avatar: item.avatar!,
      });
      await getTargetUser(item.uid);
      setShowModal(false);
    }
  };

  const userList = ({ item }: { item: UserInt }) => {
    return (
      <TouchableOpacity
        style={tw.style(
          "flex-row items-center p-1 bg-slate-100 rounded-md mt-2"
        )}
        onPress={() => goToProfile(item)}
      >
        <Avatar source={{ uri: item.avatar! }} size="sm" />

        <Text
          style={tw.style("ml-2 flex-1 text-stone-800 text-base font-bold p-1")}
        >
          {item.name?.toUpperCase()}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleFollow = async () => {
    if (!isFollowing) {
      //Atualiza o documento do usuário sendo seguido
      const userDoc = doc(db, "users", currUser?.uid!);
      await updateDoc(userDoc, { followers: arrayUnion(user) });

      //Atualiza o documento do usuário atual
      const myDoc = doc(db, "users", user?.uid!);
      await updateDoc(myDoc, { following: arrayUnion(currUser) });

      //Atualizar o front
      getTargetUser(userUid);
    } else {
      //Atualiza o documento do usuário sendo seguido
      const userDoc = doc(db, "users", currUser?.uid!);
      const filter = currUser?.followers.filter(
        (item) => item.uid !== user!.uid
      );
      await updateDoc(userDoc, { followers: filter });

      //Atualiza o documento do usuário atual
      const myDoc = doc(db, "users", user?.uid!);
      const myFilter = user?.following.filter(
        (item) => item.uid !== currUser?.uid
      );
      await updateDoc(myDoc, { following: myFilter });

      //Atualizar o front
      getTargetUser(userUid);
    }
  };

  const QuestionList = ({
    item,
    i,
  }: {
    item: Questions;
    i: number;
  }): JSX.Element => {
    return (
      <View style={tw.style("mt-4 bg-black dark:bg-persian")}>
        <TouchableOpacity
          style={tw.style(
            "bg-sun p-2 flex-row justify-between items-center",
            Translate.smallTranslate
          )}
          onPress={() => {
            setIndex(i);
            setShowQst(true);
          }}
        >
          <Text
            style={tw.style("text-base italic text-stone-700 font-bold w-full")}
          >
            {item.question}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={tw.style("w-full h-full bg-red-200 dark:bg-dark")}>
      <StatusBar
        barStyle={colorScheme === "light" ? "dark-content" : "light-content"}
        backgroundColor={colorScheme === "light" ? "#fecaca" : "#0D0F47"}
      />
      <View style={tw`w-11/12 mx-auto`}>
        <View style={tw`absolute top-10`}>
          {colorScheme === "dark" ? (
            <TouchableOpacity
              style={tw.style("rounded-full")}
              onPress={() => toggleColorScheme()}
            >
              <MaterialIcons name="wb-sunny" size={24} color="#F72585" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={tw.style("rounded-full")}
              onPress={() => toggleColorScheme()}
            >
              <MaterialIcons
                name="nightlight-round"
                size={24}
                color="#0d0f47"
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={tw`h-full flex-col justify-center`}>
          <View style={tw.style("h-5/6 max-h-5/6")}>
            <View style={tw`self-center mt-4`}>
              <View style={tw`flex-row`}>
                <Avatar source={{ uri: avatar }} size="xl" />
              </View>
            </View>
            <View
              style={tw.style("border-l-8 border-b-8 rounded-lg bg-sun mt-4")}
            >
              <View
                style={tw.style(
                  "p-4 bg-persian flex-row items-center justify-between",
                  Translate.translate
                )}
              >
                <Text
                  style={tw.style(
                    "text-2xl italic text-slate-50 text-center font-bold"
                  )}
                >
                  {name.toUpperCase()}
                </Text>
                <TouchableOpacity onPress={handleFollow}>
                  <Text
                    style={tw.style(
                      "text-sm italic text-slate-50 border-b border-slate-50"
                    )}
                  >
                    {isFollowing ? "Deixar de seguir" : "Seguir"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={tw.style("flex-row justify-around items-center mt-4")}>
              <TouchableOpacity
                style={tw.style("bg-black dark:bg-persian w-[44%]")}
                onPress={() => {
                  setShowModal(true);
                  setGroup(currUser?.following!);
                }}
              >
                <Text
                  style={tw.style(
                    "text-lg  italic p-2 text-stone-700 text-center font-bold bg-sun",
                    Translate.smallTranslate
                  )}
                >
                  SEGUINDO: {currUser?.following.length}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw.style("bg-black dark:bg-persian  w-[44%]")}
                onPress={() => {
                  setShowModal(true);
                  setGroup(currUser?.followers!);
                }}
              >
                <Text
                  style={tw.style(
                    "text-lg italic p-2 bg-violet text-stone-100 text-center font-bold",
                    Translate.smallTranslate
                  )}
                >
                  SEGUIDORES: {currUser?.followers.length}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={tw.style("flex-row justify-around items-center mt-4")}>
              <TouchableOpacity
                style={tw.style("bg-black dark:bg-persian w-[44%]")}
              >
                <Text
                  style={tw.style(
                    "text-lg  italic p-2 text-slate-100 text-center font-bold bg-violet",
                    Translate.smallTranslate
                  )}
                >
                  RESPOSTAS: {answers}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw.style("bg-black dark:bg-persian w-[44%]")}
              >
                <Text
                  style={tw.style(
                    "text-lg italic p-2 bg-sun text-stone-700 text-center font-bold",
                    Translate.smallTranslate
                  )}
                >
                  PERGUNTAS: {userQuestions?.length}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={tw.style("mt-10")}>
              <TouchableOpacity
                style={tw.style("bg-black dark:bg-sun")}
                onPress={() => {
                  setShow(!show);
                }}
              >
                <Text
                  style={tw.style(
                    "text-lg italic p-2 bg-persian text-slate-100 text-center font-bold",
                    Translate.smallTranslate
                  )}
                >
                  VER PERGUNTAS
                </Text>
              </TouchableOpacity>
              <View style={tw.style("max-h-[60%]", !show && "hidden")}>
                <FlatList
                  data={userQuestions}
                  renderItem={({ item, index }) => (
                    <QuestionList item={item} i={index} />
                  )}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
      {showQst && (
        <CustomQuestionModal
          showQst={showQst}
          setShowQst={setShowQst}
          children={
            <QuestionComponent
              item={userQuestions[index]}
              filter={userQuestions}
              setFilter={setUserQuestions}
            />
          }
        />
      )}
      {showModal && (
        <UserListModal props={{ group, userList, showModal, setShowModal }} />
      )}
      <BottomNav />
    </View>
  );
};

export default UsersProfile;
