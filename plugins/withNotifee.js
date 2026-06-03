const { withAndroidManifest, withProjectBuildGradle } = require('@expo/config-plugins');

/**
 * Applies the native Android changes required by @notifee/react-native
 * that are not covered by notifee's own auto-linking:
 *
 *  1. AndroidManifest.xml — foreground service permissions + service declaration
 *  2. android/build.gradle — notifee's local Maven repository
 */
const withNotifee = (config) => {
  config = withNotifeeManifest(config);
  config = withNotifeeGradle(config);
  return config;
};

// ─── Manifest ────────────────────────────────────────────────────────────────

const NOTIFEE_PERMISSIONS = [
  'android.permission.FOREGROUND_SERVICE',
  'android.permission.FOREGROUND_SERVICE_DATA_SYNC',
  'android.permission.POST_NOTIFICATIONS',
];

const withNotifeeManifest = (config) =>
  withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;

    // Add permissions (skip any that are already declared)
    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }
    for (const name of NOTIFEE_PERMISSIONS) {
      const exists = manifest['uses-permission'].some(
        (p) => p.$?.['android:name'] === name
      );
      if (!exists) {
        manifest['uses-permission'].push({ $: { 'android:name': name } });
      }
    }

    // Add the foreground service declaration inside <application>
    const application = manifest.application?.[0];
    if (application) {
      if (!application.service) {
        application.service = [];
      }
      const serviceClass = 'app.notifee.core.ForegroundService';
      const exists = application.service.some(
        (s) => s.$?.['android:name'] === serviceClass
      );
      if (!exists) {
        application.service.push({
          $: {
            'android:name': serviceClass,
            'android:exported': 'false',
            'android:foregroundServiceType': 'dataSync',
            'tools:replace': 'android:foregroundServiceType',
          },
        });
      }
    }

    return mod;
  });

// ─── build.gradle ────────────────────────────────────────────────────────────

const NOTIFEE_MAVEN_MARKER = 'notifee local Maven repo';
const NOTIFEE_MAVEN_BLOCK = `
    maven {
      // ${NOTIFEE_MAVEN_MARKER}
      url "\${rootDir}/../node_modules/@notifee/react-native/android/libs"
    }`;

const withNotifeeGradle = (config) =>
  withProjectBuildGradle(config, (mod) => {
    if (mod.modResults.contents.includes(NOTIFEE_MAVEN_MARKER)) {
      return mod; // already applied
    }
    mod.modResults.contents = mod.modResults.contents.replace(
      /allprojects\s*\{[^}]*repositories\s*\{/,
      (match) => match + NOTIFEE_MAVEN_BLOCK
    );
    return mod;
  });

module.exports = withNotifee;
