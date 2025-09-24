// Handle form submission with AJAX
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded');
  
  try {
    const form = document.getElementById('new-pet');
    console.log('Form found:', form);
    
    if (form && typeof axios !== 'undefined') {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted');
        
        try {
          // Get form data
          const formData = new FormData(form);
          const data = Object.fromEntries(formData);
          console.log('Form data:', data);
          
          // Send AJAX request
          axios.post('/pets', data)
            .then(response => {
              console.log('Success:', response);
              showAlert('Pet created successfully!', 'success');
              form.reset();
            })
            .catch(error => {
              console.error('Error:', error);
              if (error.response && error.response.data && error.response.data.message) {
                showAlert(error.response.data.message, 'danger');
              } else {
                showAlert('An error occurred while creating the pet.', 'danger');
              }
            });
        } catch (err) {
          console.error('Form submission error:', err);
          showAlert('Form submission failed.', 'danger');
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
