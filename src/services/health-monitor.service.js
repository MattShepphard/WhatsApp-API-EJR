import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { getClient, isReady } from '../config/whatsapp.client.js';
import { Client } from 'whatsapp-web.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SUPPORT_PHONE = process.env.SUPPORT_PHONE;
const INTERVAL = parseInt(process.env.HEALTH_CHECK_INTERVAL) || 3600000;

let monitorInterval = null;

async function sendHealthStatus() {
    try {
        const client = getClient();
        
        if (!isReady() || !client || !SUPPORT_PHONE) {
            console.log('⏭️ Health check omitido: WhatsApp no listo o SUPPORT_PHONE no configurado');
            return;
        }
        
        // Obtener información del cliente activo
        const clientInfo = client.info;
        const clientNumber = clientInfo?.wid?.user || 'Desconocido';
        
        let formattedPhone = SUPPORT_PHONE.replace(/[^\d]/g, '');
        if (!formattedPhone.includes('@')) {
            formattedPhone = `${formattedPhone}@c.us`;
        } 
        const message = `✅ *Whatsapp Checker:* \n📱 *Cliente:* ${clientNumber}\n🟢 *Estado:* Conectado`;

        await client.sendMessage(formattedPhone, message);
        console.log(`✅ Health check enviado a ${SUPPORT_PHONE} - Cliente: ${clientNumber}`);

    } catch (error) {
        console.error('❌ Error al enviar health check:', error.message);
    }
}

export function startHealthMonitor() {
    if (!SUPPORT_PHONE) {
        console.log('⚠️ SUPPORT_PHONE no configurado, health monitor desactivado');
        return;
    }

    console.log(`✅ Health monitor iniciado: reportes cada ${INTERVAL / 60000} minutos a ${SUPPORT_PHONE}`);

    setTimeout(sendHealthStatus, 60000);
    monitorInterval = setInterval(sendHealthStatus, INTERVAL);
}

export function stopHealthMonitor() {
    if (monitorInterval) {
        clearInterval(monitorInterval);
        monitorInterval = null;
        console.log('⏹️ Health monitor detenido');
    }
}
