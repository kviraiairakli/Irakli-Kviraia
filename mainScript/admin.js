document.addEventListener('DOMContentLoaded', () => {
    const USER_API_LOGIN_URL = 'https://localhost:7038/api/Users/login';
    const PRODUCTS_API_BASE_URL = 'https://localhost:7038/api/Products';

    // Admin Login Modal Elements (ensure these IDs exist in admin.html)
    const adminLoginModal = document.getElementById('adminLoginModal');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const closeAdminLoginModalBtn = document.getElementById('closeAdminLoginModalBtn');
    const adminLoginErrorMsg = document.getElementById('adminLoginError');

    let isAdminAuthenticated = false;

    function showAdminLoginModal() {
        if (adminLoginModal) {
            adminLoginModal.classList.add('active');
        } else {
            // Fallback if modal HTML is missing
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
        // Assuming updateNavVisibility is globally available from home.js
        if (typeof updateNavVisibility === 'function') {
            updateNavVisibility();
        }
        initializeAdminPageControls(); // Initialize the main admin page content
    }

    function redirectToHome() {
        window.location.href = 'index.html'; // Redirect to homepage
    }

    // Auth check
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userRole = localStorage.getItem('userRole');

    if (!isLoggedIn || userRole !== 'admin') {
        // If not an admin, clear any existing login state and show login modal
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        if (typeof updateNavVisibility === 'function') {
            updateNavVisibility(); // Update nav to reflect logged-out state
        }
        showAdminLoginModal();
    } else {
        isAdminAuthenticated = true;
        initializeAdminPageControls(); // Already admin, proceed to initialize
    }

    // Event listener for the admin login form submission
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (adminLoginErrorMsg) adminLoginErrorMsg.style.display = 'none';

            const emailInput = document.getElementById('adminLoginEmail');
            const passwordInput = document.getElementById('adminLoginPassword');
            const email = emailInput ? emailInput.value : '';
            const password = passwordInput ? passwordInput.value : '';

            try {
                const response = await fetch(USER_API_LOGIN_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_login: email, user_password: password })
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userRole', data.user_role);

                    if (data.user_role === 'admin') {
                        handleSuccessfulAdminLogin();
                    } else {
                        alert('Access Denied. You are not an admin.');
                        localStorage.removeItem('isLoggedIn'); // Clear login state
                        localStorage.removeItem('userRole');
                        if (typeof updateNavVisibility === 'function') {
                            updateNavVisibility();
                        }
                        closeAdminLoginModal(); // Close modal before redirect
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

    // Event listener for closing the admin login modal (X button)
    if (closeAdminLoginModalBtn) {
        closeAdminLoginModalBtn.addEventListener('click', () => {
            closeAdminLoginModal();
            if (!isAdminAuthenticated) { // If modal closed without successful admin login
                redirectToHome();
            }
        });
    }

    // Close admin login modal if clicking outside of it
    window.addEventListener('click', (event) => {
        if (adminLoginModal && event.target === adminLoginModal && adminLoginModal.classList.contains('active')) {
            if (!isAdminAuthenticated) { // Only redirect if not yet authenticated as admin
                closeAdminLoginModal();
                redirectToHome();
            }
        }
    });


    // This function encapsulates all the original admin page setup and controls
    function initializeAdminPageControls() {
        if (!isAdminAuthenticated) {
            // Safeguard: if this function is called without admin auth,
            // and modal isn't showing, redirect.
            if (!adminLoginModal || !adminLoginModal.classList.contains('active')) {
                alert('Authentication required to access admin controls.');
                redirectToHome();
            }
            return;
        }

        // DOM Elements for Product Management
        const productsTableBody = document.getElementById('productsTableBody');
        const showAddProductFormBtn = document.getElementById('showAddProductFormBtn');
        const productModal = document.getElementById('productModal'); // This is the Add/Edit Product modal
        const closeProductModalBtn = document.getElementById('closeProductModalBtn');
        const productForm = document.getElementById('productForm');
        const productModalTitle = document.getElementById('productModalTitle');
        const productIdInput = document.getElementById('productId'); // Hidden input for product ID

    // --- Modal Handling ---
    function openProductModal(mode = 'add', product = null) {
        if (productForm) productForm.reset(); // Clear form
        if (productIdInput) productIdInput.value = ''; // Clear hidden product ID

        if (productModalTitle) {
            if (mode === 'add') {
                productModalTitle.textContent = 'Add New Product';
            } else if (mode === 'edit' && product) {
                productModalTitle.textContent = 'Edit Product';
                if (productIdInput) productIdInput.value = product.product_id; // Ensure your product object has product_id
                const productNameEl = document.getElementById('productName');
                const productCategoryEl = document.getElementById('productCategory');
                const productPriceEl = document.getElementById('productPrice');
                const productQuantityEl = document.getElementById('productQuantity');
                const productDescriptionEl = document.getElementById('productDescription');
                const productImageURLEl = document.getElementById('productImageURL');

                if (productNameEl) productNameEl.value = product.product_name;
                if (productCategoryEl) productCategoryEl.value = product.product_category;
                if (productPriceEl) productPriceEl.value = product.product_price;
                if (productQuantityEl) productQuantityEl.value = product.product_quantity;
                if (productDescriptionEl) productDescriptionEl.value = product.product_description || '';
                if (productImageURLEl) productImageURLEl.value = product.product_image_url || '';
            }
        }
        if (productModal) productModal.classList.add('active');
    }

    function closeProductModal() {
        if (productModal) {
            productModal.classList.remove('active');
        }
    }

    if (showAddProductFormBtn) {
        showAddProductFormBtn.addEventListener('click', () => openProductModal('add'));
    }
    if (closeProductModalBtn) {
        closeProductModalBtn.addEventListener('click', closeProductModal);
    }
    // Close PRODUCT modal if clicking outside of it
    window.addEventListener('click', (event) => { // Note: This is a general window click listener
        if (productModal && event.target === productModal && productModal.classList.contains('active')) {
            closeProductModal();
        }
    });


    // --- CRUD Operations ---

    // 1. Fetch and Display Products (Read)
    async function fetchAndDisplayProducts() {
        try {
            const response = await fetch(PRODUCTS_API_BASE_URL);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const products = await response.json();

            if (productsTableBody) {
                productsTableBody.innerHTML = ''; // Clear existing rows
                products.forEach(product => {
                    const row = productsTableBody.insertRow();
                    row.innerHTML = `
                        <td>${product.product_id}</td>
                        <td>${product.product_name}</td>
                        <td>${product.product_category}</td>
                        <td>$${parseFloat(product.product_price).toFixed(2)}</td>
                        <td>${product.product_quantity}</td>
                        <td>
                            <button class="action-btn edit-btn" data-id="${product.product_id}">Edit</button>
                            <button class="action-btn delete-btn" data-id="${product.product_id}">Delete</button>
                        </td>
                    `;
                });
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            if (productsTableBody) {
                productsTableBody.innerHTML = '<tr><td colspan="6">Error loading products.</td></tr>';
            }
        }
    }

    // 2. Add or Edit Product (Create/Update)
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = productIdInput ? productIdInput.value : ''; // Will be empty for 'add', populated for 'edit'
            const productNameEl = document.getElementById('productName');
            const productCategoryEl = document.getElementById('productCategory');
            const productPriceEl = document.getElementById('productPrice');
            const productQuantityEl = document.getElementById('productQuantity');
            const productDescriptionEl = document.getElementById('productDescription');
            const productImageURLEl = document.getElementById('productImageURL');

            const productData = {
                // Ensure these names match your backend API's expected model
                product_name: productNameEl ? productNameEl.value : '',
                product_category: productCategoryEl ? productCategoryEl.value : '',
                product_price: productPriceEl ? parseFloat(productPriceEl.value) : 0,
                product_quantity: productQuantityEl ? parseInt(productQuantityEl.value) : 0,
                product_description: productDescriptionEl ? productDescriptionEl.value : '',
                product_image_url: productImageURLEl ? productImageURLEl.value : ''
            };

            const method = id ? 'PUT' : 'POST';
            const url = id ? `${PRODUCTS_API_BASE_URL}/${id}` : PRODUCTS_API_BASE_URL;

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                alert(`Product ${id ? 'updated' : 'added'} successfully!`);
                closeProductModal();
                fetchAndDisplayProducts(); // Refresh the list
            } catch (error) {
                console.error(`Error ${id ? 'updating' : 'adding'} product:`, error);
                alert(`Failed to ${id ? 'update' : 'add'} product. ${error.message}`);
            }
        });
    }

    // 3. Delete Product & Edit Product (Event delegation for buttons in table)
    if (productsTableBody) {
        productsTableBody.addEventListener('click', async (e) => {
            const target = e.target;
            const productId = target.dataset.id;

            if (!productId) return; // Clicked on something else

            // Handle Delete
            if (target.classList.contains('delete-btn')) {
                if (confirm(`Are you sure you want to delete product ID ${productId}?`)) {
                    try {
                        const response = await fetch(`${PRODUCTS_API_BASE_URL}/${productId}`, { method: 'DELETE' });
                        if (!response.ok) {
                            const errorData = await response.text(); // Or .json() if backend sends JSON error
                            throw new Error(errorData || `HTTP error! status: ${response.status}`);
                        }
                        alert('Product deleted successfully!');
                        fetchAndDisplayProducts(); // Refresh list
                    } catch (error) {
                        console.error('Error deleting product:', error);
                        alert(`Failed to delete product. ${error.message}`);
                    }
                }
            }

            // Handle Edit: Fetch product details and open modal
            if (target.classList.contains('edit-btn')) {
                try {
                    // Assuming you have an endpoint like /api/Products/details/{id} or just /api/Products/{id} for GET by ID
                    // Adjust if your "get single product" endpoint is different
                    const response = await fetch(`${PRODUCTS_API_BASE_URL}/details/${productId}`); // Or just `${PRODUCTS_API_BASE_URL}/${productId}`
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`HTTP error! status: ${response.status}. ${errorText}`);
                    }
                    const product = await response.json();
                    openProductModal('edit', product);
                } catch (error) {
                    console.error('Error fetching product details for edit:', error);
                    alert('Failed to load product details for editing.');
                }
            }
        });
    }


    // Initial load of products if admin is authenticated
    if (isAdminAuthenticated) {
        fetchAndDisplayProducts();
    }

    } // End of initializeAdminPageControls
});
