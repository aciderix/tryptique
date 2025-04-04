/**
 * Classe de base pour tous les éléments du triptyque
 */
class BaseElement {
    constructor(options = {}) {
        this.id = options.id || generateId();
        this.type = 'base';
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.width = options.width || 100;
        this.height = options.height || 100;
        this.rotation = options.rotation || 0;
        this.opacity = options.opacity !== undefined ? options.opacity : 1;
        this.zIndex = options.zIndex || 1;
        this.panelId = options.panelId || 'panel-center';
        this.isSelected = false;
        this.isDragging = false;
        this.isResizing = false;
        this.isRotating = false;
        this.element = null;
        this.resizeHandles = [];
        this.rotateHandle = null;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.originalWidth = 0;
        this.originalHeight = 0;
        this.originalX = 0;
        this.originalY = 0;
        this.originalRotation = 0;
        this.resizeDirection = '';
    }

    // Crée l'élément DOM
    render() {
        // Créer l'élément principal
        this.element = createElement('div', {
            id: this.id,
            classList: ['tryptique-element'],
            'data-type': this.type,
            style: {
                left: `${this.x}px`,
                top: `${this.y}px`,
                width: `${this.width}px`,
                height: `${this.height}px`,
                transform: `rotate(${this.rotation}deg)`,
                opacity: this.opacity,
                zIndex: this.zIndex,
                position: 'absolute'
            }
        });

        // Ajouter les gestionnaires d'événements
        this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
        
        return this.element;
    }

    // Crée les poignées de redimensionnement et de rotation
    createHandles() {
        // Supprimer les poignées existantes
        this.removeHandles();
        
        // Créer les poignées de redimensionnement
        const positions = [
            { class: 'top-left', cursor: 'nwse-resize' },
            { class: 'top-right', cursor: 'nesw-resize' },
            { class: 'bottom-left', cursor: 'nesw-resize' },
            { class: 'bottom-right', cursor: 'nwse-resize' }
        ];
        
        for (const pos of positions) {
            const handle = createElement('div', {
                classList: ['resize-handle', pos.class],
                style: { cursor: pos.cursor },
                'data-direction': pos.class
            });
            
            handle.addEventListener('mousedown', this.handleResizeStart.bind(this));
            this.element.appendChild(handle);
            this.resizeHandles.push(handle);
        }
        
        // Créer la poignée de rotation
        this.rotateHandle = createElement('div', {
            classList: ['rotate-handle']
        });
        
        this.rotateHandle.addEventListener('mousedown', this.handleRotateStart.bind(this));
        this.element.appendChild(this.rotateHandle);
    }

    // Supprime les poignées de redimensionnement et de rotation
    removeHandles() {
        // Supprimer les poignées de redimensionnement
        for (const handle of this.resizeHandles) {
            if (handle.parentNode) {
                handle.parentNode.removeChild(handle);
            }
        }
        this.resizeHandles = [];
        
        // Supprimer la poignée de rotation
        if (this.rotateHandle && this.rotateHandle.parentNode) {
            this.rotateHandle.parentNode.removeChild(this.rotateHandle);
        }
        this.rotateHandle = null;
    }

    // Sélectionne l'élément
    select() {
        if (!this.isSelected) {
            this.isSelected = true;
            this.element.classList.add('selected');
            this.createHandles();
        }
    }

    // Désélectionne l'élément
    deselect() {
        if (this.isSelected) {
            this.isSelected = false;
            this.element.classList.remove('selected');
            this.removeHandles();
        }
    }

    // Met à jour la position de l'élément
    updatePosition(x, y) {
        this.x = x;
        this.y = y;
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
    }

    // Met à jour les dimensions de l'élément
    updateSize(width, height) {
        this.width = width;
        this.height = height;
        this.element.style.width = `${width}px`;
        this.element.style.height = `${height}px`;
    }

    // Met à jour la rotation de l'élément
    updateRotation(rotation) {
        this.rotation = rotation;
        this.element.style.transform = `rotate(${rotation}deg)`;
    }

    // Met à jour l'opacité de l'élément
    updateOpacity(opacity) {
        this.opacity = opacity;
        this.element.style.opacity = opacity;
    }

    // Met à jour l'ordre Z de l'élément
    updateZIndex(zIndex) {
        this.zIndex = zIndex;
        this.element.style.zIndex = zIndex;
    }

    // Gère le début du glisser-déposer
    handleMouseDown(event) {
        // Ignorer si on clique sur une poignée
        if (event.target !== this.element) return;
        
        event.stopPropagation();
        
        this.isDragging = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        this.originalX = this.x;
        this.originalY = this.y;
        
        // Ajouter les gestionnaires d'événements pour le glisser-déposer
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Déclencher l'événement de sélection
        const selectEvent = new CustomEvent('element:select', {
            bubbles: true,
            detail: { element: this }
        });
        this.element.dispatchEvent(selectEvent);
    }

    // Gère le déplacement pendant le glisser-déposer
    handleMouseMove(event) {
        if (!this.isDragging && !this.isResizing && !this.isRotating) return;
        
        event.preventDefault();
        
        if (this.isDragging) {
            // Calculer le déplacement
            const dx = event.clientX - this.lastMouseX;
            const dy = event.clientY - this.lastMouseY;
            
            // Mettre à jour la position
            this.updatePosition(this.x + dx, this.y + dy);
            
            // Mettre à jour les dernières coordonnées de la souris
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
            
            // Déclencher l'événement de changement
            this.triggerChangeEvent();
        } else if (this.isResizing) {
            this.handleResize(event);
        } else if (this.isRotating) {
            this.handleRotate(event);
        }
    }

    // Gère la fin du glisser-déposer
    handleMouseUp(event) {
        this.isDragging = false;
        this.isResizing = false;
        this.isRotating = false;
        
        // Supprimer les gestionnaires d'événements
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        
        // Déclencher l'événement de fin de changement
        this.triggerChangeEndEvent();
    }

    // Gère le début du redimensionnement
    handleResizeStart(event) {
        event.stopPropagation();
        
        this.isResizing = true;
        this.resizeDirection = event.target.dataset.direction;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        this.originalWidth = this.width;
        this.originalHeight = this.height;
        this.originalX = this.x;
        this.originalY = this.y;
        
        // Ajouter les gestionnaires d'événements pour le redimensionnement
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    // Gère le redimensionnement
    handleResize(event) {
        // Calculer le déplacement
        const dx = event.clientX - this.lastMouseX;
        const dy = event.clientY - this.lastMouseY;
        
        // Appliquer le redimensionnement en fonction de la direction
        if (this.resizeDirection === 'top-left') {
            const newWidth = this.originalWidth - dx;
            const newHeight = this.originalHeight - dy;
            if (newWidth > 20 && newHeight > 20) {
                this.updateSize(newWidth, newHeight);
                this.updatePosition(this.originalX + dx, this.originalY + dy);
            }
        } else if (this.resizeDirection === 'top-right') {
            const newWidth = this.originalWidth + dx;
            const newHeight = this.originalHeight - dy;
            if (newWidth > 20 && newHeight > 20) {
                this.updateSize(newWidth, newHeight);
                this.updatePosition(this.originalX, this.originalY + dy);
            }
        } else if (this.resizeDirection === 'bottom-left') {
            const newWidth = this.originalWidth - dx;
            const newHeight = this.originalHeight + dy;
            if (newWidth > 20 && newHeight > 20) {
                this.updateSize(newWidth, newHeight);
                this.updatePosition(this.originalX + dx, this.originalY);
            }
        } else if (this.resizeDirection === 'bottom-right') {
            const newWidth = this.originalWidth + dx;
            const newHeight = this.originalHeight + dy;
            if (newWidth > 20 && newHeight > 20) {
                this.updateSize(newWidth, newHeight);
            }
        }
        
        // Déclencher l'événement de changement
        this.triggerChangeEvent();
    }

    // Gère le début de la rotation
    handleRotateStart(event) {
        event.stopPropagation();
        
        this.isRotating = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        this.originalRotation = this.rotation;
        
        // Calculer le centre de l'élément
        const rect = this.element.getBoundingClientRect();
        this.centerX = rect.left + rect.width / 2;
        this.centerY = rect.top + rect.height / 2;
        
        // Calculer l'angle initial
        this.initialAngle = calculateAngle(this.centerX, this.centerY, event.clientX, event.clientY);
        
        // Ajouter les gestionnaires d'événements pour la rotation
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    // Gère la rotation
    handleRotate(event) {
        // Calculer le nouvel angle
        const currentAngle = calculateAngle(this.centerX, this.centerY, event.clientX, event.clientY);
        const angleDiff = currentAngle - this.initialAngle;
        
        // Mettre à jour la rotation
        this.updateRotation(this.originalRotation + angleDiff);
        
        // Déclencher l'événement de changement
        this.triggerChangeEvent();
    }

    // Déclenche un événement de changement
    triggerChangeEvent() {
        const changeEvent = new CustomEvent('element:change', {
            bubbles: true,
            detail: { element: this }
        });
        this.element.dispatchEvent(changeEvent);
    }

    // Déclenche un événement de fin de changement
    triggerChangeEndEvent() {
        const changeEndEvent = new CustomEvent('element:changeend', {
            bubbles: true,
            detail: { element: this }
        });
        this.element.dispatchEvent(changeEndEvent);
    }

    // Retourne les propriétés de l'élément pour la sauvegarde
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            rotation: this.rotation,
            opacity: this.opacity,
            zIndex: this.zIndex,
            panelId: this.panelId
        };
    }
}