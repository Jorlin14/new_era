/**
 * OrderMap Component — New Era Supermercado
 *
 * Vista del cliente (receptor de ubicación).
 * Muestra el mapa con la ubicación en tiempo real del domiciliario.
 *
 * Eventos escuchados:
 * - location_updated: recibe coordenadas actualizadas del domiciliario
 *
 * Eventos emitidos:
 * - join_order_room: une al cliente a la sala del pedido
 *
 * @module components/customer/OrderMap
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useSocket } from '@/hooks/useSocket';

// Importar estilos de Leaflet
import 'leaflet/dist/leaflet.css';

interface OrderMapProps {
  orderId: string;
}

interface Position {
  lat: number;
  lng: number;
}

// Icono personalizado para el marcador del domiciliario
const delivererIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Componente interno para recentrar el mapa cuando cambia la posición
function RecenterMap({ position }: { position: Position }) {
  const map = useMap();

  useEffect(() => {
    // Centrar el mapa suavemente a la nueva posición
    map.setView([position.lat, position.lng], map.getZoom(), {
      animate: true,
      duration: 0.5,
    });
  }, [map, position.lat, position.lng]);

  return null;
}

export default function OrderMap({ orderId }: OrderMapProps) {
  const { socket, isConnected } = useSocket();
  const [position, setPosition] = useState<Position | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const hasJoinedRoom = useRef(false);

  useEffect(() => {
    if (!socket || !isConnected || !orderId) return;

    // Unirse a la sala del pedido (solo una vez)
    if (!hasJoinedRoom.current) {
      // Emitir join_order_room para recibir actualizaciones de ubicación
      socket.emit('join_order_room', { orderId });
      hasJoinedRoom.current = true;
      console.log(`[OrderMap] Unido a room_${orderId}`);
    }

    // Escuchar actualizaciones de ubicación del domiciliario
    const handleLocationUpdate = (data: { lat: number; lng: number }) => {
      setPosition({ lat: data.lat, lng: data.lng });
      setLastUpdate(
        new Date().toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };

    // Escuchar evento location_updated del servidor
    socket.on('location_updated', handleLocationUpdate);

    return () => {
      // Dejar de escuchar al desmontar
      socket.off('location_updated', handleLocationUpdate);
    };
  }, [socket, isConnected, orderId]);

  // Coordenadas por defecto (centro de Colombia)
  const defaultCenter: Position = { lat: 4.711, lng: -74.0721 };

  return (
    <div className="space-y-4">
      {/* Header del mapa */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected
                ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
            }`}
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {isConnected ? 'Conectado al rastreo' : 'Conectando...'}
          </span>
        </div>
        {lastUpdate && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Última actualización: {lastUpdate}
          </span>
        )}
      </div>

      {/* Contenedor del mapa */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-lg">
        {position ? (
          <MapContainer
            center={[position.lat, position.lng]}
            zoom={16}
            className="min-h-[400px] w-full z-0"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[position.lat, position.lng]} icon={delivererIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-sm">🛵 Domiciliario</p>
                  <p className="text-xs text-gray-600">
                    {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                  </p>
                  {lastUpdate && (
                    <p className="text-xs text-gray-500 mt-1">{lastUpdate}</p>
                  )}
                </div>
              </Popup>
            </Marker>
            {/* Recentrar mapa cuando cambia la posición */}
            <RecenterMap position={position} />
          </MapContainer>
        ) : (
          // Estado de carga — esperando primera ubicación
          <div className="min-h-[400px] flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 border-t-[#1c6554] dark:border-t-green-400 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPinIcon />
              </div>
            </div>
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
              Esperando ubicación del domiciliario...
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center max-w-xs">
              El mapa se mostrará cuando el repartidor active su GPS
            </p>
          </div>
        )}
      </div>

      {/* Info de coordenadas */}
      {position && (
        <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm">
          <span className="text-slate-500 dark:text-slate-400">📍</span>
          <span className="font-mono text-slate-700 dark:text-slate-300">
            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </span>
        </div>
      )}
    </div>
  );
}
function MapPinIcon() {
  return (
    <svg className="w-6 h-6 text-[#1c6554] dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
