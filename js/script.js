/* =========================================================
   APPLESTORE LAWTON
   SCRIPT PRINCIPAL
   Supabase + Productos + Filtros + Carrito
========================================================= */


/* =========================================================
   CONFIGURACIÓN SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://tvlabyorkrelsqxzbjth.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_75rNY0L4KuTmPs44Z7RuIA_ggXpHe69";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
   CONFIGURACIÓN GENERAL
========================================================= */

const WHATSAPP_NUMBER =
    "5358751220";

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

        console.log(
            "Conectando con Supabase..."
        );


        /*
         * PRIMER INTENTO
         *
         * Intentamos ordenar por created_at.
         */

        let response =
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
         * SI created_at NO EXISTE
         *
         * Volvemos a consultar sin ordenar.
         *
         * Esto evita que una sola columna
         * inexistente rompa toda la tienda.
         */

        if (response.error) {

            console.warn(
                "Primer intento de carga falló:",
                response.error
            );


            console.log(
                "Intentando cargar productos sin created_at..."
            );


            response =
                await supabaseClient
                    .from("products")
                    .select("*");

        }


        const {
            data,
            error
        } = response;


        /*
         * ERROR DEFINITIVO
         */

        if (error) {

            console.error(
                "ERROR SUPABASE:",
                error
            );


            console.error(
                "Código:",
                error.code
            );


            console.error(
                "Mensaje:",
                error.message
            );


            console.error(
                "Detalles:",
                error.details
            );


            showError(
                `Supabase: ${error.message}`
            );


            return;

        }


        /*
         * ASEGURAR ARRAY
         */

        products =
            Array.isArray(data)
                ? data
                : [];


        console.log(
            "================================="
        );

        console.log(
            "PRODUCTOS RECIBIDOS DE SUPABASE:"
        );

        console.table(
            products
        );

        console.log(
            "Cantidad:",
            products.length
        );

        console.log(
            "================================="
        );


        /*
         * NORMALIZAR PRODUCTOS
         */

        products =
            products.map(
                normalizeProduct
            );


        filteredProducts =
            [...products];


        renderProducts();


    } catch (error) {

        console.error(
            "ERROR INESPERADO:",
            error
        );


        showError(
            "No se pudo conectar con la base de datos."
        );

    }

}


/* =========================================================
   NORMALIZAR PRODUCTO
========================================================= */

function normalizeProduct(
    product
) {

    return {

        id:
            product.id,

        name:
            product.name ||
            product.product_name ||
            "Producto Apple",

        category:
            product.category ||
            "Apple",

        description:
            product.description ||
            "Producto Apple disponible.",

        price:
            Number(
                product.price
            ) || 0,

        currency:
            product.currency ||
            "USD",

        condition:
            product.condition ||
            "Nuevo",

        stock:
            Number(
                product.stock
            ) || 0,

        image_url:
            product.image_url ||
            product.image ||
            "",

        created_at:
            product.created_at ||
            null

    };

}


/* =========================================================
   RENDERIZAR PRODUCTOS
========================================================= */

function renderProducts() {

    if (!productsGrid) {

        console.error(
            "No existe #productsGrid en index.html"
        );

        return;

    }


    productsGrid.innerHTML = "";


    /*
     * SIN PRODUCTOS
     */

    if (
        !filteredProducts ||
        filteredProducts.length === 0
    ) {

        if (noProducts) {

            noProducts.style.display =
                "block";

        }

        return;

    }


    if (noProducts) {

        noProducts.style.display =
            "none";

    }


    /*
     * CREAR TARJETAS
     */

    filteredProducts.forEach(
        product => {

            const card =
                createProductCard(
                    product
                );


            productsGrid.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   CREAR TARJETA DE PRODUCTO
========================================================= */

function createProductCard(
    product
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "product-card";


    /*
     * IMAGEN
     */

    const imageContainer =
        document.createElement(
            "div"
        );


    imageContainer.className =
        "product-card-image";


    const image =
        document.createElement(
            "img"
        );


    image.src =
        product.image_url ||
        createPlaceholderImage(
            product.name
        );


    image.alt =
        product.name ||
        "Producto Apple";


    image.loading =
        "lazy";


    /*
     * SI LA IMAGEN DE SUPABASE
     * FALLA
     */

    image.onerror =
        () => {

            image.onerror =
                null;

            image.src =
                createPlaceholderImage(
                    product.name
                );

        };


    imageContainer.appendChild(
        image
    );


    /*
     * BADGE DE CONDICIÓN
     */

    const condition =
        document.createElement(
            "span"
        );


    condition.className =
        "product-status";


    if (
        String(
            product.condition
        ).toLowerCase() ===
        "usado"
    ) {

        condition.classList.add(
            "used"
        );

    } else {

        condition.classList.add(
            "new"
        );

    }


    condition.textContent =
        product.condition ||
        "Nuevo";


    imageContainer.appendChild(
        condition
    );


    /*
     * INFORMACIÓN
     */

    const content =
        document.createElement(
            "div"
        );


    content.className =
        "product-info";


    /*
     * CATEGORÍA
     */

    const category =
        document.createElement(
            "span"
        );


    category.className =
        "product-category";


    category.textContent =
        product.category ||
        "Apple";


    /*
     * NOMBRE
     */

    const name =
        document.createElement(
            "h3"
        );


    name.className =
        "product-name";


    name.textContent =
        product.name ||
        "Producto Apple";


    /*
     * DESCRIPCIÓN
     */

    const description =
        document.createElement(
            "p"
        );


    description.className =
        "product-description";


    description.textContent =
        product.description ||
        "Producto Apple disponible.";


    /*
     * PARTE INFERIOR
     */

    const bottom =
        document.createElement(
            "div"
        );


    bottom.className =
        "product-bottom";


    /*
     * PRECIO + STOCK
     */

    const priceStock =
        document.createElement(
            "div"
        );


    /*
     * PRECIO
     */

    const price =
        document.createElement(
            "div"
        );


    price.className =
        "product-price";


    price.textContent =
        formatPrice(
            product.price,
            product.currency
        );


    /*
     * STOCK
     */

    const stock =
        document.createElement(
            "div"
        );


    stock.className =
        "product-stock";


    if (
        product.stock <= 0
    ) {

        stock.classList.add(
            "out"
        );

        stock.textContent =
            "Agotado";

    } else if (
        product.stock <= 2
    ) {

        stock.textContent =
            `Últimas ${product.stock}`;

    } else {

        stock.textContent =
            "Disponible";

    }


    priceStock.appendChild(
        price
    );

    priceStock.appendChild(
        stock
    );


    /*
     * BOTÓN AÑADIR
     */

    const addButton =
        document.createElement(
            "button"
        );


    addButton.className =
        "product-add";


    addButton.type =
        "button";


    addButton.setAttribute(
        "aria-label",
        "Añadir a la bolsa"
    );


    addButton.innerHTML =
        `<i class="fa-solid fa-plus"></i>`;


    if (
        product.stock <= 0
    ) {

        addButton.disabled =
            true;

    }


    addButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            addToCart(
                product
            );

        }
    );


    priceStock.appendChild(
        document.createElement("span")
    );


    bottom.appendChild(
        priceStock
    );


    bottom.appendChild(
        addButton
    );


    /*
     * ARMAR INFORMACIÓN
     */

    content.appendChild(
        category
    );

    content.appendChild(
        name
    );

    content.appendChild(
        description
    );

    content.appendChild(
        bottom
    );


    /*
     * ARMAR CARD
     */

    card.appendChild(
        imageContainer
    );

    card.appendChild(
        content
    );


    /*
     * CLICK EN PRODUCTO
     */

    card.addEventListener(
        "click",
        () => {

            openProductModal(
                product
            );

        }
    );


    return card;

}


/* =========================================================
   PLACEHOLDER DE IMAGEN
========================================================= */

function createPlaceholderImage(
    productName
) {

    const safeName =
        escapeHtml(
            productName ||
            "Producto Apple"
        );


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
                y="375"
                text-anchor="middle"
                font-family="Arial"
                font-size="34"
                font-weight="bold"
                fill="#1d1d1f"
            >
                AppleStore Lawton
            </text>

            <text
                x="400"
                y="425"
                text-anchor="middle"
                font-family="Arial"
                font-size="23"
                fill="#6e6e73"
            >
                ${safeName}
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


    const normalizedCurrency =
        String(
            currency || "USD"
        ).toUpperCase();


    if (
        normalizedCurrency ===
        "CUP"
    ) {

        return `${numericPrice.toLocaleString(
            "es-ES"
        )} CUP`;

    }


    if (
        normalizedCurrency ===
        "EUR"
    ) {

        return `${numericPrice.toLocaleString(
            "es-ES",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )} €`;

    }


    return `$${numericPrice.toLocaleString(
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


                    applySearch();

                }
            );

        }
    );

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
                            `.filter-button[data-filter="${CSS.escape(category)}"]`
                        );


                    if (filterButton) {

                        filterButton.click();

                    }


                    const productsSection =
                        document.getElementById(
                            "productos"
                        );


                    productsSection?.scrollIntoView(
                        {
                            behavior: "smooth"
                        }
                    );

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

                searchContainer?.classList.toggle(
                    "active"
                );


                if (
                    searchContainer?.classList.contains(
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

                if (searchInput) {

                    searchInput.value =
                        "";

                }


                searchContainer?.classList.remove(
                    "active"
                );


                resetFiltersAndSearch();

            }
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applySearch
        );

    }

}


/* =========================================================
   APLICAR BÚSQUEDA + FILTRO
========================================================= */

function applySearch() {

    const search =
        searchInput?.value
            ?.trim()
            .toLowerCase() ||
        "";


    const activeFilter =
        document.querySelector(
            ".filter-button.active"
        );


    const category =
        activeFilter?.dataset.filter ||
        "Todos";


    let result =
        [...products];


    /*
     * CATEGORÍA
     */

    if (
        category !==
        "Todos"
    ) {

        result =
            result.filter(
                product => {

                    return String(
                        product.category ||
                        ""
                    ).toLowerCase() ===
                    String(
                        category
                    ).toLowerCase();

                }
            );

    }


    /*
     * BUSCADOR
     */

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
   RESETEAR
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


    allButton?.classList.add(
        "active"
    );


    filteredProducts =
        [...products];


    renderProducts();

}


/* =========================================================
   MODAL
========================================================= */

function setupProductModal() {

    closeProductModal?.addEventListener(
        "click",
        closeModal
    );


    productModal?.addEventListener(
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


    modalAddCart?.addEventListener(
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


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
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
            product.category ||
            "Apple";

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
            product.condition ||
            "Nuevo";

    }


    if (modalProductStock) {

        if (
            product.stock <= 0
        ) {

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

        if (
            product.stock <= 0
        ) {

            modalAddCart.disabled =
                true;

            modalAddCart.textContent =
                "Producto agotado";

        } else {

            modalAddCart.disabled =
                false;

            modalAddCart.textContent =
                "Añadir a la bolsa";

        }

    }


    productModal?.classList.add(
        "active"
    );


    document.body.classList.add(
        "no-scroll"
    );

}


/* =========================================================
   CERRAR MODAL
========================================================= */

function closeModal() {

    productModal?.classList.remove(
        "active"
    );


    document.body.classList.remove(
        "no-scroll"
    );


    currentProduct =
        null;

}


/* =========================================================
   CARRITO
========================================================= */

function setupCart() {

    cartButton?.addEventListener(
        "click",
        openCartDrawer
    );


    closeCart?.addEventListener(
        "click",
        closeCartDrawer
    );


    cartOverlay?.addEventListener(
        "click",
        closeCartDrawer
    );


    checkoutButton?.addEventListener(
        "click",
        checkoutWhatsApp
    );


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
        "no-scroll"
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
        "no-scroll"
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
                item.id ===
                product.id
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
   ELIMINAR
========================================================= */

function removeFromCart(
    productId
) {

    cart =
        cart.filter(
            item =>
                item.id !==
                productId
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
                product.id ===
                productId
        );


    if (!item) {
        return;
    }


    const newQuantity =
        item.quantity +
        change;


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
            ) => {

                return total +
                    item.quantity;

            },
            0
        );


    if (cartCount) {

        cartCount.textContent =
            totalItems;

    }


    if (!cartItems) {
        return;
    }


    if (
        cart.length === 0
    ) {

        cartItems.innerHTML = `

            <div class="cart-empty">

                <i class="fa-solid fa-bag-shopping"></i>

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


    cartItems.innerHTML =
        "";


    let total =
        0;


    cart.forEach(
        item => {

            total +=
                Number(
                    item.price
                ) *
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

                <div class="cart-item-info">

                    <h3>
                        ${escapeHtml(
                            item.name
                        )}
                    </h3>

                    <p>
                        ${formatPrice(
                            item.price,
                            item.currency
                        )}
                    </p>

                    <div class="cart-item-controls">

                        <button
                            class="cart-quantity-button"
                            data-action="decrease"
                        >
                            −
                        </button>

                        <span class="cart-quantity">
                            ${item.quantity}
                        </span>

                        <button
                            class="cart-quantity-button"
                            data-action="increase"
                        >
                            +
                        </button>

                        <button
                            class="cart-remove"
                            data-action="remove"
                        >
                            Eliminar
                        </button>

                    </div>

                </div>

            `;


            cartItem
                .querySelector(
                    '[data-action="decrease"]'
                )
                ?.addEventListener(
                    "click",
                    () => {

                        changeQuantity(
                            item.id,
                            -1
                        );

                    }
                );


            cartItem
                .querySelector(
                    '[data-action="increase"]'
                )
                ?.addEventListener(
                    "click",
                    () => {

                        changeQuantity(
                            item.id,
                            1
                        );

                    }
                );


            cartItem
                .querySelector(
                    '[data-action="remove"]'
                )
                ?.addEventListener(
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

        /*
         * Si posteriormente permitimos
         * diferentes monedas en un mismo
         * carrito, habrá que separarlas.
         *
         * Por ahora se utiliza USD.
         */

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

    mobileMenuButton?.addEventListener(
        "click",
        () => {

            mobileNav?.classList.toggle(
                "active"
            );

        }
    );


    mobileNav
        ?.querySelectorAll("a")
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

        <div
            class="products-error"
            style="
                grid-column: 1 / -1;
                padding: 60px 20px;
                text-align: center;
            "
        >

            <div
                style="
                    width: 60px;
                    height: 60px;
                    margin: 0 auto 18px;
                    display: grid;
                    place-items: center;
                    border-radius: 18px;
                    color: #d93025;
                    background: #fff0ef;
                "
            >

                <i class="fa-solid fa-triangle-exclamation"></i>

            </div>

            <h3>
                No pudimos cargar los productos
            </h3>

            <p
                style="
                    max-width: 550px;
                    margin: 8px auto 20px;
                    color: #6e6e73;
                    font-size: 0.78rem;
                    line-height: 1.6;
                "
            >
                ${escapeHtml(message)}
            </p>

            <button
                class="button button-primary"
                type="button"
                id="retryProducts"
            >
                Intentar nuevamente
            </button>

        </div>

    `;


    document
        .getElementById(
            "retryProducts"
        )
        ?.addEventListener(
            "click",
            loadProducts
        );

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