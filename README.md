# MapNShop App 🏪

MapNShop is a **Local Commerce Operating System** built with **React Native (Expo)** and **Supabase**. It empowers local businesses to manage orders, track deliveries, view reports, and handle customer communications—all from a single mobile application.

## 🚀 Key Features

### 1. Smart Inbox (Core)
- **Centralized Dashboard**: View all active orders in one place.
- **Real-time Updates**: Status changes reflect instantly across devices.
- **Filters & Search**: Quickly find orders by customer name, phone, or ID.

### 2. Fast Order Entry
- **Manual Booking**: Create orders in seconds for walk-ins or phone calls.
- **Customer CRM**: Automatically saves customer details (Name, Phone, Address) for future autofill.
- **Address Autocomplete**: Integrated Google Places API for accurate address entry.
- **Order Defaults**: Auto-apply default tax rates and delivery fees.

### 3. Order Management & Workflow
- **Status Pipeline**: Simple flow: `Created` → `Preparing` → `Ready` → `Completed`.
- **Undo Capability**: Accidental status changes can be reversed immediately.
- **Internal Notes**: detailed timestamped notes for team coordination (e.g., "Gate code 1234").
- **Media Attachments**: Upload, view, and delete photos (receipts, delivery proof, etc.) directly to orders.

### 4. Business Settings & Team
- **Staff Management**: Invite team members with specific roles (Owner/Staff).
- **Business Profile**: Manage opening hours, contact info, and currency settings.
- **Operational Defaults**: Configure global tax rates and delivery fees.

---

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Language**: TypeScript
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
- **Navigation**: Expo Router
- **Maps**: React Native Google Places Autocomplete
- **UI**: Lucide React Native, Custom Design System

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- Node.js (v18+)
- [Expo Go](https://expo.dev/client) app on your mobile device (or Android/iOS Simulator).
- A [Supabase](https://supabase.com) project.
- A [Google Maps API Key](https://developers.google.com/maps/documentation/places/web-service/get-api-key) (Places API enabled).

### 2. Clone & Install
```bash
git clone <repository-url>
cd mapnshop-app
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory (copy from a template if available) and add the following keys:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_maps_api_key
```

### 4. Database Setup (Critical)
The application relies on a specific database schema. You must apply the migration scripts to your Supabase project.

1.  Open your Supabase Dashboard -> **SQL Editor**.
2.  Run the contents of `supabase/migrations/fix_schema.sql` to:
    *   Create necessary tables (`businesses`, `orders`, `order_activity`).
    *   Add missing columns (`currency`, `default_tax_rate`, etc.).
    *   Enable Row Level Security (RLS) policies.
    *   Configure Storage buckets for attachments.

### 5. Running the App
Start the development server:

```bash
npx expo start
```
- Scan the QR code with **Expo Go** (Android/iOS).
- Press `w` to run in the web browser (limited functionality for native features like Camera).

---

## 📂 Project Structure

```
mapnshop-app/
├── app/                  # Expo Router pages
│   ├── (auth)/           # Authentication screens
│   ├── (tabs)/           # Main navigation tabs (Inbox, Settings, Create)
│   └── order/            # Order details & modals
├── components/           # Reusable UI components
├── contexts/             # React Context (Auth, Business)
├── lib/                  # Services & API clients (Supabase, API wrappers)
├── supabase/             # Database migrations & types
└── types/                # TypeScript interfaces
```

## 🤝 Contributing
1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit changes (`git commit -m 'Add amazing feature'`).
4.  Push to branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.
