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
    let logoutButton = document.getElementById('logoutButton'); // Assuming a logout button

    // Hide/show login/register links
    if (loginLinkElement) {
        loginLinkElement.style.display = isLoggedIn ? 'none' : '';
    }
    if (registerLinkElement) {
        registerLinkElement.style.display = isLoggedIn ? 'none' : '';
    }

    // Handle Logout button visibility
    if (logoutButton) {
        logoutButton.style.display = isLoggedIn ? '' : 'none';
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


    // --- General Page-Specific Initialization ---

    // Initialize nav visibility on every page load
    updateNavVisibility();

    // --- Purchase Form Handling ---
    // This handles the form submission on purchaseForm.html
    const purchaseForm = document.getElementById('purchaseForm');
    if (purchaseForm) { // Ensure the form exists before attaching listener
        const urlParams = new URLSearchParams(window.location.search);
        const productIdForPurchaseForm = urlParams.get('id'); // Renamed to avoid conflict
        const productIdElement = document.getElementById('productId');
        if (productIdElement) {
            productIdElement.value = productIdForPurchaseForm;
        }

        purchaseForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(purchaseForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`${BASE_URL}/api/purchases`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    alert('Purchase information submitted successfully!');
                    purchaseForm.reset();
                } else {
                    alert('Failed to submit purchase information.');
                }
            } catch (error) {
                console.error('Error submitting purchase information:', error);
                alert('An error occurred while submitting the purchase information.');
            }
        });
    }

    // --- Contact Form Handling ---
    // This handles the form submission on contact.html
    const contactForm = document.getElementById('contactForm');
    if (contactForm) { // Ensure the form exists before attaching listener
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`${BASE_URL}/api/contacts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    alert('Contact information submitted successfully!');
                    contactForm.reset();
                } else {
                    alert('Failed to submit contact information.');
                }
            } catch (error) {
                console.error('Error submitting contact information:', error);
                alert('An error occurred while submitting the contact information.');
            }
        });
    }

    // --- Product Detail Display (for purchase.html) ---
    // This handles displaying a single product's details on purchase.html
    async function fetchProduct(id) {
        try {
            // Using BASE_URL for consistency
            const response = await fetch(`${BASE_URL}/api/products/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const product = await response.json();
            return product;
        } catch (error) {
            console.error('Error fetching product:', error);
            return null;
        }
    }

    async function displayProductDetails() {
        const currentUrlParams = new URLSearchParams(window.location.search);
        const currentProductId = currentUrlParams.get('id');

        if (!currentProductId) {
            console.error('Product ID is missing from the URL.');
            const productContainer = document.querySelector('.product-container');
            if (productContainer) {
                productContainer.textContent = 'Product ID is missing.';
            }
            return;
        }

        const product = await fetchProduct(currentProductId);

        if (product) {
            // Check if elements exist before trying to update them
            const productNameEl = document.getElementById('product-name');
            const productImageEl = document.getElementById('product-image');
            const productDescriptionEl = document.getElementById('product-description');
            const productPriceEl = document.getElementById('product-price');

            // IMPORTANT: Use product.productName, product.productImagePath, product.productDescription, product.productPrice
            // based on your C# backend API response structure (camelCase).
            if (productNameEl) productNameEl.textContent = product.productName;
            if (productImageEl) {
                productImageEl.src = product.productImagePath;
                productImageEl.alt = product.productName;
            }
            if (productDescriptionEl) productDescriptionEl.textContent = product.productDescription;
            if (productPriceEl) productPriceEl.textContent = `Price: $${parseFloat(product.productPrice).toFixed(2)}`; // Ensure price is float
        } else {
            const productContainer = document.querySelector('.product-container');
            if (productContainer) {
                productContainer.textContent = 'Product not found.';
            }
        }
    }

    // Function to handle the purchase button click (for product detail page)
    const purchaseButtonOnDetail = document.getElementById('purchase-button');
    if (purchaseButtonOnDetail) {
        purchaseButtonOnDetail.addEventListener('click', () => {
            const currentUrlParams = new URLSearchParams(window.location.search);
            const currentProductId = currentUrlParams.get('id');
            if (currentProductId) {
                window.location.href = `purchaseForm.html?id=${currentProductId}`;
            } else {
                console.warn('Cannot navigate to purchase form: Product ID not found in URL.');
                alert('Could not determine product to purchase.');
            }
        });
    }

    // Only call displayProductDetails if we are likely on a product detail page (e.g., purchase.html)
    if (window.location.pathname.includes('purchase.html')) {
        displayProductDetails();
    }


    // --- Product Listing & Filtering (for products.html) ---
    async function fetchProductsForDisplay() {
        try {
            const response = await fetch(`${BASE_URL}/api/products`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const products = await response.json();
            return products;
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }

    async function displayProductsInGrid(filteredCategories = []) {
        const products = await fetchProductsForDisplay();
        const productsContainer = document.querySelector('.products-container');
        if (!productsContainer) {
            console.error('Products container not found.');
            return;
        }
        productsContainer.innerHTML = ''; // Clear previous content

        if (products.length === 0) {
            productsContainer.textContent = "No products found. Please try again later.";
            return;
        }

        const productsToDisplay = filteredCategories.length === 0
            ? products // If no categories are filtered, show all
            : products.filter(product => filteredCategories.includes(product.productCategory.toLowerCase())); // Ensure case-insensitive match

        if (productsToDisplay.length === 0) {
            const noProductsMessage = document.createElement('p');
            noProductsMessage.textContent = "No products match the selected filters.";
            productsContainer.appendChild(noProductsMessage);
            return;
        }

        const productsByCategory = {};
        productsToDisplay.forEach(product => {
            // Use product.productCategory from your C# backend
            if (!productsByCategory[product.productCategory]) {
                productsByCategory[product.productCategory] = [];
            }
            productsByCategory[product.productCategory].push(product);
        });

        for (const category in productsByCategory) {
            // Only render category if it's in filteredCategories or if no filters are applied (meaning show all)
            if (filteredCategories.length === 0 || filteredCategories.includes(category.toLowerCase())) {
                let categoryTitle = document.getElementById(`${category}-products-title`);
                if (!categoryTitle) {
                    categoryTitle = document.createElement('h2');
                    categoryTitle.classList.add('category-title');
                    categoryTitle.id = `${category}-products-title`;
                    categoryTitle.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} Products`;
                    productsContainer.appendChild(categoryTitle);
                }

                const categoryGrid = document.createElement('div');
                categoryGrid.classList.add('collections-grid');
                categoryGrid.setAttribute('data-category', category);

                productsByCategory[category].forEach(product => {
                    const productLink = document.createElement('a');
                    productLink.href = `purchase.html?id=${product.productId}`; // Use product.productId
                    productLink.classList.add('collection');

                    const imageContainer = document.createElement('div');
                    imageContainer.classList.add('collection-image-container');

                    const image = document.createElement('img');
                    image.src = product.productImagePath; // Use product.productImagePath
                    image.alt = product.productName;

                    const overlay = document.createElement('div');
                    overlay.classList.add('collection-overlay');

                    const productName = document.createElement('h3');
                    productName.textContent = `"${product.productName}"`; // Use product.productName

                    imageContainer.appendChild(image);
                    imageContainer.appendChild(overlay);
                    productLink.appendChild(imageContainer);
                    productLink.appendChild(productName);
                    categoryGrid.appendChild(productLink);
                });

                productsContainer.appendChild(categoryGrid);
            }
        }
        updateCheckmarkStyles(filteredCategories);
    }

    function handleFilterChange() {
        const filterCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
        const selectedCategories = [];
        filterCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedCategories.push(checkbox.value);
            }
        });
        displayProductsInGrid(selectedCategories);
    }

    function updateCheckmarkStyles(selectedCategories) {
        const filterCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
        filterCheckboxes.forEach(checkbox => {
            const checkmark = checkbox.nextElementSibling; // Get the checkmark span
            if (checkmark) {
                if (selectedCategories.includes(checkbox.value)) {
                    checkmark.classList.add('filled');
                } else {
                    checkmark.classList.remove('filled');
                }
            }
        });
    }

    // Attach listeners for product filtering and initial display for products.html
    if (window.location.pathname.includes('products.html')) {
        const filterCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
        if (filterCheckboxes.length > 0) {
            filterCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', handleFilterChange);
            });
            // Initial call to display products based on default checked filters
            handleFilterChange();
        } else {
            // If no filter checkboxes are present but it's products.html, display all products
            displayProductsInGrid([]); // Passing an empty array implies showing all
        }
    }


    // --- Admin Page specific logic (from admin.js) ---
    if (window.location.pathname.includes('admin.html')) {
        const adminLoginModal = document.getElementById('adminLoginModal');
        const adminLoginForm = document.getElementById('adminLoginForm');
        const closeAdminLoginModalBtn = document.getElementById('closeAdminLoginModalBtn');
        const adminLoginErrorMsg = document.getElementById('adminLoginError');

        let isAdminAuthenticated = false; // Tracks if authenticated for this session on admin page

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

        // Initial check for admin access on admin.html
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userRole = localStorage.getItem('userRole');
        const token = localStorage.getItem('token'); // Check for token for full auth

        if (!isLoggedIn || userRole !== 'Admin' || !token) { // Added token check
            // Clear any lingering non-admin state if they somehow got here
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userRole');
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            updateNavVisibility(); // Ensure nav is updated to reflect non-admin state
            showAdminLoginModal(); // Show the login modal for admin access
        } else {
            // If already logged in as admin, initialize controls
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
                            localStorage.removeItem('token');
                            localStorage.removeItem('userId');
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
            const adminProductIdInput = document.getElementById('adminProductId'); // Renamed to avoid ID conflict
            // Ensure you update your admin.html to use id="adminProductId" for the hidden input

            // --- Modal Handling for Admin Product Forms ---
            function openAdminProductModal(mode = 'add', product = null) {
                if (productForm) productForm.reset();
                if (adminProductIdInput) adminProductIdInput.value = '';

                if (productModalTitle) {
                    if (mode === 'add') {
                        productModalTitle.textContent = 'Add New Product';
                    } else if (mode === 'edit' && product) {
                        productModalTitle.textContent = 'Edit Product';
                        if (adminProductIdInput) adminProductIdInput.value = product.productId; // Use camelCase productId

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

                    const id = adminProductIdInput ? adminProductIdInput.value : ''; // Use adminProductIdInput
                    
                    const productData = {
                        productId: id ? parseInt(id) : 0, // Include productId for PUT, 0 for POST (will be ignored by backend on POST)
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
});