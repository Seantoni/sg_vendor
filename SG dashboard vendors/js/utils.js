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
    
    // If all else fails, try standard Date parsing
    return new Date(dateStr);
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
