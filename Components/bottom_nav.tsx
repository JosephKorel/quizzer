import React, { useContext, useEffect, useState } from "react";
import {
  Image,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../firebase_config";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Slider } from "@miblanchard/react-native-slider";
import { AppContext, Questions } from "../Context";
import tailwind from "twrnc";
import { Avatar, Box, Button, IconButton, Input, Slide } from "native-base";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { propsStack } from "../Screens/RootStackParams";

interface BottomNav {
  setTagSearch: (data: boolean) => void;
}

export const BottomNav = ({
  tagSearch,
  setTagSearch,
}: {
  tagSearch?: boolean;
  setTagSearch?: (data: boolean) => void;
}): JSX.Element => {
  const navigation = useNavigation<propsStack>();
  const route = useRoute();

  return (
    <View
      style={tailwind`absolute bottom-4 w-full flex-row justify-around items-center`}
    >
      <IconButton
        style={tailwind`rounded-full`}
        _pressed={{ bg: "#F845967" }}
        icon={
          route.name === "Home" ? (
            <MaterialIcons
              name="search"
              size={24}
              color="#F72585"
              onPress={() => setTagSearch && setTagSearch(!tagSearch)}
            />
          ) : (
            <MaterialCommunityIcons
              name="comment-question"
              size={24}
              color="#F72585"
              onPress={() => navigation.navigate("Home")}
            />
          )
        }
      />
      <IconButton
        style={tailwind`rounded-full`}
        _pressed={{ bg: "#F964A7" }}
        icon={
          <MaterialIcons
            name="add-box"
            size={24}
            color="#F72585"
            onPress={() => navigation.navigate("NewPost")}
          />
        }
      />
      <IconButton
        style={tailwind`rounded-full`}
        _pressed={{ bg: "#F964A7" }}
        icon={
          <MaterialIcons name="my-library-books" size={24} color="#F72585" />
        }
      />

      <IconButton
        style={tailwind`rounded-full`}
        _pressed={{ bg: "#F964A7" }}
        icon={
          <MaterialCommunityIcons
            name="guy-fawkes-mask"
            size={24}
            color="#F72585"
            onPress={() => navigation.navigate("Profile")}
          />
        }
      />
    </View>
  );
};
