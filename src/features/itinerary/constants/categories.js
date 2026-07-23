export const ITINERARY_CATEGORIES = {
  COMIDA: [
    'Restaurante',
    'Cafeteria',
    'Bares y Cantinas',
    'Mercados'
  ],
  SALUD: [
    'Farmacias',
    'Clinicas/Hospitales'
  ],
  ATRACCIONES: [
    'Museos',
    'Atracción Turistica',
    'Viñedos',
    'Balnearios',
    'Sitios de Interes'
  ],
  EVENTOS: [
    'Eventos'
  ],
  TOURS: [
    'Tours'
  ],
  OTRAS: [
    'Penciones/Transporte'
  ]
};

export const getCategoryBySubcategory = (subcategory) => {
  for (const [mainCat, subCats] of Object.entries(ITINERARY_CATEGORIES)) {
    if (subCats.includes(subcategory)) {
      return mainCat;
    }
  }
  return 'OTRAS';
};
