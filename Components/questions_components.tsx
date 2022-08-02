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
import tailwind from "twrnc";
import { Translate } from "./nativeBase_Components";
import { AntDesign } from "@expo/vector-icons";

export const QuestionComponent = ({
  item,
  questions,
}: {
  item: Questions;
  questions: Questions[];
}) => {
  const { user, theme, setTheme } = useContext(AppContext);
  const [reveal, setReveal] = useState(false);

  const onVote = async (choice: string): Promise<void | null> => {
    const hasVoted = item.hasVoted;

    //Usuário já votou?
    if (hasVoted.includes(user!.uid)) return;

    const id = item.id;
    let currVotes = item.votes;
    let currViews = item.views;
    const docRef = doc(db, "questionsdb", id);

    if (choice === "yes") {
      let qstSlice = questions.slice();

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
        /*  setQuestions(qstSlice!); */
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
        item.votes = currVotes;
        item.hasVoted.push(user!.uid);

        /*  setQuestions(qstSlice!); */
      } catch (error) {
        console.log(error);
        return null;
      }
    }
  };

  const YesNoButtons = (): JSX.Element => {
    const hasVoted = (): boolean => {
      const filter = item.hasVoted.includes(auth.currentUser?.uid!);
      return filter;
    };

    return (
      <View style={tailwind`flex-row justify-around items-center`}>
        <View style={tailwind`bg-stone-900`}>
          <TouchableOpacity
            onPress={() => onVote("yes")}
            style={Translate.smallTranslate}
          >
            <Text style={tailwind`text-slate-50 font-bold text-2xl`}>
              SIM {hasVoted() && item.votes?.yes.length}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={tailwind`bg-stone-900`}>
          <TouchableOpacity
            onPress={() => onVote("no")}
            style={Translate.smallTranslate}
          >
            <Text style={tailwind`text-slate-50 font-bold text-2xl`}>
              NÃO {hasVoted() && item.votes?.no.length}
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
      const filter = item.hasVoted.includes(auth.currentUser?.uid!);
      return filter;
    };

    return (
      <View>
        <View style={tailwind`bg-stone-900 mt-5`}>
          <TouchableOpacity
            onPress={() => onVote("yes")}
            style={Translate.smallTranslate}
          >
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
      item.scale?.forEach((item) => totalValues.push(item.value));
    }

    const valueSum = totalValues.reduce((acc, curr) => {
      acc += curr;
      return acc;
    }, 0);

    const averageAnswer: number = valueSum / totalValues.length;

    return (
      <View style={tailwind`mt-10`}>
        {/* <Slider
          minimumTrackTintColor="#F72585"
          thumbTintColor="#F72585"
          minimumValue={0}
          maximumValue={10}
          value={currScaleVal()}
          onValueChange={(value) => setScaleVal(value)}
          renderAboveThumbComponent={() => custom(scaleVal, index)}
          onSlidingComplete={onChangeScale}
          onSlidingStart={onSliding}
        ></Slider> */}
        {item.hasVoted.includes(user?.uid!) && (
          <View>
            <View style={tailwind`bg-stone-900 mt-8`}>
              <TouchableOpacity style={Translate.smallTranslate}>
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

  return (
    <View style={tailwind``}>
      {item.hasSpoiler === true && reveal === false ? (
        <View style={tailwind.style("mt-8 p-4 bg-[#F72585]")}>
          <Text
            style={tailwind.style("text-slate-100 font-bold italic text-3xl")}
          >
            Cuidado! Esta pergunta contém spoiler, tem certeza de que quer ver?
          </Text>
          <View style={tailwind.style("flex-row justify-center mt-4")}>
            <TouchableOpacity
              style={tailwind.style("bg-stone-800")}
              onPress={() => {
                setReveal(true);
              }}
            >
              <Text
                style={tailwind.style(
                  "text-lg italic p-2 px-3 bg-[#4fea74] text-stone-700 text-center font-bold",
                  Translate.smallTranslate
                )}
              >
                SIM
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
              {item.question}
            </Text>
            <Text
              style={tailwind.style(
                "text-4xl italic text-[#F72585] font-bold text-center",
                Translate.xsTranslate
              )}
            >
              {item.question}
            </Text>
          </View>
          {item.media && (
            <View style={tailwind`flex-row justify-center`}>
              <Image
                style={{ width: 300, height: 300, borderRadius: 2 }}
                source={{ uri: item.media }}
              ></Image>
            </View>
          )}
          {item.votes && (
            <View style={tailwind`mt-8`}>
              <YesNoButtons />
            </View>
          )}
          {item.options && (
            <View style={tailwind`flex-col justify-center`}>
              {Object.entries(item.options!).map(([key, value], i) => (
                <OptionsButtons key={i} objkey={key} value={value} />
              ))}
            </View>
          )}
          {item.scale && <View>{ScaleComponent()}</View>}
        </View>
      )}
      <View style={tailwind`mt-2 flex-row items-center`}>
        <AntDesign name="tags" size={24} color="gray" style={tailwind`mr-3`} />
        {item.tags.map((tag, i, arr) => (
          <Text key={i} style={tailwind`text-slate-500 text-xs mr-2`}>
            {tag.toUpperCase()}
            {i === arr.length - 1 ? "" : ","}
          </Text>
        ))}
      </View>
    </View>
  );
};
