const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const Iyzipay = require('iyzipay');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/api/create-payment', async (req, res) => {
    try {
        const { orderData, cardInfo } = req.body;

        const conversationId = `ORDER_${orderData.id}`;
        
        const request = {
            locale: Iyzipay.LOCALE.TR,
            conversationId: conversationId,
            price: orderData.subtotal.toString(),
            paidPrice: orderData.total.toString(),
            currency: Iyzipay.CURRENCY.TRY,
            installment: '1',
            basketId: orderData.id.toString(),
            paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
            paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
            paymentCard: {
                cardHolderName: cardInfo.cardHolderName,
                cardNumber: cardInfo.cardNumber,
                expireMonth: cardInfo.expireMonth,
                expireYear: cardInfo.expireYear,
                cvc: cardInfo.cvc,
                registerCard: '0'
            },
            buyer: {
                id: 'BY' + Date.now(),
                name: orderData.customerName.split(' ')[0],
                surname: orderData.customerName.split(' ').slice(1).join(' ') || 'N/A',
                gsmNumber: orderData.customerPhone,
                email: orderData.customerEmail,
                identityNumber: '11111111111',
                registrationAddress: orderData.customerAddress,
                ip: req.ip || '85.34.78.112',
                city: 'Istanbul',
                country: 'Turkey'
            },
            shippingAddress: {
                contactName: orderData.customerName,
                city: 'Istanbul',
                country: 'Turkey',
                address: orderData.customerAddress
            },
            billingAddress: {
                contactName: orderData.customerName,
                city: 'Istanbul',
                country: 'Turkey',
                address: orderData.customerAddress
            },
            basketItems: orderData.items.map((item, index) => ({
                id: `BI${index + 1}`,
                name: item.name,
                category1: 'Giyim',
                itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
                price: (item.price * item.quantity).toString()
            }))
        };

        if (orderData.shipping > 0) {
            request.basketItems.push({
                id: 'SHIPPING',
                name: 'Kargo',
                category1: 'Hizmet',
                itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
                price: orderData.shipping.toString()
            });
        }

        iyzipay.payment.create(request, async (err, result) => {
            if (err) {
                console.error('İyzico Error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Ödeme işlemi başarısız oldu.',
                    error: err.message 
                });
            }

            if (result.status === 'success') {
                try {
                    await sendOrderEmails(orderData);
                    
                    res.json({
                        success: true,
                        message: 'Ödeme başarıyla tamamlandı!',
                        paymentId: result.paymentId,
                        conversationId: result.conversationId
                    });
                } catch (emailError) {
                    console.error('Email Error:', emailError);
                    res.json({
                        success: true,
                        message: 'Ödeme başarılı ancak e-posta gönderilemedi.',
                        paymentId: result.paymentId
                    });
                }
            } else {
                res.status(400).json({
                    success: false,
                    message: result.errorMessage || 'Ödeme işlemi başarısız oldu.'
                });
            }
        });

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası oluştu.',
            error: error.message 
        });
    }
});

async function sendOrderEmails(orderData) {
    const itemsList = orderData.items.map(item => 
        `<tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.size}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">₺${item.price}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">₺${item.price * item.quantity}</td>
        </tr>`
    ).join('');

    const customerEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #1a1a1a, #2d2d2d); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: #d4af37; margin: 0; letter-spacing: 4px;">MODA</h1>
                    <p style="color: #fff; margin: 10px 0 0;">Siparişiniz Alındı!</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #1a1a1a;">Sayın ${orderData.customerName},</h2>
                    <p>Siparişiniz başarıyla alınmıştır. Teşekkür ederiz!</p>
                    
                    <div style="background: #fff; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #d4af37;">
                        <h3 style="margin-top: 0; color: #1a1a1a;">Sipariş Bilgileri</h3>
                        <p><strong>Sipariş No:</strong> #${orderData.id}</p>
                        <p><strong>Tarih:</strong> ${orderData.date} ${orderData.time}</p>
                        <p><strong>E-posta:</strong> ${orderData.customerEmail}</p>
                        <p><strong>Telefon:</strong> ${orderData.customerPhone}</p>
                        <p><strong>Teslimat Adresi:</strong> ${orderData.customerAddress}</p>
                    </div>
                    
                    <h3 style="color: #1a1a1a;">Sipariş Detayları</h3>
                    <table style="width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden;">
                        <thead>
                            <tr style="background: #1a1a1a; color: #fff;">
                                <th style="padding: 12px; text-align: left;">Ürün</th>
                                <th style="padding: 12px; text-align: left;">Beden</th>
                                <th style="padding: 12px; text-align: left;">Adet</th>
                                <th style="padding: 12px; text-align: left;">Fiyat</th>
                                <th style="padding: 12px; text-align: left;">Toplam</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsList}
                        </tbody>
                    </table>
                    
                    <div style="background: #fff; padding: 20px; margin: 20px 0; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Ara Toplam:</span>
                            <strong>₺${orderData.subtotal}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Kargo:</span>
                            <strong>${orderData.shipping === 0 ? 'Ücretsiz' : '₺' + orderData.shipping}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 2px solid #1a1a1a; font-size: 1.2em;">
                            <span><strong>Toplam:</strong></span>
                            <strong style="color: #d4af37;">₺${orderData.total}</strong>
                        </div>
                    </div>
                    
                    <p style="color: #666; font-size: 0.9em; margin-top: 30px;">
                        Siparişiniz en kısa sürede hazırlanacak ve kargoya verilecektir. 
                        Herhangi bir sorunuz olması durumunda bizimle iletişime geçebilirsiniz.
                    </p>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <p style="color: #999; font-size: 0.85em;">© 2026 MODA - Tüm hakları saklıdır.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    const adminEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #d4af37; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: #1a1a1a; margin: 0;">🎉 YENİ SİPARİŞ!</h1>
                </div>
                
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #1a1a1a;">Sipariş Detayları</h2>
                    
                    <div style="background: #fff; padding: 20px; margin: 20px 0; border-radius: 8px;">
                        <p><strong>Sipariş No:</strong> #${orderData.id}</p>
                        <p><strong>Tarih:</strong> ${orderData.date} ${orderData.time}</p>
                        <p><strong>Müşteri:</strong> ${orderData.customerName}</p>
                        <p><strong>E-posta:</strong> ${orderData.customerEmail}</p>
                        <p><strong>Telefon:</strong> ${orderData.customerPhone}</p>
                        <p><strong>Adres:</strong> ${orderData.customerAddress}</p>
                    </div>
                    
                    <h3 style="color: #1a1a1a;">Sipariş Ürünleri</h3>
                    <table style="width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden;">
                        <thead>
                            <tr style="background: #1a1a1a; color: #fff;">
                                <th style="padding: 12px; text-align: left;">Ürün</th>
                                <th style="padding: 12px; text-align: left;">Beden</th>
                                <th style="padding: 12px; text-align: left;">Adet</th>
                                <th style="padding: 12px; text-align: left;">Fiyat</th>
                                <th style="padding: 12px; text-align: left;">Toplam</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsList}
                        </tbody>
                    </table>
                    
                    <div style="background: #fff; padding: 20px; margin: 20px 0; border-radius: 8px; border: 3px solid #d4af37;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Ara Toplam:</span>
                            <strong>₺${orderData.subtotal}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Kargo:</span>
                            <strong>${orderData.shipping === 0 ? 'Ücretsiz' : '₺' + orderData.shipping}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 2px solid #1a1a1a; font-size: 1.3em;">
                            <span><strong>TOPLAM ÖDEME:</strong></span>
                            <strong style="color: #d4af37;">₺${orderData.total}</strong>
                        </div>
                    </div>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #d4af37;">
                        <p style="margin: 0;"><strong>⚠️ Bu sipariş ödemeyi tamamladı ve hemen işleme alınmalıdır!</strong></p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    await transporter.sendMail({
        from: `"MODA E-Ticaret" <${process.env.EMAIL_USER}>`,
        to: orderData.customerEmail,
        subject: `Siparişiniz Alındı - #${orderData.id}`,
        html: customerEmailHtml
    });

    await transporter.sendMail({
        from: `"MODA Sipariş Sistemi" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `🛍️ Yeni Sipariş - #${orderData.id} - ${orderData.customerName}`,
        html: adminEmailHtml
    });
}

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server çalışıyor' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server ${PORT} portunda çalışıyor...`);
    console.log(`🔗 http://localhost:${PORT}`);
});
