// Re-quote the "Bundle React Native code and images" build phase so it survives
// a repo path that contains spaces (this repo lives in ".../No office location/...").
//
// Expo's prebuild template ends that phase by executing the resolved
// react-native-xcode.sh path via a BARE backtick command substitution — unquoted.
// A space in the path word-splits it and the build dies with:
//   line N: /Users/gerardocordero/No: No such file or directory
// `expo prebuild` regenerates ios/, so this plugin re-applies the fix every run.
//
// ponytail: only fixes the Debug-simulator bundle phase (SKIP_BUNDLING short-circuits
// react-native-xcode.sh there, so quoting the invocation is enough). Release/device
// bundling still runs Metro/Hermes over the spaced path — keep EAS for production, or
// move the repo to a space-free path to drop this plugin entirely.
const { withXcodeProject } = require('expo/config-plugins');

const MARKER = 'RN_XCODE_SCRIPT=';
const OLD =
  "`\"$NODE_BINARY\" --print \"require('path').dirname(require.resolve('react-native/package.json')) + '/scripts/react-native-xcode.sh'\"`";
const NEW = `RN_XCODE_SCRIPT=${OLD}\n/bin/sh "$RN_XCODE_SCRIPT"`;

module.exports = function withQuotedRNBundleScript(config) {
  return withXcodeProject(config, (cfg) => {
    const phases = cfg.modResults.hash.project.objects.PBXShellScriptBuildPhase || {};
    for (const key of Object.keys(phases)) {
      const phase = phases[key];
      if (!phase || typeof phase !== 'object' || !phase.shellScript) continue;

      let script;
      try {
        script = JSON.parse(phase.shellScript); // stored JSON-quoted; decode to real text
      } catch {
        continue;
      }
      if (!script.includes('react-native-xcode.sh') || script.includes(MARKER)) {
        continue; // not the RN bundle phase, or already patched
      }
      if (!script.includes(OLD)) {
        console.warn(
          '[withQuotedRNBundleScript] expected invocation not found — Expo template may have changed; skipping.',
        );
        continue;
      }
      phase.shellScript = JSON.stringify(script.replace(OLD, NEW));
    }
    return cfg;
  });
};
