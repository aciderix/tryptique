/**
 * Gestion des boîtes de dialogue modales
 */
class ModalManager {
    constructor() {
        this.modalOverlay = document.getElementById('modal-overlay');
        this.modals = {
            addImage: document.getElementById('add-image-modal'),
            save: document.getElementById('save-modal')
        };
        
        this.init();
    }

    // Initialise les boîtes de dialogue
    init() {
        // Ajouter les écouteurs d'événements pour fermer les boîtes de dialogue
        const closeButtons = document.querySelectorAll('.close-modal-btn');
        for (const button of closeButtons) {
            button.addEventListener('click', this.closeModal.bind(this));
        }
        
        // Fermer la boîte de dialogue si on clique sur l'arrière-plan
        this.modalOverlay.addEventListener('click', (event) => {
            if (event.target === this.modalOverlay) {
                this.closeModal();
            }
        });
    }

    // Ouvre une boîte de dialogue
    openModal(modalId) {
        if (this.modals[modalId]) {
            this.modalOverlay.classList.remove('hidden');
            this.modals[modalId].classList.remove('hidden');
        }
    }

    // Ferme la boîte de dialogue active
    closeModal() {
        this.modalOverlay.classList.add('hidden');
        
        for (const modal of Object.values(this.modals)) {
            modal.classList.add('hidden');
        }
    }
}