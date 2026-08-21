export const verificarDisponibilidad = (lugar, fecha) => {
  if (!lugar || !fecha) return { disponible: true };

  // 1. Si es Evento de Temporada, validar por rango de fechas
  if (lugar.isEventoLocal && (lugar.fecha_inicio || lugar.fecha_fin)) {
    const d = new Date(fecha.getTime());
    d.setHours(0,0,0,0);
    
    if (lugar.fecha_inicio) {
      const inicio = new Date(lugar.fecha_inicio);
      inicio.setHours(0,0,0,0);
      if (d < inicio) {
        return { disponible: false, motivo: `El evento inicia el ${inicio.toLocaleDateString('es-MX')}` };
      }
    }
    if (lugar.fecha_fin) {
      const fin = new Date(lugar.fecha_fin);
      fin.setHours(0,0,0,0);
      if (d > fin) {
        return { disponible: false, motivo: `El evento finalizó el ${fin.toLocaleDateString('es-MX')}` };
      }
    }
    return { disponible: true };
  }

  // 2. Si tiene horarios estructurados en horarios_json
  if (lugar.horarios_json && Array.isArray(lugar.horarios_json) && lugar.horarios_json.length > 0) {
    const diaSemanaNum = fecha.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    
    // Mapeo para indexar días en una semana lineal (Lunes = 1, ..., Domingo = 7)
    const mapaDias = {
      lunes: 1, lun: 1,
      martes: 2, mar: 2,
      miercoles: 3, miércoles: 3, mie: 3,
      jueves: 4, jue: 4,
      viernes: 5, vie: 5,
      sabado: 6, sábado: 6, sab: 6,
      domingo: 7, dom: 7
    };

    const diaActualSemanaVal = diaSemanaNum === 0 ? 7 : diaSemanaNum; // Domingo es 7
    const diaActualNombre = Object.keys(mapaDias).find(k => mapaDias[k] === diaActualSemanaVal); // e.g. "lunes", "martes"...

    let cumpleAlgunaRegla = false;
    let tieneReglasDeDias = false;

    for (const regla of lugar.horarios_json) {
      const diasStr = (regla.dias || '').toLowerCase().trim();
      if (!diasStr) continue;

      tieneReglasDeDias = true;

      // Normalizar texto
      const diasNormalizado = diasStr
        .replace(/á/g, 'a')
        .replace(/é/g, 'e')
        .replace(/í/g, 'i')
        .replace(/ó/g, 'o')
        .replace(/ú/g, 'u');

      // A) Todos los días / Diario
      if (
        diasNormalizado.includes('diario') || 
        diasNormalizado.includes('todos los dias') || 
        diasNormalizado.includes('lunes a domingo') ||
        diasNormalizado.includes('lunes - domingo')
      ) {
        cumpleAlgunaRegla = true;
        break;
      }

      // B) Rangos del tipo "Lunes a Jueves" o "Lunes - Jueves"
      const rangoMatch = diasNormalizado.match(/([a-z]+)\s*(?:a|-|al)\s*([a-z]+)/);
      if (rangoMatch) {
        const diaInicioStr = rangoMatch[1];
        const diaFinStr = rangoMatch[2];
        const valInicio = mapaDias[diaInicioStr];
        const valFin = mapaDias[diaFinStr];

        if (valInicio !== undefined && valFin !== undefined) {
          // Caso estándar, ejemplo: Lunes (1) a Jueves (4)
          if (valInicio <= valFin) {
            if (diaActualSemanaVal >= valInicio && diaActualSemanaVal <= valFin) {
              cumpleAlgunaRegla = true;
              break;
            }
          } else {
            // Caso donde el rango cruza el fin de semana, ej: Viernes (5) a Domingo (7) o Domingo (7) a Martes (2)
            if (diaActualSemanaVal >= valInicio || diaActualSemanaVal <= valFin) {
              cumpleAlgunaRegla = true;
              break;
            }
          }
        }
      }

      // C) Días específicos enumerados, ej: "Sábados y Domingos", "Sábado y Domingo", "Jueves"
      if (
        diasNormalizado.includes(diaActualNombre) || 
        (diaActualNombre === 'miercoles' && diasNormalizado.includes('miercoles')) ||
        (diaActualNombre === 'sabado' && diasNormalizado.includes('sabado')) ||
        (diaActualNombre === 'domingo' && diasNormalizado.includes('domingo'))
      ) {
        cumpleAlgunaRegla = true;
        break;
      }
      
      const diaNombreNormalizado = diaActualNombre.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u');
      if (diasNormalizado.includes(diaNombreNormalizado)) {
        cumpleAlgunaRegla = true;
        break;
      }
    }

    if (tieneReglasDeDias && !cumpleAlgunaRegla) {
      const diasEsp = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      return { 
        disponible: false, 
        motivo: `No abre los ${diasEsp[diaSemanaNum]}` 
      };
    }
  }

  // 3. Si no posee ni horarios_json ni un campo de horario en texto
  const tieneHorariosJson = lugar.horarios_json && Array.isArray(lugar.horarios_json) && lugar.horarios_json.length > 0;
  const tieneHorarioTexto = lugar.horario && lugar.horario.trim() !== '' && !lugar.horario.toLowerCase().includes('sin horario');

  if (!tieneHorariosJson && !tieneHorarioTexto) {
    return {
      disponible: true,
      sinHorario: true,
      motivo: 'Sin horario registrado'
    };
  }

  return { disponible: true };
};
