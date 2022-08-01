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
import { Avatar, IconButton, Slide } from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { AlertComponent, BottomNav } from "../Components/nativeBase_Components";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  cos,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useCode,
  useSharedValue,
  Value,
} from "react-native-reanimated";

function Home() {
  const { user, light, setLight } = useContext(AppContext);
  const [questions, setQuestions] = useState<Questions[] | null>(null);
  const [index, setIndex] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [scaleVal, setScaleVal] = useState<number | number[]>([]);
  const [isSliding, setIsSliding] = useState(false);
  const [search, setSearch] = useState("");
  const [myQuestions, setMyQuestions] = useState(false);
  const [allQuestions, setAllQuestions] = useState<Questions[] | null>(null);
  const [tagSearch, setTagSearch] = useState(false);
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

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

  useEffect(() => {
    setTimeout(() => {
      setError("");
    }, 2000);
  }, [error]);

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

  const searchForTag = (): void | null => {
    const questionFilter = allQuestions?.filter((item) =>
      item.tags.includes(search.trim().toLowerCase())
    );

    if (questionFilter?.length) {
      setQuestions(questionFilter);
      setTagSearch(false);
      setIsSearching(true);
    } else {
      setError(
        "Nenhuma pergunta com esta tag foi encontrada, mostrando todas as perguntas"
      );
      return null;
    }
  };

  const custom = (value: number | Array<number>, index: number) => {
    const labels = questions![index].labels!;
    if (Array.isArray(value)) {
      if (value[0] < 2)
        return (
          <Text style={tailwind`italic text-lg text-slate-50`}>
            {labels[0]}
          </Text>
        );
      if (value[0] < 6)
        return (
          <Text style={tailwind`italic text-lg text-slate-50`}>
            {labels[1]}
          </Text>
        );
      if (value[0] > 6)
        return (
          <Text style={tailwind`italic text-lg text-slate-50`}>
            {labels[2]}
          </Text>
        );
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

  const OptionsButtons = ({
    objkey,
    value,
  }: {
    objkey: string;
    value: string[];
  }): JSX.Element => {
    const hasVoted = (): boolean => {
      const filter = questions![index].hasVoted.includes(
        auth.currentUser?.uid!
      );
      return filter;
    };

    return (
      <View>
        <View style={tailwind`bg-stone-900 mt-5`}>
          <TouchableOpacity onPress={() => onVote("yes")} style={styles.text}>
            <Text
              style={tailwind`text-slate-50 font-bold text-2xl text-center italic`}
            >
              {objkey}
              {hasVoted() && ": " + value.length}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const ScaleComponent = () => {
    let totalValues: number[] = [];

    if (questions?.length) {
      questions[index].scale?.forEach((item) => totalValues.push(item.value));
    }

    const valueSum = totalValues.reduce((acc, curr) => {
      acc += curr;
      return acc;
    }, 0);

    const averageAnswer: number = valueSum / totalValues.length;

    return (
      <View style={tailwind`mt-10`}>
        <Slider
          minimumTrackTintColor="#F72585"
          thumbTintColor="#F72585"
          minimumValue={0}
          maximumValue={10}
          value={currScaleVal()}
          onValueChange={(value) => setScaleVal(value)}
          renderAboveThumbComponent={() => custom(scaleVal, index)}
          onSlidingComplete={onChangeScale}
          onSlidingStart={onSliding}
        ></Slider>
        {questions![index].hasVoted.includes(user?.uid!) && (
          <View>
            <View style={tailwind`bg-stone-900 mt-8`}>
              <TouchableOpacity style={styles.text}>
                <Text
                  style={tailwind`text-slate-50 font-bold text-xl text-center italic`}
                >
                  RESPOSTA MÉDIA: {averageAnswer}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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

  const nextQuestion = () => {
    const qstLen = questions?.length;
    index === qstLen! - 1 ? setIndex(0) : setIndex((prev) => prev + 1);
    setReveal(false);
  };

  const prevQuestion = () => {
    index === 0 ? null : setIndex((prev) => prev - 1);
  };

  type Context = {
    translateX: number;
    translateY: number;
  };

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const GestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    Context
  >({
    onStart: (event, context) => {},
    onActive: ({ translationX, translationY, x }) => {
      translateX.value = translationX;
      translateY.value = translationY;
      opacity.value = 1 - Math.abs(translationX) / 250;
    },
    onEnd: ({ translationX, translationY }) => {
      if (translateX.value < -100) {
        runOnJS(nextQuestion)();
      } else if (translateX.value > 100) {
        runOnJS(prevQuestion)();
      }
      translateX.value = 0;
      translateY.value = 0;
      opacity.value = 1;
    },
  });

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));
  const qstComponent = (index: number) => {
    return questions?.length ? (
      <View style={tailwind``}>
        {questions[index].hasSpoiler === true && reveal === false ? (
          <View style={tailwind.style("mt-8 p-4 bg-[#F72585]")}>
            <Text
              style={tailwind.style("text-slate-100 font-bold italic text-3xl")}
            >
              Cuidado! Esta pergunta contém spoiler, tem certeza de que quer
              ver?
            </Text>
            <View
              style={tailwind.style(
                "flex-row justify-between items-center mt-4"
              )}
            >
              <TouchableOpacity
                style={tailwind.style("bg-stone-800")}
                onPress={() => {
                  setReveal(true);
                }}
              >
                <Text
                  style={tailwind.style(
                    "text-lg",
                    "italic",
                    "p-2",
                    "px-3",
                    "bg-[#4fea74]",
                    "text-stone-700",
                    "text-center ",
                    "font-bold",
                    HomeStyles.smallTranslate
                  )}
                >
                  SIM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tailwind.style("bg-stone-800")}
                onPress={nextQuestion}
              >
                <Text
                  style={tailwind.style(
                    "text-lg italic p-2 bg-[#fad643] text-stone-700 text-center font-bold",
                    HomeStyles.smallTranslate
                  )}
                >
                  NÃO, PASSAR PERGUNTA
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={tailwind`mt-4 p-2`}>
            <View style={tailwind`flex-col justify-center items-center`}>
              <Text
                style={tailwind`absolute text-4xl italic text-center text-[#4361ee] font-bold`}
              >
                {questions[index].question}
              </Text>
              <Text
                style={tailwind.style(
                  "text-4xl italic text-[#F72585] font-bold text-center",
                  HomeStyles.xsTranslate
                )}
              >
                {questions[index].question}
              </Text>
            </View>
            {questions[index].media && (
              <View style={tailwind`flex-row justify-center`}>
                <Image
                  style={{ width: 300, height: 300, borderRadius: 2 }}
                  source={{ uri: questions[index].media }}
                ></Image>
              </View>
            )}
            {questions[index].votes && (
              <View style={tailwind`mt-8`}>
                <YesNoButtons />
              </View>
            )}
            {questions[index].options && (
              <View style={tailwind`flex-col justify-center`}>
                {Object.entries(questions[index].options!).map(
                  ([key, value], i) => (
                    <OptionsButtons key={i} objkey={key} value={value} />
                  )
                )}
              </View>
            )}
            {questions[index].scale && <View>{ScaleComponent()}</View>}
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

  const clearSearch = () => {
    retrieveCollection();
    setIsSearching(false);
    setSearch("");
  };

  const SearchInput = () => {
    return (
      <Slide in={tagSearch} placement="top">
        <View style={tailwind.style("bg-[#212529] pt-15 pb-5")}>
          <View style={tailwind.style("self-end mb-4")}>
            <IconButton
              icon={
                <MaterialIcons
                  name="close"
                  size={24}
                  color="white"
                  onPress={() => setTagSearch(false)}
                />
              }
            />
          </View>
          <View style={tailwind.style("w-11/12 mx-auto")}>
            <Text style={tailwind.style("mb-2 text-slate-100 text-lg")}>
              Procure por até três tags
            </Text>
            <View
              style={tailwind.style(
                "flex-row items-center justify-between p-1 rounded-md bg-slate-200"
              )}
            >
              <TextInput
                placeholder="Tag"
                value={search}
                onChangeText={(text) => setSearch(text)}
              />
              <MaterialIcons
                name="search"
                size={24}
                color="#F72585"
                onPress={searchForTag}
                style={tailwind`mr-2`}
              />
            </View>
          </View>
        </View>
      </Slide>
    );
  };

  const HomeStyles = StyleSheet.create({
    main: {
      transform: [{ translateY: -5 }],
    },
    translate: {
      transform: [{ translateX: 4 }, { translateY: -4 }],
    },
    smallTranslate: {
      transform: [{ translateX: 2 }, { translateY: -2 }],
    },
    xsTranslate: {
      transform: [{ translateX: 1 }, { translateY: -1 }],
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
          style={tailwind`absolute top-10 flex-row w-full justify-between items-center z-10`}
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
        <View style={tailwind`text-center`}>
          {questions?.length ? (
            <GestureHandlerRootView>
              <PanGestureHandler onGestureEvent={GestureHandler}>
                <Animated.View style={rStyle}>
                  <View
                    style={
                      (tailwind.style(""),
                      {
                        transform: [{ translateY: 80 }],
                      })
                    }
                  >
                    <View style={tailwind.style("text-center")}>
                      <View style={tailwind`flex flex-col items-center`}>
                        <Avatar
                          source={{
                            uri: user?.avatar ? user.avatar : undefined,
                          }}
                          style={rStyle}
                        />

                        <Text style={tailwind`text-slate-300 text-base`}>
                          {questions[index].author.name}
                        </Text>
                      </View>
                      <View
                        style={tailwind`mt-6 flex flex-row justify-between items-center`}
                      >
                        <View
                          style={tailwind`w-[46%] p-[2px] bg-[#B9FAF8] rounded-br-lg rounded-tl-lg`}
                        ></View>
                        <View
                          style={tailwind`w-[46%] p-[2px] bg-[#B9FAF8]  rounded-bl-lg rounded-tr-lg`}
                        ></View>
                      </View>
                    </View>
                    <View style={tailwind``}>{qstComponent(index)}</View>
                  </View>
                </Animated.View>
              </PanGestureHandler>
            </GestureHandlerRootView>
          ) : (
            <View></View>
          )}
        </View>
      </View>
      {error !== "" && <AlertComponent success={""} error={error} />}
      {SearchInput()}
      {isSearching && (
        <View
          style={tailwind.style("absolute bottom-1/4 w-full ml-2", {
            zIndex: -10,
          })}
        >
          <View
            style={tailwind.style("bg-[#05f2d2] self-start bottom-0", {
              transform: [{ rotateZ: "-12deg" }],
              position: "relative",
            })}
          >
            <View
              style={tailwind.style(
                "flex-row items-center bg-[#6c00e0] px-2",
                HomeStyles.smallTranslate
              )}
            >
              <AntDesign
                name="tags"
                size={32}
                color="#FAD643"
                style={tailwind`mr-3`}
              />

              <Text
                style={tailwind.style(
                  "text-slate-100 text-[#FAD643] text-base font-bold"
                )}
              >
                {search}
              </Text>

              <Text
                style={tailwind.style(
                  "text-slate-100 text-[#FAD643] text-lg font-bold ml-4"
                )}
              >
                {index + 1}/{questions?.length}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={tailwind.style("bg-[#F72585] self-start mt-4", {
              transform: [{ rotateZ: "-12deg" }],
            })}
            onPress={clearSearch}
          >
            <View
              style={tailwind.style(
                "flex-row items-center  bg-[#FAD643]",
                HomeStyles.smallTranslate
              )}
            >
              <Text
                style={tailwind.style(
                  "text-slate-100 text-stone-800 text-lg font-bold px-2 flex-row items-center "
                )}
              >
                LIMPAR FILTROS
              </Text>
              <MaterialIcons name="close" size={24} color="black" />
            </View>
          </TouchableOpacity>
        </View>
      )}
      <BottomNav tagSearch={tagSearch} setTagSearch={setTagSearch} />
    </View>
  );
}

export default Home;
