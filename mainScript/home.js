// Define updateNavVisibility globally so it can be called from anywhere
function updateNavVisibility() {
    const loginLinkElement = document.getElementById('loginLink');
    const registerLinkElement = document.getElementById('registerLink');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userRole = localStorage.getItem('userRole');
    const navLinks = document.querySelector('.nav-links');
    let adminLinkElement = document.getElementById('adminLink');

    if (loginLinkElement) {
        loginLinkElement.style.display = isLoggedIn ? 'none' : '';
    }
    if (registerLinkElement) {
        registerLinkElement.style.display = isLoggedIn ? 'none' : '';
    }

    // Add/Remove Admin link
    if (isLoggedIn && userRole === 'admin') {
        if (!adminLinkElement && navLinks) {
            const pushRightItem = navLinks.querySelector('.nav-item--push-right');
            const newAdminLi = document.createElement('li');
            newAdminLi.innerHTML = `<a href="admin.html" id="adminLink">Admin</a>`;

            if (pushRightItem) {
                navLinks.insertBefore(newAdminLi, pushRightItem);
            } else if (navLinks.lastElementChild) {
                navLinks.appendChild(newAdminLi);
            } else {
                navLinks.appendChild(newAdminLi);
            }
        } else if (adminLinkElement) {
            adminLinkElement.style.display = '';
        }
    } else if (adminLinkElement) {
        adminLinkElement.parentElement.remove();
    }
    // You might also want to show elements for logged-in users here
}

document.addEventListener('DOMContentLoaded', () => {
    // Modal elements
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const switchToRegisterLink = document.getElementById('switchToRegisterLink');
    const switchToLoginLink = document.getElementById('switchToLoginLink');

    // Function to open a modal
    function openModal(modal) {
        if (modal) {
            modal.classList.add('active');
        }
    }

    // Function to close a modal
    function closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Get all close buttons
    const closeButtons = document.querySelectorAll('.close-button');

    // Add event listeners to each close button
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-modal-close');
            const modalToClose = document.getElementById(modalId);
            closeModal(modalToClose);
        });
    });

    // Event listeners for opening modals
    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(loginModal);
        });
    }

    if (registerLink) {
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(registerModal);
        });
    }

    // Event listeners for switching modals
    if (switchToRegisterLink) {
        switchToRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(loginModal);
            openModal(registerModal);
        });
    }

    if (switchToLoginLink) {
        switchToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(registerModal);
            openModal(loginModal);
        });
    }

    // Close modal if user clicks outside of the modal content
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal') && event.target.classList.contains('active')) {
            closeModal(event.target);
        }
    });

    const registerForm = document.getElementById('registerForm');
    const registerModalElement = document.getElementById('registerModal');

    if (registerForm && registerModalElement) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const registerName = document.getElementById('registerName').value;
            const registerEmail = document.getElementById('registerEmail').value;
            const registerPassword = document.getElementById('registerPassword').value;

            const registrationData = {
                user_name: registerName,
                user_login: registerEmail,
                user_password: registerPassword
            };

            console.log('Registration Data:', registrationData);

            fetch('https://localhost:7038/api/Users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Registration successful:', data);
                alert('Registration successful!');
                closeModal(registerModalElement);
                // Optionally, redirect the user or update UI
            })
            .catch(error => {
                console.error('Error during registration:', error);
                alert('Registration failed. Please try again.');
            });
        });
    }

    const loginForm = document.getElementById('loginForm');
    const loginModalElement = document.getElementById('loginModal');

    if (loginForm && loginModalElement) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const loginEmail = document.getElementById('loginEmail').value;
            const loginPassword = document.getElementById('loginPassword').value;

            const loginData = {
                user_login: loginEmail,
                user_password: loginPassword
            };

            try {
                const response = await fetch('https://localhost:7038/api/Users/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loginData)
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Login successful:', data);
                    alert('Login successful!');
                    localStorage.setItem('isLoggedIn', 'true');
                    if (data.user_role) {
                        localStorage.setItem('userRole', data.user_role);
                    } else {
                        localStorage.removeItem('userRole');
                    }
                    updateNavVisibility();
                    closeModal(loginModalElement);
                    // Optionally, store a token and redirect
                } else {
                    const errorInfo = await response.json();
                    console.error('Login failed:', errorInfo.Message || 'Login failed');
                    alert('Login failed. Please check your credentials.');
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('Login failed. An error occurred.');
            }
        });
    }

    // Call updateNavVisibility on page load to check initial login state
    updateNavVisibility();
});