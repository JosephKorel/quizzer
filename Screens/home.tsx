import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query,
  updateDoc,
} from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Button,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../firebase_config";
import { useNavigation } from "@react-navigation/native";
import { propsStack } from "./RootStackParams";
import { User } from "firebase/auth";
import { Slider } from "@miblanchard/react-native-slider";
import { AppContext } from "../Context";

type Questions = {
  id: string;
  author: { name: string; uid: string };
  question: string;
  votes: {
    yes: { name: string | null }[];
    no: { name: string | null }[];
  } | null;
  options: { [item: string]: string[] } | null;
  scale: { name: string; value: number }[] | null;
  media?: string;
  tags: string[];
  hasSpoiler: boolean;
  date: string;
};

function Home() {
  const { user } = useContext(AppContext);
  const [questions, setQuestions] = useState<Questions[] | null>(null);
  const [index, setIndex] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [scaleVal, setScaleVal] = useState<number | number[]>([]);
  const [isSliding, setIsSliding] = useState(false);
  const [search, setSearch] = useState("");

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
      if (index[0] < 2) return <Text>Meh</Text>;
      if (index[0] < 6) return <Text>Cool</Text>;
      if (index[0] > 6) return <Text>Awesome</Text>;
    }
  };

  //Voto de Sim ou Não
  const onVote = (choice: string) => {
    const hasVotedYes = questions![index].votes?.yes.filter(
      (item) => item.name === user!.name
    );
    const hasVotedNo = questions![index].votes?.no.filter(
      (item) => item.name === user!.name
    );
    //Usuário já votou?
    if (hasVotedYes!.length > 0 || hasVotedNo!.length > 0) return;

    const id = questions![index].id;
    const currVotes = questions![index].votes;

    if (choice === "yes") {
      //Adiciona o voto
      currVotes?.yes.push({ name: user!.name });

      const docRef = doc(db, "questionsdb", id);
      updateDoc(docRef, {
        votes: currVotes,
      });

      //Atualizar em tempo real
      search.length ? searchForTag() : retrieveCollection();
      return;
    }

    if (choice === "no") {
      //Adiciona o voto
      currVotes?.no.push({ name: user!.name });

      const docRef = doc(db, "questionsdb", id);
      updateDoc(docRef, {
        votes: currVotes,
      });

      //Atualizar em tempo real
      search.length ? searchForTag() : retrieveCollection();
      return;
    }
  };

  const onChoose = (key: string) => {
    const id = questions![index].id;
    const currVotes = questions![index].options;
    const docRef = doc(db, "questionsdb", id);

    //Pega os valores de cada opção
    const val = Object.values(currVotes!);

    //Filtra se existem algum que contém o username do usuário
    const valFil = val.filter((item) => item.includes(user?.name!));

    //Se contém, para a função
    if (valFil.length) return;

    currVotes![key].push(user!.name!);
    updateDoc(docRef, {
      options: currVotes,
    });

    search.length ? searchForTag() : retrieveCollection();
    return;
  };

  const onChangeScale = () => {
    const id = questions![index].id;
    const currVal = questions![index].scale;
    const hasVoted = currVal?.filter((item) => item.name === user?.name!);
    const docRef = doc(db, "questionsdb", id);

    if (Array.isArray(scaleVal)) {
      const val = +scaleVal[0].toFixed(1);

      if (hasVoted?.length) {
        currVal?.forEach((item) => {
          if (item.name === user?.name) item.value = val;
        });
        updateDoc(docRef, {
          scale: currVal,
        });
        setIsSliding(false);
        search.length ? searchForTag() : retrieveCollection();
        return;
      } else {
        currVal?.push({ name: user?.name!, value: val });

        updateDoc(docRef, {
          scale: currVal,
        });
        setIsSliding(false);
        search.length ? searchForTag() : retrieveCollection();
        return;
      }
    }
  };

  const currScaleVal = () => {
    const currVal = questions![index].scale;
    const hasVoted = currVal!.filter((item) => item.name === user?.name);
    if (hasVoted.length > 0 && isSliding === false) {
      return hasVoted[0].value;
    } else return scaleVal;
  };

  const onSliding = () => {
    const currVal = questions![index].scale;
    const hasVoted = currVal!.filter((item) => item.name === user?.name);
    if (hasVoted.length) {
      setIsSliding(true);
      setScaleVal(hasVoted[0].value);
    }
  };

  const searchForTag = () => {
    const questionFilter = questions?.filter((item) =>
      item.tags.includes(search.trim().toLowerCase())
    );
    questionFilter?.length && setQuestions(questionFilter);
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
                <TouchableOpacity onPress={() => onVote("yes")}>
                  <Text>Sim:{questions[index].votes?.yes.length}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onVote("no")}>
                  <Text>Não:{questions[index].votes?.no.length}</Text>
                </TouchableOpacity>
              </View>
            )}
            {questions[index].options && (
              <View>
                {Object.entries(questions[index].options!).map(
                  ([key, value], i) => (
                    <TouchableOpacity onPress={() => onChoose(key)} key={i}>
                      <Text>
                        {key}:{value.length}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            )}
            {questions[index].scale && (
              <View>
                <Slider
                  minimumValue={0}
                  maximumValue={10}
                  value={currScaleVal()}
                  onValueChange={(value) => setScaleVal(value)}
                  renderAboveThumbComponent={() => custom(scaleVal)}
                  onSlidingComplete={onChangeScale}
                  onSlidingStart={onSliding}
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
      <TextInput
        placeholder="Procurar pergunta por tag"
        value={search}
        onChangeText={(text) => setSearch(text)}
      ></TextInput>
      <TouchableOpacity onPress={searchForTag}>
        <Text>Procurar</Text>
      </TouchableOpacity>
      <Button
        onPress={() => navigation.navigate("NewPost")}
        title="Perguntar"
      ></Button>
    </View>
  );
}

export default Home;
