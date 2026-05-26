const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const LEDGER_FILE = path.join(__dirname, 'ledger.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize ledger if it doesn't exist
function initializeLedger() {
    if (!fs.existsSync(LEDGER_FILE)) {
        const initialLedger = {
            version: "1.0.0",
            createdAt: new Date().toISOString(),
            transactions: [],
            balanceHistory: [],
            currentBalance: 94,
            exportPayloads: []
        };
        fs.writeFileSync(LEDGER_FILE, JSON.stringify(initialLedger, null, 2));
        console.log('✓ Ledger initialized');
    }
}

// Read ledger
function readLedger() {
    if (fs.existsSync(LEDGER_FILE)) {
        const data = fs.readFileSync(LEDGER_FILE, 'utf8');
        return JSON.parse(data);
    }
    return null;
}

// Write ledger
function writeLedger(data) {
    fs.writeFileSync(LEDGER_FILE, JSON.stringify(data, null, 2));
    console.log('✓ Ledger updated');
}

// Routes

/**
 * GET /api/balance
 * Retrieve current ByteBucks balance
 */
app.get('/api/balance', (req, res) => {
    const ledger = readLedger();
    if (!ledger) {
        return res.status(500).json({ error: 'Ledger not found' });
    }
    res.json({
        currentBalance: ledger.currentBalance,
        currency: 'BB',
        usdEquivalent: ledger.currentBalance * 1.00,
        lastUpdated: new Date().toISOString()
    });
});

/**
 * POST /api/transaction
 * Process a transaction handshake
 */
app.post('/api/transaction', (req, res) => {
    const { amount, assetNodes, destinationAccount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    const ledger = readLedger();
    if (!ledger) {
        return res.status(500).json({ error: 'Ledger not found' });
    }

    if (amount > ledger.currentBalance) {
        return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create transaction record
    const transaction = {
        id: `TXN-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'EXPORT',
        amount: amount,
        assetNodes: assetNodes || [],
        destinationAccount: destinationAccount || 'BANKING_API_RELAY',
        status: 'COMPLETED',
        conversionRate: 1.00,
        usdAmount: amount * 1.00
    };

    // Update balance
    ledger.currentBalance -= amount;

    // Log transaction
    ledger.transactions.push(transaction);

    // Add to balance history
    ledger.balanceHistory.push({
        timestamp: new Date().toISOString(),
        previousBalance: ledger.currentBalance + amount,
        newBalance: ledger.currentBalance,
        changeAmount: -amount,
        transactionId: transaction.id
    });

    // Create export payload
    const exportPayload = {
        id: `PAYLOAD-${Date.now()}`,
        transactionId: transaction.id,
        timestamp: new Date().toISOString(),
        amount: amount,
        usdAmount: transaction.usdAmount,
        assetNodes: assetNodes || [],
        bankingMetadata: {
            conversionRate: transaction.conversionRate,
            processingFee: 0,
            netAmount: transaction.usdAmount,
            destination: destinationAccount
        },
        status: 'VALIDATED'
    };

    ledger.exportPayloads.push(exportPayload);

    // Write updated ledger
    writeLedger(ledger);

    res.json({
        success: true,
        transaction: transaction,
        exportPayload: exportPayload,
        newBalance: ledger.currentBalance,
        message: 'Transaction processed and ledger updated'
    });
});

/**
 * GET /api/transactions
 * Retrieve all transactions from ledger
 */
app.get('/api/transactions', (req, res) => {
    const ledger = readLedger();
    if (!ledger) {
        return res.status(500).json({ error: 'Ledger not found' });
    }

    res.json({
        totalTransactions: ledger.transactions.length,
        transactions: ledger.transactions,
        timestamps: {
            ledgerCreated: ledger.createdAt,
            queriedAt: new Date().toISOString()
        }
    });
});

/**
 * GET /api/balance-history
 * Retrieve balance history from ledger
 */
app.get('/api/balance-history', (req, res) => {
    const ledger = readLedger();
    if (!ledger) {
        return res.status(500).json({ error: 'Ledger not found' });
    }

    res.json({
        currentBalance: ledger.currentBalance,
        history: ledger.balanceHistory,
        totalRecords: ledger.balanceHistory.length
    });
});

/**
 * GET /api/export-payloads
 * Retrieve all banking export payloads
 */
app.get('/api/export-payloads', (req, res) => {
    const ledger = readLedger();
    if (!ledger) {
        return res.status(500).json({ error: 'Ledger not found' });
    }

    res.json({
        totalPayloads: ledger.exportPayloads.length,
        payloads: ledger.exportPayloads,
        queriedAt: new Date().toISOString()
    });
});

/**
 * GET /api/ledger
 * Retrieve entire ledger state
 */
app.get('/api/ledger', (req, res) => {
    const ledger = readLedger();
    if (!ledger) {
        return res.status(500).json({ error: 'Ledger not found' });
    }

    res.json({
        ledger: ledger,
        queriedAt: new Date().toISOString()
    });
});

/**
 * POST /api/reset
 * Reset ledger to initial state (Admin only)
 */
app.post('/api/reset', (req, res) => {
    const adminKey = req.body.adminKey;
    
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'admin_reset_key') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const initialLedger = {
        version: "1.0.0",
        createdAt: new Date().toISOString(),
        transactions: [],
        balanceHistory: [],
        currentBalance: 94,
        exportPayloads: []
    };

    writeLedger(initialLedger);

    res.json({
        success: true,
        message: 'Ledger reset to initial state',
        ledger: initialLedger
    });
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Mindfighter Transaction API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        ledgerFile: fs.existsSync(LEDGER_FILE) ? 'ACTIVE' : 'MISSING'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[ERROR]', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// Start server
initializeLedger();

app.listen(PORT, () => {
    console.log(`\n╔════════════════════════════════════════╗`);
    console.log(`║  Mindfighter Transaction API Engine   ║`);
    console.log(`║  Running on port ${PORT}                    ║`);
    console.log(`║  Status: READY                        ║`);
    console.log(`╚════════════════════════════════════════╝\n`);
    console.log('Available endpoints:');
    console.log('  GET  /api/balance');
    console.log('  POST /api/transaction');
    console.log('  GET  /api/transactions');
    console.log('  GET  /api/balance-history');
    console.log('  GET  /api/export-payloads');
    console.log('  GET  /api/ledger');
    console.log('  POST /api/reset');
    console.log('  GET  /api/health\n');
});

module.exports = app;
