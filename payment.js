// ─── KART DOĞRULAMA FONKSİYONLARI ───────────────────────────────────────────

function validateCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cleaned)) return false;

    // Luhn algoritması
    let sum = 0;
    let isEven = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned.charAt(i), 10);
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
    }
    return (sum % 10) === 0;
}

function validateExpiryDate(month, year) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    const expMonth = parseInt(month, 10);
    const expYear = parseInt(year, 10);

    if (expMonth < 1 || expMonth > 12) return false;
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    return true;
}

function validateCVC(cvc) {
    return /^\d{3,4}$/.test(cvc);
}

function formatCardNumber(input) {
    let value = input.value.replace(/\D/g, '').substring(0, 16);
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += value[i];
    }
    input.value = formatted;
}

function formatExpiryDate(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
}

// ─── SİMÜLE ÖDEME ────────────────────────────────────────────────────────────
// Test kartları:
//   Başarılı : 5528 7900 0000 0001  |  herhangi gelecek tarih  |  herhangi CVC
//   Başarısız: 5406 6700 0000 0009

const FAIL_CARDS = ['5406670000000009'];

async function processPayment(orderData, cardInfo) {
    // Gerçekçi bir bekleme süresi (1.5–2.5 sn)
    const delay = 1500 + Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    const cleanCard = cardInfo.cardNumber.replace(/\s/g, '');

    // Başarısız kart kontrolü
    if (FAIL_CARDS.includes(cleanCard)) {
        return {
            success: false,
            message: 'Ödeme reddedildi. Kart limitinizi veya bilgilerinizi kontrol edin.'
        };
    }

    // Başarılı ödeme
    const paymentId = 'PAY-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    return {
        success: true,
        paymentId: paymentId,
        message: 'Ödeme başarıyla tamamlandı.'
    };
}

// ─── UI YARDIMCILARI ──────────────────────────────────────────────────────────

function showLoadingOverlay(message) {
    const overlay = document.createElement('div');
    overlay.className = 'payment-loading-overlay';
    overlay.innerHTML = `
        <div class="payment-loading-content">
            <div class="payment-spinner"></div>
            <p>${message}</p>
            <small>Lütfen bekleyin ve sayfayı kapatmayın…</small>
        </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
}

function hideLoadingOverlay(overlay) {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
}

function showPaymentResult(success, message) {
    const resultModal = document.createElement('div');
    resultModal.className = 'payment-result-modal';
    resultModal.innerHTML = `
        <div class="payment-result-content ${success ? 'success' : 'error'}">
            <div class="result-icon">${success ? '✓' : '✕'}</div>
            <h2>${success ? 'Ödeme Başarılı!' : 'Ödeme Başarısız'}</h2>
            <p>${message}</p>
            <button class="btn btn-primary" style="margin:0 auto" onclick="closePaymentResult()">
                ${success ? 'Alışverişe Devam Et' : 'Tekrar Dene'}
            </button>
        </div>
    `;
    document.body.appendChild(resultModal);

    if (success) {
        setTimeout(() => {
            closePaymentResult();
            window.location.href = 'index.html';
        }, 4000);
    }
}

function closePaymentResult() {
    const modal = document.querySelector('.payment-result-modal');
    if (modal) modal.remove();
}

// Global erişim
window.validateCardNumber = validateCardNumber;
window.validateExpiryDate = validateExpiryDate;
window.validateCVC = validateCVC;
window.formatCardNumber = formatCardNumber;
window.formatExpiryDate = formatExpiryDate;
window.processPayment = processPayment;
window.showPaymentResult = showPaymentResult;
window.closePaymentResult = closePaymentResult;
