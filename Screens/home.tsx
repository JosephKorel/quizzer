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
  hasVoted: string[];
  views: number;
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

    //Sort pelo número de votos
    questionDocs.sort((a, b) => {
      if (a.views > b.views) return -1;
      else return 1;
    });

    //Sort pelas perguntas ainda não respondidas
    const hasAnswered = questionDocs.filter((item) => {});

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
    const hasVoted = questions![index].hasVoted;

    //Usuário já votou?
    if (hasVoted.includes(user!.uid)) return;

    const id = questions![index].id;
    let currVotes = questions![index].votes;
    let currViews = questions![index].views;
    const docRef = doc(db, "questionsdb", id);

    if (choice === "yes") {
      let qstSlice = questions?.slice();

      //Adiciona o voto
      currVotes?.yes.push({ name: user!.name });
      currViews += 1;

      //Atualiza o front end em tempo real
      qstSlice![index].votes = currVotes;
      qstSlice![index].hasVoted.push(user!.uid);
      setQuestions(qstSlice!);

      //Atualiza no firebase
      updateDoc(docRef, {
        votes: currVotes,
        hasVoted: arrayUnion(user!.uid),
        views: currViews,
      });

      return;
    }

    if (choice === "no") {
      let qstSlice = questions?.slice();

      //Adiciona o voto
      currVotes?.no.push({ name: user!.name });
      currViews += 1;

      //Atualiza o front end em tempo real
      qstSlice![index].votes = currVotes;
      qstSlice![index].hasVoted.push(user!.uid);

      setQuestions(qstSlice!);

      //Atualiza no firebase
      updateDoc(docRef, {
        votes: currVotes,
        hasVoted: arrayUnion(user!.uid),
        views: currViews,
      });

      return;
    }
  };

  const onChoose = (key: string) => {
    const id = questions![index].id;
    const hasVoted = questions![index].hasVoted;
    let currVotes = questions![index].options;
    let currViews = questions![index].views;
    let qstSlice = questions?.slice();
    const docRef = doc(db, "questionsdb", id);

    //Se o usuário já votou, para a função
    if (hasVoted.includes(user!.uid)) return;

    currVotes![key].push(user!.name!);
    currViews += 1;

    //Atualização em tempo real
    qstSlice![index].options = currVotes;
    qstSlice![index].hasVoted.push(user!.uid);

    setQuestions(qstSlice!);

    //Atualiza no firebase
    updateDoc(docRef, {
      options: currVotes,
      hasVoted: arrayUnion(user!.uid),
      views: currViews,
    });

    return;
  };

  const onChangeScale = () => {
    const id = questions![index].id;
    let currVal = questions![index].scale;
    let currViews = questions![index].views;
    const hasVoted = questions![index].hasVoted;
    let qstSlice = questions?.slice();
    const docRef = doc(db, "questionsdb", id);

    if (Array.isArray(scaleVal)) {
      //Arredonda pra uma casa
      const val = +scaleVal[0].toFixed(1);

      if (hasVoted.includes(user!.uid)) {
        //Muda o valor escolhido pelo usuário
        currVal?.forEach((item) => {
          if (item.name === user!.name) item.value = val;
        });
        currViews += 1;

        //Atualiza o front
        qstSlice![index].scale = currVal;

        setQuestions(qstSlice!);

        //Atualiza o Doc
        updateDoc(docRef, {
          scale: currVal,
          views: currViews,
        });
        setIsSliding(false);
        /* search.length ? searchForTag() : retrieveCollection(); */
        return;
      } else {
        currVal?.push({ name: user?.name!, value: val });
        currViews += 1;

        //Atualiza no front
        qstSlice![index].scale = currVal;
        qstSlice![index].hasVoted.push(user!.uid);

        setQuestions(qstSlice!);

        //Atualiza o Doc
        updateDoc(docRef, {
          scale: currVal,
          hasVoted: arrayUnion(user!.uid),
          views: currViews,
        });
        setIsSliding(false);
        /* search.length ? searchForTag() : retrieveCollection(); */
        return;
      }
    }
  };

  //Define o valor atual da escala
  const currScaleVal = () => {
    const currVal = questions![index].scale;
    const hasVoted = currVal!.filter((item) => item.name === user?.name);

    //Se há o voto e a escala não está mudando, fica o valor previamente registrado
    if (hasVoted.length > 0 && isSliding === false) {
      return hasVoted[0].value;
    }
    //Se não, ou não há voto ou isSliding é true o que significa que a escala tá mudando
    else return scaleVal;
  };

  //Função quando a escala começa a mudar
  const onSliding = () => {
    const currVal = questions![index].scale;
    const hasVoted = currVal!.filter((item) => item.name === user?.name);

    //Se há o voto, isSliding é true e então o valor da escala passa a ser o de scaleVal
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
