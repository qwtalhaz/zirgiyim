const products = [
    {
        id: 1,
        name: "Klasik Beyaz Gömlek",
        category: "erkek",
        price: 599,
        image: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=500&q=80",
        description: "Premium pamuklu beyaz gömlek. Modern kesim ve zarif duruş. İş ve özel günler için mükemmel seçim.",
        sizes: ["S", "M", "L", "XL"],
        featured: true
    },
    {
        id: 2,
        name: "Slim Fit Kot Pantolon",
        category: "erkek",
        price: 749,
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80",
        description: "İtalyan denim kumaş, slim fit kesim. Konfor ve stil bir arada. Günlük kullanım için ideal.",
        sizes: ["28", "30", "32", "34", "36"],
        featured: true
    },
    {
        id: 3,
        name: "Şifon Midi Elbise",
        category: "kadin",
        price: 899,
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80",
        description: "Zarif şifon kumaş, midi boy. Özel günlerinizde fark yaratın. Akışkan ve feminen tasarım.",
        sizes: ["XS", "S", "M", "L"],
        featured: true
    },
    {
        id: 4,
        name: "Siyah Deri Ceket",
        category: "kadin",
        price: 1299,
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80",
        description: "Gerçek deri, zamansız tasarım. Rock şıklığı arayanlar için vazgeçilmez parça.",
        sizes: ["S", "M", "L"],
        featured: false
    },
    {
        id: 5,
        name: "Trençkot",
        category: "erkek",
        price: 1499,
        image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&q=80",
        description: "Klasik İngiliz kesim trençkot. Su geçirmez kumaş. Sonbahar ve kış için ideal.",
        sizes: ["M", "L", "XL"],
        featured: true
    },
    {
        id: 6,
        name: "Çizgili Crop Top",
        category: "kadin",
        price: 399,
        image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500&q=80",
        description: "Trend crop top, çizgili desen. Yaz kombinlerinize enerji katın. Pamuklu ve rahat.",
        sizes: ["XS", "S", "M", "L"],
        featured: false
    },
    {
        id: 7,
        name: "Yün Kazak",
        category: "erkek",
        price: 549,
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80",
        description: "Yumuşak merino yünü kazak. Kış günlerinin vazgeçilmezi. Sıcak tutma garantisi.",
        sizes: ["M", "L", "XL"],
        featured: false
    },
    {
        id: 8,
        name: "Saten Bluz",
        category: "kadin",
        price: 479,
        image: "https://static.ticimax.cloud/3176/uploads/urunresimleri/buyuk/on-zincirli-saten-bluz-ekru-6365-4.jpg",
        description: "Lüks saten kumaş, modern kesim. Ofisten akşam yemeğine her ortama uygun.",
        sizes: ["S", "M", "L"],
        featured: false
    },
    {
        id: 9,
        name: "Yüksek Bel Jean",
        category: "kadin",
        price: 699,
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&q=80",
        description: "Yüksek bel, mom fit. Retro şıklık modern konforla buluşuyor. Premium denim.",
        sizes: ["26", "28", "30", "32"],
        featured: true
    },
    {
        id: 10,
        name: "Blazer Ceket",
        category: "erkek",
        price: 1199,
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&q=80",
        description: "Modern kesim blazer. İş toplantılarından özel davetlere. Kusursuz dikişler.",
        sizes: ["M", "L", "XL", "XXL"],
        featured: false
    },
    {
        id: 11,
        name: "Polo Yaka Tişört",
        category: "erkek",
        price: 349,
        image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500&q=80",
        description: "Klasik polo tişört. Pamuklu, nefes alan kumaş. Spor şıklık arayanlar için.",
        sizes: ["S", "M", "L", "XL"],
        featured: false
    },
    {
        id: 12,
        name: "Maxi Elbise",
        category: "kadin",
        price: 849,
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80",
        description: "Uzun maxi elbise, çiçek deseni. Bohemian şıklık. Plaj ve tatil için ideal.",
        sizes: ["S", "M", "L"],
        featured: true
    },
    {
        id: 13,
        name: "Siyah Suni Deri Erkek Kemer",
        category: "aksesuar",
        price: 659,
        image: "https://cdn.dsmcdn.com/ty1858/prod/QC_ENRICHMENT/20260420/04/d1efc629-e412-3282-bbc6-4f2222491b3e/1_org_zoom.jpg",
        description: "Siyah Mavi Suni Deri Erkek Kemer A Kalitedir.",
        sizes: ["S", "M", "L", "XL"],
        featured: false
    },
    {
        id: 14,
        name: "Siyah Parlak Metal Tokalı Deri Kadın Kemer",
        category: "aksesuar",
        price: 799,
        image: "https://cdn2.jimmykey.com/jimmykey/ContentImages/Product/2025kis/5WW415454/parlak-metal-tokali-deri-gorunumlu-kemer_5ww415454_siyah-900-siyah_9_614x805.webp",
        description: "Siyah Parlak Metal Tokalı Deri Kadın Kemeri A Kalitedir",
        sizes: ["S", "M", "L", "XL"],
        featured: true
    },
    {
        id: 15,
        name: "Çeşitli Gümüş Pantolon Zinciri",
        category: "aksesuar",
        price: 355,
        image: "https://www.metalgiyim.com/idea/av/02/myassets/products/536/ikili-pantolon-zinciri.jpg?revision=1758132021",
        description: "Çeşitli Gümüş Pantolon Zinciri (tek,2,3,4 zincirli seçebilirsiniz.)",
        sizes: ["1", "2", "3", "4"],
        featured: true
    },
    {
        id: 16,
        name: "Siyah Unisex Şapka",
        category: "aksesuar",
        price: 250,
        image: "https://cdn.kaft.com/static/images/hat/1792_3.jpg?cacheID=1738838741000",
        description: "Siyah Unisex Şapka A Kalitedir.",
        sizes: [],
        featured: true
    },
    {
        id: 17,
        name: "Bej Unisex Bere",
        category: "aksesuar",
        price: 200,
        image: "https://cdn.tozlu.com/img/640/85/unisex-bere-1b847-ba411.webp",
        description: "Bej Unisex Bere Örmedir.",
        sizes: [],
        featured: true
    },
    {
        id: 18,
        name: "Gümüş Erkek Kolye Bileklik Set",
        category: "aksesuar",
        price: 3000,
        image: "https://img.ventinosilver.com/4mm-gurmet-925-ayar-gumus-erkek-zincir-kolye-bileklik-set-ves-8503-erkek-gurmet-gumus-set-ventino-silver-ves-8503-28763-30-B.jpg",
        description: "4mm Gurmet 925 Ayar Gümüş Erkek Zincir Kolye Seti",
        sizes: ["50cm", "55cm", "60cm", "65cm"],
        featured: true
    },
    {
        id: 19,
        name: "Gümüş Kadın Kolye Bileklik Set",
        category: "aksesuar",
        price: 4200,
        image: "https://cdn03.ciceksepeti.com/cicek/kcm9811517-1/L/kadin-gumus-kolye-bileklik-set-925-ayar-gumus-bombeli-ezme-model-kadin-set-kcm9811517-1-54ecfaedf00a4fb3b99600792970b505.jpg",
        description: "925 Ayar Gümüş Bombeli Ezme Kadın Zincir Kolye Seti",
        sizes: ["50cm", "55cm", "60cm", "65cm"],
        featured: true
    },
    {
        id: 20,
        name: "Erkek Kravat",
        category: "aksesuar",
        price: 1050,
        image: "https://static.ticimax.cloud/cdn-cgi/image/width=-,quality=85/10864/uploads/urunresimleri/buyuk/erkek-siyah-basic-duz-slim-fit-3lu-tak-3ffc-4.jpg",
        description: "Erkek Siyah Basic Kravat",
        sizes: ["42D", "44D", "46D", "50D"],
        featured: true
    },
    {
        id: 21,
        name: "Erkek Daniel Klein Saat",
        category: "aksesuar",
        price: 4000,
        image: "https://cdn.bisaat.com/img/l/7/daniel-klein-dk452808-celik-kordonlu-erkek-kol-saati-31272.jpg",
        description: "Erkek Daniel Klein Saat DK452808 Model Çelik Kordonlu Kol Saati.",
        sizes: ["46mm", "48mm", "50mm", "52mm"],
        featured: true
    },
    {
        id: 22,
        name: "Kadın Casio Saat",
        category: "aksesuar",
        price: 4540,
        image: "https://cdn03.ciceksepeti.com/cicek/kcm41919000-1/XL/casio-csiste146-gold-gumus-renk-takvimli-kadin-kol-saati-kcm41919000-1-68a312ff1e564f1ca7bd1fcf4fe69adb.jpg",
        description: "Casio CSISTE146 Gold Gümüş Renk Takvimli Kadın Kol Saati.",
        sizes: ["24mm", "26mm", "28mm", "30mm"],
        featured: true
    },
    
    
    
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = products;
}
