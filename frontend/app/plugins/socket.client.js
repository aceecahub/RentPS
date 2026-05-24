import { io } from 'socket.io-client';

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    
    // Connect DIRECTLY to backend, bypassing Nitro proxy
    // Nitro proxy does not fully support WebSocket upgrade needed by Socket.io
    const socketUrl = config.public.socketBase || 'http://localhost:5000'
    
    console.log('[Socket] Menghubungkan ke:', socketUrl)

    const socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
        console.log('[Socket] BERHASIL terhubung, socket ID:', socket.id);
    });

    socket.on('connect_error', (error) => {
        console.error('[Socket] GAGAL terhubung:', error.message);
    });

    socket.on('disconnect', (reason) => {
        console.warn('[Socket] Terputus:', reason);
    });

    return {
        provide: {
            socket: socket
        }
    };
});
