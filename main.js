/**
 * TEMPLATE GÉNÉRIQUE — main.js
 * Fonctionnalités :
 *   - Navigation mobile (hamburger)
 *   - Animations au scroll
 *   - Filtre produits par catégorie
 *   - Formulaire contact → WhatsApp
 *   - Panier : quantité, ajout, suppression, adresse obligatoire, commande WhatsApp
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. NAVIGATION MOBILE
    // =========================================================================
    const navToggle = document.getElementById('navToggle');
    const navLinks  = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', isOpen);
        });
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', false);
            });
        });
    }

    // =========================================================================
    // 2. ANIMATIONS AU SCROLL
    // =========================================================================
    const animateEls = document.querySelectorAll(
        '.product-card, .feature-item, .testimonial-card, .delivery-card, .address-card, .cgv-section'
    );
    if ('IntersectionObserver' in window && animateEls.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    entry.target.style.animationDelay = `${i * 0.06}s`;
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        animateEls.forEach(el => observer.observe(el));
    }

    // =========================================================================
    // 3. FILTRE PRODUITS
    // =========================================================================
    const filterBtns   = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card[data-category]');

    if (filterBtns.length && productCards.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                productCards.forEach(card => {
                    card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
                });
            });
        });
    }

    // =========================================================================
    // 4. FORMULAIRE CONTACT → WHATSAPP
    // =========================================================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // ⚠️ Personnaliser : numéro réel (format international, sans +)
            const WHATSAPP_NUMBER = '212600000000';

            const nom     = document.getElementById('f-name')?.value    || '';
            const ville   = document.getElementById('f-city')?.value    || '';
            const produit = document.getElementById('f-product')?.value || '';
            const message = document.getElementById('f-message')?.value || '';

            let text = `*Nouveau message / Commande*%0A%0A`;
            text += `👤 *Nom :* ${encodeURIComponent(nom)}%0A`;
            text += `📍 *Ville :* ${encodeURIComponent(ville)}%0A`;
            if (produit) text += `🛒 *Produit(s) :* ${encodeURIComponent(produit)}%0A`;
            text += `📝 *Message :* ${encodeURIComponent(message)}`;

            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
        });
    }

    // =========================================================================
    // 5. PANIER
    // =========================================================================

    // ⚠️ Personnaliser : numéro WhatsApp pour les commandes panier
    const CART_WHATSAPP_NUMBER = '212600000000';

    // Livraison : gratuite dès 499 MAD, sinon 25 MAD
    const SHIPPING_THRESHOLD = 499;
    const SHIPPING_FEE       = 25;

    // État du panier : { "Nom du Produit": { name, price, qty, unit } }
    // Persisté dans localStorage pour survivre aux actualisations
    const cart = JSON.parse(localStorage.getItem('cart_data') || '{}');

    // Variables partagées entre renderCart() et le bouton WhatsApp
    let totalPrice  = 0;
    let shippingCost = 0;

    function saveCart() {
        localStorage.setItem('cart_data', JSON.stringify(cart));
    }

    // --- Références DOM ---
    const cartFab      = document.getElementById('cartFab');
    const cartFabBadge = document.getElementById('cartFabBadge');
    const cartOverlay  = document.getElementById('cartOverlay');
    const cartDrawer   = document.getElementById('cartDrawer');
    const cartClose    = document.getElementById('cartClose');
    const cartBody     = document.getElementById('cartBody');
    const cartFoot     = document.getElementById('cartFoot');
    const cartTotal    = document.getElementById('cartTotal');
    const btnWhatsapp  = document.getElementById('btnCartWhatsapp');
    const btnClear     = document.getElementById('btnClearCart');

    // Pas de panier sur cette page → sortir
    if (!cartFab) return;

    // ----- Injecter les styles du champ adresse (une seule fois) -----
    const addressStyles = document.createElement('style');
    addressStyles.textContent = `
        .cart-address-wrap {
            margin-bottom: 14px;
        }
        .cart-address-wrap label {
            display: block;
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--color-green-dark);
            margin-bottom: 6px;
            letter-spacing: 0.3px;
        }
        .cart-address-wrap label span {
            color: #e05555;
            margin-left: 2px;
        }
        .cart-address-input {
            width: 100%;
            padding: 11px 14px;
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            font-family: var(--font-body);
            font-size: 0.9rem;
            color: var(--color-text);
            background: var(--color-cream);
            outline: none;
            transition: border-color .2s, box-shadow .2s;
            resize: none;
        }
        .cart-address-input:focus {
            border-color: var(--color-green);
            box-shadow: 0 0 0 3px rgba(42,106,71,.12);
            background: #fff;
        }
        .cart-address-input.error {
            border-color: #e05555;
            box-shadow: 0 0 0 3px rgba(224,85,85,.12);
        }
        .cart-address-error {
            display: none;
            font-size: 0.76rem;
            color: #e05555;
            margin-top: 5px;
            font-weight: 500;
        }
        .cart-address-error.visible {
            display: block;
        }
    `;
    document.head.appendChild(addressStyles);

    // ----- Injecter le champ adresse dans le footer du drawer -----
    // On l'insère juste avant le bouton WhatsApp dans #cartFoot
    const addressBlock = document.createElement('div');
    addressBlock.className = 'cart-address-wrap';
    addressBlock.innerHTML = `
        <label for="cartAddressInput">Adresse de livraison <span>*</span></label>
        <textarea
            id="cartAddressInput"
            class="cart-address-input"
            rows="2"
            placeholder="Ex : Rue Mohammed V, Appt 12, Casablanca"
        ></textarea>
        <div class="cart-address-error" id="cartAddressError">
            ⚠️ Veuillez saisir votre adresse de livraison.
        </div>
    `;
    // Insérer avant le bouton WhatsApp
    cartFoot.insertBefore(addressBlock, btnWhatsapp);

    const cartAddressInput = document.getElementById('cartAddressInput');
    const cartAddressError = document.getElementById('cartAddressError');

    // Effacer l'erreur dès que l'utilisateur commence à taper
    cartAddressInput.addEventListener('input', () => {
        if (cartAddressInput.value.trim()) {
            cartAddressInput.classList.remove('error');
            cartAddressError.classList.remove('visible');
        }
    });

    // ----- Ouvrir / fermer le drawer -----
    function openCart() {
        cartOverlay.classList.add('open');
        cartDrawer.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeCart() {
        cartOverlay.classList.remove('open');
        cartDrawer.classList.remove('open');
        document.body.style.overflow = '';
    }

    cartFab.addEventListener('click', openCart);
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // ----- Rendu du contenu du drawer -----
    function renderCart() {
        const keys = Object.keys(cart);
        const totalQty = keys.reduce((sum, k) => sum + cart[k].qty, 0);

        // Calcul du sous-total
        totalPrice = keys.reduce((sum, k) => sum + (parseFloat(cart[k].price) * cart[k].qty), 0);

        // Frais de livraison
        shippingCost = (totalPrice > 0 && totalPrice < SHIPPING_THRESHOLD) ? SHIPPING_FEE : 0;
        const grandTotal = totalPrice + shippingCost;

        // Badge FAB
        cartFabBadge.textContent = totalQty;
        cartFab.classList.toggle('visible', totalQty > 0);

        if (keys.length === 0) {
            cartBody.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-basket"></i>
                    <p>Votre panier est vide.<br>Ajoutez des produits depuis le catalogue.</p>
                </div>`;
            cartFoot.style.display = 'none';
            return;
        }

        // Liste des articles
        cartBody.innerHTML = keys.map(k => {
            const item = cart[k];
            const unitLabel = item.unit ? `/${item.unit}` : '';
            return `
            <div class="cart-item" data-key="${encodeURIComponent(k)}">
                <div class="cart-item__info">
                    <div class="cart-item__name">${item.name}</div>
                    <div class="cart-item__price">${item.price} MAD${unitLabel} × ${item.qty}</div>
                </div>
                <div class="cart-item__qty">
                    <button class="cart-item__qty-btn ci-minus" aria-label="Retirer un">−</button>
                    <span class="cart-item__qty-val">${item.qty}</span>
                    <button class="cart-item__qty-btn ci-plus" aria-label="Ajouter un">+</button>
                </div>
                <button class="cart-item__remove" aria-label="Supprimer">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>`;
        }).join('');

        // Footer : sous-total, livraison, total final
        cartFoot.style.display = '';

        // Sous-total
        cartTotal.textContent = `${totalPrice.toFixed(2)} MAD`;

        // Livraison
        const cartShippingEl   = document.getElementById('cartShipping');
        const cartGrandTotalEl = document.getElementById('cartGrandTotal');
        const cartShippingNote = document.getElementById('cartShippingNote');

        if (cartShippingEl) {
            if (shippingCost === 0) {
                cartShippingEl.textContent = 'Gratuit 🎉';
                cartShippingEl.style.color = 'var(--color-green)';
                cartShippingEl.style.fontWeight = '700';
            } else {
                cartShippingEl.textContent = `${SHIPPING_FEE} MAD`;
                cartShippingEl.style.color = '';
                cartShippingEl.style.fontWeight = '';
            }
        }
        if (cartGrandTotalEl) {
            cartGrandTotalEl.textContent = `${grandTotal.toFixed(2)} MAD`;
        }
        if (cartShippingNote) {
            if (shippingCost === 0) {
                cartShippingNote.innerHTML = `✅ Livraison offerte pour cette commande !`;
                cartShippingNote.style.color = 'var(--color-green)';
            } else {
                const remaining = (SHIPPING_THRESHOLD - totalPrice).toFixed(0);
                cartShippingNote.innerHTML = `🚚 Livraison offerte dès 499 MAD — il vous manque <strong>${remaining} MAD</strong>`;
                cartShippingNote.style.color = 'var(--color-text-muted)';
            }
        }

        // Événements sur les lignes rendues
        cartBody.querySelectorAll('.cart-item').forEach(row => {
            const key = decodeURIComponent(row.dataset.key);

            row.querySelector('.ci-minus').addEventListener('click', () => {
                cart[key].qty -= 1;
                if (cart[key].qty <= 0) delete cart[key];
                saveCart();
                renderCart();
            });

            row.querySelector('.ci-plus').addEventListener('click', () => {
                cart[key].qty += 1;
                saveCart();
                renderCart();
            });

            row.querySelector('.cart-item__remove').addEventListener('click', () => {
                delete cart[key];
                saveCart();
                renderCart();
            });
        });
    }

    // ----- Sélecteurs de quantité sur les cards -----
    document.querySelectorAll('.qty-stepper').forEach(stepper => {
        const valEl = stepper.querySelector('.qty-stepper__val');
        let qty = 1;

        stepper.querySelector('.qty-minus').addEventListener('click', () => {
            if (qty > 1) { qty--; valEl.textContent = qty; }
        });
        stepper.querySelector('.qty-plus').addEventListener('click', () => {
            qty++;
            valEl.textContent = qty;
        });

        stepper.__getQty   = () => qty;
        stepper.__resetQty = () => { qty = 1; valEl.textContent = 1; };
    });

    // ----- Boutons "Ajouter au panier" -----
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const card    = btn.closest('.product-card');
            const stepper = card.querySelector('.qty-stepper');
            const qty     = stepper.__getQty();
            const name    = btn.dataset.name;
            const price   = btn.dataset.price;  // doit être un nombre ex: "85"
            const unit    = btn.dataset.unit || '';

            if (cart[name]) {
                cart[name].qty += qty;
            } else {
                cart[name] = { name, price, qty, unit };
            }

            stepper.__resetQty();
            saveCart();

            // Feedback visuel
            btn.classList.add('added');
            btn.innerHTML = `<i class="fas fa-check"></i> Ajouté !`;
            setTimeout(() => {
                btn.classList.remove('added');
                btn.innerHTML = `<i class="fas fa-cart-plus"></i> Ajouter`;
            }, 1200);

            renderCart();
        });
    });

    // ----- Vider le panier -----
    btnClear.addEventListener('click', () => {
        Object.keys(cart).forEach(k => delete cart[k]);
        saveCart();
        // Réinitialiser aussi le champ adresse
        cartAddressInput.value = '';
        cartAddressInput.classList.remove('error');
        cartAddressError.classList.remove('visible');
        renderCart();
    });

    // ----- Passer la commande via WhatsApp -----
    btnWhatsapp.addEventListener('click', () => {
        const keys = Object.keys(cart);
        if (!keys.length) return;

        // Validation adresse obligatoire
        const adresse = cartAddressInput.value.trim();
        if (!adresse) {
            cartAddressInput.classList.add('error');
            cartAddressError.classList.add('visible');
            cartAddressInput.focus();
            return;  // ← bloque l'envoi si adresse vide
        }

        const totalQty  = keys.reduce((s, k) => s + cart[k].qty, 0);
        const grandTotal = totalPrice + shippingCost;

        let msg = `🛒 *Nouvelle Commande*%0A%0A`;
        msg += `*Récapitulatif :*%0A`;

        keys.forEach(k => {
            const item = cart[k];
            const unitLabel = item.unit ? `/${item.unit}` : '';
            msg += `• ${item.qty}× ${encodeURIComponent(item.name)} (${encodeURIComponent(item.price)} MAD${unitLabel})%0A`;
        });

        msg += `%0A📦 *Total articles :* ${totalQty}%0A`;
        msg += `💰 *Sous-total :* ${totalPrice.toFixed(2)} MAD%0A`;
        msg += shippingCost === 0
            ? `🚚 *Livraison :* Gratuite ✅%0A`
            : `🚚 *Livraison :* ${shippingCost} MAD%0A`;
        msg += `%0A💳 *Total TTC :* ${grandTotal.toFixed(2)} MAD%0A`;
        msg += `%0A📍 *Adresse de livraison :* ${encodeURIComponent(adresse)}%0A`;
        msg += `%0A✅ Bonjour, je souhaite passer cette commande. Merci de me confirmer la disponibilité et les modalités de livraison.`;

        window.open(`https://wa.me/${CART_WHATSAPP_NUMBER}?text=${msg}`, '_blank');
    });

    // Rendu initial (panier vide)
    renderCart();

}); // fin DOMContentLoaded
