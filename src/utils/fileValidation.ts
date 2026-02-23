/**
 * Utility per validazione file upload
 * Previene attacchi tramite file malformati o mascherati
 */

/**
 * Magic bytes (firme file) per formati immagine comuni
 * Controlla i primi byte del file per verificare il tipo reale
 */
const IMAGE_SIGNATURES: { [key: string]: number[][] } = {
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF], // JPEG standard
  ],
  'image/png': [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], // PNG
  ],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46], // RIFF (inizio)
  ],
  'image/bmp': [
    [0x42, 0x4D], // BM
  ],
};

/**
 * Valida il tipo MIME di un file controllando i magic bytes
 * Questo previene attacchi dove un file viene mascherato con estensione falsa
 */
export async function validateFileType(file: File, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']): Promise<{ valid: boolean; error?: string }> {
  // Verifica tipo MIME dichiarato
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Tipo file non consentito: ${file.type}` };
  }

  // Leggi i primi byte del file per verificare la firma
  const maxBytesToCheck = 12; // Controlla i primi 12 byte (sufficiente per tutti i formati)
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (!arrayBuffer) {
        resolve({ valid: false, error: 'Impossibile leggere il file' });
        return;
      }

      const bytes = new Uint8Array(arrayBuffer);

      // Verifica se i magic bytes corrispondono al tipo dichiarato
      const expectedSignatures = IMAGE_SIGNATURES[file.type];
      if (!expectedSignatures) {
        // Tipo non supportato per validazione magic bytes, accetta se è nella lista allowed
        resolve({ valid: true });
        return;
      }

      // Controlla se almeno una firma corrisponde
      const matches = expectedSignatures.some(signature => {
        if (bytes.length < signature.length) return false;
        
        return signature.every((byte, index) => bytes[index] === byte);
      });

      if (matches) {
        resolve({ valid: true });
      } else {
        resolve({ 
          valid: false, 
          error: `Il file non corrisponde al tipo dichiarato. Tipo dichiarato: ${file.type}, ma la firma del file non corrisponde.` 
        });
      }
    };

    reader.onerror = () => {
      resolve({ valid: false, error: 'Errore nella lettura del file' });
    };

    // Leggi solo i primi byte necessari per la validazione
    const blob = file.slice(0, maxBytesToCheck);
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Valida la dimensione del file
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxSizeBytes) {
    return { 
      valid: false, 
      error: `Il file è troppo grande. Massimo ${maxSizeMB}MB consentiti. Dimensione attuale: ${(file.size / 1024 / 1024).toFixed(2)}MB` 
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'Il file è vuoto' };
  }

  return { valid: true };
}

/**
 * Valida completamente un file (tipo, dimensione, magic bytes)
 */
export async function validateFile(
  file: File, 
  options: {
    allowedTypes?: string[];
    maxSizeMB?: number;
  } = {}
): Promise<{ valid: boolean; error?: string }> {
  const { allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'], maxSizeMB = 10 } = options;

  // Valida dimensione
  const sizeValidation = validateFileSize(file, maxSizeMB);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  // Valida tipo e magic bytes
  const typeValidation = await validateFileType(file, allowedTypes);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  return { valid: true };
}

