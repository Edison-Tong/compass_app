/**
 * useCompass — device heading from expo-location's heading API.
 *
 * Why expo-location heading instead of raw magnetometer?
 * - expo-location's `watchHeadingAsync` already fuses magnetometer + accelerometer
 *   data and returns a true-north heading on both iOS and Android.
 * - Raw magnetometer requires manual tilt-compensation which is error-prone.
 * - The heading API also provides an `accuracy` field we use for calibration UX.
 *
 * Performance considerations:
 * - The heading subscription fires at ~60 Hz on iOS; we apply a low-pass filter
 *   (exponential moving average) in angular space so the displayed value is smooth.
 * - The alpha factor (0.15) balances responsiveness with jitter reduction.
 * - We clean up the subscription on unmount to prevent background sensor drain.
 * - Using useRef for the smoothed heading avoids re-render storms; only the
 *   debounced setState (every ~100ms) triggers a render.
 *
 * Calibration:
 * - `accuracy` mirrors the native calibration quality:
 *     iOS:  1 = high, 2 = medium, 3 = low, -1 = uncalibrated
 *     Android: similar scale
 * - We surface `needsCalibration` when accuracy drops below threshold so
 *   the UI can show a "wave your phone in a figure-8" prompt.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import * as Location from "expo-location";
import { normalizeAngle, smoothHeading } from "../utils/geo";

/** How aggressively to smooth heading. Lower = smoother but laggier. */
const SMOOTHING_ALPHA = 0.15;

/** Minimum accuracy value we consider acceptable (higher number = worse on iOS) */
const CALIBRATION_THRESHOLD = 2;

/** Minimum interval (ms) between React state updates to limit re-renders */
const RENDER_INTERVAL_MS = 100;

export interface CompassState {
  /** Smoothed device heading in degrees (0 = true north, clockwise). */
  heading: number;
  /** Raw (un-smoothed) heading from the sensor. */
  rawHeading: number;
  /** Sensor accuracy indicator. */
  accuracy: number;
  /** True when the sensor reports low accuracy and needs calibration. */
  needsCalibration: boolean;
  /** True while waiting for the first heading reading. */
  isLoading: boolean;
  /** Error message if heading is unavailable. */
  error: string | null;
}

export function useCompass(): CompassState {
  const [state, setState] = useState<CompassState>({
    heading: 0,
    rawHeading: 0,
    accuracy: -1,
    needsCalibration: false,
    isLoading: true,
    error: null,
  });

  // Mutable refs for the smoothing loop — avoids re-render on every sensor tick
  const smoothedRef = useRef(0);
  const latestRawRef = useRef(0);
  const latestAccuracyRef = useRef(-1);
  const lastRenderRef = useRef(0);
  const hasFirstReadingRef = useRef(false);

  const flushToState = useCallback(() => {
    const now = Date.now();
    if (now - lastRenderRef.current < RENDER_INTERVAL_MS) return;
    lastRenderRef.current = now;

    const accuracy = latestAccuracyRef.current;
    setState({
      heading: smoothedRef.current,
      rawHeading: latestRawRef.current,
      accuracy,
      needsCalibration: accuracy >= CALIBRATION_THRESHOLD || accuracy < 0,
      isLoading: false,
      error: null,
    });
  }, []);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const start = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: "Location permission denied",
          }));
          return;
        }

        subscription = await Location.watchHeadingAsync((headingData) => {
          const raw = normalizeAngle(headingData.trueHeading ?? headingData.magHeading);
          latestRawRef.current = raw;
          latestAccuracyRef.current = headingData.accuracy;

          if (!hasFirstReadingRef.current) {
            // Snap to first reading instantly (no smoothing)
            smoothedRef.current = raw;
            hasFirstReadingRef.current = true;
          } else {
            smoothedRef.current = smoothHeading(smoothedRef.current, raw, SMOOTHING_ALPHA);
          }

          flushToState();
        });
      } catch (err) {
        console.error("[useCompass] Failed to start heading:", err);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Heading sensor unavailable",
        }));
      }
    };

    start();

    return () => {
      subscription?.remove();
    };
  }, [flushToState]);

  return state;
}
