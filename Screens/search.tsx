import { MaterialIcons } from "@expo/vector-icons";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
} from "firebase/firestore";
import { Avatar } from "native-base";
import React, { useContext, useEffect, useState } from "react";
import {
  FlatList,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "../Components/tailwind_config";
import { BottomNav, Translate } from "../Components/nativeBase_Components";
import { QuestionComponent } from "../Components/questions_components";
import { AppContext, Questions, UserInt } from "../Context";
import { db } from "../firebase_config";
import { useNavigation } from "@react-navigation/native";
import { propsStack } from "./RootStackParams";

interface UsersInt {
  name: string;
  uid: string;
  avatar: string;
  followers: UserInt[];
  following: UserInt[];
}

function Search() {
  const { user, questions, colorScheme, toggleColorScheme } =
    useContext(AppContext);

  const [users, setUsers] = useState<UsersInt[] | null>(null);
  const [tagFilter, setTagFilter] = useState<Questions[]>([]);
  const [search, setSearch] = useState("");
  const [showQst, setShowQst] = useState(false);

  const navigation = useNavigation<propsStack>();

  const getUsers = async () => {
    let usersArr: UsersInt[] = [];
    const allUsers = collection(db, "users");
    const userQuery = query(allUsers);
    const querySnap = await getDocs(userQuery);
    querySnap.forEach((item) => {
      const data = item.data() as UsersInt;
      usersArr.push(data);
    });
    setUsers(usersArr);
  };

  useEffect(() => {
    getUsers();
  }, []);

  const searchForTag = (): void => {
    let tags: string[] = [];
    const tagArr = search.toLocaleLowerCase().split(",");

    //Depois de separar por vírgula, retira os espaços
    tagArr.forEach((item) => tags.push(item.trim()));

    const questionFilter = questions?.filter((item) => {
      return item.tags.some((tag) => tags.includes(tag));
    });

    if (questionFilter?.length) {
      setTagFilter(questionFilter);
    } else {
      setTagFilter([]);
    }
  };

  const usersFilter: UsersInt[] | undefined =
    search.length > 1
      ? users?.filter((user) =>
          user.name.toLowerCase().includes(search.toLowerCase())
        )
      : [];

  useEffect(() => {
    searchForTag();
  }, [search]);

  const handleFollow = async (
    uid: string,
    isFollowing: boolean,
    item: UsersInt
  ) => {
    console.log(isFollowing);
    if (!isFollowing) {
      const userDoc = doc(db, "users", uid);
      await updateDoc(userDoc, { followers: arrayUnion(user) });

      //Atualizar o front
      getUsers();
    } else {
      const userDoc = doc(db, "users", uid);
      const filter = item.followers.filter((item) => item.uid !== user!.uid);
      await updateDoc(userDoc, { followers: filter });

      //Atualizar o front
      getUsers();
    }
  };

  const visitProfile = (item: UserInt) => {
    if (item.uid === user?.uid) navigation.navigate("Profile");
    else
      navigation.navigate("UsersProfile", {
        name: item.name!,
        userUid: item.uid,
        avatar: item.avatar!,
      });
  };

  const userComponent = ({ item }: { item: UsersInt }) => {
    return (
      <TouchableOpacity
        style={tw.style(
          "flex-row items-center mt-2 bg-slate-100 border border-stone-800 dark:border-persian rounded-md p-1"
        )}
        onPress={() => visitProfile(item)}
      >
        <Avatar source={{ uri: item.avatar }} size="sm" />
        <Text
          style={tw.style("text-stone-800 text-lg font-bold p-1 flex-1 ml-2")}
        >
          {item.name.toUpperCase()}
        </Text>
      </TouchableOpacity>
    );
  };

  const goToUser = (item: Questions) => {
    if (item.author.uid === user?.uid) navigation.navigate("Profile");
    else
      navigation.navigate("UsersProfile", {
        name: item.author.name,
        userUid: item.author.uid,
        avatar: item.author.avatar,
      });
  };

  const renderQuestions = ({ item }: { item: Questions }) => {
    return (
      <View>
        <View style={tw.style("text-center ")}>
          <View style={tw`flex flex-col items-center `}>
            <TouchableOpacity onPress={() => goToUser(item)}>
              <Avatar
                source={{
                  uri: item.author.avatar,
                }}
              />
            </TouchableOpacity>
            <Text style={tw`text-stone-800 dark:text-slate-300 text-base`}>
              {item.author.name}
            </Text>
          </View>
        </View>
        <QuestionComponent
          item={item}
          filter={tagFilter}
          setFilter={setTagFilter}
        />
        <View
          style={tw`w-full mt-2 mb-5 p-[1px] bg-slate-300 rounded-br-lg rounded-tl-lg`}
        ></View>
      </View>
    );
  };

  return (
    <View style={tw.style("bg-red-200 dark:bg-dark w-full h-full")}>
      <StatusBar
        barStyle={colorScheme === "light" ? "dark-content" : "light-content"}
        backgroundColor={colorScheme === "light" ? "#fecaca" : "#0D0F47"}
      />
      <View style={tw`w-11/12 mx-auto`}>
        <View style={tw`absolute top-10 w-full z-10`}>
          {colorScheme === "dark" ? (
            <TouchableOpacity
              style={tw.style("rounded-full")}
              onPress={() => toggleColorScheme()}
            >
              <MaterialIcons name="wb-sunny" size={24} color="#F72585" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={tw.style("rounded-full")}
              onPress={() => toggleColorScheme()}
            >
              <MaterialIcons
                name="nightlight-round"
                size={24}
                color="#0d0f47"
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={{ transform: [{ translateY: 80 }] }}>
          <View style={tw.style("bg-black dark:bg-sun")}>
            <Text
              style={tw.style(
                "text-slate-100 bg-persian font-bold text-lg p-1 italic",
                Translate.smallTranslate
              )}
            >
              PESQUISE POR TAGS OU PESSOAS
            </Text>
          </View>
          <View
            style={tw.style(
              "flex-row items-center justify-between p-1 rounded-sm bg-slate-200 mt-2"
            )}
          >
            <TextInput
              placeholder="Comece a digitar"
              style={tw.style("p-1 flex-1")}
              value={search}
              onChangeText={(text) => setSearch(text)}
            />
            {search.length ? (
              <MaterialIcons
                name="close"
                size={24}
                color="black"
                style={tw`mr-2`}
                onPress={() => setSearch("")}
              />
            ) : (
              <MaterialIcons
                name="search"
                size={24}
                color="#F72585"
                style={tw`mr-2`}
              />
            )}
          </View>
          <View
            style={tw.style("mt-2 flex-row justify-between items-center mb-4")}
          >
            <TouchableOpacity
              onPress={() => setShowQst(false)}
              style={tw.style("bg-black dark:bg-sun")}
            >
              <Text
                style={tw.style(
                  "text-slate-100 bg-[#F72585] font-bold text-lg p-1 px-2 italic",
                  Translate.smallTranslate
                )}
              >
                PESSOAS: {usersFilter?.length}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowQst(true)}
              style={tw.style("bg-black dark:bg-sun")}
            >
              <Text
                style={tw.style(
                  "text-slate-100 bg-persian font-bold text-lg p-1 px-2 italic",
                  Translate.smallTranslate
                )}
              >
                PERGUNTAS: {tagFilter.length}
              </Text>
            </TouchableOpacity>
          </View>
          {!showQst ? (
            <View style={tw.style("max-h-[75%]")}>
              {search.length > 1 && (
                <FlatList data={usersFilter} renderItem={userComponent} />
              )}
            </View>
          ) : (
            <View style={tw.style("max-h-[75%]")}>
              <FlatList data={tagFilter} renderItem={renderQuestions} />
            </View>
          )}
        </View>
      </View>
      <BottomNav />
    </View>
  );
}

export default Search;
