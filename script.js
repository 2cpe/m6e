// FiveM Mod Menu JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let activeTabIndex = 0;
    let activeOptionIndex = 0;
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Function to switch tabs
    function switchTab(index) {
        // Remove active class from all tabs and content
        tabs.forEach(tab => tab.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        tabs[index].classList.add('active');
        tabContents[index].classList.add('active');
        
        // Reset option index when switching tabs
        activeOptionIndex = 0;
        highlightOption();
    }
    
    // Tab click handlers
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            activeTabIndex = index;
            switchTab(index);
        });
    });
    
    // Toggle checkbox state
    function toggleCheckbox(checkbox) {
        checkbox.checked = !checkbox.checked;
        
        // This is where we would send data to FiveM
        sendToGame({
            type: 'toggle',
            id: checkbox.id,
            value: checkbox.checked
        });
    }
    
    // Adjust slider values
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
        const valueDisplay = slider.nextElementSibling;
        
        // Update value display on slider change
        slider.addEventListener('input', () => {
            if (slider.id === 'time-slider') {
                valueDisplay.textContent = `${slider.value}:00`;
            } else {
                valueDisplay.textContent = slider.value;
            }
            
            // This is where we would send data to FiveM
            sendToGame({
                type: 'slider',
                id: slider.id,
                value: slider.value
            });
        });
    });
    
    // Button click handlers
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Visual feedback
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 100);
            
            // This is where we would send data to FiveM
            sendToGame({
                type: 'button',
                action: button.classList[1]
            });
        });
    });
    
    // Dropdown change handlers
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('change', () => {
            // This is where we would send data to FiveM
            sendToGame({
                type: 'dropdown',
                id: dropdown.id,
                value: dropdown.value
            });
        });
    });
    
    // Close button handler
    document.querySelector('.menu-close-btn').addEventListener('click', () => {
        // This is where we would tell FiveM to close the menu
        sendToGame({
            type: 'close'
        });
    });
    
    // Keyboard navigation
    function highlightOption() {
        // Remove highlight from all options
        const options = tabContents[activeTabIndex].querySelectorAll('.option');
        options.forEach(option => option.style.backgroundColor = '');
        
        // Add highlight to active option
        if (options[activeOptionIndex]) {
            options[activeOptionIndex].style.backgroundColor = 'rgba(0, 168, 255, 0.2)';
            options[activeOptionIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }
    
    document.addEventListener('keydown', function(e) {
        const options = tabContents[activeTabIndex].querySelectorAll('.option');
        
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                activeOptionIndex = Math.max(0, activeOptionIndex - 1);
                highlightOption();
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                activeOptionIndex = Math.min(options.length - 1, activeOptionIndex + 1);
                highlightOption();
                break;
                
            case 'ArrowLeft':
                e.preventDefault();
                activeTabIndex = (activeTabIndex - 1 + tabs.length) % tabs.length;
                switchTab(activeTabIndex);
                break;
                
            case 'ArrowRight':
                e.preventDefault();
                activeTabIndex = (activeTabIndex + 1) % tabs.length;
                switchTab(activeTabIndex);
                break;
                
            case 'Enter':
                e.preventDefault();
                const activeOption = options[activeOptionIndex];
                if (activeOption) {
                    // Check if option contains a checkbox
                    const checkbox = activeOption.querySelector('.toggle-checkbox');
                    if (checkbox) {
                        toggleCheckbox(checkbox);
                    }
                    
                    // Check if option contains a button
                    const button = activeOption.querySelector('.button');
                    if (button) {
                        button.click();
                    }
                    
                    // Check if option contains a dropdown
                    const dropdown = activeOption.querySelector('.dropdown');
                    if (dropdown) {
                        dropdown.focus();
                    }
                }
                break;
                
            case 'Escape':
            case 'Backspace':
                e.preventDefault();
                // This is where we would tell FiveM to close the menu
                sendToGame({
                    type: 'close'
                });
                break;
                
            case 'F5':
                e.preventDefault();
                // This is where we would tell FiveM to toggle the menu
                sendToGame({
                    type: 'toggle_menu'
                });
                break;
        }
    });
    
    // Function to communicate with FiveM
    function sendToGame(data) {
        // For browser testing, log to console
        console.log('Sending to game:', data);
        
        // In actual implementation, this would send data to FiveM
        // This function will be called by the FiveM client via the DUI
        if (window.invokeNative) {
            // When used in FiveM context
            fetch(`https://${GetParentResourceName()}/uiMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                },
                body: JSON.stringify(data)
            });
        }
    }
    
    // Receive messages from FiveM
    window.addEventListener('message', function(event) {
        const data = event.data;
        
        if (data.type === 'open') {
            document.body.style.display = 'flex';
        } else if (data.type === 'close') {
            document.body.style.display = 'none';
        } else if (data.type === 'updateOption') {
            // Update a specific option based on game state
            if (data.optionType === 'checkbox') {
                const checkbox = document.getElementById(data.id);
                if (checkbox) {
                    checkbox.checked = data.value;
                }
            } else if (data.optionType === 'slider') {
                const slider = document.getElementById(data.id);
                if (slider) {
                    slider.value = data.value;
                    const valueDisplay = slider.nextElementSibling;
                    if (slider.id === 'time-slider') {
                        valueDisplay.textContent = `${slider.value}:00`;
                    } else {
                        valueDisplay.textContent = slider.value;
                    }
                }
            } else if (data.optionType === 'dropdown') {
                const dropdown = document.getElementById(data.id);
                if (dropdown) {
                    dropdown.value = data.value;
                }
            }
        }
    });
    
    // Initially hide the menu until opened by the game
    // document.body.style.display = 'none';
    
    // For testing in browser, comment out the line above and uncomment this:
    document.body.style.display = 'flex';
    highlightOption();
}); 