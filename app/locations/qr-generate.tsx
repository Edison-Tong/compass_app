/**
 * QRGenerateScreen — displays a QR code for a single saved location.
 *
 * The QR encodes a JSON payload (version, name, emoji, lat, lng) so the
 * receiver can import the location into their own app. The sender's
 * internal ID and timestamps are intentionally stripped.
 *
 * Navigation: pushed from LocationCard's share button with `?id=<locationId>`.
 */

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Share, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import { ScreenWrapper } from "../../src/components/ui/ScreenWrapper";
import { Button } from "../../src/components/ui/Button";
import { useTheme } from "../../src/theme";
import { SavedLocation } from "../../src/models/types";
import { getLocationService } from "../../src/services/location-service";
import { encodeLocationToQR } from "../../src/utils/qr";

export default function QRGenerateScreen() {
  const { colors, isDark } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [location, setLocation] = useState<SavedLocation | null>(null);
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      const loc = await getLocationService().getById(id);
      if (loc) {
        setLocation(loc);
        setQrValue(encodeLocationToQR(loc));
      }
      setLoading(false);
    })();
  }, [id]);

  const handleShareText = async () => {
    if (!qrValue) return;
    try {
      await Share.share({
        message: qrValue,
        ...(Platform.OS === "ios" ? { title: `Location: ${location?.name}` } : {}),
      });
    } catch {
      // user cancelled
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  if (!location || !qrValue) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>Location not found.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Location info */}
        <Text style={styles.emoji}>{location.emoji}</Text>
        <Text style={[styles.name, { color: colors.text }]}>{location.name}</Text>
        <Text style={[styles.coords, { color: colors.textSecondary }]}>
          {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </Text>

        {/* QR Code */}
        <View style={[styles.qrContainer, { backgroundColor: "#FFFFFF", borderColor: colors.border }]}>
          <QRCode value={qrValue} size={220} color="#000000" backgroundColor="#FFFFFF" ecl="M" />
        </View>

        <Text style={[styles.hint, { color: colors.textTertiary }]}>
          Scan this code with Love Compass to import this location.
        </Text>

        {/* Share as text fallback */}
        <View style={styles.actions}>
          <Button title="Share as Text" onPress={handleShareText} variant="secondary" />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  coords: {
    fontSize: 14,
    marginBottom: 28,
  },
  qrContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  hint: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 28,
    paddingHorizontal: 32,
  },
  actions: {
    width: "100%",
    paddingHorizontal: 16,
    gap: 12,
  },
  errorText: {
    fontSize: 16,
  },
});
