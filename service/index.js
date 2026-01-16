// Inicializar logger primero
import './src/utils/logger.js';

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    // El servidor continúa funcionando
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    // El servidor continúa funcionando
});

// Inicializar cliente de WhatsApp primero
try {
    await import('./src/config/whatsapp.client.js');
    console.log('✅ Cliente de WhatsApp inicializado correctamente');
} catch (error) {
    console.error('❌ Error durante la inicialización de WhatsApp:', error.message);
    console.error('⚠️  El servidor se iniciará de todas formas, pero responderá 503 hasta que WhatsApp esté listo');
    console.error('💡 Sugerencia: Intenta eliminar la carpeta .wwebjs_auth y reiniciar');
}

// Siempre iniciar el servidor API, independientemente del estado de WhatsApp
await import('./src/config/routes.js');

// Iniciar monitor de salud
import { startHealthMonitor } from './src/services/health-monitor.service.js';
startHealthMonitor();


