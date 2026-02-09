'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Club } from '@/lib/seed-data';
import { useState } from 'react';

// Custom coral marker icon matching brand colours
const clubIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 30px;
    height: 30px;
    background: #FF6B5B;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(255,107,91,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  "><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

// Notable club marker (slightly different style)
const notableIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 34px;
    height: 34px;
    background: linear-gradient(135deg, #FF6B5B, #E55A4A);
    border: 3px solid #FFF5F3;
    border-radius: 50%;
    box-shadow: 0 2px 12px rgba(255,107,91,0.5), 0 0 0 2px #FFAB9F;
    display: flex;
    align-items: center;
    justify-content: center;
  "><svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

const paceLabels: Record<string, string> = {
  slow: 'Relaxed',
  mixed: 'Mixed',
  fast: 'Fast',
};

const paceColors: Record<string, string> = {
  slow: '#0d9488',
  mixed: '#ea580c',
  fast: '#e11d48',
};

interface MapViewProps {
  clubs: Club[];
  onSelectClub: (club: Club) => void;
  attendanceCounts: Record<string, number>;
}

export default function MapView({ clubs, onSelectClub, attendanceCounts }: MapViewProps) {
  // Centre on UK
  const ukCenter: [number, number] = [54.0, -2.5];
  const defaultZoom = 6;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          <span className="text-gray-900 font-bold">{clubs.length}</span> club{clubs.length !== 1 ? 's' : ''} on map
        </p>
        <p className="text-xs text-gray-400">Click a marker to view club details</p>
      </div>
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '65vh' }}>
        <MapContainer
          center={ukCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {clubs.map((club) => (
            <Marker
              key={club.name}
              position={[club.lat, club.lng]}
              icon={club.influencer_led ? notableIcon : clubIcon}
            >
              <Popup>
                <div style={{ minWidth: '220px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '15px', color: '#1f2937' }}>{club.name}</strong>
                    {club.verified && (
                      <span style={{
                        background: '#d1fae5',
                        color: '#059669',
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '99px',
                        fontWeight: '600'
                      }}>Verified</span>
                    )}
                    {club.influencer_led && (
                      <span style={{
                        background: '#FF6B5B',
                        color: 'white',
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '99px',
                        fontWeight: '600'
                      }}>Notable</span>
                    )}
                  </div>

                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '3px 0' }}>
                    {club.area}, {club.city}
                  </p>

                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    margin: '8px 0',
                    fontSize: '12px',
                    color: '#374151'
                  }}>
                    <span>{club.day}s</span>
                    <span style={{ color: '#d1d5db' }}>|</span>
                    <span>{club.time}</span>
                    <span style={{ color: '#d1d5db' }}>|</span>
                    <span>{club.distance}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '99px',
                      background: club.pace === 'slow' ? '#ccfbf1' : club.pace === 'fast' ? '#ffe4e6' : '#ffedd5',
                      color: paceColors[club.pace],
                      fontWeight: '500'
                    }}>{paceLabels[club.pace]}</span>
                    {club.beginner_friendly && (
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '99px',
                        background: '#FFF5F3',
                        color: '#FF6B5B',
                        fontWeight: '500'
                      }}>Beginner OK</span>
                    )}
                  </div>

                  {attendanceCounts[club.name] > 0 && (
                    <p style={{ fontSize: '11px', color: '#16a34a', margin: '4px 0', fontWeight: '500' }}>
                      {attendanceCounts[club.name]} going this week
                    </p>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClub(club);
                    }}
                    style={{
                      marginTop: '8px',
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#FF6B5B',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    View details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
