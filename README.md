# 🌾 AgriLink — Direct Farmer to Customer Marketplace

AgriLink is a modern agritech platform that connects local farmers directly with consumers. It eliminates unnecessary middlemen, ensures fair pricing for farmers, and provides fresh, verified produce to customers with complete transparency.

---

## 🌟 Key Highlights

- **🚜 Direct Farmer-to-Consumer Connection**: Enables farmers to list harvests and sell directly to consumers.
- **💰 Fair & Transparent Pricing**: View direct farm prices alongside market benchmarks for honest transactions.
- **📦 End-to-End Order Tracking**: Real-time status updates from farm harvest to doorstep delivery.
- **📊 Farmer Business Intelligence**: Built-in analytics dashboard for sales, revenue trends, and operational farm expenses.
- **🛡️ Secure Role-Based Access**: Dedicated workspaces for Farmers and Customers secured with JWT authentication.

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts & Data Visualization**: [Recharts](https://recharts.org/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **Server**: [Uvicorn](https://www.uvicorn.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) (via PyMongo)
- **Data Validation**: [Pydantic v2](https://docs.pydantic.dev/)
- **Authentication**: JWT (OAuth2 Password Bearer) with Passlib / Bcrypt hashing

---

## 📁 Repository Structure

```text
Agrichain/
├── backend/
│   ├── app/
│   │   ├── config/          # Database connection & application settings
│   │   ├── models/          # Data models and Pydantic schemas
│   │   ├── routes/          # FastAPI route controllers
│   │   │   ├── auth.py          # User registration & login
│   │   │   ├── products.py      # Product catalog & listings
│   │   │   ├── orders.py        # Order creation & customer history
│   │   │   ├── farmers.py       # Farmer orders & profile endpoints
│   │   │   ├── reports.py       # Sales & revenue analytics
│   │   │   ├── expenses.py      # Farm expense management
│   │   │   ├── cart.py          # Shopping cart operations
│   │   │   └── notifications.py # Real-time alerts
│   │   ├── services/        # Business logic & database operations
│   │   ├── utils/           # Auth helpers & password encryption
│   │   └── main.py          # FastAPI app entry point
│   ├── requirements.txt     # Python backend dependencies
│   ├── seed_data.py         # Initial mock data seeder
│   └── start-backend.bat    # Windows backend launcher script
├── frontend/
│   ├── public/              # Static assets & realistic farm imagery
│   ├── src/
│   │   ├── components/      # Modular UI components
│   │   │   ├── home/        # Homepage sections (Navbar, Journey, TrustCards, CTA, etc.)
│   │   │   ├── farmer/      # Farmer portal screens & widgets
│   │   │   └── customer/    # Customer marketplace & order views
│   │   ├── context/         # AuthContext and CartContext global state
│   │   ├── pages/           # Main route views (Home, Login, Register, Marketplace, Dashboard)
│   │   ├── services/        # API client and service endpoints
│   │   ├── App.jsx          # Root application routing
│   │   └── main.jsx         # React application entry point
│   ├── package.json         # Frontend dependencies & npm scripts
│   └── tailwind.config.js   # Custom Tailwind theme configuration
├── package.json             # Workspace-level package scripts
└── README.md                # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or newer)
- [Python](https://www.python.org/) (v3.10 or newer)
- [MongoDB](https://www.mongodb.com/) (running locally at `mongodb://localhost:27017` or a MongoDB Atlas URI)

---

### 2. Backend Setup

1. Open a terminal and change to the `backend` folder:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create/verify `.env` configuration in the `backend/` directory:
   ```env
   MONGO_URI=mongodb://localhost:27017
   DATABASE_NAME=agrilink_db
   SECRET_KEY=your_secret_key_here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   ```

5. (Optional) Seed the database with sample products and farmers:
   ```bash
   python seed_data.py
   ```

6. Launch the FastAPI server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   - API URL: `http://127.0.0.1:8000`
   - Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

---

### 3. Frontend Setup

1. Open a new terminal and change to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   - Frontend Application: `http://localhost:5173`

---

### 4. Running Both with a Single Command (Root)

From the project root directory (`Agrichain/`):
```bash
npm install
npm run dev
```

---

## 🔌 API Reference Overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new Farmer or Customer account | Public |
| `POST` | `/api/auth/login` | Login and receive JWT access token | Public |
| `GET` | `/api/products` | List available products | Public / Customer |
| `POST` | `/api/products` | Create a new produce listing | Farmer |
| `PUT` | `/api/products/{id}` | Update an existing product | Farmer |
| `DELETE` | `/api/products/{id}` | Delete a product listing | Farmer |
| `POST` | `/api/orders` | Place a customer order | Customer |
| `GET` | `/api/orders/my-orders` | Fetch customer order history | Customer |
| `GET` | `/api/farmers/orders` | Fetch incoming orders for farmer | Farmer |
| `PUT` | `/api/farmers/orders/{id}/status` | Update order fulfillment status | Farmer |
| `GET` | `/api/farmer/reports` | Get revenue and volume sales data | Farmer |
| `GET` / `POST` | `/api/farmer/expenses` | Manage farm operational expenses | Farmer |
| `GET` | `/api/health` | Service health status check | Public |

---

## 👥 User Workflows

### 🧑‍🌾 For Farmers
1. Click **Sign Up** and select **Farmer** role.
2. Enter personal credentials, Farm Name, and Location.
3. Access the **Farmer Dashboard** to:
   - Add new produce with category, unit, quantity, and price.
   - Track pending customer orders and update status to shipped/delivered.
   - Analyze revenue trends and review expenses.

### 🛒 For Customers
1. Click **Sign Up** and select **Customer** role.
2. Browse fresh harvests directly from verified farms.
3. Add items to your cart, enter delivery address, and place orders.
4. Track order progress in real-time under **My Orders**.

---

## 📄 License

This project is licensed under the MIT License.
