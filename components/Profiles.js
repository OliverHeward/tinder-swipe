// @flow
import * as React from "react";
import {
  SafeAreaView, StyleSheet, View, Dimensions
} from "react-native";
import { Feather as Icon } from "@expo/vector-icons";
import {PanGestureHandler, State} from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import type { Profile } from "./Profile";
import Card from "./Card";

const { event, Clock, Value, interpolate, concat, Extrapolate, cond, eq, set, clockRunning, startClock, stopClock, spring, greaterThan, lessThan, and, neq, call, } = Animated; 
const { width, height } = Dimensions.get("window");
const rotatedWidth = width * Math.sin(75 * Math.PI/180) + height * Math.sin (15 * Math.PI/180);

function runSpring(clock, value, velocity, dest) {
  const state = {
    finished: new Value(0),
    velocity: new Value(0),
    position: new Value(0),
    time: new Value(0),
  };

  const config = {
    damping: 7,
    mass: 1,
    stiffness: 121.6,
    overshootClamping: false,
    restSpeedThreshold: 0.001,
    restDisplacementThreshold: 0.001,
    toValue: new Value(0),
  };

  return [
    cond(clockRunning(clock), 0, [
      set(state.finished, 0),
      set(state.velocity, velocity),
      set(state.position, value),
      set(config.toValue, dest),
      startClock(clock)
      ]),
    spring(clock, state, config),
    cond(state.finished, stopClock(clock)),
    state.position,
  ];
}

type ProfilesProps = {
  profiles: Profile[],
};

type ProfilesState = {
  profiles: Profile[],
};

export default class Profiles extends React.PureComponent<ProfilesProps, ProfilesState> {
  constructor(props: ProfilesProps) {
    super(props);
    const { profiles } = props;
    this.state = { profiles };
    this.translationX = new Value(0);
    this.translationY = new Value(0);
    this.velocityX = new Value(0);
    this.gestureState = new Value(State.UNDETERMINED);
    this.onGestureEvent = event([{
      nativeEvent: 
      { 
        translationX: this.translationX,
        translationY: this.translationY,
        velocityX: this.velocityX,
        state: this.gestureState,
    }, }], { useNativeDriver: true });
    this.init();
  }

  init() {
    const { gestureState, translationX, translationY, velocityX, } = this;
    const clockX = new Clock();
    const clockY = new Clock();

    this.translationX.setValue(0);
    this.translationY.setValue(0);
    this.velocityX.setValue(0);
    this.gestureState.setValue(State.UNDETERMINED);
    const snapPoint = cond(and(lessThan(translationX, 0), lessThan(velocityX, -10)),
      - rotatedWidth,
      cond(
        and(greaterThan(translationX, 0), greaterThan(velocityX, 10)),
        rotatedWidth,
        0,
       ));
    this.translateX = cond(eq(gestureState, State.END), [
        set(translationX, runSpring(clockX, translationX, velocityX, snapPoint)),
        cond(
          and(
            eq(clockRunning(clockX), 0), 
              neq(translationX, 0),
              ), 
          call([translationX], this.onSwiped),
          ),
        translationX,
      ],
        translationX);
    this.translateY = cond(eq(gestureState, State.END), [
        set(translationY, runSpring(clockY, translationY, 0, 0)),
        translationY,
      ],
        translationY);  
  }

  onSwiped = ([translateX]) => {
    const isLiked = translateX > 0;
    console.log({ isLiked });
    const { profiles: [lastProfile, ...profiles] } = this.state;
    this.setState({ profiles }, this.init);
  }

  render() {
    const { onGestureEvent, translateX, translateY } = this;
    const { profiles: [lastProfile, ...profiles] } = this.state;
    const rotateZ = concat(interpolate(translateX, {
      inputRange: [-width / 2, width / 2],
      outputRange: [15, -15],
      extrapolate: Extrapolate.CLAMP,
    }), "deg");
    const likeOpacity = interpolate(translateX, {
      inputRange: [0, width / 4],
      outputRange: [0 , 1],
      extrapolate: Extrapolate.CLAMP,
    });
    const nopeOpacity = interpolate(translateX, {
      inputRange: [-width/4, 0],
      outputRange: [1, 0],
      extrapolate: Extrapolate.CLAMP,
    });
    const style = {
      ...StyleSheet.absoluteFillObject,
      transform: [
      { translateX },
      { translateY },
      { rotateZ },
      ],
    };
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Icon name="user" size={32} color="gray" />
          <Icon name="message-circle" size={32} color="gray" />
        </View>
        <View style={styles.cards}>
          {
              profiles.reverse().map(profile => (
                <Card key={profile.id} {...{ profile }} />
              ))
          }
          <PanGestureHandler onHandlerStateChange={onGestureEvent}{...{ onGestureEvent }}>
          <Animated.View {...{ style }}>
          <Card profile={lastProfile} {...{likeOpacity, nopeOpacity}} />
          </Animated.View>
          </PanGestureHandler>
        </View>
        <View style={styles.footer}>
          <View style={styles.circle}>
            <Icon name="x" size={32} color="#ec5288" />
          </View>
          <View style={styles.circle}>
            <Icon name="heart" size={32} color="#6ee3b4" />
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fbfaff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  cards: {
    flex: 1,
    margin: 8,
    zIndex: 100,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    padding: 16,
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    shadowColor: "gray",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
  },
});
