
# Mapnshop App: The A-Z Workflow

This document outlines the complete operational workflow of the Mapnshop system, from initial setup to daily operations and reporting.

---

## **Part 1: Getting Started**

### **1. Authentication**
*   **Sign Up**: New users create an account using their email and password.
*   **Sign In**: Existing users log in to access their business dashboard.
*   **Security**: Authentication is managed securely via Supabase Auth.

### **2. Business Onboarding (First Time Setup)**
Upon first login, you are guided through a setup wizard:
1.  **Business Profile**: Enter your business name, phone number, and category.
2.  **Location**: Set your business address (powered by Google Places for accuracy).
3.  **Operations**: Configure global defaults:
    *   **Currency**: Select your operating currency (USD, EUR, etc.).
    *   **Tax Rate**: Set a default tax percentage.
    *   **Delivery Fees**: Define standard delivery charges.

---

## **Part 2: The Core Loop (Daily Operations)**

### **1. Creating an Order**
Navigate to the **(+) Create** tab to log a new order.
*   **Customer Entry**:
    *   **New Customer**: Enter Name and Phone. The system saves this for future autofill.
    *   **Existing Customer**: Type a name or number to auto-populate details.
*   **Order Details**:
    *   **Items**: Add line items with prices.
    *   **Type**: Select **Delivery** or **Pickup**.
    *   **Fees**: Tax and Delivery fees are auto-calculated (but editable).
*   **Submission**: Tapping "Create Order" instantly syncs the order to the dashboard.

### **2. Managing Orders (The Inbox)**
Navigate to the **Inbox** (Home) tab. This is your command center.
*   **Live Dashboard**: View all active orders sorted by urgency or recency.
*   **Filtering**:
    *   **Search**: Find orders by Customer Name, Phone, or Order ID.
    *   **Status Tabs**: Filter by `Active` vs `Completed`.

### **3. Consolidating an Order (Order Details)**
Tap on any order to view its full details:
*   **Status Pipeline**: Progress the order through its lifecycle:
    *   `Created` ➔ `Preparing` ➔ `Ready` ➔ `Completed`
    *   *Undo*: Mistakenly advanced? You can revert status with one tap.
*   **Communication**: Use the Call/Message buttons to contact the customer directly.
*   **Notes**: Add internal timestamps notes (e.g., "Customer requested extra sauce").
*   **Attachments**: Upload photos (receipts, finished goods) for proof of work.

---

## **Part 3: Management & Insights**

### **1. Analytics (Reports Tab)**
Navigate to the **Reports** tab to monitor health.
*   **Daily Snapshots**: Revenue, Total Orders, Delivery vs. Pickup split.
*   **Timeframes**: Toggle between **Today**, **Yesterday**, and **Last 7 Days**.
*   **Performance Metrics**: Track Average Order Value (AOV) and fulfillment efficiency.

### **2. Settings & Configuration**
Navigate to the **Settings** tab.
*   **Business Profile**: Update operating hours and contact info.
*   **Team Management**:
    *   **Invite Staff**: Add employees via email.
    *   **Roles**: Assign `Owner` (full access) or `Staff` (limited access) roles.
*   **Hardware**: Connect and configure thermal printers for receipts.
*   **Account Security**: Update password or email; manage session security.

---

## **Part 4: Support & Maintenance**
*   **Help Center**: Access FAQs and guides within the app.
*   **Terms & Policies**: Review Terms of Service and Privacy Policy.
