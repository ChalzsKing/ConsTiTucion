// ================================
// MAPEO DE ARTÍCULOS A TÍTULOS
// ================================

export function getArticleTitleId(articleNumber: number): string {
  // Título Preliminar (Arts. 1-9)
  if (articleNumber >= 1 && articleNumber <= 9) {
    return 'preliminar'
  }

  // Título I (Arts. 10-55): Derechos y deberes fundamentales
  if (articleNumber >= 10 && articleNumber <= 55) {
    return 'titulo1'
  }

  // Título II (Arts. 56-65): De la Corona
  if (articleNumber >= 56 && articleNumber <= 65) {
    return 'titulo2'
  }

  // Título III (Arts. 66-96): De las Cortes Generales
  if (articleNumber >= 66 && articleNumber <= 96) {
    return 'titulo3'
  }

  // Título IV (Arts. 97-107): Del Gobierno y Administración
  if (articleNumber >= 97 && articleNumber <= 107) {
    return 'titulo4'
  }

  // Título V (Arts. 108-116): Relaciones Gobierno-Cortes
  if (articleNumber >= 108 && articleNumber <= 116) {
    return 'titulo5'
  }

  // Título VI (Arts. 117-127): Del Poder Judicial
  if (articleNumber >= 117 && articleNumber <= 127) {
    return 'titulo6'
  }

  // Título VII (Arts. 128-136): Economía y Hacienda
  if (articleNumber >= 128 && articleNumber <= 136) {
    return 'titulo7'
  }

  // Título VIII (Arts. 137-158): Organización Territorial
  if (articleNumber >= 137 && articleNumber <= 158) {
    return 'titulo8'
  }

  // Título IX (Arts. 159-165): Del Tribunal Constitucional
  if (articleNumber >= 159 && articleNumber <= 165) {
    return 'titulo9'
  }

  // Título X (Arts. 166-169): Reforma constitucional
  if (articleNumber >= 166 && articleNumber <= 169) {
    return 'titulo10'
  }

  // Disposiciones (artículos > 169)
  if (articleNumber > 169) {
    return 'disposiciones'
  }

  // Por defecto, artículos no reconocidos van a preliminar
  return 'preliminar'
}

export function getTitleName(titleId: string): string {
  const titleNames: Record<string, string> = {
    'preliminar': 'Título Preliminar',
    'titulo1': 'Título I - Derechos Fundamentales',
    'titulo2': 'Título II - La Corona',
    'titulo3': 'Título III - Cortes Generales',
    'titulo4': 'Título IV - Gobierno y Administración',
    'titulo5': 'Título V - Relaciones Gobierno-Cortes',
    'titulo6': 'Título VI - Poder Judicial',
    'titulo7': 'Título VII - Economía y Hacienda',
    'titulo8': 'Título VIII - Organización Territorial',
    'titulo9': 'Título IX - Tribunal Constitucional',
    'titulo10': 'Título X - Reforma Constitucional',
    'disposiciones': 'Disposiciones'
  }

  return titleNames[titleId] || 'Título Desconocido'
}