// ===== AUTH GUARD — Giriş Gerektiren Eylemler =====
// Bu modül; sepete ekleme, ödeme ve iletişim formunu giriş yapmadan engeller.
// Tüm sayfalarda auth.js'den SONRA yüklenmelidir.

(function () {

    // ── Modal HTML (tek seferlik oluşturulur) ─────────────────────────────────
    function ensureModal() {
        if (document.getElementById('auth-guard-modal')) return;

        const style = document.createElement('style');
        style.textContent = `
            #auth-guard-modal {
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.55);
                z-index: 99999;
                align-items: center;
                justify-content: center;
            }
            #auth-guard-modal.open {
                display: flex;
            }
            .agm-box {
                background: #fff;
                border-radius: 16px;
                padding: 40px 36px 32px;
                max-width: 400px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.18);
                animation: agm-pop .22s cubic-bezier(.34,1.56,.64,1);
                position: relative;
            }
            @keyframes agm-pop {
                from { transform: scale(.88); opacity:0; }
                to   { transform: scale(1);  opacity:1; }
            }
            .agm-close {
                position: absolute;
                top: 14px; right: 18px;
                background: none; border: none;
                font-size: 1.4rem; cursor: pointer;
                color: #aaa; line-height: 1;
            }
            .agm-close:hover { color: #333; }
            .agm-icon { font-size: 2.8rem; margin-bottom: 12px; }
            .agm-title {
                font-size: 1.25rem;
                font-weight: 700;
                color: #1a1a1a;
                margin-bottom: 8px;
            }
            .agm-desc {
                color: #666;
                font-size: 0.95rem;
                margin-bottom: 28px;
                line-height: 1.5;
            }
            .agm-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
                flex-wrap: wrap;
            }
            .agm-btn {
                padding: 11px 28px;
                border-radius: 8px;
                font-size: 0.97rem;
                font-weight: 600;
                cursor: pointer;
                border: none;
                text-decoration: none;
                display: inline-block;
                transition: opacity .15s, transform .12s;
            }
            .agm-btn:hover { opacity: .88; transform: translateY(-1px); }
            .agm-btn-primary {
                background: #1a1a1a;
                color: #d4af37;
            }
            .agm-btn-secondary {
                background: #f5f5f5;
                color: #1a1a1a;
                border: 1.5px solid #ddd;
            }
        `;
        document.head.appendChild(style);

        const modal = document.createElement('div');
        modal.id = 'auth-guard-modal';
        modal.innerHTML = `
            <div class="agm-box">
                <button class="agm-close" id="agm-close-btn">✕</button>
                <div class="agm-icon">🔒</div>
                <div class="agm-title" id="agm-title">Giriş Yapmanız Gerekiyor</div>
                <div class="agm-desc" id="agm-desc">Bu işlemi yapabilmek için lütfen giriş yapın veya yeni bir hesap oluşturun.</div>
                <div class="agm-actions">
                    <a class="agm-btn agm-btn-primary" id="agm-login-btn" href="login.html">Giriş Yap</a>
                    <a class="agm-btn agm-btn-secondary" id="agm-register-btn" href="login.html#register">Kayıt Ol</a>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Kapatma
        document.getElementById('agm-close-btn').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    }

    function openModal(title, desc, redirectHint) {
        ensureModal();
        document.getElementById('agm-title').textContent = title || 'Giriş Yapmanız Gerekiyor';
        document.getElementById('agm-desc').textContent  = desc  || 'Bu işlemi yapabilmek için lütfen giriş yapın veya yeni bir hesap oluşturun.';

        // login sonrası geri dönmek için mevcut URL'yi redirect param olarak ekle
        const returnUrl = encodeURIComponent(window.location.href);
        document.getElementById('agm-login-btn').href    = `login.html?redirect=${returnUrl}`;
        document.getElementById('agm-register-btn').href = `login.html?redirect=${returnUrl}#register`;

        document.getElementById('auth-guard-modal').classList.add('open');
    }

    function closeModal() {
        const m = document.getElementById('auth-guard-modal');
        if (m) m.classList.remove('open');
    }

    // ── Giriş kontrolü ───────────────────────────────────────────────────────
    function isLoggedIn() {
        if (typeof Auth !== 'undefined') return Auth.isLoggedIn();
        try {
            return !!JSON.parse(sessionStorage.getItem('currentUser'));
        } catch(e) { return false; }
    }

    // ── Sepete Ekleme Koruması ────────────────────────────────────────────────
    // cart.js'deki addItem'ı wrap eder
    function guardCartAdd() {
        if (typeof cart === 'undefined') return;
        const original = cart.addItem.bind(cart);
        cart.addItem = function(product, size, quantity) {
            if (!isLoggedIn()) {
                openModal(
                    'Sepete Eklemek İçin Giriş Yapın',
                    'Ürün ekleyebilmek ve sipariş verebilmek için hesabınıza giriş yapmanız gerekmektedir.'
                );
                return;
            }
            original(product, size, quantity);
        };
    }

    // ── Ödeme Butonu Koruması ─────────────────────────────────────────────────
    function guardCheckout() {
        const btn = document.getElementById('checkout-btn');
        if (!btn) return;
        const original = btn.onclick;
        // click event'i yakala (capture phase — cart-page.js'nin handler'ından önce)
        btn.addEventListener('click', function(e) {
            if (!isLoggedIn()) {
                e.stopImmediatePropagation();
                openModal(
                    'Ödeme İçin Giriş Yapın',
                    'Güvenli ödeme yapabilmek için lütfen hesabınıza giriş yapın veya yeni bir hesap oluşturun.'
                );
            }
        }, true); // capture: true — diğer handler'lardan önce çalışır
    }

    // ── İletişim Formu Koruması ───────────────────────────────────────────────
    function guardContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        // Giriş yapmamışsa formu görsel olarak uyar ve submit'i engelle
        if (!isLoggedIn()) {
            // Submit butonunu değiştir
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = '🔒 Mesaj Göndermek İçin Giriş Yapın';
            }
            // Form alanlarını disable et
            form.querySelectorAll('input, textarea, select').forEach(el => {
                el.disabled = true;
                el.style.opacity = '0.5';
                el.style.cursor = 'not-allowed';
            });
        }

        form.addEventListener('submit', function(e) {
            if (!isLoggedIn()) {
                e.preventDefault();
                e.stopImmediatePropagation();
                openModal(
                    'Mesaj Göndermek İçin Giriş Yapın',
                    'İletişim formunu kullanabilmek için hesabınıza giriş yapmanız gerekmektedir.'
                );
            }
        }, true);
    }

    // ── Init: DOM hazır olduğunda tüm koruyucuları kur ───────────────────────
    function init() {
        guardCartAdd();
        guardCheckout();
        guardContactForm();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOMContentLoaded zaten geçti; kısa gecikme ile cart.js'nin
        // global `cart` nesnesini oluşturmasını bekle
        setTimeout(init, 0);
    }

    // Global erişim (ihtiyaç olursa)
    window.AuthGuard = { openModal, closeModal, isLoggedIn };

})();
