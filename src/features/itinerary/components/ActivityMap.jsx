// import React, { useEffect, useRef } from 'react';
// import L from 'leaflet';
// import { getCategoryBySubcategory } from '../constants/categories';

// // Estandarización de colores usando la paleta oficial de Casa Dolores Hidalgo
// const CATEGORY_COLORS = {
//   COMIDA: '#A0442A',      // var(--primary) - terracota
//   ATRACCIONES: '#6B4A2F',  // var(--secondary) - café nogal
//   EVENTOS: '#B38A3A',      // var(--gold) - oro artesanal
//   SALUD: '#A0442A',        // var(--primary) - urgencias/hospitales en terracota
//   TOURS: '#7A8061',        // var(--accent) - verde olivo
//   OTRAS: '#6B4A2F'
// };

// export const ActivityMap = ({ activities, selectedActivityId, onSelectActivity }) => {
//   const mapContainerRef = useRef(null);
//   const mapRef = useRef(null);
//   const markersRef = useRef({});

//   // 1. Inicializar mapa (solo una vez)
//   useEffect(() => {
//     if (!mapContainerRef.current) return;

//     // Crear el mapa centrado en Dolores Hidalgo por defecto
//     const map = L.map(mapContainerRef.current, {
//       zoomControl: false,
//       attributionControl: false
//     }).setView([21.156111, -100.934444], 15);

//     // Agregar control de zoom en la parte superior derecha
//     L.control.zoom({ position: 'topright' }).addTo(map);

//     // Usar la capa de mapas CartoDB Voyager (diseño limpio y claro, de estilo Google/Apple Maps)
//     L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
//       maxZoom: 20,
//       subdomains: 'abcd'
//     }).addTo(map);

//     mapRef.current = map;

//     return () => {
//       if (mapRef.current) {
//         mapRef.current.remove();
//         mapRef.current = null;
//       }
//     };
//   }, []);

//   // Helper para generar los iconos interactivos personalizados (estilo pin de gota de agua)
//   const createCustomIcon = (category, isActive) => {
//     const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.OTRAS;
//     const size = isActive ? 34 : 24;
//     const innerSize = isActive ? 12 : 8;
//     const border = isActive ? '3px solid #ffffff' : '2px solid #ffffff';
//     const shadow = isActive 
//       ? 'drop-shadow(0px 8px 12px rgba(107,74,47,0.45))' 
//       : 'drop-shadow(0px 4px 6px rgba(107,74,47,0.25))';

//     return L.divIcon({
//       html: `
//         <div style="
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           width: ${size}px;
//           height: ${size}px;
//           background-color: ${color};
//           border-radius: 50% 50% 50% 0;
//           transform: rotate(-45deg);
//           border: ${border};
//           filter: ${shadow};
//           transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
//         ">
//           <div style="
//             width: ${innerSize}px;
//             height: ${innerSize}px;
//             background-color: #ffffff;
//             border-radius: 50%;
//             transform: rotate(45deg);
//           "></div>
//         </div>
//       `,
//       className: 'custom-leaflet-marker-wrapper',
//       iconSize: [size, size],
//       iconAnchor: [size / 2, size]
//     });
//   };

//   // 2. Gestionar marcadores y selección cuando cambian las actividades o la selección activa
//   useEffect(() => {
//     const map = mapRef.current;
//     if (!map) return;

//     // Eliminar marcadores previos
//     Object.values(markersRef.current).forEach(marker => {
//       marker.remove();
//     });
//     markersRef.current = {};

//     const processedCoords = [];
//     const validActivities = activities.filter(a => a.latitud && a.longitud);

//     validActivities.forEach(activity => {
//       let lat = parseFloat(activity.latitud);
//       let lng = parseFloat(activity.longitud);

//       // Algoritmo de dispersión en espiral para evitar superposición total de marcadores con mismas coordenadas
//       const duplicateMatches = processedCoords.filter(
//         c => Math.abs(c.lat - lat) < 0.00002 && Math.abs(c.lng - lng) < 0.00002
//       );

//       if (duplicateMatches.length > 0) {
//         const angle = duplicateMatches.length * 0.72;
//         const radius = 0.00025 * (1 + duplicateMatches.length * 0.12);
//         lat += radius * Math.cos(angle);
//         lng += radius * Math.sin(angle);
//       }

//       processedCoords.push({ lat, lng, id: activity.id });

//       const category = getCategoryBySubcategory(activity.categoria);
//       const isActive = activity.id === selectedActivityId;
//       const icon = createCustomIcon(category, isActive);

//       const marker = L.marker([lat, lng], { icon }).addTo(map);

//       markersRef.current[activity.id] = marker;

//       // Evento clic en el marcador
//       marker.on('click', () => {
//         if (onSelectActivity) {
//           onSelectActivity(activity);
//         }
//       });

//       if (isActive) {
//         marker.setZIndexOffset(1000);
//       }
//     });

//     // Ajustar vista del mapa
//     if (selectedActivityId && markersRef.current[selectedActivityId]) {
//       const activeMarker = markersRef.current[selectedActivityId];
//       const position = activeMarker.getLatLng();
//       map.setView(position, 16, { animate: true, duration: 0.8 });
//     } else if (validActivities.length > 0) {
//       const bounds = L.latLngBounds(processedCoords.map(c => [c.lat, c.lng]));
//       map.fitBounds(bounds, {
//         padding: [40, 40],
//         maxZoom: 16,
//         animate: true,
//         duration: 0.6
//       });
//     }
//   }, [activities, selectedActivityId]);

//   return (
//     <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
//       {/* Contenedor del mapa Leaflet - usa el fondo de carga crema de la marca */}
//       <div 
//         ref={mapContainerRef} 
//         style={{ width: '100%', height: '100%', background: 'var(--bg-linen)' }} 
//       />

//       <style>{`
//         .custom-leaflet-marker-wrapper {
//           background: none !important;
//           border: none !important;
//         }
//         .leaflet-grab {
//           cursor: grab;
//         }
//         .leaflet-dragging .leaflet-grab {
//           cursor: grabbing;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ActivityMap;



import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCategoryBySubcategory } from '../constants/categories';

const CATEGORY_COLORS = {
  COMIDA: '#192a5fff',
  ATRACCIONES: '#811010ff',
  EVENTOS: '#a7730cff',
  SALUD: '#0fa8bdff',
  TOURS: '#791b91ff',
  OTRAS: '#da6200ff'
};

// 1. Nuevas coordenadas fijas asignadas
const FIXED_LOCATION = {
  lat: 21.159868465766444,
  lng: -100.93400182606564,
  nombre: 'Hotel Casa Dolores Hidalgo'
};

export const ActivityMap = ({ activities, selectedActivityId, onSelectActivity }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([FIXED_LOCATION.lat, FIXED_LOCATION.lng], 15);

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      subdomains: 'abcd'
    }).addTo(map);

    mapRef.current = map;

    // ResizeObserver para recalcular tamaño de Leaflet dinámicamente al alternar de 'list' a 'map'
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        if (map) {
          map.invalidateSize();
        }
      });
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Icono para actividades dinámicas
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
          display: flex; align-items: center; justify-content: center;
          width: ${size}px; height: ${size}px;
          background-color: ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: ${border}; filter: ${shadow};
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        ">
          <div style="
            width: ${innerSize}px; height: ${innerSize}px;
            background-color: #ffffff; border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      className: 'custom-leaflet-marker-wrapper',
      iconSize: [size, size],
      iconAnchor: [size / 2, size]
    });
  };

  // 2. Nuevo icono usando la imagen de tu carpeta public
  const createFixedIcon = () => {
    return L.icon({
      iconUrl: '/images/fachada.png',
      // Puedes ajustar el tamaño [ancho, alto] según se vea tu archivo .ico
      iconSize: [40, 40],
      // El "ancla" del icono: la mitad del ancho, y el total del alto para que apunte exactamente al sitio
      iconAnchor: [20, 40],
      // Donde se abrirá el popup (globo de texto) en relación al icono (arriba al centro)
      popupAnchor: [0, -40]
    });
  };

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // --- AGREGAR MARCADOR FIJO ---
    const fixedMarker = L.marker([FIXED_LOCATION.lat, FIXED_LOCATION.lng], {
      icon: createFixedIcon(),
      zIndexOffset: 2000
    }).addTo(map);

    if (!isMobile) {
      fixedMarker.bindPopup(`
        <div style="text-align: center; font-family: sans-serif;">
          <strong style="color: #1A1A1A; font-size: 14px;">${FIXED_LOCATION.nombre}</strong>
          <br/><span style="color: #666; font-size: 12px;">Ubicación actual</span>
        </div>
      `);
    }

    markersRef.current['fixed-location'] = fixedMarker;
    // -----------------------------

    const processedCoords = [];
    const validActivities = activities.filter(a => a.latitud && a.longitud);

    validActivities.forEach(activity => {
      let lat = parseFloat(activity.latitud);
      let lng = parseFloat(activity.longitud);

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

      if (!isMobile) {
        marker.bindPopup(`
          <div style="text-align: center; font-family: sans-serif;">
            <strong style="color: ${CATEGORY_COLORS[category] || '#000'}; font-size: 14px;">
              ${activity.nombre || 'Sitio'}
            </strong>
          </div>
        `);
      }

      markersRef.current[activity.id] = marker;

      marker.on('click', () => {
        if (onSelectActivity) {
          onSelectActivity(activity);
        }
      });

      if (isActive) {
        marker.setZIndexOffset(1000);
        if (!isMobile) {
          marker.openPopup();
        }
      }
    });

    if (selectedActivityId && markersRef.current[selectedActivityId]) {
      const activeMarker = markersRef.current[selectedActivityId];
      const position = activeMarker.getLatLng();
      map.setView(position, 16, { animate: true, duration: 0.8 });
    } else if (validActivities.length > 0) {
      const allCoords = [...processedCoords, { lat: FIXED_LOCATION.lat, lng: FIXED_LOCATION.lng }];
      const bounds = L.latLngBounds(allCoords.map(c => [c.lat, c.lng]));
      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 16,
        animate: true,
        duration: 0.6
      });
    }
  }, [activities, selectedActivityId, isMobile]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%', background: 'var(--bg-linen)' }}
      />
      <style>{`
        .custom-leaflet-marker-wrapper {
          background: none !important;
          border: none !important;
        }
        .leaflet-grab { cursor: grab; }
        .leaflet-dragging .leaflet-grab { cursor: grabbing; }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        }
        .leaflet-popup-content {
          margin: 12px 16px;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};

export default ActivityMap;