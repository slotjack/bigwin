const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global değişkenler
let bigWinActive = false;
let lastWinAmount = 1000; // HTML'deki varsayılan değer

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
            .active { background: linear-gradient(45deg, #FFD700, #FF6B35); color: #000; animation: pulse 1s infinite; }
            .inactive { background: #333; }
            .endpoint { background: #2d2d2d; padding: 15px; margin: 10px 0; border-radius: 8px; text-align: left; }
            .method { color: #4CAF50; font-weight: bold; }
            .url { color: #FFD700; }
            code { background: #000; padding: 5px; border-radius: 3px; }
            @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
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
            <p>OBS için durum kontrolü</p>
            <p>Response: {"bigwin": ${bigWinActive}, "amount": ${lastWinAmount}}</p>
        </div>
        
        <div class="endpoint">
            <h3><span class="method">GET</span> <span class="url">/trigger-bigwin</span></h3>
            <p>Kutlamayı başlatır (5000 TL sabit)</p>
        </div>
        
        <div class="endpoint">
            <h3>🤖 Botrix Komutu</h3>
            <p><code>!addcommand !bigwin fetch[https://bigwin-z94k.onrender.com/trigger-bigwin]</code></p>
            <p><small>Sadece !bigwin yazın, kutlama başlar</small></p>
        </div>
        
        <script>
            // 2 saniyede bir yenile
            setTimeout(() => location.reload(), 2000);
        </script>
    </body>
    </html>
    `);
});

// BigWin durumu kontrol et (OBS için)
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

        // BigWin tetikle - Botrix için GET endpoint
app.get('/trigger-bigwin', (req, res) => {
    try {
        bigWinActive = true;
        lastWinAmount = 1000;

        setTimeout(() => {
            bigWinActive = false;
        }, 6000);

        console.log(`🎰 BIG WIN BAŞLADI! - ${new Date().toLocaleString('tr-TR')}`);

        // BOTRIX'e sadece düz metin gönder
        res.setHeader('Content-Type', 'text/plain');
        res.send(''); // veya 'OK' da olabilir

    } catch (error) {
        console.error('Trigger bigwin error:', error);
        res.status(500).json({
            success: false,
            error: 'Sunucu hatası',
            message: error.message
        });
    }
});

    }
});

// Manuel sıfırlama
app.post('/reset', (req, res) => {
    try {
        bigWinActive = false;
        lastWinAmount = 5000;
        res.json({
            success: true, 
            message: 'Sistem sıfırlandı',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Reset error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        server: 'Big Win API',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())} saniye`
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint bulunamadı',
        available_endpoints: [
            'GET / - Ana sayfa',
            'GET /check-bigwin - Durum kontrolü',
            'GET /trigger-bigwin - Kutlamayı başlat',
            'POST /reset - Sıfırla',
            'GET /health - Sistem durumu'
        ]
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Global error:', error);
    res.status(500).json({
        error: 'Sunucu hatası',
        message: error.message
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Big Win API çalışıyor: http://localhost:${PORT}`);
    console.log(`📡 Render URL: https://bigwin-z94k.onrender.com`);
    console.log(`🤖 Botrix komutu: !addcommand !bigwin fetch[https://bigwin-z94k.onrender.com/trigger-bigwin]`);
});
