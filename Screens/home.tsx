import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";
import { db } from "../firebase_config";
import { useNavigation } from "@react-navigation/native";
import { propsStack } from "./RootStackPrams";
import { User } from "firebase/auth";

type Questions = {
  id: string;
  author: { name: string; uid: string };
  question: string;
  votes?: { yes: User[]; no: User[] };
  options?: { [item: string]: User[] };
  date: string;
};

function Home() {
  const [questions, setQuestions] = useState<Questions[] | null>(null);
  const [index, setIndex] = useState(0);

  const navigation = useNavigation<propsStack>();

  const retrieveCollection = async () => {
    //Array que recebe cada documento
    let questionDocs: Questions[] = [];

    //Query da coleção
    const questionCol = collection(db, "questionsdb");
    const colQuery = query(questionCol);
    const querySnapshot = await getDocs(colQuery);
    querySnapshot.forEach((doc: DocumentData) => questionDocs.push(doc.data()));
    setQuestions(questionDocs);
  };
  useEffect(() => {
    retrieveCollection();
  }, []);

  const qstComponent = (index: number) => {
    return questions ? (
      <View>
        <Text>
          Perguntado por {questions[index].author.name}, em{" "}
          {questions[index].date}
        </Text>
        <Text>{questions[index].question}</Text>
        <Text>Opções</Text>
        {questions[index].votes && (
          <View>
            <Text>Sim:{questions[index].votes?.yes.length}</Text>
            <Text>Não:{questions[index].votes?.no.length}</Text>
          </View>
        )}
        {questions[index].options && (
          <View>
            {Object.entries(questions[index].options!).map(([key, value]) => (
              <Text>
                {key}:{value.length}
              </Text>
            ))}
          </View>
        )}
      </View>
    ) : (
      <View></View>
    );
  };

  const nextQuestion = () => {
    const qstLen = questions?.length;
    index === qstLen! - 1 ? setIndex(0) : setIndex((prev) => prev + 1);
  };

  const prevQuestion = () => {
    index === 0 ? null : setIndex((prev) => prev - 1);
  };

  return (
    <View>
      <Text>Perguntas de hoje</Text>
      {questions && qstComponent(index)}
      <Button title="Anterior" onPress={prevQuestion}></Button>
      <Button title="Próxima" onPress={nextQuestion}></Button>
      <Button
        onPress={() => navigation.navigate("NewPost")}
        title="Perguntar"
      ></Button>
    </View>
  );
}

export default Home;
