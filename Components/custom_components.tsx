import React, { useContext, useEffect, useState } from "react";
import { FlatList, ListRenderItem, TouchableOpacity, View } from "react-native";
import { Questions, UserInt } from "../Context";
import tw from "../Components/tailwind_config";
import { MaterialIcons } from "@expo/vector-icons";
import { PresenceTransition } from "native-base";
import { QuestionComponent } from "./questions_components";

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
            "relative z-10 h-2/3 w-5/6 min-h-2/3 min-w-5/6 bg-persian"
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
              color="black"
              style={tw`mr-2`}
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
            "relative z-10 h-2/3 w-5/6 min-h-2/3 min-w-5/6 bg-persian"
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
              color="black"
              style={tw`mr-2`}
            />
          </TouchableOpacity>
          <View>{children}</View>
        </TouchableOpacity>
      </PresenceTransition>
    </TouchableOpacity>
  );
};
