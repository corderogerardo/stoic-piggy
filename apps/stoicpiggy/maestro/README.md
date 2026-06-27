# Maestro E2E — Stoic Piggy (kid app)

End-to-end UI flows, one per screen, runnable on both iOS and Android.

## Layout

```
maestro/
  config.yaml          # restricts `maestro test ./maestro` to flows/*.yaml
  subflows/            # reusable building blocks (never run standalone)
    launch.yaml        #   clean cold-start → connect to Metro (unauthenticated)
    sign-in.yaml       #   launch → onboarding → sign in as a demo kid → Home
  flows/               # one flow per screen
    01-onboarding.yaml
    02-login.yaml      # wrong password → error, then correct → Home
    03-home.yaml
    04-tasks.yaml
    05-coach.yaml      # send a message, assert it echoes into the chat
    06-quests.yaml
    07-wins.yaml
    08-temptation.yaml # opens the challenge, closes back (no backend write)
    09-keyboard.yaml   # composer + send stay above the on-screen keyboard (regression)
```

Flows select elements by `testID` (`tab-*`, `login-*`, `<screen>-screen`, …), so
they are independent of the app's ES/EN language toggle.

## Prerequisites

1. A **dev build installed** on the simulator/emulator and **Metro running**:
   ```bash
   pnpm --filter @stoicpiggy/mobile ios       # build+install+Metro (iOS sim)
   pnpm --filter @stoicpiggy/mobile android    # build+install+Metro (Android emu)
   ```
   Leave Metro running — these are Debug builds that load JS from it. The
   `sign-in`/`launch` subflows deep-link past the expo-dev-client launcher to
   `http://localhost:8081` (works on the iOS simulator and, via `adb reverse`,
   on the Android emulator).
2. The backend the app points at must be reachable. `.env.local` sets
   `EXPO_PUBLIC_API_URL` to the Render API; first sign-in may take ~30s while the
   free tier wakes (the flows wait up to 120s).

## Running

```bash
# whichever single device is connected
pnpm --filter @stoicpiggy/mobile test:e2e

# pick the platform explicitly when both a simulator and emulator are up
pnpm --filter @stoicpiggy/mobile test:e2e:ios
pnpm --filter @stoicpiggy/mobile test:e2e:android

# a single flow
maestro test -p ios apps/stoicpiggy/maestro/flows/05-coach.yaml

# only the quick smoke set
maestro test -p ios --include-tags smoke apps/stoicpiggy/maestro
```

## Authoring new flows

Use `maestro studio` (interactive recorder / element inspector) against the
running app:

```bash
maestro studio
```

Reuse `runFlow: ../subflows/sign-in.yaml` to start any authenticated-screen flow
from a clean, signed-in Home.

Demo kid credentials: `marco` / `piggy1234` (also sofia, lucas, emma, mateo,
valeria). Override per run with `-e KID_USER=sofia -e KID_PASS=piggy1234`.
