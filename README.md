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

## Project Structure

```
ClinicConnect/
├── src/
│   ├── components/          # Button, Card, Input, Modal, LoadingSpinner, ErrorBoundary
│   │
│   ├── screens/
│   │   ├── auth/            # Login, Register (2 steps), ForgotPassword, RoleSelection
│   │   ├── patient/         # Home, Profile, EditProfile, HealthTips, NearbyClinics, ClinicDetail
│   │   ├── appointments/    # SelectClinic → SelectService → SelectTimeSlot → Confirm → Success
│   │   │                    # AppointmentDetail, AppointmentHistory
│   │   ├── medical/         # MedicalRecord, DoctorMedicalRecord
│   │   ├── notifications/   # Notifications, NotificationPreferences
│   │   ├── staff/           # DoctorHome, NurseHome, PatientSearch, PatientDetailView
│   │   ├── admin/           # Dashboard, ClinicManagement, ServicesManagement,
│   │   │                    # TimeSlotManagement, StaffList, StaffProfile, AddStaff
│   │   └── emergency/       # FirstResponderHome, EmergencyHistory
│   │
│   ├── navigation/          # AppNavigator, AuthNavigator, PatientNavigator,
│   │                        # StaffNavigator, AdminNavigator, types
│   ├── context/             # AuthContext, ThemeContext, NotificationContext, AppointmentContext
│   ├── hooks/               # useAuth, useTheme, useNotifications, useAppointments, useDebounce
│   ├── services/
│   │   ├── api/             # client, auth, appointments, medical, clinics
│   │   ├── storage/         # secureStorage, localStorage
│   │   └── notifications/   # pushNotifications
│   ├── utils/               # theme, constants, helpers, validators, formatters, permissions
│   ├── types/               # Shared TypeScript definitions
│   └── assets/              # images, fonts, animations
│
├── __tests__/               # Unit tests for components, screens, services, utils
├── .env                     # Environment variables (not committed)
├── .env.example             # Environment variable template
├── app.json                 # Expo configuration
└── tsconfig.json            # TypeScript configuration
```

## Troubleshooting

**Can't log in** — Disable email confirmation in Supabase Dashboard → Authentication → Settings for local testing.

**Expo SDK mismatch** — Run `npx expo install --fix`.

**Build errors** — Run `npx expo start --clear`.


Ndicinga this guide will help you get started.