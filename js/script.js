/* =========================================================
   LA TIENDA DE ULI APPLE
   Storefront JavaScript
   ========================================================= */


const SUPABASE_URL =
    "https://tvlabyorkrelsqxzbjth.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_75rNY0L4KuTmPs44Z7RuIA_ggXpHe69";


/* =========================================================
   SUPABASE
   ========================================================= */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
   ESTADO
   ========================================================= */

let products = [];

let filteredProducts = [];

let cart = [];

let selectedProduct = null;


/* =========================================================
   DOM
   ========================================================= */

const productsGrid =
    document.getElementById("productsGrid");

const emptyState =
    document.getElementById("emptyState");

const categoryFilter =
    document.getElementById("categoryFilter");

const searchInput =
    document.getElementById("searchInput");

const cartDrawer =
    document.getElementById("cartDrawer");

const cartOverlay =
    document.getElementById("cartOverlay");

const cartItems =
    document.getElementById("cartItems");

const cartCount =
    document.getElementById("cartCount");

const cartTotal =
    document.getElementById("cartTotal");

const productModal =
    document.getElementById("productModal");

const modalImage =
    document.getElementById("modalImage");

const modalName =
    document.getElementById("modalName");

const modalCategory =
    document.getElementById("modalCategory");

const modalDescription =
    document.getElementById("modalDescription");

const modalPrice =
    document.getElementById("modalPrice");

const modalStatus =
    document.getElementById("modalStatus");

const modalAddButton =
    document.getElementById("modalAddButton");

const iphoneSpecs =
    document.getElementById("iphoneSpecs");

const iphoneSpecsGrid =
    document.getElementById("iphoneSpecsGrid");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");


/* =========================================================
   UTILIDADES
   ========================================================= */

function escapeHtml(value = "") {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   NORMALIZAR PRODUCTO
   ========================================================= */

function normalizeProduct(product) {

    return {

        id:
            product.id,

        name:
            product.name ||
            "Producto Apple",

        category:
            product.category ||
            "Apple",

        description:
            product.description ||
            "Producto Apple disponible.",

        price:
            Number(product.price) || 0,

        condition:
            product.condition ||
            product.status ||
            "Nuevo",

        stock:
            Number(product.stock) || 0,

        image_url:
            product.image_url ||
            product.image ||
            "",


        /* =================================================
           CARACTERÍSTICAS IPHONE
        ================================================= */

        sim_fisica:
            product.sim_fisica === null ||
            typeof product.sim_fisica === "undefined"
                ? null
                : Boolean(product.sim_fisica),

        libre_fabrica:
            product.libre_fabrica === null ||
            typeof product.libre_fabrica === "undefined"
                ? null
                : Boolean(product.libre_fabrica),

        color:
            product.color !== null &&
            typeof product.color !== "undefined" &&
            String(product.color).trim() !== ""
                ? String(product.color).trim()
                : null,

        almacenamiento:
            product.almacenamiento !== null &&
            typeof product.almacenamiento !== "undefined" &&
            String(product.almacenamiento).trim() !== ""
                ? String(product.almacenamiento).trim()
                : null,

        bateria:
            product.bateria === null ||
            typeof product.bateria === "undefined" ||
            product.bateria === ""
                ? null
                : Number(product.bateria),

        face_id:
            product.face_id === null ||
            typeof product.face_id === "undefined"
                ? null
                : Boolean(product.face_id),

        true_tone:
            product.true_tone === null ||
            typeof product.true_tone === "undefined"
                ? null
                : Boolean(product.true_tone),

        garantia:
            product.garantia === null ||
            typeof product.garantia === "undefined"
                ? null
                : Boolean(product.garantia),

        cable:
            product.cable === null ||
            typeof product.cable === "undefined"
                ? null
                : Boolean(product.cable)

    };
}


/* =========================================================
   PRECIO
   ========================================================= */

function formatPrice(value) {

    const number =
        Number(value) || 0;

    return new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(number);
}


/* =========================================================
   IMAGEN
   ========================================================= */

function getImageUrl(product) {

    if (
        product.image_url &&
        product.image_url.trim()
    ) {
        return product.image_url;
    }

    return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80";
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

    if (!toast) return;

    toastMessage.textContent =
        message;

    toast.classList.add("active");

    clearTimeout(
        showToast.timeout
    );

    showToast.timeout =
        setTimeout(() => {

            toast.classList.remove(
                "active"
            );

        }, 2500);
}


/* =========================================================
   CARGAR PRODUCTOS
   ========================================================= */

async function loadProducts() {

    productsGrid.innerHTML = `
        <div class="loading-state">
            <span class="loading-spinner"></span>
            <p>Cargando productos...</p>
        </div>
    `;

    try {

        let result =
            await supabaseClient
                .from("products")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        /*
         * Segundo intento por si la tabla
         * no tiene created_at.
         */

        if (result.error) {

            console.warn(
                "Primer intento de productos falló:",
                result.error
            );

            result =
                await supabaseClient
                    .from("products")
                    .select("*");
        }


        if (result.error) {

            throw result.error;
        }


        products =
            (result.data || [])
                .map(normalizeProduct);


        filteredProducts =
            [...products];


        renderProducts();


    } catch (error) {

        console.error(
            "Error cargando productos:",
            error
        );

        productsGrid.innerHTML = `
            <div class="loading-state">

                <i
                    class="fa-solid fa-triangle-exclamation"
                    style="font-size:28px;color:#c9a45c"
                ></i>

                <p>
                    No pudimos cargar los productos.
                </p>

                <small>
                    Revisa la conexión con Supabase.
                </small>

            </div>
        `;
    }
}


/* =========================================================
   RENDER PRODUCTOS
   ========================================================= */

function renderProducts() {

    if (!filteredProducts.length) {

        productsGrid.innerHTML = "";

        emptyState.hidden = false;

        return;
    }


    emptyState.hidden = true;


    productsGrid.innerHTML =
        filteredProducts
            .map(createProductCard)
            .join("");
}


/* =========================================================
   TARJETA PRODUCTO
   ========================================================= */

function createProductCard(product) {

    const image =
        getImageUrl(product);


    const isUsed =
        String(product.condition)
            .toLowerCase()
            .includes("usad");


    const statusClass =
        isUsed ? "used" : "";


    const stock =
        Number(product.stock) || 0;


    const outOfStock =
        stock <= 0;


    return `

        <article
            class="product-card"
            data-product-id="${escapeHtml(product.id)}"
        >

            <div class="product-card-image">

                <img
                    src="${escapeHtml(image)}"
                    alt="${escapeHtml(product.name)}"
                    loading="lazy"
                    onerror="
                        this.src='https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80'
                    "
                >

                <span
                    class="product-status ${statusClass}"
                >
                    ${escapeHtml(product.condition)}
                </span>

            </div>


            <div class="product-info">

                <span class="product-category">
                    ${escapeHtml(product.category)}
                </span>


                <h3>
                    ${escapeHtml(product.name)}
                </h3>


                <p class="product-description">
                    ${escapeHtml(product.description)}
                </p>


                <div class="product-bottom">

                    <strong class="product-price">
                        ${formatPrice(product.price)}
                    </strong>


                    <button
                        class="product-add"
                        type="button"
                        data-action="view"
                        data-id="${escapeHtml(product.id)}"
                        aria-label="Ver producto"
                        title="Ver producto"
                    >
                        <i class="fa-solid fa-plus"></i>
                    </button>

                </div>


                <span
                    class="product-stock ${outOfStock ? "out" : ""}"
                >
                    ${
                        outOfStock
                            ? "Agotado"
                            : `${stock} disponible${stock === 1 ? "" : "s"}`
                    }
                </span>

            </div>

        </article>

    `;
}


/* =========================================================
   AYUDAS IPHONE
   ========================================================= */

function isIPhone(product) {

    return String(
        product.category || ""
    )
        .trim()
        .toLowerCase() === "iphone";
}


/* =========================================================
   BOOLEANOS
   ========================================================= */

function getBooleanSpec(
    label,
    value,
    icon
) {

    let iconClass =
        "info";

    let iconSymbol =
        "•";

    let displayValue =
        "No especificado";


    if (value === true) {

        iconClass =
            "yes";

        iconSymbol =
            "✓";

        displayValue =
            "Sí";

    } else if (value === false) {

        iconClass =
            "no";

        iconSymbol =
            "✕";

        displayValue =
            "No";
    }


    return {

        label,

        value:
            displayValue,

        icon,

        iconClass,

        iconSymbol
    };
}


/* =========================================================
   TEXTOS
   ========================================================= */

function getTextSpec(
    label,
    value,
    icon
) {

    if (
        value === null ||
        typeof value === "undefined" ||
        String(value).trim() === ""
    ) {

        return null;
    }


    return {

        label,

        value:
            String(value),

        icon,

        iconClass:
            "info",

        iconSymbol:
            ""
    };
}


/* =========================================================
   BATERÍA
   ========================================================= */

function getBatterySpec(value) {

    if (
        value === null ||
        typeof value === "undefined" ||
        Number.isNaN(Number(value))
    ) {

        return null;
    }


    return {

        label:
            "Batería",

        value:
            `${Number(value)}%`,

        icon:
            "fa-solid fa-battery-three-quarters",

        iconClass:
            "info",

        iconSymbol:
            ""
    };
}


/* =========================================================
   RENDER CARACTERÍSTICAS IPHONE
   ========================================================= */

function renderIPhoneSpecs(product) {

    if (!iphoneSpecs || !iphoneSpecsGrid) {
        return;
    }


    /*
     * Solo mostramos estas características
     * cuando el producto pertenece a iPhone.
     */

    if (!isIPhone(product)) {

        iphoneSpecs.hidden = true;

        iphoneSpecsGrid.innerHTML = "";

        return;
    }


    const specs = [];


    /* =====================================================
       INFORMACIÓN GENERAL
    ====================================================== */

    const colorSpec =
        getTextSpec(
            "Color",
            product.color,
            "fa-solid fa-palette"
        );

    if (colorSpec) {

        specs.push(
            colorSpec
        );
    }


    const storageSpec =
        getTextSpec(
            "Almacenamiento",
            product.almacenamiento,
            "fa-solid fa-hard-drive"
        );

    if (storageSpec) {

        specs.push(
            storageSpec
        );
    }


    const batterySpec =
        getBatterySpec(
            product.bateria
        );

    if (batterySpec) {

        specs.push(
            batterySpec
        );
    }


    /* =====================================================
       CARACTERÍSTICAS BOOLEANAS
    ====================================================== */

    specs.push(
        getBooleanSpec(
            "SIM física",
            product.sim_fisica,
            "fa-solid fa-sim-card"
        )
    );


    specs.push(
        getBooleanSpec(
            "Libre de fábrica",
            product.libre_fabrica,
            "fa-solid fa-unlock"
        )
    );


    specs.push(
        getBooleanSpec(
            "Face ID",
            product.face_id,
            "fa-solid fa-face-smile"
        )
    );


    specs.push(
        getBooleanSpec(
            "True Tone",
            product.true_tone,
            "fa-solid fa-sun"
        )
    );


    specs.push(
        getBooleanSpec(
            "Garantía",
            product.garantia,
            "fa-solid fa-shield-halved"
        )
    );


    specs.push(
        getBooleanSpec(
            "Cable incluido",
            product.cable,
            "fa-solid fa-plug"
        )
    );


    const validSpecs =
        specs.filter(Boolean);


    /*
     * Si no hay ninguna característica.
     */

    if (!validSpecs.length) {

        iphoneSpecsGrid.innerHTML = `
            <div class="iphone-spec-empty">
                Las características de este iPhone
                todavía no han sido especificadas.
            </div>
        `;

    } else {

        iphoneSpecsGrid.innerHTML =
            validSpecs
                .map(spec => {

                    return `

                        <div class="iphone-spec">

                            <span
                                class="iphone-spec-icon ${spec.iconClass}"
                                aria-hidden="true"
                            >

                                ${
                                    spec.iconSymbol
                                        ? escapeHtml(
                                            spec.iconSymbol
                                        )
                                        : `<i class="${escapeHtml(spec.icon)}"></i>`
                                }

                            </span>


                            <span class="iphone-spec-text">

                                <span class="iphone-spec-label">
                                    ${escapeHtml(spec.label)}
                                </span>

                                <span class="iphone-spec-value">
                                    ${escapeHtml(spec.value)}
                                </span>

                            </span>

                        </div>

                    `;

                })
                .join("");
    }


    iphoneSpecs.hidden = false;
}


/* =========================================================
   MODAL PRODUCTO
   ========================================================= */

function openProductModal(product) {

    selectedProduct =
        product;


    modalImage.innerHTML = `

        <img
            src="${escapeHtml(
                getImageUrl(product)
            )}"
            alt="${escapeHtml(
                product.name
            )}"
            onerror="
                this.src='https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80'
            "
        >

    `;


    modalName.textContent =
        product.name;


    modalCategory.textContent =
        product.category;


    modalDescription.textContent =
        product.description;


    modalPrice.textContent =
        formatPrice(
            product.price
        );


    modalStatus.textContent =
        product.condition;


    modalStatus.className =
        "product-status " +
        (
            String(product.condition)
                .toLowerCase()
                .includes("usad")
                ? "used"
                : ""
        );


    /*
     * Características del iPhone.
     */

    renderIPhoneSpecs(
        product
    );


    productModal.classList.add(
        "active"
    );

    document.body.classList.add(
        "no-scroll"
    );
}


/* =========================================================
   CERRAR MODAL
   ========================================================= */

function closeProductModal() {

    productModal.classList.remove(
        "active"
    );

    document.body.classList.remove(
        "no-scroll"
    );

    selectedProduct =
        null;
}


/* =========================================================
   FILTROS
   ========================================================= */

function applyFilters() {

    const category =
        categoryFilter.value;


    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    filteredProducts =
        products.filter(product => {

            const matchesCategory =
                category === "all" ||
                product.category
                    .toLowerCase()
                    .includes(
                        category.toLowerCase()
                    );


            const searchableText = [

                product.name,

                product.category,

                product.description,

                product.condition,

                product.color,

                product.almacenamiento

            ]
                .filter(
                    value =>
                        value !== null &&
                        typeof value !== "undefined"
                )
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                !query ||
                searchableText.includes(
                    query
                );


            return (
                matchesCategory &&
                matchesSearch
            );
        });


    renderProducts();
}


function selectCategory(category) {

    categoryFilter.value =
        category;


    applyFilters();


    document
        .getElementById(
            "productos"
        )
        .scrollIntoView({
            behavior: "smooth"
        });
}


/* =========================================================
   CARRITO
   ========================================================= */

function saveCart() {

    localStorage.setItem(
        "uliAppleCart",
        JSON.stringify(cart)
    );
}


function loadCart() {

    try {

        const saved =
            localStorage.getItem(
                "uliAppleCart"
            );


        cart =
            saved
                ? JSON.parse(saved)
                : [];


        if (!Array.isArray(cart)) {

            cart = [];

        }

    } catch {

        cart = [];

    }


    renderCart();
}


function addToCart(product) {

    const stock =
        Number(product.stock) || 0;


    if (stock <= 0) {

        showToast(
            "Este producto está agotado."
        );

        return;
    }


    const existing =
        cart.find(
            item =>
                String(item.id) ===
                String(product.id)
        );


    if (existing) {

        if (
            existing.quantity >=
            stock
        ) {

            showToast(
                "No hay más unidades disponibles."
            );

            return;
        }


        existing.quantity += 1;

    } else {

        cart.push({

            id:
                product.id,

            name:
                product.name,

            price:
                product.price,

            image_url:
                product.image_url,

            quantity:
                1,

            stock:
                stock

        });
    }


    saveCart();

    renderCart();


    showToast(
        "Producto añadido a tu bolsa."
    );
}


function removeFromCart(id) {

    cart =
        cart.filter(
            item =>
                String(item.id) !==
                String(id)
        );


    saveCart();

    renderCart();
}


function changeQuantity(
    id,
    amount
) {

    const item =
        cart.find(
            product =>
                String(product.id) ===
                String(id)
        );


    if (!item) return;


    const newQuantity =
        item.quantity + amount;


    if (newQuantity <= 0) {

        removeFromCart(id);

        return;
    }


    if (
        item.stock &&
        newQuantity > item.stock
    ) {

        showToast(
            "No hay más unidades disponibles."
        );

        return;
    }


    item.quantity =
        newQuantity;


    saveCart();

    renderCart();
}


function getCartTotal() {

    return cart.reduce(
        (total, item) =>
            total +
            Number(item.price) *
            Number(item.quantity),
        0
    );
}


function getCartCount() {

    return cart.reduce(
        (total, item) =>
            total +
            Number(item.quantity),
        0
    );
}


function renderCart() {

    const count =
        getCartCount();


    cartCount.textContent =
        count;


    cartTotal.textContent =
        formatPrice(
            getCartTotal()
        );


    if (!cart.length) {

        cartItems.innerHTML = `

            <div class="cart-empty">

                <i
                    class="fa-solid fa-bag-shopping"
                ></i>

                <strong>
                    Tu bolsa está vacía.
                </strong>

                <span>
                    Añade algún producto para comenzar.
                </span>

            </div>

        `;

        return;
    }


    cartItems.innerHTML =
        cart
            .map(
                item => `

                    <div
                        class="cart-item"
                        data-cart-id="${escapeHtml(
                            item.id
                        )}"
                    >

                        <div class="cart-item-image">

                            <img
                                src="${escapeHtml(
                                    item.image_url ||
                                    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80"
                                )}"
                                alt="${escapeHtml(
                                    item.name
                                )}"
                            >

                        </div>


                        <div class="cart-item-info">

                            <span class="cart-item-name">
                                ${escapeHtml(
                                    item.name
                                )}
                            </span>


                            <div class="cart-item-price">
                                ${formatPrice(
                                    item.price
                                )}
                            </div>


                            <div class="cart-item-controls">

                                <div class="cart-quantity">

                                    <button
                                        class="cart-quantity-button"
                                        data-action="decrease"
                                        data-id="${escapeHtml(
                                            item.id
                                        )}"
                                        type="button"
                                    >
                                        −
                                    </button>


                                    <span class="cart-quantity-value">
                                        ${item.quantity}
                                    </span>


                                    <button
                                        class="cart-quantity-button"
                                        data-action="increase"
                                        data-id="${escapeHtml(
                                            item.id
                                        )}"
                                        type="button"
                                    >
                                        +
                                    </button>

                                </div>


                                <button
                                    class="cart-remove"
                                    data-action="remove"
                                    data-id="${escapeHtml(
                                        item.id
                                    )}"
                                    type="button"
                                >
                                    Eliminar
                                </button>

                            </div>

                        </div>

                    </div>

                `
            )
            .join("");
}


/* =========================================================
   CART DRAWER
   ========================================================= */

function openCart() {

    cartDrawer.classList.add(
        "active"
    );

    cartOverlay.classList.add(
        "active"
    );

    document.body.classList.add(
        "no-scroll"
    );
}


function closeCart() {

    cartDrawer.classList.remove(
        "active"
    );

    cartOverlay.classList.remove(
        "active"
    );

    document.body.classList.remove(
        "no-scroll"
    );
}


/* =========================================================
   WHATSAPP
   ========================================================= */

function checkoutWhatsApp() {

    if (!cart.length) {

        showToast(
            "Tu bolsa está vacía."
        );

        return;
    }


    let message =
        "Hola, quiero consultar estos productos de La Tienda de Uli Apple:%0A%0A";


    cart.forEach(item => {

        message +=
            `• ${item.name} x${item.quantity} - ${formatPrice(
                item.price *
                item.quantity
            )}%0A`;

    });


    message +=
        `%0ATotal: ${formatPrice(
            getCartTotal()
        )}`;


    const url =
        `https://wa.me/5358751220?text=${message}`;


    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );
}


/* =========================================================
   EVENTOS PRODUCTOS
   ========================================================= */

productsGrid.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-action='view']"
            );


        if (!button) return;


        const id =
            button.dataset.id;


        const product =
            products.find(
                item =>
                    String(item.id) ===
                    String(id)
            );


        if (product) {

            openProductModal(
                product
            );
        }
    }
);


/* =========================================================
   EVENTOS CARRITO
   ========================================================= */

cartItems.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-action]"
            );


        if (!button) return;


        const id =
            button.dataset.id;


        const action =
            button.dataset.action;


        if (
            action === "increase"
        ) {

            changeQuantity(
                id,
                1
            );

        } else if (
            action === "decrease"
        ) {

            changeQuantity(
                id,
                -1
            );

        } else if (
            action === "remove"
        ) {

            removeFromCart(
                id
            );
        }
    }
);


/* =========================================================
   NAVBAR / SEARCH
   ========================================================= */

const searchToggle =
    document.getElementById(
        "searchToggle"
    );

const searchPanel =
    document.getElementById(
        "searchPanel"
    );

const closeSearch =
    document.getElementById(
        "closeSearch"
    );

const menuToggle =
    document.getElementById(
        "menuToggle"
    );

const mobileNav =
    document.getElementById(
        "mobileNav"
    );


searchToggle.addEventListener(
    "click",
    () => {

        searchPanel.classList.toggle(
            "active"
        );


        if (
            searchPanel.classList.contains(
                "active"
            )
        ) {

            setTimeout(
                () =>
                    searchInput.focus(),
                100
            );
        }
    }
);


closeSearch.addEventListener(
    "click",
    () => {

        searchPanel.classList.remove(
            "active"
        );
    }
);


searchInput.addEventListener(
    "input",
    applyFilters
);


menuToggle.addEventListener(
    "click",
    () => {

        mobileNav.classList.toggle(
            "active"
        );


        const icon =
            menuToggle.querySelector(
                "i"
            );


        if (
            mobileNav.classList.contains(
                "active"
            )
        ) {

            icon.className =
                "fa-solid fa-xmark";

        } else {

            icon.className =
                "fa-solid fa-bars";
        }
    }
);


mobileNav.addEventListener(
    "click",
    event => {

        if (
            event.target.tagName ===
            "A"
        ) {

            mobileNav.classList.remove(
                "active"
            );


            const icon =
                menuToggle.querySelector(
                    "i"
                );


            icon.className =
                "fa-solid fa-bars";
        }
    }
);


/* =========================================================
   FILTRO
   ========================================================= */

categoryFilter.addEventListener(
    "change",
    applyFilters
);


document
    .getElementById(
        "clearFilters"
    )
    .addEventListener(
        "click",
        () => {

            categoryFilter.value =
                "all";

            searchInput.value =
                "";

            applyFilters();
        }
    );


document
    .querySelectorAll(
        ".category-card"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                selectCategory(
                    button.dataset.category
                );
            }
        );
    });


/* =========================================================
   CART BUTTONS
   ========================================================= */

document
    .getElementById(
        "openCart"
    )
    .addEventListener(
        "click",
        openCart
    );


document
    .getElementById(
        "closeCart"
    )
    .addEventListener(
        "click",
        closeCart
    );


cartOverlay.addEventListener(
    "click",
    closeCart
);


document
    .getElementById(
        "checkoutButton"
    )
    .addEventListener(
        "click",
        checkoutWhatsApp
    );


/* =========================================================
   MODAL BUTTONS
   ========================================================= */

document
    .getElementById(
        "closeProductModal"
    )
    .addEventListener(
        "click",
        closeProductModal
    );


productModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            productModal
        ) {

            closeProductModal();
        }
    }
);


modalAddButton.addEventListener(
    "click",
    () => {

        if (!selectedProduct) {
            return;
        }


        addToCart(
            selectedProduct
        );


        closeProductModal();

        openCart();
    }
);


/* =========================================================
   ESCAPE
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeCart();

            closeProductModal();

            searchPanel.classList.remove(
                "active"
            );
        }
    }
);


/* =========================================================
   AÑO FOOTER
   ========================================================= */

const currentYear =
    document.getElementById(
        "currentYear"
    );


if (currentYear) {

    currentYear.textContent =
        new Date().getFullYear();
}


/* =========================================================
   INICIO
   ========================================================= */

loadCart();

loadProducts();