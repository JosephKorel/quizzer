import React, { useContext, useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { propsStack } from "./RootStackParams";
import { AppContext, Questions } from "../Context";
import {
  collection,
  doc,
  DocumentData,
  getDocs,
  query,
  setDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "../firebase_config";
import * as ImagePicker from "expo-image-picker";
import moment from "moment";
import tailwind from "twrnc";
import { BottomNav, QuestionModal } from "../Components/bottom_nav";
import { MaterialIcons } from "@expo/vector-icons";
import {
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

function MyQuestions() {
  const { user, light, setLight } = useContext(AppContext);
  const [questions, setQuestions] = useState<Questions[] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [qstIndex, setQstIndex] = useState(0);

  const retrieveCollection = async () => {
    //Array que recebe cada documento
    let questionDocs: Questions[] = [];

    //Query da coleção
    const questionCol = collection(db, "questionsdb");
    const colQuery = query(questionCol);
    const querySnapshot = await getDocs(colQuery);
    querySnapshot.forEach((doc: DocumentData) => questionDocs.push(doc.data()));

    //Filtra apenas as minhas perguntas
    const myQuestions = questionDocs.filter(
      (item) => item.author.uid === auth.currentUser?.uid
    );

    //Sort pelas mais recentes
    myQuestions.sort((a, b) => {
      if (moment(a.date, "DD/MM/YYYY") > moment(b.date, "DD/MM/YYYY"))
        return -1;
      else return 1;
    });

    setQuestions(myQuestions);
  };

  useEffect(() => {
    retrieveCollection();
  }, []);

  const MyQstStyles = StyleSheet.create({
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
        light ? "bg-red-200" : "bg-[#0d0f47]",
        "w-full",
        "h-full"
      )}
    >
      <View style={tailwind`w-11/12 mx-auto`}>
        <View style={tailwind`absolute top-10`}>
          {!light ? (
            <MaterialIcons
              name="wb-sunny"
              size={24}
              color="#F72585"
              onPress={() => setLight(true)}
            />
          ) : (
            <MaterialIcons
              name="nightlight-round"
              size={24}
              color="#0d0f47"
              onPress={() => setLight(false)}
            />
          )}
        </View>

        <View
          style={tailwind.style(
            "border-l-8 border-b-8 rounded-lg bg-[#fdc500] mt-24"
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
              MyQstStyles.translate
            )}
          >
            Minhas perguntas
          </Text>
        </View>
        {questions?.map((question, index) => (
          <View key={index} style={tailwind.style("mt-4")}>
            <TouchableOpacity
              style={tailwind.style("bg-[#f72585]")}
              onPress={() => {
                setQstIndex(index);
                setShowModal(true);
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
                  MyQstStyles.smallTranslate
                )}
              >
                {question.question}
              </Text>
            </TouchableOpacity>
            <QuestionModal
              props={{ showModal, setShowModal }}
              question={questions[qstIndex]}
            />
          </View>
        ))}
      </View>

      <BottomNav />
    </View>
  );
}

export default MyQuestions;
