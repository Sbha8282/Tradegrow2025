/**
 * Authentication JavaScript for LogoCrypto
 * Handles form validation and social auth interactions
 */

/**
 * Initialize authentication page functionality
 */
function initializeAuth() {
    console.log('Initializing authentication functionality');
    
    // Initialize form validation
    initializeFormValidation();
    
    // Initialize social auth buttons
    initializeSocialAuth();
    
    // Initialize password strength indicator
    initializePasswordStrength();
}

/**
 * Initialize form validation for login and signup forms
 */
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!validateForm(this)) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            this.classList.add('was-validated');
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateInput(this);
            });
            
            input.addEventListener('input', function() {
                clearValidationError(this);
            });
        });
    });
}

/**
 * Validate entire form
 * @param {HTMLFormElement} form - Form to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });
    
    // Special validation for signup form
    if (form.querySelector('#confirm_password')) {
        const password = form.querySelector('#password').value;
        const confirmPassword = form.querySelector('#confirm_password').value;
        
        if (password !== confirmPassword) {
            showInputError(form.querySelector('#confirm_password'), 'Passwords do not match');
            isValid = false;
        }
    }
    
    return isValid;
}

/**
 * Validate individual input
 * @param {HTMLInputElement} input - Input to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateInput(input) {
    const value = input.value.trim();
    const type = input.type;
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (input.hasAttribute('required') && !value) {
        errorMessage = 'This field is required';
        isValid = false;
    }
    
    // Email validation
    else if (type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            errorMessage = 'Please enter a valid email address';
            isValid = false;
        }
    }
    
    // Password validation
    else if (type === 'password' && value && input.id === 'password') {
        if (value.length < 8) {
            errorMessage = 'Password must be at least 8 characters long';
            isValid = false;
        }
    }
    
    if (!isValid) {
        showInputError(input, errorMessage);
    } else {
        clearInputError(input);
    }
    
    return isValid;
}

/**
 * Show validation error for input
 * @param {HTMLInputElement} input - Input element
 * @param {string} message - Error message
 */
function showInputError(input, message) {
    input.classList.add('is-invalid');
    
    // Remove existing error message
    const existingError = input.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    input.parentNode.appendChild(errorDiv);
}

/**
 * Clear validation error for input
 * @param {HTMLInputElement} input - Input element
 */
function clearInputError(input) {
    input.classList.remove('is-invalid');
    const errorDiv = input.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

/**
 * Clear validation error on input
 * @param {HTMLInputElement} input - Input element
 */
function clearValidationError(input) {
    if (input.value.trim()) {
        clearInputError(input);
    }
}

/**
 * Initialize social authentication buttons
 */
function initializeSocialAuth() {
    const socialButtons = document.querySelectorAll('.btn-outline-secondary');
    
    socialButtons.forEach(button => {
        if (button.textContent.includes('Google')) {
            button.addEventListener('click', handleGoogleAuth);
        } else if (button.textContent.includes('Microsoft')) {
            button.addEventListener('click', handleMicrosoftAuth);
        } else if (button.textContent.includes('Apple')) {
            button.addEventListener('click', handleAppleAuth);
        }
    });
}

/**
 * Handle Google authentication
 */
function handleGoogleAuth(event) {
    event.preventDefault();
    console.log('Google authentication initiated');
    
    // Add loading state
    const button = event.target.closest('button');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Connecting...';
    button.disabled = true;
    
    // Simulate OAuth flow
    setTimeout(() => {
        showNotification('Google authentication is not yet configured. Please use email/password login.', 'info');
        
        // Restore button
        button.innerHTML = originalText;
        button.disabled = false;
    }, 1500);
}

/**
 * Handle Microsoft authentication
 */
function handleMicrosoftAuth(event) {
    event.preventDefault();
    console.log('Microsoft authentication initiated');
    
    const button = event.target.closest('button');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Connecting...';
    button.disabled = true;
    
    setTimeout(() => {
        showNotification('Microsoft authentication is not yet configured. Please use email/password login.', 'info');
        
        button.innerHTML = originalText;
        button.disabled = false;
    }, 1500);
}

/**
 * Handle Apple authentication
 */
function handleAppleAuth(event) {
    event.preventDefault();
    console.log('Apple authentication initiated');
    
    const button = event.target.closest('button');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Connecting...';
    button.disabled = true;
    
    setTimeout(() => {
        showNotification('Apple authentication is not yet configured. Please use email/password login.', 'info');
        
        button.innerHTML = originalText;
        button.disabled = false;
    }, 1500);
}

/**
 * Initialize password strength indicator
 */
function initializePasswordStrength() {
    const passwordInput = document.querySelector('#password');
    if (!passwordInput) return;
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = calculatePasswordStrength(password);
        updatePasswordStrengthIndicator(strength);
    });
}

/**
 * Calculate password strength
 * @param {string} password - Password to evaluate
 * @returns {Object} - Strength information
 */
function calculatePasswordStrength(password) {
    let score = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) {
        score += 2;
    } else {
        feedback.push('Use at least 8 characters');
    }
    
    // Uppercase check
    if (/[A-Z]/.test(password)) {
        score += 1;
    } else {
        feedback.push('Include uppercase letters');
    }
    
    // Lowercase check
    if (/[a-z]/.test(password)) {
        score += 1;
    } else {
        feedback.push('Include lowercase letters');
    }
    
    // Number check
    if (/\d/.test(password)) {
        score += 1;
    } else {
        feedback.push('Include numbers');
    }
    
    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) {
        score += 1;
    } else {
        feedback.push('Include special characters');
    }
    
    // Determine strength level
    let level = 'weak';
    let color = 'danger';
    
    if (score >= 5) {
        level = 'strong';
        color = 'success';
    } else if (score >= 3) {
        level = 'medium';
        color = 'warning';
    }
    
    return {
        score,
        level,
        color,
        feedback: feedback.slice(0, 2) // Show max 2 suggestions
    };
}

/**
 * Update password strength indicator
 * @param {Object} strength - Strength information
 */
function updatePasswordStrengthIndicator(strength) {
    let indicator = document.querySelector('.password-strength-indicator');
    
    if (!indicator && strength.score > 0) {
        // Create indicator
        indicator = document.createElement('div');
        indicator.className = 'password-strength-indicator mt-2';
        document.querySelector('#password').parentNode.appendChild(indicator);
    }
    
    if (indicator) {
        if (strength.score === 0) {
            indicator.remove();
            return;
        }
        
        indicator.innerHTML = `
            <div class="progress" style="height: 4px;">
                <div class="progress-bar bg-${strength.color}" 
                     style="width: ${(strength.score / 6) * 100}%"></div>
            </div>
            <small class="text-${strength.color} mt-1 d-block">
                Password strength: ${strength.level}
                ${strength.feedback.length > 0 ? ' - ' + strength.feedback.join(', ') : ''}
            </small>
        `;
    }
}

/**
 * Show notification to user
 * @param {string} message - Message to display
 * @param {string} type - Notification type
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

/**
 * Initialize when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

/**
 * Export for global access
 */
window.AuthModule = {
    validateForm,
    validateInput,
    showNotification
};
