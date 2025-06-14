const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Form data için

// Global değişkenler
let bigWinActive = false;
let lastWinAmount = 0;

// Ana sayfa - durum gösterimi
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Big Win API</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #1a1a1a; color: white; text-align: center; }
            .status { padding: 20px; border-radius: 10px; margin: 20px 0; font-size: 1.5em; }
            .active { background: linear-gradient(45deg, #FFD700, #FF6B35); color: #000; }
            .inactive { background: #333; }
            .endpoint { background: #2d2d2d; padding: 15px; margin: 10px 0; border-radius: 8px; text-align: left; }
            .method { color: #4CAF50; font-weight: bold; }
            .url { color: #FFD700; }
            code { background: #000; padding: 5px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <h1>🎰 Big Win Kutlama API</h1>
        
        <div class="status ${bigWinActive ? 'active' : 'inactive'}">
            ${bigWinActive ? `🎉 BIG WIN AKTIF! 🎉<br>💰 ${lastWinAmount} TL 💰` : '⏳ Beklemede...'}
        </div>
        
        <h2>📡 API Endpoints</h2>
        
        <div class="endpoint">
            <h3><span class="method">GET</span> <span class="url">/check-bigwin</span></h3>
            <p>Response: {"bigwin": ${bigWinActive}, "amount": ${lastWinAmount}}</p>
        </div>
        
        <div class="endpoint">
            <h3><span class="method">POST</span> <span class="url">/trigger-bigwin</span></h3>
            <p>Body: {"amount": 2500}</p>
            <p>Test: <code>curl "https://bigwin-z94k.onrender.com/trigger-bigwin?amount=2500"</code></p>
        </div>
        
        <div class="endpoint">
            <h3>🤖 Botrix Komutu (Moderatör)</h3>
            <p><code>!addcommand !bigwin fetch[https://bigwin-z94k.onrender.com/trigger-bigwin]</code></p>
            <p><small>Sabit 5000 TL ile çalışır, OBS animasyonunu tetikler</small></p>
        </div>
        
        <script>
            // 5 saniyede bir yenile
            setTimeout(() => location.reload(), 5000);
        </script>
    </body>
    </html>
    `);
});

// BigWin durumu kontrol et
app.get('/check-bigwin', (req, res) => {
    try {
        res.json({
            bigwin: bigWinActive,
            amount: lastWinAmount,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Check bigwin error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// BigWin tetikle
app.post('/trigger-bigwin', (req, res) => {
    try {
        // Farklı veri formatlarını destekle
        let amount = req.body.amount || req.body.Amount || 1000;
        
        // String'den number'a çevir
        if (typeof amount === 'string') {
            amount = parseInt(amount) || 1000;
        }
        
        bigWinActive = true;
        lastWinAmount = amount;
        
        // 6 saniye sonra otomatik kapat
        setTimeout(() => {
            bigWinActive = false;
        }, 6000);
        
        console.log(`🎰 BIG WIN! ${lastWinAmount} TL - ${new Date().toISOString()}`);
        
        res.json({
            success: true,
            message: `Big Win activated: ${amount} TL`,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Trigger bigwin error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// Manuel sıfırlama
app.post('/reset', (req, res) => {
    try {
        bigWinActive = false;
        lastWinAmount = 0;
        res.json({
            success: true, 
            message: 'Reset edildi',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Reset error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        available_endpoints: [
            'GET /',
            'GET /check-bigwin',
            'POST /trigger-bigwin',
            'POST /reset',
            'GET /health'
        ]
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Global error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
    console.log(`📡 Render URL: https://bigwin-z94k.onrender.com`);
});
