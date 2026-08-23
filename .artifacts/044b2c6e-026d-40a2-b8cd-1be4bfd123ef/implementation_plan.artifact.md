# Implementation Plan - Jobs Hub India Professional App Features

This plan outlines the steps to integrate the "Professional Version" features into the existing Jobs Hub India application, focusing on high-performance AI, branding, and advanced utility tools.

## User Review Required

> [!IMPORTANT]
> **AI Services:** I propose using **Google Gemini AI SDK** for text-based tasks (Resume/Cover Letter/Interview scoring) as it's highly capable and offers a generous free tier for developers.
> **Voice Processing:** For the AI Voice Interview, we will use `expo-speech` for TTS and `react-native-voice` (or a high-quality alternative) for Speech-to-Text.
> **Backend Synchronization:** The "Automated Updates every 6 hours" requires a GitHub Action or a cloud function. This plan assumes the backend logic exists, and we will focus on the UI/API consumption.

## Proposed Changes

---

### 1. Branding & Navigation [NEW]

- Implement a custom **Animated Splash Screen** using the standard Expo Splash Screen API with a secondary fade-in transition to the dashboard.
- Update the bottom navigation to include the 5th tab: **Earn**.

#### [MODIFY] [App.js](file:///C:/Users/Asus Laptop/Music/job-time/App.js)
- Add `Earn` screen to the Bottom Tab Navigator.
- Configure global theme colors (#4630EB).

---

### 2. Jobs Marketplace & Programs [REFINEMENT]

- Enhance search and filtering with a dedicated "Work From Home" toggle and "Govt/Private" categorization.
- Implement the **Upskilling & Internship** filters (Free/Paid).

#### [MODIFY] [JobsScreen.js](file:///C:/Users/Asus Laptop/Music/job-time/src/screens/JobsScreen.js)
- Add "Work From Home" quick-filter pill.
- Refine the job card UI with better typography and icons.

#### [MODIFY] [ProgramsScreen.js](file:///C:/Users/Asus Laptop/Music/job-time/src/screens/ProgramsScreen.js)
- Implement Fee Filter (All/Free/Paid).
- Add visual indicators for Course Duration and Mode.

---

### 3. AI Career Studio (Premium) [NEW MODULES]

This is the core engine of the app. We will create a new directory for AI services and screens.

#### [NEW] [AiStudioScreen.js](file:///C:/Users/Asus Laptop/Music/job-time/src/screens/AiStudioScreen.js)
- Dashboard for **AI Voice Interview**, **Cover Letter Pro**, and **50+ Career Roadmaps**.

#### [NEW] [VoiceInterviewScreen.js](file:///C:/Users/Asus Laptop/Music/job-time/src/screens/VoiceInterviewScreen.js)
- **Hold-to-Speak** interaction for high-precision STT.
- TTS spoken questions for Banking/IT scenarios.
- Gemini-powered performance scoring.

#### [NEW] [CoverLetterScreen.js](file:///C:/Users/Asus Laptop/Music/job-time/src/screens/CoverLetterScreen.js)
- Form-based input for Job Profile.
- Gemini-powered 4-paragraph generation.
- PDF Export via `expo-print`.

#### [NEW] [RoadmapsScreen.js](file:///C:/Users/Asus Laptop/Music/job-time/src/screens/RoadmapsScreen.js)
- Interactive list of 50+ career paths with step-by-step guides.

---

### 4. Premium Utility Tools [ENHANCEMENT]

#### [MODIFY] [ToolsScreen.js](file:///C:/Users/Asus Laptop/Music/job-time/src/screens/ToolsScreen.js)
- **AI Resume Maker:** Replace the current static template logic with real **Google Gemini AI** for "Auto-Writer".
- **Passport Studio PRO:** Enhance the background removal logic and add "Studio quality" presets.
- **HD Doc Scanner:** Refine the "Magic White" filter and PDF quality.
- **Signature Studio:** Ensure high-transparency PNG export.

---

### 5. Financial Services (Earn) [NEW]

#### [NEW] [EarnScreen.js](file:///C:/Users/Asus Laptop/Music/job-time/src/screens/EarnScreen.js)
- **Earnings Wallet:** Real-time dashboard (UI only for now or mock API).
- **Credit Card Marketplace:** List of cards with application links via `goodonefinance.com`.
- **Referral Ecosystem:** Instructions and copy-link functionality.

---

### 6. Profile & Settings [REFINEMENT]

#### [MODIFY] [ProfileScreen.js](file:///C:/Users/Asus Laptop/Music/job-time/src/screens/ProfileScreen.js)
- Add Security Standards and Privacy details (256-bit encryption, on-device processing).
- Implement the Alert Management toggles.

## Verification Plan

### Automated Tests
- Run `expo start` to verify UI responsiveness across different screen sizes.
- Verify AI generation calls (Gemini API) for Resume and Cover Letter.

### Manual Verification
- Test PDF generation and sharing for Resume, Passport Sheet, and Documents.
- Test "Hold-to-Speak" functionality in the AI Voice Interview.
- Verify Multilingual switch for all new components.
