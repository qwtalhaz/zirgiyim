// ===== AUTH SİSTEMİ =====
// Kullanıcı kaydı ve girişi localStorage tabanlı

const Auth = {
    // Kayıt ol
    register(name, email, password) {
        const users = this.getUsers();
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'Bu e-posta adresi zaten kayıtlı.' };
        }
        const user = {
            id: Date.now(),
            name,
            email,
            password: btoa(password), // basit encoding (prod'da hash kullanılır)
            createdAt: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR'),
            orderCount: 0
        };
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        return { success: true, user };
    },

    // Giriş yap
    login(email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === btoa(password));
        if (!user) {
            return { success: false, message: 'E-posta veya şifre hatalı.' };
        }
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        // Kullanıcının kişisel sepetini yükle ve varsa misafir sepetini birleştir
        if (typeof cart !== 'undefined') {
            cart.items = cart.loadCart();
            cart.mergeGuestCart();
        }
        return { success: true, user };
    },

    // Çıkış yap
    logout() {
        sessionStorage.removeItem('currentUser');
        // Sepeti in-memory sıfırla (localStorage'daki kişisel veri korunur)
        if (typeof cart !== 'undefined') {
            cart.resetInMemory();
        }
        window.location.href = 'index.html';
    },

    // Mevcut kullanıcı
    getCurrentUser() {
        const u = sessionStorage.getItem('currentUser');
        return u ? JSON.parse(u) : null;
    },

    // Giriş yapılmış mı
    isLoggedIn() {
        return !!this.getCurrentUser();
    },

    // Tüm kullanıcılar
    getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    },

    // Kullanıcı sipariş sayısını güncelle
    incrementOrderCount(userEmail) {
        const users = this.getUsers();
        const idx = users.findIndex(u => u.email === userEmail);
        if (idx !== -1) {
            users[idx].orderCount = (users[idx].orderCount || 0) + 1;
            users[idx].lastOrderDate = new Date().toLocaleDateString('tr-TR');
            localStorage.setItem('users', JSON.stringify(users));
            // Session'ı da güncelle
            const current = this.getCurrentUser();
            if (current && current.email === userEmail) {
                current.orderCount = users[idx].orderCount;
                sessionStorage.setItem('currentUser', JSON.stringify(current));
            }
        }
    },

    // Profil bilgilerini güncelle
    updateProfile(updatedData) {
        const current = this.getCurrentUser();
        if (!current) return { success: false, message: 'Giriş yapılmamış.' };

        const users = this.getUsers();
        const idx = users.findIndex(u => u.id === current.id);
        if (idx === -1) return { success: false, message: 'Kullanıcı bulunamadı.' };

        // E-posta değişiyorsa çakışma kontrolü
        if (updatedData.email && updatedData.email !== current.email) {
            if (users.find(u => u.email === updatedData.email)) {
                return { success: false, message: 'Bu e-posta zaten kullanımda.' };
            }
        }

        // Şifre değişikliği varsa encode et
        if (updatedData.password) {
            updatedData.password = btoa(updatedData.password);
        }

        const merged = { ...users[idx], ...updatedData };
        users[idx] = merged;
        localStorage.setItem('users', JSON.stringify(users));
        sessionStorage.setItem('currentUser', JSON.stringify(merged));
        return { success: true, user: merged };
    },

    // Adres bilgisi kaydet
    saveAddress(address) {
        const current = this.getCurrentUser();
        if (!current) return { success: false };
        return this.updateProfile({ address });
    },

    // Kredi kartı bilgisi kaydet (sadece son 4 hane + isim saklanır, güvenlik için)
    saveCard(cardData) {
        const current = this.getCurrentUser();
        if (!current) return { success: false };
        const safeCard = {
            cardHolder: cardData.cardHolder,
            lastFour: cardData.cardNumber.replace(/\s/g, '').slice(-4),
            expiry: cardData.expiry,
            brand: cardData.cardNumber.replace(/\s/g, '')[0] === '4' ? 'Visa' : 'Mastercard'
        };
        return this.updateProfile({ savedCard: safeCard });
    }
};

window.Auth = Auth;
