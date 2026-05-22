document.addEventListener('DOMContentLoaded', function() {
    const featuredProductsGrid = document.getElementById('featured-products-grid');
    
    if (featuredProductsGrid) {
        displayFeaturedProducts();
    }
});

function displayFeaturedProducts() {
    const featuredProducts = products.filter(p => p.featured).slice(0, 6);
    const grid = document.getElementById('featured-products-grid');
    
    grid.innerHTML = featuredProducts.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" class="product-icon" loading="lazy">
            </div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-category">${getCategoryName(product.category)}</p>
            <p class="product-price">₺${product.price}</p>
            <a href="product-detail.html?id=${product.id}" class="btn btn-secondary btn-small">Detaylar</a>
        </div>
    `).join('');
}

function getCategoryName(category) {
    const categories = {
        'erkek': 'Erkek Giyim',
        'kadin': 'Kadın Giyim',
        'aksesuar': 'Aksesuar'
    };
    return categories[category] || category;
}
