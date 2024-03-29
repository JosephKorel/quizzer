import React, { useContext, useEffect, useState } from "react";
import {
  Image,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AppContext } from "../Context";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../firebase_config";
import * as ImagePicker from "expo-image-picker";
import moment from "moment";
import tw from "../Components/tailwind_config";
import {
  AlertComponent,
  BottomNav,
  Translate,
} from "../Components/nativeBase_Components";
import { MaterialIcons } from "@expo/vector-icons";
import { Button, IconButton, PresenceTransition } from "native-base";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";

function NewPost() {
  const { user, colorScheme, toggleColorScheme } = useContext(AppContext);
  const [choice, setChoice] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [image, setImage] = useState<null | any>(null);
  const [tags, setTags] = useState("");
  const [hasSpoiler, setHasSpoiler] = useState(false);
  const [scaleLabel, setScaleLabel] = useState(["Meh", "Cool", "Awesome"]);
  const [hasChoosen, setHasChoosen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const questionType = ["Sim ou Não", "Enquete", "Escala de 0 a 10"];

  useEffect(() => {
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 2000);
  }, [error, success]);

  useEffect(() => {
    choice === "Enquete" && setHasChoosen(true);
  }, [choice]);

  const addImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status === "granted") {
      let img = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      !img.cancelled && setImage(img);
    }
  };

  const uploadImageAsync = async (uri: string) => {
    const id = Date.now().toString();
    const blob: Blob | any = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    const imgRef = ref(storage, user?.uid + id);
    await uploadBytes(imgRef, blob);

    blob.close();

    const url = await getDownloadURL(imgRef);
    try {
      return url;
    } catch (error) {
      setError("Erro ao carregar imagem, tente novamente");
      return null;
    }
  };

  const addDoc = async (
    tags: string[],
    votes: {} | null,
    options: {} | null,
    scale: [] | null,
    labels: string[] | null
  ) => {
    const id = Date.now().toString();
    const date = moment(new Date()).format("DD/MM/YYYY");

    if (image !== null) {
      try {
        const url = await uploadImageAsync(image.uri);

        await setDoc(doc(db, "questionsdb", id), {
          id,
          author: { name: user!.name, uid: user!.uid, avatar: user?.avatar },
          question,
          media: url,
          votes,
          options,
          scale,
          labels,
          tags,
          hasSpoiler,
          hasVoted: [],
          views: 0,
          date,
        });

        setSuccess("Pergunta enviada!");

        setQuestion("");
        setImage(null);
        setTags("");
        setChoice("");
        setHasChoosen(false);
      } catch (error) {
        setError("Erro ao carregar imagem, tente novamente");
        return null;
      }
    } else
      try {
        await setDoc(doc(db, "questionsdb", id), {
          id,
          author: { name: user!.name, uid: user!.uid, avatar: user?.avatar },
          question,
          votes,
          options,
          scale,
          labels,
          tags,
          hasSpoiler,
          hasVoted: [],
          views: 0,
          date,
        });

        setSuccess("Pergunta enviada!");

        setTags("");
        setQuestion("");
        setChoice("");
        setHasChoosen(false);
      } catch (error) {
        setError("Houve algum erro, tente novamente");
        return null;
      }
  };

  const addQuestion = async (): Promise<void | null> => {
    if (!user) return null;
    else if (question === "") {
      setError("Escreva sua pergunta");
      return null;
    } else if (tags === "") {
      setError("Adicione pelo menos uma tag à pergunta");
      return null;
    }

    if (user && question && tags) {
      //Põe as tags num array
      const inputTags = tags.toLowerCase().split(",");
      const newTags: string[] = [];
      inputTags.forEach((tag) => {
        newTags.push(tag.trim());
      });

      if (choice === "Sim ou Não") {
        const votes = { yes: [], no: [] };
        await addDoc(newTags.slice(0, 3), votes, null, null, null);

        return;
      }
      if (choice === "Enquete") {
        let allOptions = {};

        //Adiciona as opções do input
        options.forEach(
          (option) => (allOptions = { ...allOptions, [option]: [] })
        );
        await addDoc(newTags.slice(0, 3), null, allOptions, null, null);

        return;
      }
      if (choice === "Escala de 0 a 10") {
        await addDoc(newTags.slice(0, 3), null, null, [], scaleLabel);

        return;
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
        <View style={tw`mb-1 bg-black dark:bg-persian`}>
          <Text
            style={tw.style(
              "text-lg italic py-1 bg-emerald text-stone-700 text-center font-bold",
              Translate.smallTranslate
            )}
          >
            ENQUETE
          </Text>
        </View>
        <View style={tw`flex-col`}>
          {options.map((item, index) => (
            <View key={index}>
              <View
                style={tw`flex-row items-center mt-2 border border-stone-800 dark:border-persian bg-slate-100`}
              >
                <TextInput
                  placeholder={"Opção" + (index + 1).toString()}
                  value={item}
                  style={tw` text-stone-900 flex-1 p-1 rounded-sm `}
                  maxLength={18}
                  onChangeText={(text) => {
                    setOptions(
                      options.map((value, i) => (index === i ? text : value))
                    );
                  }}
                ></TextInput>
                {options.length > 2 && index === options.length - 1 && (
                  <TouchableOpacity onPress={removeOption}>
                    <MaterialIcons name="delete" size={24} color="black" />
                  </TouchableOpacity>
                )}
              </View>
              {index >= options.length - 1 && index < 3 && (
                <TouchableOpacity
                  onPress={addOption}
                  style={tw`bg-black dark:bg-persian self-start mt-2`}
                >
                  <Text
                    style={tw.style(
                      "text-base italic p-1 px-2 bg-sun text-stone-800 font-bold",
                      Translate.smallTranslate
                    )}
                  >
                    Adicionar
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
        <View style={tw`flex-row-reverse`}>
          <Button
            style={tw`w-1/4 mt-2`}
            _text={{ color: "black" }}
            bg="#fad643"
            _pressed={{ background: "#fdc500" }}
            leftIcon={
              <MaterialIcons name="arrow-back-ios" size={20} color="black" />
            }
            onPress={() => {
              setChoice("");
              setHasChoosen(false);
            }}
          >
            Voltar
          </Button>
        </View>
      </View>
    );
  };

  const QuestionTypeComponent = ({ qst }: { qst: string }): JSX.Element => {
    const onChoose = (qst: string): void | null => {
      if (question === "") {
        setError("Primeiro escreva sua pergunta");
        return null;
      }
      setChoice(qst);
    };
    return (
      <View style={tw`mt-4`}>
        <View style={tw`bg-black dark:bg-persian`}>
          <TouchableOpacity
            onPress={() => onChoose(qst)}
            style={Translate.translate}
          >
            <Text
              style={tw.style(
                "text-2xl italic text-center font-bold",
                choice === qst ? "bg-emerald" : "bg-sun",
                choice === qst ? "text-slate-100" : "text-stone-700"
              )}
            >
              {qst}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={tw.style("bg-red-200 dark:bg-dark w-full h-full")}>
      <StatusBar
        barStyle={colorScheme === "light" ? "dark-content" : "light-content"}
        backgroundColor={colorScheme === "light" ? "#fecaca" : "#0D0F47"}
      />
      <View style={tw.style("w-11/12 mx-auto")}>
        <View style={tw`absolute top-10 z-10`}>
          {colorScheme === "dark" ? (
            <TouchableOpacity
              onPress={() => toggleColorScheme()}
              style={tw.style("rounded-full")}
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
        <View style={tw.style("h-full flex-col justify-center")}>
          <View style={tw.style("h-5/6 flex-col justify-between")}>
            <View>
              <View
                style={tw.style("border-l-8 border-b-8 rounded-lg bg-sun mt-4")}
              >
                <Text
                  style={tw.style(
                    "text-2xl italic p-4 bg-persian text-slate-100 text-center font-bold",
                    Translate.translate
                  )}
                >
                  {hasChoosen
                    ? question.toUpperCase()
                    : "QUAL É A DÚVIDA DE HOJE?"}
                </Text>
              </View>
              {!hasChoosen && (
                <>
                  <TextInput
                    placeholder="Escreva aqui"
                    value={question}
                    style={tw.style(
                      "bg-slate-100 rounded-sm p-3 text-xl border-stone-800 dark:border-persian border mt-2"
                    )}
                    onChangeText={(text) => setQuestion(text)}
                  ></TextInput>

                  {image ? (
                    <View style={tw.style("flex-row justify-center mt-1")}>
                      <Image
                        style={tw.style(
                          { width: 100, height: 100 },
                          "rounded-md border-2 border-persian"
                        )}
                        source={{ uri: image.uri }}
                      ></Image>
                      <IconButton
                        style={tw`absolute left-[53%]`}
                        onPress={() => setImage(null)}
                        _pressed={{ bg: "#edc531" }}
                        py={1}
                        size="sm"
                        icon={
                          <MaterialCommunityIcons
                            name="close-box-multiple"
                            size={24}
                            color="#fad643"
                          />
                        }
                      />
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={tw`bg-black dark:bg-persian self-start mt-2`}
                      onPress={addImage}
                    >
                      <Text
                        style={tw.style(
                          "text-sm italic px-2 bg-sun text-stone-800 font-bold",
                          Translate.xsTranslate
                        )}
                      >
                        IMAGEM{" "}
                        {
                          <MaterialCommunityIcons
                            name="upload"
                            size={18}
                            color="#212529"
                          />
                        }
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
            {hasChoosen == true && choice === "Enquete" ? (
              <>{choice === "Enquete" && OptionMap()}</>
            ) : (
              <>
                <PresenceTransition
                  visible={!hasChoosen}
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
                  <View style={tw`bg-black dark:bg-turquoise self-start`}>
                    <Text
                      style={tw.style(
                        "text-xl italic p-2 bg-violet text-slate-50 font-bold",
                        Translate.smallTranslate
                      )}
                    >
                      SUA PERGUNTA É DO TIPO
                    </Text>
                  </View>
                  <View style={tw``}>
                    {questionType.map((question, index) => (
                      <QuestionTypeComponent qst={question} key={index} />
                    ))}
                  </View>
                </PresenceTransition>
              </>
            )}

            <View style={tw`mt-6`}>
              <View style={tw.style("self-start bg-black dark:bg-turquoise")}>
                <Text
                  style={tw.style(
                    "text-sm px-2 italic self-start text-center bg-violet text-slate-100 font-bold",
                    Translate.xsTranslate
                  )}
                >
                  TAGS{" "}
                  {
                    <MaterialCommunityIcons
                      name="tag-multiple"
                      size={18}
                      color="white"
                    />
                  }
                </Text>
              </View>
              <TextInput
                style={tw.style(
                  "bg-slate-100 rounded-sm text-base border-stone-800 dark:border-persian border mt-1 p-1"
                )}
                placeholder="Ex: pessoal, curiosidade, super heróis, netflix"
                value={tags}
                onChangeText={(text) => setTags(text)}
              ></TextInput>

              <TouchableOpacity
                onPress={() => setHasSpoiler(!hasSpoiler)}
                style={tw.style(
                  "flex-row items-center bg-black dark:bg-turquoise self-start mt-2"
                )}
              >
                <Text
                  style={tw.style(
                    "text-base px-2 italic text-center font-bold text-slate-100",
                    hasSpoiler ? "bg-emerald" : "bg-[#e71d36]",
                    Translate.smallTranslate
                  )}
                >
                  {hasSpoiler
                    ? "Não contém spoiler  "
                    : "Marcar como spoiler  "}
                  {hasSpoiler ? (
                    <MaterialCommunityIcons
                      name="shield-off"
                      size={20}
                      color="white"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="shield"
                      size={20}
                      color="white"
                    />
                  )}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={tw.style(
                "text-slate-100 bg-black dark:bg-sun self-start mx-auto"
              )}
              onPress={addQuestion}
            >
              <Text
                style={tw.style(
                  "text-slate-100 bg-persian font-bold text-3xl italic px-2",
                  Translate.translate
                )}
              >
                ENVIAR {<FontAwesome name="send-o" size={24} color="white" />}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {error !== "" && <AlertComponent success={success} error={error} />}
      {success !== "" && <AlertComponent success={success} error={error} />}
      <BottomNav />
    </View>
  );
}

export default NewPost;
