let authToken = localStorage.getItem('authToken');
let userData = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuth();

    // Register form handler
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Login form handler
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Profile form handler
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }

    // Password reset request form handler
    const resetRequestForm = document.getElementById('reset-request-form');
    if (resetRequestForm) {
        resetRequestForm.addEventListener('submit', handleResetRequest);
    }

    // Password reset form handler (with token)
    const resetPasswordForm = document.getElementById('reset-password-form');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', handlePasswordReset);
    }

    // Logout button handler
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Load bookings if on my-bookings page
    if (document.getElementById('my-bookings')) {
        loadMyBookings();
    }

    // Load user profile if on profile page
    if (document.getElementById('profile-form')) {
        loadUserProfile();
    }
});

function checkAuth() {
    if (!authToken) {
        // Redirect to login page if not on login or register page
        const currentPage = window.location.pathname;
        if (currentPage !== '/login.html' && 
            currentPage !== '/register.html' && 
            !currentPage.includes('/reset-password')) {
            window.location.href = '/login.html';
        }
        return false;
    }
    return true;
}

async function handleRegister(e) {
    e.preventDefault();
    
    const userData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        fullName: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value
    };

    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        
        if (response.ok) {
            // Store token and redirect to dashboard
            localStorage.setItem('authToken', data.token);
            window.location.href = '/student-dashboard.html';
        } else {
            alert(data.msg || 'Registration failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during registration');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const loginData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const data = await response.json();
        
        if (response.ok) {
            // Store token and redirect based on role
            localStorage.setItem('authToken', data.token);
            authToken = data.token;
            
            // Decode token to get user role (simple decode, not secure)
            const tokenParts = data.token.split('.');
            if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                if (payload.user.role === 'admin') {
                    window.location.href = '/admin-dashboard.html';
                } else {
                    window.location.href = '/student-dashboard.html';
                }
            } else {
                window.location.href = '/student-dashboard.html';
            }
        } else {
            alert(data.msg || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login');
    }
}

async function loadUserProfile() {
    if (!checkAuth()) return;

    try {
        const response = await fetch('/api/users/profile', {
            headers: {
                'x-auth-token': authToken
            }
        });

        if (response.ok) {
            userData = await response.json();
            
            // Fill form with user data
            document.getElementById('fullName').value = userData.fullName || '';
            document.getElementById('email').value = userData.email || '';
            document.getElementById('phone').value = userData.phone || '';
            
            // Display username (readonly)
            const usernameField = document.getElementById('username');
            if (usernameField) {
                usernameField.value = userData.username;
                usernameField.setAttribute('readonly', true);
            }
        } else {
            alert('Failed to load profile');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    if (!checkAuth()) return;
    
    const profileData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };

    try {
        const response = await fetch('/api/users/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': authToken
            },
            body: JSON.stringify(profileData)
        });

        if (response.ok) {
            alert('Profile updated successfully');
        } else {
            const data = await response.json();
            alert(data.msg || 'Failed to update profile');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating profile');
    }
}

async function handleResetRequest(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;

    try {
        const response = await fetch('/api/users/reset-password-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        alert(data.msg || 'Password reset email sent if account exists');
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during password reset request');
    }
}

async function handlePasswordReset(e) {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const token = window.location.pathname.split('/').pop();
    
    if (password !== confirmPassword) {
        return alert('Passwords do not match');
    }

    try {
        const response = await fetch(`/api/users/reset-password/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert(data.msg || 'Password reset successful');
            window.location.href = '/login.html';
        } else {
            alert(data.msg || 'Password reset failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during password reset');
    }
}

async function loadMyBookings() {
    if (!checkAuth()) return;

    try {
        const response = await fetch('/api/bookings/my-bookings', {
            headers: {
                'x-auth-token': authToken
            }
        });

        if (response.ok) {
            const bookings = await response.json();
            const bookingsList = document.getElementById('my-bookings');
            
            if (bookings.length === 0) {
                bookingsList.innerHTML = '<p>No bookings found</p>';
                return;
            }
            
            bookingsList.innerHTML = ''; // Clear existing content
            
            bookings.forEach(booking => {
                const bookingCard = document.createElement('div');
                bookingCard.className = 'booking-card';
                
                // Format dates
                const startDate = new Date(booking.startDate).toLocaleDateString();
                const endDate = booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A';
                
                bookingCard.innerHTML = `
                    <h3>Room ${booking.room.number}</h3>
                    <p><strong>Status:</strong> <span class="status-${booking.status}">${booking.status}</span></p>
                    <p><strong>Dates:</strong> ${startDate} to ${endDate}</p>
                    <p><strong>Price:</strong> $${booking.price.toFixed(2)}</p>
                    <p><strong>Group Size:</strong> ${booking.groupSize}</p>
                    <p><strong>Payment:</strong> ${booking.paymentStatus}</p>
                    <div class="booking-actions">
                        ${booking.status === 'pending' || booking.status === 'confirmed' ? 
                          `<button class="cancel-booking" data-id="${booking._id}">Cancel</button>` : ''}
                        ${booking.status === 'confirmed' ? 
                          `<button class="extend-booking" data-id="${booking._id}">Extend Stay</button>` : ''}
                    </div>
                `;
                
                bookingsList.appendChild(bookingCard);
            });
            
            // Add event listeners to buttons
            document.querySelectorAll('.cancel-booking').forEach(button => {
                button.addEventListener('click', function() {
                    cancelBooking(this.dataset.id);
                });
            });
            
            document.querySelectorAll('.extend-booking').forEach(button => {
                button.addEventListener('click', function() {
                    showExtendBookingModal(this.dataset.id);
                });
            });
        } else {
            alert('Failed to load bookings');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/bookings/cancel/${bookingId}`, {
            method: 'PUT',
            headers: {
                'x-auth-token': authToken
            }
        });
        
        if (response.ok) {
            alert('Booking cancelled successfully');
            loadMyBookings(); // Refresh the list
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to cancel booking');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while cancelling booking');
    }
}

function showExtendBookingModal(bookingId) {
    // Create modal for extending booking
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Extend Booking</h2>
            <form id="extend-form">
                <div class="form-group">
                    <label for="new-end-date">New End Date:</label>
                    <input type="date" id="new-end-date" required>
                </div>
                <button type="submit">Extend Stay</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking on X
    modal.querySelector('.close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Handle form submission
    modal.querySelector('#extend-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newEndDate = document.getElementById('new-end-date').value;
        
        try {
            const response = await fetch(`/api/bookings/extend/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': authToken
                },
                body: JSON.stringify({ newEndDate })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Booking extended successfully');
                document.body.removeChild(modal);
                loadMyBookings(); // Refresh the list
            } else {
                alert(data.message || 'Failed to extend booking');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while extending booking');
        }
    });
}

function handleLogout() {
    localStorage.removeItem('authToken');
    authToken = null;
    window.location.href = '/login.html';
}
