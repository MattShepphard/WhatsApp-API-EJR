import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;

import qrcode from 'qrcode-terminal';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const NAME_CLIENT = process.env.NAME_CLIENT || 'default';

// Variable global para rastrear la instancia del cliente
let clientInstance = null;
let isClientReady = false;
let isReconnecting = false;

// Función para destruir el cliente existente
async function destroyExistingClient() {
    if (clientInstance) {
        try {
            console.log("🔄 Destruyendo cliente existente...");
            await clientInstance.destroy();
            clientInstance = null;
            console.log("✓ Cliente anterior destruido correctamente");
        } catch (error) {
            console.error("⚠️ Error al destruir cliente anterior:", error.message);
            clientInstance = null;
        }
    }
}

function waitForReady(client, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    let isResolved = false;
    
    const timeout = setTimeout(() => {
      if (!isResolved) {
        reject(new Error("READY_TIMEOUT: El cliente no se conectó a tiempo"));
      }
    }, timeoutMs);

    // Solo escuchamos UNA vez
    client.once("ready", () => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeout);
        resolve();
      }
    });



    // Si se desconecta antes de ready
    client.once("disconnected", (reason) => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeout);
        reject(new Error(`DISCONNECTED antes de ready: ${reason}`));
      }
    });
  });
}

// Destruir cliente existente si lo hay
await destroyExistingClient();

// Función para inicializar el cliente
async function initializeClient() {
    // Configuración del cliente de WhatsApp Web
    const client = new Client({
        authStrategy: new LocalAuth({
            clientId: NAME_CLIENT, // Usar el nombre del cliente desde .env
        }),
        puppeteer: {
            headless: 'new',
            args: [
            '--no-sandbox',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--no-zygote',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-extensions',
            '--no-first-run',
            '--mute-audio'
            ]
        }
    });

    // Guardar referencia global del cliente
    clientInstance = client;
    isClientReady = false;



    // Eventos del cliente
    client.on('ready', () => {

        isClientReady = true;
        isReconnecting = false;
        console.log("✓ Cliente de WhatsApp listo");
    });
  
    client.on('qr', (qr) => {
        console.log('📲 QR recibido, escanea con WhatsApp:');
        qrcode.generate(qr, { small: true });
        isClientReady = false;
        isReconnecting = false;
    });

    client.on('disconnected', async (reason) => {
        isClientReady = false;
        console.error(`❌ Cliente desconectado. Razón: ${reason}`);
        
        // Evitar múltiples intentos de reconexión simultáneos
        if (isReconnecting) {
            console.log("⏳ Ya hay un proceso de reconexión en curso...");
            return;
        }
        
        isReconnecting = true;
        console.log("🔄 Intentando reiniciar el cliente en 3 segundos...");
        
        // Esperar 3 segundos antes de reintentar
        setTimeout(async () => {
            try {
                await destroyExistingClient();
                console.log("🚀 Reiniciando cliente de WhatsApp...");
                await initializeClient();
            } catch (error) {
                console.error("❌ Error al reiniciar cliente:", error.message);
                isReconnecting = false;
            }
        }, 3000);
    });

    client.on('auth_failure', (msg) => {
        isClientReady = false;
        console.error('❌ Fallo de autenticación:', msg);
    });

    // Intentar inicializar el cliente con manejo de errores
    try {
        console.log("🚀 Inicializando cliente de WhatsApp...");
        
        // Crear promesa ANTES de initialize
        const readyPromise = waitForReady(client);
        
        // Dar un tick para asegurar que los listeners estén registrados
        await new Promise(resolve => setImmediate(resolve));
        
        await client.initialize();
        console.log("Cliente inicializado, esperando evento ready...");
        
        // Esperar promesa DESPUÉS
        await readyPromise;
        
        console.log("✅ Cliente listo, esperando estabilización...");
        await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
        console.error("❌ Error durante la inicialización:", error.message);
        isClientReady = false;
        throw error;
    }
}

// Inicializar el cliente al cargar el módulo
await initializeClient();


// Función para verificar si el cliente está listo
function isReady() {
    return isClientReady && clientInstance && clientInstance.info;
}

// Función para obtener el cliente actual
function getClient() {
    return clientInstance;
}
    
export { getClient, isReady };
