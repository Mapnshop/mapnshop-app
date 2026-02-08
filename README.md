# Mapnshop App 🏪

Mapnshop is a **Local Commerce Operating System** built with **React Native (Expo)** and **Supabase**. It unifies orders from all sources—delivery apps, phone calls, walk-ins—into a single, powerful dashboard for local businesses.

---

## 🚀 Key Features

### 1. The Unified Inbox
- **One Feed for All Orders**: Manage orders from *Uber Eats*, *DoorDash*, *Talabat*, *Just Eat*, and manual sources in one list.
- **Custom Sources**: Track where every order comes from (WhatsApp, Instagram, Phone).
- **Consolidated Controls**: Accept, reject, or update status for any order type from the same screen.

### 2. Smart Order Entry
- **Universal Order Creation**: Log phone or walk-in orders in seconds.
- **Customer CRM**: Auto-saves customer details (Name, Phone, Address) for instant lookup next time.
- **Address Autocomplete**: Powered by Google Places for precise delivery logistics.

### 3. Safety & Compliance
- **Allergy Alerts**: Prominent warning banners for "Gluten Free", "Nut Allergy", or special requests.
- **Audit Logs**: Full timeline of every action (edits, cancellations, status changes) for accountability.
- **Proof of Work**: Upload photos of receipts or finished dishes directly to the order.

### 4. Business Management
- **Verification Flow**: Secure onboarding and verification process for new businesses.
- **Team Roles**: Granular access control for Owners vs. Staff.
- **Financial Defaults**: Configure global tax rates, delivery fees, and currencies.

### 5. Analytics & Insights
- **Daily Snapshots**: Real-time view of Revenue, Order Counts, and Delivery vs. Pickup splits.
- **Performance Tracking**: Monitor Average Order Value (AOV) and fulfillment efficiency.

---

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Language**: TypeScript
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Edge Functions)
- **Navigation**: Expo Router
- **Maps**: Google Places API
- **UI**: Custom Design System + Lucide Icons

---

## ⚙️ Quick Start

### 1. Prerequisites
- Node.js (v18+)
- [Expo Go](https://expo.dev/client) on your device.
- A Supabase project.

### 2. Installation
```bash
git clone <repository-url>
cd mapnshop-app
npm install
```

### 3. Environment Setup
Create a `.env` file:
```bash
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_key
```

### 4. Running the App
```bash
npx expo start
```
Scan the QR code with Expo Go to launch.

---

## 📂 Project Structure

```
mapnshop-app/
├── app/                  # Screens & Routes
│   ├── (tabs)/           # Inbox, Create, Reports, Settings
│   ├── order/            # Order Details & Action Center
│   └── ...               # Auth, Onboarding, Features
├── components/           # UI Components
├── lib/                  # API & Services
└── supabase/             # Migrations & Edge Functions
```
