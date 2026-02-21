/**
 * QRScanScreen — camera-based QR code scanner to import locations.
 *
 * Uses expo-camera's CameraView with barcode scanning. When a valid
 * Love Compass QR is detected, it shows a preview of the location
 * and lets the user confirm the import.
 *
 * Duplicate detection: checks if a location with the same lat/lng
 * already exists before saving.
 */

import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, Alert, Linking } from "react-native";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { ScreenWrapper } from "../../src/components/ui/ScreenWrapper";
import { Button } from "../../src/components/ui/Button";
import { useTheme } from "../../src/theme";
import { decodeQRToLocation } from "../../src/utils/qr";
import { QRLocationPayload } from "../../src/models/types";
import { getLocationService } from "../../src/services/location-service";

type ScanState = "scanning" | "preview" | "importing" | "done";

export default function QRScanScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>("scanning");
  const [scannedPayload, setScannedPayload] = useState<QRLocationPayload | null>(null);

  const handleBarCodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      // Only process when actively scanning
      if (scanState !== "scanning") return;

      const payload = decodeQRToLocation(result.data);
      if (!payload) {
        // Not a valid Love Compass QR — ignore silently so the camera
        // doesn't spam alerts for random QR codes in the environment.
        return;
      }

      setScanState("preview");
      setScannedPayload(payload);
    },
    [scanState]
  );

  const handleImport = async () => {
    if (!scannedPayload) return;

    setScanState("importing");
    try {
      const service = getLocationService();

      // Check for duplicates (same coords within ~10m)
      const existing = await service.getAll();
      const duplicate = existing.find(
        (loc) =>
          Math.abs(loc.latitude - scannedPayload.latitude) < 0.0001 &&
          Math.abs(loc.longitude - scannedPayload.longitude) < 0.0001
      );

      if (duplicate) {
        Alert.alert("Location Already Exists", `"${duplicate.name}" is at the same coordinates. Import anyway?`, [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setScanState("scanning"),
          },
          {
            text: "Import Anyway",
            onPress: async () => {
              await service.create({
                name: scannedPayload.name,
                emoji: scannedPayload.emoji,
                latitude: scannedPayload.latitude,
                longitude: scannedPayload.longitude,
                source: "qr",
              });
              setScanState("done");
              Alert.alert("Imported!", `"${scannedPayload.name}" has been saved.`, [
                { text: "OK", onPress: () => router.back() },
              ]);
            },
          },
        ]);
        return;
      }

      await service.create({
        name: scannedPayload.name,
        emoji: scannedPayload.emoji,
        latitude: scannedPayload.latitude,
        longitude: scannedPayload.longitude,
        source: "qr",
      });

      setScanState("done");
      Alert.alert("Imported!", `"${scannedPayload.name}" has been saved.`, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error("[QRScan] Import failed:", err);
      Alert.alert("Error", "Failed to import location. Please try again.");
      setScanState("scanning");
    }
  };

  const handleScanAgain = () => {
    setScannedPayload(null);
    setScanState("scanning");
  };

  // -----------------------------------------------------------------------
  // Permission states
  // -----------------------------------------------------------------------
  if (!permission) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <Text style={[styles.message, { color: colors.textSecondary }]}>Loading camera…</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <Text style={styles.permissionEmoji}>📷</Text>
          <Text style={[styles.permissionTitle, { color: colors.text }]}>Camera Access Needed</Text>
          <Text style={[styles.permissionBody, { color: colors.textSecondary }]}>
            Love Compass needs camera access to scan QR codes from other users.
          </Text>
          <View style={styles.permissionActions}>
            {permission.canAskAgain ? (
              <Button title="Grant Access" onPress={requestPermission} />
            ) : (
              <Button title="Open Settings" onPress={() => Linking.openSettings()} />
            )}
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  // -----------------------------------------------------------------------
  // Preview state — show decoded location before importing
  // -----------------------------------------------------------------------
  if (scanState === "preview" && scannedPayload) {
    return (
      <ScreenWrapper>
        <View style={styles.previewContainer}>
          <Text style={[styles.previewHeader, { color: colors.textSecondary }]}>LOCATION FOUND</Text>

          <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.previewEmoji}>{scannedPayload.emoji}</Text>
            <Text style={[styles.previewName, { color: colors.text }]}>{scannedPayload.name}</Text>
            <Text style={[styles.previewCoords, { color: colors.textSecondary }]}>
              {scannedPayload.latitude.toFixed(4)}, {scannedPayload.longitude.toFixed(4)}
            </Text>
          </View>

          <View style={styles.previewActions}>
            <Button title="Save Location" onPress={handleImport} />
            <Button title="Scan Again" onPress={handleScanAgain} variant="secondary" />
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  // -----------------------------------------------------------------------
  // Active scanning state
  // -----------------------------------------------------------------------
  return (
    <View style={styles.scannerFull}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanState === "scanning" ? handleBarCodeScanned : undefined}
      />

      {/* Overlay with cutout guide */}
      <View style={styles.overlay}>
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.scanFrame}>
            <View style={[styles.cornerTL, { borderColor: "#FFFFFF" }]} />
            <View style={[styles.cornerTR, { borderColor: "#FFFFFF" }]} />
            <View style={[styles.cornerBL, { borderColor: "#FFFFFF" }]} />
            <View style={[styles.cornerBR, { borderColor: "#FFFFFF" }]} />
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom}>
          <Text style={styles.scanHint}>Point at a Love Compass QR code</Text>
        </View>
      </View>
    </View>
  );
}

const SCAN_SIZE = 260;

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  message: {
    fontSize: 16,
  },

  // Permission
  permissionEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  permissionBody: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  permissionActions: {
    width: "100%",
  },

  // Scanner
  scannerFull: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  overlayMiddle: {
    flexDirection: "row",
    height: SCAN_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  scanFrame: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    paddingTop: 32,
  },
  scanHint: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  // Corner markers
  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 28,
    height: 28,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 28,
    height: 28,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 4,
  },

  // Preview
  previewContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  previewHeader: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  previewCard: {
    width: "100%",
    alignItems: "center",
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 28,
  },
  previewEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  previewName: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  previewCoords: {
    fontSize: 14,
  },
  previewActions: {
    width: "100%",
    gap: 12,
  },
});
