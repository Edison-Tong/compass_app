/**
 * CompassNeedle — the animated arrow that points toward the target.
 *
 * The needle rotates by `angle` degrees from screen-up.
 * When angle = 0, the needle points straight up — meaning the user
 * is facing directly toward the target location.
 *
 * Animation is handled by react-native-reanimated's `withTiming` so
 * the rotation runs on the native UI thread at 60fps. The `shortestAngleDelta`
 * helper ensures the needle always takes the shortest rotational path
 * and never spins 350° the wrong way when crossing 0°/360°.
 *
 * The needle is drawn with a simple triangular shape:
 * - Top half (primary color) = direction toward target
 * - Bottom half (secondary color) = opposite direction
 */

import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import { useTheme } from "../../theme";
import { shortestAngleDelta } from "../../utils/geo";

interface CompassNeedleProps {
  /** Rotation angle in degrees. 0 = pointing up (toward target). */
  angle: number;
  /** Total size of the compass (needle is sized relative to this). */
  size: number;
}

export function CompassNeedle({ angle, size }: CompassNeedleProps) {
  const { colors } = useTheme();
  const needleHeight = size * 0.65;
  const needleWidth = 16;

  // Shared value for smooth animation on the UI thread
  const rotation = useSharedValue(0);

  useEffect(() => {
    const delta = shortestAngleDelta(rotation.value, angle);
    rotation.value = withTiming(rotation.value + delta, {
      duration: 200,
      easing: Easing.out(Easing.quad),
    });
  }, [angle]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        { width: needleWidth, height: needleHeight },
        animatedStyle,
      ]}
    >
      {/* Top half — points toward the target (primary color) */}
      <View
        style={[
          styles.needleTop,
          {
            borderLeftWidth: needleWidth / 2,
            borderRightWidth: needleWidth / 2,
            borderBottomWidth: needleHeight / 2,
            borderBottomColor: colors.compass.needle,
          },
        ]}
      />

      {/* Bottom half — opposite direction (muted color) */}
      <View
        style={[
          styles.needleBottom,
          {
            borderLeftWidth: needleWidth / 2,
            borderRightWidth: needleWidth / 2,
            borderTopWidth: needleHeight / 2,
            borderTopColor: colors.compass.needleSecondary,
          },
        ]}
      />

      {/* Center dot */}
      <View
        style={[
          styles.centerDot,
          {
            backgroundColor: colors.compass.needle,
            top: needleHeight / 2 - 6,
            left: needleWidth / 2 - 6,
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  needleTop: {
    width: 0,
    height: 0,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  needleBottom: {
    width: 0,
    height: 0,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  centerDot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
