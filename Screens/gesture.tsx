import React from "react";
import { StyleSheet, View } from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import tailwind from "twrnc";

type Context = {
  translateX: number;
  translateY: number;
};

function Gesture() {
  let translateX = useSharedValue(0);
  let translateY = useSharedValue(0);

  const GestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    Context
  >({
    onStart: (event, context) => {
      context.translateX = translateX.value;
      context.translateY = translateY.value;
      console.log("Started");
    },
    onActive: ({ translationX, translationY }) => {
      translateX.value = translationX;
      translateY.value = translationY;
      console.log("Hello");
    },
  });

  const styles = StyleSheet.create({
    box: {
      width: 100,
      height: 100,
      backgroundColor: "#F72585",
    },
  });

  const rStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));
  return (
    <View style={tailwind.style("bg-[#0d0f47]", "w-full", "h-full")}>
      <View style={tailwind`w-11/12 mx-auto`}>
        <GestureHandlerRootView>
          <View style={tailwind`flex-col justify-center items-center h-full`}>
            <PanGestureHandler onGestureEvent={GestureHandler}>
              <Animated.View style={[rStyle, styles.box]} />
            </PanGestureHandler>
          </View>
        </GestureHandlerRootView>
      </View>
    </View>
  );
}

export default Gesture;
