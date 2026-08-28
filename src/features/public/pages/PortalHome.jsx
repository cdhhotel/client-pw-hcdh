import React from 'react';
import { useNavigate } from 'react-router-dom';
import backCasaAzul from '../../../assets/back-casaazul.png';
import bgSecondary from '../../../assets/bg-secondary.png';
import hcdhLogo from '../../../assets/hcdh.jpeg';
import casaAzulLogo from '../../../assets/logo.svg';

export const PortalHome = ({
  casaDoloresUrl = '/casa-dolores',
  casaAzulUrl = 'https://hotelazuldolores.com/',
}) => {
  const navigate = useNavigate();

  const handleDoloresClick = () => {
    window.open(casaDoloresUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAzulClick = () => {
    if (casaAzulUrl.startsWith('http://') || casaAzulUrl.startsWith('https://')) {
      window.open(casaAzulUrl, '_blank', 'noopener,noreferrer');
    } else {
      navigate(casaAzulUrl);
    }
  };

  return (
    <div className="portal-container min-h-screen w-full flex flex-col md:flex-row overflow-x-hidden font-sans select-none">
      {/* Importación de Fuentes Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800&family=Great+Vibes&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-script { font-family: 'Great Vibes', cursive; }
        .font-serif-title { font-family: 'Playfair Display', serif; }

        /* Animación suave de expansión en hover */
        .hotel-card {
          transition: flex 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>

      {/* ========================================================= */}
      {/* SECCIÓN IZQUIERDA: HOTEL CASA DOLORES HIDALGO              */}
      {/* ========================================================= */}
      <div
        onClick={handleDoloresClick}
        className="hotel-card relative flex-1 md:hover:flex-[1.25] min-h-screen flex flex-col items-center justify-center p-8 md:p-14 text-center overflow-hidden group gap-6 cursor-pointer"
      >
        {/* Capa de Fondo con Zoom en Hover */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url(${bgSecondary})` }}
        />
        <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors duration-500" />

        {/* Círculo con Logo HCDH */}
        <div className="z-10 flex flex-col items-center">
          <div className="relative transition-transform duration-500 transform group-hover:scale-105">
            <div className="w-44 h-44 md:w-56 md:h-56 rounded-full bg-white border-4 border-[#c19a5b] shadow-2xl flex items-center justify-center p-1.5 relative overflow-hidden">
              <img
                src={hcdhLogo}
                alt="Logo Hotel Casa Dolores Hidalgo"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>

        {/* Textos y Contenido Principal */}
        <div className="z-10 max-w-md px-2 flex flex-col items-center">
          <span className="font-cinzel text-[#c5a059] text-sm md:text-base tracking-[0.3em] font-semibold uppercase block mb-1">
            HOTEL
          </span>

          <h1 className="font-cinzel text-2xl md:text-3xl lg:text-4xl !text-white font-extrabold tracking-wider leading-tight mb-4 drop-shadow-md">
            CASA DOLORES HIDALGO
          </h1>

          <p className="text-[#d1c5b8] text-sm md:text-base leading-relaxed font-light mb-6 drop-shadow">
            Combina el encanto de la arquitectura colonial con el confort moderno. Sus espacios destacan por las bóvedas de ladrillo artesanal, muros de cantera local y detalles de Talavera elaborados por artesanos de Dolores Hidalgo.
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECCIÓN DERECHA: HOTEL CASA AZUL                           */}
      {/* ========================================================= */}
      <div
        onClick={handleAzulClick}
        className="hotel-card relative flex-1 md:hover:flex-[1.25] min-h-screen flex flex-col items-center justify-center p-8 md:p-14 text-center overflow-hidden group gap-6 cursor-pointer"
      >
        {/* Capa de Fondo con Zoom en Hover */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url(${backCasaAzul})` }}
        />
        <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors duration-500" />

        {/* Círculo con Logo Casa Azul */}
        <div className="z-10 flex flex-col items-center">
          <div className="relative transition-transform duration-500 transform group-hover:scale-105">
            <div className="w-44 h-44 md:w-56 md:h-56 rounded-full bg-white shadow-2xl flex items-center justify-center p-1.5 relative overflow-hidden border-4 border-dashed border-blue-900/30">
              <img
                src={casaAzulLogo}
                alt="Logo Hotel Casa Azul"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>

        {/* Textos y Contenido Principal */}
        <div className="z-10 max-w-md px-2 flex flex-col items-center">
          <span className="font-cinzel text-white text-sm md:text-base tracking-[0.3em] font-semibold uppercase block mb-1">
            HOTEL
          </span>

          {/* <h2 className="font-script text-4xl md:text-5xl lg:text-6xl text-white font-normal leading-tight mb-4 drop-shadow-md">
            Casa Azul
          </h2> */}
          <h2 className="font-script text-4xl md:text-5xl lg:text-6xl !text-white font-normal leading-tight mb-4 drop-shadow-md">
            Casa Azul
          </h2>

          <p className="text-[#a9bee7] text-sm md:text-base leading-relaxed font-light mb-6 drop-shadow">
            Casa Azul ofrece un ambiente moderno, acogedor y confortable, ideal para disfrutar de una estancia tranquila en el corazón de Dolores Hidalgo. Su ubicación privilegiada te coloca a pocos pasos de la Parroquia de Nuestra Señora de los Dolores.
          </p>
        </div>

        {/* Botón de Acción Estilizado */}
        {/* <div className="z-10 w-full flex justify-center">
          <button
            onClick={handleAzulClick}
            className="w-full max-w-xs py-3.5 px-6 rounded bg-[#0d7ccb] hover:bg-[#118ae0] text-white font-semibold text-xs md:text-sm tracking-[0.12em] uppercase shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            RESERVAR EN CASA AZUL
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default PortalHome;

