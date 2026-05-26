# Mindfighter - Automated Asset System

**ByteBucks Recycled Asset Processing & Export Portal**

A complete full-stack application for processing recycled digital assets and executing secure transaction handshakes with banking infrastructure.

---

## 🏗️ System Architecture

### **1. Frontend App** (`Index.html`)
Interactive "Mindfighter" dashboard where users:
- View current **ByteBucks** balance
- Process simulated recycled asset nodes
- Execute transaction handshakes via the Export button
- Monitor real-time transaction logs in terminal overlay

**Features:**
- Mobile-responsive design (375px × 812px)
- Real-time balance widget with live updates
- Grid workspace with asset file nodes
- Terminal log simulation with sequential transaction steps
- Smooth animations and glassmorphic UI
- API health status indicator

---

### **2. Backend API Engine** (`server.js`)
Node.js Express application acting as the transaction middleware.

**Responsibilities:**
- Manages ledger state and persistence
- Validates transaction requests
- Converts ByteBucks to USD (1 BB = $1.00)
- Securely logs transaction activity
- Exports banking payloads

**Available Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Service health check |
| GET | `/api/balance` | Get current ByteBucks balance |
| POST | `/api/transaction` | Process transaction & update ledger |
| GET | `/api/transactions` | Retrieve all transactions |
| GET | `/api/balance-history` | Get balance change history |
| GET | `/api/export-payloads` | Get banking export records |
| GET | `/api/ledger` | Retrieve full ledger state |
| POST | `/api/reset` | Reset ledger (admin only) |

---

### **3. Ledger System** (`ledger.json`)
Persistent JSON data store tracking:
- **Transaction History** - All processed transactions with metadata
- **Balance History** - Timestamped balance changes
- **Export Payloads** - Banking export records for reconciliation
- **Current Balance** - Real-time ByteBucks balance

**Ledger Schema:**
```json
{
  "version": "1.0.0",
  "createdAt": "ISO-8601 timestamp",
  "currentBalance": 94,
  "transactions": [...],
  "balanceHistory": [...],
  "exportPayloads": [...]
}
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- npm

### Installation

```bash
# Clone repository
git clone https://github.com/orohtua/automated-asset-system.git
cd automated-asset-system

# Install dependencies
npm install

# Start server
npm start
```

Server runs on `http://localhost:3000`

### Development Mode
```bash
npm run dev  # Uses nodemon for auto-restart
```

---

## 💻 Usage

### 1. Access Frontend
Open `http://localhost:3000` in your browser to view the Mindfighter dashboard.

### 2. Check Balance
```bash
curl http://localhost:3000/api/balance
```

Response:
```json
{
  "currentBalance": 94,
  "currency": "BB",
  "usdEquivalent": 94.00,
  "lastUpdated": "2026-05-26T12:30:45.123Z"
}
```

### 3. Process Transaction
```bash
curl -X POST http://localhost:3000/api/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25,
    "assetNodes": ["junk_272", "sys_7002"],
    "destinationAccount": "BANKING_API_RELAY"
  }'
```

### 4. View Ledger State
```bash
curl http://localhost:3000/api/ledger
```

---

## 📊 Example Transaction Flow

1. **User initiates export** from frontend dashboard
2. **Frontend calls** `/api/transaction` with amount and asset nodes
3. **Backend validates** balance sufficiency
4. **Backend processes** the transaction:
   - Deducts amount from current balance
   - Records transaction with timestamp & metadata
   - Updates balance history
   - Creates banking export payload
5. **Ledger persists** all changes to `ledger.json`
6. **Frontend receives** response and updates UI
7. **Terminal logs** display sequential transaction steps

---

## 🔒 Security Features

- ✅ CORS enabled for safe cross-origin requests
- ✅ Input validation on all endpoints
- ✅ Admin-key protected reset endpoint
- ✅ Immutable transaction records (append-only)
- ✅ Timestamp verification on all operations
- ✅ Persistent ledger prevents data loss

---

## 📁 File Structure

```
automated-asset-system/
├── Index.html                # Frontend dashboard
├── server.js                 # Express API engine
├── ledger.json               # Persistent data store
├── package.json              # Dependencies
├── .gitignore                # Git exclusions
└── README.md                 # This file
```

---

## 🔄 Data Flow Diagram

```
Frontend (Index.html)
    ↓
[User clicks "Export to Banking App"]
    ↓
POST /api/transaction
    ↓
Backend (server.js)
    ↓
[Validate → Convert → Log]
    ↓
Write to Ledger (ledger.json)
    ↓
Response to Frontend
    ↓
Update Balance & Terminal Logs
```

---

## 📝 Environment Variables

Create a `.env` file for production:

```env
PORT=3000
ADMIN_KEY=your_secret_admin_key
NODE_ENV=production
```

---

## 📜 Transaction Record Example

```json
{
  "id": "TXN-1716700800000",
  "timestamp": "2026-05-26T08:00:00.000Z",
  "type": "EXPORT",
  "amount": 25,
  "assetNodes": ["junk_272", "sys_7002"],
  "destinationAccount": "BANKING_API_RELAY",
  "status": "COMPLETED",
  "conversionRate": 1.00,
  "usdAmount": 25.00
}
```

---

## 🛠️ Advanced Usage

### Reset Ledger (Admin)
```bash
curl -X POST http://localhost:3000/api/reset \
  -H "Content-Type: application/json" \
  -d '{"adminKey": "admin_reset_key"}'
```

### View Full Ledger
```bash
curl http://localhost:3000/api/ledger | jq
```

### Track Balance Changes
```bash
curl http://localhost:3000/api/balance-history | jq '.history'
```

### Check API Health
```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "OK",
  "service": "Mindfighter Transaction API",
  "version": "1.0.0",
  "timestamp": "2026-05-26T12:30:45.123Z",
  "ledgerFile": "ACTIVE"
}
```

---

## 🎯 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication & authorization
- [ ] Transaction signing & cryptographic verification
- [ ] Real banking API integration
- [ ] WebSocket real-time updates
- [ ] Audit logs & compliance reporting
- [ ] Multi-currency support
- [ ] Rate limiting & throttling

---

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ for secure asset transactions**
