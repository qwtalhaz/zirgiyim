document.addEventListener('DOMContentLoaded', function() {
    displayProducts();
    setupFilters();
});

let currentCategory = 'all';
let currentSort = 'default';

function displayProducts() {
    const grid = document.getElementById('products-grid');
    let filteredProducts = [...products];

    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
        currentCategory = categoryParam;
        document.getElementById('category-filter').value = categoryParam;
    }

    if (currentCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === currentCategory);
    }

    filteredProducts = sortProducts(filteredProducts);

    grid.innerHTML = filteredProducts.map(product => `
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

function sortProducts(products) {
    switch(currentSort) {
        case 'price-asc':
            return products.sort((a, b) => a.price - b.price);
        case 'price-desc':
            return products.sort((a, b) => b.price - a.price);
        case 'name':
            return products.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        default:
            return products;
    }
}

function setupFilters() {
    document.getElementById('category-filter').addEventListener('change', function(e) {
        currentCategory = e.target.value;
        displayProducts();
    });

    document.getElementById('sort-filter').addEventListener('change', function(e) {
        currentSort = e.target.value;
        displayProducts();
    });
}

function getCategoryName(category) {
    const categories = {
        'erkek': 'Erkek Giyim',
        'kadin': 'Kadın Giyim',
        'aksesuar': 'Aksesuar'
    };
    return categories[category] || category;
}
