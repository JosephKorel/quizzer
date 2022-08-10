import React, { useContext, useEffect, useState } from "react";
import {
  FlatList,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppContext, Questions } from "../Context";
import { collection, DocumentData, getDocs, query } from "firebase/firestore";
import { auth, db } from "../firebase_config";
import moment from "moment";
import tw from "../Components/tailwind_config";
import { BottomNav, Translate } from "../Components/nativeBase_Components";
import { MaterialIcons } from "@expo/vector-icons";
import { PresenceTransition } from "native-base";
import { MyQuestionComponent } from "../Components/custom_components";

function MyQuestions() {
  const { colorScheme, toggleColorScheme } = useContext(AppContext);
  const [questions, setQuestions] = useState<Questions[] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [index, setIndex] = useState(0);

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

  const QuestionList = ({
    item,
    i,
  }: {
    item: Questions;
    i: number;
  }): JSX.Element => {
    return (
      <View style={tw.style("mt-4")}>
        <TouchableOpacity
          style={tw.style("bg-persian")}
          onPress={() => {
            setIndex(i);
            setShowModal(true);
          }}
        >
          <Text
            style={tw.style(
              "text-lg italic p-2 bg-sun text-stone-800 text-center font-bold",
              Translate.smallTranslate
            )}
          >
            {item.question}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const MyQuestionsModal = (): JSX.Element => {
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
          <View
            style={tw.style(
              "relative z-10 h-2/3 w-[96%] min-h-2/3 min-w-[96%] bg-sun dark:bg-violet rounded-md flex-col overflow-hidden"
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
                color={colorScheme === "light" ? "black" : "white"}
                style={tw`p-2`}
              />
            </TouchableOpacity>
            <View style={tw`flex-1`}>
              {<MyQuestionComponent question={questions![index]} />}
            </View>
          </View>
        </PresenceTransition>
      </TouchableOpacity>
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
            <MaterialIcons
              name="wb-sunny"
              size={24}
              color="#F72585"
              onPress={() => toggleColorScheme()}
            />
          ) : (
            <MaterialIcons
              name="nightlight-round"
              size={24}
              color="#0d0f47"
              onPress={() => toggleColorScheme()}
            />
          )}
        </View>
        <View style={tw.style("h-full flex-col justify-center")}>
          <View style={tw.style("h-5/6")}>
            <View
              style={tw.style("border-l-8 border-b-8 rounded-lg bg-sun mt-4")}
            >
              <Text
                style={tw.style(
                  "text-2xl italic p-4 bg-persian text-slate-100 text-center font-bold",
                  Translate.translate
                )}
              >
                Minhas perguntas
              </Text>
            </View>
            <FlatList
              data={questions}
              renderItem={({ item, index }) => (
                <QuestionList item={item} i={index} />
              )}
            />
          </View>
        </View>
      </View>
      {showModal && <MyQuestionsModal />}
      <BottomNav />
    </View>
  );
}

export default MyQuestions;
