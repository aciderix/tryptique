/**
 * Classe pour les éléments de forme
 */
class ShapeElement extends BaseElement {
    constructor(options = {}) {
        super(options);
        this.type = 'shape';
        this.shapeType = options.shapeType || 'rectangle';
        this.fillColor = options.fillColor || '#3498db';
        this.strokeColor = options.strokeColor || '#000000';
        this.strokeWidth = options.strokeWidth || 1;
        this.cornerRadius = options.cornerRadius || 0;
        this.svgElement = null;
    }

    // Crée l'élément DOM
    render() {
        // Créer l'élément de base
        super.render();
        
        // Ajouter la classe spécifique
        this.element.classList.add('shape-element');
        
        // Créer l'élément SVG
        this.svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svgElement.setAttribute('width', '100%');
        this.svgElement.setAttribute('height', '100%');
        this.svgElement.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
        this.svgElement.style.display = 'block';
        
        // Créer la forme
        this.shapeElement = this.createShapeElement();
        this.svgElement.appendChild(this.shapeElement);
        
        // Ajouter le SVG à l'élément
        this.element.appendChild(this.svgElement);
        
        return this.element;
    }

    // Crée l'élément de forme SVG
    createShapeElement() {
        let shape;
        
        switch (this.shapeType) {
            case 'rectangle':
                shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                shape.setAttribute('x', this.strokeWidth / 2);
                shape.setAttribute('y', this.strokeWidth / 2);
                shape.setAttribute('width', this.width - this.strokeWidth);
                shape.setAttribute('height', this.height - this.strokeWidth);
                shape.setAttribute('rx', this.cornerRadius);
                shape.setAttribute('ry', this.cornerRadius);
                break;
                
            case 'ellipse':
                shape = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
                shape.setAttribute('cx', this.width / 2);
                shape.setAttribute('cy', this.height / 2);
                shape.setAttribute('rx', (this.width - this.strokeWidth) / 2);
                shape.setAttribute('ry', (this.height - this.strokeWidth) / 2);
                break;
                
            case 'triangle':
                shape = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                const points = [
                    `${this.width / 2},${this.strokeWidth}`,
                    `${this.width - this.strokeWidth},${this.height - this.strokeWidth}`,
                    `${this.strokeWidth},${this.height - this.strokeWidth}`
                ];
                shape.setAttribute('points', points.join(' '));
                break;
                
            default:
                shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                shape.setAttribute('x', this.strokeWidth / 2);
                shape.setAttribute('y', this.strokeWidth / 2);
                shape.setAttribute('width', this.width - this.strokeWidth);
                shape.setAttribute('height', this.height - this.strokeWidth);
        }
        
        // Définir les attributs communs
        shape.setAttribute('fill', this.fillColor);
        shape.setAttribute('stroke', this.strokeColor);
        shape.setAttribute('stroke-width', this.strokeWidth);
        
        return shape;
    }

    // Met à jour la forme
    updateShape() {
        // Supprimer l'ancienne forme
        if (this.shapeElement && this.shapeElement.parentNode) {
            this.shapeElement.parentNode.removeChild(this.shapeElement);
        }
        
        // Créer une nouvelle forme
        this.shapeElement = this.createShapeElement();
        this.svgElement.appendChild(this.shapeElement);
        
        // Mettre à jour le viewBox
        this.svgElement.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
    }

    // Met à jour le type de forme
    updateShapeType(shapeType) {
        this.shapeType = shapeType;
        this.updateShape();
    }

    // Met à jour la couleur de remplissage
    updateFillColor(fillColor) {
        this.fillColor = fillColor;
        this.shapeElement.setAttribute('fill', fillColor);
    }

    // Met à jour la couleur de bordure
    updateStrokeColor(strokeColor) {
        this.strokeColor = strokeColor;
        this.shapeElement.setAttribute('stroke', strokeColor);
    }

    // Met à jour l'épaisseur de bordure
    updateStrokeWidth(strokeWidth) {
        this.strokeWidth = strokeWidth;
        this.shapeElement.setAttribute('stroke-width', strokeWidth);
        this.updateShape(); // Recréer la forme pour ajuster les dimensions
    }

    // Met à jour le rayon des coins (pour les rectangles)
    updateCornerRadius(cornerRadius) {
        this.cornerRadius = cornerRadius;
        if (this.shapeType === 'rectangle') {
            this.shapeElement.setAttribute('rx', cornerRadius);
            this.shapeElement.setAttribute('ry', cornerRadius);
        }
    }

    // Redéfinit la méthode de mise à jour des dimensions
    updateSize(width, height) {
        super.updateSize(width, height);
        this.updateShape();
    }

    // Retourne les propriétés de l'élément pour la sauvegarde
    toJSON() {
        return {
            ...super.toJSON(),
            shapeType: this.shapeType,
            fillColor: this.fillColor,
            strokeColor: this.strokeColor,
            strokeWidth: this.strokeWidth,
            cornerRadius: this.cornerRadius
        };
    }
}