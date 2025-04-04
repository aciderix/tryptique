/**
 * Classe pour les éléments d'image
 */
class ImageElement extends BaseElement {
    constructor(options = {}) {
        super(options);
        this.type = 'image';
        this.src = options.src || '';
        this.alt = options.alt || 'Image';
        this.originalWidth = options.originalWidth || 0;
        this.originalHeight = options.originalHeight || 0;
        this.maintainRatio = options.maintainRatio !== undefined ? options.maintainRatio : true;
        this.imageElement = null;
    }

    // Crée l'élément DOM
    render() {
        // Créer l'élément de base
        super.render();
        
        // Ajouter la classe spécifique
        this.element.classList.add('image-element');
        
        // Créer l'élément d'image
        this.imageElement = createElement('img', {
            src: this.src,
            alt: this.alt,
            style: {
                width: '100%',
                height: '100%',
                objectFit: 'contain'
            }
        });
        
        // Ajouter l'image à l'élément
        this.element.appendChild(this.imageElement);
        
        return this.element;
    }

    // Charge une image
    async loadImage(source) {
        try {
            const img = await loadImage(source);
            
            // Mettre à jour la source
            if (source instanceof File) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.src = e.target.result;
                    this.imageElement.src = this.src;
                };
                reader.readAsDataURL(source);
            } else {
                this.src = source;
                this.imageElement.src = this.src;
            }
            
            // Enregistrer les dimensions originales
            this.originalWidth = img.naturalWidth;
            this.originalHeight = img.naturalHeight;
            
            // Mettre à jour les dimensions si nécessaire
            if (this.width === 100 && this.height === 100) {
                // Dimensions par défaut, ajuster à l'image
                const maxWidth = 300;
                const maxHeight = 300;
                
                if (this.originalWidth > maxWidth || this.originalHeight > maxHeight) {
                    const ratio = Math.min(maxWidth / this.originalWidth, maxHeight / this.originalHeight);
                    this.updateSize(this.originalWidth * ratio, this.originalHeight * ratio);
                } else {
                    this.updateSize(this.originalWidth, this.originalHeight);
                }
            }
            
            // Déclencher l'événement de changement
            this.triggerChangeEvent();
            
            return true;
        } catch (error) {
            console.error('Error loading image:', error);
            return false;
        }
    }

    // Met à jour la source de l'image
    updateSource(src) {
        this.src = src;
        this.imageElement.src = src;
    }

    // Met à jour le texte alternatif
    updateAlt(alt) {
        this.alt = alt;
        this.imageElement.alt = alt;
    }

    // Met à jour le maintien du ratio
    updateMaintainRatio(maintainRatio) {
        this.maintainRatio = maintainRatio;
    }

    // Redéfinit la méthode de redimensionnement pour maintenir le ratio
    handleResize(event) {
        if (!this.maintainRatio || !this.originalWidth || !this.originalHeight) {
            // Si on ne maintient pas le ratio ou si on n'a pas les dimensions originales,
            // utiliser la méthode de base
            super.handleResize(event);
            return;
        }
        
        // Calculer le déplacement
        const dx = event.clientX - this.lastMouseX;
        const dy = event.clientY - this.lastMouseY;
        
        // Calculer le ratio original
        const ratio = this.originalWidth / this.originalHeight;
        
        // Appliquer le redimensionnement en fonction de la direction
        if (this.resizeDirection === 'top-left') {
            let newWidth = this.originalWidth - dx;
            let newHeight = newWidth / ratio;
            
            if (newWidth > 20 && newHeight > 20) {
                this.updateSize(newWidth, newHeight);
                this.updatePosition(this.originalX + dx, this.originalY + (this.originalHeight - newHeight));
            }
        } else if (this.resizeDirection === 'top-right') {
            let newWidth = this.originalWidth + dx;
            let newHeight = newWidth / ratio;
            
            if (newWidth > 20 && newHeight > 20) {
                this.updateSize(newWidth, newHeight);
                this.updatePosition(this.originalX, this.originalY + (this.originalHeight - newHeight));
            }
        } else if (this.resizeDirection === 'bottom-left') {
            let newWidth = this.originalWidth - dx;
            let newHeight = newWidth / ratio;
            
            if (newWidth > 20 && newHeight > 20) {
                this.updateSize(newWidth, newHeight);
                this.updatePosition(this.originalX + dx, this.originalY);
            }
        } else if (this.resizeDirection === 'bottom-right') {
            let newWidth = this.originalWidth + dx;
            let newHeight = newWidth / ratio;
            
            if (newWidth > 20 && newHeight > 20) {
                this.updateSize(newWidth, newHeight);
            }
        }
        
        // Déclencher l'événement de changement
        this.triggerChangeEvent();
    }

    // Retourne les propriétés de l'élément pour la sauvegarde
    toJSON() {
        return {
            ...super.toJSON(),
            src: this.src,
            alt: this.alt,
            originalWidth: this.originalWidth,
            originalHeight: this.originalHeight,
            maintainRatio: this.maintainRatio
        };
    }
}