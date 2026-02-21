/**
 * CompassRose — the background dial of the compass.
 *
 * Renders a circular bezel with degree tick marks and N/S/E/W labels.
 * The entire rose rotates opposite to the device heading so that N always
 * points toward true north on screen.
 *
 * The rose rotation is driven by react-native-reanimated for butter-smooth
 * 60 fps animation on the UI thread (no JS bridge bottleneck).
 */

import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import { useTheme } from "../../theme";
import { shortestAngleDelta } from "../../utils/geo";

interface CompassRoseProps {
  /** Device heading in degrees (0 = north). Rose rotates by -heading. */
  heading: number;
  /** Diameter of the compass in points. */
  size: number;
}

/** Cardinal and intercardinal labels with their absolute angles. */
const DIRECTION_LABELS = [
  { label: "N", angle: 0 },
  { label: "NE", angle: 45 },
  { label: "E", angle: 90 },
  { label: "SE", angle: 135 },
  { label: "S", angle: 180 },
  { label: "SW", angle: 225 },
  { label: "W", angle: 270 },
  { label: "NW", angle: 315 },
];

/** Number of small tick marks around the dial (every 5°). */
const TICK_COUNT = 72;

export function CompassRose({ heading, size }: CompassRoseProps) {
  const { colors } = useTheme();
  const radius = size / 2;

  // Shared value for the rotation — animated on the UI thread
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Calculate the shortest path to avoid spinning the wrong way
    const delta = shortestAngleDelta(rotation.value, -heading);
    rotation.value = withTiming(rotation.value + delta, {
      duration: 150,
      easing: Easing.out(Easing.quad),
    });
  }, [heading]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer ring */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: radius,
            borderColor: colors.compass.ring,
            backgroundColor: colors.compass.face,
          },
        ]}
      />

      {/* Rotating content: ticks + labels */}
      <Animated.View
        style={[
          styles.rotatingLayer,
          { width: size, height: size },
          animatedStyle,
        ]}
      >
        {/* Tick marks */}
        {Array.from({ length: TICK_COUNT }).map((_, i) => {
          const angle = i * 5;
          const isMajor = angle % 30 === 0;
          const tickLength = isMajor ? 12 : 6;
          const tickWidth = isMajor ? 2 : 1;

          return (
            <View
              key={`tick-${i}`}
              style={[
                styles.tick,
                {
                  height: tickLength,
                  width: tickWidth,
                  backgroundColor: isMajor ? colors.compass.text : colors.compass.needleSecondary,
                  top: 8,
                  left: radius - tickWidth / 2,
                  transform: [
                    { translateY: 0 },
                    { rotate: `${angle}deg` },
                  ],
                  transformOrigin: `${tickWidth / 2}px ${radius - 8}px`,
                },
              ]}
            />
          );
        })}

        {/* Direction labels */}
        {DIRECTION_LABELS.map(({ label, angle }) => {
          const isCardinal = label.length === 1;
          // Position labels just inside the tick ring
          const labelRadius = radius - 32;
          const rad = ((angle - 90) * Math.PI) / 180;
          const x = radius + labelRadius * Math.cos(rad);
          const y = radius + labelRadius * Math.sin(rad);

          return (
            <View
              key={label}
              style={[
                styles.labelContainer,
                {
                  left: x - 14,
                  top: y - 10,
                },
              ]}
            >
              <Text
                style={[
                  styles.labelText,
                  {
                    color: label === "N" ? colors.compass.needle : colors.compass.text,
                    fontSize: isCardinal ? 16 : 11,
                    fontWeight: isCardinal ? "700" : "500",
                    opacity: isCardinal ? 1 : 0.6,
                  },
                ]}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    borderWidth: 2,
  },
  rotatingLayer: {
    position: "absolute",
  },
  tick: {
    position: "absolute",
  },
  labelContainer: {
    position: "absolute",
    width: 28,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  labelText: {
    textAlign: "center",
  },
});
