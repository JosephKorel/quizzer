import React, { useContext, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { propsStack, RootStackParamList } from "./RootStackParams";
import { AppContext, Questions, UserInt } from "../Context";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase_config";
import tw from "../Components/tailwind_config";
import {
  BottomNav,
  QuestionModal,
  Translate,
} from "../Components/nativeBase_Components";
import { MaterialIcons, SimpleLineIcons } from "@expo/vector-icons";
import { Avatar } from "native-base";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  CustomQuestionModal,
  UserListModal,
} from "../Components/custom_components";
import { QuestionComponent } from "../Components/questions_components";
import MyQuestions from "./my-questions";

type ScreenProps = NativeStackScreenProps<RootStackParamList, "UsersProfile">;

const UsersProfile = ({ route }: ScreenProps) => {
  const { user, theme, setTheme, questions } = useContext(AppContext);
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

  const handleFollow = async (
    uid: string,
    follows: boolean,
    target: UserInt
  ) => {
    if (!follows) {
      const userDoc = doc(db, "users", uid);
      await updateDoc(userDoc, { followers: arrayUnion(user) });

      //Atualizar o front
      getTargetUser(uid);
    } else {
      const userDoc = doc(db, "users", uid);
      const filter = target.followers.filter((item) => item.uid !== user!.uid);
      await updateDoc(userDoc, { followers: filter });

      //Atualizar o front
      getTargetUser(uid);
    }
  };

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
    const filter = item.followers.filter((item) => item.uid === user!.uid);
    const follows = filter.length ? true : false;

    return (
      <View style={tw.style("flex-row justify-around items-center mt-2")}>
        <Avatar source={{ uri: item.avatar! }} />
        <View style={tw.style("bg-persian w-full w-[70%]")}>
          <TouchableOpacity
            style={tw.style(
              "flex-row items-center bg-sun w-full",
              Translate.smallTranslate
            )}
            onPress={() => goToProfile(item)}
          >
            <Text
              style={tw.style("text-stone-700 text-lg font-semibold p-1 w-2/3")}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const userFollow = async () => {
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

  return (
    <View
      style={tw.style(
        theme === "light" ? "bg-red-200" : "bg-[#0d0f47]",
        "w-full",
        "h-full"
      )}
    >
      <View style={tw`w-11/12 mx-auto`}>
        <View style={tw`absolute top-10`}>
          {theme === "dark" ? (
            <MaterialIcons
              name="wb-sunny"
              size={24}
              color="#F72585"
              onPress={() => setTheme("light")}
            />
          ) : (
            <MaterialIcons
              name="nightlight-round"
              size={24}
              color="#0d0f47"
              onPress={() => setTheme("dark")}
            />
          )}
        </View>
        <View style={tw`self-center mt-24`}>
          <View style={tw`flex-row`}>
            <Avatar source={{ uri: avatar }} size="xl" />
          </View>
        </View>
        <View
          style={tw.style("border-l-8 border-b-8 rounded-lg bg-[#fdc500] mt-4")}
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
              {name}
            </Text>
            <TouchableOpacity onPress={userFollow}>
              <Text style={tw.style("text-base italic text-slate-50")}>
                {isFollowing ? "Deixar de seguir" : "Seguir"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={tw.style("flex-row justify-around items-center mt-4")}>
          <TouchableOpacity
            style={tw.style("bg-persian w-[44%]")}
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
            style={tw.style("bg-[#05f2d2]  w-[44%]")}
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
            style={tw.style("bg-turquoise w-[44%]")}
            onPress={() => {
              setShow(!show);
            }}
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
          <TouchableOpacity style={tw.style("bg-persian  w-[44%]")}>
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
            style={tw.style("bg-sun")}
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
          {userQuestions?.map((question, index) => (
            <View
              key={index}
              style={tw.style("mt-4 bg-persian", !show && "hidden")}
            >
              <TouchableOpacity
                style={tw.style(
                  "bg-sun p-2 flex-row justify-between items-center",
                  Translate.smallTranslate
                )}
                onPress={() => {
                  setIndex(index);
                  setShowQst(true);
                }}
              >
                <Text
                  style={tw.style(
                    "text-base italic text-stone-700 font-bold w-full"
                  )}
                >
                  {question.question}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
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
