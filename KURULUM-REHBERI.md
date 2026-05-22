# 🛍️ MODA E-Ticaret Sitesi - Kurulum Rehberi

## 📋 Gereksinimler

1. **Node.js**: v16 veya üzeri
2. **İyzico Hesabı**: Ödeme işlemleri için
3. **Gmail Hesabı**: E-posta gönderimleri için

---

## 🚀 Kurulum Adımları

### 1️⃣ Node.js Kurulumu

1. https://nodejs.org/en adresine gidin
2. **LTS** (Long Term Support) versiyonunu indirin
3. İndirdiğiniz dosyayı çalıştırıp kurulumu tamamlayın
4. Kurulum tamamlandıktan sonra PowerShell'i açıp kontrol edin:
```powershell
node --version
npm --version
```

### 2️⃣ Backend Kurulumu

1. PowerShell'de backend klasörüne gidin:
```powershell
cd backend
```

2. Gerekli paketleri yükleyin:
```powershell
npm install
```

### 3️⃣ İyzico Hesabı ve API Anahtarları

1. https://sandbox-merchant.iyzipay.com/ adresine gidin (Test ortamı)
2. Ücretsiz hesap oluşturun
3. **Ayarlar > API Anahtarları** bölümünden:
   - **API Key**
   - **Secret Key**
   bilgilerini kopyalayın

### 4️⃣ Gmail Uygulama Şifresi Oluşturma

1. Gmail hesabınıza giriş yapın
2. https://myaccount.google.com/security adresine gidin
3. **2 Adımlı Doğrulama**'yı aktif edin (yoksa)
4. **Uygulama Şifreleri** bölümüne gidin
5. **Uygulama seçin** > **Diğer** > \"MODA E-Ticaret\" yazın
6. **Oluştur**'a tıklayın
7. Görünen 16 haneli şifreyi kopyalayın

### 5️⃣ Çevre Değişkenlerini Ayarlama

1. Backend klasöründe **.env** adında yeni bir dosya oluşturun
2. Aşağıdaki içeriği kopyalayıp yapıştırın:

```env
PORT=3000

# Iyzico API Keys (Sandbox - Test Ortamı)
IYZICO_API_KEY=buraya_api_key_girin
IYZICO_SECRET_KEY=buraya_secret_key_girin
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com

# Email Config
EMAIL_USER=talhazoroglu00@gmail.com
EMAIL_PASS=buraya_uygulama_şifresi_girin
ADMIN_EMAIL=talhazoroglu00@gmail.com
```

3. Yukarıdaki değerleri kendi bilgilerinizle değiştirin

### 6️⃣ Sunucuyu Başlatma

```powershell
npm start
```

Sunucu başarıyla başladığında şunu görmelisiniz:
```
🚀 Server 3000 portunda çalışıyor...
🔗 http://localhost:3000
```

---

## 🧪 Test Etme

### Backend Testi

Tarayıcınızda açın: http://localhost:3000/api/health

Başarılı yanıt:
```json
{
  \"status\": \"ok\",
  \"message\": \"Server çalışıyor\"
}
```

### Frontend Testi

1. Ana dizindeki **cart.html** dosyasını tarayıcıda açın
2. Ürün ekleyin ve sepete gidin
3. \"Ödemeye Geç\" butonuna tıklayın
4. Formu doldurun

### Test Kart Bilgileri (İyzico Sandbox)

✅ **Başarılı Ödeme:**
- Kart No: 5528 7900 0000 0001
- Son Kullanma: 12/30
- CVC: 123
- Kart Sahibi: Test User

❌ **Başarısız Ödeme (Test için):**
- Kart No: 5406 6700 0000 0009

---

## 📧 E-posta Bildirimleri

Başarılı bir sipariş sonrası:
1. **Müşteriye**: Sipariş onay e-postası
2. **Size (Admin)**: Yeni sipariş bildirimi

---

## 🔐 Güvenlik Notları

⚠️ **ÖNEMLİ:**
- **.env** dosyasını asla paylaşmayın!
- Canlı ortama geçmeden önce:
  - Sandbox URL'i canlı URL ile değiştirin
  - Gerçek API anahtarlarını kullanın

---

## 🌐 Canlıya Alma (Production)

### İyzico Canlı Ortam

1. https://merchant.iyzipay.com/ adresine gidin
2. Gerçek hesabınızı oluşturun
3. Kimlik doğrulamasını tamamlayın
4. Canlı API anahtarlarınızı alın
5. **.env** dosyasında güncelleyin:
```env
IYZICO_BASE_URL=https://api.iyzipay.com
```

### Hosting Önerileri

- **Backend**: Heroku, DigitalOcean, AWS, Azure
- **Frontend**: Netlify, Vercel, GitHub Pages

---

## ❓ Sorun Giderme

### \"node komutu bulunamadı\" hatası
✅ Node.js'i yeniden kurun ve PowerShell'i yeniden başlatın

### \"npm install\" hatası
✅ PowerShell'i yönetici olarak çalıştırın

### E-posta gönderilmiyor
✅ Gmail uygulama şifresini kontrol edin
✅ 2 adımlı doğrulama aktif mi kontrol edin

### Ödeme başarısız oluyor
✅ İyzico API anahtarlarını kontrol edin
✅ Backend çalışıyor mu kontrol edin (http://localhost:3000/api/health)

---

## 📞 İletişim

Sorularınız için: talhazoroglu00@gmail.com

---

**🎉 Başarılar! E-ticaret siteniz hazır!**
