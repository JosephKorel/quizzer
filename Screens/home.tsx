import {
  arrayUnion,
  collection,
  doc,
  DocumentData,
  getDocs,
  query,
  updateDoc,
} from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../firebase_config";
import { useNavigation } from "@react-navigation/native";
import { propsStack } from "./RootStackParams";
import { Slider } from "@miblanchard/react-native-slider";
import { AppContext, Questions } from "../Context";
import tailwind from "twrnc";
import { Avatar, Box, Button, IconButton, Input, Slide } from "native-base";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { BottomNav } from "../Components/bottom_nav";

function Home() {
  const { user, scaleTxt } = useContext(AppContext);
  const [questions, setQuestions] = useState<Questions[] | null>(null);
  const [index, setIndex] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [scaleVal, setScaleVal] = useState<number | number[]>([]);
  const [isSliding, setIsSliding] = useState(false);
  const [search, setSearch] = useState("");
  const [myQuestions, setMyQuestions] = useState(false);
  const [allQuestions, setAllQuestions] = useState<Questions[] | null>(null);
  const [tagSearch, setTagSearch] = useState(false);
  const [light, setLight] = useState(false);

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
    questionDocs.sort((a, b) => {
      if (a.hasVoted.includes(user!.uid)) return 1;
      else return -1;
    });
    setQuestions(questionDocs);
    setAllQuestions(questionDocs);
  };

  useEffect(() => {
    retrieveCollection();
  }, []);

  //Voto de Sim ou Não
  const onVote = async (choice: string): Promise<void | null> => {
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

      try {
        //Atualiza no firebase
        await updateDoc(docRef, {
          votes: currVotes,
          hasVoted: arrayUnion(user!.uid),
          views: currViews,
        });

        //Atualiza o front end em tempo real
        qstSlice![index].votes = currVotes;
        qstSlice![index].hasVoted.push(user!.uid);
        setQuestions(qstSlice!);
      } catch (error) {
        console.log(error);
        return null;
      }
    }

    //Voto de não
    else {
      let qstSlice = questions?.slice();

      //Adiciona o voto
      currVotes?.no.push({ name: user!.name });
      currViews += 1;

      try {
        //Atualiza no firebase
        await updateDoc(docRef, {
          votes: currVotes,
          hasVoted: arrayUnion(user!.uid),
          views: currViews,
        });

        //Atualiza o front end em tempo real
        qstSlice![index].votes = currVotes;
        qstSlice![index].hasVoted.push(user!.uid);

        setQuestions(qstSlice!);
      } catch (error) {
        console.log(error);
        return null;
      }
    }
  };

  const onChoose = async (key: string): Promise<void | null> => {
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

    try {
      //Atualiza no firebase
      await updateDoc(docRef, {
        options: currVotes,
        hasVoted: arrayUnion(user!.uid),
        views: currViews,
      });

      //Atualização em tempo real
      qstSlice![index].options = currVotes;
      qstSlice![index].hasVoted.push(user!.uid);

      setQuestions(qstSlice!);
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const onChangeScale = async () => {
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

        try {
          //Atualiza o Doc
          await updateDoc(docRef, {
            scale: currVal,
            views: currViews,
          });
          setIsSliding(false);

          //Atualiza o front
          qstSlice![index].scale = currVal;

          setQuestions(qstSlice!);
        } catch (error) {}

        /* search.length ? searchForTag() : retrieveCollection(); */
        return;
      } else {
        currVal?.push({ name: user?.name!, value: val });
        currViews += 1;

        try {
          //Atualiza o Doc
          await updateDoc(docRef, {
            scale: currVal,
            hasVoted: arrayUnion(user!.uid),
            views: currViews,
          });
          setIsSliding(false);

          //Atualiza no front
          qstSlice![index].scale = currVal;
          qstSlice![index].hasVoted.push(user!.uid);

          setQuestions(qstSlice!);
        } catch (error) {
          console.log(error);
        }

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

  const custom = (value: number | Array<number>, index: number) => {
    const labels = questions![index].labels!;
    if (Array.isArray(value)) {
      if (value[0] < 2) return <Text>{labels[0]}</Text>;
      if (value[0] < 6) return <Text>{labels[1]}</Text>;
      if (value[0] > 6) return <Text>{labels[2]}</Text>;
    }
  };

  useEffect(() => {
    const showMyQuestions = () => {
      const myQuestionFilter = allQuestions?.filter(
        (item) => item.author.uid === user?.uid
      );
      setQuestions(myQuestionFilter!);
    };

    const showAllQuestions = () => {
      const myQuestionFilter = allQuestions?.filter(
        (item) => item.author.uid !== user?.uid
      );
      setQuestions(myQuestionFilter!);
    };

    myQuestions ? showMyQuestions() : showAllQuestions();
  }, [myQuestions]);

  const YesNoButtons = (): JSX.Element => {
    const hasVoted = (): boolean => {
      const filter = questions![index].hasVoted.includes(
        auth.currentUser?.uid!
      );
      return filter;
    };

    return (
      <View style={tailwind`flex-row justify-around items-center`}>
        <View style={tailwind`bg-stone-900`}>
          <TouchableOpacity onPress={() => onVote("yes")} style={styles.text}>
            <Text style={tailwind`text-slate-50 font-bold text-2xl`}>
              SIM {hasVoted() && questions![index].votes?.yes.length}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={tailwind`bg-stone-900`}>
          <TouchableOpacity onPress={() => onVote("no")} style={styles.text}>
            <Text style={tailwind`text-slate-50 font-bold text-2xl`}>
              NÃO {hasVoted() && questions![index].votes?.no.length}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    text: {
      backgroundColor: "#F72585",
      padding: 5,
      transform: [{ translateX: 7 }, { translateY: -7 }],
    },
  });

  const qstComponent = (index: number) => {
    return questions?.length ? (
      <View style={tailwind`mt-12`}>
        <View style={tailwind`flex-row justify-center items-center`}>
          <View style={tailwind`flex flex-col items-center`}>
            <Avatar source={{ uri: user?.avatar ? user.avatar : undefined }} />
            <Text style={tailwind`text-slate-300 text-base`}>
              {questions[index].author.name}
            </Text>
          </View>
        </View>

        <View style={tailwind`mt-6 flex flex-row justify-between items-center`}>
          <View
            style={tailwind`w-[46%] p-[2px] bg-[#B9FAF8] rounded-br-lg rounded-tl-lg`}
          ></View>
          <View
            style={tailwind`w-[46%] p-[2px] bg-[#B9FAF8]  rounded-bl-lg rounded-tr-lg`}
          ></View>
        </View>
        {questions[index].hasSpoiler === true && reveal === false ? (
          <View style={tailwind`mt-8`}>
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
          <View style={tailwind`mt-4 p-2`}>
            <Text
              style={tailwind`text-4xl italic text-[#F72585] text-center font-bold`}
            >
              {questions[index].question}
            </Text>
            {questions[index].media && (
              <Image
                style={{ width: 100, height: 100 }}
                source={{ uri: questions[index].media }}
              ></Image>
            )}
            {questions[index].votes && (
              <View style={tailwind`mt-8`}>
                <YesNoButtons />
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
              <View style={tailwind`mt-4`}>
                <Slider
                  minimumValue={0}
                  maximumValue={10}
                  value={currScaleVal()}
                  onValueChange={(value) => setScaleVal(value)}
                  renderAboveThumbComponent={() => custom(scaleVal, index)}
                  onSlidingComplete={onChangeScale}
                  onSlidingStart={onSliding}
                ></Slider>
              </View>
            )}
          </View>
        )}
        <View style={tailwind`mt-2 flex-row items-center`}>
          <AntDesign
            name="tags"
            size={24}
            color="gray"
            style={tailwind`mr-3`}
          />
          {questions[index].tags.map((tag, i, arr) => (
            <Text key={i} style={tailwind`text-slate-500 text-xs mr-2`}>
              {tag.toUpperCase()}
              {i === arr.length - 1 ? "" : ","}
            </Text>
          ))}
        </View>
      </View>
    ) : (
      <View></View>
    );
  };

  const SearchInput = () => {
    return (
      <Slide in={tagSearch} placement="top">
        <Box p={5} pt={20} color="white" bg="#212529">
          <Input
            placeholder="Procurar por tag"
            mb={2}
            color="white"
            rightElement={
              <MaterialIcons
                name="search"
                size={24}
                color="#F72585"
                onPress={() => setTagSearch(true)}
                style={tailwind`mr-2`}
              />
            }
            value={search}
            onChangeText={(text) => setSearch(text)}
          />
        </Box>
      </Slide>
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

  const HomeStyles = StyleSheet.create({
    main: {
      backgroundColor: "black",
      opacity: 7,
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
        <View
          style={tailwind`absolute top-10 flex-row w-full justify-between items-center`}
        >
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
          <IconButton
            style={tailwind` rounded-full`}
            icon={<MaterialIcons name="refresh" size={24} color="#2ecfc0" />}
            onPress={retrieveCollection}
          />
        </View>
        <StatusBar barStyle="light-content" />
        <View style={tailwind`flex-col justify-center items-center h-2/3`}>
          {questions?.length ? qstComponent(index) : <View></View>}
        </View>
        <View style={tailwind`flex-row justify-between items-center mt-10`}>
          <MaterialIcons
            name="navigate-before"
            size={42}
            color="#F72585"
            onPress={prevQuestion}
          />
          <MaterialIcons
            name="navigate-next"
            size={42}
            color="#2ecfc0"
            onPress={nextQuestion}
          />
        </View>
      </View>

      <SearchInput />
      <BottomNav tagSearch={tagSearch} setTagSearch={setTagSearch} />
    </View>
  );
}

export default Home;
