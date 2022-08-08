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
import { Slider } from "@miblanchard/react-native-slider";
import { AppContext, Questions } from "../Context";
import tw from "./tailwind_config";
import { Translate } from "./nativeBase_Components";
import { AntDesign } from "@expo/vector-icons";
import { useAppColorScheme } from "twrnc";

export const QuestionComponent = ({
  item,
  filter,
  setFilter,
}: {
  item: Questions;
  filter: Questions[];
  setFilter: (data: Questions[]) => void;
}) => {
  const { user, colorScheme } = useContext(AppContext);
  const [reveal, setReveal] = useState(false);
  const [scaleVal, setScaleVal] = useState<number | number[]>([]);
  const [isSliding, setIsSliding] = useState(false);

  const onVote = async (choice: string): Promise<void | null> => {
    const hasVoted = item.hasVoted;

    //Usuário já votou?
    if (hasVoted.includes(user!.uid)) return;

    const id = item.id;
    let currVotes = item.votes;
    let currViews = item.views;
    const docRef = doc(db, "questionsdb", id);

    if (choice === "yes") {
      let qstSlice = filter.slice();

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
        item.votes = currVotes;
        item.hasVoted.push(user!.uid);
        setFilter(qstSlice);
      } catch (error) {
        console.log(error);
        return null;
      }
    }

    //Voto de não
    else {
      let qstSlice = filter?.slice();

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
        item.votes = currVotes;
        item.hasVoted.push(user!.uid);

        setFilter(qstSlice);
      } catch (error) {
        console.log(error);
        return null;
      }
    }
  };

  const onChoose = async (key: string): Promise<void | null> => {
    const id = item.id;
    const hasVoted = item.hasVoted;
    let currVotes = item.options;
    let currViews = item.views;

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
      item.options = currVotes;
      item.hasVoted.push(user!.uid);

      let qstSlice = filter?.slice();

      setFilter(qstSlice);
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const YesNoButtons = (): JSX.Element => {
    const hasVoted = (): boolean => {
      const filter = item.hasVoted.includes(auth.currentUser?.uid!);
      return filter;
    };

    const yesVote = (): boolean => {
      const filter = item.votes?.yes.filter((item) => item.name === user?.name);
      return filter?.length ? true : false;
    };

    const noVote = (): boolean => {
      const filter = item.votes?.no.filter((item) => item.name === user?.name);
      return filter?.length ? true : false;
    };

    return (
      <View style={tw`flex-row justify-around items-center`}>
        <TouchableOpacity
          onPress={() => onVote("yes")}
          style={tw.style("bg-sun", yesVote() && "bg-violet")}
        >
          <Text
            style={tw.style(
              "font-bold text-2xl p-1",
              Translate.smallTranslate,
              yesVote()
                ? "bg-emerald text-stone-800"
                : "bg-persian text-slate-100"
            )}
          >
            SIM {hasVoted() && item.votes?.yes.length}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onVote("no")}
          style={tw.style("bg-sun", noVote() && "bg-violet")}
        >
          <Text
            style={tw.style(
              " font-bold text-2xl p-1",
              Translate.smallTranslate,
              noVote()
                ? "bg-emerald text-stone-800"
                : "bg-persian text-slate-100"
            )}
          >
            NÃO {hasVoted() && item.votes?.no.length}
          </Text>
        </TouchableOpacity>
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
      const filter = item.hasVoted.includes(auth.currentUser?.uid!);
      return filter;
    };

    const voted = (): boolean => {
      const filter = value.includes(user?.name!);
      return filter;
    };

    return (
      <View>
        <View style={tw`mt-5`}>
          <TouchableOpacity
            onPress={() => onChoose(objkey)}
            style={tw.style(voted() ? "bg-violet" : "bg-persian")}
          >
            <Text
              style={tw.style(
                "font-bold text-2xl text-center italic",
                voted() ? "bg-emerald text-stone-800" : "text-stone-800 bg-sun",
                Translate.smallTranslate
              )}
            >
              {objkey}
              {hasVoted() && ": " + value.length}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const currScaleVal = () => {
    const currVal = item.scale;
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
    const currVal = item.scale;
    const hasVoted = currVal!.filter((item) => item.name === user?.name);

    //Se há o voto, isSliding é true e então o valor da escala passa a ser o de scaleVal
    if (hasVoted.length) {
      setIsSliding(true);
      setScaleVal(hasVoted[0].value);
    }
  };

  const onChangeScale = async () => {
    const id = item.id;
    let currVal = item.scale;
    let currViews = item.views;
    const hasVoted = item.hasVoted;
    let qstSlice = filter?.slice();
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
          /* qstSlice![index].scale = currVal;

          setQuestions(qstSlice!); */
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
          item.scale = currVal;
          item.hasVoted.push(user!.uid);

          /*  setQuestions(qstSlice!); */
        } catch (error) {
          console.log(error);
        }

        /* search.length ? searchForTag() : retrieveCollection(); */
        return;
      }
    }
  };

  const ScaleComponent = () => {
    let totalValues: number[] = [];

    if (filter?.length) {
      item.scale?.forEach((item) => totalValues.push(item.value));
    }

    const valueSum = totalValues.reduce((acc, curr) => {
      acc += curr;
      return acc;
    }, 0);

    const averageAnswer: number = valueSum / totalValues.length;

    return (
      <View style={tw`mt-10`}>
        <Slider
          minimumTrackTintColor={
            colorScheme === "light" ? "#F72585" : "#FAD643"
          }
          thumbTintColor={colorScheme === "light" ? "#F72585" : "#FAD643"}
          minimumValue={0}
          maximumValue={10}
          value={currScaleVal()}
          onValueChange={(value) => setScaleVal(value)}
          onSlidingComplete={onChangeScale}
          onSlidingStart={onSliding}
        ></Slider>
        {item.hasVoted.includes(user?.uid!) && (
          <View>
            <View style={tw`bg-black mt-8`}>
              <TouchableOpacity style={Translate.smallTranslate}>
                <Text
                  style={tw`text-slate-100 dark:text-slate-800 bg-persian dark:bg-sun font-bold text-2xl text-center italic`}
                >
                  RESPOSTA MÉDIA: {averageAnswer.toFixed(1)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={tw``}>
      {item.hasSpoiler === true && reveal === false ? (
        <View style={tw.style("mt-8 p-4 bg-[#F72585]")}>
          <Text style={tw.style("text-slate-100 font-bold italic text-3xl")}>
            Cuidado! Esta pergunta contém spoiler, tem certeza de que quer ver?
          </Text>
          <View style={tw.style("flex-row justify-center mt-4")}>
            <TouchableOpacity
              style={tw.style("bg-stone-800")}
              onPress={() => {
                setReveal(true);
              }}
            >
              <Text
                style={tw.style(
                  "text-lg italic p-2 px-3 bg-emerald text-stone-700 text-center font-bold",
                  Translate.smallTranslate
                )}
              >
                SIM
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={tw`mt-4 p-2`}>
          <View style={tw`flex-col justify-center items-center`}>
            <Text
              style={tw`absolute text-4xl italic text-center text-black font-bold`}
            >
              {item.question}
            </Text>
            <Text
              style={tw.style(
                "text-4xl italic text-persian dark:text-sun font-bold text-center",
                Translate.xsTranslate
              )}
            >
              {item.question}
            </Text>
          </View>
          {item.media && (
            <View style={tw`flex-row justify-center`}>
              <Image
                style={{ width: 300, height: 300, borderRadius: 2 }}
                source={{ uri: item.media }}
              ></Image>
            </View>
          )}
          {item.votes && (
            <View style={tw`mt-8`}>
              <YesNoButtons />
            </View>
          )}
          {item.options && (
            <View style={tw`flex-col justify-center`}>
              {Object.entries(item.options!).map(([key, value], i) => (
                <OptionsButtons key={i} objkey={key} value={value} />
              ))}
            </View>
          )}
          {item.scale && <View>{ScaleComponent()}</View>}
        </View>
      )}
      <View style={tw`mt-2 flex-row items-center`}>
        <AntDesign name="tags" size={24} color="gray" style={tw`mr-3`} />
        {item.tags.map((tag, i, arr) => (
          <Text
            key={i}
            style={tw`text-stone-700 dark:text-slate-200 text-xs mr-2`}
          >
            {tag.toUpperCase()}
            {i === arr.length - 1 ? "" : ","}
          </Text>
        ))}
      </View>
    </View>
  );
};

export const HomeQuestionComponent = ({
  item,
  filter,
  setFilter,
}: {
  item: Questions;
  filter: Questions[];
  setFilter: (data: Questions[]) => void;
}) => {
  const { user } = useContext(AppContext);
  const [reveal, setReveal] = useState(false);
  const [scaleVal, setScaleVal] = useState<number | number[]>([]);
  const [isSliding, setIsSliding] = useState(false);

  const onVote = async (choice: string): Promise<void | null> => {
    const hasVoted = item.hasVoted;

    //Usuário já votou?
    if (hasVoted.includes(user!.uid)) return;

    const id = item.id;
    let currVotes = item.votes;
    let currViews = item.views;
    const docRef = doc(db, "questionsdb", id);

    if (choice === "yes") {
      let qstSlice = filter.slice();

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
        item.votes = currVotes;
        item.hasVoted.push(user!.uid);
        setFilter(qstSlice);
      } catch (error) {
        console.log(error);
        return null;
      }
    }

    //Voto de não
    else {
      let qstSlice = filter?.slice();

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
        item.votes = currVotes;
        item.hasVoted.push(user!.uid);

        setFilter(qstSlice);
      } catch (error) {
        console.log(error);
        return null;
      }
    }
  };

  const onChoose = async (key: string): Promise<void | null> => {
    const id = item.id;
    const hasVoted = item.hasVoted;
    let currVotes = item.options;
    let currViews = item.views;

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
      item.options = currVotes;
      item.hasVoted.push(user!.uid);

      let qstSlice = filter?.slice();

      setFilter(qstSlice);
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const YesNoButtons = (): JSX.Element => {
    const hasVoted = (): boolean => {
      const filter = item.hasVoted.includes(auth.currentUser?.uid!);
      return filter;
    };

    const yesVote = (): boolean => {
      const filter = item.votes?.yes.filter((item) => item.name === user?.name);
      return filter?.length ? true : false;
    };

    const noVote = (): boolean => {
      const filter = item.votes?.no.filter((item) => item.name === user?.name);
      return filter?.length ? true : false;
    };

    return (
      <View style={tw`flex-row justify-around items-center`}>
        <TouchableOpacity
          onPress={() => onVote("yes")}
          style={tw.style("bg-sun", yesVote() && "bg-violet")}
        >
          <Text
            style={tw.style(
              "font-bold text-2xl p-1",
              Translate.smallTranslate,
              yesVote()
                ? "bg-emerald text-stone-800"
                : "bg-persian text-slate-100"
            )}
          >
            SIM {hasVoted() && item.votes?.yes.length}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onVote("no")}
          style={tw.style("bg-sun", noVote() && "bg-violet")}
        >
          <Text
            style={tw.style(
              " font-bold text-2xl p-1",
              Translate.smallTranslate,
              noVote()
                ? "bg-emerald text-stone-800"
                : "bg-persian text-slate-100"
            )}
          >
            NÃO {hasVoted() && item.votes?.no.length}
          </Text>
        </TouchableOpacity>
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
      const filter = item.hasVoted.includes(auth.currentUser?.uid!);
      return filter;
    };

    const voted = (): boolean => {
      const filter = value.includes(user?.name!);
      return filter;
    };

    return (
      <View>
        <View style={tw`mt-5`}>
          <TouchableOpacity
            onPress={() => onChoose(objkey)}
            style={tw.style(voted() ? "bg-violet" : "bg-persian")}
          >
            <Text
              style={tw.style(
                "font-bold text-2xl text-center italic",
                voted() ? "bg-emerald text-stone-800" : "text-stone-800 bg-sun",
                Translate.smallTranslate
              )}
            >
              {objkey}
              {hasVoted() && ": " + value.length}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const currScaleVal = () => {
    const currVal = item.scale;
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
    const currVal = item.scale;
    const hasVoted = currVal!.filter((item) => item.name === user?.name);

    //Se há o voto, isSliding é true e então o valor da escala passa a ser o de scaleVal
    if (hasVoted.length) {
      setIsSliding(true);
      setScaleVal(hasVoted[0].value);
    }
  };

  const onChangeScale = async () => {
    const id = item.id;
    let currVal = item.scale;
    let currViews = item.views;
    const hasVoted = item.hasVoted;
    let qstSlice = filter?.slice();
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
          /* qstSlice![index].scale = currVal;

          setQuestions(qstSlice!); */
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
          item.scale = currVal;
          item.hasVoted.push(user!.uid);

          /*  setQuestions(qstSlice!); */
        } catch (error) {
          console.log(error);
        }

        /* search.length ? searchForTag() : retrieveCollection(); */
        return;
      }
    }
  };

  const custom = (value: number | Array<number>) => {
    const labels = item.labels!;
    if (Array.isArray(value)) {
      if (value[0] < 2)
        return (
          <Text style={tw`italic text-lg text-slate-50`}>{labels[0]}</Text>
        );
      if (value[0] < 6)
        return (
          <Text style={tw`italic text-lg text-slate-50`}>{labels[1]}</Text>
        );
      if (value[0] > 6)
        return (
          <Text style={tw`italic text-lg text-slate-50`}>{labels[2]}</Text>
        );
    }
  };

  const ScaleComponent = () => {
    let totalValues: number[] = [];

    if (filter?.length) {
      item.scale?.forEach((item) => totalValues.push(item.value));
    }

    const valueSum = totalValues.reduce((acc, curr) => {
      acc += curr;
      return acc;
    }, 0);

    const averageAnswer: number = valueSum / totalValues.length;

    return (
      <View style={tw`mt-10`}>
        <Slider
          minimumTrackTintColor="#F72585"
          thumbTintColor="#F72585"
          minimumValue={0}
          maximumValue={10}
          value={currScaleVal()}
          onValueChange={(value) => setScaleVal(value)}
          renderAboveThumbComponent={() => custom(scaleVal)}
          onSlidingComplete={onChangeScale}
          onSlidingStart={onSliding}
        ></Slider>
        {item.hasVoted.includes(user?.uid!) && (
          <View>
            <View style={tw`bg-black dark:bg-sun mt-8`}>
              <TouchableOpacity style={Translate.smallTranslate}>
                <Text
                  style={tw`text-slate-100 bg-persian font-bold text-2xl text-center italic`}
                >
                  RESPOSTA MÉDIA: {averageAnswer.toFixed(1)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={tw``}>
      {item.hasSpoiler === true && reveal === false ? (
        <View style={tw.style("mt-8 p-4 bg-persian")}>
          <Text style={tw.style("text-slate-100 font-bold italic text-3xl")}>
            Cuidado! Esta pergunta contém spoiler, tem certeza de que quer ver?
          </Text>
          <View style={tw.style("flex-row justify-center mt-4")}>
            <TouchableOpacity
              style={tw.style("bg-stone-800")}
              onPress={() => {
                setReveal(true);
              }}
            >
              <Text
                style={tw.style(
                  "text-lg italic p-2 px-3 bg-emerald text-stone-700 text-center font-bold",
                  Translate.smallTranslate
                )}
              >
                SIM
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={tw`mt-4 p-2`}>
          <View style={tw`flex-col justify-center items-center`}>
            <Text
              style={tw`absolute text-4xl italic text-center text-slate-500 font-bold`}
            >
              {item.question}
            </Text>
            <Text
              style={tw.style(
                "text-4xl italic text-persian font-bold text-center",
                Translate.xsTranslate
              )}
            >
              {item.question}
            </Text>
          </View>
          {item.media && (
            <View style={tw`flex-row justify-center`}>
              <Image
                style={{ width: 300, height: 300, borderRadius: 2 }}
                source={{ uri: item.media }}
              ></Image>
            </View>
          )}
          {item.votes && (
            <View style={tw`mt-8`}>
              <YesNoButtons />
            </View>
          )}
          {item.options && (
            <View style={tw`flex-col justify-center`}>
              {Object.entries(item.options!).map(([key, value], i) => (
                <OptionsButtons key={i} objkey={key} value={value} />
              ))}
            </View>
          )}
          {item.scale && <View>{ScaleComponent()}</View>}
        </View>
      )}
      <View style={tw`mt-2 flex-row items-center`}>
        <AntDesign name="tags" size={24} color="gray" style={tw`mr-3`} />
        {item.tags.map((tag, i, arr) => (
          <Text
            key={i}
            style={tw`text-stone-800 dark:text-slate-300 text-xs mr-2`}
          >
            {tag.toUpperCase()}
            {i === arr.length - 1 ? "" : ","}
          </Text>
        ))}
      </View>
    </View>
  );
};
