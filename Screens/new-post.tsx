import React, { useContext, useEffect, useState } from "react";
import { Button, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { propsStack } from "./RootStackPrams";
import { AppContext } from "../Context";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase_config";

function NewPost() {
  const { user } = useContext(AppContext);
  const [question, setQuestion] = useState("");
  const [choice, setChoice] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [success, setSuccess] = useState(false);

  const navigation = useNavigation<propsStack>();

  const questionType = ["Sim ou Não", "Enquete"];

  const clearMsg = () => {
    setSuccess(false);
  };

  const addQuestion = () => {
    const id = Date.now().toString();
    const date = new Date().toLocaleDateString();
    if (user) {
      if (!question) return;
      else if (choice === "Sim ou Não")
        setDoc(doc(db, "questionsdb", id), {
          id,
          author: { name: user.name, uid: user.uid },
          question,
          votes: { yes: [], no: [] },
          date,
        })
          .then(() => {
            setSuccess(true);
            setTimeout(clearMsg, 2000);
            setChoice("");
          })
          .catch((error) => console.log(error));
      else if (choice === "Enquete") {
        let allOptions = {};
        options.forEach(
          (option) => (allOptions = { ...allOptions, [option]: [] })
        );

        setDoc(doc(db, "questionsdb", id), {
          id,
          author: { name: user.name, uid: user.uid },
          question,
          options: allOptions,
          date,
        })
          .then(() => {
            setSuccess(true);
            setTimeout(clearMsg, 2000);
            setOptions(["", ""]);
            setChoice("");
            setQuestion("");
          })
          .catch((error) => console.log(error));
      }
    }
  };

  //Inputs para a enquete
  const OptionMap = () => {
    const addOption = () => {
      setOptions([...options, ""]);
    };

    const removeOption = () => {
      const newOption = options.slice();
      newOption.pop();
      setOptions(newOption);
    };
    return (
      <View>
        {options.map((item, index) => (
          <View key={index}>
            <View style={{ display: "flex", flexDirection: "row" }}>
              <TextInput
                placeholder={"Opção" + (index + 1).toString()}
                value={item}
                maxLength={18}
                onChangeText={(text) => {
                  setOptions(
                    options.map((value, i) => (index === i ? text : value))
                  );
                }}
              ></TextInput>
              {options.length > 2 && index === options.length - 1 && (
                <TouchableOpacity onPress={removeOption}>
                  <Text>Remover</Text>
                </TouchableOpacity>
              )}
            </View>
            {index >= options.length - 1 && index < 3 && (
              <TouchableOpacity onPress={addOption}>
                <Text>Adicionar</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View>
      <Text>O que você quer perguntar?</Text>
      <TextInput
        placeholder="Escreva aqui"
        value={question}
        onChangeText={(text) => setQuestion(text)}
      ></TextInput>
      <Text>Sua pergunta é do tipo</Text>
      {questionType.map((question, index) => (
        <TouchableOpacity
          onPress={() => setChoice(questionType[index])}
          style={{ padding: 10 }}
          key={index}
        >
          <Text>{question}</Text>
        </TouchableOpacity>
      ))}
      {choice === "Enquete" && OptionMap()}
      <Button onPress={addQuestion} title="Perguntar"></Button>
      {success && <Text>Postado!</Text>}
      <Button
        onPress={() => navigation.navigate("Login")}
        title="Login"
      ></Button>
      <Button onPress={() => navigation.navigate("Home")} title="Home"></Button>
    </View>
  );
}

export default NewPost;