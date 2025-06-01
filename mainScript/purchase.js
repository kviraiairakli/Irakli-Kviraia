document.addEventListener('DOMContentLoaded', () => {
    const productNameElement = document.getElementById('product-name');
    const productPriceElement = document.getElementById('product-price');
    // You might want to add elements in purchase.html to display other details
    // like category and quantity if you want them on this page.

    function getProductIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    const productId = getProductIdFromUrl();

    if (productId) {
        fetch(`https://localhost:7038/api/Products/details/${productId}`)
            .then(response => response.json())
            .then(product => {
                if (product) {
                    productNameElement.textContent = product.Product_name;
                    productPriceElement.textContent = `Price: $${product.Product_price.toFixed(2)}`;
                    // If you want to display category or quantity:
                    // const productCategoryElement = document.getElementById('product-category');
                    // if (productCategoryElement) productCategoryElement.textContent = `Category: ${product.Product_category}`;
                    // const productQuantityElement = document.getElementById('product-quantity');
                    // if (productQuantityElement) productQuantityElement.textContent = `Available: ${product.Product_quantity}`;

                    // Set the product ID in the purchase form (if you have one on this page)
                    const productIdInput = document.getElementById('productId');
                    if (productIdInput) {
                        productIdInput.value = product.Product_id;
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
                    productContainer.textContent = 'Failed to load product details.';
                }
            });
    } else {
        const productContainer = document.querySelector('.product-details .product-container');
        if (productContainer) {
            productContainer.textContent = 'No product selected.';
        }
    }

});