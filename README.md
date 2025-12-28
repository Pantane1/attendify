# 🛡️ Attendify: Next-Gen Biometric Attendance

Attendify is a high-fidelity facial recognition attendance system designed for modern universities and professional institutions. By leveraging the **Google Gemini 3 Vision Engine**, Attendify replaces manual roll-calls with a secure, touchless, and instantaneous biometric verification hub.

---

## 🚀 Key Features

### 👨‍🎓 For Students: The Portal
- **One-Tap Verification**: Smart camera interface with a high-tech "Biometric HUD" overlay.
- **Liveness Detection**: Anti-spoofing logic that prevents the use of photos or screen-captures for fraudulent check-ins.
- **Smart Session Sync**: Automatically detects and suggests the closest scheduled course based on the current time and day.
- **Check-In History**: A transparent record of all verified presences, lateness, and AI confidence scores.

### 👩‍🏫 For Lecturers: The Console
- **Intelligent Analytics**: Real-time engagement tracking via Recharts-powered data visualization.
- **Punctuality Risk Watch**: Automated identification of students with falling attendance rates (below 70%).
- **Advanced Course Config**:
  - **Recurring Schedules**: Set classes for specific days (e.g., Mon/Wed/Fri).
  - **Early Buffer**: Define how many minutes before class a student can check in.
  - **Late Grace Period**: Automatically marks students as "LATE" after a defined threshold.
- **Biometric Asset Management**: Audit the student database, retake profile photos, or remove biometric tokens.

---

## 🛠️ Technical Stack

- **Core**: React 19 + TypeScript
- **Styling**: Tailwind CSS (Modern, high-contrast "Cyber" aesthetic)
- **AI/Vision Engine**: `@google/genai` (Gemini 3 Flash Preview)
- **Charts**: Recharts (Engagement & Traffic metrics)
- **Persistence**: Browser-level `localStorage` (Simulated DB Service)

---

## 🧬 How Biometric Verification Works

Attendify utilizes a **Zero-Trust Biometric Model**:
1. **Asset Retrieval**: The system fetches the student's high-resolution reference profile image.
2. **Live Capture**: The student performs a live capture via the secure encrypted stream.
3. **Gemini Analysis**: Both images are processed by the Gemini Vision Engine to analyze:
   - **Identity Match**: Facial landmark and vertex comparison.
   - **Liveness Score**: Detection of screen glares, 2D flat textures, or paper borders.
   - **Environmental Context**: Ensuring the student is in a legitimate setting.

---

## ⚙️ Configuration & Buffers

Lecturers can fine-tune attendance policies per course:
- **Early Buffer (default: 15m)**: Prevents students from checking in hours before a class starts.
- **Late Grace (default: 10m)**: If a student checks in within this window after the start time, they are marked `PRESENT`. After this window, they are marked `LATE`.

---

## 🔒 Privacy & Ethics

Attendify is designed with a "Biometric Privacy First" approach. For this demonstration:
- All biometric data (Base64) is stored locally in the user's browser.
- No data is transmitted to third-party servers except for the transient processing via the Google Gemini API.
- The system includes a "Biometric Bypass" fail-safe for demonstration environments where external image assets might be blocked by CORS.

---

## 📦 Installation

Since Attendify is built as a pure ES Module application:
1. Ensure you have a valid `process.env.API_KEY` configured in your environment.
2. Open `index.html` in any modern evergreen browser.
3. Grant camera permissions when prompted.

---
**Attendify** | *Precision Presence. Absolute Integrity.*
