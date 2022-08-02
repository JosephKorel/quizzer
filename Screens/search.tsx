import { MaterialIcons } from "@expo/vector-icons";
import { collection, getDocs, query } from "firebase/firestore";
import { Avatar } from "native-base";
import React, { useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import tailwind from "twrnc";
import { BottomNav, Translate } from "../Components/nativeBase_Components";
import { AppContext } from "../Context";
import { db } from "../firebase_config";

interface UsersInt {
  name: string;
  avatar: string;
}

function Search() {
  const { user, theme, setTheme, questions, setQuestions } =
    useContext(AppContext);

  const [users, setUsers] = useState<UsersInt[] | null>(null);
  const [search, setSearch] = useState("");

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

  const usersFilter: UsersInt[] | undefined =
    search.length > 2
      ? users?.filter((user) =>
          user.name.toLowerCase().includes(search.toLowerCase())
        )
      : [];

  const Item = ({ avatar, name }: UsersInt) => (
    <View style={tailwind.style("flex-row items-center")}>
      <Avatar source={{ uri: avatar }} />
      <Text>{name}</Text>
    </View>
  );

  const userComponent = ({ item }: { item: UsersInt }) => {
    return (
      <View style={tailwind.style("flex-row items-center")}>
        <Avatar source={{ uri: item.avatar }} />
        <Text style={tailwind.style("text-slate-100 text-lg font-semibold")}>
          {item.name}
        </Text>
      </View>
    );
  };

  const handleSearch = async () => {};

  return (
    <View
      style={tailwind.style(
        theme === "light" ? "bg-red-200" : "bg-[#0d0f47]",
        "w-full h-full"
      )}
    >
      <View style={tailwind`w-11/12 mx-auto`}>
        <View style={tailwind`absolute top-10 w-full z-10`}>
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
          <View style={tailwind.style("bg-[#FAD643]")}>
            <Text
              style={tailwind.style(
                "text-slate-100 bg-[#F72585] font-bold text-lg p-1 italic",
                Translate.smallTranslate
              )}
            >
              PESQUISE POR TAGS OU PESSOAS
            </Text>
          </View>
          <TextInput
            placeholder="Digite aqui"
            style={tailwind.style("bg-slate-200 mt-2")}
            value={search}
            onChangeText={(text) => setSearch(text)}
          />
          <View>
            {search.length > 2 && (
              <FlatList data={usersFilter} renderItem={userComponent} />
            )}
          </View>
        </View>
      </View>
      <BottomNav />
    </View>
  );
}

export default Search;
