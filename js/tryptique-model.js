/**
 * Modèle de données pour le triptyque
 */
class TryptiqueModel {
    constructor() {
        this.elements = [];
        this.selectedElement = null;
        this.nextZIndex = 1;
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        this.projectName = 'Nouveau triptyque';
        this.modified = false;
        
        // Dimensions du triptyque (en mm)
        this.width = 210 * 3; // 3 volets A4
        this.height = 297; // Hauteur A4
        
        // Événements
        this.events = {
            'element:added': [],
            'element:removed': [],
            'element:selected': [],
            'element:deselected': [],
            'element:changed': [],
            'model:changed': [],
            'history:changed': []
        };
    }

    // Ajoute un élément au triptyque
    addElement(element) {
        // Définir l'ordre Z
        element.zIndex = this.nextZIndex++;
        
        // Ajouter l'élément
        this.elements.push(element);
        
        // Sélectionner l'élément
        this.selectElement(element);
        
        // Ajouter à l'historique
        this.addToHistory({
            type: 'add',
            element: element.toJSON()
        });
        
        // Déclencher l'événement
        this.triggerEvent('element:added', { element });
        this.triggerEvent('model:changed');
        
        this.modified = true;
        
        return element;
    }

    // Supprime un élément du triptyque
    removeElement(elementId) {
        const index = this.elements.findIndex(el => el.id === elementId);
        
        if (index !== -1) {
            const element = this.elements[index];
            
            // Supprimer l'élément
            this.elements.splice(index, 1);
            
            // Si l'élément était sélectionné, désélectionner
            if (this.selectedElement === element) {
                this.deselectElement();
            }
            
            // Ajouter à l'historique
            this.addToHistory({
                type: 'remove',
                element: element.toJSON()
            });
            
            // Déclencher l'événement
            this.triggerEvent('element:removed', { element });
            this.triggerEvent('model:changed');
            
            this.modified = true;
            
            return true;
        }
        
        return false;
    }

    // Sélectionne un élément
    selectElement(element) {
        // Désélectionner l'élément actuel
        if (this.selectedElement && this.selectedElement !== element) {
            this.selectedElement.deselect();
            this.triggerEvent('element:deselected', { element: this.selectedElement });
        }
        
        // Sélectionner le nouvel élément
        this.selectedElement = element;
        element.select();
        
        // Déclencher l'événement
        this.triggerEvent('element:selected', { element });
    }

    // Désélectionne l'élément actuel
    deselectElement() {
        if (this.selectedElement) {
            this.selectedElement.deselect();
            this.triggerEvent('element:deselected', { element: this.selectedElement });
            this.selectedElement = null;
        }
    }

    // Met à jour un élément
    updateElement(elementId, properties) {
        const element = this.getElementById(elementId);
        
        if (!element) return false;
        
        // Sauvegarder l'état avant la modification
        const oldProperties = { ...element.toJSON() };
        
        // Mettre à jour les propriétés
        for (const [key, value] of Object.entries(properties)) {
            if (key === 'x') {
                element.updatePosition(value, element.y);
            } else if (key === 'y') {
                element.updatePosition(element.x, value);
            } else if (key === 'width') {
                element.updateSize(value, element.height);
            } else if (key === 'height') {
                element.updateSize(element.width, value);
            } else if (key === 'rotation') {
                element.updateRotation(value);
            } else if (key === 'opacity') {
                element.updateOpacity(value);
            } else if (key === 'zIndex') {
                element.updateZIndex(value);
            } else if (key === 'text' && element.type === 'text') {
                element.updateText(value);
            } else if (key === 'fontFamily' && element.type === 'text') {
                element.updateFont(value);
            } else if (key === 'fontSize' && element.type === 'text') {
                element.updateFontSize(value);
            } else if (key === 'fontWeight' && element.type === 'text') {
                element.updateFontWeight(value);
            } else if (key === 'fontStyle' && element.type === 'text') {
                element.updateFontStyle(value);
            } else if (key === 'textDecoration' && element.type === 'text') {
                element.updateTextDecoration(value);
            } else if (key === 'textAlign' && element.type === 'text') {
                element.updateTextAlign(value);
            } else if (key === 'color' && element.type === 'text') {
                element.updateColor(value);
            } else if (key === 'src' && element.type === 'image') {
                element.updateSource(value);
            } else if (key === 'alt' && element.type === 'image') {
                element.updateAlt(value);
            } else if (key === 'maintainRatio' && element.type === 'image') {
                element.updateMaintainRatio(value);
            } else if (key === 'shapeType' && element.type === 'shape') {
                element.updateShapeType(value);
            } else if (key === 'fillColor' && element.type === 'shape') {
                element.updateFillColor(value);
            } else if (key === 'strokeColor' && element.type === 'shape') {
                element.updateStrokeColor(value);
            } else if (key === 'strokeWidth' && element.type === 'shape') {
                element.updateStrokeWidth(value);
            } else if (key === 'cornerRadius' && element.type === 'shape') {
                element.updateCornerRadius(value);
            }
        }
        
        // Ajouter à l'historique
        this.addToHistory({
            type: 'update',
            elementId,
            oldProperties,
            newProperties: element.toJSON()
        });
        
        // Déclencher l'événement
        this.triggerEvent('element:changed', { element });
        this.triggerEvent('model:changed');
        
        this.modified = true;
        
        return true;
    }

    // Récupère un élément par son ID
    getElementById(elementId) {
        return this.elements.find(el => el.id === elementId);
    }

    // Récupère tous les éléments
    getAllElements() {
        return [...this.elements];
    }

    // Récupère l'élément sélectionné
    getSelectedElement() {
        return this.selectedElement;
    }

    // Ajoute une action à l'historique
    addToHistory(action) {
        // Si nous ne sommes pas à la fin de l'historique, supprimer les actions suivantes
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        // Ajouter l'action
        this.history.push(action);
        this.historyIndex = this.history.length - 1;
        
        // Limiter la taille de l'historique
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.historyIndex--;
        }
        
        // Déclencher l'événement
        this.triggerEvent('history:changed');
    }

    // Annule la dernière action
    undo() {
        if (this.historyIndex < 0) return false;
        
        const action = this.history[this.historyIndex];
        
        switch (action.type) {
            case 'add':
                // Supprimer l'élément ajouté
                this.removeElementWithoutHistory(action.element.id);
                break;
                
            case 'remove':
                // Recréer l'élément supprimé
                this.createElementFromJSON(action.element);
                break;
                
            case 'update':
                // Restaurer les anciennes propriétés
                this.updateElementWithoutHistory(action.elementId, action.oldProperties);
                break;
        }
        
        this.historyIndex--;
        this.triggerEvent('history:changed');
        this.triggerEvent('model:changed');
        
        this.modified = true;
        
        return true;
    }

    // Rétablit la dernière action annulée
    redo() {
        if (this.historyIndex >= this.history.length - 1) return false;
        
        this.historyIndex++;
        const action = this.history[this.historyIndex];
        
        switch (action.type) {
            case 'add':
                // Recréer l'élément ajouté
                this.createElementFromJSON(action.element);
                break;
                
            case 'remove':
                // Supprimer l'élément
                this.removeElementWithoutHistory(action.element.id);
                break;
                
            case 'update':
                // Appliquer les nouvelles propriétés
                this.updateElementWithoutHistory(action.elementId, action.newProperties);
                break;
        }
        
        this.triggerEvent('history:changed');
        this.triggerEvent('model:changed');
        
        this.modified = true;
        
        return true;
    }

    // Supprime un élément sans l'ajouter à l'historique
    removeElementWithoutHistory(elementId) {
        const index = this.elements.findIndex(el => el.id === elementId);
        
        if (index !== -1) {
            const element = this.elements[index];
            
            // Supprimer l'élément
            this.elements.splice(index, 1);
            
            // Si l'élément était sélectionné, désélectionner
            if (this.selectedElement === element) {
                this.deselectElement();
            }
            
            // Déclencher l'événement
            this.triggerEvent('element:removed', { element });
            
            return true;
        }
        
        return false;
    }

    // Met à jour un élément sans l'ajouter à l'historique
    updateElementWithoutHistory(elementId, properties) {
        const element = this.getElementById(elementId);
        
        if (!element) return false;
        
        // Mettre à jour les propriétés
        for (const [key, value] of Object.entries(properties)) {
            if (key === 'x') {
                element.updatePosition(value, element.y);
            } else if (key === 'y') {
                element.updatePosition(element.x, value);
            } else if (key === 'width') {
                element.updateSize(value, element.height);
            } else if (key === 'height') {
                element.updateSize(element.width, value);
            } else if (key === 'rotation') {
                element.updateRotation(value);
            } else if (key === 'opacity') {
                element.updateOpacity(value);
            } else if (key === 'zIndex') {
                element.updateZIndex(value);
            } else if (key === 'text' && element.type === 'text') {
                element.updateText(value);
            } else if (key === 'fontFamily' && element.type === 'text') {
                element.updateFont(value);
            } else if (key === 'fontSize' && element.type === 'text') {
                element.updateFontSize(value);
            } else if (key === 'fontWeight' && element.type === 'text') {
                element.updateFontWeight(value);
            } else if (key === 'fontStyle' && element.type === 'text') {
                element.updateFontStyle(value);
            } else if (key === 'textDecoration' && element.type === 'text') {
                element.updateTextDecoration(value);
            } else if (key === 'textAlign' && element.type === 'text') {
                element.updateTextAlign(value);
            } else if (key === 'color' && element.type === 'text') {
                element.updateColor(value);
            } else if (key === 'src' && element.type === 'image') {
                element.updateSource(value);
            } else if (key === 'alt' && element.type === 'image') {
                element.updateAlt(value);
            } else if (key === 'maintainRatio' && element.type === 'image') {
                element.updateMaintainRatio(value);
            } else if (key === 'shapeType' && element.type === 'shape') {
                element.updateShapeType(value);
            } else if (key === 'fillColor' && element.type === 'shape') {
                element.updateFillColor(value);
            } else if (key === 'strokeColor' && element.type === 'shape') {
                element.updateStrokeColor(value);
            } else if (key === 'strokeWidth' && element.type === 'shape') {
                element.updateStrokeWidth(value);
            } else if (key === 'cornerRadius' && element.type === 'shape') {
                element.updateCornerRadius(value);
            }
        }
        
        // Déclencher l'événement
        this.triggerEvent('element:changed', { element });
        
        return true;
    }

    // Crée un élément à partir de données JSON
    createElementFromJSON(data) {
        let element;
        
        switch (data.type) {
            case 'text':
                element = new TextElement(data);
                break;
                
            case 'image':
                element = new ImageElement(data);
                break;
                
            case 'shape':
                element = new ShapeElement(data);
                break;
                
            default:
                return null;
        }
        
        // Ajouter l'élément sans l'ajouter à l'historique
        this.elements.push(element);
        
        // Mettre à jour le prochain ordre Z
        this.nextZIndex = Math.max(this.nextZIndex, element.zIndex + 1);
        
        // Déclencher l'événement
        this.triggerEvent('element:added', { element });
        
        return element;
    }

    // Efface tous les éléments
    clearElements() {
        // Désélectionner l'élément actuel
        this.deselectElement();
        
        // Sauvegarder les éléments pour l'historique
        const oldElements = this.elements.map(el => el.toJSON());
        
        // Supprimer tous les éléments
        this.elements = [];
        
        // Réinitialiser l'ordre Z
        this.nextZIndex = 1;
        
        // Ajouter à l'historique
        this.addToHistory({
            type: 'clear',
            elements: oldElements
        });
        
        // Déclencher l'événement
        this.triggerEvent('model:changed');
        
        this.modified = true;
    }

    // Enregistre le triptyque
    save() {
        const data = {
            version: '1.0',
            projectName: this.projectName,
            width: this.width,
            height: this.height,
            elements: this.elements.map(el => el.toJSON())
        };
        
        this.modified = false;
        
        return data;
    }

    // Charge un triptyque
    load(data) {
        // Vérifier la version
        if (data.version !== '1.0') {
            console.warn('Version incompatible:', data.version);
        }
        
        // Effacer les éléments actuels
        this.elements = [];
        this.deselectElement();
        
        // Charger les propriétés du projet
        this.projectName = data.projectName || 'Nouveau triptyque';
        this.width = data.width || 210 * 3;
        this.height = data.height || 297;
        
        // Charger les éléments
        if (Array.isArray(data.elements)) {
            for (const elementData of data.elements) {
                this.createElementFromJSON(elementData);
            }
        }
        
        // Réinitialiser l'historique
        this.history = [];
        this.historyIndex = -1;
        
        // Mettre à jour le prochain ordre Z
        this.nextZIndex = this.elements.length > 0 
            ? Math.max(...this.elements.map(el => el.zIndex)) + 1 
            : 1;
        
        // Déclencher l'événement
        this.triggerEvent('model:changed');
        this.triggerEvent('history:changed');
        
        this.modified = false;
        
        return true;
    }

    // Ajoute un écouteur d'événement
    addEventListener(eventName, callback) {
        if (this.events[eventName]) {
            this.events[eventName].push(callback);
            return true;
        }
        return false;
    }

    // Supprime un écouteur d'événement
    removeEventListener(eventName, callback) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
            return true;
        }
        return false;
    }

    // Déclenche un événement
    triggerEvent(eventName, data = {}) {
        if (this.events[eventName]) {
            for (const callback of this.events[eventName]) {
                callback(data);
            }
        }
    }
}