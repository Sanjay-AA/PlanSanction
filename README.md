# PlanSanction — Smart Building Plan Approval System

> **Government of Tamil Nadu • Directorate of Town & Country Planning (DTCP)**
> Automated Scrutiny & Sanction Permit System under the **Tamil Nadu Combined Development and Building Rules, 2019 (TNCDBR 2019)**.

---

## Overview

**PlanSanction** is a modern, government-grade municipal building plan scrutiny and sanction management web application built for local government building permits across Tamil Nadu (Namakkal District: Tiruchengode, Rasipuram, Kumarapalayam, and Paramathi-Velur).

### Key Highlights
- **AI-Powered Technical Scrutiny**: Automated plan evaluation using **Google Gemini 2.0 Flash** checking against statutory TNCDBR 2019 tables (FSI, setbacks, height envelopes, parking, rainwater harvesting, drawing completeness).
- **CAD & PDF Scrutiny Viewer**: Client-side **AutoCAD DXF** parser extracting vector layers and bounding boxes, paired with multi-sheet PDF architectural viewers.
- **Digital Sanction Permit with QR**: Generates official DTCP Sanction Certificates via `jsPDF` embedded with dynamic QR codes linking to public verification (`/verify/:applicationNo`).
- **Role-Based Workflows**: Tailored portals for **Applicants / Architects** (`client`), **Municipal Planning Officers** (`officer`), and **District Collectors / LPA Admins** (`admin`).
- **Pre-seeded Dataset**: Comes preloaded with 40+ realistic applications spanning 8 months across 4 taluks.

---

## Demo Login Personas (1-Click Switcher)

| Role | Name | Email | Jurisdiction |
|---|---|---|---|
| **Applicant / Architect** | S. K. Murugesan & Associates | `client@plansanction.tn.gov.in` | Namakkal District |
| **Town Planning Officer** | Er. K. Ramesh, B.E. (Civil) | `officer.tcg@plansanction.tn.gov.in` | Tiruchengode Region (TCG) |
| **Planning Officer** | Er. M. Anitha, M.Tech | `officer.rsp@plansanction.tn.gov.in` | Rasipuram Region (RSP) |
| **District Admin / Collector** | Dr. S. Priya IAS | `admin.nmk@plansanction.tn.gov.in` | Namakkal District (All Taluks) |

*(Use the top 1-click persona bar to switch roles instantly during evaluation!)*

---

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router v6
- **Charts & Visuals**: `recharts` for regional analytics, monthly inflow trends, and rule violation matrices
- **CAD & Document Engines**: `dxf-parser`, `jspdf`, `jspdf-autotable`, `qrcode`
- **Backend & Cloud**: Firebase (Auth, Firestore, Cloud Storage, Firebase Cloud Functions)
- **AI Model**: Google Gemini (`gemini-2.0-flash`)

---

## Project Structure

```
d:/PlanSanction/
├── functions/                     # Firebase Cloud Functions (Gemini 2.0 Flash)
│   ├── index.js                   # Secure server-side AI scrutiny function
│   └── package.json
├── firestore.rules                # Role & region-scoped security rules
├── storage.rules                  # Firebase Cloud Storage security rules
├── src/
│   ├── components/
│   │   ├── common/                # StatusBadge, ComplianceGauge, PlanDocumentViewer, DemoUserSwitcher
│   │   └── layout/                # Official Navbar, Footer, AppLayout
│   ├── pages/
│   │   ├── auth/                  # Login with 1-click personas
│   │   ├── client/                # Home, NewApplication wizard, StatusTracking, History, Profile
│   │   ├── officer/               # OfficerHome, Applications queue, PlanReview desk, Applicants directory
│   │   ├── admin/                 # AdminDashboard (KPIs, Charts, Region comparison, Officer management)
│   │   └── public/                # Public QR verification desk (/verify/:applicationNo)
│   ├── services/
│   │   ├── aiScrutiny.ts          # Gemini 2.0 Flash integration & defensive JSON parsing
│   │   ├── tncdbrRules.ts         # TNCDBR 2019 rules engine (FSI, Setbacks, Parking, RWH)
│   │   ├── certificateGenerator.ts# Official PDF Sanction Permit generator with QR code
│   │   ├── dxfParser.ts           # AutoCAD DXF vector layer parser
│   │   ├── seedData.ts            # 40+ realistic applications and seed stats
│   │   ├── store.ts               # Reactive state & application lifecycle store
│   │   └── firebase.ts            # Firebase SDK client initialization
│   ├── types/                     # TypeScript definitions
│   ├── App.tsx                    # Route definitions & guards
│   ├── main.tsx
│   └── index.css                  # Government portal design tokens
```

---

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```

Visit `http://localhost:5173` to explore the portal.

---

## Environment Configuration (`.env`)

```env
# Optional: Direct Gemini API key for standalone testing
VITE_GEMINI_API_KEY=your_gemini_api_key

# Optional: Firebase Cloud Function Endpoint
VITE_FIREBASE_FUNCTION_URL=https://us-central1-plansanction-tn.cloudfunctions.net/analyzeBuildingPlan

# Optional: Firebase Web App Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=plansanction-tn.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=plansanction-tn
VITE_FIREBASE_STORAGE_BUCKET=plansanction-tn.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## Statutory Rules Reference (TNCDBR 2019)

- **Rule 35**: Permissible Floor Space Index (FSI) & Maximum Ground Coverage percentage based on abutting road width.
- **Rule 38**: Mandatory Open Yard Clearances (Front, Rear, Side setbacks) based on building height.
- **Rule 42**: Mandatory off-street Car and Two-Wheeler parking bay requirements.
- **Rule 45**: Mandatory Rainwater Harvesting (RWH) percolation pit / recharge well provision under Section 240-A.
- **Rule 48**: Staircase minimum clear flight width and fire safety egress standards.
