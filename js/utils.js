/**
 * Fonctions utilitaires pour l'application
 */

// Génère un identifiant unique
function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
}

// Convertit des pixels en millimètres (pour l'impression)
function pxToMm(px) {
    return px * 0.264583; // 1px = 0.264583mm
}

// Convertit des millimètres en pixels
function mmToPx(mm) {
    return mm / 0.264583;
}

// Limite une valeur entre min et max
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Vérifie si un point est à l'intérieur d'un rectangle
function isPointInRect(x, y, rect) {
    return x >= rect.x && 
           x <= rect.x + rect.width && 
           y >= rect.y && 
           y <= rect.y + rect.height;
}

// Calcule l'angle entre deux points
function calculateAngle(cx, cy, px, py) {
    const x = px - cx;
    const y = py - cy;
    return Math.atan2(y, x) * 180 / Math.PI;
}

// Calcule la distance entre deux points
function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Convertit une couleur RGB en hexadécimal
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Convertit une couleur hexadécimale en RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Crée un élément DOM avec des attributs et des enfants
function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    // Ajouter les attributs
    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else if (key === 'classList' && Array.isArray(value)) {
            element.classList.add(...value);
        } else if (key === 'dataset' && typeof value === 'object') {
            for (const [dataKey, dataValue] of Object.entries(value)) {
                element.dataset[dataKey] = dataValue;
            }
        } else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.substring(2).toLowerCase(), value);
        } else {
            element.setAttribute(key, value);
        }
    }
    
    // Ajouter les enfants
    for (const child of children) {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            element.appendChild(child);
        }
    }
    
    return element;
}

// Charge une image à partir d'une URL ou d'un fichier
function loadImage(source) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        
        if (source instanceof File) {
            const reader = new FileReader();
            reader.onload = (e) => { img.src = e.target.result; };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(source);
        } else {
            img.src = source;
        }
    });
}

// Sauvegarde des données dans le localStorage
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

// Charge des données depuis le localStorage
function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
}

// Télécharge un fichier
function downloadFile(content, fileName, contentType) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
}

// Convertit un élément DOM en image
function domToImage(element) {
    return new Promise((resolve, reject) => {
        html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true
        }).then(canvas => {
            resolve(canvas.toDataURL('image/png'));
        }).catch(error => {
            reject(error);
        });
    });
}