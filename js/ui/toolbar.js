/**
 * Gestion de la barre d'outils
 */
class ToolbarManager {
    constructor(model, canvasManager) {
        this.model = model;
        this.canvasManager = canvasManager;
        
        // Boutons de fichier
        this.newBtn = document.getElementById('new-btn');
        this.saveBtn = document.getElementById('save-btn');
        this.printBtn = document.getElementById('print-btn');
        
        // Boutons d'historique
        this.undoBtn = document.getElementById('undo-btn');
        this.redoBtn = document.getElementById('redo-btn');
        
        // Boutons d'ajout d'éléments
        this.addTextBtn = document.getElementById('add-text-btn');
        this.addImageBtn = document.getElementById('add-image-btn');
        this.addShapeBtn = document.getElementById('add-shape-btn');
        
        // Boutons d'alignement
        this.alignLeftBtn = document.getElementById('align-left-btn');
        this.alignCenterBtn = document.getElementById('align-center-btn');
        this.alignRightBtn = document.getElementById('align-right-btn');
        this.alignTopBtn = document.getElementById('align-top-btn');
        this.alignMiddleBtn = document.getElementById('align-middle-btn');
        this.alignBottomBtn = document.getElementById('align-bottom-btn');
        
        // Boutons de disposition
        this.bringForwardBtn = document.getElementById('bring-forward-btn');
        this.sendBackwardBtn = document.getElementById('send-backward-btn');
        
        // Bouton de suppression
        this.deleteBtn = document.getElementById('delete-btn');
        
        // Boutons de zoom
        this.zoomInBtn = document.getElementById('zoom-in-btn');
        this.zoomOutBtn = document.getElementById('zoom-out-btn');
        this.zoomResetBtn = document.getElementById('zoom-reset-btn');
        
        this.init();
    }

    // Initialise la barre d'outils
    init() {
        // Ajouter les écouteurs d'événements
        this.addEventListeners();
        
        // S'abonner aux événements du modèle
        this.model.addEventListener('history:changed', this.updateHistoryButtons.bind(this));
        this.model.addEventListener('element:selected', this.updateSelectionButtons.bind(this));
        this.model.addEventListener('element:deselected', this.updateSelectionButtons.bind(this));
        
        // Mettre à jour l'état des boutons
        this.updateHistoryButtons();
        this.updateSelectionButtons();
    }

    // Ajoute les écouteurs d'événements
    addEventListeners() {
        // Boutons de fichier
        this.newBtn.addEventListener('click', this.handleNew.bind(this));
        this.saveBtn.addEventListener('click', this.handleSave.bind(this));
        this.printBtn.addEventListener('click', this.handlePrint.bind(this));
        
        // Boutons d'historique
        this.undoBtn.addEventListener('click', this.handleUndo.bind(this));
        this.redoBtn.addEventListener('click', this.handleRedo.bind(this));
        
        // Boutons d'ajout d'éléments
        this.addTextBtn.addEventListener('click', this.handleAddText.bind(this));
        this.addImageBtn.addEventListener('click', this.handleAddImage.bind(this));
        this.addShapeBtn.addEventListener('click', this.handleAddShape.bind(this));
        
        // Boutons d'alignement
        this.alignLeftBtn.addEventListener('click', () => this.canvasManager.alignElements('left'));
        this.alignCenterBtn.addEventListener('click', () => this.canvasManager.alignElements('center-h'));
        this.alignRightBtn.addEventListener('click', () => this.canvasManager.alignElements('right'));
        this.alignTopBtn.addEventListener('click', () => this.canvasManager.alignElements('top'));
        this.alignMiddleBtn.addEventListener('click', () => this.canvasManager.alignElements('center-v'));
        this.alignBottomBtn.addEventListener('click', () => this.canvasManager.alignElements('bottom'));
        
        // Boutons de disposition
        this.bringForwardBtn.addEventListener('click', this.handleBringForward.bind(this));
        this.sendBackwardBtn.addEventListener('click', this.handleSendBackward.bind(this));
        
        // Bouton de suppression
        this.deleteBtn.addEventListener('click', this.handleDelete.bind(this));
        
        // Boutons de zoom
        this.zoomInBtn.addEventListener('click', () => this.canvasManager.zoomIn());
        this.zoomOutBtn.addEventListener('click', () => this.canvasManager.zoomOut());
        this.zoomResetBtn.addEventListener('click', () => this.canvasManager.resetZoom());
    }

    // Met à jour l'état des boutons d'historique
    updateHistoryButtons() {
        this.undoBtn.classList.toggle('active', this.model.historyIndex >= 0);
        this.redoBtn.classList.toggle('active', this.model.historyIndex < this.model.history.length - 1);
    }

    // Met à jour l'état des boutons liés à la sélection
    updateSelectionButtons() {
        const hasSelection = this.model.getSelectedElement() !== null;
        
        // Activer/désactiver les boutons qui nécessitent une sélection
        const selectionButtons = [
            this.alignLeftBtn, this.alignCenterBtn, this.alignRightBtn,
            this.alignTopBtn, this.alignMiddleBtn, this.alignBottomBtn,
            this.bringForwardBtn, this.sendBackwardBtn, this.deleteBtn
        ];
        
        for (const button of selectionButtons) {
            button.disabled = !hasSelection;
            button.classList.toggle('disabled', !hasSelection);
        }
    }

    // Gère le clic sur le bouton Nouveau
    handleNew() {
        if (this.model.modified) {
            if (confirm('Voulez-vous enregistrer les modifications avant de créer un nouveau triptyque ?')) {
                this.handleSave();
            }
        }
        
        this.model.clearElements();
        this.model.projectName = 'Nouveau triptyque';
    }

    // Gère le clic sur le bouton Enregistrer
    handleSave() {
        // Ouvrir la boîte de dialogue d'enregistrement
        const saveModal = document.getElementById('save-modal');
        const projectNameInput = document.getElementById('project-name');
        const saveConfirmBtn = document.getElementById('save-confirm-btn');
        const cancelSaveBtn = document.getElementById('cancel-save-btn');
        const modalOverlay = document.getElementById('modal-overlay');
        
        // Définir le nom du projet
        projectNameInput.value = this.model.projectName;
        
        // Afficher la boîte de dialogue
        modalOverlay.classList.remove('hidden');
        saveModal.classList.remove('hidden');
        
        // Gérer le clic sur le bouton Enregistrer
        const handleSaveConfirm = () => {
            // Récupérer le nom du projet
            this.model.projectName = projectNameInput.value;
            
            // Enregistrer le projet
            const data = this.model.save();
            
            // Télécharger le fichier
            downloadFile(JSON.stringify(data), `${this.model.projectName}.json`, 'application/json');
            
            // Fermer la boîte de dialogue
            modalOverlay.classList.add('hidden');
            saveModal.classList.add('hidden');
            
            // Supprimer les écouteurs d'événements
            saveConfirmBtn.removeEventListener('click', handleSaveConfirm);
            cancelSaveBtn.removeEventListener('click', handleSaveCancel);
        };
        
        // Gérer le clic sur le bouton Annuler
        const handleSaveCancel = () => {
            // Fermer la boîte de dialogue
            modalOverlay.classList.add('hidden');
            saveModal.classList.add('hidden');
            
            // Supprimer les écouteurs d'événements
            saveConfirmBtn.removeEventListener('click', handleSaveConfirm);
            cancelSaveBtn.removeEventListener('click', handleSaveCancel);
        };
        
        // Ajouter les écouteurs d'événements
        saveConfirmBtn.addEventListener('click', handleSaveConfirm);
        cancelSaveBtn.addEventListener('click', handleSaveCancel);
    }

    // Gère le clic sur le bouton Imprimer
    handlePrint() {
        // Préparer le triptyque pour l'impression
        const printCanvas = this.canvasManager.prepareForPrint();
        
        // Créer une fenêtre d'impression
        const printWindow = window.open('', '_blank');
        
        // Créer le contenu de la fenêtre d'impression
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Impression - ${this.model.projectName}</title>
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    
                    .print-container {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    
                    @media print {
                        @page {
                            size: A3 landscape;
                            margin: 0;
                        }
                        
                        body {
                            width: 100%;
                            height: 100%;
                        }
                        
                        .print-container {
                            width: 100%;
                            height: 100%;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-container"></div>
                <script>
                    window.onload = function() {
                        window.print();
                        window.setTimeout(function() {
                            window.close();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        
        // Ajouter le triptyque à la fenêtre d'impression
        printWindow.document.querySelector('.print-container').appendChild(printCanvas);
        
        // Fermer le document
        printWindow.document.close();
    }

    // Gère le clic sur le bouton Annuler
    handleUndo() {
        this.model.undo();
    }

    // Gère le clic sur le bouton Rétablir
    handleRedo() {
        this.model.redo();
    }

    // Gère le clic sur le bouton Ajouter du texte
    handleAddText() {
        this.canvasManager.addTextElement();
    }

    // Gère le clic sur le bouton Ajouter une image
    handleAddImage() {
        // Ouvrir la boîte de dialogue pour ajouter une image
        const addImageModal = document.getElementById('add-image-modal');
        const imageUpload = document.getElementById('image-upload');
        const imageUrl = document.getElementById('image-url');
        const uploadPreview = document.getElementById('upload-preview');
        const addImageConfirmBtn = document.getElementById('add-image-confirm-btn');
        const cancelImageBtn = document.getElementById('cancel-image-btn');
        const modalOverlay = document.getElementById('modal-overlay');
        
        // Réinitialiser les champs
        imageUpload.value = '';
        imageUrl.value = '';
        uploadPreview.innerHTML = '';
        
        // Afficher la boîte de dialogue
        modalOverlay.classList.remove('hidden');
        addImageModal.classList.remove('hidden');
        
        // Gérer le changement de fichier
        const handleFileChange = (event) => {
            if (event.target.files && event.target.files[0]) {
                const file = event.target.files[0];
                
                // Afficher l'aperçu
                const reader = new FileReader();
                reader.onload = (e) => {
                    uploadPreview.innerHTML = '';
                    const img = createElement('img', {
                        src: e.target.result,
                        alt: 'Aperçu'
                    });
                    uploadPreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        };
        
        // Gérer le changement d'URL
        const handleUrlChange = () => {
            if (imageUrl.value) {
                // Afficher l'aperçu
                uploadPreview.innerHTML = '';
                const img = createElement('img', {
                    src: imageUrl.value,
                    alt: 'Aperçu',
                    onerror: () => {
                        uploadPreview.innerHTML = 'Erreur de chargement de l\'image';
                    }
                });
                uploadPreview.appendChild(img);
            }
        };
        
        // Gérer le clic sur le bouton Ajouter
        const handleAddImageConfirm = async () => {
            let source;
            
            if (imageUpload.files && imageUpload.files[0]) {
                source = imageUpload.files[0];
            } else if (imageUrl.value) {
                source = imageUrl.value;
            } else {
                alert('Veuillez sélectionner une image ou saisir une URL');
                return;
            }
            
            // Ajouter l'image
            await this.canvasManager.addImageElement(source);
            
            // Fermer la boîte de dialogue
            modalOverlay.classList.add('hidden');
            addImageModal.classList.add('hidden');
            
            // Supprimer les écouteurs d'événements
            imageUpload.removeEventListener('change', handleFileChange);
            imageUrl.removeEventListener('input', handleUrlChange);
            addImageConfirmBtn.removeEventListener('click', handleAddImageConfirm);
            cancelImageBtn.removeEventListener('click', handleCancelImage);
        };
        
        // Gérer le clic sur le bouton Annuler
        const handleCancelImage = () => {
            // Fermer la boîte de dialogue
            modalOverlay.classList.add('hidden');
            addImageModal.classList.add('hidden');
            
            // Supprimer les écouteurs d'événements
            imageUpload.removeEventListener('change', handleFileChange);
            imageUrl.removeEventListener('input', handleUrlChange);
            addImageConfirmBtn.removeEventListener('click', handleAddImageConfirm);
            cancelImageBtn.removeEventListener('click', handleCancelImage);
        };
        
        // Ajouter les écouteurs d'événements
        imageUpload.addEventListener('change', handleFileChange);
        imageUrl.addEventListener('input', handleUrlChange);
        addImageConfirmBtn.addEventListener('click', handleAddImageConfirm);
        cancelImageBtn.addEventListener('click', handleCancelImage);
    }

    // Gère le clic sur le bouton Ajouter une forme
    handleAddShape() {
        // Ouvrir un menu pour choisir le type de forme
        const menu = createElement('div', {
            classList: ['shape-menu'],
            style: {
                position: 'absolute',
                top: `${this.addShapeBtn.getBoundingClientRect().bottom}px`,
                left: `${this.addShapeBtn.getBoundingClientRect().left}px`,
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                zIndex: 100
            }
        });
        
        // Ajouter les options
        const addRectangleOption = createElement('div', {
            classList: ['shape-option'],
            style: {
                padding: '8px 12px',
                cursor: 'pointer'
            },
            onclick: () => {
                // Ajouter un rectangle
                this.canvasManager.addShapeElement({ shapeType: 'rectangle' });
                
                // Fermer le menu
                menu.remove();
            }
        }, ['Rectangle']);
        
        const addEllipseOption = createElement('div', {
            classList: ['shape-option'],
            style: {
                padding: '8px 12px',
                cursor: 'pointer'
            },
            onclick: () => {
                // Ajouter une ellipse
                this.canvasManager.addShapeElement({ shapeType: 'ellipse' });
                
                // Fermer le menu
                menu.remove();
            }
        }, ['Ellipse']);
        
        const addTriangleOption = createElement('div', {
            classList: ['shape-option'],
            style: {
                padding: '8px 12px',
                cursor: 'pointer'
            },
            onclick: () => {
                // Ajouter un triangle
                this.canvasManager.addShapeElement({ shapeType: 'triangle' });
                
                // Fermer le menu
                menu.remove();
            }
        }, ['Triangle']);
        
        // Ajouter les options au menu
        menu.appendChild(addRectangleOption);
        menu.appendChild(addEllipseOption);
        menu.appendChild(addTriangleOption);
        
        // Ajouter le menu au DOM
        document.body.appendChild(menu);
        
        // Fermer le menu si on clique ailleurs
        const closeMenu = (event) => {
            if (!menu.contains(event.target) && event.target !== this.addShapeBtn) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        
        // Ajouter l'écouteur d'événement avec un délai pour éviter de fermer immédiatement
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 0);
    }

    // Gère le clic sur le bouton Mettre au premier plan
    handleBringForward() {
        const selectedElement = this.model.getSelectedElement();
        
        if (selectedElement) {
            // Trouver l'ordre Z le plus élevé
            const elements = this.model.getAllElements();
            const maxZIndex = Math.max(...elements.map(el => el.zIndex));
            
            // Mettre à jour l'ordre Z
            this.model.updateElement(selectedElement.id, { zIndex: maxZIndex + 1 });
        }
    }

    // Gère le clic sur le bouton Mettre en arrière-plan
    handleSendBackward() {
        const selectedElement = this.model.getSelectedElement();
        
        if (selectedElement) {
            // Trouver l'ordre Z le plus bas
            const elements = this.model.getAllElements();
            const minZIndex = Math.min(...elements.map(el => el.zIndex));
            
            // Mettre à jour l'ordre Z
            this.model.updateElement(selectedElement.id, { zIndex: minZIndex - 1 });
        }
    }

    // Gère le clic sur le bouton Supprimer
    handleDelete() {
        const selectedElement = this.model.getSelectedElement();
        
        if (selectedElement) {
            this.model.removeElement(selectedElement.id);
        }
    }
}