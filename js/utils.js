// Utility Functions
// =================

// Helper function to parse dates
function parseDate(dateStr) {
    // Try different date formats
    if (!dateStr) return null;
    
    // Remove any extra whitespace
    dateStr = dateStr.toString().trim();
    
    // If standard parsing fails, try to parse DD/MM/YYYY format
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            // Try both DD/MM/YYYY and MM/DD/YYYY formats
            const dates = [
                new Date(parts[2], parts[1] - 1, parts[0]), // DD/MM/YYYY
                new Date(parts[2], parts[0] - 1, parts[1])  // MM/DD/YYYY
            ];
            
            // Return the date that seems more reasonable (not in the future, valid day/month)
            for (const date of dates) {
                if (date instanceof Date && !isNaN(date) && date <= new Date()) {
                    const month = date.getMonth() + 1;
                    const day = date.getDate();
                    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                        return date;
                    }
                }
            }
        }
    }
    
    // Try standard Date parsing (ISO format, etc.)
    const standardDate = new Date(dateStr);
    
    // Validate the date before returning
    if (standardDate instanceof Date && !isNaN(standardDate.getTime())) {
        return standardDate;
    }
    
    // If we couldn't parse a valid date, return null
    console.warn('Unable to parse date:', dateStr);
    return null;
}

// Helper function to format date to YYYY-MM
function formatYearMonth(date) {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

// Helper function to parse CSV line considering quoted fields
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                // Handle escaped quotes
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

// Helper function to extract location from business name
function extractLocation(businessName) {
    // Caso específico para B-Duds/B-Dubs (no separar)
    if (businessName.toLowerCase().includes('b-dud') || businessName.toLowerCase().includes('b-dub')) {
        return 'Unknown'; // No hay ubicación separada
    }
    
    // Caso específico para Asados Gaby Dana
    if (businessName.toLowerCase().includes('asados gaby dana')) {
        // Si incluye un guion, la ubicación está después del guion
        if (businessName.includes(' - ')) {
            const parts = businessName.split(' - ');
            return parts[parts.length - 1].trim();
        }
        return 'Principal'; // Ubicación por defecto si no tiene guion
    }
    
    // Primero buscamos un patrón "#" seguido de números al final del nombre
    const hashPattern = /#\d+\s*$/;
    if (hashPattern.test(businessName)) {
        // Obtener el índice donde comienza el patrón
        const hashIndex = businessName.search(hashPattern);
        // La ubicación es el patrón encontrado
        return businessName.substring(hashIndex).trim();
    }
    
    // Si no hay patrón con #, intentamos con guion
    if (businessName.includes(' - ')) {
        const parts = businessName.split(' - ');
        return parts[parts.length - 1].trim();
    }
    
    // Si no hay separador, no hay ubicación específica
    return 'Principal';
}

// Helper function to extract business name without location
function extractBusinessName(fullName) {
    // Caso específico para B-Duds/B-Dubs (no separar)
    if (fullName.toLowerCase().includes('b-dud') || fullName.toLowerCase().includes('b-dub')) {
        return fullName.trim(); // Devolver el nombre completo
    }
    
    // Caso específico para Laboratorio Delgado Especializado
    if (fullName.toLowerCase().includes('laboratorio delgado especializado')) {
        return 'Laboratorio Delgado Especializado';
    }
    
    // Caso específico para Asados Gaby Dana
    if (fullName.toLowerCase().includes('asados gaby dana')) {
        return 'Asados Gaby Dana';
    }
    
    // Primero buscamos un patrón "#" seguido de números al final del nombre
    const hashPattern = /#\d+\s*$/;
    if (hashPattern.test(fullName)) {
        // Obtenemos el índice donde comienza el patrón
        const hashIndex = fullName.search(hashPattern);
        // Devolvemos todo lo anterior a ese índice
        return fullName.substring(0, hashIndex).trim();
    }
    
    // Si no hay patrón con #, intentamos con guion
    if (fullName.includes(' - ')) {
        const parts = fullName.split(' - ');
        return parts[0].trim();
    }
    
    // Si no hay separador, devolver el nombre completo
    return fullName.trim();
}

// Helper function to calculate days between dates
function getDaysBetween(startDate, endDate) {
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Add 1 to include both start and end dates
}

// Helper function to check if a transaction should be excluded
function shouldExcludeTransaction(email, date) {
    // Convert date to YYYY-MM-DD format for comparison
    let dateStr;
    if (date instanceof Date) {
        dateStr = date.toISOString().split('T')[0];
    } else if (typeof date === 'string') {
        // Parse the date string and convert to YYYY-MM-DD
        const parsedDate = parseDate(date);
        dateStr = parsedDate ? parsedDate.toISOString().split('T')[0] : date;
    } else {
        dateStr = date;
    }
    
    return excludedTransactions.some(excluded => 
        excluded.email.toLowerCase() === email.toLowerCase() && 
        excluded.date === dateStr
    );
}

// Helper function to safely update element text content
function safeSetText(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

// Helper function to safely update element class name
function safeSetClass(elementId, className) {
    const element = document.getElementById(elementId);
    if (element) {
        element.className = className;
    }
}

// Helper function to normalize business names to handle typos and encoding issues
function normalizeBusinessName(businessName) {
    if (!businessName) return '';
    
    // Convert to lowercase for comparison
    let normalized = businessName.toLowerCase().trim();
    
    // Fix common encoding issues (UTF-8 characters being misinterpreted)
    normalized = normalized
        .replace(/ã¡/g, 'á')
        .replace(/ã©/g, 'é')
        .replace(/ã­/g, 'í')
        .replace(/ã³/g, 'ó')
        .replace(/ãº/g, 'ú')
        .replace(/ã±/g, 'ñ')
        .replace(/ã¼/g, 'ü')
        .replace(/ã§/g, 'ç')
        .replace(/ã /g, 'à')
        .replace(/ã¨/g, 'è')
        .replace(/ã¬/g, 'ì')
        .replace(/ã²/g, 'ò')
        .replace(/ã¹/g, 'ù')
        .replace(/ã¤/g, 'ä')
        .replace(/ã¶/g, 'ö');
    
    // Remove extra spaces and normalize spacing
    normalized = normalized.replace(/\s+/g, ' ');
    
    // Remove common business suffixes for comparison
    normalized = normalized
        .replace(/\s+(s\.?a\.?|s\.?l\.?|s\.?r\.?l\.?|inc\.?|llc\.?|corp\.?|ltd\.?)$/g, '')
        .replace(/\s+(laboratorio|clínico|clinico|laboratory|clinical)$/g, '')
        .replace(/\s+(testlab|test lab)$/g, '');
    
    return normalized;
}

// Helper function to find similar business names (for merging/grouping)
function findSimilarBusinesses(businessName, allBusinesses, threshold = 0.8) {
    const normalized = normalizeBusinessName(businessName);
    const similar = [];
    
    for (const business of allBusinesses) {
        if (business === businessName) continue;
        
        const normalizedOther = normalizeBusinessName(business);
        
        // Check if normalized names match exactly
        if (normalized === normalizedOther) {
            similar.push(business);
            continue;
        }
        
        // Calculate similarity using simple string comparison
        const similarity = calculateStringSimilarity(normalized, normalizedOther);
        if (similarity >= threshold) {
            similar.push(business);
        }
    }
    
    return similar;
}

// Simple string similarity calculation (Levenshtein distance based)
function calculateStringSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
}

// Levenshtein distance calculation
function levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}
