// ===== ADMIN ENHANCED JS =====

let currentOrderId = null;

// Tarih göster
document.getElementById('admin-date').textContent = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

// Tab sistemi
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const tab = this.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('tab-' + tab).classList.add('active');
    });
});

// Sipariş durumuna göre class döndür
function getStatusClass(status) {
    const map = {
        'Hazırlanıyor': 'status-preparing',
        'Kargoya Verildi': 'status-shipped',
        'Teslim Edildi': 'status-delivered',
        'İptal Edildi': 'status-cancelled'
    };
    return map[status] || 'status-preparing';
}

// Toplam geliri hesapla
function calculateRevenue() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const total = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const el = document.getElementById('total-revenue');
    if (el) el.textContent = '₺' + total.toLocaleString('tr-TR');
}

// displayOrders fonksiyonunu override et - daha zengin tablo
window.displayOrders = function(statusFilter) {
    const ordersTable = document.getElementById('orders-table');
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');

    const filterSelect = document.getElementById('order-status-filter');
    const filter = statusFilter || (filterSelect ? filterSelect.value : 'all');

    if (filter && filter !== 'all') {
        orders = orders.filter(o => o.status === filter);
    }

    calculateRevenue();

    if (orders.length === 0) {
        ordersTable.innerHTML = `
            <div class="empty-orders">
                <div class="empty-icon">📭</div>
                <p>Henüz sipariş bulunmuyor</p>
            </div>`;
        return;
    }

    // En yeni siparişler üstte
    orders = [...orders].reverse();

    ordersTable.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Sipariş No</th>
                    <th>Tarih / Saat</th>
                    <th>Müşteri</th>
                    <th>Ürün Adedi</th>
                    <th>Toplam</th>
                    <th>Durum</th>
                    <th>İşlemler</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(order => `
                    <tr>
                        <td><strong>#${order.id}</strong></td>
                        <td>${order.date || ''} ${order.time || ''}</td>
                        <td>${order.customerName || '-'}</td>
                        <td>${(order.items || []).reduce((s, i) => s + (i.quantity || 1), 0)} adet</td>
                        <td><strong>₺${order.total}</strong></td>
                        <td><span class="order-status ${getStatusClass(order.status || 'Hazırlanıyor')}">${order.status || 'Hazırlanıyor'}</span></td>
                        <td>
                            <button class="btn-detail" onclick="openOrderDetail(${order.id})">🔍 Detay</button>
                            <button class="btn-delete" onclick="deleteOrder(${order.id})">🗑 Sil</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>`;
};

// Sipariş detay modalını aç
window.openOrderDetail = function(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    currentOrderId = orderId;

    document.getElementById('order-detail-title').textContent = `Sipariş #${order.id}`;
    document.getElementById('order-detail-date').textContent = `${order.date || ''} ${order.time || ''}`;

    const statusBadge = document.getElementById('order-detail-status-badge');
    statusBadge.textContent = order.status || 'Hazırlanıyor';
    statusBadge.className = 'order-status-badge order-status ' + getStatusClass(order.status || 'Hazırlanıyor');

    // Müşteri bilgileri
    document.getElementById('od-name').textContent = order.customerName || '-';
    document.getElementById('od-email').textContent = order.customerEmail || '-';
    document.getElementById('od-phone').textContent = order.customerPhone || '-';

    // Adres bilgileri - farklı alan adlarını dene
    const address = order.customerAddress || order.address || order.shippingAddress || '-';
    const district = order.customerDistrict || order.district || order.ilce || '';
    const city = order.customerCity || order.city || order.il || '';
    const postal = order.customerPostal || order.postalCode || order.postal || '';

    document.getElementById('od-address').textContent = address;
    document.getElementById('od-district').textContent = district || '-';
    document.getElementById('od-city').textContent = city || '-';
    document.getElementById('od-postal').textContent = postal || '-';

    // Ürünler
    const itemsList = document.getElementById('od-items-list');
    const items = order.items || [];
    if (items.length === 0) {
        itemsList.innerHTML = '<p style="color:#aaa;font-size:0.9rem">Ürün bilgisi bulunamadı</p>';
    } else {
        itemsList.innerHTML = items.map(item => `
            <div class="order-item-row">
                <div class="order-item-info">
                    <div class="order-item-name">${item.name || 'Ürün'}</div>
                    <div class="order-item-meta">Beden: ${item.size || '-'} &nbsp;|&nbsp; Adet: ${item.quantity || 1}</div>
                </div>
                <div class="order-item-price">₺${(item.price * (item.quantity || 1)).toLocaleString('tr-TR')}</div>
            </div>
        `).join('');
    }

    // Özet
    document.getElementById('od-subtotal').textContent = '₺' + (order.subtotal || order.total || 0);
    document.getElementById('od-shipping').textContent = order.shipping == 0 ? 'Ücretsiz' : '₺' + (order.shipping || 0);
    document.getElementById('od-total').textContent = '₺' + order.total;

    document.getElementById('order-detail-modal').style.display = 'block';
};

// Sipariş durumunu güncelle
window.updateOrderStatus = function(orderId, newStatus) {
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return;

    orders[idx].status = newStatus;
    localStorage.setItem('orders', JSON.stringify(orders));

    // Kullanıcıya bildirim kaydet (siparislerim.html'de gösterilir)
    const order = orders[idx];
    if (order.userEmail || order.customerEmail) {
        const statusUpdates = JSON.parse(localStorage.getItem('statusUpdates') || '{}');
        statusUpdates['order_' + orderId] = {
            status: newStatus,
            updatedAt: new Date().toLocaleString('tr-TR'),
            email: order.userEmail || order.customerEmail
        };
        localStorage.setItem('statusUpdates', JSON.stringify(statusUpdates));
    }

    // Modalın badge'ini güncelle
    const badge = document.getElementById('order-detail-status-badge');
    badge.textContent = newStatus;
    badge.className = 'order-status-badge order-status ' + getStatusClass(newStatus);

    // Tabloyu yenile
    window.displayOrders();
    showNotification('Sipariş durumu güncellendi: ' + newStatus);
};

// Sipariş detay modal kapat
document.getElementById('order-modal-close').addEventListener('click', function() {
    document.getElementById('order-detail-modal').style.display = 'none';
    currentOrderId = null;
});

window.addEventListener('click', function(e) {
    if (e.target === document.getElementById('order-detail-modal')) {
        document.getElementById('order-detail-modal').style.display = 'none';
        currentOrderId = null;
    }
});

// Filtre değişince yenile
document.getElementById('order-status-filter').addEventListener('change', function() {
    window.displayOrders(this.value);
});

// Yenile butonu
document.getElementById('refresh-orders-btn').addEventListener('click', function() {
    window.displayOrders();
    showNotification('Siparişler yenilendi!');
});

// İlk yükleme
window.displayOrders();
calculateRevenue();


// ===== KULLANICI YÖNETİMİ =====

function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const total = document.getElementById('total-users');
    if (total) total.textContent = users.length;

    const label = document.getElementById('users-count-label');
    if (label) label.textContent = `Toplam ${users.length} üye`;

    const table = document.getElementById('users-table');
    if (!table) return;

    if (users.length === 0) {
        table.innerHTML = `
            <div class="empty-orders">
                <div class="empty-icon">👥</div>
                <p>Henüz kayıtlı kullanıcı yok</p>
            </div>`;
        return;
    }

    const orders = JSON.parse(localStorage.getItem('orders') || '[]');

    table.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Ad Soyad</th>
                    <th>E-posta</th>
                    <th>Kayıt Tarihi</th>
                    <th>Sipariş Sayısı</th>
                    <th>Son Sipariş</th>
                    <th>İşlem</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => {
                    const userOrders = orders.filter(o => o.userEmail === user.email || o.customerEmail === user.email);
                    const lastOrder = userOrders[0];
                    return `<tr>
                        <td>#${user.id}</td>
                        <td><strong>${user.name}</strong></td>
                        <td>${user.email}</td>
                        <td>${user.createdAt || '-'}</td>
                        <td><span style="background:#e8f4e8;color:#27ae60;padding:3px 10px;border-radius:12px;font-weight:600">${userOrders.length} sipariş</span></td>
                        <td>${lastOrder ? lastOrder.date : '-'}</td>
                        <td>
                            <button class="btn-detail" onclick="viewUserOrders('${user.email}')">📋 Siparişler</button>
                            <button class="btn-delete" onclick="deleteUser(${user.id}, '${user.email}')">🗑 Sil</button>
                        </td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>`;
}

window.viewUserOrders = function(email) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const userOrders = orders.filter(o => o.userEmail === email || o.customerEmail === email);
    if (userOrders.length === 0) {
        alert(email + ' adlı kullanıcının henüz siparişi yok.');
        return;
    }
    const list = userOrders.map(o => `#${o.id} - ${o.date} - ₺${o.total} - ${o.status || 'Ödeme Alındı'}`).join('\n');
    alert(`${email} - Siparişler:\n\n${list}`);
};

window.deleteUser = function(userId, email) {
    if (!confirm(email + ' kullanıcısını silmek istediğinizden emin misiniz?')) return;
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    users = users.filter(u => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(users));
    loadUsers();
    showNotification('Kullanıcı silindi.');
};

// Tab'a tıklandığında kullanıcıları yükle
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (this.dataset.tab === 'users') {
            loadUsers();
        }
    });
});

// İlk yüklemede sayacı göster
loadUsers();


// ===== MESAJ YÖNETİMİ =====

function loadMessages() {
    const msgs = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    const unread = msgs.filter(m => !m.read).length;

    // Okunmamış badge
    const badge = document.getElementById('unread-badge');
    if (badge) {
        if (unread > 0) { badge.textContent = unread; badge.style.display = 'inline'; }
        else { badge.style.display = 'none'; }
    }

    const label = document.getElementById('messages-count-label');
    if (label) label.textContent = `${msgs.length} mesaj, ${unread} okunmamış`;

    const table = document.getElementById('messages-table');
    if (!table) return;

    if (msgs.length === 0) {
        table.innerHTML = `<div class="empty-orders"><div class="empty-icon">✉️</div><p>Henüz mesaj yok</p></div>`;
        return;
    }

    table.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th></th>
                    <th>Gönderen</th>
                    <th>E-posta</th>
                    <th>Konu</th>
                    <th>Tarih</th>
                    <th>İşlemler</th>
                </tr>
            </thead>
            <tbody>
                ${msgs.map(msg => `
                    <tr style="${!msg.read ? 'background:#fffdf0;font-weight:600' : ''}">
                        <td style="width:12px">${!msg.read ? '<span style="color:#d4af37;font-size:1.1rem">●</span>' : ''}</td>
                        <td>${msg.name}</td>
                        <td style="color:#888;font-size:0.88rem">${msg.email}</td>
                        <td><span style="background:#f0f0f0;padding:3px 10px;border-radius:12px;font-size:0.82rem">${msg.subject}</span></td>
                        <td style="font-size:0.85rem;color:#999">${msg.date} ${msg.time}</td>
                        <td>
                            <button class="btn-detail" onclick="openMessage(${msg.id})">👁 Oku</button>
                            <button class="btn-delete" onclick="deleteMessage(${msg.id})">🗑 Sil</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>`;
}

window.openMessage = function(msgId) {
    let msgs = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    const idx = msgs.findIndex(m => m.id === msgId);
    if (idx === -1) return;
    const msg = msgs[idx];

    // Okundu işaretle
    if (!msg.read) {
        msgs[idx].read = true;
        localStorage.setItem('contactMessages', JSON.stringify(msgs));
        loadMessages();
    }

    document.getElementById('msg-detail-subject').textContent = msg.subject;
    document.getElementById('msg-detail-subject-badge').textContent = msg.subject;
    document.getElementById('msg-detail-meta').textContent = `${msg.date} ${msg.time} tarihinde gönderildi`;
    document.getElementById('msg-detail-name').textContent = msg.name;
    document.getElementById('msg-detail-email').textContent = msg.email;
    document.getElementById('msg-detail-message').textContent = msg.message;
    document.getElementById('msg-reply-link').href = `mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`;

    document.getElementById('message-detail-modal').style.display = 'block';
};

window.deleteMessage = function(msgId) {
    if (!confirm('Bu mesajı silmek istediğinizden emin misiniz?')) return;
    let msgs = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    msgs = msgs.filter(m => m.id !== msgId);
    localStorage.setItem('contactMessages', JSON.stringify(msgs));
    loadMessages();
    showNotification('Mesaj silindi.');
};

window.markAllRead = function() {
    let msgs = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    msgs = msgs.map(m => ({ ...m, read: true }));
    localStorage.setItem('contactMessages', JSON.stringify(msgs));
    loadMessages();
    showNotification('Tüm mesajlar okundu olarak işaretlendi.');
};

// Mesaj detay modal kapatma
document.getElementById('msg-modal-close').addEventListener('click', function() {
    document.getElementById('message-detail-modal').style.display = 'none';
});
window.addEventListener('click', function(e) {
    if (e.target === document.getElementById('message-detail-modal')) {
        document.getElementById('message-detail-modal').style.display = 'none';
    }
});

// Mesajlar sekmesine tıklanınca yükle
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (this.dataset.tab === 'messages') loadMessages();
    });
});

// Sayfa açılışında okunmamış badge'i göster
loadMessages();
