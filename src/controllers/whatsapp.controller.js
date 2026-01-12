import { checkWhatsappApi } from '../services/whatsapp.service.js';
import { getClient } from '../config/whatsapp.client.js';

export async function checkWhatsAppController(isReady, req, res) {
    try {
        // Verificar si el cliente de WhatsApp está conectado
        if (!isReady()) {
            return res.status(503).json({
                error: 'Sesión de WhatsApp no disponible',
                message: 'El cliente de WhatsApp está desconectado o no está listo'
            });
        }

        const { phoneNumber } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({
                error: 'El campo phoneNumber es requerido'
            });
        }
        if (!/^\d{7,15}$/.test(phoneNumber)) {
            return res.status(400).json({ error: 'Número inválido' });
        }
// Formatear el número al formato de WhatsApp (ejemplo
// si el numero empieza con 09, agregar el código de país 593 delante
        let formattedNumber = phoneNumber.replace(/[^\d]/g, ''); // Eliminar caracteres no numéricos
        if (formattedNumber.startsWith('09')) {
            formattedNumber = `593${formattedNumber.slice(1)}`;
        }
        // Agregar @c.us si no lo tiene
        if (!formattedNumber.includes('@')) {
            formattedNumber = `${formattedNumber}@c.us`;
        }

        console.log(`Verificando número: ${formattedNumber}`);
        const result = await checkWhatsappApi(getClient(), formattedNumber);
        res.json({
            message: 'Verificación completada', 
            data: {
                verification: result.isRegistered,
                phoneNumber: phoneNumber,
                timestamp: new Date().toISOString()
            }
        });
// Verificar si el número está registrado en WhatsApp
        
    } catch (error) {
        console.error('Error al verificar el número:', error);
        res.status(500).json({
            error: 'Error al verificar el número',
            message: error.message
        });
    }
}