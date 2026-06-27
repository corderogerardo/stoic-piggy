"""
Generate a JSONL training dataset from Stoic Piggy's Maestro E2E flows.
Produces instruction-tuning pairs in the `messages` format for MLX LoRA.

Usage:
    python generate_dataset.py [--output dataset.jsonl]
"""

import json
import os
import random
from pathlib import Path
from typing import Optional

random.seed(42)

REPO_ROOT = Path(__file__).resolve().parent.parent
MAESTRO_DIR = REPO_ROOT / "apps" / "stoicpiggy" / "maestro"

# ── all known testIDs from components ──────────────────────────────────────
SCREEN_IDS = {
    "onboarding-screen",
    "login-username", "login-password", "login-submit",
    "home-screen", "home-challenge", "home-logout",
    "coach-input", "coach-send",
    "tasks-screen",
    "quests-screen",
    "wins-screen",
    "temptation-screen", "temptation-close",
}

TAB_IDS = {"tab-home", "tab-tasks", "tab-coach", "tab-quests", "tab-wins"}

DEMO_KIDS = ["marco", "sofia", "lucas", "emma", "mateo", "valeria"]
DEMO_PASS = "piggy1234"

# ── load existing flows as ground-truth training examples ──────────────────

def load_ground_truth() -> list[dict]:
    """Read all existing YAML flows and wrap them as instruction pairs."""
    examples = []
    meta = {
        "01-onboarding.yaml": "Write a Maestro E2E flow that tests the onboarding screen: the app should cold-start, show the onboarding carousel, and let the kid tap 'start' to advance to the sign-in screen.",
        "02-login.yaml": "Write a Maestro E2E flow that tests the kid sign-in screen. First submit a wrong password and assert the user stays on the login screen, then enter the correct password and verify the home screen loads.",
        "03-home.yaml": "Write a Maestro E2E flow that tests the home screen: sign in as a demo kid, wait for the home screen, and assert key elements like the daily challenge CTA and the tab bar buttons are visible.",
        "04-tasks.yaml": "Write a Maestro E2E flow that tests the tasks screen: sign in, navigate via the Tasks tab, and assert the tasks screen is visible.",
        "05-coach.yaml": "Write a Maestro E2E flow that tests the Coach AI chat screen: sign in, navigate to Coach, type a message, press send, and verify the message appears as a chat bubble.",
        "06-quests.yaml": "Write a Maestro E2E flow that tests the quests screen: sign in, navigate via the Quests tab, and assert the quests screen is visible.",
        "07-wins.yaml": "Write a Maestro E2E flow that tests the wins screen: sign in, navigate via the Wins tab, and assert the wins screen is visible.",
        "08-temptation.yaml": "Write a Maestro E2E flow for the Temptation challenge: sign in, tap the daily challenge CTA on Home, verify the temptation screen opens, close it, and assert we're back on home.",
    }

    for fname, instruction in meta.items():
        fpath = MAESTRO_DIR / "flows" / fname
        if not fpath.exists():
            continue
        content = fpath.read_text().strip()
        examples.append({
            "messages": [
                {"role": "user", "content": instruction},
                {"role": "assistant", "content": content},
            ],
            "tags": ["ground-truth"],
        })
    return examples


# ── synthetic flow generators ──────────────────────────────────────────────

def make_auth_flow(screen_id: str, tab_id: Optional[str], extra_asserts: Optional[list[str]] = None) -> str:
    """Generate a standard authenticated-screen flow."""
    lines = [
        "appId: com.stoicpiggy.app",
        "tags:",
        "  - auth",
        "---",
        f"# Screen: {screen_id.replace('-screen', '').title()}. Reached from the tab bar.",
        "- runFlow: ../subflows/sign-in.yaml",
    ]
    if tab_id:
        lines.append(f"- tapOn:")
        lines.append(f"    id: \"{tab_id}\"")
    lines.append(f"- extendedWaitUntil:")
    lines.append(f"    visible:")
    lines.append(f"      id: \"{screen_id}\"")
    lines.append(f"    timeout: 30000")
    if extra_asserts:
        for a in extra_asserts:
            lines.append(f"- assertVisible:")
            lines.append(f"    id: \"{a}\"")
    return "\n".join(lines)


def make_form_interaction_flow(
    screen_id: str,
    tab_id: str,
    field_ids: list[str],
    submit_id: str,
    success_screen: str,
) -> str:
    """Flow that fills a form, submits it, and asserts navigation."""
    kid = random.choice(DEMO_KIDS)
    lines = [
        "appId: com.stoicpiggy.app",
        "env:",
        f"  KID_USER: {kid}",
        f"  KID_PASS: {DEMO_PASS}",
        "tags:",
        "  - auth",
        "---",
        "# Navigate to screen, fill form, submit, verify next screen.",
        "- runFlow: ../subflows/sign-in.yaml",
        f"- tapOn:",
        f"    id: \"{tab_id}\"",
        f"- extendedWaitUntil:",
        f"    visible:",
        f"      id: \"{screen_id}\"",
        f"    timeout: 30000",
    ]
    for fid in field_ids:
        lines.append(f"- tapOn:")
        lines.append(f"    id: \"{fid}\"")
        lines.append(f"- inputText: \"test-value\"")
    lines.append(f"- tapOn:")
    lines.append(f"    id: \"{submit_id}\"")
    lines.append(f"- extendedWaitUntil:")
    lines.append(f"    visible:")
    lines.append(f"      id: \"{success_screen}\"")
    lines.append(f"    timeout: 60000")
    return "\n".join(lines)


def make_error_flow() -> str:
    """Flow that triggers an error state and verifies it."""
    kid = random.choice(DEMO_KIDS)
    lines = [
        "appId: com.stoicpiggy.app",
        "env:",
        f"  KID_USER: {kid}",
        f"  KID_PASS: {DEMO_PASS}",
        "tags:",
        "  - auth",
        "  - negative",
        "---",
        "# Sign in with wrong password, verify error persists, then correct it.",
        "- runFlow: ../subflows/launch.yaml",
        "- extendedWaitUntil:",
        "    visible:",
        "      id: \"onboarding-start\"",
        "    timeout: 60000",
        "- tapOn:",
        "    id: \"onboarding-start\"",
        "- extendedWaitUntil:",
        "    visible:",
        "      id: \"login-username\"",
        "    timeout: 60000",
        f"- tapOn:",
        f"    id: \"login-username\"",
        f"- inputText: \"{kid}\"",
        "- tapOn:",
        "    id: \"login-password\"",
        "- inputText: \"wrong-password\"",
        "- pressKey: Enter",
        "- assertVisible:",
        "    id: \"login-username\"",
        "# Now correct password",
        "- tapOn:",
        "    id: \"login-password\"",
        "- eraseText",
        f"- inputText: \"{DEMO_PASS}\"",
        "- pressKey: Enter",
        "- runFlow: ../subflows/dismiss-save-password.yaml",
        "- extendedWaitUntil:",
        "    visible:",
        "      id: \"home-screen\"",
        "    timeout: 120000",
    ]
    return "\n".join(lines)


def make_smoke_flow() -> str:
    """A quick smoke test that runs on an already-installed build."""
    lines = [
        "appId: com.stoicpiggy.app",
        "---",
        "# Quick smoke: verify the app launches and key Home elements are visible.",
        "- launchApp",
        "- assertVisible: \"Add weekly allowance (+$5)\"",
        "- tapOn: \"Add weekly allowance (+$5)\"",
        "- assertVisible:",
        "    text: \"Coach tip\"",
    ]
    return "\n".join(lines)


def make_unauth_flow(screen_id: str, assert_ids: list[str]) -> str:
    """Flow that tests a screen reachable without authentication."""
    lines = [
        "appId: com.stoicpiggy.app",
        "tags:",
        "  - unauth",
        "---",
        "# Verify the unauthenticated state is shown correctly.",
        "- runFlow: ../subflows/launch.yaml",
        f"- extendedWaitUntil:",
        f"    visible:",
        f"      id: \"{screen_id}\"",
        f"    timeout: 60000",
    ]
    for aid in assert_ids:
        lines.append(f"- assertVisible:")
        lines.append(f"    id: \"{aid}\"")
    return "\n".join(lines)


def make_keyboard_flow() -> str:
    """Regression flow for keyboard-avoidance behavior."""
    lines = [
        "appId: com.stoicpiggy.app",
        "---",
        "# Regression: the coach composer must stay visible above the keyboard.",
        "- launchApp",
        "- tapOn:",
        "    id: \"tab-coach\"",
        "- assertVisible: \"Type your question...\"",
        "- tapOn:",
        "    id: \"coach-input\"",
        "- inputText: \"Saving up for a new bike\"",
        "- assertVisible: \"Saving up for a new bike\"",
        "- assertVisible:",
        "    id: \"coach-send\"",
        "- tapOn:",
        "    id: \"coach-send\"",
    ]
    return "\n".join(lines)


def make_performance_flow() -> str:
    """Flow that includes performance-oriented checks."""
    lines = [
        "appId: com.stoicpiggy.app",
        "tags:",
        "  - perf",
        "---",
        "# Cold-start performance: verify the home screen loads within 10 seconds.",
        "- clearKeychain",
        "- launchApp:",
        "    clearState: true",
        "- extendedWaitUntil:",
        "    visible:",
        "      id: \"onboarding-screen\"",
        "    timeout: 10000",
        "- tapOn:",
        "    id: \"onboarding-start\"",
        "- extendedWaitUntil:",
        "    visible:",
        "      id: \"login-username\"",
        "    timeout: 30000",
    ]
    return "\n".join(lines)


def make_navigation_flow() -> str:
    """Flow that tests tab navigation between authenticated screens."""
    screens = ["tasks", "coach", "quests", "wins"]
    lines = [
        "appId: com.stoicpiggy.app",
        "tags:",
        "  - smoke",
        "  - auth",
        "---",
        "# Tab navigation: verify every tab loads its screen.",
        "- runFlow: ../subflows/sign-in.yaml",
    ]
    for s in screens:
        lines.append(f"- tapOn:")
        lines.append(f"    id: \"tab-{s}\"")
        lines.append(f"- extendedWaitUntil:")
        lines.append(f"    visible:")
        lines.append(f"      id: \"{s}-screen\"")
        lines.append(f"    timeout: 30000")
    return "\n".join(lines)


def make_logout_flow() -> str:
    """Flow that signs in, logs out, and verifies return to login."""
    lines = [
        "appId: com.stoicpiggy.app",
        "tags:",
        "  - auth",
        "  - negative",
        "---",
        "# Sign in, then log out, and verify the login screen appears.",
        "- runFlow: ../subflows/sign-in.yaml",
        "- tapOn:",
        "    id: \"home-logout\"",
        "- extendedWaitUntil:",
        "    visible:",
        "      id: \"login-username\"",
        "    timeout: 30000",
    ]
    return "\n".join(lines)


def make_subflow_dismiss_save_password() -> str:
    """The dismiss-save-password subflow."""
    return """appId: com.stoicpiggy.app
---
# After a login submit, iOS shows a "Save Password?" system dialog that can cover
# the next screen and break assertions. Poll a few times and decline it whenever
# it shows up. Entirely a no-op if the dialog never appears.
- repeat:
    times: 6
    commands:
      - runFlow:
          when:
            visible: "Not Now"
          commands:
            - tapOn: "Not Now"
      - waitForAnimationToEnd:
          timeout: 2000"""


def make_subflow_launch() -> str:
    """The launch subflow."""
    return """appId: com.stoicpiggy.app
---
# Reusable: a truly clean cold-start, then connect to Metro. Used by the
# onboarding + login flows that test the unauthenticated screens.
#
# `clearState` wipes the app data container but NOT the iOS Keychain — and the
# onboarding-seen flag + the kid's JWT both live in expo-secure-store (Keychain).
# `clearKeychain` resets them so every run starts at the real first-run state.
- clearKeychain
- launchApp:
    clearState: true
- openLink: "exp+stoicpiggy://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081"
# Fresh state makes expo-dev-client show its developer-menu intro once Metro
# finishes bundling — wait it out, then dismiss it.
- extendedWaitUntil:
    visible: "Continue"
    timeout: 120000
- tapOn: "Continue"
# After a keychain wipe expo-dev-client also auto-opens the full developer menu
# on top of the app — wait for it, then tap the backdrop above the sheet to close.
- extendedWaitUntil:
    visible: "Reload"
    timeout: 30000
- tapOn:
    point: "50%,9%"""


def make_subflow_sign_in() -> str:
    """The sign-in subflow."""
    return """appId: com.stoicpiggy.app
env:
  KID_USER: marco
  KID_PASS: piggy1234
---
# Reusable: a clean cold-start, then sign in as a demo kid and land on Home.
# Reused by every authenticated-screen flow so each is fully isolated.
#
# `clearKeychain` is required: the onboarding flag + JWT live in the Keychain,
# which `clearState` does not wipe. With both cleared, every run deterministically
# starts at Onboarding -> Login.
- clearKeychain
- launchApp:
    clearState: true
- openLink: "exp+stoicpiggy://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081"

# expo-dev-client shows its developer-menu intro on fresh state -- dismiss it.
- extendedWaitUntil:
    visible: "Continue"
    timeout: 120000
- tapOn: "Continue"
# After a keychain wipe expo-dev-client also auto-opens the full developer menu
# on top of the app -- wait for it, then tap the backdrop above the sheet to close.
- extendedWaitUntil:
    visible: "Reload"
    timeout: 30000
- tapOn:
    point: "50%,9%"

# Fresh state always lands on Onboarding -> tap through to the sign-in screen.
- extendedWaitUntil:
    visible:
      id: "onboarding-start"
    timeout: 60000
- tapOn:
    id: "onboarding-start"

- extendedWaitUntil:
    visible:
      id: "login-username"
    timeout: 60000
- tapOn:
    id: "login-username"
- inputText: ${KID_USER}
- tapOn:
    id: "login-password"
- inputText: ${KID_PASS}
# Submit via the password field's return key (onSubmitEditing) -- robust whether or
# not the on-screen keyboard covers the button. (hideKeyboard is unreliable here.)
- pressKey: Enter

# Decline the iOS "Save Password?" dialog that pops up over Home after login.
- runFlow: dismiss-save-password.yaml

# After sign-in the app may show the "waking up the backend" splash before Home
# (Render free-tier cold start can take ~30s).
- extendedWaitUntil:
    visible:
      id: "home-screen"
    timeout: 120000"""


# ── instruction prompts for subflow generation ─────────────────────────────

def make_subflow_creation_instructions() -> list[dict]:
    """Teach the model to create reusable subflows."""
    examples = [
        {
            "instruction": "Create a reusable Maestro subflow that launches the Expo dev client app from a clean state. It must wipe the Keychain, clear app state, deep-link to Metro, and dismiss the two expo-dev-client dialogs (Continue + developer menu backdrop tap). Save it as subflows/launch.yaml.",
            "completion": make_subflow_launch(),
        },
        {
            "instruction": "Create a reusable Maestro subflow that signs in a demo kid from a clean state. It should launch the app, dismiss dev-client dialogs, tap through onboarding, fill in username + password from env vars, submit with Enter, dismiss the iOS save-password dialog, and wait for the home screen. Save it as subflows/sign-in.yaml.",
            "completion": make_subflow_sign_in(),
        },
        {
            "instruction": "Create a reusable Maestro subflow that dismisses the iOS 'Save Password?' dialog. It should poll up to 6 times (2-second intervals) and tap 'Not Now' whenever the dialog is visible. Save it as subflows/dismiss-save-password.yaml.",
            "completion": make_subflow_dismiss_save_password(),
        },
    ]
    result = []
    for ex in examples:
        result.append({
            "messages": [
                {"role": "user", "content": ex["instruction"]},
                {"role": "assistant", "content": ex["completion"]},
            ],
            "tags": ["subflow"],
        })
    return result


# ── concept-explanation pairs ─────────────────────────────────────────────

def make_concept_pairs() -> list[dict]:
    """Teach the model about Maestro YAML concepts using Stoic Piggy conventions."""
    pairs = [
        {
            "instruction": "What is the purpose of the `appId` field at the top of every Maestro YAML flow? What value does Stoic Piggy use?",
            "response": "The `appId` field tells Maestro which app to target on the device. Stoic Piggy uses `com.stoicpiggy.app`. Every flow and subflow must include it as the first line of the YAML file.",
        },
        {
            "instruction": "Explain how testID selectors work in Stoic Piggy's Maestro tests and show the naming convention.",
            "response": "Maestro flows in Stoic Piggy select elements by `testID` (React Native's `testID` prop) for i18n independence. The convention is:\n- Screen containers: `{name}-screen` (e.g., `home-screen`, `onboarding-screen`, `temptation-screen`)\n- Tab bar buttons: `tab-{name}` (e.g., `tab-home`, `tab-coach`, `tab-tasks`, `tab-quests`, `tab-wins`)\n- Form fields: `{screen}-{field}` (e.g., `login-username`, `login-password`)\n- Actions: `{feature}-{action}` (e.g., `onboarding-start`, `home-challenge`, `coach-send`, `temptation-close`)\n\nSelectors are referenced in YAML as:\n```yaml\n- tapOn:\n    id: \"home-challenge\"\n```\nor:\n```yaml\n- assertVisible:\n    id: \"home-screen\"\n```",
        },
        {
            "instruction": "How does the sign-in subflow handle the expo-dev-client dialogs?",
            "response": "The sign-in subflow handles two expo-dev-client dialogs after a fresh install:\n\n1. **Developer-menu intro** — a system dialog with a \"Continue\" button. The flow waits up to 120s for it to appear (Metro bundling time), then taps \"Continue\".\n2. **Full developer menu** — after the intro, the dev menu opens automatically as a bottom sheet. The flow taps the backdrop at `point: \"50%,9%\"` (9% from the top of the screen) to dismiss it.\n\nBoth waits use `extendedWaitUntil` because the first Metro bundle can take a while, especially after `clearKeychain` + `clearState`.",
        },
        {
            "instruction": "What is the tag system used in Stoic Piggy Maestro flows and how do you run subsets by tag?",
            "response": "Stoic Piggy uses two tag categories:\n\n**Screen type:**\n- `auth` — requires the kid to be signed in (Home, Tasks, Coach, Quests, Wins, Temptation)\n- `unauth` — tests the unauthenticated state (Onboarding, Login)\n\n**Run level:**\n- `smoke` — quick validation of critical paths\n- `negative` — error-state testing\n- `perf` — performance-oriented checks\n\nTo run only smoke tests:\n```bash\nmaestro test -p ios --include-tags smoke apps/stoicpiggy/maestro\n```\n\nTo run only unauthenticated flows:\n```bash\nmaestro test -p ios --include-tags unauth apps/stoicpiggy/maestro\n```\n\nThe `config.yaml` at the maestro root restricts execution to `flows/*.yaml` only, so subflows are never run standalone.",
        },
        {
            "instruction": "How should I structure a new authenticated-screen flow in Stoic Piggy's Maestro suite?",
            "response": "Every authenticated-screen flow follows this template:\n\n1. **Header**: `appId: com.stoicpiggy.app` + `tags: [auth]` + YAML separator `---`\n2. **Comment**: One line describing the screen being tested\n3. **Sign-in**: `- runFlow: ../subflows/sign-in.yaml` (gives you a clean signed-in state on Home)\n4. **Navigate**: Tap the relevant tab by testID: `- tapOn:\\n    id: \"tab-{name}\"`\n5. **Assert**: Wait for the screen to appear: `- extendedWaitUntil:\\n    visible:\\n      id: \"{name}-screen\"\\n    timeout: 30000`\n6. **Extra assertions** (optional): Check for specific visible elements by testID\n\nFor example, a Tasks screen flow:\n```yaml\nappId: com.stoicpiggy.app\ntags:\n  - auth\n---\n# Screen: Tasks. Reached from the tab bar.\n- runFlow: ../subflows/sign-in.yaml\n- tapOn:\n    id: \"tab-tasks\"\n- extendedWaitUntil:\n    visible:\n      id: \"tasks-screen\"\n    timeout: 30000\n```",
        },
        {
            "instruction": "Why does the sign-in subflow use `clearKeychain` even though `launchApp` already has `clearState: true`?",
            "response": "In React Native apps using `expo-secure-store`, the JWT token and the onboarding-seen flag are stored in the iOS Keychain (or Android Keystore). The `launchApp` command's `clearState: true` only wipes the app's data container, which does NOT include the Keychain. Without `clearKeychain`, the token persists across test runs, so the app skips onboarding and auto-navigates past login, breaking the deterministic flow.\n\nBoth `clearKeychain` AND `clearState` are required for a truly clean start every time.",
        },
        {
            "instruction": "What Maestro commands does Stoic Piggy use, and when should each be used?",
            "response": "Key Maestro commands used in Stoic Piggy:\n\n- **`launchApp`** — starts the app. Use `clearState: true` for a fresh data container.\n- **`clearKeychain`** — wipes iOS Keychain (essential for auth token + onboarding flag cleanup).\n- **`openLink`** — opens a deep link. Used to connect the dev client to Metro: `exp+stoicpiggy://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081`.\n- **`tapOn`** — taps an element. By `id: \"testID\"`, by `text: \"Button\"`, or by `point: \"50%,50%\"`.\n- **`inputText`** — types text into the currently focused field. Supports `${ENV_VAR}` interpolation.\n- **`pressKey: Enter`** — presses the return key. More reliable than `hideKeyboard` when the keyboard covers submit buttons.\n- **`eraseText`** — clears the current text field.\n- **`assertVisible`** — asserts an element is on screen (by `id` or by text string).\n- **`extendedWaitUntil`** — waits (with polling) for an element, with configurable `timeout`.\n- **`waitForAnimationToEnd`** — pauses for RN animations to finish.\n- **`runFlow`** — includes another YAML file (subflow). Can be conditional with `when`.\n- **`repeat`** — loops a set of commands, used for polling system dialogs.\n\nText-based assertions (`assertVisible: \"text here\"`) match displayed text as-is, so they are locale-dependent. Prefer `id:` selectors for i18n-safe tests.",
        },
    ]
    result = []
    for p in pairs:
        result.append({
            "messages": [
                {"role": "user", "content": p["instruction"]},
                {"role": "assistant", "content": p["response"]},
            ],
            "tags": ["concept"],
        })
    return result


# ── main ───────────────────────────────────────────────────────────────────

def main(output_path: str = "dataset.jsonl"):
    examples = []

    # 1. Ground-truth flows (8 existing flows)
    examples.extend(load_ground_truth())

    # 2. Synthetic authenticated-screen flows (each tab)
    # Standard auth screen flows (navigate via tab, assert screen visible)
    screen_map = [
        ("tasks-screen", "tab-tasks"),
        ("quests-screen", "tab-quests"),
        ("wins-screen", "tab-wins"),
    ]
    for sid, tab in screen_map:
        examples.append({
            "messages": [
                {"role": "user", "content": f"Write a Maestro E2E flow that tests the {sid.replace('-screen', '').title()} screen: sign in as a demo kid, navigate via the tab bar, and verify the screen is visible."},
                {"role": "assistant", "content": make_auth_flow(sid, tab)},
            ],
            "tags": ["auth-flow"],
        })

    # Coach screen has no outer container testID; it uses element-level assertions
    coach_flow = """appId: com.stoicpiggy.app
tags:
  - auth
---
# Screen: Coach. Navigate via tab bar and verify key elements are visible.
- runFlow: ../subflows/sign-in.yaml
- tapOn:
    id: "tab-coach"
- extendedWaitUntil:
    visible:
      id: "coach-input"
    timeout: 30000
- assertVisible:
    id: "coach-send\""""
    examples.append({
        "messages": [
            {"role": "user", "content": "Write a Maestro E2E flow that tests the Coach screen: sign in, navigate via the Coach tab, and verify the input field and send button are visible."},
            {"role": "assistant", "content": coach_flow},
        ],
        "tags": ["auth-flow"],
    })

    # Randomised variations for robustness
    for i in range(3):
        rand_screen = random.choice(screen_map)
        rand_kid = random.choice(DEMO_KIDS)
        flow = f"""appId: com.stoicpiggy.app
env:
  KID_USER: {rand_kid}
  KID_PASS: {DEMO_PASS}
tags:
  - auth
---
# Screen: {rand_screen[0].replace('-screen', '').title()}.
- runFlow: ../subflows/sign-in.yaml
- tapOn:
    id: "{rand_screen[1]}"
- extendedWaitUntil:
    visible:
      id: "{rand_screen[0]}"
    timeout: 30000"""
        examples.append({
            "messages": [
                {"role": "user", "content": f"Write a Maestro flow that signs in as {rand_kid}, navigates to the {rand_screen[0].replace('-screen', '').title()} screen, and asserts it loaded."},
                {"role": "assistant", "content": flow},
            ],
            "tags": ["auth-flow", "variation"],
        })

    # Direct navigation flows (no tab, reached via deep-link or CTA)
    direct_flows = [
        {
            "instruction": "Write a Maestro E2E flow that opens the Temptation challenge from the Home screen CTA, asserts the temptation screen is visible, then closes it and verifies the home screen is back.",
            "flow": """appId: com.stoicpiggy.app
tags:
  - auth
---
# Temptation challenge: open from Home CTA, close, return to Home.
- runFlow: ../subflows/sign-in.yaml
- tapOn:
    id: "home-challenge"
- extendedWaitUntil:
    visible:
      id: "temptation-screen"
    timeout: 30000
- tapOn:
    id: "temptation-close"
- assertVisible:
    id: "home-screen\"""",
        },
    ]
    for df in direct_flows:
        examples.append({
            "messages": [
                {"role": "user", "content": df["instruction"]},
                {"role": "assistant", "content": df["flow"]},
            ],
            "tags": ["auth-flow"],
        })

    # 3. Login error flow
    examples.append({
        "messages": [
            {"role": "user", "content": "Write a Maestro E2E flow that tests login error handling: first enter a wrong password and verify the user stays on the login screen, then enter the correct password and verify the home screen loads."},
            {"role": "assistant", "content": make_error_flow()},
        ],
        "tags": ["negative-flow"],
    })

    # 4. Smoke flow
    examples.append({
        "messages": [
            {"role": "user", "content": "Write a quick Maestro smoke test that launches the app, taps 'Add weekly allowance (+$5)', and asserts the coach tip appears."},
            {"role": "assistant", "content": make_smoke_flow()},
        ],
        "tags": ["smoke"],
    })

    # 5. Unauthenticated screen flow
    examples.append({
        "messages": [
            {"role": "user", "content": "Write a Maestro E2E flow that tests the Onboarding screen in an unauthenticated state. The app should cold-start fresh and show the onboarding carousel."},
            {"role": "assistant", "content": make_unauth_flow("onboarding-screen", ["onboarding-start"])},
        ],
        "tags": ["unauth-flow"],
    })

    # 6. Keyboard regression flow
    examples.append({
        "messages": [
            {"role": "user", "content": "Write a Maestro regression test that verifies the Coach composer stays visible when the on-screen keyboard is raised. Type a multi-word message and confirm both the typed text and the send button remain above the keyboard."},
            {"role": "assistant", "content": make_keyboard_flow()},
        ],
        "tags": ["regression"],
    })

    # 7. Tab navigation flow (covers all tabs)
    examples.append({
        "messages": [
            {"role": "user", "content": "Write a Maestro E2E flow that tests tab navigation across all authenticated screens: sign in, then tap through each tab (tasks, coach, quests, wins) and verify each screen loads."},
            {"role": "assistant", "content": make_navigation_flow()},
        ],
        "tags": ["navigation"],
    })

    # 8. Logout flow
    examples.append({
        "messages": [
            {"role": "user", "content": "Write a Maestro E2E flow that signs in, taps the logout button on Home, and verifies the app returns to the login screen."},
            {"role": "assistant", "content": make_logout_flow()},
        ],
        "tags": ["negative-flow"],
    })

    # 9. Performance-oriented flow
    examples.append({
        "messages": [
            {"role": "user", "content": "Write a Maestro performance flow that measures cold-start time by clearing state and checking how fast the onboarding screen appears (expect under 10 seconds)."},
            {"role": "assistant", "content": make_performance_flow()},
        ],
        "tags": ["perf"],
    })

    # 10. Subflow creation instructions
    examples.extend(make_subflow_creation_instructions())

    # 11. Multi-turn assistant-style conversations
    multi_turn = [
        {
            "messages": [
                {"role": "user", "content": "Here's my existing Maestro flow for the Tasks screen:\n\n```yaml\nappId: com.stoicpiggy.app\ntags:\n  - auth\n---\n- runFlow: ../subflows/sign-in.yaml\n- tapOn:\n    id: \"tab-tasks\"\n- extendedWaitUntil:\n    visible:\n      id: \"tasks-screen\"\n    timeout: 30000\n```\n\nCan you add an assertion to also verify the navigation bar title?"},
                {"role": "assistant", "content": "Sure, add an `assertVisible` for the screen title. Since the tasks screen uses `testID=\"tasks-screen\"` on the outer ScrollView, you could also check for a specific element inside it. If there's a title with testID `tasks-title`, the flow becomes:\n\n```yaml\nappId: com.stoicpiggy.app\ntags:\n  - auth\n---\n# Tasks screen.\n- runFlow: ../subflows/sign-in.yaml\n- tapOn:\n    id: \"tab-tasks\"\n- extendedWaitUntil:\n    visible:\n      id: \"tasks-screen\"\n    timeout: 30000\n- assertVisible:\n    id: \"tasks-title\"\n```\n\nIf there's no specific testID for the title, assert by text instead:\n\n```yaml\n- assertVisible: \"Tasks\"\n```\n\nBut be careful: text assertions are locale-dependent. Prefer testID selectors for i18n-safe flows."},
            ],
            "tags": ["multi-turn"],
        },
        {
            "messages": [
                {"role": "user", "content": "My Maestro flow keeps failing because the iOS 'Save Password?' dialog appears after login. How do I handle this in the flow?"},
                {"role": "assistant", "content": "The Stoic Piggy test suite handles this with a reusable subflow at `subflows/dismiss-save-password.yaml`. It polls up to 6 times (2-second intervals) and taps 'Not Now' whenever the dialog is visible:\n\n```yaml\nappId: com.stoicpiggy.app\n---\n- repeat:\n    times: 6\n    commands:\n      - runFlow:\n          when:\n            visible: \"Not Now\"\n          commands:\n            - tapOn: \"Not Now\"\n      - waitForAnimationToEnd:\n          timeout: 2000\n```\n\nInclude it right after the sign-in submit:\n```yaml\n- pressKey: Enter\n- runFlow: ../subflows/dismiss-save-password.yaml\n```\n\nThis is a no-op when the dialog doesn't appear (the `when` condition prevents the tap), so it works across iOS versions."},
            ],
            "tags": ["multi-turn", "troubleshooting"],
        },
        {
            "messages": [
                {"role": "user", "content": "How do I set up a Maestro flow to test the app cold-start in under 10 seconds?"},
                {"role": "assistant", "content": "Create a performance-focused flow that uses `extendedWaitUntil` with a 10-second timeout:\n\n```yaml\nappId: com.stoicpiggy.app\ntags:\n  - perf\n---\n# Performance: cold-start should load onboarding in under 10 seconds.\n- clearKeychain\n- launchApp:\n    clearState: true\n- extendedWaitUntil:\n    visible:\n      id: \"onboarding-screen\"\n    timeout: 10000\n```\n\nIn Stoic Piggy, the cold-start loads JavaScript from Metro (debug builds), so the first bundle can take longer. For a true cold-start benchmark, build a Release bundle and test against the pre-bundled JS. You can also measure screen transition times by adding timestamps using Maestro's `runScript` with JavaScript if you need millisecond precision."},
            ],
            "tags": ["multi-turn", "perf"],
        },
    ]
    examples.extend(multi_turn)

    # 12. Concept / explanation pairs
    examples.extend(make_concept_pairs())

    # ── write ──
    with open(output_path, "w") as f:
        for ex in examples:
            f.write(json.dumps(ex["messages"], ensure_ascii=False) + "\n")

    total = len(examples)
    tag_counts = {}
    for ex in examples:
        for tag in ex.get("tags", []):
            tag_counts[tag] = tag_counts.get(tag, 0) + 1

    print(f"Generated {total} training examples → {output_path}")
    print("Breakdown by tag:")
    for tag, count in sorted(tag_counts.items()):
        print(f"  {tag}: {count}")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="dataset.jsonl")
    args = parser.parse_args()
    main(args.output)
