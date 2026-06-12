/**
 * useSocket Hook — New Era Supermercado
 *
 * Hook personalizado para gestionar la conexión WebSocket con socket.io.
 * Inicializa la conexión al montar y la limpia al desmontar.
 *
 * @module hooks/useSocket
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// URL del servidor socket.io (backend en puerto 4000)
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';

/**
 * Hook que gestiona la conexión socket.io con el backend.
 *
 * @returns {{ socket: Socket | null, isConnected: boolean }}
 *
 * @example
 * const { socket, isConnected } = useSocket();
 * socket?.emit('join_order_room', { orderId });
 */
export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Inicializar conexión socket.io
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current = socket;

    // Escuchar evento de conexión establecida
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('[Socket] Conectado:', socket.id);
    });

    // Escuchar evento de desconexión
    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('[Socket] Desconectado:', reason);
    });

    // Escuchar errores de conexión
    socket.on('connect_error', (error) => {
      console.error('[Socket] Error de conexión:', error.message);
    });

    // Cleanup: desconectar al desmontar el componente
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
  };
}
