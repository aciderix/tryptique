/**
 * Application principale
 */
class TryptiqueApp {
    constructor() {
        // Créer le modèle
        this.model = new TryptiqueModel();
        
        // Créer les gestionnaires d'interface
        this.canvasManager = new CanvasManager(this.model);
        this.propertiesPanel = new PropertiesPanel(this.model);
        this.layersPanel = new LayersPanel(this.model);
        this.toolbarManager = new ToolbarManager(this.model, this.canvasManager);
        this.modalManager = new ModalManager();
        
        // Initialiser l'application
        this.init();
    }

    // Initialise l'application
    init() {
        // Gérer les onglets du panneau de droite
        this.initTabs();
        
        // Gérer le chargement de fichiers
        this.initFileLoading();
        
        // Gérer les raccourcis clavier
        this.initKeyboardShortcuts();
    }

    // Initialise les onglets
    initTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        for (const button of tabButtons) {
            button.addEventListener('click', () => {
                // Désactiver tous les onglets
                for (const btn of tabButtons) {
                    btn.classList.remove('active');
                }
                
                for (const content of tabContents) {
                    content.classList.remove('active');
                }
                
                // Activer l'onglet sélectionné
                button.classList.add('active');
                const tabId = button.dataset.tab;
                document.getElementById(`${tabId}-panel`).classList.add('active');
            });
        }
    }

    // Initialise le chargement de fichiers
    initFileLoading() {
        // Gérer le glisser-déposer de fichiers
        document.addEventListener('dragover', (event) => {
            event.preventDefault();
        });
        
        document.addEventListener('drop', async (event) => {
            event.preventDefault();
            
            if (event.dataTransfer.files.length > 0) {
                const file = event.dataTransfer.files[0];
                
                if (file.name.endsWith('.json')) {
                    // Charger un projet
                    this.loadProject(file);
                } else if (file.type.startsWith('image/')) {
                    // Ajouter une image
                    await this.canvasManager.addImageElement(file);
                }
            }
        });
    }

    // Charge un projet depuis un fichier
    loadProject(file) {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                this.model.load(data);
            } catch (error) {
                console.error('Error loading project:', error);
                alert('Erreur lors du chargement du projet');
            }
        };
        
        reader.readAsText(file);
    }

    // Initialise les raccourcis clavier
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ignorer les raccourcis si on est en train d'éditer du texte
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Ctrl+Z : Annuler
            if (event.ctrlKey && event.key === 'z') {
                event.preventDefault();
                this.model.undo();
            }
            
            // Ctrl+Y : Rétablir
            if (event.ctrlKey && event.key === 'y') {
                event.preventDefault();
                this.model.redo();
            }
            
            // Ctrl+S : Enregistrer
            if (event.ctrlKey && event.key === 's') {
                event.preventDefault();
                this.toolbarManager.handleSave();
            }
            
            // Ctrl+P : Imprimer
            if (event.ctrlKey && event.key === 'p') {
                event.preventDefault();
                this.toolbarManager.handlePrint();
            }
            
            // Suppr : Supprimer
            if (event.key === 'Delete') {
                event.preventDefault();
                this.toolbarManager.handleDelete();
            }
            
            // Échap : Désélectionner
            if (event.key === 'Escape') {
                event.preventDefault();
                this.model.deselectElement();
            }
        });
    }
}

// Initialiser l'application au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TryptiqueApp();
});