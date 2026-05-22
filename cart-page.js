document.addEventListener('DOMContentLoaded', function () {
    displayCart();
    setupCheckout();
});

function displayCart() {
    const cartContent = document.getElementById('cart-content');
    const cartSummary = document.getElementById('cart-summary');
    const items = cart.getItems();

    if (items.length === 0) {
        cartContent.innerHTML = `
            <div class="empty-cart">
                <p>Sepetiniz boş</p>
                <a href="products.html" class="btn btn-primary">Alışverişe Başla</a>
            </div>`;
        cartSummary.style.display = 'none';
        return;
    }

    cartContent.innerHTML = `
        <div class="cart-items">
            ${items.map(item => `
                <div class="cart-item" data-id="${item.id}" data-size="${item.size}">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}" class="cart-icon">
                    </div>
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p>Beden: ${item.size}</p>
                        <p class="item-price">₺${item.price}</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="qty-btn decrease" data-id="${item.id}" data-size="${item.size}">−</button>
                        <input type="number" value="${item.quantity}" min="1" max="10"
                               class="qty-input" data-id="${item.id}" data-size="${item.size}">
                        <button class="qty-btn increase" data-id="${item.id}" data-size="${item.size}">+</button>
                    </div>
                    <div class="cart-item-total">
                        <p>₺${item.price * item.quantity}</p>
                    </div>
                    <button class="remove-btn" data-id="${item.id}" data-size="${item.size}">×</button>
                </div>
            `).join('')}
        </div>`;

    cartSummary.style.display = 'block';
    updateSummary();
    setupCartInteractions();
}

function updateSummary() {
    document.getElementById('subtotal').textContent = `₺${cart.getSubtotal()}`;
    document.getElementById('shipping').textContent =
        cart.getShipping() === 0 ? 'Ücretsiz' : `₺${cart.getShipping()}`;
    document.getElementById('total').textContent = `₺${cart.getTotal()}`;
}

function setupCartInteractions() {
    document.querySelectorAll('.qty-btn.decrease').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = parseInt(this.dataset.id);
            const size = this.dataset.size;
            const item = cart.getItems().find(i => i.id === id && i.size === size);
            if (item) { cart.updateQuantity(id, size, item.quantity - 1); displayCart(); }
        });
    });

    document.querySelectorAll('.qty-btn.increase').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = parseInt(this.dataset.id);
            const size = this.dataset.size;
            const item = cart.getItems().find(i => i.id === id && i.size === size);
            if (item && item.quantity < 10) { cart.updateQuantity(id, size, item.quantity + 1); displayCart(); }
        });
    });

    document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('change', function () {
            const id = parseInt(this.dataset.id);
            const size = this.dataset.size;
            const quantity = Math.max(1, Math.min(10, parseInt(this.value) || 1));
            cart.updateQuantity(id, size, quantity);
            displayCart();
        });
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            cart.removeItem(parseInt(this.dataset.id), this.dataset.size);
            displayCart();
        });
    });
}

// ─── HATA YÖNETİMİ ───────────────────────────────────────────────────────────

function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.add('input-error');

    // Varsa eski hatayı kaldır
    const existing = field.parentNode.querySelector('.field-error-msg');
    if (existing) existing.remove();

    if (message) {
        const msg = document.createElement('span');
        msg.className = 'field-error-msg';
        msg.textContent = message;
        field.parentNode.appendChild(msg);
    }
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.remove('input-error');
    const existing = field.parentNode.querySelector('.field-error-msg');
    if (existing) existing.remove();
}

function clearAllErrors() {
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.field-error-msg').forEach(el => el.remove());
}

// Kullanıcı yazmaya başlayınca hatayı temizle
function setupLiveValidation() {
    const fields = [
        'customer-name', 'customer-email', 'customer-phone', 'customer-address',
        'card-holder-name', 'card-number', 'card-expiry', 'card-cvc'
    ];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => clearFieldError(id));
    });
}

// ─── CHECKOUT ────────────────────────────────────────────────────────────────

function setupCheckout() {
    const modal = document.getElementById('checkout-modal');
    const checkoutBtn = document.getElementById('checkout-btn');
    const closeBtn = modal.querySelector('.close');
    const form = document.getElementById('checkout-form');

    // İl/İlçe dropdown'ları bir kez kur
    let dropdownsReady = false;
    function initCheckoutDropdowns() {
        if (dropdownsReady) return;
        if (typeof createCityDropdown === 'undefined') return;
        createCityDropdown('checkout-il-container', 'checkout-il', 'İl seçin...', 'il');
        createCityDropdown('checkout-ilce-container', 'checkout-ilce', 'İlçe seçin...', 'ilce', 'checkout-il');
        document.getElementById('checkout-il') && document.getElementById('checkout-il').addEventListener('change', function() {
            var ilceInput = document.getElementById('checkout-ilce');
            if (ilceInput) ilceInput.value = '';
        });
        dropdownsReady = true;
    }

    function autofillFromProfile() {
        var user = (typeof Auth !== 'undefined') ? Auth.getCurrentUser() : null;
        if (!user) return;
        var filled = false;
        if (user.name)  { document.getElementById('customer-name').value = user.name; filled = true; }
        if (user.email) { document.getElementById('customer-email').value = user.email; filled = true; }
        if (user.phone) { document.getElementById('customer-phone').value = user.phone; filled = true; }
        if (user.address) {
            var a = user.address;
            if (a.street) { document.getElementById('customer-address').value = a.street; filled = true; }
            if (a.zip) { var z = document.getElementById('customer-zip'); if (z) z.value = a.zip; }
            if (a.city) { var ilInput = document.getElementById('checkout-il'); if (ilInput) { ilInput.value = a.city; filled = true; } }
            if (a.district) { var ilceInput = document.getElementById('checkout-ilce'); if (ilceInput) { ilceInput.value = a.district; filled = true; } }
        }
        // Kayıtlı kart bilgilerini otomatik doldur
        if (user.savedCard) {
            var c = user.savedCard;
            var holderEl = document.getElementById('card-holder-name');
            var expiryEl = document.getElementById('card-expiry');
            var numberEl = document.getElementById('card-number');
            if (holderEl && c.cardHolder) { holderEl.value = c.cardHolder; filled = true; }
            if (expiryEl && c.expiry)     { expiryEl.value = c.expiry;     filled = true; }
            // Tam kart numarası saklanmadığından sadece son 4 hane gösterilir,
            // kullanıcıdan tam numarayı girmesi istenir.
            if (numberEl && c.lastFour) {
                numberEl.placeholder = c.brand + ' •••• •••• •••• ' + c.lastFour + ' (tam numaranızı girin)';
            }
        }
        var notice = document.getElementById('autofill-notice');
        if (notice) notice.style.display = filled ? 'flex' : 'none';
    }

    checkoutBtn && checkoutBtn.addEventListener('click', () => {
        clearAllErrors();
        modal.style.display = 'block';
        initCheckoutDropdowns();
        autofillFromProfile();
        setupLiveValidation();
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        clearAllErrors();
    });

    window.addEventListener('click', e => {
        if (e.target === modal) { modal.style.display = 'none'; clearAllErrors(); }
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearAllErrors();

        const customerName    = document.getElementById('customer-name').value.trim();
        const customerEmail   = document.getElementById('customer-email').value.trim();
        const customerPhone   = document.getElementById('customer-phone').value.trim();
        const customerAddress = document.getElementById('customer-address').value.trim();
        const customerCity    = (document.getElementById('checkout-il') ? document.getElementById('checkout-il').value.trim() : '');
        const customerDistrict = (document.getElementById('checkout-ilce') ? document.getElementById('checkout-ilce').value.trim() : '');
        const customerZip     = (document.getElementById('customer-zip') ? document.getElementById('customer-zip').value.trim() : '');
        const cardHolderName  = document.getElementById('card-holder-name').value.trim();
        const cardNumber      = document.getElementById('card-number').value.replace(/\s/g, '');
        const cardExpiry      = document.getElementById('card-expiry').value;
        const cardCVC         = document.getElementById('card-cvc').value;

        // ── Validasyon ──
        let hasError = false;

        if (customerName.length < 3) {
            setFieldError('customer-name', 'Lütfen ad soyadınızı girin (en az 3 karakter).');
            hasError = true;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
            setFieldError('customer-email', 'Geçerli bir e-posta adresi girin.');
            hasError = true;
        }
        if (!/^05[0-9]{9}$/.test(customerPhone)) {
            setFieldError('customer-phone', 'Telefon 05XX XXX XX XX formatında olmalıdır.');
            hasError = true;
        }
        if (customerAddress.length < 10) {
            setFieldError('customer-address', 'Lütfen teslimat adresinizi eksiksiz girin.');
            hasError = true;
        }
        if (cardHolderName.length < 3) {
            setFieldError('card-holder-name', 'Kart üzerindeki ismi girin.');
            hasError = true;
        }
        if (!validateCardNumber(cardNumber)) {
            setFieldError('card-number', 'Kart numarası geçersiz. Lütfen 16 haneli numaranızı kontrol edin.');
            hasError = true;
        }

        const expiryParts = cardExpiry.split('/');
        if (expiryParts.length !== 2 || !validateExpiryDate(expiryParts[0], expiryParts[1])) {
            setFieldError('card-expiry', 'Son kullanma tarihi geçersiz veya kartın süresi dolmuş.');
            hasError = true;
        }
        if (!validateCVC(cardCVC)) {
            setFieldError('card-cvc', 'CVC/CVV 3 veya 4 haneli olmalıdır.');
            hasError = true;
        }

        if (hasError) {
            // İlk hatalı alana scroll
            const firstError = document.querySelector('.input-error');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // ── Ödeme ──
        const [expMonth, expYear] = cardExpiry.split('/');

        // Giriş yapan kullanıcı varsa ekle
        const _currentUser = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : null;

        const orderData = {
            id: Date.now(),
            date: new Date().toLocaleDateString('tr-TR'),
            time: new Date().toLocaleTimeString('tr-TR'),
            customerName, customerEmail, customerPhone, customerAddress, customerCity, customerDistrict, customerZip,
            items: cart.getItems(),
            subtotal: cart.getSubtotal(),
            shipping: cart.getShipping(),
            total: cart.getTotal(),
            status: 'Ödeme Alındı',
            userId: _currentUser ? _currentUser.id : null,
            userEmail: _currentUser ? _currentUser.email : customerEmail
        };

        const cardInfo = {
            cardHolderName,
            cardNumber,
            expireMonth: expMonth,
            expireYear: '20' + expYear,
            cvc: cardCVC
        };

        const submitBtn = document.getElementById('submit-payment-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>İşleniyor…</span>';

        const loadingOverlay = showLoadingOverlay('Ödeme işleniyor…');
        const result = await processPayment(orderData, cardInfo);
        hideLoadingOverlay(loadingOverlay);

        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Ödemeyi Tamamla</span>';

        if (result.success) {
            let orders = localStorage.getItem('orders');
            orders = orders ? JSON.parse(orders) : [];
            orderData.paymentId = result.paymentId;
            orders.unshift(orderData);
            localStorage.setItem('orders', JSON.stringify(orders));
            // Kullanıcı sipariş sayacını güncelle
            if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
                Auth.incrementOrderCount(orderData.userEmail);
            }

            cart.clearCart();
            modal.style.display = 'none';
            displayCart();
            showPaymentResult(true, `Siparişiniz alındı! Sipariş No: #${orderData.id}`);
        } else {
            // Ödeme başarısız — modal içinde hata göster
            showFormError(result.message || 'Ödeme işlemi başarısız. Kart bilgilerinizi kontrol edin.');
        }
    });
}

function showFormError(message) {
    let errorBox = document.getElementById('payment-form-error');
    if (!errorBox) {
        errorBox = document.createElement('div');
        errorBox.id = 'payment-form-error';
        errorBox.className = 'form-error-box';
        const submitBtn = document.getElementById('submit-payment-btn');
        submitBtn.parentNode.insertBefore(errorBox, submitBtn);
    }
    errorBox.textContent = message;
    errorBox.style.display = 'block';
    errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
