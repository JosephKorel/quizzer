import React, { useContext, useEffect, useState } from "react";
import {
  FlatList,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { propsStack } from "./RootStackParams";
import { AppContext, Questions, UserInt } from "../Context";
import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query,
} from "firebase/firestore";
import { auth, db } from "../firebase_config";
import moment from "moment";
import tw from "../Components/tailwind_config";
import {
  AlertComponent,
  BottomNav,
  DeleteDialog,
  Translate,
} from "../Components/nativeBase_Components";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Avatar } from "native-base";
import { signOut } from "firebase/auth";
import { UserListModal } from "../Components/custom_components";

function Profile() {
  const { user, colorScheme, toggleColorScheme } = useContext(AppContext);
  const [questions, setQuestions] = useState<Questions[] | null>(null);
  const [answCount, setAnswCount] = useState(0);
  const [show, setShow] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [myProf, setMyProf] = useState<UserInt>();
  const [showModal, setShowModal] = useState(false);
  const [group, setGroup] = useState<UserInt[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 2000);
  }, [error, success]);

  const navigation = useNavigation<propsStack>();

  const retrieveCollection = async () => {
    //Array que recebe cada documento
    let questionDocs: Questions[] = [];
    let myAnswers: number = 0;

    //Query do usuário
    const docRef = doc(db, "users", user?.uid!);
    const docSnap = await getDoc(docRef);
    const userData = docSnap.data() as UserInt;

    //Query da coleção
    const questionCol = collection(db, "questionsdb");
    const colQuery = query(questionCol);
    const querySnapshot = await getDocs(colQuery);
    querySnapshot.forEach((doc: DocumentData) => questionDocs.push(doc.data()));

    //Filtra apenas as minhas perguntas
    const myQuestions = questionDocs.filter(
      (item) => item.author.uid === auth.currentUser?.uid
    );

    questionDocs.forEach((item) => {
      item.hasVoted.includes(user?.uid!) && (myAnswers += 1);
    });

    //Sort pelas mais recentes
    myQuestions.sort((a, b) => {
      if (moment(a.date, "DD/MM/YYYY") > moment(b.date, "DD/MM/YYYY"))
        return -1;
      else return 1;
    });

    setMyProf(userData);
    setQuestions(myQuestions);
    setAnswCount(myAnswers);
  };

  useEffect(() => {
    retrieveCollection();
  }, []);

  const logOut = () => {
    signOut(auth).then(() => {
      navigation.navigate("Login");
    });
  };

  const deleteQuestion = async (id: string): Promise<void> => {
    const docRef = doc(db, "questionsdb", id);

    try {
      await deleteDoc(docRef);
      setSuccess("Pergunta excluída");
      retrieveCollection();
    } catch (error) {
      setError("Houve algum erro, tente novamente");
      console.log(error);
    }
  };

  const userList = ({ item }: { item: UserInt }) => {
    return (
      <TouchableOpacity
        style={tw.style(
          "flex-row items-center p-1 bg-slate-100 rounded-md mt-2"
        )}
        onPress={() =>
          navigation.navigate("UsersProfile", {
            name: item.name!,
            userUid: item.uid,
            avatar: item.avatar!,
          })
        }
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

  const MyQuestionList = ({ item }: { item: Questions }) => {
    return (
      <View
        style={tw.style("mt-4 bg-black dark:bg-persian", !show && "hidden")}
      >
        <TouchableOpacity
          style={tw.style(
            "bg-sun p-2 flex-row justify-between items-center",
            Translate.smallTranslate
          )}
        >
          <Text
            style={tw.style(
              "text-base italic text-stone-700 font-bold w-11/12"
            )}
          >
            {item.question}
          </Text>
          <DeleteDialog deleteQuestion={deleteQuestion} id={item.id} />
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
      <View style={tw`w-[98%] mx-auto`}>
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
        <View style={tw`h-full flex-col justify-center w-[96%] mx-auto`}>
          <View style={tw`h-5/6`}>
            <View style={tw`flex-row justify-center`}>
              <Avatar
                source={{ uri: user?.avatar ? user.avatar : undefined }}
                size="xl"
              />
              <TouchableOpacity
                style={tw`absolute w-full flex-row-reverse`}
                onPress={logOut}
              >
                <MaterialCommunityIcons
                  name="logout"
                  size={30}
                  color="#e71d36"
                />
              </TouchableOpacity>
            </View>
            <View
              style={tw.style("border-l-8 border-b-8 rounded-lg bg-sun mt-4")}
            >
              <Text
                style={tw.style(
                  "text-2xl italic p-4 bg-persian text-slate-50 text-center font-bold",
                  Translate.translate
                )}
              >
                {auth.currentUser?.displayName?.toUpperCase()}
              </Text>
            </View>
            <View style={tw.style("flex-row justify-around items-center mt-4")}>
              <TouchableOpacity
                style={tw.style("bg-black dark:bg-persian w-[44%]")}
                onPress={() => {
                  setShowModal(true);
                  setGroup(myProf?.following!);
                }}
              >
                <Text
                  style={tw.style(
                    "text-lg  italic p-2 text-stone-700 text-center font-bold bg-sun",
                    Translate.smallTranslate
                  )}
                >
                  SEGUINDO: {myProf?.following.length}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw.style("bg-black dark:bg-persian  w-[44%]")}
                onPress={() => {
                  setShowModal(true);
                  setGroup(myProf?.followers!);
                }}
              >
                <Text
                  style={tw.style(
                    "text-lg italic p-2 bg-violet text-stone-100 text-center font-bold",
                    Translate.smallTranslate
                  )}
                >
                  SEGUIDORES: {myProf?.followers.length}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={tw.style("flex-row justify-around items-center mt-4")}>
              <TouchableOpacity
                style={tw.style("bg-black dark:bg-persian w-[44%]")}
                onPress={() => {
                  setShow(!show);
                }}
              >
                <Text
                  style={tw.style(
                    "text-lg italic p-2 bg-violet text-stone-100 text-center font-bold",
                    Translate.smallTranslate
                  )}
                >
                  RESPOSTAS: {answCount}
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
                  PERGUNTAS: {questions?.length}
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={tw.style("mt-10 h-1/2", {
                overflow: "visible",
              })}
            >
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
              <View
                style={tw.style(
                  "h-11/12",

                  !show && "hidden"
                )}
              >
                <FlatList data={questions} renderItem={MyQuestionList} />
                {/* {questions?.map((question, index) => (
                  <View
                    key={index}
                    style={tw.style("mt-4 bg-persian", !show && "hidden")}
                  >
                    <TouchableOpacity
                      style={tw.style(
                        "bg-sun p-2 flex-row justify-between items-center",
                        Translate.smallTranslate
                      )}
                    >
                      <Text
                        style={tw.style(
                          "text-base italic text-stone-700 font-bold"
                        )}
                      >
                        {question.question}
                      </Text>
                      <DeleteDialog
                        deleteQuestion={deleteQuestion}
                        id={question.id}
                      />
                    </TouchableOpacity>
                  </View>
                ))} */}
              </View>
            </View>
          </View>
        </View>
      </View>
      {error !== "" && <AlertComponent success={success} error={error} />}
      {success !== "" && <AlertComponent success={success} error={error} />}
      {showModal && (
        <UserListModal props={{ group, userList, showModal, setShowModal }} />
      )}
      <BottomNav />
    </View>
  );
}

export default Profile;
