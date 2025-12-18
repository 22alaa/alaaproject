const State = {
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    favorites: JSON.parse(localStorage.getItem('favorites')) || [],
    language: localStorage.getItem('language') || 'en',
    theme: localStorage.getItem('theme') || 'dark'
};

// Initialize Toast Container and Modal
function initToastAndModal() {
    // Toast Container
    if (!document.querySelector('.toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Confirm Modal
    if (!document.getElementById('confirmModal')) {
        const modalHTML = `
        <div class="modal-overlay" id="confirmModal">
            <div class="modal">
                <div class="modal-title" id="confirmModalTitle"></div>
                <div class="modal-message" id="confirmModalMessage"></div>
                <div class="modal-actions">
                    <button class="modal-btn modal-btn-cancel" id="confirmCancelBtn" onclick="closeConfirmModal()"></button>
                    <button class="modal-btn modal-btn-confirm" id="confirmModalBtn"></button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    // Rating Modal
    if (!document.getElementById('ratingModal')) {
        const ratingHTML = `
        <div class="modal-overlay" id="ratingModal">
            <div class="modal">
                <div class="modal-title" id="ratingModalTitle"></div>
                <div class="rating-stars" id="ratingStars">
                    <span class="rating-star" data-rating="1">★</span>
                    <span class="rating-star" data-rating="2">★</span>
                    <span class="rating-star" data-rating="3">★</span>
                    <span class="rating-star" data-rating="4">★</span>
                    <span class="rating-star" data-rating="5">★</span>
                </div>
                <div class="modal-message" id="ratingMessage"></div>
                <div class="modal-actions">
                    <button class="modal-btn modal-btn-cancel" id="ratingCancelBtn" onclick="closeRatingModal()"></button>
                    <button class="modal-btn modal-btn-submit" id="ratingSubmitBtn" onclick="submitRating()"></button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', ratingHTML);
        initRatingStars();
    }
    
    // Update modal texts based on language
    updateModalTexts();
}

function updateModalTexts() {
    const isAr = State.language === 'ar';
    
    // Confirm modal buttons
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    const confirmModalBtn = document.getElementById('confirmModalBtn');
    if (confirmCancelBtn) confirmCancelBtn.textContent = isAr ? 'إلغاء' : 'Cancel';
    if (confirmModalBtn) confirmModalBtn.textContent = isAr ? 'حذف' : 'Delete';
    
    // Rating modal
    const ratingModalTitle = document.getElementById('ratingModalTitle');
    const ratingMessage = document.getElementById('ratingMessage');
    const ratingCancelBtn = document.getElementById('ratingCancelBtn');
    const ratingSubmitBtn = document.getElementById('ratingSubmitBtn');
    
    if (ratingModalTitle) ratingModalTitle.textContent = isAr ? 'قيّم هذا المنتج' : 'Rate This Product';
    if (ratingMessage) ratingMessage.textContent = isAr ? 'اختر تقييمك' : 'Select your rating';
    if (ratingCancelBtn) ratingCancelBtn.textContent = isAr ? 'إلغاء' : 'Cancel';
    if (ratingSubmitBtn) ratingSubmitBtn.textContent = isAr ? 'إرسال' : 'Submit';
}

// Toast Function
function showToast(message, type = 'success') {
    const container = document.querySelector('.toast-container');
    if (!container) return;
    
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Confirm Modal Functions
let pendingDeleteId = null;

function showConfirmModal(id, itemName) {
    pendingDeleteId = id;
    const modal = document.getElementById('confirmModal');
    const title = document.getElementById('confirmModalTitle');
    const message = document.getElementById('confirmModalMessage');
    
    title.textContent = State.language === 'en' ? 'Confirm Delete' : 'تأكيد الحذف';
    message.textContent = State.language === 'en' 
        ? `Are you sure you want to remove "${itemName}" from cart?` 
        : `هل أنت متأكد من حذف "${itemName}" من السلة؟`;
    
    modal.classList.add('show');
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('show');
    pendingDeleteId = null;
}

function confirmDelete() {
    if (pendingDeleteId !== null) {
        State.cart = State.cart.filter(item => item.id !== pendingDeleteId);
        saveState();
        updateCounts();
        renderCart();
        closeConfirmModal();
        showToast(State.language === 'en' ? 'Item removed from cart' : 'تم حذف العنصر من السلة', 'success');
    }
}

// Rating Modal Functions
let currentRating = 0;
let currentProductId = null;

function openRatingModal(productId) {
    currentProductId = productId;
    currentRating = 0;
    const modal = document.getElementById('ratingModal');
    const stars = document.querySelectorAll('.rating-star');
    stars.forEach(star => star.classList.remove('active'));
    document.getElementById('ratingMessage').textContent = State.language === 'en' ? 'Select your rating' : 'اختر تقييمك';
    modal.classList.add('show');
}

function closeRatingModal() {
    const modal = document.getElementById('ratingModal');
    modal.classList.remove('show');
    currentProductId = null;
    currentRating = 0;
}

function initRatingStars() {
    const stars = document.querySelectorAll('.rating-star');
    stars.forEach(star => {
        star.addEventListener('mouseenter', function() {
            const rating = this.dataset.rating;
            highlightStars(rating);
        });
        
        star.addEventListener('mouseleave', function() {
            highlightStars(currentRating);
        });
        
        star.addEventListener('click', function() {
            currentRating = parseInt(this.dataset.rating);
            highlightStars(currentRating);
            const messages = {
                1: State.language === 'en' ? 'Poor' : 'ضعيف',
                2: State.language === 'en' ? 'Fair' : 'مقبول',
                3: State.language === 'en' ? 'Good' : 'جيد',
                4: State.language === 'en' ? 'Very Good' : 'جيد جداً',
                5: State.language === 'en' ? 'Excellent' : 'ممتاز'
            };
            document.getElementById('ratingMessage').textContent = messages[currentRating];
        });
    });
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('.rating-star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function submitRating() {
    if (currentRating === 0) {
        showToast(State.language === 'en' ? 'Please select a rating' : 'الرجاء اختيار تقييم', 'error');
        return;
    }
    closeRatingModal();
    showToast(State.language === 'en' ? 'Thank you for your rating!' : 'شكراً لتقييمك!', 'success');
}

function saveState() {
    localStorage.setItem('cart', JSON.stringify(State.cart));
    localStorage.setItem('favorites', JSON.stringify(State.favorites));
}

function updateCounts() {
    const cartCount = document.getElementById('cartCount');
    const favCount = document.getElementById('favCount');
    if (cartCount) cartCount.textContent = State.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (favCount) favCount.textContent = State.favorites.length;
}

function addToCart(product) {
    const existing = State.cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity++;
    } else {
        State.cart.push({ ...product, quantity: 1 });
    }
    saveState();
    updateCounts();
    renderCart();
    showToast(State.language === 'en' ? 'Added to cart!' : 'تمت الإضافة للسلة!', 'success');
}

function removeFromCart(id) {
    const item = State.cart.find(i => i.id === id);
    if (item) {
        const itemName = State.language === 'en' ? item.name : item.nameAr;
        showConfirmModal(id, itemName);
    }
}

function updateQuantity(id, delta) {
    const item = State.cart.find(i => i.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            saveState();
            renderCart();
        }
    }
}



function addToFavorites(product) {
    if (!State.favorites.find(item => item.id === product.id)) {
        State.favorites.push(product);
        saveState();
        showToast(State.language === 'en' ? 'Added to favorites!' : 'تمت الإضافة للمفضلة!', 'success');
        updateCounts();
        renderFavorites();
    }
}

function removeFromFavorites(id) {
    State.favorites = State.favorites.filter(item => item.id !== id);
    saveState();
    updateCounts();
    renderFavorites();
}

function renderCart() {
    const container = document.getElementById('cartItems');
    const total = State.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.getElementById('cartTotal').textContent = '$' + total;
    if (State.cart.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:2rem;opacity:0.5;">' +
            (State.language === 'en' ? 'Cart is empty' : 'السلة فارغة') + '</p>';
        return;
    }
    container.innerHTML = State.cart.map(item => `
<div class="cart-item">
<img src="${item.image}" class="item-img" alt="${item.name}">
<div class="item-info">
<div class="item-name">${State.language === 'en' ? item.name : item.nameAr}</div>
<div class="item-price">$${item.price}</div>
<div class="item-controls">
<button class="qty-btn" onclick="updateQuantity(${item.id},-1)">-</button>
<span>${item.quantity}</span>
<button class="qty-btn" onclick="updateQuantity(${item.id},1)">+</button>
<button class="remove-btn" onclick="removeFromCart(${item.id})">${State.language === 'en' ? 'Remove' : 'إزالة'}</button>
</div>
</div>
</div>
`).join('');
}
const checkoutBtn = document.querySelector('.checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openPurchaseModal(); // يفتح نافذة الطلب
    });
}
function openPurchaseModal() {
    const modal = document.getElementById('purchaseModal');
    if (modal) {
        modal.classList.add('active'); // تظهر نافذة اكمل الطلب
        applyLanguage();
    }
}

purchaseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('تم الحجز، سيتم التواصل معك');
    purchaseForm.reset();
    closePurchaseModal();
});
function closePurchaseModal() {
    const modal = document.getElementById('purchaseModal');
    if (modal) modal.classList.remove('active');
}


function renderFavorites() {
    const container = document.getElementById('favItems');
    if (State.favorites.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:2rem;opacity:0.5;">' +
            (State.language === 'en' ? 'No favorites yet' : 'لا توجد مفضلة بعد') + '</p>';
        return;
    }
    container.innerHTML = State.favorites.map(item => `
<div class="fav-item">
<img src="${item.image}" class="item-img" alt="${item.name}">
<div class="item-info">
<div class="item-name">${State.language === 'en' ? item.name : item.nameAr}</div>
<div class="item-price">$${item.price}</div>
<button class="remove-btn" onclick="removeFromFavorites(${item.id})">${State.language === 'en' ? 'Remove' : 'إزالة'}</button>
</div>
</div>
`).join('');
}

function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    const isActive = panel.classList.contains('active');
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    if (!isActive) {
        panel.classList.add('active');
    }
}

function applyLanguage() {
    const html = document.documentElement;
    html.setAttribute('lang', State.language);
    html.setAttribute('dir', State.language === 'ar' ? 'rtl' : 'ltr');
    document.querySelectorAll('[data-lang-en]').forEach(el => {
        el.textContent = el.getAttribute('data-lang-' + State.language);
    });
    document.querySelectorAll('.search-input').forEach(el => {
        el.placeholder = el.getAttribute('data-lang-' + State.language);
    });
    const langBtn = document.getElementById('langBtn');
    if (langBtn) langBtn.textContent = State.language === 'en' ? 'AR' : 'EN';
    renderCart();
    renderFavorites();
    if (window.productsData) {
        renderProducts(window.productsData);
    }
    // Update modal texts when language changes
    updateModalTexts();
    localStorage.setItem('language', State.language);
}

function switchLanguage() {
    State.language = State.language === 'en' ? 'ar' : 'en';
    applyLanguage();
}

function switchTheme() {
    State.theme = State.theme === 'dark' ? 'light' : 'dark';
    document.body.classList.toggle('light');
    localStorage.setItem('theme', State.theme);
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    // Check page type
    const isGamesPage = window.location.pathname.includes('games.html');
    const isClothesPage = window.location.pathname.includes('clothes.html');
    
    grid.innerHTML = products.map(product => {
        const productName = State.language === 'en' ? product.name : product.nameAr;
        const productJson = JSON.stringify(product).replace(/'/g, "&apos;");
        const addToCartText = State.language === 'en' ? 'Add to Cart' : 'أضف للسلة';
        const backImage = product.backImage || product.image;
        
        if (isGamesPage) {
            // Games page with overlay + flip
            return `
<div class="flip-card" data-category="${product.category}" onclick="flipCard(this, event)">
<div class="flip-card-inner">
<div class="flip-card-front">
<div class="product-card">
<div class="product-img-container">
<img src="${product.image}" class="product-img" alt="${product.name}">

</div>
<div class="product-info">
<div class="product-name">${productName}</div>
<div class="product-price">$${product.price}</div>
<div class="product-actions">
<button class="add-to-cart" onclick='event.stopPropagation(); addToCart(${productJson})'>${addToCartText}</button>
<button class="add-to-fav" onclick='event.stopPropagation(); addToFavorites(${productJson})'>❤</button>
<button class="rate-btn" onclick='event.stopPropagation(); openRatingModal(${product.id})'>★</button>

</div>
</div>
</div>
</div>
<div class="flip-card-back">
<img src="${backImage}" alt="${product.name}">
</div>
</div>
</div>`;
        } else if (isClothesPage) {
            // Clothes page with rating button + flip
            return `
<div class="flip-card" data-category="${product.category}" onclick="flipCard(this, event)">
<div class="flip-card-inner">
<div class="flip-card-front">
<div class="product-card">
<img src="${product.image}" class="product-img" alt="${product.name}">
<div class="product-info">
<div class="product-name">${productName}</div>
<div class="product-price">$${product.price}</div>
<div class="product-actions">
<button class="add-to-cart" onclick='event.stopPropagation(); addToCart(${productJson})'>${addToCartText}</button>
<button class="add-to-fav" onclick='event.stopPropagation(); addToFavorites(${productJson})'>❤</button>
<button class="rate-btn" onclick='event.stopPropagation(); openRatingModal(${product.id})'>★</button>
</div>
</div>
</div>
</div>
<div class="flip-card-back">
<img src="${backImage}" alt="${product.name}">
</div>
</div>
</div>`;
        } else {
            // Other pages with flip
            return `
<div class="flip-card" data-category="${product.category}" onclick="flipCard(this, event)">
<div class="flip-card-inner">
<div class="flip-card-front">
<div class="product-card">
<img src="${product.image}" class="product-img" alt="${product.name}">
<div class="product-info">
<div class="product-name">${productName}</div>
<div class="product-price">$${product.price}</div>
<div class="product-actions">
<button class="add-to-cart" onclick='event.stopPropagation(); addToCart(${productJson})'>${addToCartText}</button>
<button class="add-to-fav" onclick='event.stopPropagation(); addToFavorites(${productJson})'>❤</button>
<button class="rate-btn" onclick='event.stopPropagation(); openRatingModal(${product.id})'>★</button>

</div>
</div>
</div>
</div>
<div class="flip-card-back">
<img src="${backImage}" alt="${product.name}">
</div>
</div>
</div>`;
        }
    }).join('');
}

// Flip card function
function flipCard(flipCardElement, event) {
    // Don't flip if clicking on buttons
    if (event.target.tagName === 'BUTTON') return;
    flipCardElement.classList.toggle('flipped');
}

function filterProducts(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    const cards = document.querySelectorAll('.flip-card');
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function searchProducts(query) {
    if (!window.productsData) return;
    const filtered = window.productsData.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.nameAr && p.nameAr.includes(query))
    );
    renderProducts(filtered);
}

function animateCounter(element) {
    const target = parseInt(element.dataset.count);
    const duration = 2000;
    const step = target / duration * 10;
    let current = 0;
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 10);
}

function initSlider() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;
    let current = 0;
    setInterval(() => {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelector('.loader-overlay').classList.add('hidden');
    }, 800);

    // Initialize Toast and Modal
    initToastAndModal();
    
    // Add event listener for confirm delete button
    setTimeout(() => {
        const confirmBtn = document.getElementById('confirmModalBtn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', confirmDelete);
        }
    }, 100);

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    if (State.theme === 'light') {
        document.body.classList.add('light');
    }
    applyLanguage();
    updateCounts();
    renderCart();
    renderFavorites();

    const favBtn = document.getElementById('favBtn');
    const cartBtn = document.getElementById('cartBtn');
    const langBtn = document.getElementById('langBtn');
    const themeBtn = document.getElementById('themeBtn');

    if (favBtn) favBtn.addEventListener('click', () => togglePanel('favPanel'));
    if (cartBtn) cartBtn.addEventListener('click', () => togglePanel('cartPanel'));
    if (langBtn) langBtn.addEventListener('click', switchLanguage);
    if (themeBtn) themeBtn.addEventListener('click', switchTheme);

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }

    document.querySelectorAll('.close-panel').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById(btn.dataset.panel).classList.remove('active');
        });
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => filterProducts(btn.dataset.filter));
    });

    document.querySelectorAll('.search-input').forEach(input => {
        input.addEventListener('input', e => searchProducts(e.target.value));
    });

    if (window.productsData) {
        renderProducts(window.productsData);
    }

    const counters = document.querySelectorAll('.stat-number[data-count]');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(counter => observer.observe(counter));

    initSlider();

    const heroImage = document.querySelector('.hero-image img');
    if (heroImage) {
        document.addEventListener('mousemove', e => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            const moveX = (x - 0.5) * 30;
            const moveY = (y - 0.5) * 30;
            heroImage.style.transform = `rotate(-5deg) translate(${moveX}px,${moveY}px)`;
        });
    }
    // Auth Forms Handling
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotForm = document.getElementById('forgotForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = State.language === 'en' ? 'Logging in...' : 'جاري الدخول...';
            btn.style.opacity = '0.7';
            setTimeout(() => {
                alert(State.language === 'en' ? 'Login Successful! (Demo)' : 'تم تسجيل الدخول بنجاح! (تجريبي)');
                btn.textContent = originalText;
                btn.style.opacity = '1';
                window.location.href = 'index.html';
            }, 1500);
        });
    }

    if (registerForm) {
        const passwordInput = document.getElementById('password');
        const strengthBar = document.getElementById('strengthBar');

        if (passwordInput && strengthBar) {
            passwordInput.addEventListener('input', (e) => {
                const val = e.target.value;
                let strength = 0;
                if (val.length > 6) strength += 25;
                if (val.match(/[A-Z]/)) strength += 25;
                if (val.match(/[0-9]/)) strength += 25;
                if (val.match(/[^A-Za-z0-9]/)) strength += 25;

                strengthBar.style.width = strength + '%';
                if (strength < 50) strengthBar.style.background = '#ff4444';
                else if (strength < 75) strengthBar.style.background = '#ffbb33';
                else strengthBar.style.background = '#00C851';
            });
        }

        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = registerForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = State.language === 'en' ? 'Creating Account...' : 'جاري إنشاء الحساب...';
            btn.style.opacity = '0.7';
            setTimeout(() => {
                alert(State.language === 'en' ? 'Account Created! (Demo)' : 'تم إنشاء الحساب! (تجريبي)');
                btn.textContent = originalText;
                btn.style.opacity = '1';
                window.location.href = 'login.html';
            }, 1500);
        });
    }

    if (forgotForm) {
        forgotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = forgotForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = State.language === 'en' ? 'Sending...' : 'جاري الإرسال...';
            btn.style.opacity = '0.7';
            setTimeout(() => {
                alert(State.language === 'en' ? 'Reset link sent to your email! (Demo)' : 'تم إرسال رابط إعادة التعيين إلى بريدك! (تجريبي)');
                btn.textContent = originalText;
                btn.style.opacity = '1';
                window.location.href = 'login.html';
            }, 1500);
        });
    }


    const scrollObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, scrollObserverOptions);

    document.querySelectorAll('.fade-in-section').forEach(section => {
        scrollObserver.observe(section);
    });


    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const nextSection = document.querySelector('.slider-section');
            if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }


    const sliderContainer = document.querySelector('.services-slider-container');
    const slider = document.querySelector('.services-slider');

    if (sliderContainer && slider) {
        let isDown = false;
        let startX;
        let scrollLeft;
        let animationId;
        let isHovering = false;


        let scrollSpeed = 0.5;
        let currentScroll = 0;


        sliderContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            sliderContainer.classList.add('active');
            startX = e.pageX - sliderContainer.offsetLeft;
            scrollLeft = sliderContainer.scrollLeft;
            cancelAnimationFrame(animationId);
        });

        sliderContainer.addEventListener('mouseleave', () => {
            isDown = false;
            sliderContainer.classList.remove('active');
            isHovering = false;
            startAutoScroll();
        });

        sliderContainer.addEventListener('mouseup', () => {
            isDown = false;
            sliderContainer.classList.remove('active');
            startAutoScroll();
        });

        sliderContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - sliderContainer.offsetLeft;
            const walk = (x - startX) * 2;
            sliderContainer.scrollLeft = scrollLeft - walk;
        });


        sliderContainer.addEventListener('touchstart', (e) => {
            isDown = true;
            startX = e.touches[0].pageX - sliderContainer.offsetLeft;
            scrollLeft = sliderContainer.scrollLeft;
            cancelAnimationFrame(animationId);
        });

        sliderContainer.addEventListener('touchend', () => {
            isDown = false;
            startAutoScroll();
        });

        sliderContainer.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            const x = e.touches[0].pageX - sliderContainer.offsetLeft;
            const walk = (x - startX) * 2;
            sliderContainer.scrollLeft = scrollLeft - walk;
        });


        sliderContainer.addEventListener('mouseenter', () => {
            isHovering = true;
            cancelAnimationFrame(animationId);
        });


        function startAutoScroll() {
            if (isHovering || isDown) return;

            function step() {
                if (isHovering || isDown) return;

                const isRTL = document.documentElement.dir === 'rtl' || document.dir === 'rtl';

                if (isRTL) {
                    sliderContainer.scrollLeft -= scrollSpeed;
                    // For RTL, we scroll left (negative or decreasing). 
                    // Reset if we hit the limit (which is roughly scrollWidth - clientWidth in magnitude, 
                    // but scrollLeft might be 0 at start and go negative, or start at max and go to 0).
                    // Simplest check: if we can't scroll left anymore, reset.
                    // Or check if scrollLeft is close to the limit.
                    // In many browsers, RTL scrollLeft goes from 0 (right) to -max (left).
                    // In others (Firefox), 0 (left) to max (right) but displayed RTL.

                    // Let's use a robust reset: if scrollLeft didn't change after decrement, or hit a known limit.
                    // Actually, let's try a simple reset based on scrollWidth.

                    // If scrollLeft is negative (Chrome/Safari):
                    if (sliderContainer.scrollLeft <= -(sliderContainer.scrollWidth - sliderContainer.clientWidth)) {
                        sliderContainer.scrollLeft = 0;
                    }
                    // If scrollLeft is positive (Firefox/IE) and we are moving left (decreasing):
                    else if (sliderContainer.scrollLeft <= 0 && (sliderContainer.scrollWidth > sliderContainer.clientWidth)) {
                        // This case is tricky because 0 might be the start (right) or end (left).
                        // In Firefox RTL: 0 is Left (End), Max is Right (Start).
                        // So we decrement from Max to 0.
                        // If we hit 0, we reset to Max.
                        if (Math.abs(sliderContainer.scrollLeft) < 1) {
                            sliderContainer.scrollLeft = sliderContainer.scrollWidth - sliderContainer.clientWidth;
                        }
                    }
                } else {
                    sliderContainer.scrollLeft += scrollSpeed;
                    if (sliderContainer.scrollLeft >= (sliderContainer.scrollWidth - sliderContainer.clientWidth)) {
                        sliderContainer.scrollLeft = 0;
                    }
                }

                animationId = requestAnimationFrame(step);
            }
            animationId = requestAnimationFrame(step);
        }

        startAutoScroll();
    }
});

// Hero Section Animation - Image first, then text with typewriter effect
(function() {
    // Only run on index.html
    if (!document.querySelector('.hero-image')) return;

    const heroImage = document.querySelector('.hero-image img');
    const heroText = document.getElementById('heroText');
    const heroTitle = document.getElementById('heroTitle');
    const heroDescription = document.getElementById('heroDescription');
    const heroButton = document.getElementById('heroButton');

    if (!heroImage || !heroText || !heroTitle) return;

    // Check if image is already loaded
    let imageLoaded = heroImage.complete && heroImage.naturalHeight !== 0;
    let animationStarted = false;
    let cycleCount = 0; // Track typewriter cycles
    let activeTimeouts = []; // Track active timeouts to clear them on language change

    // Store original HTML structure for reading text
    function getTextContent() {
        // Get current language
        const currentLang = State.language || 'en';
        
        // Read text from HTML attributes
        // Try to find elements in heroTitle first
        let titleEnSpan = heroTitle.querySelector('[data-lang-en]');
        let titleGradientSpan = heroTitle.querySelector('.gradient-text');
        
        // If not found (heroTitle was cleared), try to read from the page source
        // by checking if the original HTML still exists somewhere
        if (!titleEnSpan || !titleGradientSpan) {
            // Read directly from data attributes in the HTML source
            // These are hardcoded in index.html
            const firstLine = currentLang === 'ar' ? 'أطلق العنان لـ' : 'Unleash Your';
            const secondLine = currentLang === 'ar' ? 'قوتك الداخلية' : 'Inner Strength';
            const descText = heroDescription.getAttribute(`data-lang-${currentLang}`) || 
                           (currentLang === 'ar' 
                               ? 'برامج تدريبية نخبوية مصممة للأبطال. تجاوز حدودك، حقق العظمة.' 
                               : 'Elite training programs designed for champions. Push your limits, achieve greatness.');
            const buttonText = heroButton.getAttribute(`data-lang-${currentLang}`) || 
                              (currentLang === 'ar' ? 'ابدأ رحلتك' : 'Start Your Journey');
            
            return {
                firstLine,
                secondLine,
                descText,
                buttonText,
                currentLang
            };
        }
        
        // If elements found, read from them
        const firstLine = currentLang === 'ar' 
            ? titleEnSpan.getAttribute('data-lang-ar') 
            : titleEnSpan.getAttribute('data-lang-en') || titleEnSpan.textContent.trim();
        
        const secondLine = currentLang === 'ar'
            ? titleGradientSpan.getAttribute('data-lang-ar')
            : titleGradientSpan.getAttribute('data-lang-en') || titleGradientSpan.textContent.trim();
        
        const descText = heroDescription.getAttribute(`data-lang-${currentLang}`) || heroDescription.textContent;
        const buttonText = heroButton.getAttribute(`data-lang-${currentLang}`) || heroButton.textContent;
        
        return {
            firstLine,
            secondLine,
            descText,
            buttonText,
            currentLang
        };
    }

    function startTextAnimation() {
        if (animationStarted) return;
        animationStarted = true;

        // Get text content BEFORE clearing heroTitle
        const textContent = getTextContent();
        if (!textContent) {
            console.error('Could not get text content');
            return;
        }
        
        const { firstLine, secondLine, descText, buttonText } = textContent;

        // Show text container
        heroText.classList.add('show');
        
        // Clear title only - description and button will show immediately
        heroTitle.innerHTML = '';
        
        // Show description and button immediately (no typewriter for them)
        heroDescription.textContent = descText;
        heroDescription.style.transition = 'opacity 0.8s ease-in';
        heroDescription.style.opacity = '1';
        
        const buttonSpan = heroButton.querySelector('span');
        if (buttonSpan) {
            buttonSpan.textContent = buttonText;
        } else {
            heroButton.textContent = buttonText;
        }
        heroButton.style.transition = 'opacity 0.8s ease-in';
        heroButton.style.opacity = '1';

        // Helper function to add timeout and track it
        function addTimeout(callback, delay) {
            const timeoutId = setTimeout(() => {
                activeTimeouts = activeTimeouts.filter(id => id !== timeoutId);
                callback();
            }, delay);
            activeTimeouts.push(timeoutId);
            return timeoutId;
        }

        // Typewriter cycle for title only: type -> delete -> retype (infinite loop)
        cycleCount = 0; // Reset cycle count for this animation

        function startTypewriterCycle() {
            // Get FRESH text content based on CURRENT language
            const freshContent = getTextContent();
            const currentFirstLine = freshContent ? freshContent.firstLine : firstLine;
            const currentSecondLine = freshContent ? freshContent.secondLine : secondLine;
            
            // Also update description and button with current language
            if (freshContent) {
                heroDescription.textContent = freshContent.descText;
                const buttonSpan = heroButton.querySelector('span');
                if (buttonSpan) {
                    buttonSpan.textContent = freshContent.buttonText;
                } else {
                    heroButton.textContent = freshContent.buttonText;
                }
            }
            
            cycleCount++;
            heroTitle.classList.remove('complete');
            heroTitle.innerHTML = '';
            
            // Type first line
            let charIndex = 0;
            function typeFirstLine() {
                if (charIndex < currentFirstLine.length) {
                    heroTitle.textContent += currentFirstLine.charAt(charIndex);
                    charIndex++;
                    addTimeout(typeFirstLine, 50);
                } else {
                    // Add line break and start second line with gradient
                    heroTitle.innerHTML = currentFirstLine + '<br><span class="gradient-text"></span>';
                    charIndex = 0;
                    addTimeout(typeSecondLine, 300);
                }
            }

            function typeSecondLine() {
                const gradientSpan = heroTitle.querySelector('.gradient-text');
                if (charIndex < currentSecondLine.length) {
                    if (gradientSpan) {
                        gradientSpan.textContent += currentSecondLine.charAt(charIndex);
                    }
                    charIndex++;
                    addTimeout(typeSecondLine, 50);
                } else {
                    // After typing is complete, wait then delete and retype (infinite loop)
                    addTimeout(() => {
                        deleteText();
                    }, 2000);
                }
            }

            function deleteText() {
                const gradientSpan = heroTitle.querySelector('.gradient-text');
                
                if (gradientSpan && gradientSpan.textContent.length > 0) {
                    // Delete from second line (gradient) - backwards
                    gradientSpan.textContent = gradientSpan.textContent.slice(0, -1);
                    addTimeout(deleteText, 30);
                } else {
                    // Remove gradient span and line break if exists
                    if (gradientSpan) {
                        const br = gradientSpan.previousSibling;
                        if (br && br.nodeName === 'BR') {
                            heroTitle.removeChild(br);
                        }
                        heroTitle.removeChild(gradientSpan);
                    }
                    
                    // Delete from first line
                    const firstLineText = heroTitle.textContent || '';
                    if (firstLineText.length > 0) {
                        heroTitle.textContent = firstLineText.slice(0, -1);
                        addTimeout(deleteText, 30);
                    } else {
                        // After deletion, restart typing
                        addTimeout(startTypewriterCycle, 500);
                    }
                }
            }

            // Start typing
            typeFirstLine();
        }

        // Start first cycle after a short delay
        addTimeout(startTypewriterCycle, 200);
    }

    if (imageLoaded) {
        // Image already loaded, start animation after image animation completes
        setTimeout(startTextAnimation, 1200);
    } else {
        // Wait for image to load
        heroImage.addEventListener('load', () => {
            setTimeout(startTextAnimation, 1200);
        });
        
        // Fallback: if image takes too long, start anyway
        setTimeout(() => {
            if (!animationStarted) {
                startTextAnimation();
            }
        }, 3000);
    }

    // Function to clear all active timeouts
    function clearAllTimeouts() {
        activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        activeTimeouts = [];
    }

    // Function to restart typewriter with current language
    function restartTypewriter() {
        // Clear all active timeouts to stop current animation
        clearAllTimeouts();
        
        // Get new text content based on current language
        const textContent = getTextContent();
        if (!textContent) return;
        
        const { firstLine, secondLine, descText, buttonText } = textContent;
        
        // Update description and button immediately
        heroDescription.textContent = descText;
        const buttonSpan = heroButton.querySelector('span');
        if (buttonSpan) {
            buttonSpan.textContent = buttonText;
        } else {
            heroButton.textContent = buttonText;
        }
        
        // Reset and restart typewriter
        heroTitle.classList.remove('complete');
        heroTitle.innerHTML = '';
        cycleCount = 0;
        
        // Helper function to add timeout and track it
        function addTimeout(callback, delay) {
            const timeoutId = setTimeout(() => {
                activeTimeouts = activeTimeouts.filter(id => id !== timeoutId);
                callback();
            }, delay);
            activeTimeouts.push(timeoutId);
            return timeoutId;
        }
        
        const maxCycles = 2;
        
        function startTypewriterCycle() {
            cycleCount++;
            heroTitle.classList.remove('complete');
            heroTitle.innerHTML = '';
            
            let charIndex = 0;
            function typeFirstLine() {
                if (charIndex < firstLine.length) {
                    heroTitle.textContent += firstLine.charAt(charIndex);
                    charIndex++;
                    addTimeout(typeFirstLine, 50);
                } else {
                    heroTitle.innerHTML = firstLine + '<br><span class="gradient-text"></span>';
                    charIndex = 0;
                    addTimeout(typeSecondLine, 300);
                }
            }

            function typeSecondLine() {
                const gradientSpan = heroTitle.querySelector('.gradient-text');
                if (charIndex < secondLine.length) {
                    if (gradientSpan) {
                        gradientSpan.textContent += secondLine.charAt(charIndex);
                    }
                    charIndex++;
                    addTimeout(typeSecondLine, 50);
                } else {
                    // Wait then delete and retype
                    addTimeout(() => deleteText(), 2000);
                }
            }

            function deleteText() {
                const gradientSpan = heroTitle.querySelector('.gradient-text');
                
                if (gradientSpan && gradientSpan.textContent.length > 0) {
                    gradientSpan.textContent = gradientSpan.textContent.slice(0, -1);
                    addTimeout(deleteText, 30);
                } else {
                    if (gradientSpan) {
                        const br = gradientSpan.previousSibling;
                        if (br && br.nodeName === 'BR') {
                            heroTitle.removeChild(br);
                        }
                        heroTitle.removeChild(gradientSpan);
                    }
                    
                    const firstLineText = heroTitle.textContent || '';
                    if (firstLineText.length > 0) {
                        heroTitle.textContent = firstLineText.slice(0, -1);
                        addTimeout(deleteText, 30);
                    } else {
                        addTimeout(startTypewriterCycle, 500);
                    }
                }
            }

            typeFirstLine();
        }
        
        addTimeout(startTypewriterCycle, 200);
    }

    // Update text when language changes - no need to restart, typewriter will pick up new language on next cycle
    const originalUpdateLanguage = updateLanguage;
    window.updateLanguage = function() {
        originalUpdateLanguage();
        
        // Update description and button immediately
        if (heroText && heroText.classList.contains('show')) {
            const freshContent = getTextContent();
            if (freshContent) {
                heroDescription.textContent = freshContent.descText;
                const buttonSpan = heroButton.querySelector('span');
                if (buttonSpan) {
                    buttonSpan.textContent = freshContent.buttonText;
                } else {
                    heroButton.textContent = freshContent.buttonText;
                }
            }
        }
    };
})();

