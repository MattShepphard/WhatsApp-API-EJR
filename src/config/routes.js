import express from 'express';
import ms from 'ms';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { isReady } from './whatsapp.client.js';
import { checkWhatsAppController } from '../controllers/whatsapp.controller.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

// Rate limiting: 10 peticiones por minuto por IP
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 60,
    message: {
        error: 'rate_limit_exceeded',
        message: 'Por favor espera un momento antes de intentar nuevamente'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        whatsappConnected: isReady(),
        uptime: ms(process.uptime() * 1000, { long: true })
    });
});

app.post('/check-whatsapp', limiter, async (req, res) => {
    // Validar token
    if (req.headers['authorization']?.split(' ')[1] !== process.env.API_TOKEN) {
        return res.status(401).json({ error: 'Identifíquese para acceder al servicio' });
    }
    
    await checkWhatsAppController(isReady, req, res);
});

app.listen( PORT, () => {
    console.log(`✓ Servidor API escuchando en http://localhost:${PORT}`);
    console.log(`  - POST /check-whatsapp - Verificar si un número tiene WhatsApp`);
    console.log(`  - GET  /health - Estado del servidor`);
});