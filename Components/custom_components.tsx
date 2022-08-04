import React, { useContext, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ListRenderItem,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Questions, UserInt } from "../Context";
import tw from "../Components/tailwind_config";
import { MaterialIcons } from "@expo/vector-icons";
import { PresenceTransition } from "native-base";
import { QuestionComponent } from "./questions_components";
import { Translate } from "./nativeBase_Components";
import { Slider } from "@miblanchard/react-native-slider";

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
            "relative z-10 h-2/3 w-5/6 min-h-2/3 min-w-5/6 bg-dark rounded-md"
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
          <View>
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
            "relative z-10 h-2/3 w-[96%] min-h-2/3 min-w-[96%] bg-dark rounded-md"
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
              color="white"
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
  const YesNoButtons = (): JSX.Element => {
    return (
      <View style={tw`flex-row justify-around items-center`}>
        <View style={tw``}>
          <TouchableOpacity style={tw.style("bg-stone-900")}>
            <Text
              style={tw.style(
                "text-slate-50 bg-[#F72585] font-bold p-1 px-2 text-2xl",
                Translate.translate
              )}
            >
              SIM {question.votes?.yes.length}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={tw``}>
          <TouchableOpacity style={tw.style("bg-stone-900")}>
            <Text
              style={tw.style(
                "text-slate-50 bg-[#F72585] p-1 px-2 font-bold text-2xl",
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
        <View style={tw`bg-slate-100`}>
          <TouchableOpacity style={Translate.translate}>
            <Text
              style={tw.style(
                "text-2xl",
                "italic",
                "text-center",
                "bg-[#F72585]",
                "text-slate-100",
                "font-bold"
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
    const custom = (value: number | Array<number>) => {
      const labels = question.labels!;

      if (value < 2)
        return (
          <Text style={tw`italic text-lg text-slate-50`}>{labels[0]}</Text>
        );
      if (value < 6)
        return (
          <Text style={tw`italic text-lg text-slate-50`}>{labels[1]}</Text>
        );
      if (value > 6)
        return (
          <View style={tw`flex-col justify-center items-center`}>
            <Text style={tw`absolute text-lg italic text-stone-800 font-bold`}>
              {labels[2]}
            </Text>
            <Text
              style={tw.style(
                "text-lg italic text-[#F72585] font-bold",
                Translate.xsTranslate
              )}
            >
              {labels[2]}
            </Text>
          </View>
        );
    };
    let totalValues: number[] = [];

    question.scale?.forEach((item) => totalValues.push(item.value));

    const valueSum = totalValues.reduce((acc, curr) => {
      acc += curr;
      return acc;
    }, 0);

    const averageAnswer: number = valueSum / totalValues.length;

    return (
      <View style={tw`mt-4 flex-col justify-between`}>
        <Slider
          minimumTrackTintColor="#F72585"
          thumbTintColor="#F72585"
          minimumValue={0}
          disabled={true}
          maximumValue={10}
          value={averageAnswer}
          renderAboveThumbComponent={() => custom(averageAnswer)}
        ></Slider>
        <View style={tw`mt-4`}>
          <View style={tw`bg-stone-900`}>
            <TouchableOpacity style={tw.style("bg-stone-800")}>
              <Text
                style={tw.style(
                  "text-2xl italic bg-[#F72585] text-slate-100 font-bold",
                  Translate.translate
                )}
              >
                RESPOSTA MÉDIA: {averageAnswer}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  return (
    <View style={tw`h-full p-2 flex-col justify-evenly`}>
      <View style={tw`flex-col justify-center items-center`}>
        <Text style={tw`absolute text-4xl italic text-stone-800 font-bold`}>
          {question.question}
        </Text>
        <Text
          style={tw.style(
            "text-4xl italic text-[#F72585] font-bold",
            Translate.smallTranslate
          )}
        >
          {question.question}
        </Text>
      </View>
      {question.media && (
        <View style={tw`flex-row justify-center`}>
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
