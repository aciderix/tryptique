/**
 * Classe pour les éléments de texte
 */
class TextElement extends BaseElement {
    constructor(options = {}) {
        super(options);
        this.type = 'text';
        this.text = options.text || 'Double-cliquez pour éditer';
        this.fontFamily = options.fontFamily || 'Arial, sans-serif';
        this.fontSize = options.fontSize || 16;
        this.fontWeight = options.fontWeight || 'normal';
        this.fontStyle = options.fontStyle || 'normal';
        this.textDecoration = options.textDecoration || 'none';
        this.textAlign = options.textAlign || 'left';
        this.color = options.color || '#000000';
        this.isEditing = false;
    }

    // Crée l'élément DOM
    render() {
        // Créer l'élément de base
        super.render();
        
        // Ajouter la classe spécifique
        this.element.classList.add('text-element');
        
        // Définir le style du texte
        Object.assign(this.element.style, {
            fontFamily: this.fontFamily,
            fontSize: `${this.fontSize}px`,
            fontWeight: this.fontWeight,
            fontStyle: this.fontStyle,
            textDecoration: this.textDecoration,
            textAlign: this.textAlign,
            color: this.color,
            padding: '5px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
        });
        
        // Définir le contenu
        this.element.textContent = this.text;
        
        // Ajouter le gestionnaire d'événement pour l'édition
        this.element.addEventListener('dblclick', this.handleDoubleClick.bind(this));
        
        return this.element;
    }

    // Gère le double-clic pour l'édition
    handleDoubleClick(event) {
        event.stopPropagation();
        
        if (this.isEditing) return;
        
        this.isEditing = true;
        
        // Sauvegarder le texte actuel
        const originalText = this.text;
        
        // Créer un champ de texte pour l'édition
        const textarea = createElement('textarea', {
            style: {
                width: '100%',
                height: '100%',
                fontFamily: this.fontFamily,
                fontSize: `${this.fontSize}px`,
                fontWeight: this.fontWeight,
                fontStyle: this.fontStyle,
                textDecoration: this.textDecoration,
                textAlign: this.textAlign,
                color: this.color,
                border: 'none',
                padding: '5px',
                resize: 'none',
                background: 'transparent',
                overflow: 'hidden'
            },
            value: this.text
        });
        
        // Vider l'élément et ajouter le champ de texte
        this.element.textContent = '';
        this.element.appendChild(textarea);
        
        // Sélectionner tout le texte
        textarea.select();
        
        // Gestionnaire pour la fin de l'édition
        const finishEditing = () => {
            this.isEditing = false;
            
            // Récupérer le nouveau texte
            const newText = textarea.value;
            
            // Supprimer le champ de texte
            textarea.remove();
            
            // Mettre à jour le texte
            this.text = newText;
            this.element.textContent = newText;
            
            // Déclencher l'événement de changement si le texte a changé
            if (originalText !== newText) {
                this.triggerChangeEvent();
            }
        };
        
        // Ajouter les gestionnaires d'événements
        textarea.addEventListener('blur', finishEditing);
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                finishEditing();
            }
        });
    }

    // Met à jour le texte
    updateText(text) {
        this.text = text;
        if (!this.isEditing) {
            this.element.textContent = text;
        }
    }

    // Met à jour la police
    updateFont(fontFamily) {
        this.fontFamily = fontFamily;
        this.element.style.fontFamily = fontFamily;
    }

    // Met à jour la taille de la police
    updateFontSize(fontSize) {
        this.fontSize = fontSize;
        this.element.style.fontSize = `${fontSize}px`;
    }

    // Met à jour le style de la police
    updateFontStyle(fontStyle) {
        this.fontStyle = fontStyle;
        this.element.style.fontStyle = fontStyle;
    }

    // Met à jour le poids de la police
    updateFontWeight(fontWeight) {
        this.fontWeight = fontWeight;
        this.element.style.fontWeight = fontWeight;
    }

    // Met à jour la décoration du texte
    updateTextDecoration(textDecoration) {
        this.textDecoration = textDecoration;
        this.element.style.textDecoration = textDecoration;
    }

    // Met à jour l'alignement du texte
    updateTextAlign(textAlign) {
        this.textAlign = textAlign;
        this.element.style.textAlign = textAlign;
    }

    // Met à jour la couleur du texte
    updateColor(color) {
        this.color = color;
        this.element.style.color = color;
    }

    // Retourne les propriétés de l'élément pour la sauvegarde
    toJSON() {
        return {
            ...super.toJSON(),
            text: this.text,
            fontFamily: this.fontFamily,
            fontSize: this.fontSize,
            fontWeight: this.fontWeight,
            fontStyle: this.fontStyle,
            textDecoration: this.textDecoration,
            textAlign: this.textAlign,
            color: this.color
        };
    }
}