import React, { useContext, useEffect, useState } from "react";
import { Button, FlatList, Text, TouchableOpacity, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { propsStack, RootStackParamList } from "./RootStackParams";
import { AppContext, BaseInfo, Questions, UserInt } from "../Context";
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
import { db } from "../firebase_config";
import tw from "../Components/tailwind_config";
import { BottomNav, Translate } from "../Components/nativeBase_Components";
import { MaterialIcons, SimpleLineIcons } from "@expo/vector-icons";
import { Avatar, PresenceTransition, useToken } from "native-base";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { UserListModal } from "../Components/custom_components";

type ScreenProps = NativeStackScreenProps<RootStackParamList, "UsersProfile">;

const UsersProfile = ({ route }: ScreenProps) => {
  const { user, theme, setTheme, questions } = useContext(AppContext);
  const [userQuestions, setUserQuestions] = useState<Questions[] | null>(null);
  const [currUser, setCurrUser] = useState<UserInt | null>(null);
  const [answers, setAnswers] = useState(0);
  const [show, setShow] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [group, setGroup] = useState<UserInt[]>([]);

  const navigation = useNavigation<propsStack>();

  const { name, userUid, avatar } = route.params;

  const retrieveCollection = async () => {
    //Array que recebe cada documento
    let questionDocs: Questions[] = [];
    let totalAnswers: number = 0;

    //Query da coleção
    const questionCol = collection(db, "questionsdb");
    const colQuery = query(questionCol);
    const querySnapshot = await getDocs(colQuery);
    querySnapshot.forEach((doc: DocumentData) => questionDocs.push(doc.data()));

    //Query do doc
    const docRef = doc(db, "users", userUid);
    const docSnap = await getDoc(docRef);
    const userData = docSnap.data() as UserInt;

    //Filtra as perguntas do usuário
    const myQuestions = questionDocs.filter(
      (item) => item.author.uid === userUid
    );

    //Quantidade de perguntas já respondidas
    questionDocs.forEach((item) => {
      item.hasVoted.includes(userUid) && (totalAnswers += 1);
    });

    //Checa se segue o usuário
    const follows = userData.followers.filter((item) => item.uid === user?.uid);

    follows.length && setIsFollowing(true);
    setUserQuestions(myQuestions);
    setAnswers(totalAnswers);
    setCurrUser(userData);
  };

  useEffect(() => {
    retrieveCollection();
  }, []);

  const handleFollow = async (
    uid: string,
    isFollowing: boolean,
    item: UserInt
  ) => {
    console.log(isFollowing);
    if (!isFollowing) {
      const userDoc = doc(db, "users", uid);
      await updateDoc(userDoc, { followers: arrayUnion(user) });

      //Atualizar o front
      /* getUsers() */
    } else {
      const userDoc = doc(db, "users", uid);
      const filter = item.followers.filter((item) => item.uid !== user!.uid);
      await updateDoc(userDoc, { followers: filter });

      //Atualizar o front
      /* getUsers() */
    }
  };

  const userList = ({ item }: { item: UserInt }) => {
    const filter = item.followers.filter((item) => item.uid === user!.uid);
    const isFollowing = filter.length ? true : false;

    return (
      <View style={tw.style("flex-row items-center mt-2")}>
        <Avatar source={{ uri: item.avatar! }} />
        <View style={tw.style("bg-persian w-full")}>
          <View
            style={tw.style(
              "flex-row items-center bg-sun w-full",
              Translate.smallTranslate
            )}
          >
            <Text
              style={tw.style("text-stone-700 text-lg font-semibold p-1 w-2/3")}
            >
              {item.name}
            </Text>
            <View
              style={tw.style("flex-row items-center justify-between w-1/6")}
            >
              <TouchableOpacity style={tw.style("")}>
                <MaterialCommunityIcons
                  name="guy-fawkes-mask"
                  size={24}
                  color="black"
                  style={tw.style("")}
                  onPress={() =>
                    navigation.navigate("UsersProfile", {
                      name: item.name!,
                      userUid: item.uid,
                      avatar: item.avatar!,
                    })
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity>
                {isFollowing ? (
                  <SimpleLineIcons
                    name="user-following"
                    size={24}
                    color="green"
                    onPress={() => handleFollow(item.uid, isFollowing, item)}
                  />
                ) : (
                  <SimpleLineIcons
                    name="user-follow"
                    size={24}
                    color="black"
                    onPress={() => handleFollow(item.uid, isFollowing, item)}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const MyModal = ({ group }: { group: UserInt[] }): JSX.Element => {
    return (
      <TouchableOpacity
        style={tw.style(
          "absolute top-0 w-full h-full flex-col justify-center items-center",
          { backgroundColor: "rgba(52, 52, 52, 0.8)" }
        )}
        onPress={() => setShowModal(false)}
      >
        <PresenceTransition
          visible={showModal}
          initial={{
            opacity: 0,
            scale: 0,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: {
              duration: 150,
            },
          }}
        >
          <TouchableOpacity
            style={tw.style(
              "relative z-10 h-2/3 w-5/6 min-h-2/3 min-w-5/6 bg-persian"
            )}
            onPress={() => setShowModal(true)}
            activeOpacity={1}
          >
            <TouchableOpacity
              style={tw.style("self-end")}
              onPress={() => setShowModal(false)}
            >
              <MaterialIcons
                name="close"
                size={24}
                color="black"
                style={tw`mr-2`}
              />
            </TouchableOpacity>
            <View>
              <FlatList data={group} renderItem={userList}></FlatList>
            </View>
          </TouchableOpacity>
        </PresenceTransition>
      </TouchableOpacity>
    );
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
            <TouchableOpacity>
              <Text>{isFollowing ? "SEGUINDO" : "SEGUIR"}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={tw.style("border-l-8 border-b-8 rounded-lg bg-[#fdc500] mt-4")}
        >
          <Text
            style={tw.style(
              "text-2xl italic p-4 text-slate-50 text-center font-bold bg-persian",
              Translate.translate
            )}
          >
            {name}
          </Text>
        </View>
        <View style={tw.style("flex-row justify-around items-center mt-4")}>
          <TouchableOpacity
            style={tw.style("bg-persian")}
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
            style={tw.style("bg-[#05f2d2]")}
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
            style={tw.style("bg-persian")}
            onPress={() => {
              setShow(!show);
            }}
          >
            <Text
              style={tw.style(
                "text-lg  italic p-2 text-stone-700 text-center font-bold bg-sun",
                Translate.smallTranslate
              )}
            >
              RESPOSTAS: {answers}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw.style("bg-[#05f2d2]")}
            onPress={() => {
              setShow(!show);
            }}
          >
            <Text
              style={tw.style(
                "text-lg",
                "italic",
                "p-2",
                "bg-[#6c00e0]",
                "text-stone-100",
                "text-center ",
                "font-bold",
                Translate.smallTranslate
              )}
            >
              PERGUNTAS FEITAS: {userQuestions?.length}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={tw.style("mt-10")}>
          <TouchableOpacity
            style={tw.style("bg-[#fad643]")}
            onPress={() => {
              setShow(!show);
            }}
          >
            <Text
              style={tw.style(
                "text-lg",
                "italic",
                "p-2",
                "bg-[#f72585] ",
                "text-slate-100",
                "text-center ",
                "font-bold",
                Translate.smallTranslate
              )}
            >
              VER PERGUNTAS
            </Text>
          </TouchableOpacity>
          {questions?.map((question, index) => (
            <View
              key={index}
              style={tw.style("mt-4 bg-[#f72585]", !show && "hidden")}
            >
              <TouchableOpacity
                style={tw.style(
                  "bg-[#fad643] p-2 flex-row justify-between items-center",
                  Translate.smallTranslate
                )}
              >
                <Text
                  style={tw.style(
                    "text-base italic text-stone-700 font-bold w-11/12"
                  )}
                >
                  {question.question}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
      {showModal && (
        <UserListModal props={{ group, userList, showModal, setShowModal }} />
      )}
      <BottomNav />
    </View>
  );
};

export default UsersProfile;
