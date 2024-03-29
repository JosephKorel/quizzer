import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  FlatList,
  Image,
  ListRenderItem,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppContext, Questions, UserInt } from "../Context";
import tw from "../Components/tailwind_config";
import { EvilIcons, MaterialIcons } from "@expo/vector-icons";
import { PresenceTransition } from "native-base";
import { QuestionComponent } from "./questions_components";
import { Translate } from "./nativeBase_Components";
import { Slider } from "@miblanchard/react-native-slider";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useAppColorScheme } from "twrnc";

interface MyModalInt {
  props: {
    group: UserInt[];
    userList: ListRenderItem<UserInt>;
    showModal: boolean;
    setShowModal: (e: boolean) => void;
  };
}

export const UserListModal = ({ props }: MyModalInt): JSX.Element => {
  const { group, userList, showModal, setShowModal } = props;
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
        <TouchableOpacity
          style={tw.style(
            "relative z-10 h-2/3 w-[90%] min-h-2/3 min-w-[90%] bg-dark rounded-md"
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
              color="white"
              style={tw`p-2`}
            />
          </TouchableOpacity>
          <View style={tw.style("p-2")}>
            <FlatList data={group} renderItem={userList}></FlatList>
          </View>
        </TouchableOpacity>
      </PresenceTransition>
    </TouchableOpacity>
  );
};

interface QuestionModalInt {
  showQst: boolean;
  setShowQst: (e: boolean) => void;
  children: JSX.Element;
}

export const CustomQuestionModal = ({
  showQst,
  setShowQst,
  children,
}: QuestionModalInt): JSX.Element => {
  const { colorScheme } = useContext(AppContext);

  return (
    <TouchableOpacity
      style={tw.style(
        "absolute top-0 w-full h-full flex-col justify-center items-center",
        { backgroundColor: "rgba(52, 52, 52, 0.8)" }
      )}
      onPress={() => setShowQst(false)}
    >
      <PresenceTransition
        visible={showQst}
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
        <TouchableOpacity
          style={tw.style(
            "relative z-10 h-2/3 w-[96%] min-h-2/3 min-w-[96%] bg-sun dark:bg-violet rounded-md"
          )}
          onPress={() => setShowQst(true)}
          activeOpacity={1}
        >
          <TouchableOpacity
            style={tw.style("self-end")}
            onPress={() => setShowQst(false)}
          >
            <MaterialIcons
              name="close"
              size={24}
              color={colorScheme === "light" ? "black" : "white"}
              style={tw`mr-2 p-2`}
            />
          </TouchableOpacity>
          <View>{children}</View>
        </TouchableOpacity>
      </PresenceTransition>
    </TouchableOpacity>
  );
};

export const MyQuestionComponent = ({ question }: { question: Questions }) => {
  const { colorScheme } = useContext(AppContext);
  const YesNoButtons = (): JSX.Element => {
    return (
      <View style={tw`flex-row justify-around items-center`}>
        <View style={tw``}>
          <TouchableOpacity style={tw.style("bg-black")}>
            <Text
              style={tw.style(
                "text-slate-100 bg-persian dark:text-stone-800 dark:bg-sun font-bold p-1 px-2 text-2xl",
                Translate.translate
              )}
            >
              SIM {question.votes?.yes.length}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={tw``}>
          <TouchableOpacity style={tw.style("bg-black")}>
            <Text
              style={tw.style(
                "text-slate-100 bg-persian dark:text-stone-800 dark:bg-sun p-1 px-2 font-bold text-2xl",
                Translate.translate
              )}
            >
              NÃO {question.votes?.no.length}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const OptionsComponent = ({
    qstkey,
    value,
  }: {
    qstkey: string;
    value: string[];
  }): JSX.Element => {
    return (
      <View style={tw`mt-4`}>
        <View style={tw`bg-black`}>
          <TouchableOpacity style={Translate.translate}>
            <Text
              style={tw.style(
                "text-2xl italic text-center text-slate-100 bg-persian dark:text-stone-800 dark:bg-sun font-bold"
              )}
            >
              {qstkey}: {value.length}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const ScaleComponent = () => {
    let totalValues: number[] = [];

    question.scale?.forEach((item) => totalValues.push(item.value));

    const valueSum = totalValues.reduce((acc, curr) => {
      acc += curr;
      return acc;
    }, 0);

    const averageAnswer: number =
      totalValues.length != 0 ? valueSum / totalValues.length : 0;

    return (
      <View style={tw`mt-4 flex-col justify-between`}>
        <Slider
          minimumTrackTintColor={
            colorScheme === "light" ? "#F72585" : "#FAD643"
          }
          thumbTintColor={colorScheme === "light" ? "#F72585" : "#FAD643"}
          minimumValue={0}
          disabled={true}
          maximumValue={10}
          value={averageAnswer}
        ></Slider>
        <View style={tw`mt-4`}>
          <View style={tw`bg-stone-900`}>
            <TouchableOpacity style={tw.style("bg-black")}>
              <Text
                style={tw.style(
                  "text-2xl italic text-slate-100 bg-persian dark:text-stone-800 dark:bg-sun font-bold p-1",
                  Translate.translate
                )}
              >
                RESPOSTA MÉDIA: {averageAnswer.toFixed(1)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  return (
    <View
      style={tw.style(
        "p-2 flex-col justify-evenly flex-1",
        question.media && "justify-between"
      )}
    >
      <View style={tw`flex-col justify-center items-center`}>
        <Text style={tw`absolute text-4xl italic text-stone-800 font-bold`}>
          {question.question}
        </Text>
        <Text
          style={tw.style(
            "text-4xl italic text-persian dark:text-sun font-bold",
            Translate.smallTranslate
          )}
        >
          {question.question}
        </Text>
      </View>
      {question.media && (
        <View style={tw`flex-row justify-center bg-red-200`}>
          <Image
            style={{ width: 300, height: 300, borderRadius: 2 }}
            source={{ uri: question.media }}
          ></Image>
        </View>
      )}
      {question.votes && (
        <View style={tw`mt-2`}>
          <YesNoButtons />
        </View>
      )}
      {question.options && (
        <View style={tw``}>
          {Object.entries(question.options).map(([qstKey, value], index) => (
            <OptionsComponent qstkey={qstKey} value={value} key={index} />
          ))}
        </View>
      )}
      {question.scale && <>{ScaleComponent()}</>}
    </View>
  );
};

export const LoadingScreen = (): JSX.Element => {
  return (
    <View
      style={tw.style(
        "absolute top-0 w-full h-full flex-col justify-center items-center bg-red-200 dark:bg-dark z-20"
      )}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0D0F47" />
      <Text
        style={tw.style(
          "tracking-widest absolute top-1/4 text-6xl text-center text-violet font-bold"
        )}
      >
        QUI
        <Text style={tw.style("italic text-6xl")}>ZZ</Text>
        ER
      </Text>
      <Text
        style={tw.style(
          "tracking-widest absolute top-1/4 text-6xl text-center text-sun font-bold",
          Translate.translate
        )}
      >
        QUI
        <Text style={tw.style("italic text-6xl")}>ZZ</Text>
        ER
      </Text>
      <Text
        style={tw.style(
          "tracking-widest absolute top-1/4 text-6xl text-center text-persian font-bold",
          Translate.smallTranslate
        )}
      >
        QUI
        <Text style={tw.style("italic text-6xl")}>ZZ</Text>
        ER
      </Text>
    </View>
  );
};

export const LoadingComponent = (): JSX.Element => {
  const rotation = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotateZ: `${rotation.value}deg`,
        },
      ],
    };
  }, [rotation.value]);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1
    );
    return () => cancelAnimation(rotation);
  }, []);

  return (
    <View
      style={tw.style(
        "absolute top-0 w-full h-full flex-col justify-center items-center bg-red-200 dark:bg-dark z-20"
      )}
    >
      <Animated.View style={tw.style("p-1", animatedStyles)}>
        <EvilIcons name="spinner-3" size={44} color="#F72585" />
      </Animated.View>
    </View>
  );
};
