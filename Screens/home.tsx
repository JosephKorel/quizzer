import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Button, Image, Text, TouchableOpacity, View } from "react-native";
import { db } from "../firebase_config";
import { useNavigation } from "@react-navigation/native";
import { propsStack } from "./RootStackParams";
import { User } from "firebase/auth";
import { Slider } from "@miblanchard/react-native-slider";

type Questions = {
  id: string;
  author: { name: string; uid: string };
  question: string;
  votes: { yes: User[]; no: User[] } | null;
  options: { [item: string]: User[] } | null;
  scale: [] | null;
  media?: string;
  tags: string[];
  hasSpoiler: boolean;
  date: string;
};

function Home() {
  const [questions, setQuestions] = useState<Questions[] | null>(null);
  const [index, setIndex] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [scaleVal, setScaleVal] = useState<number | number[]>([]);

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

  const custom = (index: number | Array<number>) => {
    if (Array.isArray(index)) {
      if (index[0] < 0.2) return <Text>Meh</Text>;
      if (index[0] < 0.6) return <Text>Cool</Text>;
      if (index[0] > 0.6) return <Text>Awesome</Text>;
    }
  };
  const qstComponent = (index: number) => {
    return questions ? (
      <View>
        <Text>
          Perguntado por {questions[index].author.name}, em{" "}
          {questions[index].date}
        </Text>
        {questions[index].hasSpoiler === true && reveal === false ? (
          <View>
            <Text>
              Cuidado! Esta pergunta contém spoiler, tem certeza de que quer
              ver?
            </Text>
            <TouchableOpacity onPress={() => setReveal(true)}>
              <Text>Sim</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={nextQuestion}>
              <Text>Não, passar pergunta</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text>{questions[index].question}</Text>
            {questions[index].media && (
              <Image
                style={{ width: 100, height: 100 }}
                source={{ uri: questions[index].media }}
              ></Image>
            )}
            <Text>Opções</Text>
            {questions[index].votes && (
              <View>
                <Text>Sim:{questions[index].votes?.yes.length}</Text>
                <Text>Não:{questions[index].votes?.no.length}</Text>
              </View>
            )}
            {questions[index].options && (
              <View>
                {Object.entries(questions[index].options!).map(
                  ([key, value], i) => (
                    <Text key={i}>
                      {key}:{value.length}
                    </Text>
                  )
                )}
              </View>
            )}
            {questions[index].scale && (
              <View>
                <Slider
                  value={scaleVal}
                  onValueChange={(value) => setScaleVal(value)}
                  renderAboveThumbComponent={() => custom(scaleVal)}
                ></Slider>
              </View>
            )}
          </View>
        )}
        <View>
          {questions[index].tags.map((tag, i) => (
            <Text key={i}>{tag}</Text>
          ))}
        </View>
      </View>
    ) : (
      <View></View>
    );
  };

  const nextQuestion = () => {
    const qstLen = questions?.length;
    index === qstLen! - 1 ? setIndex(0) : setIndex((prev) => prev + 1);
    setReveal(false);
  };

  const prevQuestion = () => {
    index === 0 ? null : setIndex((prev) => prev - 1);
  };

  return (
    <View>
      <Text>Perguntas de hoje</Text>
      {questions ? qstComponent(index) : <View></View>}
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
