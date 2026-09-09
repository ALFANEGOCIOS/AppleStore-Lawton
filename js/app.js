/* =========================================================
   APPLESTORE LAWTON
   STORE FRONTEND
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://tvlabyorkrelsqxzbjth.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_75rNY0L4KuTmPs44Z7RuIA_ggXpHe69";


/*
    IMPORTANTE:

    La publishable key puede utilizarse en el frontend.

    La Secret Key de Supabase NUNCA debe colocarse aquí.
*/


/* =========================================================
   PRODUCTOS DE PRUEBA
========================================================= */

const demoProducts = [

    {
        id: "demo-1",
        name: "iPhone 13",
        description: "iPhone 13 de 128 GB en excelente estado.",
        price: 420,
        category: "iPhone",
        condition: "Usado",
        stock: 2,
        image: "https://placehold.co/800x800/f5f5f7/1d1d1f?text=iPhone+13"
    },

    {
        id: "demo-2",
        name: "iPad 9ª generación",
        description: "iPad de 64 GB ideal para estudio, trabajo y entretenimiento.",
        price: 260,
        category: "iPad",
        condition: "Usado",
        stock: 4,
        image: "https://placehold.co/800x800/f5f5f7/1d1d1f?text=iPad"
    },

    {
        id: "demo-3",
        name: "MacBook Air M1",
        description: "MacBook Air con chip M1, ligera y potente.",
        price: 550,
        category: "Mac",
        condition: "Usado",
        stock: 1,
        image: "https://placehold.co/800x800/f5f5f7/1d1d1f?text=MacBook+Air"
    },

    {
        id: "demo-4",
        name: "Apple Watch Band",
        description: "Correa compatible con Apple Watch.",
        price: 18,
        category: "Apple Watch",
        condition: "Nuevo",
        stock: 8,
        image: "https://placehold.co/800x800/f5f5f7/1d1d1f?text=Apple+Watch"
    },

    {
        id: "demo-5",
        name: "AirPods Pro 2",
        description: "AirPods Pro de segunda generación.",
        price: 150,
        category: "AirPods",
        condition: "Usado",
        stock: 2,
        image: "https://placehold.co/800x800/f5f5f7/1d1d1f?text=AirPods+Pro"
    },

    {
        id: "demo-6",
        name: "Cargador USB-C 20W",
        description: "Adaptador de corriente USB-C de 20W.",
        price: 25,
        category: "Accesorios",
        condition: "Nuevo",
        stock: 10,
        image: "https://placehold.co/800x800/f5f5f7/1d1d1f?text=20W+Charger"
    },

    {
        id: "demo-7",
        name: "Magic Mouse 2",
        description: "Mouse inalámbrico Apple con superficie Multi-Touch.",
        price: 75,
        category: "Accesorios",
        condition: "Usado",
        stock: 3,
        image: "https://placehold.co/800x800/f5f5f7/1d1d1f?text=Magic+Mouse"
    },

    {
        id: "demo-8",
        name: "iPod Classic 160GB",
        description: "iPod Classic de 160 GB para coleccionistas y amantes de la música.",
        price: 120,
        category: "iPod",
        condition: "Usado",
        stock: 1,
        image: "https://placehold.co/800x800/f5f5f7/1d1d1f?text=iPod+Classic"
    },

    {
        id: "demo-9",
        name: "Cable USB-C a Lightning",
        description: "Cable de carga y transferencia de datos de 1 metro.",
        price: 20,
        category: "Accesorios",
        condition: "Nuevo",
        stock: 15,
        image: "https://placehold.co/800x800/f5f5f7/1d1d1f?text=Cable"
    },

    {
        id: "demo-10",
        name: "MagSafe Charger",
        description: "Cargador inalámbrico MagSafe para dispositivos compatibles.",
        price: 35,
        category: "Accesorios",
        condition: "Nuevo",
        stock: 5,
        image: "https://placehold.co/800x800/f5f5f7/1d1d1f?text=MagSafe"
    }

];


/* =========================================================
   ESTADO
========================================================= */

let products = [...demoProducts];

let activeCondition = "Todos";

let searchTerm = "";

let selectedCategory = null;

let cart = JSON.parse(
    localStorage.getItem("appleStoreCart") || "[]"
);


/* =========================================================
   ELEMENTOS
========================================================= */

const productsGrid =
    document.getElementById("productsGrid");

const emptyProducts =
    document.getElementById("emptyProducts");

const cartCount =
    document.getElementById("cartCount");

const cartOverlay =
    document.getElementById("cartOverlay");

const cartItems =
    document.getElementById("cartItems");

const cartEmpty =
    document.getElementById("cartEmpty");

const cartTotal =
    document.getElementById("cartTotal");

const toast =
    document.getElementById("toast");


/* =========================================================
   FORMATEAR PRECIO
========================================================= */

function formatPrice(price) {

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(price);

}


/* =========================================================
   ESTADO DEL STOCK
========================================================= */

function getStockStatus(stock) {

    if (stock <= 0) {

        return {
            text: "Agotado",
            className: "stock-out"
        };

    }

    if (stock <= 3) {

        return {
            text: `Últimas ${stock} unidades`,
            className: "stock-low"
        };

    }

    return {
        text: "Disponible",
        className: "stock-available"
    };

}


/* =========================================================
   FILTRAR PRODUCTOS
========================================================= */

function getFilteredProducts() {

    return products.filter(product => {

        const matchesCondition =
            activeCondition === "Todos" ||
            product.condition === activeCondition;

        const matchesCategory =
            !selectedCategory ||
            product.category === selectedCategory;

        const search =
            searchTerm.toLowerCase().trim();

        const matchesSearch =
            !search ||
            product.name.toLowerCase().includes(search) ||
            product.description.toLowerCase().includes(search) ||
            product.category.toLowerCase().includes(search);

        return (
            matchesCondition &&
            matchesCategory &&
            matchesSearch
        );

    });

}


/* =========================================================
   RENDER PRODUCTOS
========================================================= */

function renderProducts() {

    const filtered =
        getFilteredProducts();

    productsGrid.innerHTML = "";

    if (!filtered.length) {

        emptyProducts.style.display = "block";

        return;

    }

    emptyProducts.style.display = "none";


    filtered.forEach(product => {

        const stock =
            getStockStatus(product.stock);

        const card =
            document.createElement("article");

        card.className = "product-card";

        card.innerHTML = `

            <div
                class="product-image"
                data-id="${product.id}"
            >

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                >

            </div>


            <div class="product-info">

                <span class="product-condition">
                    ${product.condition}
                </span>

                <h3>
                    ${product.name}
                </h3>

                <p class="product-description">
                    ${product.description}
                </p>


                <div class="product-bottom">

                    <div>

                        <div class="product-price">
                            ${formatPrice(product.price)}
                        </div>

                        <div class="product-stock ${stock.className}">
                            ${stock.text}
                        </div>

                    </div>


                    <button
                        class="product-add"
                        data-add="${product.id}"
                        ${product.stock <= 0 ? "disabled" : ""}
                        aria-label="Añadir al carrito"
                    >
                        +
                    </button>

                </div>

            </div>

        `;

        productsGrid.appendChild(card);

    });


    document
        .querySelectorAll("[data-add]")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    addToCart(
                        button.dataset.add
                    );

                }
            );

        });


    document
        .querySelectorAll(".product-image")
        .forEach(image => {

            image.addEventListener(
                "click",
                () => {

                    openProductModal(
                        image.dataset.id
                    );

                }
            );

        });

}


/* =========================================================
   PRODUCT MODAL
========================================================= */

const productModal =
    document.getElementById("productModal");

const modalProductImage =
    document.getElementById("modalProductImage");

const modalProductName =
    document.getElementById("modalProductName");

const modalProductDescription =
    document.getElementById("modalProductDescription");

const modalProductPrice =
    document.getElementById("modalProductPrice");

const modalProductCondition =
    document.getElementById("modalProductCondition");

const modalProductStock =
    document.getElementById("modalProductStock");

const modalAddButton =
    document.getElementById("modalAddButton");

let modalProductId = null;


function openProductModal(id) {

    const product =
        products.find(
            item => item.id === id
        );

    if (!product) return;

    modalProductId = id;

    modalProductImage.src =
        product.image;

    modalProductImage.alt =
        product.name;

    modalProductName.textContent =
        product.name;

    modalProductDescription.textContent =
        product.description;

    modalProductPrice.textContent =
        formatPrice(product.price);

    modalProductCondition.textContent =
        product.condition;

    const stock =
        getStockStatus(product.stock);

    modalProductStock.textContent =
        stock.text;

    modalProductStock.className =
        `modal-stock ${stock.className}`;

    modalAddButton.disabled =
        product.stock <= 0;

    modalAddButton.textContent =
        product.stock <= 0
            ? "Producto agotado"
            : "Añadir al carrito";

    productModal.classList.add("active");

}


document
    .getElementById("closeProductModal")
    .addEventListener(
        "click",
        () => productModal.classList.remove("active")
    );


productModal.addEventListener(
    "click",
    event => {

        if (event.target === productModal) {

            productModal.classList.remove("active");

        }

    }
);


modalAddButton.addEventListener(
    "click",
    () => {

        if (!modalProductId) return;

        addToCart(modalProductId);

        productModal.classList.remove("active");

    }
);


/* =========================================================
   CARRITO
========================================================= */

function saveCart() {

    localStorage.setItem(
        "appleStoreCart",
        JSON.stringify(cart)
    );

}


function addToCart(id) {

    const product =
        products.find(
            item => item.id === id
        );

    if (!product || product.stock <= 0) {

        showToast("Producto agotado.");

        return;

    }


    const existing =
        cart.find(
            item => item.id === id
        );


    if (existing) {

        if (existing.quantity >= product.stock) {

            showToast(
                "No hay más unidades disponibles."
            );

            return;

        }

        existing.quantity++;

    } else {

        cart.push({
            id: product.id,
            quantity: 1
        });

    }


    saveCart();

    updateCart();

    showToast(
        "Producto añadido al carrito."
    );

}


function removeFromCart(id) {

    cart =
        cart.filter(
            item => item.id !== id
        );

    saveCart();

    updateCart();

}


function updateCart() {

    cartItems.innerHTML = "";

    let total = 0;

    let quantity = 0;


    cart.forEach(item => {

        const product =
            products.find(
                product => product.id === item.id
            );

        if (!product) return;

        const subtotal =
            product.price * item.quantity;

        total += subtotal;

        quantity += item.quantity;


        const element =
            document.createElement("div");

        element.className = "cart-item";

        element.innerHTML = `

            <img
                class="cart-item-image"
                src="${product.image}"
                alt="${product.name}"
            >

            <div class="cart-item-info">

                <h4>
                    ${product.name}
                </h4>

                <p>
                    ${item.quantity} ×
                    ${formatPrice(product.price)}
                </p>

                <button
                    class="remove-item"
                    data-remove="${product.id}"
                >
                    Eliminar
                </button>

            </div>

            <div class="cart-item-price">
                ${formatPrice(subtotal)}
            </div>

        `;

        cartItems.appendChild(element);

    });


    cartCount.textContent =
        quantity;


    cartTotal.textContent =
        formatPrice(total);


    cartEmpty.style.display =
        cart.length
            ? "none"
            : "flex";


    document
        .querySelectorAll("[data-remove]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    removeFromCart(
                        button.dataset.remove
                    );

                }
            );

        });

}


/* =========================================================
   CART OPEN/CLOSE
========================================================= */

document
    .getElementById("cartButton")
    .addEventListener(
        "click",
        () => {

            updateCart();

            cartOverlay.classList.add("active");

        }
    );


document
    .getElementById("closeCart")
    .addEventListener(
        "click",
        () => {

            cartOverlay.classList.remove("active");

        }
    );


cartOverlay.addEventListener(
    "click",
    event => {

        if (event.target === cartOverlay) {

            cartOverlay.classList.remove("active");

        }

    }
);


/* =========================================================
   FILTROS
========================================================= */

document
    .querySelectorAll(".filter-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".filter-button")
                    .forEach(item =>
                        item.classList.remove("active")
                    );

                button.classList.add("active");

                activeCondition =
                    button.dataset.filter;

                selectedCategory = null;

                renderProducts();

            }
        );

    });


/* =========================================================
   CATEGORÍAS
========================================================= */

document
    .querySelectorAll(".category-card")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                selectedCategory =
                    button.dataset.category;

                document
                    .querySelectorAll(".filter-button")
                    .forEach(item =>
                        item.classList.remove("active")
                    );

                document
                    .querySelector(
                        '[data-filter="Todos"]'
                    )
                    .classList.add("active");

                activeCondition = "Todos";

                renderProducts();

                document
                    .getElementById("productos")
                    .scrollIntoView({
                        behavior: "smooth"
                    });

            }
        );

    });


/* =========================================================
   SEARCH
========================================================= */

const searchOverlay =
    document.getElementById("searchOverlay");

const searchInput =
    document.getElementById("searchInput");


document
    .getElementById("searchButton")
    .addEventListener(
        "click",
        () => {

            searchOverlay.classList.add("active");

            setTimeout(
                () => searchInput.focus(),
                100
            );

        }
    );


document
    .getElementById("closeSearch")
    .addEventListener(
        "click",
        () => {

            searchOverlay.classList.remove("active");

        }
    );


searchInput.addEventListener(
    "input",
    event => {

        searchTerm =
            event.target.value;

        renderProducts();

    }
);


/* =========================================================
   MOBILE MENU
========================================================= */

document
    .getElementById("mobileMenuButton")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("mobileMenu")
                .classList.toggle("active");

        }
    );


document
    .querySelectorAll(".mobile-menu a")
    .forEach(link => {

        link.addEventListener(
            "click",
            () => {

                document
                    .getElementById("mobileMenu")
                    .classList.remove("active");

            }
        );

    });


/* =========================================================
   TOAST
========================================================= */

let toastTimeout;


function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout =
        setTimeout(
            () => toast.classList.remove("show"),
            2500
        );

}


/* =========================================================
   CHECKOUT
========================================================= */

document
    .getElementById("checkoutButton")
    .addEventListener(
        "click",
        () => {

            if (!cart.length) {

                showToast(
                    "El carrito está vacío."
                );

                return;

            }

            showToast(
                "El sistema de pedidos se conectará próximamente."
            );

        }
    );


/* =========================================================
   INICIALIZAR
========================================================= */

renderProducts();

updateCart();
