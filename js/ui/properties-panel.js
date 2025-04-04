/**
 * Gestion du panneau des propriétés
 */
class PropertiesPanel {
    constructor(model) {
        this.model = model;
        this.panel = document.getElementById('properties-panel');
        this.generalProperties = document.getElementById('general-properties');
        this.textProperties = document.getElementById('text-properties');
        this.imageProperties = document.getElementById('image-properties');
        this.shapeProperties = document.getElementById('shape-properties');
        
        // Propriétés générales
        this.posXInput = document.getElementById('pos-x');
        this.posYInput = document.getElementById('pos-y');
        this.widthInput = document.getElementById('width');
        this.heightInput = document.getElementById('height');
        this.rotationInput = document.getElementById('rotation');
        this.opacityInput = document.getElementById('opacity');
        this.opacityValue = document.getElementById('opacity-value');
        
        // Propriétés de texte
        this.textContentInput = document.getElementById('text-content');
        this.fontFamilySelect = document.getElementById('font-family');
        this.fontSizeInput = document.getElementById('font-size');
        this.boldBtn = document.getElementById('bold-btn');
        this.italicBtn = document.getElementById('italic-btn');
        this.underlineBtn = document.getElementById('underline-btn');
        this.textAlignLeftBtn = document.getElementById('text-align-left');
        this.textAlignCenterBtn = document.getElementById('text-align-center');
        this.textAlignRightBtn = document.getElementById('text-align-right');
        this.textAlignJustifyBtn = document.getElementById('text-align-justify');
        this.textColorInput = document.getElementById('text-color');
        
        // Propriétés d'image
        this.imageSrcInput = document.getElementById('image-src');
        this.imagePreview = document.getElementById('image-preview');
        this.changeImageBtn = document.getElementById('change-image-btn');
        this.maintainRatioCheckbox = document.getElementById('maintain-ratio');
        
        // Propriétés de forme
        this.shapeTypeSelect = document.getElementById('shape-type');
        this.fillColorInput = document.getElementById('fill-color');
        this.strokeColorInput = document.getElementById('stroke-color');
        this.strokeWidthInput = document.getElementById('stroke-width');
        this.cornerRadiusInput = document.getElementById('corner-radius');
        
        this.init();
    }

    // Initialise le panneau
    init() {
        // Masquer tous les panneaux de propriétés spécifiques
        this.hideAllPropertyGroups();
        
        // Ajouter les écouteurs d'événements
        this.addEventListeners();
        
        // S'abonner aux événements du modèle
        this.model.addEventListener('element:selected', this.handleElementSelected.bind(this));
        this.model.addEventListener('element:deselected', this.handleElementDeselected.bind(this));
        this.model.addEventListener('element:changed', this.handleElementChanged.bind(this));
    }

    // Masque tous les panneaux de propriétés spécifiques
    hideAllPropertyGroups() {
        this.textProperties.style.display = 'none';
        this.imageProperties.style.display = 'none';
        this.shapeProperties.style.display = 'none';
    }

    // Ajoute les écouteurs d'événements
    addEventListeners() {
        // Propriétés générales
        this.posXInput.addEventListener('change', () => this.updateGeneralProperty('x', parseInt(this.posXInput.value)));
        this.posYInput.addEventListener('change', () => this.updateGeneralProperty('y', parseInt(this.posYInput.value)));
        this.widthInput.addEventListener('change', () => this.updateGeneralProperty('width', parseInt(this.widthInput.value)));
        this.heightInput.addEventListener('change', () => this.updateGeneralProperty('height', parseInt(this.heightInput.value)));
        this.rotationInput.addEventListener('change', () => this.updateGeneralProperty('rotation', parseInt(this.rotationInput.value)));
        this.opacityInput.addEventListener('input', () => {
            const opacity = parseInt(this.opacityInput.value) / 100;
            this.opacityValue.textContent = `${this.opacityInput.value}%`;
            this.updateGeneralProperty('opacity', opacity);
        });
        
        // Propriétés de texte
        this.textContentInput.addEventListener('input', () => this.updateTextProperty('text', this.textContentInput.value));
        this.fontFamilySelect.addEventListener('change', () => this.updateTextProperty('fontFamily', this.fontFamilySelect.value));
        this.fontSizeInput.addEventListener('change', () => this.updateTextProperty('fontSize', parseInt(this.fontSizeInput.value)));
        this.boldBtn.addEventListener('click', () => this.toggleTextStyle('fontWeight', 'bold', 'normal'));
        this.italicBtn.addEventListener('click', () => this.toggleTextStyle('fontStyle', 'italic', 'normal'));
        this.underlineBtn.addEventListener('click', () => this.toggleTextStyle('textDecoration', 'underline', 'none'));
        this.textAlignLeftBtn.addEventListener('click', () => this.updateTextProperty('textAlign', 'left'));
        this.textAlignCenterBtn.addEventListener('click', () => this.updateTextProperty('textAlign', 'center'));
        this.textAlignRightBtn.addEventListener('click', () => this.updateTextProperty('textAlign', 'right'));
        this.textAlignJustifyBtn.addEventListener('click', () => this.updateTextProperty('textAlign', 'justify'));
        this.textColorInput.addEventListener('input', () => this.updateTextProperty('color', this.textColorInput.value));
        
        // Propriétés d'image
        this.changeImageBtn.addEventListener('click', this.handleChangeImage.bind(this));
        this.maintainRatioCheckbox.addEventListener('change', () => this.updateImageProperty('maintainRatio', this.maintainRatioCheckbox.checked));
        
        // Propriétés de forme
        this.shapeTypeSelect.addEventListener('change', () => this.updateShapeProperty('shapeType', this.shapeTypeSelect.value));
        this.fillColorInput.addEventListener('input', () => this.updateShapeProperty('fillColor', this.fillColorInput.value));
        this.strokeColorInput.addEventListener('input', () => this.updateShapeProperty('strokeColor', this.strokeColorInput.value));
        this.strokeWidthInput.addEventListener('change', () => this.updateShapeProperty('strokeWidth', parseInt(this.strokeWidthInput.value)));
        this.cornerRadiusInput.addEventListener('change', () => this.updateShapeProperty('cornerRadius', parseInt(this.cornerRadiusInput.value)));
    }

    // Met à jour une propriété générale
    updateGeneralProperty(property, value) {
        const element = this.model.getSelectedElement();
        if (!element) return;
        
        const properties = {};
        properties[property] = value;
        this.model.updateElement(element.id, properties);
    }

    // Met à jour une propriété de texte
    updateTextProperty(property, value) {
        const element = this.model.getSelectedElement();
        if (!element || element.type !== 'text') return;
        
        const properties = {};
        properties[property] = value;
        this.model.updateElement(element.id, properties);
        
        // Mettre à jour l'état des boutons de style
        this.updateTextStyleButtons();
    }

    // Met à jour une propriété d'image
    updateImageProperty(property, value) {
        const element = this.model.getSelectedElement();
        if (!element || element.type !== 'image') return;
        
        const properties = {};
        properties[property] = value;
        this.model.updateElement(element.id, properties);
    }

    // Met à jour une propriété de forme
    updateShapeProperty(property, value) {
        const element = this.model.getSelectedElement();
        if (!element || element.type !== 'shape') return;
        
        const properties = {};
        properties[property] = value;
        this.model.updateElement(element.id, properties);
    }

    // Bascule un style de texte
    toggleTextStyle(property, value, defaultValue) {
        const element = this.model.getSelectedElement();
        if (!element || element.type !== 'text') return;
        
        const newValue = element[property] === value ? defaultValue : value;
        
        const properties = {};
        properties[property] = newValue;
        this.model.updateElement(element.id, properties);
        
        // Mettre à jour l'état des boutons de style
        this.updateTextStyleButtons();
    }

    // Met à jour l'état des boutons de style de texte
    updateTextStyleButtons() {
        const element = this.model.getSelectedElement();
        if (!element || element.type !== 'text') return;
        
        // Mettre à jour l'état des boutons de style
        this.boldBtn.classList.toggle('active', element.fontWeight === 'bold');
        this.italicBtn.classList.toggle('active', element.fontStyle === 'italic');
        this.underlineBtn.classList.toggle('active', element.textDecoration === 'underline');
        
        // Mettre à jour l'état des boutons d'alignement
        this.textAlignLeftBtn.classList.toggle('active', element.textAlign === 'left');
        this.textAlignCenterBtn.classList.toggle('active', element.textAlign === 'center');
        this.textAlignRightBtn.classList.toggle('active', element.textAlign === 'right');
        this.textAlignJustifyBtn.classList.toggle('active', element.textAlign === 'justify');
    }

    // Gère le changement d'image
    handleChangeImage() {
        // Ouvrir la boîte de dialogue pour sélectionner une image
        const input = createElement('input', {
            type: 'file',
            accept: 'image/*',
            style: { display: 'none' }
        });
        
        input.addEventListener('change', async (event) => {
            if (event.target.files && event.target.files[0]) {
                const file = event.target.files[0];
                const element = this.model.getSelectedElement();
                
                if (element && element.type === 'image') {
                    await element.loadImage(file);
                    this.updateImagePreview(element.src);
                    this.imageSrcInput.value = file.name;
                }
            }
            
            // Supprimer l'élément input
            input.remove();
        });
        
        // Ajouter l'élément au DOM et déclencher le clic
        document.body.appendChild(input);
        input.click();
    }

    // Met à jour l'aperçu de l'image
    updateImagePreview(src) {
        this.imagePreview.innerHTML = '';
        
        if (src) {
            const img = createElement('img', {
                src: src,
                alt: 'Aperçu',
                style: {
                    maxWidth: '100%',
                    maxHeight: '100%'
                }
            });
            
            this.imagePreview.appendChild(img);
        }
    }

    // Gère la sélection d'un élément
    handleElementSelected(data) {
        const { element } = data;
        
        // Afficher les propriétés générales
        this.generalProperties.style.display = 'block';
        
        // Mettre à jour les propriétés générales
        this.posXInput.value = Math.round(element.x);
        this.posYInput.value = Math.round(element.y);
        this.widthInput.value = Math.round(element.width);
        this.heightInput.value = Math.round(element.height);
        this.rotationInput.value = Math.round(element.rotation);
        this.opacityInput.value = Math.round(element.opacity * 100);
        this.opacityValue.textContent = `${Math.round(element.opacity * 100)}%`;
        
        // Masquer tous les panneaux de propriétés spécifiques
        this.hideAllPropertyGroups();
        
        // Afficher les propriétés spécifiques en fonction du type d'élément
        switch (element.type) {
            case 'text':
                this.textProperties.style.display = 'block';
                this.updateTextProperties(element);
                break;
                
            case 'image':
                this.imageProperties.style.display = 'block';
                this.updateImageProperties(element);
                break;
                
            case 'shape':
                this.shapeProperties.style.display = 'block';
                this.updateShapeProperties(element);
                break;
        }
    }

    // Met à jour les propriétés de texte
    updateTextProperties(element) {
        this.textContentInput.value = element.text;
        this.fontFamilySelect.value = element.fontFamily;
        this.fontSizeInput.value = element.fontSize;
        this.textColorInput.value = element.color;
        
        // Mettre à jour l'état des boutons de style
        this.updateTextStyleButtons();
    }

    // Met à jour les propriétés d'image
    updateImageProperties(element) {
        this.imageSrcInput.value = element.src.substring(element.src.lastIndexOf('/') + 1);
        this.updateImagePreview(element.src);
        this.maintainRatioCheckbox.checked = element.maintainRatio;
    }

    // Met à jour les propriétés de forme
    updateShapeProperties(element) {
        this.shapeTypeSelect.value = element.shapeType;
        this.fillColorInput.value = element.fillColor;
        this.strokeColorInput.value = element.strokeColor;
        this.strokeWidthInput.value = element.strokeWidth;
        this.cornerRadiusInput.value = element.cornerRadius;
    }

    // Gère la désélection d'un élément
    handleElementDeselected() {
        // Masquer tous les panneaux de propriétés
        this.hideAllPropertyGroups();
        this.generalProperties.style.display = 'none';
    }

    // Gère le changement d'un élément
    handleElementChanged(data) {
        const { element } = data;
        
        // Mettre à jour les propriétés générales
        this.posXInput.value = Math.round(element.x);
        this.posYInput.value = Math.round(element.y);
        this.widthInput.value = Math.round(element.width);
        this.heightInput.value = Math.round(element.height);
        this.rotationInput.value = Math.round(element.rotation);
        this.opacityInput.value = Math.round(element.opacity * 100);
        this.opacityValue.textContent = `${Math.round(element.opacity * 100)}%`;
        
        // Mettre à jour les propriétés spécifiques en fonction du type d'élément
        switch (element.type) {
            case 'text':
                this.updateTextProperties(element);
                break;
                
            case 'image':
                this.updateImageProperties(element);
                break;
                
            case 'shape':
                this.updateShapeProperties(element);
                break;
        }
    }
}