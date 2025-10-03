// Enhanced Checkout & Form Handling
document.addEventListener('DOMContentLoaded', function() {
  console.log('🐾 Pete\'s Pets - Enhanced UI Loaded');
  
  // Initialize checkout enhancements
  initializeCheckoutEnhancements();
  
  // Handle form submission with AJAX
  try {
    const form = document.getElementById('new-pet');
    console.log('Form found:', form);
    
    if (form && typeof axios !== 'undefined') {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted');
        
        // Show loading state
        showFormLoading(true);
        
        try {
          // Use FormData to grab everything now that we have files mixed in with text
          const pet = new FormData(form);
          console.log('FormData created');
          
          // Assign the multipart/form-data headers so axios does a proper post
          axios.post('/pets', pet, {
            headers: {
              'Content-Type': 'multipart/form-data;'
            }
          })
            .then(response => {
              console.log('Success:', response);
              showAlert('🎉 Pet created successfully!', 'success');
              // Redirect to the pet's show page instead of just resetting form
              setTimeout(() => {
                window.location.replace(`/pets/${response.data.pet._id}`);
              }, 1000);
            })
            .catch(error => {
              console.error('Error:', error);
              showFormLoading(false);
              if (error.response && error.response.data && error.response.data.message) {
                showAlert('❌ ' + error.response.data.message, 'danger');
              } else {
                showAlert('❌ An error occurred while creating the pet.', 'danger');
              }
            });
        } catch (err) {
          console.error('Form submission error:', err);
          showFormLoading(false);
          showAlert('❌ Form submission failed.', 'danger');
        }
      });
    } else {
      console.warn('Form not found or Axios not loaded');
    }
  } catch (err) {
    console.error('Script initialization error:', err);
  }
});

// Show alert message
function showAlert(message, type) {
  try {
    const alertDiv = document.getElementById('alert');
    if (alertDiv) {
      alertDiv.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
          ${message}
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      `;
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        const alert = alertDiv.querySelector('.alert');
        if (alert) {
          alert.classList.remove('show');
          setTimeout(() => {
            alertDiv.innerHTML = '';
          }, 150);
        }
      }, 5000);
    } else {
      console.error('Alert div not found');
    }
  } catch (err) {
    console.error('showAlert error:', err);
  }
}

// Enhanced Checkout Functions
function initializeCheckoutEnhancements() {
  // Add smooth scrolling to checkout section
  const checkoutLink = document.querySelector('a[href="#checkout"]');
  if (checkoutLink) {
    checkoutLink.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelector('.custom-checkout-form').scrollIntoView({
        behavior: 'smooth'
      });
    });
  }
  
  // Enhance Stripe button
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes) {
        mutation.addedNodes.forEach(function(node) {
          if (node.classList && node.classList.contains('stripe-button-el')) {
            enhanceStripeButton(node);
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Check for existing Stripe buttons
  setTimeout(() => {
    const stripeButtons = document.querySelectorAll('.stripe-button-el');
    stripeButtons.forEach(enhanceStripeButton);
  }, 1000);
}

function enhanceStripeButton(button) {
  // Add loading state to Stripe button
  button.addEventListener('click', function() {
    showPaymentLoading(true);
  });
  
  // Add ripple effect
  button.addEventListener('mousedown', function(e) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.5);
      transform: scale(0);
      animation: rippleEffect 0.6s linear;
      pointer-events: none;
    `;
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  });
}

function showPaymentLoading(show) {
  const loadingDiv = document.querySelector('.payment-loading');
  const checkoutContainer = document.querySelector('.stripe-checkout-container');
  
  if (loadingDiv && checkoutContainer) {
    if (show) {
      loadingDiv.style.display = 'block';
      checkoutContainer.style.opacity = '0.5';
      checkoutContainer.style.pointerEvents = 'none';
    } else {
      loadingDiv.style.display = 'none';
      checkoutContainer.style.opacity = '1';
      checkoutContainer.style.pointerEvents = 'auto';
    }
  }
}

function showFormLoading(show) {
  const submitBtn = document.querySelector('button[type="submit"]');
  
  if (submitBtn) {
    if (show) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
        Creating Pet...
      `;
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Save';
    }
  }
}

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
  @keyframes rippleEffect {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .stripe-button-el {
    position: relative !important;
    overflow: hidden !important;
  }
`;
document.head.appendChild(style);
