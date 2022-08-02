import React, { useContext, useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { propsStack } from "./RootStackParams";
import { AppContext, Questions } from "../Context";
import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDocs,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "../firebase_config";
import * as ImagePicker from "expo-image-picker";
import moment from "moment";
import tailwind from "twrnc";
import {
  AlertComponent,
  BottomNav,
  DeleteDialog,
  QuestionModal,
} from "../Components/nativeBase_Components";
import { MaterialIcons } from "@expo/vector-icons";
import {
  Avatar,
  Box,
  Button,
  FormControl,
  Icon,
  IconButton,
  Input,
  Modal,
  PresenceTransition,
  TextArea,
  Toast,
  useToast,
} from "native-base";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import { signOut } from "firebase/auth";

function Profile() {
  const { user, theme, setTheme } = useContext(AppContext);
  const [questions, setQuestions] = useState<Questions[] | null>(null);
  const [answCount, setAnswCount] = useState(0);
  const [show, setShow] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

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

  const qstComponent = ({ item }: { item: Questions }) => {
    return questions ? (
      <View>
        <View>
          <Text>{item.question}</Text>
          {item.media && (
            <Image
              style={{ width: 100, height: 100 }}
              source={{ uri: item.media }}
            ></Image>
          )}
          <Text>Opções</Text>
          {item.votes && (
            <View>
              <TouchableOpacity>
                <Text>Sim:{item.votes?.yes.length}</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text>Não:{item.votes?.no.length}</Text>
              </TouchableOpacity>
            </View>
          )}
          {item.options && (
            <View>
              {Object.entries(item.options!).map(([key, value], i) => (
                <TouchableOpacity key={i}>
                  <Text>
                    {key}:{value.length}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {item.scale && <View></View>}
        </View>
        <View>
          {item.tags.map((tag, i) => (
            <Text key={i}>{tag}</Text>
          ))}
        </View>
      </View>
    ) : (
      <View></View>
    );
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

  const ProfileStyles = StyleSheet.create({
    main: {
      transform: [{ translateY: -5 }],
    },
    translate: {
      transform: [{ translateX: 4 }, { translateY: -4 }],
    },
    smallTranslate: {
      transform: [{ translateX: 2 }, { translateY: -2 }],
    },
  });
  return (
    <View
      style={tailwind.style(
        theme === "light" ? "bg-red-200" : "bg-[#0d0f47]",
        "w-full",
        "h-full"
      )}
    >
      <View style={tailwind`w-11/12 mx-auto`}>
        <View style={tailwind`absolute top-10`}>
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
        <View style={tailwind`self-center mt-24`}>
          <Avatar
            source={{ uri: user?.avatar ? user.avatar : undefined }}
            size="xl"
          />
        </View>
        <View
          style={tailwind.style(
            "border-l-8 border-b-8 rounded-lg bg-[#fdc500] mt-4"
          )}
        >
          <Text
            style={tailwind.style(
              "text-2xl",
              "italic",
              "p-4",
              "bg-[#f72585]",
              "text-slate-50",
              "text-center ",
              "font-bold",
              ProfileStyles.translate
            )}
          >
            {auth.currentUser?.displayName}
          </Text>
        </View>
        <View
          style={tailwind.style("flex-row justify-around items-center mt-4")}
        >
          <TouchableOpacity
            style={tailwind.style("bg-[#f72585]")}
            onPress={() => {
              setShow(!show);
            }}
          >
            <Text
              style={tailwind.style(
                "text-lg",
                "italic",
                "p-2",
                "bg-[#fad643]",
                "text-stone-700",
                "text-center ",
                "font-bold",
                ProfileStyles.smallTranslate
              )}
            >
              RESPOSTAS: {answCount}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tailwind.style("bg-[#05f2d2]")}
            onPress={() => {
              setShow(!show);
            }}
          >
            <Text
              style={tailwind.style(
                "text-lg",
                "italic",
                "p-2",
                "bg-[#6c00e0]",
                "text-stone-100",
                "text-center ",
                "font-bold",
                ProfileStyles.smallTranslate
              )}
            >
              PERGUNTAS FEITAS: {questions?.length}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={tailwind.style("mt-10")}>
          <TouchableOpacity
            style={tailwind.style("bg-[#fad643]")}
            onPress={() => {
              setShow(!show);
            }}
          >
            <Text
              style={tailwind.style(
                "text-lg",
                "italic",
                "p-2",
                "bg-[#f72585] ",
                "text-slate-100",
                "text-center ",
                "font-bold",
                ProfileStyles.smallTranslate
              )}
            >
              VER PERGUNTAS
            </Text>
          </TouchableOpacity>
          {questions?.map((question, index) => (
            <View
              key={index}
              style={tailwind.style("mt-4 bg-[#f72585]", !show && "hidden")}
            >
              <TouchableOpacity
                style={tailwind.style(
                  "bg-[#fad643] p-2 flex-row justify-between items-center",
                  ProfileStyles.smallTranslate
                )}
              >
                <Text
                  style={tailwind.style(
                    "text-base italic text-stone-700 font-bold w-11/12"
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
          ))}
        </View>
      </View>
      {error !== "" && <AlertComponent success={success} error={error} />}
      {success !== "" && <AlertComponent success={success} error={error} />}
      <BottomNav />
    </View>
  );
}

export default Profile;
