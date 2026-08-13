'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix the default marker icon paths (Next bundler breaks default URLs)
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Dynamic imports for Leaflet components (they need window)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
// useMapEvents must be called unconditionally in a child component
const MapEvents = dynamic(
  () => import('react-leaflet').then((mod) => {
    // Return a component that calls the hook
    return function MapEventsComponent({ onClick }: { onClick: (lat: number, lng: number) => void }) {
      const useMapEvents = mod.useMapEvents;
      useMapEvents({
        click(e) {
          onClick(e.latlng.lat, e.latlng.lng);
        },
      });
      return null;
    };
  }),
  { ssr: false }
);

interface ReportMapProps {
  value: { lat: number; lng: number } | null;
  /** Required when interactive (e.g., create form). Omit in read-only contexts (e.g., detail page) — passing a function from a Server Component is invalid. */
  onChange?: (loc: { lat: number; lng: number } | null) => void;
  readOnly?: boolean;
}

export default function ReportMap({
  value,
  onChange,
  readOnly = false,
}: ReportMapProps) {
  const center: [number, number] = useMemo(
    () => (value ? [value.lat, value.lng] : [4.5709, -74.2973]),
    [value]
  );

  return (
    <div>
      {!readOnly && (
        <label className="block text-sm font-medium mb-1">
          Ubicación última conocida
        </label>
      )}
      <div
        className="h-72 md:h-96 rounded-lg overflow-hidden border border-gray-300"
        aria-label="Mapa de ubicación"
      >
        <MapContainer
          center={center}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          dragging={!readOnly}
          scrollWheelZoom={!readOnly}
          doubleClickZoom={!readOnly}
          touchZoom={!readOnly}
          keyboard={!readOnly}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {!readOnly && onChange && <MapEvents onClick={(lat, lng) => onChange({ lat, lng })} />}
          {value && (
            <Marker
              position={[value.lat, value.lng]}
              draggable={!readOnly && !!onChange}
              eventHandlers={
                !readOnly && onChange
                  ? {
                      dragend: (e) => {
                        const m = e.target;
                        const p = m.getLatLng();
                        onChange({ lat: p.lat, lng: p.lng });
                      },
                    }
                  : undefined
              }
            />
          )}
        </MapContainer>
      </div>
      {value && !readOnly && onChange && (
        <p className="mt-1 text-xs text-gray-500">
          Lat: {value.lat.toFixed(6)}, Lng: {value.lng.toFixed(6)}{' '}
          <button
            type="button"
            onClick={() => onChange(null)}
            className="ml-2 text-blue-600 underline"
          >
            (borrar pin)
          </button>
        </p>
      )}
    </div>
  );
}
