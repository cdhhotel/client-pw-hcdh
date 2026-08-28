import { useState, useEffect } from 'react';
import {
  Building2, MapPin, Phone, Mail, Award, ChevronRight,
  Maximize2, X, Coffee, ShieldCheck
} from 'lucide-react';
import { api } from '../../../services/api';
import { hotelService } from '../../system-admin/services/hotel.service';
import { FormattedText } from '../../../components/FormattedText';

// Assets locales
import backgroundHome from '../../../assets/background-home1.png';
import casaImg from '../../../assets/background-home.jpeg';
import salaImg from '../../../assets/estar.jpg';

// Galería de imágenes principales
import interiorImg from '../../../assets/interior.jpg';
import interior1Img from '../../../assets/interior1.jpg';
import pasillo1Img from '../../../assets/pasillo1.jpg';
import pasillo2Img from '../../../assets/pasillo2.jpg';
import pasillo3Img from '../../../assets/pasillo3.jpg';
import salacocinaImg from '../../../assets/salacocina.jpg';
import salaestarImg from '../../../assets/salaestar.jpg';
import salaterrazaImg from '../../../assets/salaterraza.jpg';
import salaterraza2Img from '../../../assets/salaterraza2.jpg';
import terraza1Img from '../../../assets/terraza1.jpg';
import terraza2Img from '../../../assets/terraza2.jpg';
import salaImg2 from '../../../assets/sala.jpg';

const DEFAULT_HOTEL_ID = "6547a35d-d6d8-4b4a-80f7-aed8c8885811";

const GALLERY_IMAGES = [
  { id: 1, url: interiorImg },
  { id: 2, url: interior1Img },
  { id: 3, url: pasillo1Img },
  { id: 4, url: pasillo2Img },
  { id: 5, url: pasillo3Img },
  { id: 6, url: salacocinaImg },
  { id: 7, url: salaestarImg },
  { id: 8, url: salaImg2 },
  { id: 9, url: salaterrazaImg },
  { id: 10, url: salaterraza2Img },
  { id: 11, url: terraza1Img },
  { id: 12, url: terraza2Img }
];

export const AboutUs = () => {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchHotelData = async () => {
      try {
        setLoading(true);
        // Primero intentamos la lista para obtener el hotel activo de forma rápida
        const listRes = await api.get('/hotel/hotels');
        const raw = listRes?.data ?? listRes;
        
        if (isMounted) {
          if (Array.isArray(raw) && raw.length > 0) {
            const found = raw.find((h) => h.id === DEFAULT_HOTEL_ID) || raw[0];
            setHotel(found);
          }
        }
      } catch (err) {
        console.warn("No se pudo cargar lista de hoteles, intentando por ID...", err);
        try {
          const res = await hotelService.getById(DEFAULT_HOTEL_ID);
          if (isMounted) setHotel(res.data ?? res);
        } catch (innerErr) {
          console.error("Error al cargar datos del hotel:", innerErr);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHotelData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Valores dinámicos del hotel o fallback enriquecido
  const hotelNombre = hotel?.nombre || "Hotel Casa Dolores Hidalgo";
  const hotelDescCorta = hotel?.descripcion_corta || "Un refugio de elegancia, confort e historia en el corazón de Dolores Hidalgo, C.I.N., Guanajuato.";
  const hotelDescLarga = hotel?.descripcion_larga || "Hotel Casa Dolores Hidalgo es una joya de la hospitalidad colonial mexicana. Ubicado estratégicamente a unos pasos del centro histórico, nuestro hotel combina el esplendor de la arquitectura tradicional con el confort moderno para brindarte una estancia inolvidable.\n\nLo que te ofrece nuestro hotel:\n- Ubicación inmejorable: A pasos del centro histórico y principales atractivos culturales.\n- Confort y elegancia: Habitaciones amplias con detalles coloniales y descanso garantizado.\n- Calidez mexicana: Trato cercano y personalizado de nuestro equipo 24/7.";
  const hotelDireccion = hotel?.direccion || "Av. San Luis Potosí 22, Centro, 37800 Dolores Hidalgo, C.I.N, Gto.";
  const hotelTelefono = hotel?.telefono || "4181775155";
  const hotelEmail = hotel?.email_contacto || "casadoloreshidalgohotel@gmail.com";
  const hotelPolitica = hotel?.politica_cancelacion || "Cancelación gratuita disponible hasta 48 horas antes de la fecha de llegada. En caso de cancelaciones tardías o no presentación, se aplicará el cargo de la primera noche.";

  return (
    <div style={{ backgroundColor: 'var(--bg-linen)', color: 'var(--text-main)', minHeight: '100vh' }}>

      {/* ── 1. HERO SECTION ── */}
      <section
        style={{
          position: 'relative',
          minHeight: '80vh',
          backgroundImage: `linear-gradient(to bottom, rgba(35, 20, 10, 0.3), rgba(35, 20, 10, 0.21)), url(${backgroundHome})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '5rem 1.5rem 4rem',
          textAlign: 'center',
          color: 'var(--white)'
        }}
      >
        <div style={{ maxWidth: '900px', width: '100%', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(216, 200, 168, 0)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(200, 185, 155, 0)',
            padding: '0.4rem 1.25rem',
            borderRadius: '50px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--gold)',
            marginBottom: '1.5rem',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>

          </div>

          {/* <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            fontWeight: 700,
            lineHeight: 1.15,
            color: '#FFFFFF',
            marginBottom: '1.25rem',
            textShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}>
            {hotelNombre}
          </h1> */}

          {/* <p style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            color: 'rgba(255, 255, 255, 0.92)',
            maxWidth: '780px',
            margin: '0 auto 2.25rem',
            lineHeight: 1.6,
            fontWeight: 400
          }}>
            {hotelDescCorta}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/booking" className="btn btn-primary" style={{ padding: '0.9rem 2.2rem', fontSize: '1rem', fontWeight: 600, boxShadow: 'var(--shadow-md)' }}>
              Reservar Habitación <ArrowRight size={18} />
            </Link>
            <a href="#historia" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.7)', color: '#FFFFFF', padding: '0.9rem 2rem', fontSize: '1rem', fontWeight: 500 }}>
              Conocer Nuestra Historia
            </a>
          </div> */}
        </div>
      </section>

      {/* ── 2. SECCIÓN HISTORIA & ESENCIA (ESTRUCTURA EN 2 PARTES EQUILIBRADAS) ── */}
      <section id="historia" style={{ padding: '5rem 1.5rem', maxWidth: '1240px', margin: '0 auto' }}>

        {/* PARTE A: Presentación Lado a Lado (Texto Introductorio + Collage de Fotos) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center', marginBottom: '4rem' }}>

          {/* Columna Texto Introductorio */}
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>
              Nuestra Historia & Tradición
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', color: '#6C220E', marginBottom: '1.5rem', lineHeight: 1.25 }}>
              Una Estancia Llena de Magia y Confort Colonial
            </h2>

            <div style={{
              backgroundColor: 'rgba(216, 200, 168, 0.3)',
              borderLeft: '4px solid var(--primary)',
              padding: '1.25rem 1.5rem',
              borderRadius: '0 8px 8px 0',
              marginBottom: '1.5rem',
              fontSize: '1.02rem',
              fontStyle: 'italic',
              color: '#3A2416',
              lineHeight: 1.6,
              textAlign: 'justify'
            }}>
              "{hotelDescCorta}"
            </div>

            <p style={{ fontSize: '1.02rem', lineHeight: 1.8, color: 'var(--text-main)', margin: 0, fontWeight: 400, textAlign: 'justify' }}>
              Ubicado estratégicamente a unos pasos del centro histórico de Dolores Hidalgo, Guanajuato, Hotel Casa Dolores combina el esplendor de la arquitectura colonial mexicana con el confort moderno para brindarte una estancia inolvidable. Cada rincón refleja la calidez, la historia y la pasión por ofrecer un servicio de clase mundial a nuestros huéspedes.
            </p>
          </div>

          {/* Columna Imagen Collage Equilibrado */}
          <div style={{ position: 'relative', minHeight: '380px' }}>
            {/* Foto Principal */}
            <div style={{
              width: '82%',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(107, 74, 47, 0.25)',
              border: '4px solid var(--white)'
            }}>
              <img
                src={casaImg}
                alt="Instalaciones Hotel Casa Dolores"
                loading="eager"
                decoding="async"
                style={{ width: '100%', height: '310px', objectFit: 'cover', display: 'block' }}
              />
            </div>

            {/* Foto Superpuesta Secundaria */}
            <div style={{
              position: 'absolute',
              top: '32%',
              right: '0',
              width: '55%',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
              border: '4px solid var(--white)'
            }}>
              <img
                src={salaImg}
                alt="Interiores de descanso"
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '210px', objectFit: 'cover', display: 'block' }}
              />
            </div>

            {/* Tarjeta Flotante Destacada */}
            <div className="glass-panel" style={{
              position: 'absolute',
              bottom: '-20px',
              left: '10px',
              backgroundColor: 'var(--white)',
              padding: '0.9rem 1.3rem',
              borderRadius: '10px',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              zIndex: 3
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'rgba(160, 68, 42, 0.12)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Award size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2C1A0E', lineHeight: 1 }}>4.77 / 5.0</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
                  Calificación de huéspedes
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* PARTE B: Bloque Inferior con la Información Detallada y Tarjetas de Servicios */}
        <div style={{
          backgroundColor: 'rgba(216, 200, 168, 0.25)',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          border: '1px solid var(--border)'
        }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#6C220E', marginBottom: '1.25rem', fontWeight: 700, textAlign: 'center' }}>
            Detalles y Servicios de Nuestra Propiedad
          </h3>
          <FormattedText text={hotelDescLarga} />
        </div>

      </section>

      {/* ── 3. GALERÍA DE IMÁGENES (SÓLO FOTOS PURAS CON LIGHTBOX) ── */}
      <section style={{ backgroundColor: 'rgba(216, 200, 168, 0.25)', padding: '5rem 1.5rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--primary)' }}>
              Galería Fotográfica
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', color: '#6C220E', marginTop: '0.35rem', marginBottom: '0.75rem' }}>
              Conoce Nuestros Espacios e Instalaciones
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6 }}>
              Haz clic en cualquier imagen para ampliarla a pantalla completa.
            </p>
          </div>

          {/* Grid de Fotos Puras */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {GALLERY_IMAGES.map((img) => (
              <div
                key={img.id}
                onClick={() => setSelectedImage(img)}
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-md)',
                  cursor: 'pointer',
                  position: 'relative',
                  height: '260px',
                  border: '3px solid var(--white)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.03)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
              >
                <img
                  src={img.url}
                  alt="Instalaciones Hotel Casa Dolores"
                  loading="lazy"
                  decoding="async"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                >
                  <div style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    color: '#2C1A0E',
                    padding: '0.75rem',
                    borderRadius: '50%',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}>
                    <Maximize2 size={22} />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 4. PILARES & VALORES DE NUESTRA HOSPITALIDAD ── */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--primary)' }}>
            Nuestra Esencia
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', color: '#6C220E', marginTop: '0.35rem' }}>
            ¿Por qué elegir Hotel Casa Dolores?
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
          {[
            {
              icon: Building2,
              title: "Patrimonio Colonial",
              desc: "Arquitectura cuidada minuciosamente que conserva los arcos, madera tallada y azulejos tradicionales de la zona."
            },
            {
              icon: Coffee,
              title: "Calidez Mexicana",
              desc: "Servicio cercano, amable y personalizado para garantizar que te sientas cómodo como en tu propio hogar."
            },
            {
              icon: ShieldCheck,
              title: "Confort & Tranquilidad",
              desc: "Habitaciones amplias, limpias y equipadas para el descanso absoluto después de un día de turismo cultural."
            },
            {
              icon: MapPin,
              title: "Ubicación Privilegiada",
              desc: "Ubicado sobre la Av. San Luis Potosí, a pasos de la parroquia de Nuestra Señora de los Dolores y museos emblemáticos."
            }
          ].map((feature, idx) => (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: '2rem 1.5rem',
                borderRadius: 'var(--border-radius-md)',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(160, 68, 42, 0.1)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}>
                <feature.icon size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', color: '#6C220E', marginBottom: '0.6rem', fontWeight: 700 }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. INFORMACIÓN DE CONTACTO & UBICACIÓN ── */}
      <section style={{ backgroundColor: 'var(--secondary-hover)', color: 'var(--white)', padding: '5rem 1.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--gold)' }}>
              Información de Contacto & Ubicación
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', color: '#FFFFFF', marginTop: '0.35rem' }}>
              Estamos Listos para Recibirte
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>

            {/* Dirección */}
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', padding: '2rem', borderRadius: 'var(--border-radius-md)', border: '1px solid rgba(200, 185, 155, 0.2)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(179, 138, 58, 0.2)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <MapPin size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>Dirección</h3>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                {hotelDireccion}
              </p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(hotelDireccion)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
              >
                Abrir en Google Maps <ChevronRight size={14} />
              </a>
            </div>

            {/* Teléfono */}
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', padding: '2rem', borderRadius: 'var(--border-radius-md)', border: '1px solid rgba(200, 185, 155, 0.2)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(179, 138, 58, 0.2)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Phone size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>Teléfono Directo</h3>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                {hotelTelefono}
              </p>
              {/* <a
                href={`tel:${hotelTelefono}`}
                style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
              >
                Llamar Ahora <ChevronRight size={14} />
              </a> */}
            </div>

            {/* Correo Electrónico */}
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', padding: '2rem', borderRadius: 'var(--border-radius-md)', border: '1px solid rgba(200, 185, 155, 0.2)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(179, 138, 58, 0.2)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Mail size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>Correo de Contacto</h3>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6, marginBottom: '1.25rem', wordBreak: 'break-all' }}>
                {hotelEmail}
              </p>
              <a
                href={`mailto:${hotelEmail}`}
                style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
              >
                Enviar Correo <ChevronRight size={14} />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ── LIGHTBOX MODAL PARA VER FOTO COMPLETA ── */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              backgroundColor: 'var(--white)',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
            }}
          >
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: '#FFF',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              <X size={22} />
            </button>
            <img
              src={selectedImage.url}
              alt="Galería Hotel Casa Dolores"
              style={{ width: '100%', maxHeight: '85vh', objectFit: 'contain', display: 'block', backgroundColor: '#000' }}
            />
          </div>
        </div>
      )}

    </div>
  );
};
