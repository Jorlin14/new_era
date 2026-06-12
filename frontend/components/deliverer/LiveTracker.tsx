/**
 * LiveTracker Component — New Era Supermercado
 *
 * Vista del domiciliario (emisor GPS).
 * Transmite la ubicación GPS en tiempo real a través de socket.io.
 *
 * Eventos emitidos:
 * - join_order_room: une al domiciliario a la sala del pedido
 * - update_location: envía coordenadas GPS actualizadas
 *
 * @module components/deliverer/LiveTracker
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import Toast from '@/components/Toast';

interface LiveTrackerProps {
  orderId: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

export default function LiveTracker({ orderId }: LiveTrackerProps) {
  const { socket, isConnected } = useSocket();
  const [isTracking, setIsTracking] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const hasJoinedRoom = useRef(false);

  // Unirse a la sala del pedido al conectarse
  useEffect(() => {
    if (socket && isConnected && orderId && !hasJoinedRoom.current) {
      // Emitir join_order_room para unirse a la sala del pedido
      socket.emit('join_order_room', { orderId });
      hasJoinedRoom.current = true;
      console.log(`[LiveTracker] Unido a room_${orderId}`);
    }
  }, [socket, isConnected, orderId]);

  // Callback para éxito del GPS
  const handlePositionSuccess = useCallback(
    (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const newCoords = { lat: latitude, lng: longitude };
      setCoordinates(newCoords);
      setError(null);

      if (socket && isConnected) {
        // Emitir update_location con las coordenadas actuales
        socket.emit('update_location', {
          orderId,
          lat: latitude,
          lng: longitude,
        });
      }
    },
    [socket, isConnected, orderId]
  );

  // Callback para errores del GPS
  const handlePositionError = useCallback((err: GeolocationPositionError) => {
    let errorMessage = 'Error desconocido al obtener ubicación.';

    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = 'Permiso de ubicación denegado. Activa el GPS en la configuración de tu navegador.';
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = 'La información de ubicación no está disponible.';
        break;
      case err.TIMEOUT:
        errorMessage = 'La solicitud de ubicación ha expirado.';
        break;
    }

    setError(errorMessage);
    setToast({ message: errorMessage, type: 'error' });
    setIsTracking(false);
  }, []);

  // Iniciar rastreo GPS
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización.');
      setToast({ message: 'Tu navegador no soporta geolocalización.', type: 'error' });
      return;
    }

    try {
      // Iniciar watchPosition para rastrear cambios de ubicación
      const watchId = navigator.geolocation.watchPosition(
        handlePositionSuccess,
        handlePositionError,
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );

      watchIdRef.current = watchId;
      setIsTracking(true);
      setError(null);
      setToast({ message: 'Rastreo GPS iniciado correctamente', type: 'success' });
    } catch (err) {
      setError('Error al iniciar el rastreo GPS.');
      setToast({ message: 'Error al iniciar el rastreo GPS.', type: 'error' });
    }
  }, [handlePositionSuccess, handlePositionError]);

  // Detener rastreo GPS
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setToast({ message: 'Rastreo GPS detenido', type: 'info' });
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Toast de notificaciones */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}

      {/* Card principal */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-[#1c6554] to-[#0C447C] dark:from-green-600 dark:to-blue-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Rastreo GPS en Vivo</h2>
              <p className="text-white/80 text-sm mt-1">
                Orden #{orderId.substring(0, 8).toUpperCase()}
              </p>
            </div>
            {/* Indicador de conexión socket */}
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected
                    ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]'
                    : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]'
                }`}
              />
              <span className="text-white/90 text-sm font-medium">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="p-6 space-y-6">
          {/* Estado de transmisión */}
          <div
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
              isTracking
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
          >
            {isTracking ? (
              <>
                {/* Indicador de pulso animado */}
                <div className="relative flex-shrink-0">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse-live" />
                  <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75" />
                </div>
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-300 text-lg">
                    Transmitiendo ubicación en vivo 🟢
                  </p>
                  <p className="text-green-600 dark:text-green-400 text-sm">
                    Tu ubicación se actualiza en tiempo real para el cliente
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-4 h-4 bg-slate-400 rounded-full flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 text-lg">
                    Rastreo detenido ⚪
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Presiona el botón para iniciar la transmisión
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Coordenadas actuales */}
          {coordinates && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wide">
                Coordenadas Actuales
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Latitud</p>
                  <p className="font-mono text-lg font-bold text-slate-900 dark:text-white">
                    {coordinates.lat.toFixed(6)}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Longitud</p>
                  <p className="font-mono text-lg font-bold text-slate-900 dark:text-white">
                    {coordinates.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error de GPS */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
              <ErrorIcon />
              <div>
                <p className="font-semibold text-red-800 dark:text-red-300">Error de GPS</p>
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Botones de control */}
          <div className="flex gap-3">
            {!isTracking ? (
              <button
                onClick={startTracking}
                disabled={!isConnected}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#1c6554] to-[#0C447C] dark:from-green-600 dark:to-blue-600 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <LocationIcon />
                Iniciar Rastreo GPS
              </button>
            ) : (
              <button
                onClick={stopTracking}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <StopIcon />
                Detener Transmisión
              </button>
            )}
          </div>

          {/* Aviso si no está conectado */}
          {!isConnected && (
            <p className="text-center text-sm text-amber-600 dark:text-amber-400">
              ⚠️ Esperando conexión con el servidor...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
function LocationIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  );
}
