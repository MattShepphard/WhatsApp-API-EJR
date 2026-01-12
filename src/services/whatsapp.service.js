import PQueue from 'p-queue';

// Cola con concurrencia de 1 para procesar peticiones una a la vez
const queue = new PQueue({ concurrency: 1 });

export async function checkWhatsappApi(client, phoneNumber) {
    return queue.add(async () => {
        try {
            console.log(`📋 Cola: ${queue.size} en espera, ${queue.pending} procesándose`);
            const isRegistered = await client.isRegisteredUser(phoneNumber);

            return {
                phoneNumber: phoneNumber,
                isRegistered: isRegistered
            };

        } catch (error) {
            console.error('Error al verificar el número:', error);
            throw error;
        }
    });
}