let adminProducts = [];
let editingProductId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadAdminProducts();
    displayAdminProducts();
    displayOrders();
    updateStats();
    setupAdminModal();
    setupFilters();
    setupLogout();
});

function loadAdminProducts() {
    const savedProducts = localStorage.getItem('adminProducts');
    if (savedProducts) {
        adminProducts = JSON.parse(savedProducts);
    } else {
        adminProducts = [...products];
        saveAdminProducts();
    }
}

function saveAdminProducts() {
    localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
    if (typeof products !== 'undefined') {
        products.length = 0;
        products.push(...adminProducts);
    }
}

function displayAdminProducts(filter = 'all') {
    const table = document.getElementById('admin-products-table');
    let displayProducts = adminProducts;

    if (filter !== 'all') {
        displayProducts = adminProducts.filter(p => p.category === filter);
    }

    if (displayProducts.length === 0) {
        table.innerHTML = '<p class="no-data">Ürün bulunamadı</p>';
        return;
    }

    table.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Ürün</th>
                    <th>Kategori</th>
                    <th>Fiyat</th>
                    <th>Öne Çıkan</th>
                    <th>İşlemler</th>
                </tr>
            </thead>
            <tbody>
                ${displayProducts.map(product => `
                    <tr>
                        <td>${product.id}</td>
                        <td>
                            <div class="product-cell">
                                <span class="table-icon">${product.image}</span>
                                ${product.name}
                            </div>
                        </td>
                        <td>${getCategoryName(product.category)}</td>
                        <td>₺${product.price}</td>
                        <td>${product.featured ? '✓' : '-'}</td>
                        <td>
                            <button class="btn-edit" data-id="${product.id}">Düzenle</button>
                            <button class="btn-delete" data-id="${product.id}">Sil</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    setupTableActions();
}

function setupTableActions() {
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            editProduct(parseInt(this.dataset.id));
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteProduct(parseInt(this.dataset.id));
        });
    });
}

function updateStats() {
    document.getElementById('total-products').textContent = adminProducts.length;
    
    const orders = localStorage.getItem('orders');
    const orderCount = orders ? JSON.parse(orders).length : 0;
    document.getElementById('total-orders').textContent = orderCount;
}

function setupAdminModal() {
    const modal = document.getElementById('product-modal');
    const addBtn = document.getElementById('add-product-btn');
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const form = document.getElementById('product-form');

    addBtn.addEventListener('click', function() {
        openModal();
    });

    closeBtn.addEventListener('click', function() {
        closeModal();
    });

    cancelBtn.addEventListener('click', function() {
        closeModal();
    });

    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveProduct();
    });
}

function openModal(product = null) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('modal-title');
    
    if (product) {
        title.textContent = 'Ürün Düzenle';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-image').value = product.image;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-sizes').value = product.sizes.join(', ');
        document.getElementById('product-featured').checked = product.featured;
        editingProductId = product.id;
    } else {
        title.textContent = 'Yeni Ürün Ekle';
        document.getElementById('product-form').reset();
        document.getElementById('product-id').value = '';
        editingProductId = null;
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('product-modal').style.display = 'none';
    document.getElementById('product-form').reset();
    editingProductId = null;
}

function saveProduct() {
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const price = parseInt(document.getElementById('product-price').value);
    const image = document.getElementById('product-image').value;
    const description = document.getElementById('product-description').value;
    const sizesStr = document.getElementById('product-sizes').value;
    const sizes = sizesStr.split(',').map(s => s.trim());
    const featured = document.getElementById('product-featured').checked;

    const productData = {
        name, category, price, image, description, sizes, featured
    };

    if (editingProductId) {
        const index = adminProducts.findIndex(p => p.id === editingProductId);
        if (index !== -1) {
            adminProducts[index] = { ...adminProducts[index], ...productData };
        }
    } else {
        const newId = Math.max(...adminProducts.map(p => p.id), 0) + 1;
        adminProducts.push({
            id: newId,
            ...productData
        });
    }

    saveAdminProducts();
    displayAdminProducts();
    updateStats();
    closeModal();
    showNotification(editingProductId ? 'Ürün güncellendi!' : 'Ürün eklendi!');
}

function editProduct(id) {
    const product = adminProducts.find(p => p.id === id);
    if (product) {
        openModal(product);
    }
}

function deleteProduct(id) {
    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
        adminProducts = adminProducts.filter(p => p.id !== id);
        saveAdminProducts();
        displayAdminProducts();
        updateStats();
        showNotification('Ürün silindi!');
    }
}

function setupFilters() {
    document.getElementById('admin-category-filter').addEventListener('change', function(e) {
        displayAdminProducts(e.target.value);
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

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

function displayOrders() {
    // admin-enhanced.js tarafından override edilir
}

function viewOrder(orderId) {
    if (typeof window.openOrderDetail === 'function') {
        window.openOrderDetail(orderId);
    }
}

function deleteOrder(orderId) {
    if (confirm('Bu siparişi silmek istediğinizden emin misiniz?')) {
        let orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders = orders.filter(o => o.id !== orderId);
        localStorage.setItem('orders', JSON.stringify(orders));
        displayOrders();
        updateStats();
        showNotification('Sipariş silindi!');
    }
}

function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.removeItem('adminLoggedIn');
            window.location.href = 'login.html';
        });
    }
}

