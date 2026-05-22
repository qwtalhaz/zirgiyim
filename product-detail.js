document.addEventListener('DOMContentLoaded', function() {
    displayProductDetail();
});

function displayProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        document.getElementById('product-detail-content').innerHTML = 
            '<p>Ürün bulunamadı.</p>';
        return;
    }

    const content = document.getElementById('product-detail-content');
    content.innerHTML = `
        <div class="detail-grid">
            <div class="detail-image">
                <img src="${product.image}" alt="${product.name}" class="detail-icon">
            </div>
            <div class="detail-info">
                <h1>${product.name}</h1>
                <p class="detail-category">${getCategoryName(product.category)}</p>
                <p class="detail-price">₺${product.price}</p>
                <p class="detail-description">${product.description}</p>
                
                <div class="size-selector">
                    <label>Beden Seçin:</label>
                    <div class="size-options">
                        ${product.sizes.map(size => `
                            <button class="size-btn" data-size="${size}">${size}</button>
                        `).join('')}
                    </div>
                </div>
                
                <div class="quantity-selector">
                    <label>Miktar:</label>
                    <div class="quantity-controls">
                        <button id="decrease-qty">-</button>
                        <input type="number" id="quantity" value="1" min="1" max="10">
                        <button id="increase-qty">+</button>
                    </div>
                </div>
                
                <button id="add-to-cart" class="btn btn-primary btn-large" disabled>
                    Sepete Ekle
                </button>
            </div>
        </div>
    `;

    setupProductInteractions(product);
}

function setupProductInteractions(product) {
    let selectedSize = null;
    let quantity = 1;

    const sizeBtns = document.querySelectorAll('.size-btn');
    const addToCartBtn = document.getElementById('add-to-cart');
    const quantityInput = document.getElementById('quantity');

    sizeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            sizeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedSize = this.dataset.size;
            addToCartBtn.disabled = false;
        });
    });

    document.getElementById('decrease-qty').addEventListener('click', function() {
        if (quantity > 1) {
            quantity--;
            quantityInput.value = quantity;
        }
    });

    document.getElementById('increase-qty').addEventListener('click', function() {
        if (quantity < 10) {
            quantity++;
            quantityInput.value = quantity;
        }
    });

    quantityInput.addEventListener('change', function() {
        quantity = Math.max(1, Math.min(10, parseInt(this.value) || 1));
        this.value = quantity;
    });

    addToCartBtn.addEventListener('click', function() {
        if (selectedSize) {
            cart.addItem(product, selectedSize, quantity);
        }
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
