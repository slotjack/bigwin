const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Global değişkenler (sizin kodunuzdaki gibi basit)
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
            <p>Test: <code>curl -X POST -H "Content-Type: application/json" -d '{"amount": 2500}' ${req.get('host')}/trigger-bigwin</code></p>
        </div>
        
        <div class="endpoint">
            <h3>🤖 Botrix Komutu</h3>
            <p><code>!addcommand !bigwin fetch POST https://${req.get('host')}/trigger-bigwin {"amount": "$(randnum 1000 10000)"}</code></p>
        </div>
        
        <script>
            // 3 saniyede bir yenile
            setTimeout(() => location.reload(), 3000);
        </script>
    </body>
    </html>
    `);
});

// Sizin kodunuz - basit ve etkili
app.get('/check-bigwin', (req, res) => {
    res.json({
        bigwin: bigWinActive,
        amount: lastWinAmount
    });
});

app.post('/trigger-bigwin', (req, res) => {
    bigWinActive = true;
    lastWinAmount = req.body.amount || 1000;
    
    // 6 saniye sonra otomatik kapat
    setTimeout(() => bigWinActive = false, 6000);
    
    console.log(`🎰 BIG WIN! ${lastWinAmount} TL`);
    
    res.json({success: true});
});

// Ekstra: Manuel sıfırlama
app.post('/reset', (req, res) => {
    bigWinActive = false;
    lastWinAmount = 0;
    res.json({success: true, message: 'Reset edildi'});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
});
