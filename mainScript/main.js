// Irakli-Kviraia/js/main.js

// --- Global Configuration (Define once at the TOP) ---
const BASE_URL = 'https://localhost:7038'; // Standardized API base URL

// --- Global Helper Functions ---

// Function to get authorization headers, expecting a JWT token
function getAuthHeaders() {
    const token = localStorage.getItem('token'); // Assumes JWT token is stored here
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// Function to open any modal
function openModal(modal) {
    if (modal) {
        modal.classList.add('active');
    }
}

// Function to close any modal
function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
    }
}

// Function to redirect to home
function redirectToHome() {
    window.location.href = 'index.html';
}

// Function to update navigation visibility based on login status and role
function updateNavVisibility() {
    const loginLinkElement = document.getElementById('loginLink');
    const registerLinkElement = document.getElementById('registerLink');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'; // Your current login state
    const userRole = localStorage.getItem('userRole'); // Your current role state
    const navLinks = document.querySelector('.nav-links');
    let adminLinkElement = document.getElementById('adminLink');
    let productsLinkElement = document.getElementById('productsLink'); // Assuming you have a products link

    // Hide/show login/register links
    if (loginLinkElement) {
        loginLinkElement.style.display = isLoggedIn ? 'none' : '';
    }
    if (registerLinkElement) {
        registerLinkElement.style.display = isLoggedIn ? 'none' : '';
    }

    // Handle Admin link visibility
    if (isLoggedIn && userRole === 'Admin') { // Check for 'Admin' role as per your backend
        if (!adminLinkElement && navLinks) {
            const pushRightItem = navLinks.querySelector('.nav-item--push-right'); // Find a common nav item to insert before
            const newAdminLi = document.createElement('li');
            newAdminLi.innerHTML = `<a href="admin.html" id="adminLink">Admin</a>`;

            if (pushRightItem) {
                navLinks.insertBefore(newAdminLi, pushRightItem);
            } else if (navLinks.lastElementChild) {
                navLinks.appendChild(newAdminLi);
            } else {
                navLinks.appendChild(newAdminLi);
            }
            adminLinkElement = document.getElementById('adminLink'); // Re-query after adding
        }
        if (adminLinkElement) {
            adminLinkElement.style.display = '';
        }
    } else if (adminLinkElement) {
        // If user is not admin or logged out, remove the admin link if it exists
        adminLinkElement.parentElement.remove();
    }

    // Handle Products link visibility (Show if logged in)
    if (productsLinkElement) {
        productsLinkElement.style.display = isLoggedIn ? '' : 'none'; // Only show products if logged in
    }
}


// --- DOMContentLoaded Event Listener (All page-specific setup goes here) ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Global Modal Close Buttons ---
    const closeButtons = document.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-modal-close');
            const modalToClose = document.getElementById(modalId);
            closeModal(modalToClose);
        });
    });

    // Close any modal if user clicks outside of the modal content
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal') && event.target.classList.contains('active')) {
            closeModal(event.target);
        }
    });

    // --- User Registration (from home.js) ---
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

            fetch(`${BASE_URL}/api/Users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.Message || 'Registration failed'); });
                }
                return response.json();
            })
            .then(data => {
                console.log('Registration successful:', data);
                alert('Registration successful!');
                closeModal(registerModalElement);
                // Optionally, redirect the user or update UI
            })
            .catch(error => {
                console.error('Error during registration:', error);
                alert('Registration failed. ' + error.message);
            });
        });
    }

    // --- User Login (from home.js) ---
    const loginForm = document.getElementById('loginForm');
    const loginModalElement = document.getElementById('loginModal');
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const switchToRegisterLink = document.getElementById('switchToRegisterLink');
    const switchToLoginLink = document.getElementById('switchToLoginLink');


    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(loginModalElement);
        });
    }

    if (registerLink) {
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(registerModalElement);
        });
    }

    if (switchToRegisterLink) {
        switchToRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(loginModalElement);
            openModal(registerModalElement);
        });
    }

    if (switchToLoginLink) {
        switchToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(registerModalElement);
            openModal(loginModalElement);
        });
    }

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
                const response = await fetch(`${BASE_URL}/api/Users/login`, {
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
                    
                    // !!! IMPORTANT: Your backend login API MUST return a JWT token here.
                    // For example: { "token": "your.jwt.token", "role": "Admin", "userId": 123 }
                    // If your backend returns 'user_role' instead of 'role', adjust here.
                    if (data.token) { // Check if a token is provided
                        localStorage.setItem('token', data.token);
                    } else {
                        console.warn("Login successful but no JWT token received from backend. Authenticated API calls may fail.");
                    }

                    if (data.role) { // Use 'role' from backend, not 'user_role' for consistency
                        localStorage.setItem('userRole', data.role);
                    } else if (data.user_role) { // Fallback if backend still sends 'user_role'
                         localStorage.setItem('userRole', data.user_role);
                    } else {
                        localStorage.removeItem('userRole');
                    }
                    
                    if (data.userId) { // Assuming your backend sends 'userId'
                        localStorage.setItem('userId', data.userId);
                    } else if (data.user_id) { // Fallback if backend sends 'user_id'
                        localStorage.setItem('userId', data.user_id);
                    } else {
                        localStorage.removeItem('userId');
                    }


                    updateNavVisibility();
                    closeModal(loginModalElement);
                    
                    // Redirect based on role or to products page
                    const role = localStorage.getItem('userRole');
                    if (role === 'Admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'products.html'; // Default for non-admin users
                    }

                } else {
                    const errorInfo = await response.json().catch(() => ({ Message: 'Login failed. Invalid response from server.' }));
                    console.error('Login failed:', errorInfo.Message || 'Login failed');
                    alert('Login failed. ' + (errorInfo.Message || 'Please check your credentials.'));
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('Login failed. An error occurred.');
            }
        });
    }

    // --- Logout Logic (Add this event listener if you have a logout button) ---
    const logoutButton = document.getElementById('logoutButton'); // Assuming you have a logout button with this ID
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userRole');
            localStorage.removeItem('token'); // Clear the token on logout
            localStorage.removeItem('userId');
            alert('Logged out successfully!');
            updateNavVisibility();
            window.location.href = 'index.html'; // Redirect to home/login page
        });
    }


    // --- Page-Specific Initialization ---

    // Initialize nav visibility on every page load
    updateNavVisibility();

    // Admin Page specific logic (from admin.js)
    if (window.location.pathname.includes('admin.html')) {
        const adminLoginModal = document.getElementById('adminLoginModal');
        const adminLoginForm = document.getElementById('adminLoginForm');
        const closeAdminLoginModalBtn = document.getElementById('closeAdminLoginModalBtn');
        const adminLoginErrorMsg = document.getElementById('adminLoginError');

        let isAdminAuthenticated = false;

        function showAdminLoginModal() {
            if (adminLoginModal) {
                adminLoginModal.classList.add('active');
            } else {
                console.warn('Admin login modal HTML not found. Falling back to immediate redirect.');
                alert('Access Denied. You must be an admin to view this page.');
                redirectToHome();
            }
        }

        function closeAdminLoginModal() {
            if (adminLoginModal) {
                adminLoginModal.classList.remove('active');
            }
        }

        function handleSuccessfulAdminLogin() {
            isAdminAuthenticated = true;
            closeAdminLoginModal();
            updateNavVisibility(); // Update nav to reflect admin login
            initializeAdminPageControls(); // Initialize the main admin page content
        }

        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userRole = localStorage.getItem('userRole');
        const token = localStorage.getItem('token'); // Check for token for full auth

        if (!isLoggedIn || userRole !== 'Admin' || !token) { // Added token check
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userRole');
            localStorage.removeItem('token'); // Ensure token is cleared if not admin
            updateNavVisibility();
            showAdminLoginModal();
        } else {
            isAdminAuthenticated = true;
            initializeAdminPageControls();
        }

        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (adminLoginErrorMsg) adminLoginErrorMsg.style.display = 'none';

                const emailInput = document.getElementById('adminLoginEmail');
                const passwordInput = document.getElementById('adminLoginPassword');
                const email = emailInput ? emailInput.value : '';
                const password = passwordInput ? passwordInput.value : '';

                try {
                    const response = await fetch(`${BASE_URL}/api/Users/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user_login: email, user_password: password })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        localStorage.setItem('isLoggedIn', 'true');
                        
                        if (data.token) {
                            localStorage.setItem('token', data.token);
                        } else {
                            console.warn("Admin login successful but no JWT token received.");
                        }

                        if (data.role) {
                            localStorage.setItem('userRole', data.role);
                        } else if (data.user_role) {
                             localStorage.setItem('userRole', data.user_role);
                        } else {
                            localStorage.removeItem('userRole');
                        }

                        if (data.userId) {
                            localStorage.setItem('userId', data.userId);
                        } else if (data.user_id) {
                            localStorage.setItem('userId', data.user_id);
                        } else {
                            localStorage.removeItem('userId');
                        }

                        if (localStorage.getItem('userRole') === 'Admin') { // Check role from localStorage after setting
                            handleSuccessfulAdminLogin();
                        } else {
                            alert('Access Denied. You are not an admin.');
                            localStorage.removeItem('isLoggedIn');
                            localStorage.removeItem('userRole');
                            localStorage.removeItem('token'); // Clear state for non-admin
                            updateNavVisibility();
                            closeAdminLoginModal();
                            redirectToHome();
                        }
                    } else {
                        const errorInfo = await response.json().catch(() => ({ Message: 'Login failed. Invalid response from server.' }));
                        const message = errorInfo.Message || 'Login failed. Please check your credentials.';
                        if (adminLoginErrorMsg) {
                            adminLoginErrorMsg.textContent = message;
                            adminLoginErrorMsg.style.display = 'block';
                        } else {
                            alert(message);
                        }
                    }
                } catch (error) {
                    console.error('Error during admin login:', error);
                    const message = 'Login failed. An error occurred.';
                    if (adminLoginErrorMsg) {
                        adminLoginErrorMsg.textContent = message;
                        adminLoginErrorMsg.style.display = 'block';
                    } else {
                        alert(message);
                    }
                }
            });
        }

        if (closeAdminLoginModalBtn) {
            closeAdminLoginModalBtn.addEventListener('click', () => {
                closeAdminLoginModal();
                if (!isAdminAuthenticated) {
                    redirectToHome();
                }
            });
        }

        window.addEventListener('click', (event) => {
            if (adminLoginModal && event.target === adminLoginModal && adminLoginModal.classList.contains('active')) {
                if (!isAdminAuthenticated) {
                    closeAdminLoginModal();
                    redirectToHome();
                }
            }
        });

        function initializeAdminPageControls() {
            if (!isAdminAuthenticated) {
                if (!adminLoginModal || !adminLoginModal.classList.contains('active')) {
                    alert('Authentication required to access admin controls.');
                    redirectToHome();
                }
                return;
            }

            // DOM Elements for Product Management (Admin Page Table)
            const productsTableBody = document.getElementById('productsTableBody');
            const showAddProductFormBtn = document.getElementById('showAddProductFormBtn');
            const productModal = document.getElementById('productModal'); // This is the Add/Edit Product modal
            const closeProductModalBtn = document.getElementById('closeProductModalBtn');
            const productForm = document.getElementById('productForm');
            const productModalTitle = document.getElementById('productModalTitle');
            const productIdInput = document.getElementById('productId'); // Hidden input for product ID

            // --- Modal Handling for Admin Product Forms ---
            function openAdminProductModal(mode = 'add', product = null) {
                if (productForm) productForm.reset();
                if (productIdInput) productIdInput.value = '';

                if (productModalTitle) {
                    if (mode === 'add') {
                        productModalTitle.textContent = 'Add New Product';
                    } else if (mode === 'edit' && product) {
                        productModalTitle.textContent = 'Edit Product';
                        if (productIdInput) productIdInput.value = product.productId; // Use camelCase productId
                        
                        // Use camelCase property names from backend API
                        document.getElementById('productName').value = product.productName || '';
                        document.getElementById('productCategory').value = product.productCategory || '';
                        document.getElementById('productPrice').value = product.productPrice || '';
                        document.getElementById('productQuantity').value = product.productQuantity || '';
                        document.getElementById('productDescription').value = product.productDescription || '';
                        document.getElementById('productImageURL').value = product.productImagePath || ''; // Corrected to productImagePath
                    }
                }
                if (productModal) productModal.classList.add('active');
            }

            function closeAdminProductModal() {
                if (productModal) {
                    productModal.classList.remove('active');
                }
            }

            if (showAddProductFormBtn) {
                showAddProductFormBtn.addEventListener('click', () => openAdminProductModal('add'));
            }
            if (closeProductModalBtn) {
                closeProductModalBtn.addEventListener('click', closeAdminProductModal);
            }
            // Close PRODUCT modal if clicking outside of it
            window.addEventListener('click', (event) => {
                if (productModal && event.target === productModal && productModal.classList.contains('active')) {
                    closeAdminProductModal();
                }
            });

            // --- CRUD Operations (Admin Page Table) ---

            // Fetch and Display Products (Read) - For Admin Page Table
            async function fetchAndDisplayProductsAdmin() {
                try {
                    const response = await fetch(`${BASE_URL}/api/Products`, {
                        headers: getAuthHeaders() // Include token for authenticated access
                    });
                    if (!response.ok) {
                        if (response.status === 401 || response.status === 403) {
                            throw new Error('Unauthorized or Forbidden. Please ensure you are logged in as an Admin.');
                        }
                        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                    }
                    const products = await response.json();

                    if (productsTableBody) {
                        productsTableBody.innerHTML = '';
                        products.forEach(product => {
                            const row = productsTableBody.insertRow();
                            // Use camelCase property names from C# backend API
                            row.innerHTML = `
                                <td>${product.productId}</td>
                                <td>${product.productName}</td>
                                <td>${product.productCategory}</td>
                                <td>$${parseFloat(product.productPrice).toFixed(2)}</td>
                                <td>${product.productQuantity}</td>
                                <td>
                                    <button class="action-btn edit-btn" data-id="${product.productId}">Edit</button>
                                    <button class="action-btn delete-btn" data-id="${product.productId}">Delete</button>
                                </td>
                            `;
                        });
                    }
                } catch (error) {
                    console.error('Error fetching products for admin:', error);
                    if (productsTableBody) {
                        productsTableBody.innerHTML = `<tr><td colspan="6">Error loading products: ${error.message}.</td></tr>`;
                    }
                }
            }

            // Add or Edit Product (Create/Update) - For Admin Page Form
            if (productForm) {
                productForm.addEventListener('submit', async (e) => {
                    e.preventDefault();

                    const id = productIdInput ? productIdInput.value : '';
                    
                    const productData = {
                        productId: id || 0, // Include productId for PUT, 0 for POST (will be ignored by backend on POST)
                        productCategory: document.getElementById('productCategory').value,
                        productName: document.getElementById('productName').value,
                        productQuantity: parseInt(document.getElementById('productQuantity').value),
                        productPrice: parseFloat(document.getElementById('productPrice').value),
                        productDescription: document.getElementById('productDescription').value,
                        productImagePath: document.getElementById('productImageURL').value // Corrected to productImagePath
                    };

                    const method = id ? 'PUT' : 'POST';
                    const url = id ? `${BASE_URL}/api/Products/${id}` : `${BASE_URL}/api/Products`;

                    try {
                        const response = await fetch(url, {
                            method: method,
                            headers: getAuthHeaders(), // Include token for authenticated access
                            body: JSON.stringify(productData)
                        });

                        if (!response.ok) {
                            const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                        }

                        alert(`Product ${id ? 'updated' : 'added'} successfully!`);
                        closeAdminProductModal();
                        fetchAndDisplayProductsAdmin(); // Refresh the list
                    } catch (error) {
                        console.error(`Error ${id ? 'updating' : 'adding'} product:`, error);
                        alert(`Failed to ${id ? 'update' : 'add'} product. ${error.message}`);
                    }
                });
            }

            // Delete Product & Edit Product (Event delegation for buttons in Admin table)
            if (productsTableBody) {
                productsTableBody.addEventListener('click', async (e) => {
                    const target = e.target;
                    const productId = target.dataset.id;

                    if (!productId) return;

                    // Handle Delete
                    if (target.classList.contains('delete-btn')) {
                        if (confirm(`Are you sure you want to delete product ID ${productId}?`)) {
                            try {
                                const response = await fetch(`${BASE_URL}/api/Products/${productId}`, {
                                    method: 'DELETE',
                                    headers: getAuthHeaders() // Include token for authenticated access
                                });
                                if (response.status === 204) { // 204 No Content for successful DELETE
                                    alert('Product deleted successfully!');
                                    fetchAndDisplayProductsAdmin(); // Refresh list
                                } else {
                                    const errorData = await response.json().catch(() => ({ message: response.statusText }));
                                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                                }
                            } catch (error) {
                                console.error('Error deleting product:', error);
                                alert(`Failed to delete product. ${error.message}`);
                            }
                        }
                    }

                    // Handle Edit: Fetch product details and open modal
                    if (target.classList.contains('edit-btn')) {
                        try {
                            const response = await fetch(`${BASE_URL}/api/Products/${productId}`, {
                                headers: getAuthHeaders() // Include token for authenticated access
                            });
                            if (!response.ok) {
                                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                                throw new Error(`HTTP error! status: ${response.status}. ${errorData.message || response.statusText}`);
                            }
                            const product = await response.json();
                            openAdminProductModal('edit', product); // Use the admin-specific modal
                        } catch (error) {
                            console.error('Error fetching product details for edit:', error);
                            alert('Failed to load product details for editing: ' + error.message);
                        }
                    }
                });
            }

            // Initial load of products if admin is authenticated
            if (isAdminAuthenticated) {
                fetchAndDisplayProductsAdmin();
            }
        } // End of initializeAdminPageControls()
    } // End of admin.html specific logic


    // Products Page specific logic (using card grid and dynamic forms)
    if (window.location.pathname.includes('products.html')) {
        // This is the new product display/management for the general products page
        // It uses the dynamic form creation approach.

        // Function to fetch and display products in a grid (from products.js logic)
        async function showProducts() {
            const productsManagementSection = document.getElementById('productsManagementSection');
            if (!productsManagementSection) {
                console.error("productsManagementSection div not found in products.html. Ensure the ID is correct.");
                return;
            }

            productsManagementSection.innerHTML = '<p>Loading products...</p>'; // Initial loading message

            const role = localStorage.getItem('userRole'); // Use 'userRole' from your login
            const isAdmin = role === 'Admin';

            try {
                const response = await fetch(`${BASE_URL}/api/Products`, {
                    method: 'GET',
                    headers: getAuthHeaders() // Includes JWT token from localStorage (if available)
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        productsManagementSection.innerHTML = '<h2>You need to be logged in to view products.</h2><p>Please log in through the Home page.</p>';
                    } else if (response.status === 403) {
                        productsManagementSection.innerHTML = '<h2>You do not have permission to view products.</h2>';
                    } else {
                        const errorData = await response.json().catch(() => ({ message: response.statusText }));
                        productsManagementSection.innerHTML = `<h2>Failed to load products: ${errorData.message || response.statusText}</h2>`;
                    }
                    return;
                }

                const products = await response.json();

                productsManagementSection.innerHTML = `
                    ${isAdmin ? '<button id="addNewProductBtn" class="btn btn-success my-3">Add New Product</button>' : ''}
                    <div id="createUpdateProductFormContainer" class="hidden my-4"></div>
                    <div id="productsListContainer"></div>
                `;

                if (isAdmin) {
                    document.getElementById('addNewProductBtn').addEventListener('click', showCreateProductForm);
                }

                const productsListContainer = document.getElementById('productsListContainer');

                if (products.length === 0) {
                    productsListContainer.innerHTML = '<p>No products found.</p>';
                    return;
                }

                const productsGrid = document.createElement('div');
                productsGrid.className = 'row';

                products.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.className = 'col-md-4 mb-4';

                    productCard.innerHTML = `
                        <div class="card h-100">
                            <img src="${product.productImagePath || 'https://via.placeholder.com/150/0000FF/FFFFFF?text=No+Image'}" class="card-img-top" alt="${product.productName}" style="height: 180px; object-fit: cover;">
                            <div class="card-body">
                                <h5 class="card-title">${product.productName}</h5>
                                <p class="card-text">Category: ${product.productCategory}</p>
                                <p class="card-text">Price: $${product.productPrice.toFixed(2)}</p>
                                <p class="card-text">Quantity: ${product.productQuantity}</p>
                            </div>
                            ${isAdmin ? `
                            <div class="card-footer d-flex justify-content-around">
                                <button class="btn btn-warning btn-sm edit-product-btn" data-id="${product.productId}">Edit</button>
                                <button class="btn btn-danger btn-sm delete-product-btn" data-id="${product.productId}">Delete</button>
                            </div>
                            ` : ''}
                        </div>
                    `;
                    productsGrid.appendChild(productCard);
                });
                productsListContainer.appendChild(productsGrid);

                if (isAdmin) {
                    document.querySelectorAll('.edit-product-btn').forEach(button => {
                        button.addEventListener('click', (event) => showUpdateProductForm(event.target.dataset.id));
                    });
                    document.querySelectorAll('.delete-product-btn').forEach(button => {
                        button.addEventListener('click', (event) => deleteProduct(event.target.dataset.id));
                    });
                }

            } catch (error) {
                console.error('Error fetching products:', error);
                productsManagementSection.innerHTML = `<h2>Error loading products. Please try again.</h2><p>${error.message}</p>`;
            }
        }

        // Generic function to render a product form (for create or update)
        function renderProductForm(product = {}, isUpdate = false) {
            const formContainer = document.getElementById('createUpdateProductFormContainer');
            const productsListContainer = document.getElementById('productsListContainer');

            productsListContainer.classList.add('hidden');
            formContainer.classList.remove('hidden');

            const formTitle = isUpdate ? `Update Product (ID: ${product.productId})` : 'Create New Product';
            const submitButtonText = isUpdate ? 'Update Product' : 'Create Product';
            const productIdField = isUpdate ? `<input type="hidden" id="formProductId" value="${product.productId}">` : '';

            formContainer.innerHTML = `
                <h2 class="mb-3">${formTitle}</h2>
                <form id="productForm">
                    ${productIdField}
                    <div class="mb-3">
                        <label for="formProductCategory" class="form-label">Category</label>
                        <input type="text" class="form-control" id="formProductCategory" value="${product.productCategory || ''}" required>
                    </div>
                    <div class="mb-3">
                        <label for="formProductName" class="form-label">Name</label>
                        <input type="text" class="form-control" id="formProductName" value="${product.productName || ''}" required>
                    </div>
                    <div class="mb-3">
                        <label for="formProductQuantity" class="form-label">Quantity</label>
                        <input type="text" class="form-control" id="formProductQuantity" value="${product.productQuantity || ''}" pattern="[0-9]{1,3}" title="Max 3 digits" required>
                    </div>
                    <div class="mb-3">
                        <label for="formProductPrice" class="form-label">Price</label>
                        <input type="number" step="0.01" class="form-control" id="formProductPrice" value="${product.productPrice || ''}" required>
                    </div>
                    <div class="mb-3">
                        <label for="formProductImage" class="form-label">Image Path</label>
                        <input type="text" class="form-control" id="formProductImage" value="${product.productImagePath || ''}">
                    </div>
                    <button type="submit" class="btn btn-success">${submitButtonText}</button>
                    <button type="button" class="btn btn-secondary" onclick="hideProductForm()">Cancel</button>
                </form>
            `;

            document.getElementById('productForm').onsubmit = async (event) => {
                event.preventDefault();
                const productData = {
                    productCategory: document.getElementById('formProductCategory').value,
                    productName: document.getElementById('formProductName').value,
                    productQuantity: document.getElementById('formProductQuantity').value,
                    productPrice: parseFloat(document.getElementById('formProductPrice').value),
                    productImagePath: document.getElementById('formProductImage').value
                };

                if (isUpdate) {
                    productData.productId = document.getElementById('formProductId').value;
                    await updateProductApiCall(productData);
                } else {
                    await createProductApiCall(productData);
                }
                hideProductForm();
            };
        }

        // Hides the form and shows the product list again
        function hideProductForm() {
            document.getElementById('createUpdateProductFormContainer').classList.add('hidden');
            document.getElementById('productsListContainer').classList.remove('hidden');
            showProducts(); // Re-fetch and display products to ensure list is up-to-date
        }

        // --- ADMIN-ONLY Product Actions for Products Page (if user is Admin) ---

        function showCreateProductForm() {
            renderProductForm({}, false);
        }

        async function createProductApiCall(newProductData) {
            console.log('Attempting to create product:', newProductData);
            try {
                const response = await fetch(`${BASE_URL}/api/Products`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(newProductData)
                });
                const data = await response.json().catch(() => ({ message: response.statusText }));
                if (response.ok) {
                    console.log('Product created successfully:', data);
                    alert('Product created successfully!');
                } else {
                    console.error('Failed to create product:', response.status, data);
                    alert(`Failed to create product: ${data.message || response.statusText}`);
                }
            } catch (error) {
                console.error('Error creating product:', error);
                alert('Error creating product. See console for details.');
            }
        }

        async function showUpdateProductForm(productId) {
            console.log(`Fetching product for update: ${productId}`);
            try {
                const response = await fetch(`${BASE_URL}/api/Products/${productId}`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: response.statusText }));
                    alert(`Failed to fetch product for update: ${errorData.message || response.statusText}`);
                    return;
                }
                const product = await response.json();
                renderProductForm(product, true);
            } catch (error) {
                console.error('Error fetching product for update:', error);
                alert('Error loading product for update. See console for details.');
            }
        }

        async function updateProductApiCall(productData) {
            console.log('Attempting to update product:', productData);
            try {
                const response = await fetch(`${BASE_URL}/api/Products/${productData.productId}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(productData)
                });
                if (response.status === 204) {
                    console.log('Product updated successfully.');
                    alert('Product updated successfully!');
                } else {
                    const errorData = await response.json().catch(() => ({ message: response.statusText }));
                    console.error('Failed to update product:', response.status, errorData);
                    alert(`Failed to update product: ${errorData.message || response.statusText}`);
                }
            } catch (error) {
                console.error('Error updating product:', error);
                alert('Error updating product. See console for details.');
            }
        }

        async function deleteProduct(productId) {
            if (!confirm(`Are you sure you want to delete product ID: ${productId}?`)) {
                return;
            }
            console.log(`Attempting to delete product ID: ${productId}`);
            try {
                const response = await fetch(`${BASE_URL}/api/Products/${productId}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });
                if (response.status === 204) {
                    console.log('Product deleted successfully.');
                    alert('Product deleted successfully!');
                    showProducts();
                } else if (response.status === 404) {
                    console.warn(`Product with ID ${productId} not found for deletion.`);
                    alert('Product not found for deletion.');
                } else {
                    const errorData = await response.json().catch(() => ({ message: response.statusText }));
                    console.error('Failed to delete product:', response.status, errorData);
                    alert(`Failed to delete product: ${errorData.message || response.statusText}`);
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Error deleting product. See console for details.');
            }
        }
        
        // Initial call to load products when on products.html
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
            showProducts();
        } else {
            // Optional: Show a message or redirect if not logged in
            const productsManagementSection = document.getElementById('productsManagementSection');
            if (productsManagementSection) {
                productsManagementSection.innerHTML = '<h2>Please log in to view products.</h2>';
            }
        }
    } // End of products.html specific logic


    // Purchase Page specific logic (from purchase.js)
    if (window.location.pathname.includes('purchase.html')) {
        const productNameElement = document.getElementById('product-name');
        const productPriceElement = document.getElementById('product-price');

        function getProductIdFromUrl() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('id');
        }

        const productId = getProductIdFromUrl();

        if (productId) {
            fetch(`${BASE_URL}/api/Products/${productId}`, { // Use BASE_URL and correct endpoint for single product
                headers: getAuthHeaders() // Include auth headers if purchase page requires login to see details
            })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) throw new Error('Product not found.');
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(product => {
                if (product) {
                    // Use camelCase properties as per C# backend
                    productNameElement.textContent = product.productName;
                    productPriceElement.textContent = `Price: $${product.productPrice.toFixed(2)}`;
                    
                    const productIdInput = document.getElementById('productId'); // Assuming an input for purchase form
                    if (productIdInput) {
                        productIdInput.value = product.productId;
                    }
                } else {
                    const productContainer = document.querySelector('.product-details .product-container');
                    if (productContainer) {
                        productContainer.textContent = 'Product not found.';
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching product details:', error);
                const productContainer = document.querySelector('.product-details .product-container');
                if (productContainer) {
                    productContainer.textContent = `Failed to load product details: ${error.message}`;
                }
            });
        } else {
            const productContainer = document.querySelector('.product-details .product-container');
            if (productContainer) {
                productContainer.textContent = 'No product selected.';
            }
        }
    } // End of purchase.html specific logic

}); // End of main DOMContentLoaded