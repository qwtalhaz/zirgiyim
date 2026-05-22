// ===== NAVBAR AUTH ENTEGRASYONU =====
// Her sayfada çalışır; giriş yapılmışsa kullanıcı menüsü gösterir

(function () {
    function buildNav() {
        const nav = document.getElementById('main-nav');
        if (!nav) return;

        const isHome = window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/');
        const isProducts = window.location.pathname.includes('products.html');
        const isCart = window.location.pathname.includes('cart.html');
        const isOrders = window.location.pathname.includes('siparislerim.html');
        const isContact = window.location.pathname.includes('iletisim.html');

        const cartItem = `<li><a href="cart.html" ${isCart ? 'class="active"' : ''}>Sepet <span id="cart-count" class="cart-badge">0</span></a></li>`;
        const contactItem = `<li><a href="iletisim.html" ${isContact ? 'class="active"' : ''}>İletişim</a></li>`;

        const user = Auth.getCurrentUser();

        if (user) {
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            // Bekleyen bildirim var mı?
            const statusUpdates = JSON.parse(localStorage.getItem('statusUpdates') || '{}');
            const pendingCount = Object.keys(statusUpdates).length;
            const badge = pendingCount > 0 ? `<span style="background:#e74c3c;color:#fff;border-radius:50%;padding:1px 6px;font-size:0.75rem;margin-left:4px">${pendingCount}</span>` : '';

            nav.innerHTML = `
                <li><a href="index.html" ${isHome ? 'class="active"' : ''}>Ana Sayfa</a></li>
                <li><a href="products.html" ${isProducts ? 'class="active"' : ''}>Ürünler</a></li>
                ${cartItem}
                ${contactItem}
                <li>
                    <div class="nav-user-menu">
                        <button class="nav-user-btn">👤 ${initials}${badge}</button>
                        <div class="user-dropdown">
                            <div class="user-dropdown-header">
                                <strong>${user.name}</strong>
                                <span>${user.email}</span>
                            </div>
                            <a href="profil.html">⚙️ Hesap Ayarları</a>
                            <a href="siparislerim.html" ${isOrders ? 'style="font-weight:700"' : ''}>📦 Siparişlerim${badge}</a>
                            <button class="logout-item" onclick="Auth.logout()">🚪 Çıkış Yap</button>
                        </div>
                    </div>
                </li>`;
        } else {
            nav.innerHTML = `
                <li><a href="index.html" ${isHome ? 'class="active"' : ''}>Ana Sayfa</a></li>
                <li><a href="products.html" ${isProducts ? 'class="active"' : ''}>Ürünler</a></li>
                ${cartItem}
                ${contactItem}
                <li><a href="login.html">Giriş Yap</a></li>`;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        buildNav();
        // Navbar DOM'u yeniden yazıldı; sepet sayacını güncelle
        if (typeof cart !== 'undefined') {
            cart.updateCartCount();
        }
    });
})();
