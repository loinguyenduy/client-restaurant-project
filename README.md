# Royal Restaurant — Frontend

A modern, responsive web application for **Royal Restaurant**, designed to handle the end-to-end customer dining experience alongside real-time floor and kitchen operations. This repository contains the client-side single-page application (SPA) built with React, Redux, SCSS, and Socket.IO.

---

## Project Overview

Royal Restaurant connects front-of-house guests with operational back-of-house staff in a unified digital platform:

- **Customer Experience:** Provides a fine-dining digital storefront where customers can explore categorized menus, configure orders, reserve tables, track order and payment statuses, and review completed meals.
- **Staff Operational Portal:** Equips restaurant floor staff and cashiers with a high-efficiency POS terminal for table management, walk-in/reservation seating, active order handling, and instant checkout.
- **Kitchen Display System (KDS):** Delivers a live kitchen board that organizes orders into preparation batches, tracks elapsed cooking times, and updates dish readiness in real time.
- **Admin Management Portal:** Gives restaurant managers full visibility over revenue analytics, menu cataloging, inventory stock movements, review moderation, and staff attendance logs.

---

## Live Demo

The full-stack application is deployed and available for interactive evaluation:

- **Live Application:** [https://royal-restaurant-nine.vercel.app/](https://royal-restaurant-nine.vercel.app/)
- **Frontend Repository:** [https://github.com/loinguyenduy/client-restaurant-project](https://github.com/loinguyenduy/client-restaurant-project)
- **Backend Repository:** [https://github.com/loinguyenduy/server-restaurant-project](https://github.com/loinguyenduy/server-restaurant-project)

---

## Demo Accounts

Pre-configured demo accounts are available for evaluating each role:

| Role | Email | Password | Direct Login Link | Target Workspace |
|---|---|---|---|---|
| **Customer** | `customer.demo@royalrestaurant.com` | `123456` | [Customer Sign In](https://royal-restaurant-nine.vercel.app/login) | Public Storefront & Orders |
| **Staff** | `staff.demo@royalrestaurant.com` | `123456` | [Staff & Admin Portal](https://royal-restaurant-nine.vercel.app/portal/login) | POS, KDS & Attendance |
| **Admin** | `admin.demo@royalrestaurant.com` | `123456` | [Staff & Admin Portal](https://royal-restaurant-nine.vercel.app/portal/login) | Full Management Suite |

> **Note:** These accounts are provided for demonstration and evaluation purposes using sample data. Demo data may be periodically reset or updated without notice.

---

## Main User Workflows

```
  Customer Storefront                     Internal Operations Portal
 ┌──────────────────────┐               ┌───────────────────────────────┐
 │ • Browse Menu        │               │ • POS Table Management        │
 │ • Cart Sync (Guest)  │               │ • Walk-in / Seated Diners     │
 │ • PayOS / Cash Order │───────┐       │ • Kitchen Batches (KDS)       │
 │ • Table Reservation  │       │       │ • Inventory Stock Movements   │
 │ • Order & Receipt    │       ▼       │ • Attendance & Admin Reports  │
 └──────────────────────┘  Socket.IO    └───────────────────────────────┘
                               ▲
                               │ State Signals
                               ▼
               ┌─────────────────────────────────┐
               │    Authoritative REST Backend   │
               │  MySQL · Sequelize · Node.js    │
               └─────────────────────────────────┘
```

### 1. Customer Workflow
- **Menu Exploration & Filtering:** View dishes organized by categories with real-time stock indicators, preparation estimates, and rich dish details.
- **Guest-to-Authenticated Cart:** Browse and add items to a local cart as a guest; items are automatically synchronized and validated against backend stock upon signing in.
- **Order Placement & Checkout:** Order for takeaway or dine-in, submit special instructions, and pay securely via PayOS (Vietnamese QR payment) or cash on fulfillment.
- **Table Reservation:** Book dining tables with guest counts, specific time slots, and special requests; receive live status updates on confirmation.
- **Order Tracking & Receipts:** Inspect order progress in real time (`pending` → `confirmed` → `preparing` → `ready` → `completed`), download or print formatted receipts.
- **Customer Reviews:** Leave ratings and feedback for fulfilled orders to provide social proof.

### 2. Staff Workflow
- **POS Floor Terminal:** Monitor visual floor plans (Available, Occupied, Reserved tables), seat walk-in guests or reservations, and open active table tabs.
- **Dynamic Table Ordering:** Add items to existing dine-in sessions in discrete kitchen batches, track table totals, and trigger bill printouts.
- **Cashier Checkout:** Collect payment via cash or dynamically generated PayOS table QR codes, releasing tables immediately upon settlement.
- **Kitchen Display System (KDS):** Group incoming kitchen tickets into distinct batches (`initial`, `added`), transition statuses (`confirmed` → `preparing` → `ready`), and view elapsed ticket timers.
- **Staff Attendance:** Check in and check out for daily working shifts with timestamp logging.

### 3. Administrator Workflow
- **Analytics Dashboard:** Review revenue summaries, order volume trends, popular dishes, and operational statistics.
- **Menu & Catalog Control:** Create, update, or archive dishes and categories with Cloudinary image uploads, stock limits, and preparation times.
- **Inventory Tracking:** View stock movements, perform manual restocks or inventory adjustments, and track stock audit logs.
- **Staff & Access Governance:** Promote or demote users between customer and staff roles while ensuring root admin safety.
- **Review Moderation:** Supervise customer testimonials and manage review visibility.

---

## Frontend Architecture

The application is structured into distinct consumer and operational zones, sharing a centralized Redux store and a singleton network layer.

```
React View Layer (SPA)
  ├── Customer Views: MainLayout (Home, Menu, Cart, Checkout, Reservation, Reviews)
  └── Operational Views: AdminLayout (POS Terminal, Kitchen Display, Tables, Inventory, Users)
          │
          ▼
Redux Store (State & Session Management)
  ├── authReducer: Authenticated user profile, access token in memory, role checks
  └── cartReducer: Local & server cart state (persisted via redux-persist)
          │
          ▼
Network & Communications Layer
  ├── Axios Interceptor: Attached Bearer token, automatic 401 retry via /refresh cookie
  └── Socket.IO Client: Authenticated rooms (public:menu, user:id, role:staff, kitchen)
```

### Conceptual Data & Synchronization Flow
1. **Authoritative Backend:** The MySQL database and REST API remain the single source of truth for all business state.
2. **Action-Driven Requests:** User actions (placing an order, checking out a table, progressing a kitchen ticket) dispatch REST API calls via Axios.
3. **Socket.IO Event Propagation:** Upon a successful database transaction commit, the backend emits targeted Socket.IO events (`order:status_changed`, `product:availability_changed`, `table:status_changed`).
4. **Reactive Client Invalidation:** Frontend listeners capture these events and trigger selective re-fetching or state updates, ensuring instant UI synchronization across devices.

---

## Frontend Engineering Highlights

- **Guest-to-Authenticated Cart Synchronization:** Customers can build a cart without an account. Upon logging in, the client dispatches a synchronization payload that merges local items with existing server carts while validating stock availability and adjusting quantities automatically.
- **Resilient JWT Session Rotation via Axios Interceptors:** Access tokens are kept securely in memory. When an access token expires, Axios intercepts the `401 Unauthorized` response, requests a new token via the HTTP-only refresh cookie (`POST /refresh`), and replays the failed request without interrupting the user session.
- **Real-Time Synchronized Kitchen Display System (KDS):** Built with batch awareness (`kitchen_batch_id`). When servers add dishes to an active table order, the kitchen sees new items as a separate ticket batch with its own timer, preventing confusion with dishes already being cooked.
- **Responsive Floor Plan & POS Interface:** The POS terminal combines responsive SVG/CSS table cards with instant order builders, handling quick modal-based checkouts, cash calculations, and QR display.
- **Print-Optimized Order Receipts:** Includes specialized print stylesheets (`@media print`) and layout components for customer receipts and itemized bill summaries.
- **Automated Cart Revalidation on Menu Invalidation:** Listens to `product:availability_changed` broadcast signals; if an item in the user's active cart is updated or sold out, the cart runs a non-intrusive re-validation to notify the buyer before checkout.

---

## Technology Stack

| Domain | Technology / Library | Usage in Project |
|---|---|---|
| **Core Framework** | React 19 (`react`, `react-dom`) | Declarative component UI library |
| **Language** | JavaScript (ES6+) | Modern client-side application logic |
| **Routing** | React Router DOM v7 | Client-side routing, protected routes (`PrivateRoute`, `RoleRoute`) |
| **State Management** | Redux 5, React Redux 9 | Global state management for authentication, session, and cart |
| **State Persistence** | Redux Persist 6 | Local storage persistence for guest cart sessions |
| **HTTP Client** | Axios 1.13 | HTTP request pipeline with custom interceptors for token refresh |
| **Real-Time Events** | Socket.IO Client 4.8 | WebSocket client for live order, kitchen, and inventory signals |
| **Styling Architecture** | Sass / SCSS (`sass` 1.97) | Responsive styling, flexbox/grid layouts, and design tokens |
| **UI Components & Icons** | Lucide React (`lucide-react`) | Consistent vector icon system for POS, KDS, and dashboards |
| **Feedback & Notifications** | React Toastify, SweetAlert2 | Operational status alerts, confirmations, and toast messages |
| **Utility Packages** | QRCode.react, React Paginate | Dynamic payment QR rendering and paginated data tables |
| **Build & Scripts** | Create React App (`react-scripts` 5) | Development server, asset compilation, and production bundling |
| **Deployment Target** | Vercel | Production CDN hosting with SPA route rewrites (`vercel.json`) |

---

## Environment Variables

Configure frontend variables in `.env` (refer to `.env.example`):

| Variable | Required | Default / Example | Purpose |
|---|---|---|---|
| `REACT_APP_API_URL` | **Yes** (in production) | `http://localhost:8080/api/v1` | Base REST API endpoint URL |
| `REACT_APP_SOCKET_URL` | No (optional) | _(Empty, defaults to API host)_ | Socket.IO connection origin if separated from API host |

> **Security Note:** All `REACT_APP_*` variables are embedded into public JavaScript bundles during build time. **Never** include private API keys, secrets, or administrative credentials here.

---

## Local Development

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/loinguyenduy/client-restaurant-project.git
   cd client-restaurant-project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   *Adjust `REACT_APP_API_URL` if your backend runs on a custom port.*

4. **Start the local development server:**
   ```bash
   npm start
   ```
   *The application will open automatically at `http://localhost:3000`.*

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## Production & Deployment

The client is configured for single-page application (SPA) deployment on Vercel via `vercel.json`.

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "create-react-app",
  "installCommand": "npm ci",
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This configuration ensures that all browser navigation requests route back to `index.html` for client-side routing resolution.

---

## Security and Architecture Notes

- **Client-Side Authorization vs Backend Boundaries:** Route guards (`PrivateRoute`, `RoleRoute`) control UI navigation for user convenience. All destructive operations and data access are strictly verified and enforced by backend RBAC middleware.
- **Secure Token Storage:** Access tokens exist exclusively in memory (Redux state). Refresh tokens are managed via secure, HTTP-only browser cookies that cannot be accessed by client JavaScript, mitigating Cross-Site Scripting (XSS) credential theft.

---

## Known Limitations

- **Automated Testing:** Automated end-to-end (E2E) UI test coverage is currently limited; core workflows were verified through manual integration testing, cross-browser verification, and live operational simulation.
- **External Payment Dependency:** Online payment simulation relies on external PayOS sandbox availability.

---

## Related Repositories

- **Backend API & Real-Time Engine:** [server-restaurant-project](https://github.com/loinguyenduy/server-restaurant-project)
- **Live Deployment:** [Royal Restaurant on Vercel](https://royal-restaurant-nine.vercel.app/)
