# ClinicConnect

A React Native mobile app connecting patients with healthcare providers — built with Expo and Supabase.

## Tech Stack

- **React Native** 0.83.6 + **Expo** SDK 55
- **TypeScript** 5.9
- **Supabase** — Auth, PostgreSQL, Realtime, Storage
- **React Navigation** 6.x

## Prerequisites

- Node.js 18+
- Expo CLI
- Supabase account (free tier works)
- Android Studio / Xcode (for emulators)

## Getting Started


# 1. Clone and install
git clone <then your repo(the one you forked)>
Navigate to where the file is (cloned repo)
Umzekelo, if you cloned it to desktop, uzokwenza kanje:
cd Deskop
cd ClinicConnect
npm install

# 2. Start the app
First download and install Expo Go 55 (I used SDK 55)

then run this command:
npx expo start
```
scan the QR code with Expo Go.

## Features

**Patients** — Book/manage appointments, view medical records, find nearby clinics, receive notifications

**Staff** — Manage patient queue, record visit notes, view daily schedule

**Admin** — Manage clinics, staff, time slots, and view analytics

**Emergency** — Real-time alerts, location tracking, first responder dispatch

## Navigation Flow
 
![ClinicConnect Navigation Flow](https://github.com/220212317/ClinicConnect/blob/master/clinicconnect_navigation_flow.svg)
```

## Troubleshooting

**Can't log in** — Disable email confirmation in Supabase Dashboard → Authentication → Settings for local testing.

**Expo SDK mismatch** — Run `npx expo install --fix`.

**Build errors** — Run `npx expo start --clear`.


Ndicinga this guide will help you get started.
