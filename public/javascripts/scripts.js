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
              showAlert('Pet created successfully!', 'success');
              // Redirect to the pet's show page instead of just resetting form
              setTimeout(() => {
                window.location.replace(`/pets/${response.data.pet._id}`);
              }, 1000);
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
