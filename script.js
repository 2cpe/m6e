document.addEventListener('DOMContentLoaded', function() {
    // Initialize mod menu
    initModMenu();
    
    // Event listeners for menu toggles and actions
    setupEventListeners();
});

function initModMenu() {
    // Set all categories to expanded by default
    const categories = document.querySelectorAll('.category');
    categories.forEach(category => {
        category.classList.remove('collapsed');
    });
    
    // Initialize values from saved state if available
    loadSavedState();
}

function setupEventListeners() {
    // Toggle menu categories
    const categoryHeaders = document.querySelectorAll('.category-header');
    categoryHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const category = this.parentElement;
            category.classList.toggle('collapsed');
        });
    });
    
    // Action buttons
    const actionButtons = document.querySelectorAll('.action-button');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            sendMessageToGame(action, true);
        });
    });
    
    // Toggle switches
    const toggles = document.querySelectorAll('.toggle-checkbox');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const action = this.getAttribute('data-action');
            const value = this.checked;
            sendMessageToGame(action, value);
        });
    });
    
    // Sliders
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
        slider.addEventListener('input', function() {
            // Update visual feedback (optional)
            updateSliderFeedback(this);
        });
        
        slider.addEventListener('change', function() {
            const action = this.getAttribute('data-action');
            const value = this.value;
            sendMessageToGame(action, value);
        });
    });
    
    // Main menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    menuToggle.addEventListener('change', function() {
        const modMenu = document.querySelector('.mod-menu');
        if (this.checked) {
            modMenu.style.opacity = '0.3';
        } else {
            modMenu.style.opacity = '1';
        }
    });
}

function updateSliderFeedback(slider) {
    // This could be expanded to show the value in a tooltip or other visual feedback
    console.log(`${slider.id} value: ${slider.value}`);
}

function sendMessageToGame(action, value) {
    // This function will be used to communicate with FiveM
    // For now, we'll just log the action and value
    console.log(`Action: ${action}, Value: ${value}`);
    
    // In production, this will use the FiveM message interface
    // Example:
    if (window.invokeNative) {
        // For actual FiveM integration
        fetch(`https://${GetParentResourceName()}/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                value: value
            })
        });
    }
    
    // Save state
    saveState(action, value);
}

function saveState(action, value) {
    // Save current state to localStorage for persistence
    try {
        const state = JSON.parse(localStorage.getItem('modMenuState')) || {};
        state[action] = value;
        localStorage.setItem('modMenuState', JSON.stringify(state));
    } catch (e) {
        console.error('Error saving state:', e);
    }
}

function loadSavedState() {
    try {
        const state = JSON.parse(localStorage.getItem('modMenuState')) || {};
        
        // Apply saved states to UI elements
        Object.keys(state).forEach(action => {
            const element = document.querySelector(`[data-action="${action}"]`);
            if (element) {
                const value = state[action];
                
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else if (element.type === 'range') {
                    element.value = value;
                }
            }
        });
    } catch (e) {
        console.error('Error loading state:', e);
    }
}

// Handle messages from FiveM
window.addEventListener('message', function(event) {
    const data = event.data;
    
    if (data.type === 'setVisible') {
        document.body.style.display = data.value ? 'block' : 'none';
    } else if (data.type === 'updateValue') {
        // Update UI element based on game state
        const element = document.querySelector(`[data-action="${data.action}"]`);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = data.value;
            } else if (element.type === 'range') {
                element.value = data.value;
            }
        }
    }
}); 