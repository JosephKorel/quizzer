import {
  MaterialCommunityIcons,
  MaterialIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { collection, DocumentData, getDocs, query } from "firebase/firestore";
import { Avatar } from "native-base";
import React, { useContext, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "../Components/tailwind_config";
import { BottomNav, Translate } from "../Components/nativeBase_Components";
import { QuestionComponent } from "../Components/questions_components";
import { AppContext, Questions } from "../Context";
import { db } from "../firebase_config";

interface UsersInt {
  name: string;
  avatar: string;
}

function Search() {
  const { user, theme, setTheme, questions, setQuestions } =
    useContext(AppContext);

  const [users, setUsers] = useState<UsersInt[] | null>(null);
  const [tagFilter, setTagFilter] = useState<Questions[]>([]);
  const [search, setSearch] = useState("");
  const [showQst, setShowQst] = useState(false);

  const retrieveCollection = async (
    sortViews: boolean,
    sortAnswered: boolean
  ) => {
    //Array que recebe cada documento
    let questionDocs: Questions[] = [];

    //Query da coleção
    const questionCol = collection(db, "questionsdb");
    const colQuery = query(questionCol);
    const querySnapshot = await getDocs(colQuery);
    querySnapshot.forEach((doc: DocumentData) => questionDocs.push(doc.data()));

    if (sortViews) {
      //Sort pelo número de votos
      questionDocs.sort((a, b) => {
        if (a.views > b.views) return -1;
        else return 1;
      });
    } else if (sortAnswered) {
      //Sort pelas perguntas ainda não respondidas
      questionDocs.sort((a, b) => {
        if (a.hasVoted.includes(user!.uid)) return 1;
        else return -1;
      });
    }
    setQuestions(questionDocs);
  };

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
    search.length > 2
      ? users?.filter((user) =>
          user.name.toLowerCase().includes(search.toLowerCase())
        )
      : [];

  useEffect(() => {
    searchForTag();
  }, [search]);

  const userComponent = ({ item }: { item: UsersInt }) => {
    return (
      <View style={tw.style("flex-row items-center mt-2")}>
        <Avatar source={{ uri: item.avatar }} />
        <View style={tw.style("bg-persian w-full")}>
          <View
            style={tw.style(
              "flex-row items-center bg-sun w-full",
              Translate.smallTranslate
            )}
          >
            <Text
              style={tw.style("text-stone-700 text-lg font-semibold p-1 w-2/3")}
            >
              {item.name}
            </Text>
            <View style={tw.style("flex-row items-center")}>
              <TouchableOpacity>
                <MaterialCommunityIcons
                  name="guy-fawkes-mask"
                  size={24}
                  color="black"
                  style={tw.style("mr-4")}
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <SimpleLineIcons name="user-follow" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderQuestions = ({ item }: { item: Questions }) => {
    return (
      <QuestionComponent
        item={item}
        filter={tagFilter}
        setFilter={setTagFilter}
        getQst={retrieveCollection}
      />
    );
  };

  return (
    <View
      style={tw.style(
        theme === "light" ? "bg-red-200" : "bg-[#0d0f47]",
        "w-full h-full"
      )}
    >
      <View style={tw`w-11/12 mx-auto`}>
        <View style={tw`absolute top-10 w-full z-10`}>
          {theme === "dark" ? (
            <MaterialIcons
              name="wb-sunny"
              size={24}
              color="#F72585"
              onPress={() => setTheme("light")}
            />
          ) : (
            <MaterialIcons
              name="nightlight-round"
              size={24}
              color="#0d0f47"
              onPress={() => setTheme("dark")}
            />
          )}
        </View>
        <View style={{ transform: [{ translateY: 80 }] }}>
          <View style={tw.style("bg-[#FAD643]")}>
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
              "flex-row items-center justify-between p-1 rounded-md bg-slate-200 mt-2"
            )}
          >
            <TextInput
              autoComplete="off"
              placeholder="Comece a digitar"
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
          <View style={tw.style("mt-2 flex-row justify-between items-center")}>
            <TouchableOpacity
              onPress={() => setShowQst(false)}
              style={tw.style("bg-stone-800")}
            >
              <Text
                style={tw.style(
                  "text-slate-100 bg-[#F72585] font-bold text-lg p-1 italic",
                  Translate.smallTranslate
                )}
              >
                PESSOAS: {usersFilter?.length}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowQst(true)}
              style={tw.style("bg-stone-800")}
            >
              <Text
                style={tw.style(
                  "text-slate-100 bg-persian font-bold text-lg p-1 italic",
                  Translate.smallTranslate
                )}
              >
                PERGUNTAS: {tagFilter.length}
              </Text>
            </TouchableOpacity>
          </View>
          {!showQst ? (
            <View>
              {search.length > 2 && (
                <FlatList data={usersFilter} renderItem={userComponent} />
              )}
            </View>
          ) : (
            <View>
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
