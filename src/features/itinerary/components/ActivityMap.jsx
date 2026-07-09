import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { getCategoryBySubcategory } from '../constants/categories';

// Estandarización de colores usando la paleta oficial de Casa Dolores Hidalgo
const CATEGORY_COLORS = {
  COMIDA: '#A0442A',      // var(--primary) - terracota
  ATRACCIONES: '#6B4A2F',  // var(--secondary) - café nogal
  EVENTOS: '#B38A3A',      // var(--gold) - oro artesanal
  SALUD: '#A0442A',        // var(--primary) - urgencias/hospitales en terracota
  TOURS: '#7A8061',        // var(--accent) - verde olivo
  OTRAS: '#6B4A2F'
};

export const ActivityMap = ({ activities, selectedActivityId, onSelectActivity }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});

  // 1. Inicializar mapa (solo una vez)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Crear el mapa centrado en Dolores Hidalgo por defecto
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([21.156111, -100.934444], 15);

    // Agregar control de zoom en la parte superior derecha
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Usar la capa de mapas CartoDB Voyager (diseño limpio y claro, de estilo Google/Apple Maps)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      subdomains: 'abcd'
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Helper para generar los iconos interactivos personalizados (estilo pin de gota de agua)
  const createCustomIcon = (category, isActive) => {
    const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.OTRAS;
    const size = isActive ? 34 : 24;
    const innerSize = isActive ? 12 : 8;
    const border = isActive ? '3px solid #ffffff' : '2px solid #ffffff';
    const shadow = isActive 
      ? 'drop-shadow(0px 8px 12px rgba(107,74,47,0.45))' 
      : 'drop-shadow(0px 4px 6px rgba(107,74,47,0.25))';

    return L.divIcon({
      html: `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: ${border};
          filter: ${shadow};
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        ">
          <div style="
            width: ${innerSize}px;
            height: ${innerSize}px;
            background-color: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      className: 'custom-leaflet-marker-wrapper',
      iconSize: [size, size],
      iconAnchor: [size / 2, size]
    });
  };

  // 2. Gestionar marcadores y selección cuando cambian las actividades o la selección activa
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Eliminar marcadores previos
    Object.values(markersRef.current).forEach(marker => {
      marker.remove();
    });
    markersRef.current = {};

    const processedCoords = [];
    const validActivities = activities.filter(a => a.latitud && a.longitud);

    validActivities.forEach(activity => {
      let lat = parseFloat(activity.latitud);
      let lng = parseFloat(activity.longitud);

      // Algoritmo de dispersión en espiral para evitar superposición total de marcadores con mismas coordenadas
      const duplicateMatches = processedCoords.filter(
        c => Math.abs(c.lat - lat) < 0.00002 && Math.abs(c.lng - lng) < 0.00002
      );

      if (duplicateMatches.length > 0) {
        const angle = duplicateMatches.length * 0.72;
        const radius = 0.00025 * (1 + duplicateMatches.length * 0.12);
        lat += radius * Math.cos(angle);
        lng += radius * Math.sin(angle);
      }

      processedCoords.push({ lat, lng, id: activity.id });

      const category = getCategoryBySubcategory(activity.categoria);
      const isActive = activity.id === selectedActivityId;
      const icon = createCustomIcon(category, isActive);

      const marker = L.marker([lat, lng], { icon }).addTo(map);

      markersRef.current[activity.id] = marker;

      // Evento clic en el marcador
      marker.on('click', () => {
        if (onSelectActivity) {
          onSelectActivity(activity);
        }
      });

      if (isActive) {
        marker.setZIndexOffset(1000);
      }
    });

    // Ajustar vista del mapa
    if (selectedActivityId && markersRef.current[selectedActivityId]) {
      const activeMarker = markersRef.current[selectedActivityId];
      const position = activeMarker.getLatLng();
      map.setView(position, 16, { animate: true, duration: 0.8 });
    } else if (validActivities.length > 0) {
      const bounds = L.latLngBounds(processedCoords.map(c => [c.lat, c.lng]));
      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 16,
        animate: true,
        duration: 0.6
      });
    }
  }, [activities, selectedActivityId]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Contenedor del mapa Leaflet - usa el fondo de carga crema de la marca */}
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100%', background: 'var(--bg-linen)' }} 
      />

      <style>{`
        .custom-leaflet-marker-wrapper {
          background: none !important;
          border: none !important;
        }
        .leaflet-grab {
          cursor: grab;
        }
        .leaflet-dragging .leaflet-grab {
          cursor: grabbing;
        }
      `}</style>
    </div>
  );
};

export default ActivityMap;
