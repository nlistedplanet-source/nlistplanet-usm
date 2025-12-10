# Unified Backend Workflow Guide

## 🚀 New Architecture Overview

Congratulations! You have successfully moved to a **Unified Backend**.
This means you now have **One Brain (Backend)** controlling **Two Bodies (Frontends)**.

### 1. The "Brain" (Backend)
*   **Location:** `UnlistedHub-USM/backend`
*   **Role:** Handles Database, Authentication, API Logic, Emails, SMS.
*   **Impact:** Changes here affect **BOTH** Desktop and Mobile apps immediately.

### 2. The "Bodies" (Frontends)
*   **Desktop Web:** `UnlistedHub-USM/frontend`
*   **Mobile App:** `nlistplanet-mobile/frontend`
*   **Role:** Only handles how things *look* (UI/UX).

---

## 🛠 How to Request Changes Now

Here is how you should instruct me (Copilot) based on what you need:

### Scenario A: "I want to change the color of a button on Mobile"
*   **Type:** Frontend Only (Mobile)
*   **Command:** "Mobile frontend me button color change kar do."
*   **Action:** I will only edit `nlistplanet-mobile/frontend`.

### Scenario B: "I want to change the text on the Desktop Home page"
*   **Type:** Frontend Only (Desktop)
*   **Command:** "Desktop frontend me home page text update kar do."
*   **Action:** I will only edit `UnlistedHub-USM/frontend`.

### Scenario C: "I want to change the Platform Fee logic" (Logic Change)
*   **Type:** Backend (Shared)
*   **Command:** "Backend me platform fee logic change kar do."
*   **Action:** I will edit `UnlistedHub-USM/backend`.
*   **Result:** The new fee will apply to **BOTH** Mobile and Desktop users instantly.

### Scenario D: "I want a new feature on Mobile only" (e.g., Mobile Notifications)
*   **Type:** Backend + Mobile Frontend
*   **Command:** "Mobile ke liye notification feature add karna hai."
*   **Action:**
    1. I will update `UnlistedHub-USM/backend` to support the feature.
    2. I will update `nlistplanet-mobile/frontend` to show it.
    3. (Desktop remains unaffected unless we add the UI there too).

---

## ⚠️ Important Note
Since the backend is shared, **be careful when changing API responses**. If you change how the backend sends data for the Desktop, make sure it doesn't break the Mobile app!
