# CETS – Campus Event & Ticketing System 🎓🎫

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org/)

**CETS** is a comprehensive event management and ticketing platform designed specifically for university campuses. It streamlines the entire event lifecycle—from creation and promotion to secure ticketing and real-time attendance tracking.

---

## ✨ Key Features

### 🔐 Role-Based Access Control
- **Students**: Browse events, purchase tickets, manage their digital wallet, and view purchase history.
- **Organizers**: Create and manage events, track sales, generate reports, and verify tickets.
- **Administrators**: System-wide oversight, user management, and detailed audit logs.

### 🎫 Smart Ticketing System
- **QR Code Generation**: Every ticket comes with a unique, secure QR code for easy entry.
- **PDF Tickets**: Automated PDF generation for tickets, sent directly to users.
- **Email Notifications**: Instant confirmation and updates via integrated email service.

### 💎 CETS Pro & Subscriptions
- **RevenueCat Integration**: Seamless subscription management for "Pro" features.
- **Premium Perks**: Advanced analytics for organizers and exclusive event access.

### 📊 Analytics & Reporting
- **Interactive Dashboards**: Real-time data visualization using Recharts.
- **Exportable Reports**: Generate detailed CSV/PDF reports for event performance.
- **Audit Logs**: Full transparency for administrative actions.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Context API
- **Charts**: [Recharts](https://recharts.org/)
- **Payments**: [RevenueCat Web SDK](https://www.revenuecat.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Auth**: JWT & Bcrypt.js
- **File Handling**: Multer & PDFKit

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Malende235/cets-must.git
   cd cets-must
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   # Create a .env file based on the template (see Configuration section)
   npm run db:init  # Initializes the PostgreSQL database
   npm run dev      # Starts the backend server
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   # Create a .env file (see Configuration section)
   npm run dev      # Starts the Vite development server
   ```

---

## ⚙️ Configuration

### Backend `.env`
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cets_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@must.ac.ug
EMAIL_PASS=your_email_password
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_REVENUECAT_API_KEY=your_revenuecat_key
```

---

## 📁 Project Structure

```text
CETS/
├── backend/            # Express.js API
│   ├── src/
│   │   ├── models/     # Database schemas & seeds
│   │   ├── routes/     # API endpoints
│   │   ├── services/   # Business logic (Payment, PDF, etc.)
│   │   └── app.js      # Server entry point
│   └── uploads/        # Local storage for event banners
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Auth & Subscription providers
│   │   ├── pages/      # View components
│   │   └── api/        # Axios configurations
│   └── public/         # Static assets
└── assets/             # Project documentation & images
```

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

*Developed with ❤️ by the MUST Dev Team.*
