/**
 * Gestion du canvas (zone de travail)
 */
class CanvasManager {
    constructor(model) {
        this.model = model;
        this.canvasWrapper = document.getElementById('canvas-wrapper');
        this.canvas = document.getElementById('tryptique-canvas');
        this.panels = {
            left: document.getElementById('panel-left'),
            center: document.getElementById('panel-center'),
            right: document.getElementById('panel-right')
        };
        this.zoomLevel = 1;
        this.zoomLevelDisplay = document.getElementById('zoom-level');
        
        this.init();
    }

    // Initialise le canvas
    init() {
        // Définir les dimensions du triptyque
        this.updateCanvasSize();
        
        // Ajouter les écouteurs d'événements
        this.addEventListeners();
        
        // S'abonner aux événements du modèle
        this.model.addEventListener('element:added', this.handleElementAdded.bind(this));
        this.model.addEventListener('element:removed', this.handleElementRemoved.bind(this));
        this.model.addEventListener('model:changed', this.handleModelChanged.bind(this));
    }

    // Met à jour les dimensions du canvas
    updateCanvasSize() {
        // Convertir les dimensions en pixels
        const width = mmToPx(this.model.width);
        const height = mmToPx(this.model.height);
        
        // Définir les dimensions du triptyque
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        
        // Définir les dimensions des panneaux
        const panelWidth = width / 3;
        for (const panel of Object.values(this.panels)) {
            panel.style.width = `${panelWidth}px`;
            panel.style.height = `${height}px`;
        }
    }

    // Ajoute les écouteurs d'événements
    addEventListeners() {
        // Clic sur le canvas pour désélectionner
        this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
        
        // Zoom avec la molette de la souris
        this.canvasWrapper.addEventListener('wheel', this.handleWheel.bind(this));
        
        // Écouteurs pour les éléments
        this.canvas.addEventListener('element:select', this.handleElementSelect.bind(this));
        this.canvas.addEventListener('element:change', this.handleElementChange.bind(this));
        this.canvas.addEventListener('element:changeend', this.handleElementChangeEnd.bind(this));
    }

    // Gère le clic sur le canvas
    handleCanvasClick(event) {
        // Si on clique directement sur le canvas ou un panneau, désélectionner
        if (event.target === this.canvas || 
            event.target === this.panels.left || 
            event.target === this.panels.center || 
            event.target === this.panels.right) {
            this.model.deselectElement();
        }
    }

    // Gère le zoom avec la molette de la souris
    handleWheel(event) {
        if (event.ctrlKey) {
            event.preventDefault();
            
            // Facteur de zoom
            const factor = event.deltaY > 0 ? 0.9 : 1.1;
            
            // Appliquer le zoom
            this.setZoom(this.zoomLevel * factor);
        }
    }

    // Définit le niveau de zoom
    setZoom(level) {
        // Limiter le zoom entre 10% et 500%
        this.zoomLevel = clamp(level, 0.1, 5);
        
        // Appliquer le zoom
        this.canvas.style.transform = `scale(${this.zoomLevel})`;
        
        // Mettre à jour l'affichage du niveau de zoom
        this.zoomLevelDisplay.textContent = `${Math.round(this.zoomLevel * 100)}%`;
    }

    // Réinitialise le zoom
    resetZoom() {
        this.setZoom(1);
    }

    // Zoom avant
    zoomIn() {
        this.setZoom(this.zoomLevel * 1.1);
    }

    // Zoom arrière
    zoomOut() {
        this.setZoom(this.zoomLevel * 0.9);
    }

    // Gère l'ajout d'un élément
    handleElementAdded(data) {
        const { element } = data;
        
        // Rendre l'élément
        const domElement = element.render();
        
        // Ajouter l'élément au panneau correspondant
        this.panels[element.panelId.split('-')[1]].appendChild(domElement);
    }

    // Gère la suppression d'un élément
    handleElementRemoved(data) {
        const { element } = data;
        
        // Supprimer l'élément du DOM
        if (element.element && element.element.parentNode) {
            element.element.parentNode.removeChild(element.element);
        }
    }

    // Gère la sélection d'un élément
    handleElementSelect(event) {
        const { element } = event.detail;
        
        // Sélectionner l'élément dans le modèle
        this.model.selectElement(element);
    }

    // Gère le changement d'un élément
    handleElementChange(event) {
        // Pas besoin de faire quoi que ce soit ici, les changements sont appliqués directement à l'élément
    }

    // Gère la fin du changement d'un élément
    handleElementChangeEnd(event) {
        const { element } = event.detail;
        
        // Mettre à jour le modèle
        this.model.updateElement(element.id, {
            x: element.x,
            y: element.y,
            width: element.width,
            height: element.height,
            rotation: element.rotation
        });
    }

    // Gère les changements du modèle
    handleModelChanged() {
        // Mettre à jour les dimensions du canvas
        this.updateCanvasSize();
    }

    // Ajoute un élément de texte
    addTextElement(options = {}) {
        // Déterminer le panneau cible
        const panelId = options.panelId || 'panel-center';
        const panel = this.panels[panelId.split('-')[1]];
        
        // Calculer la position par défaut si non spécifiée
        if (!options.x || !options.y) {
            const rect = panel.getBoundingClientRect();
            const x = options.x || rect.width / 2 - 100;
            const y = options.y || rect.height / 2 - 20;
            options.x = x;
            options.y = y;
        }
        
        // Définir le panneau
        options.panelId = panelId;
        
        // Créer l'élément
        const element = new TextElement(options);
        
        // Ajouter l'élément au modèle
        return this.model.addElement(element);
    }

    // Ajoute un élément d'image
    async addImageElement(source, options = {}) {
        // Déterminer le panneau cible
        const panelId = options.panelId || 'panel-center';
        const panel = this.panels[panelId.split('-')[1]];
        
        // Calculer la position par défaut si non spécifiée
        if (!options.x || !options.y) {
            const rect = panel.getBoundingClientRect();
            const x = options.x || rect.width / 2 - 150;
            const y = options.y || rect.height / 2 - 100;
            options.x = x;
            options.y = y;
        }
        
        // Définir le panneau
        options.panelId = panelId;
        
        // Créer l'élément
        const element = new ImageElement(options);
        
        // Ajouter l'élément au modèle
        this.model.addElement(element);
        
        // Charger l'image
        await element.loadImage(source);
        
        return element;
    }

    // Ajoute un élément de forme
    addShapeElement(options = {}) {
        // Déterminer le panneau cible
        const panelId = options.panelId || 'panel-center';
        const panel = this.panels[panelId.split('-')[1]];
        
        // Calculer la position par défaut si non spécifiée
        if (!options.x || !options.y) {
            const rect = panel.getBoundingClientRect();
            const x = options.x || rect.width / 2 - 50;
            const y = options.y || rect.height / 2 - 50;
            options.x = x;
            options.y = y;
        }
        
        // Définir le panneau
        options.panelId = panelId;
        
        // Créer l'élément
        const element = new ShapeElement(options);
        
        // Ajouter l'élément au modèle
        return this.model.addElement(element);
    }

    // Aligne les éléments sélectionnés
    alignElements(direction) {
        const selectedElement = this.model.getSelectedElement();
        if (!selectedElement) return;
        
        const elements = this.model.getAllElements();
        if (elements.length <= 1) return;
        
        // Récupérer le panneau
        const panel = this.panels[selectedElement.panelId.split('-')[1]];
        const panelRect = panel.getBoundingClientRect();
        
        switch (direction) {
            case 'left':
                // Aligner à gauche
                this.model.updateElement(selectedElement.id, { x: 0 });
                break;
                
            case 'center-h':
                // Centrer horizontalement
                this.model.updateElement(selectedElement.id, { x: (panelRect.width - selectedElement.width) / 2 });
                break;
                
            case 'right':
                // Aligner à droite
                this.model.updateElement(selectedElement.id, { x: panelRect.width - selectedElement.width });
                break;
                
            case 'top':
                // Aligner en haut
                this.model.updateElement(selectedElement.id, { y: 0 });
                break;
                
            case 'center-v':
                // Centrer verticalement
                this.model.updateElement(selectedElement.id, { y: (panelRect.height - selectedElement.height) / 2 });
                break;
                
            case 'bottom':
                // Aligner en bas
                this.model.updateElement(selectedElement.id, { y: panelRect.height - selectedElement.height });
                break;
        }
    }

    // Distribue les éléments sélectionnés
    distributeElements(direction) {
        // TODO: Implémenter la distribution des éléments
    }

    // Prépare le triptyque pour l'impression
    prepareForPrint() {
        // Créer une copie du triptyque pour l'impression
        const printCanvas = this.canvas.cloneNode(true);
        
        // Supprimer les classes et styles de sélection
        const selectedElements = printCanvas.querySelectorAll('.selected');
        for (const element of selectedElements) {
            element.classList.remove('selected');
        }
        
        // Supprimer les poignées de redimensionnement et de rotation
        const handles = printCanvas.querySelectorAll('.resize-handle, .rotate-handle');
        for (const handle of handles) {
            handle.remove();
        }
        
        // Supprimer les étiquettes des panneaux
        const labels = printCanvas.querySelectorAll('.panel-label');
        for (const label of labels) {
            label.remove();
        }
        
        return printCanvas;
    }
}