# @stoicpiggy/mobile

Stoic Piggy mobile app — Expo SDK 56, expo-router, Expo UI, Reanimated, ExecuTorch.

## Run

```bash
pnpm --filter @stoicpiggy/mobile dev      # start Metro / Expo
pnpm --filter @stoicpiggy/mobile ios      # build & run iOS (dev build)
pnpm --filter @stoicpiggy/mobile android  # build & run Android (dev build)
```

Reanimated 4 and ExecuTorch require the **New Architecture** (already enabled in
`app.json`) and a **development build** (not Expo Go) for the native modules.

## Expo UI

`@expo/ui` exposes truly native primitives — SwiftUI on iOS, Jetpack Compose on
Android (stable since SDK 56). Import the platform module where you build a screen:

```tsx
// iOS
import { Button, Host } from '@expo/ui/swift-ui';
// Android
import { Button, Host } from '@expo/ui/jetpack-compose';
```

## On-device AI (ExecuTorch)

`features/ai/useOnDeviceCoach.ts` is a typed seam. Wire a real model with
`useLLM` from `react-native-executorch`, then stream tokens through the hook.

## Testing

```bash
pnpm --filter @stoicpiggy/mobile test       # jest-expo unit tests
pnpm --filter @stoicpiggy/mobile test:e2e   # Maestro flows (needs a device/emulator)
```
