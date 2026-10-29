# Iron Week

Your gym + swim planner as a real Android/iOS app, built with **React Native (Expo SDK 58)** and TypeScript.
No backend: everything is saved on the phone.

## What it does

- **Day tabs (Mon–Sun)** that open on today. Tue Push A · Wed Legs A + Swim · Thu Pull A · Fri Legs B + Swim · Sat Push B · Sun Pull B · Mon Swim only.
- **Workout tab:** exercise cards that fold up, sets 1–6 and reps per set, tick-boxes, progress dots, body diagram (main + helper muscles), form steps, demo/image links, **⇄ Swap** to an alternative when a machine is busy (for today only), finisher, and the **swim card** on swim days.
- **Stretching tab:** full-body warm-up and cool-down that change every day, rounds and hold time per stretch, single-stretch timer and **guided full routine**.
- **Timers:** rest timer starts when you tick a set; big full-screen countdown (+15s, Skip, Stop, Minimize); 60-minute session timer.
  **Every timer step also schedules a phone notification**, so you're alerted even when the phone is locked or in your pocket.
- **Daily reminders** (⏰ Reminders button): a notification at your chosen time with today's workout. Default 7:00 PM, an hour before the gym.
- **Muscles worked** for the selected day, plus a **Weekly overview** with weekly sets and Good / OK / Low status.
- **Spotify / YouTube Music** buttons that open the installed app.
- **🎫 Entry passes** for the gym and the pool, kept only on this phone (no database):
  - **Choose PDF** (or **Choose photo** for a screenshot) and set the **valid-till** date. The PDF's first page is
    converted once into a sharp image, so it opens instantly. The original PDF is kept too (**Open PDF**).
  - **Show pass** opens it full screen with **maximum brightness** (easy for scanners) and keeps the screen on.
    Quick buttons: *Show gym pass* in the warm-up box, *Show swim pass* on the swim card.
  - **Replace** it every month: the old files are deleted automatically.
  - A notification reminds you **2 days before** a pass expires.
  - Converting a PDF needs internet once, while adding it (it uses pdf.js). Showing it later works offline.
- Ticks and swaps reset at midnight (your phone's time zone). Your sets, reps and stretch times are kept.

## Run it on your phone (no Android Studio)

1. Install **Node.js 22 (LTS) or newer** on your computer.
2. In this folder:
   ```bash
   npm install
   npx expo start
   ```
3. Install **Expo Go** from the Play Store on your phone, then scan the QR code shown in the terminal.
   Phone and computer must be on the same Wi-Fi (or run `npx expo start --tunnel`).

Local notifications (timers and reminders) work in Expo Go. Edit any file and the app reloads on your phone.

## Build an APK you can install (cloud build, no Android Studio)

```bash
npm install -g eas-cli        # or use: npx eas-cli@latest <command>
eas login                     # free Expo account
eas build:configure           # first time only; keeps the existing eas.json
eas build -p android --profile preview
```

When the build finishes, EAS gives you a link/QR code. Open it on your phone, download the **.apk** and install it
(allow "Install unknown apps" for your browser once). The `preview` profile in `eas.json` builds an APK;
`production` builds an `.aab` for the Play Store if you ever publish it.

## Project structure

```
App.tsx                    fonts, providers, splash
src/
  HomeScreen.tsx           the screen: tabs, workout / stretching views, reset, muscles worked
  store.tsx                saved state (AsyncStorage): sets/reps, stretch setup, today's ticks & swaps, settings
  timer.tsx                rest/stretch/swim timer queue + session timer, keep-awake, notifications per step
  notifications.ts         Android channels, permission, step alerts, weekly reminders
  passes.tsx               entry passes: PDF/photo import, PDF-to-image, full-screen view, expiry reminder
  logic.ts                 pure helpers: defaults, timer steps, muscle map
  theme.ts                 light/dark colours and fonts
  components/
    Cards.tsx              Exercise, Finisher, Stretch, Swim cards
    TimerViews.tsx         bottom timer bar + big timer
    Panels.tsx             Muscles worked, Weekly overview, music buttons, reminder settings
    BodyDiagram.tsx        front/back body figure (react-native-svg)
    ui.tsx                 text, buttons, picker, collapsible card, checkbox
  data/
    plan.ts                days, exercises, finishers
    stretches.ts           51 stretches + each day's warm-up / cool-down
    muscles.ts             muscles per exercise, swap alternatives
    swim.ts                swim blocks and days
    types.ts
```

**To change the plan**, edit the files in `src/data/` (for example sets, reps, rest seconds, or which stretches a day uses).
The rest of the app picks it up automatically.

## Useful commands

```bash
npx tsc --noEmit        # typecheck
npx expo-doctor         # check dependency versions
npx expo install --fix  # fix package versions after upgrading Expo
```
