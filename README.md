📦 Jewellery Inventory Management – Frontend (jw-fe)

A Progressive Web App (PWA) built using React.js, designed for jewellery shop owners to manage gold/silver stock, sales, and transaction history seamlessly across desktop and mobile.

🚀 Features
🔐 Authentication

Secure login for shop owners

Role-based access (optional future enhancement)

📦 Stock Management

Add new jewellery items

Manage gold & silver stock

Update item purity, weight, making charges

Auto-calculate total value

💰 Sales Management

Create customer sales entries

Deduct sold stock

Auto-update remaining balance

Download sales invoice (planned)

📜 History & Reports

View all previous stock updates

View sales history

Date-wise filtering

Export history (future scope)

📱 PWA Support

Installable on mobile & desktop

Offline support

Works like a native mobile app

📊 Dashboard

Total stock value

Recent sales

Quick actions

🛠️ Tech Stack
Layer	Technology
Frontend	React.js (with Hooks)
State Management	Context API / Redux (based on your implementation)
CSS	Plain CSS (modular), Responsive design
Routing	React Router
API Communication	Axios / Fetch
PWA	Service Worker + Manifest.json
Backend (not included here)	Spring Boot / Node.js (based on backend repo)
📁 Project Structure
jw-fe/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── service-worker.js
├── src/
│   ├── components/
│   │   ├── Sidebar/
│   │   ├── Navbar/
│   │   ├── Dashboard/
│   │   ├── Stocks/
│   │   ├── Sell/
│   │   ├── History/
│   │   └── ...
│   ├── pages/
│   ├── hooks/
│   ├── context/
│   ├── utils/
│   ├── App.js
│   └── index.js
├── .gitignore
├── package.json
└── README.md

⚙️ Setup Instructions
1️⃣ Clone this repo
git clone https://github.com/TestWala/jw-fe.git
cd jw-fe

2️⃣ Install dependencies
npm install

3️⃣ Start development server
npm start


Your app will run at:
👉 http://localhost:3000

📦 Build for Production
npm run build

📲 PWA Installation

Once hosted, users can:

Install from Chrome (desktop)

Add to Home Screen (mobile)

Use the app offline (if caches are configured)

🔗 Backend API

This frontend connects to:
➡️ Jewellery Inventory Management Backend (Spring Boot)

(You can link repo here if available.)

🧪 Future Enhancements

Customer management

Barcode / QR code for items

Multi-user (staff access)

Invoice generator (PDF)

Theme support (Dark mode)

👨‍💻 Author

TestWala Team