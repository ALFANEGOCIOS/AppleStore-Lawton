/* =========================================================
   APPLESTORE LAWTON
   SCRIPT PRINCIPAL
   Supabase + Productos + Filtros + Carrito
========================================================= */


/* =========================================================
   CONFIGURACIÓN SUPABASE
========================================================= */

const SUPABASE_URL = "https://tvlabyorkrelsqxzbjth.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_75rNY0L4KuTmPs44Z7RuIA_ggXpHe69";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* =========================================================
   CONFIGURACIÓN GENERAL
========================================================= */

const WHATSAPP_NUMBER = "5358751220";

let products = [];

let filteredProducts = [];

let cart = [];

let currentProduct = null;


/* =========================================================
   ELEMENTOS DEL DOM
========================================================= */

const productsGrid =
    document.getElementById("productsGrid");

const noProducts =
    document.getElementById("noProducts");

const searchButton =
    document.getElementById("searchButton");

const searchContainer =
    document.getElementById("searchContainer");

const closeSearch =
    document.getElementById("closeSearch");

const searchInput =
    document.getElementById("searchInput");

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const mobileNav =
    document.getElementById("mobileNav");

const cartButton =
    document.getElementById("cartButton");

const cartDrawer =
    document.getElementById("cartDrawer");

const cartOverlay =
    document.getElementById("cartOverlay");

const closeCart =
    document.getElementById("closeCart");

const cartItems =
    document.getElementById("cartItems");

const cartCount =
    document.getElementById("cartCount");

const cartTotal =
    document.getElementById("cartTotal");

const checkoutButton =
    document.getElementById("checkoutButton");

const productModal =
    document.getElementById("productModal");

const closeProductModal =
    document.getElementById("closeProductModal");

const modalProductImage =
    document.getElementById("modalProductImage");

const modalProductCategory =
    document.getElementById("modalProductCategory");

const modalProductName =
    document.getElementById("modalProductName");

const modalProductDescription =
    document.getElementById("modalProductDescription");

const modalProductCondition =
    document.getElementById("modalProductCondition");

const modalProductStock =
    document.getElementById("modalProductStock");

const modalProductPrice =
    document.getElementById("modalProductPrice");

const modalAddCart =
    document.getElementById("modalAddCart");


/* =========================================================
   INICIALIZACIÓN
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        setupNavigation();

        setupSearch();

        setupFilters();

        setupCategories();

        setupCart();

        setupProductModal();

        await loadProducts();

    }
);


/* =========================================================
   CARGAR PRODUCTOS DESDE SUPABASE
========================================================= */

async function loadProducts() {

    showLoading();

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("products")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "Error cargando productos:",
                error
            );

            showError(
                "No se pudieron cargar los productos."
            );

            return;
        }


        products = data || [];

        filteredProducts = [...products];

        console.log(
            "Productos cargados:",
            products
        );


        renderProducts();


    } catch (error) {

        console.error(
            "Error inesperado:",
            error
        );

        showError(
            "Ocurrió un error al conectar con la tienda."
        );

    }

}


/* =========================================================
   RENDERIZAR PRODUCTOS
========================================================= */

function renderProducts() {

    if (!productsGrid) {
        return;
    }


    productsGrid.innerHTML = "";


    if (
        !filteredProducts ||
        filteredProducts.length === 0
    ) {

        if (noProducts) {
            noProducts.style.display = "block";
        }

        return;
    }


    if (noProducts) {
        noProducts.style.display = "none";
    }


    filteredProducts.forEach(
        product => {

            const card =
                createProductCard(product);

            productsGrid.appendChild(card);

        }
    );

}


/* =========================================================
   CREAR TARJETA DE PRODUCTO
========================================================= */

function createProductCard(product) {

    const card =
        document.createElement("article");

    card.className = "product-card";


    const imageContainer =
        document.createElement("div");

    imageContainer.className =
        "product-image";


    const image =
        document.createElement("img");


    if (product.image_url) {

        image.src =
            product.image_url;

    } else {

        image.src =
            createPlaceholderImage(
                product.name
            );

    }


    image.alt =
        product.name || "Producto Apple";


    image.loading = "lazy";


    imageContainer.appendChild(image);


    /* =========================================
       BADGE ESTADO
    ========================================== */

    const condition =
        document.createElement("span");

    condition.className =
        "product-condition";


    if (
        product.condition === "Usado"
    ) {

        condition.classList.add(
            "used"
        );

    }


    condition.textContent =
        product.condition || "Nuevo";


    imageContainer.appendChild(
        condition
    );


    /* =========================================
       INFORMACIÓN
    ========================================== */

    const content =
        document.createElement("div");

    content.className =
        "product-content";


    const category =
        document.createElement("span");

    category.className =
        "product-category";

    category.textContent =
        product.category || "Apple";


    const name =
        document.createElement("h3");

    name.className =
        "product-name";

    name.textContent =
        product.name;


    const description =
        document.createElement("p");

    description.className =
        "product-description";

    description.textContent =
        product.description ||
        "Producto Apple disponible.";


    /* =========================================
       PRECIO
    ========================================== */

    const bottom =
        document.createElement("div");

    bottom.className =
        "product-bottom";


    const price =
        document.createElement("span");

    price.className =
        "product-price";

    price.textContent =
        formatPrice(
            product.price,
            product.currency
        );


    /* =========================================
       STOCK
    ========================================== */

    const stock =
        document.createElement("span");

    stock.className =
        "product-stock";


    if (product.stock <= 0) {

        stock.classList.add(
            "out"
        );

        stock.textContent =
            "Agotado";

    } else if (product.stock <= 2) {

        stock.classList.add(
            "low"
        );

        stock.textContent =
            `Últimas ${product.stock}`;

    } else {

        stock.textContent =
            "Disponible";

    }


    bottom.appendChild(price);

    bottom.appendChild(stock);


    /* =========================================
       BOTÓN
    ========================================== */

    const button =
        document.createElement("button");

    button.className =
        "product-button";


    button.innerHTML = `
        Ver producto
        <i class="fa-solid fa-arrow-right"></i>
    `;


    button.addEventListener(
        "click",
        () => {

            openProductModal(product);

        }
    );


    /* =========================================
       ARMAR TARJETA
    ========================================== */

    content.appendChild(category);

    content.appendChild(name);

    content.appendChild(description);

    content.appendChild(bottom);

    content.appendChild(button);


    card.appendChild(imageContainer);

    card.appendChild(content);


    return card;

}


/* =========================================================
   PLACEHOLDER DE IMAGEN
========================================================= */

function createPlaceholderImage(
    productName
) {

    const svg = `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="800"
            height="800"
            viewBox="0 0 800 800"
        >

            <rect
                width="800"
                height="800"
                fill="#f5f5f7"
            />

            <text
                x="400"
                y="380"
                text-anchor="middle"
                font-family="Arial"
                font-size="32"
                fill="#555"
            >
                AppleStore Lawton
            </text>

            <text
                x="400"
                y="430"
                text-anchor="middle"
                font-family="Arial"
                font-size="22"
                fill="#888"
            >
                ${escapeHtml(productName)}
            </text>

        </svg>
    `;


    return (
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(svg)
    );

}


/* =========================================================
   FORMATEAR PRECIO
========================================================= */

function formatPrice(
    price,
    currency = "USD"
) {

    const numericPrice =
        Number(price) || 0;


    const symbol =
        currency === "CUP"
            ? "CUP"
            : currency === "EUR"
                ? "€"
                : "$";


    if (currency === "CUP") {

        return `${numericPrice.toLocaleString(
            "es-ES"
        )} CUP`;

    }


    if (currency === "EUR") {

        return `${numericPrice.toLocaleString(
            "es-ES",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )} €`;

    }


    return `${symbol}${numericPrice.toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )}`;

}


/* =========================================================
   FILTROS
========================================================= */

function setupFilters() {

    const filterButtons =
        document.querySelectorAll(
            ".filter-button"
        );


    filterButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    filterButtons.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    const filter =
                        button.dataset.filter;


                    applyFilter(
                        filter
                    );

                }
            );

        }
    );

}


/* =========================================================
   APLICAR FILTRO
========================================================= */

function applyFilter(
    category
) {

    if (
        !category ||
        category === "Todos"
    ) {

        filteredProducts =
            [...products];

    } else {

        filteredProducts =
            products.filter(
                product =>
                    product.category
                        ?.toLowerCase()
                        === category.toLowerCase()
            );

    }


    applySearch();

}


/* =========================================================
   CATEGORÍAS
========================================================= */

function setupCategories() {

    const categoryCards =
        document.querySelectorAll(
            ".category-card"
        );


    categoryCards.forEach(
        card => {

            card.addEventListener(
                "click",
                () => {

                    const category =
                        card.dataset.category;


                    const filterButton =
                        document.querySelector(
                            `.filter-button[data-filter="${category}"]`
                        );


                    if (filterButton) {

                        filterButton.click();

                    }


                    const productsSection =
                        document.getElementById(
                            "productos"
                        );


                    if (productsSection) {

                        productsSection.scrollIntoView(
                            {
                                behavior: "smooth"
                            }
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   BÚSQUEDA
========================================================= */

function setupSearch() {

    if (searchButton) {

        searchButton.addEventListener(
            "click",
            () => {

                searchContainer.classList.toggle(
                    "active"
                );


                if (
                    searchContainer.classList.contains(
                        "active"
                    )
                ) {

                    setTimeout(
                        () => {

                            searchInput?.focus();

                        },
                        100
                    );

                }

            }
        );

    }


    if (closeSearch) {

        closeSearch.addEventListener(
            "click",
            () => {

                searchInput.value = "";

                searchContainer.classList.remove(
                    "active"
                );

                resetFiltersAndSearch();

            }
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                applySearch();

            }
        );

    }

}


/* =========================================================
   APLICAR BÚSQUEDA
========================================================= */

function applySearch() {

    const search =
        searchInput?.value
            ?.trim()
            .toLowerCase() || "";


    const activeFilter =
        document.querySelector(
            ".filter-button.active"
        );


    const category =
        activeFilter?.dataset.filter ||
        "Todos";


    let result =
        [...products];


    /* =========================================
       FILTRO DE CATEGORÍA
    ========================================== */

    if (
        category !== "Todos"
    ) {

        result =
            result.filter(
                product =>
                    product.category
                        ?.toLowerCase()
                        === category.toLowerCase()
            );

    }


    /* =========================================
       BÚSQUEDA
    ========================================== */

    if (search) {

        result =
            result.filter(
                product => {

                    const searchableText = [

                        product.name,

                        product.category,

                        product.description,

                        product.condition

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    return searchableText.includes(
                        search
                    );

                }
            );

    }


    filteredProducts =
        result;


    renderProducts();

}


/* =========================================================
   RESETEAR FILTROS
========================================================= */

function resetFiltersAndSearch() {

    const filterButtons =
        document.querySelectorAll(
            ".filter-button"
        );


    filterButtons.forEach(
        button => {

            button.classList.remove(
                "active"
            );

        }
    );


    const allButton =
        document.querySelector(
            '.filter-button[data-filter="Todos"]'
        );


    if (allButton) {

        allButton.classList.add(
            "active"
        );

    }


    filteredProducts =
        [...products];


    renderProducts();

}


/* =========================================================
   MODAL DE PRODUCTO
========================================================= */

function setupProductModal() {

    if (closeProductModal) {

        closeProductModal.addEventListener(
            "click",
            closeModal
        );

    }


    if (productModal) {

        productModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    productModal
                ) {

                    closeModal();

                }

            }
        );

    }


    if (modalAddCart) {

        modalAddCart.addEventListener(
            "click",
            () => {

                if (currentProduct) {

                    addToCart(
                        currentProduct
                    );

                    closeModal();

                }

            }
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeModal();

                closeCartDrawer();

            }

        }
    );

}


/* =========================================================
   ABRIR MODAL
========================================================= */

function openProductModal(
    product
) {

    currentProduct =
        product;


    if (modalProductImage) {

        modalProductImage.src =
            product.image_url ||
            createPlaceholderImage(
                product.name
            );

        modalProductImage.alt =
            product.name;

    }


    if (modalProductCategory) {

        modalProductCategory.textContent =
            product.category || "Apple";

    }


    if (modalProductName) {

        modalProductName.textContent =
            product.name;

    }


    if (modalProductDescription) {

        modalProductDescription.textContent =
            product.description ||
            "Producto Apple disponible.";

    }


    if (modalProductCondition) {

        modalProductCondition.textContent =
            product.condition || "Nuevo";

    }


    if (modalProductStock) {

        if (product.stock <= 0) {

            modalProductStock.textContent =
                "Agotado";

        } else {

            modalProductStock.textContent =
                `Stock: ${product.stock}`;

        }

    }


    if (modalProductPrice) {

        modalProductPrice.textContent =
            formatPrice(
                product.price,
                product.currency
            );

    }


    if (modalAddCart) {

        if (product.stock <= 0) {

            modalAddCart.disabled =
                true;

            modalAddCart.textContent =
                "Producto agotado";

        } else {

            modalAddCart.disabled =
                false;

            modalAddCart.innerHTML = `
                Añadir a la bolsa
            `;

        }

    }


    productModal.classList.add(
        "active"
    );


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   CERRAR MODAL
========================================================= */

function closeModal() {

    if (!productModal) {
        return;
    }


    productModal.classList.remove(
        "active"
    );


    document.body.classList.remove(
        "modal-open"
    );


    currentProduct =
        null;

}


/* =========================================================
   CARRITO
========================================================= */

function setupCart() {

    if (cartButton) {

        cartButton.addEventListener(
            "click",
            openCartDrawer
        );

    }


    if (closeCart) {

        closeCart.addEventListener(
            "click",
            closeCartDrawer
        );

    }


    if (cartOverlay) {

        cartOverlay.addEventListener(
            "click",
            closeCartDrawer
        );

    }


    if (checkoutButton) {

        checkoutButton.addEventListener(
            "click",
            checkoutWhatsApp
        );

    }


    updateCartUI();

}


/* =========================================================
   ABRIR CARRITO
========================================================= */

function openCartDrawer() {

    cartDrawer?.classList.add(
        "active"
    );

    cartOverlay?.classList.add(
        "active"
    );

    document.body.classList.add(
        "cart-open"
    );

}


/* =========================================================
   CERRAR CARRITO
========================================================= */

function closeCartDrawer() {

    cartDrawer?.classList.remove(
        "active"
    );

    cartOverlay?.classList.remove(
        "active"
    );

    document.body.classList.remove(
        "cart-open"
    );

}


/* =========================================================
   AGREGAR AL CARRITO
========================================================= */

function addToCart(
    product
) {

    if (
        !product ||
        product.stock <= 0
    ) {

        showToast(
            "Este producto está agotado.",
            "error"
        );

        return;

    }


    const existing =
        cart.find(
            item =>
                item.id === product.id
        );


    if (existing) {

        if (
            existing.quantity >=
            product.stock
        ) {

            showToast(
                "No hay más unidades disponibles.",
                "error"
            );

            return;

        }


        existing.quantity++;

    } else {

        cart.push({

            ...product,

            quantity: 1

        });

    }


    updateCartUI();


    showToast(
        "Producto añadido a la bolsa.",
        "success"
    );

}


/* =========================================================
   ELIMINAR PRODUCTO DEL CARRITO
========================================================= */

function removeFromCart(
    productId
) {

    cart =
        cart.filter(
            item =>
                item.id !== productId
        );


    updateCartUI();

}


/* =========================================================
   CAMBIAR CANTIDAD
========================================================= */

function changeQuantity(
    productId,
    change
) {

    const item =
        cart.find(
            product =>
                product.id === productId
        );


    if (!item) {
        return;
    }


    const newQuantity =
        item.quantity + change;


    if (
        newQuantity <= 0
    ) {

        removeFromCart(
            productId
        );

        return;

    }


    if (
        newQuantity >
        item.stock
    ) {

        showToast(
            "No hay más unidades disponibles.",
            "error"
        );

        return;

    }


    item.quantity =
        newQuantity;


    updateCartUI();

}


/* =========================================================
   ACTUALIZAR CARRITO
========================================================= */

function updateCartUI() {

    const totalItems =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                item.quantity,
            0
        );


    if (cartCount) {

        cartCount.textContent =
            totalItems;

    }


    if (!cartItems) {
        return;
    }


    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="cart-empty">

                <div class="cart-empty-icon">

                    <i class="fa-solid fa-bag-shopping"></i>

                </div>

                <h3>
                    Tu bolsa está vacía
                </h3>

                <p>
                    Añade productos para comenzar.
                </p>

            </div>

        `;

        if (cartTotal) {

            cartTotal.textContent =
                "$0.00";

        }

        return;

    }


    cartItems.innerHTML = "";


    let total = 0;


    cart.forEach(
        item => {

            total +=
                Number(item.price) *
                item.quantity;


            const cartItem =
                document.createElement(
                    "div"
                );


            cartItem.className =
                "cart-item";


            cartItem.innerHTML = `

                <div class="cart-item-image">

                    <img
                        src="${
                            item.image_url ||
                            createPlaceholderImage(
                                item.name
                            )
                        }"
                        alt="${escapeHtml(
                            item.name
                        )}"
                    >

                </div>

                <div class="cart-item-content">

                    <h4>
                        ${escapeHtml(
                            item.name
                        )}
                    </h4>

                    <span>
                        ${formatPrice(
                            item.price,
                            item.currency
                        )}
                    </span>

                    <div class="cart-item-actions">

                        <button
                            class="quantity-button"
                            data-action="decrease"
                        >
                            −
                        </button>

                        <span>
                            ${item.quantity}
                        </span>

                        <button
                            class="quantity-button"
                            data-action="increase"
                        >
                            +
                        </button>

                        <button
                            class="remove-cart-item"
                            data-action="remove"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </div>

                </div>

            `;


            const decreaseButton =
                cartItem.querySelector(
                    '[data-action="decrease"]'
                );


            const increaseButton =
                cartItem.querySelector(
                    '[data-action="increase"]'
                );


            const removeButton =
                cartItem.querySelector(
                    '[data-action="remove"]'
                );


            decreaseButton?.addEventListener(
                "click",
                () => {

                    changeQuantity(
                        item.id,
                        -1
                    );

                }
            );


            increaseButton?.addEventListener(
                "click",
                () => {

                    changeQuantity(
                        item.id,
                        1
                    );

                }
            );


            removeButton?.addEventListener(
                "click",
                () => {

                    removeFromCart(
                        item.id
                    );

                }
            );


            cartItems.appendChild(
                cartItem
            );

        }
    );


    if (cartTotal) {

        cartTotal.textContent =
            formatPrice(
                total,
                "USD"
            );

    }

}


/* =========================================================
   WHATSAPP
========================================================= */

function checkoutWhatsApp() {

    if (
        !cart ||
        cart.length === 0
    ) {

        showToast(
            "Tu bolsa está vacía.",
            "error"
        );

        return;

    }


    let message =
        "Hola, AppleStore Lawton. 👋\n\n";

    message +=
        "Quiero consultar por estos productos:\n\n";


    cart.forEach(
        item => {

            message +=
                `• ${item.name} x${item.quantity}\n`;

        }
    );


    message +=
        "\nQuisiera confirmar disponibilidad y precio.";


    const url =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
            message
        )}`;


    window.open(
        url,
        "_blank"
    );

}


/* =========================================================
   NAVEGACIÓN
========================================================= */

function setupNavigation() {

    if (mobileMenuButton) {

        mobileMenuButton.addEventListener(
            "click",
            () => {

                mobileNav?.classList.toggle(
                    "active"
                );

            }
        );

    }


    if (mobileNav) {

        mobileNav
            .querySelectorAll("a")
            .forEach(
                link => {

                    link.addEventListener(
                        "click",
                        () => {

                            mobileNav.classList.remove(
                                "active"
                            );

                        }
                    );

                }
            );

    }

}


/* =========================================================
   LOADING
========================================================= */

function showLoading() {

    if (!productsGrid) {
        return;
    }


    productsGrid.innerHTML = `

        <div class="products-loading">

            <div class="loading-spinner"></div>

            <p>
                Cargando productos...
            </p>

        </div>

    `;


    if (noProducts) {

        noProducts.style.display =
            "none";

    }

}


/* =========================================================
   ERROR
========================================================= */

function showError(
    message
) {

    if (!productsGrid) {
        return;
    }


    productsGrid.innerHTML = `

        <div class="products-error">

            <div class="products-error-icon">

                <i class="fa-solid fa-triangle-exclamation"></i>

            </div>

            <h3>
                No pudimos cargar la tienda
            </h3>

            <p>
                ${escapeHtml(message)}
            </p>

            <button
                class="button button-primary"
                onclick="loadProducts()"
            >
                Intentar nuevamente
            </button>

        </div>

    `;

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type = "success"
) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {
        return;
    }


    toast.textContent =
        message;


    toast.className =
        "toast show";


    if (
        type === "error"
    ) {

        toast.classList.add(
            "error"
        );

    }


    clearTimeout(
        window.toastTimeout
    );


    window.toastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3500
        );

}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}