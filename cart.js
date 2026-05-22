// ===== KULLANICI BAZLI SEPET =====

class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        // Navbar DOM'u yeniden yazdıktan sonra sayacı güncelle
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.updateCartCount());
        } else {
            this.updateCartCount();
        }
    }

    // Giriş yapmış kullanıcıya özel anahtar; misafir için 'cart_guest'
    _cartKey() {
        try {
            const u = sessionStorage.getItem('currentUser');
            if (u) {
                const parsed = JSON.parse(u);
                if (parsed && parsed.id) return 'cart_user_' + parsed.id;
            }
        } catch(e) {}
        return 'cart_guest';
    }

    loadCart() {
        try {
            const data = localStorage.getItem(this._cartKey());
            return data ? JSON.parse(data) : [];
        } catch(e) { return []; }
    }

    saveCart() {
        localStorage.setItem(this._cartKey(), JSON.stringify(this.items));
        this.updateCartCount();
    }

    // Kullanıcı giriş yaptıktan sonra guest sepeti birleştir ve temizle
    mergeGuestCart() {
        const guestData = localStorage.getItem('cart_guest');
        if (!guestData) return;
        const guestItems = JSON.parse(guestData);
        guestItems.forEach(gi => {
            const existing = this.items.find(i => i.id === gi.id && i.size === gi.size);
            if (existing) {
                existing.quantity += gi.quantity;
            } else {
                this.items.push(gi);
            }
        });
        localStorage.removeItem('cart_guest');
        this.saveCart();
    }

    addItem(product, size, quantity = 1) {
        const existingItem = this.items.find(
            item => item.id === product.id && item.size === size
        );
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                size: size,
                quantity: quantity
            });
        }
        this.saveCart();
        this.showNotification('Ürün sepete eklendi!');
    }

    removeItem(id, size) {
        this.items = this.items.filter(
            item => !(item.id === id && item.size === size)
        );
        this.saveCart();
    }

    updateQuantity(id, size, quantity) {
        const item = this.items.find(
            item => item.id === id && item.size === size
        );
        if (item) {
            item.quantity = quantity;
            if (item.quantity <= 0) {
                this.removeItem(id, size);
            } else {
                this.saveCart();
            }
        }
    }

    getItems()     { return this.items; }
    getTotalItems(){ return this.items.reduce((t, i) => t + i.quantity, 0); }
    getSubtotal()  { return this.items.reduce((t, i) => t + i.price * i.quantity, 0); }
    getShipping()  { return this.getSubtotal() > 500 ? 0 : 50; }
    getTotal()     { return this.getSubtotal() + this.getShipping(); }

    clearCart() {
        this.items = [];
        this.saveCart();
    }

    // Çıkış yapıldığında bu kullanıcının anahtar altındaki sepet silinmez;
    // sadece in-memory sıfırlanır. Giriş yapıldığında tekrar yüklenir.
    resetInMemory() {
        this.items = [];
        this.updateCartCount();
    }

    updateCartCount() {
        const count = this.getTotalItems();
        document.querySelectorAll('#cart-count').forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'inline-block' : 'none';
        });
    }

    showNotification(message) {
        const n = document.createElement('div');
        n.className = 'notification';
        n.textContent = message;
        document.body.appendChild(n);
        setTimeout(() => n.classList.add('show'), 100);
        setTimeout(() => {
            n.classList.remove('show');
            setTimeout(() => n.remove(), 300);
        }, 2000);
    }
}

const cart = new ShoppingCart();
window.cart = cart;
