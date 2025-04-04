/**
 * Gestion du panneau des calques
 */
class LayersPanel {
    constructor(model) {
        this.model = model;
        this.panel = document.getElementById('layers-panel');
        this.layersList = document.getElementById('layers-list');
        this.addLayerBtn = document.getElementById('add-layer-btn');
        this.deleteLayerBtn = document.getElementById('delete-layer-btn');
        
        this.init();
    }

    // Initialise le panneau
    init() {
        // Ajouter les écouteurs d'événements
        this.addEventListeners();
        
        // S'abonner aux événements du modèle
        this.model.addEventListener('element:added', this.handleElementAdded.bind(this));
        this.model.addEventListener('element:removed', this.handleElementRemoved.bind(this));
        this.model.addEventListener('element:selected', this.handleElementSelected.bind(this));
        this.model.addEventListener('element:deselected', this.handleElementDeselected.bind(this));
        this.model.addEventListener('element:changed', this.handleElementChanged.bind(this));
        this.model.addEventListener('model:changed', this.handleModelChanged.bind(this));
    }

    // Ajoute les écouteurs d'événements
    addEventListeners() {
        // Bouton d'ajout de calque
        this.addLayerBtn.addEventListener('click', this.handleAddLayer.bind(this));
        
        // Bouton de suppression de calque
        this.deleteLayerBtn.addEventListener('click', this.handleDeleteLayer.bind(this));
    }

    // Met à jour la liste des calques
    updateLayersList() {
        // Vider la liste
        this.layersList.innerHTML = '';
        
        // Récupérer tous les éléments
        const elements = this.model.getAllElements();
        
        // Trier les éléments par ordre Z (du plus haut au plus bas)
        elements.sort((a, b) => b.zIndex - a.zIndex);
        
        // Ajouter chaque élément à la liste
        for (const element of elements) {
            const layerItem = this.createLayerItem(element);
            this.layersList.appendChild(layerItem);
        }
    }

    // Crée un élément de la liste des calques
    createLayerItem(element) {
        // Déterminer l'icône en fonction du type d'élément
        let icon;
        let name;
        
        switch (element.type) {
            case 'text':
                icon = 'fas fa-font';
                name = `Texte: ${element.text.substring(0, 20)}${element.text.length > 20 ? '...' : ''}`;
                break;
                
            case 'image':
                icon = 'fas fa-image';
                name = 'Image';
                break;
                
            case 'shape':
                icon = 'fas fa-shapes';
                name = `Forme: ${element.shapeType}`;
                break;
                
            default:
                icon = 'fas fa-object-group';
                name = 'Élément';
        }
        
        // Créer l'élément de la liste
        const layerItem = createElement('li', {
            classList: ['layer-item'],
            'data-id': element.id,
            onclick: this.handleLayerClick.bind(this, element.id)
        });
        
        // Ajouter la classe 'selected' si l'élément est sélectionné
        if (element.isSelected) {
            layerItem.classList.add('selected');
        }
        
        // Ajouter l'icône
        const layerIcon = createElement('span', {
            classList: ['layer-icon', icon.split(' ')[0], icon.split(' ')[1]]
        });
        
        // Ajouter le nom
        const layerName = createElement('span', {
            classList: ['layer-name']
        }, [name]);
        
        // Ajouter le bouton de visibilité
        const layerVisibility = createElement('span', {
            classList: ['layer-visibility', 'fas', 'fa-eye'],
            onclick: (e) => {
                e.stopPropagation();
                this.toggleLayerVisibility(element.id);
            }
        });
        
        // Ajouter les éléments à l'élément de la liste
        layerItem.appendChild(layerIcon);
        layerItem.appendChild(layerName);
        layerItem.appendChild(layerVisibility);
        
        return layerItem;
    }

    // Gère le clic sur un calque
    handleLayerClick(elementId, event) {
        // Récupérer l'élément
        const element = this.model.getElementById(elementId);
        
        if (element) {
            // Sélectionner l'élément
            this.model.selectElement(element);
        }
    }

    // Bascule la visibilité d'un calque
    toggleLayerVisibility(elementId) {
        // Récupérer l'élément
        const element = this.model.getElementById(elementId);
        
        if (element) {
            // Basculer la visibilité
            const newOpacity = element.opacity === 0 ? 1 : 0;
            this.model.updateElement(elementId, { opacity: newOpacity });
            
            // Mettre à jour l'icône de visibilité
            const layerItem = this.layersList.querySelector(`[data-id="${elementId}"]`);
            if (layerItem) {
                const visibilityIcon = layerItem.querySelector('.layer-visibility');
                visibilityIcon.classList.toggle('fa-eye', newOpacity > 0);
                visibilityIcon.classList.toggle('fa-eye-slash', newOpacity === 0);
                visibilityIcon.classList.toggle('hidden', newOpacity === 0);
            }
        }
    }

    // Gère l'ajout d'un calque
    handleAddLayer() {
        // Ouvrir un menu pour choisir le type d'élément à ajouter
        const menu = createElement('div', {
            classList: ['layer-add-menu'],
            style: {
                position: 'absolute',
                top: `${this.addLayerBtn.getBoundingClientRect().bottom}px`,
                left: `${this.addLayerBtn.getBoundingClientRect().left}px`,
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                zIndex: 100
            }
        });
        
        // Ajouter les options
        const addTextOption = createElement('div', {
            classList: ['layer-add-option'],
            style: {
                padding: '8px 12px',
                cursor: 'pointer'
            },
            onclick: () => {
                // Ajouter un élément de texte
                const element = new TextElement();
                this.model.addElement(element);
                
                // Fermer le menu
                menu.remove();
            }
        }, ['Texte']);
        
        const addImageOption = createElement('div', {
            classList: ['layer-add-option'],
            style: {
                padding: '8px 12px',
                cursor: 'pointer'
            },
            onclick: () => {
                // Ouvrir la boîte de dialogue pour sélectionner une image
                const input = createElement('input', {
                    type: 'file',
                    accept: 'image/*',
                    style: { display: 'none' }
                });
                
                input.addEventListener('change', async (event) => {
                    if (event.target.files && event.target.files[0]) {
                        const file = event.target.files[0];
                        
                        // Ajouter un élément d'image
                        const element = new ImageElement();
                        this.model.addElement(element);
                        
                        // Charger l'image
                        await element.loadImage(file);
                    }
                    
                    // Supprimer l'élément input
                    input.remove();
                });
                
                // Ajouter l'élément au DOM et déclencher le clic
                document.body.appendChild(input);
                input.click();
                
                // Fermer le menu
                menu.remove();
            }
        }, ['Image']);
        
        const addShapeOption = createElement('div', {
            classList: ['layer-add-option'],
            style: {
                padding: '8px 12px',
                cursor: 'pointer'
            },
            onclick: () => {
                // Ajouter un élément de forme
                const element = new ShapeElement();
                this.model.addElement(element);
                
                // Fermer le menu
                menu.remove();
            }
        }, ['Forme']);
        
        // Ajouter les options au menu
        menu.appendChild(addTextOption);
        menu.appendChild(addImageOption);
        menu.appendChild(addShapeOption);
        
        // Ajouter le menu au DOM
        document.body.appendChild(menu);
        
        // Fermer le menu si on clique ailleurs
        const closeMenu = (event) => {
            if (!menu.contains(event.target) && event.target !== this.addLayerBtn) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        
        // Ajouter l'écouteur d'événement avec un délai pour éviter de fermer immédiatement
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 0);
    }

    // Gère la suppression d'un calque
    handleDeleteLayer() {
        const selectedElement = this.model.getSelectedElement();
        
        if (selectedElement) {
            this.model.removeElement(selectedElement.id);
        }
    }

    // Gère l'ajout d'un élément
    handleElementAdded() {
        this.updateLayersList();
    }

    // Gère la suppression d'un élément
    handleElementRemoved() {
        this.updateLayersList();
    }

    // Gère la sélection d'un élément
    handleElementSelected(data) {
        // Mettre à jour la liste des calques
        this.updateLayersList();
    }

    // Gère la désélection d'un élément
    handleElementDeselected() {
        // Mettre à jour la liste des calques
        this.updateLayersList();
    }

    // Gère le changement d'un élément
    handleElementChanged() {
        // Mettre à jour la liste des calques
        this.updateLayersList();
    }

    // Gère les changements du modèle
    handleModelChanged() {
        // Mettre à jour la liste des calques
        this.updateLayersList();
    }
}