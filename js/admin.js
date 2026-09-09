/* =========================================================
   APPLESTORE LAWTON
   ADMIN PANEL
   ========================================================= */


/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
    "https://tvlabyorkrelsqxzbjth.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_75rNY0L4KuTmPs44Z7RuIA_ggXpHe69";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
   STATE
========================================================= */

let adminProducts = [];

let editingProductId = null;


/* =========================================================
   ELEMENTS
========================================================= */

const loginSection =
    document.getElementById("adminLogin");

const adminPanel =
    document.getElementById("adminPanel");

const loginForm =
    document.getElementById("loginForm");

const loginError =
    document.getElementById("loginError");

const logoutButton =
    document.getElementById("logoutButton");

const imageInput =
    document.getElementById("productImage");

const productForm =
    document.getElementById("productForm");


/* =========================================================
   CHECK SESSION
========================================================= */

async function checkSession() {

    try {

        const {
            data,
            error
        } = await supabaseClient.auth.getSession();


        if (error) {
            console.error("Error comprobando sesión:", error);
            showLogin();
            return;
        }


        if (data.session) {

            showAdminPanel();

        } else {

            showLogin();

        }

    } catch (error) {

        console.error(error);

        showLogin();

    }

}


/* =========================================================
   SHOW LOGIN
========================================================= */

function showLogin() {

    loginSection.style.display = "flex";

    adminPanel.style.display = "none";

}


/* =========================================================
   SHOW ADMIN PANEL
========================================================= */

function showAdminPanel() {

    loginSection.style.display = "none";

    /*
        Importante:
        El CSS utiliza display:grid.
        No debemos poner display:flex aquí.
    */

    adminPanel.style.display = "grid";

    loadProducts();

}


/* =========================================================
   LOGIN
========================================================= */

loginForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        loginError.textContent = "";

        const email =
            document
                .getElementById("email")
                .value
                .trim();

        const password =
            document
                .getElementById("password")
                .value;


        const button =
            loginForm.querySelector(
                'button[type="submit"]'
            );


        button.disabled = true;

        button.textContent =
            "Iniciando sesión...";


        try {

            const {
                error
            } =
                await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });


            if (error) {

                loginError.textContent =
                    getAuthErrorMessage(error);

                return;

            }


            showAdminPanel();


        } catch (error) {

            console.error(error);

            loginError.textContent =
                "No se pudo iniciar sesión.";

        } finally {

            button.disabled = false;

            button.textContent =
                "Iniciar sesión";

        }

    }
);


/* =========================================================
   AUTH ERROR
========================================================= */

function getAuthErrorMessage(error) {

    if (
        error.message &&
        error.message.toLowerCase().includes(
            "invalid login credentials"
        )
    ) {

        return "Correo o contraseña incorrectos.";

    }


    return error.message ||
        "No se pudo iniciar sesión.";

}


/* =========================================================
   LOGOUT
========================================================= */

logoutButton.addEventListener(
    "click",
    async () => {

        await supabaseClient.auth.signOut();

        adminProducts = [];

        editingProductId = null;

        showLogin();

    }
);


/* =========================================================
   NAVIGATION
========================================================= */

function showView(view) {

    document
        .querySelectorAll(".admin-view")
        .forEach(section => {

            section.classList.remove("active");

        });


    const target =
        document.getElementById(
            `${view}View`
        );


    if (target) {

        target.classList.add("active");

    }


    document
        .querySelectorAll(".admin-nav")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.view === view
            );

        });


    /*
        Si vamos a agregar producto como nuevo,
        limpiamos el formulario.
    */

    if (view === "add-product" && !editingProductId) {

        resetProductForm();

    }

}


/* =========================================================
   SIDEBAR NAVIGATION
========================================================= */

document
    .querySelectorAll("[data-view]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showView(
                    button.dataset.view
                );

            }
        );

    });


/* =========================================================
   INTERNAL VIEW BUTTONS
========================================================= */

document
    .querySelectorAll("[data-view-button]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const view =
                    button.dataset.viewButton;


                /*
                    Si vamos a crear un producto nuevo,
                    limpiamos el formulario.
                */

                if (
                    view === "add-product"
                ) {

                    resetProductForm();

                }


                showView(view);

            }
        );

    });


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    try {

        /*
            Primero intentamos ordenar por created_at.
        */

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
            Si created_at no existe,
            intentamos cargar sin ordenar.
        */

        if (result.error) {

            console.warn(
                "Primer intento falló. Intentando sin created_at...",
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


        adminProducts =
            result.data || [];


        console.table(adminProducts);


        updateDashboard();

        renderAdminProducts();


    } catch (error) {

        console.error(
            "Error cargando productos:",
            error
        );


        adminProducts = [];

        updateDashboard();

        renderAdminProducts();

    }

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const total =
        adminProducts.length;


    const available =
        adminProducts.filter(
            product =>
                Number(product.stock) > 3
        ).length;


    const lowStock =
        adminProducts.filter(
            product => {

                const stock =
                    Number(product.stock);

                return (
                    stock > 0 &&
                    stock <= 3
                );

            }
        ).length;


    const outOfStock =
        adminProducts.filter(
            product =>
                Number(product.stock) <= 0
        ).length;


    document.getElementById(
        "totalProducts"
    ).textContent = total;


    document.getElementById(
        "availableProducts"
    ).textContent = available;


    document.getElementById(
        "lowStockProducts"
    ).textContent = lowStock;


    document.getElementById(
        "outOfStockProducts"
    ).textContent = outOfStock;

}


/* =========================================================
   RENDER PRODUCTS TABLE
========================================================= */

function renderAdminProducts() {

    const table =
        document.getElementById(
            "adminProductsTable"
        );


    const search =
        document
            .getElementById("adminSearch")
            .value
            .toLowerCase()
            .trim();


    const category =
        document
            .getElementById("adminCategoryFilter")
            .value;


    const filtered =
        adminProducts.filter(product => {

            const name =
                String(
                    product.name || ""
                ).toLowerCase();


            const matchesSearch =
                !search ||
                name.includes(search);


            const matchesCategory =
                !category ||
                product.category === category;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    table.innerHTML = "";


    if (!filtered.length) {

        table.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="admin-empty"
                >
                    No hay productos para mostrar.
                </td>
            </tr>
        `;

        return;

    }


    filtered.forEach(product => {

        const row =
            document.createElement("tr");


        const stock =
            Number(product.stock) || 0;


        let stockClass =
            "stock-available";

        let stockText =
            "OK";


        if (stock <= 0) {

            stockClass =
                "stock-out";

            stockText =
                "Agotado";

        } else if (stock <= 3) {

            stockClass =
                "stock-low";

            stockText =
                "Bajo";

        }


        const conditionClass =
            String(product.condition)
                .toLowerCase() === "usado"
                ? "condition-used"
                : "condition-new";


        const imageUrl =
            product.image_url ||
            "";


        const price =
            Number(product.price) || 0;


        row.innerHTML = `

            <td>

                <div class="admin-product">

                    <div class="admin-product-image">

                        ${
                            imageUrl
                                ? `
                                    <img
                                        src="${escapeHtml(imageUrl)}"
                                        alt="${escapeHtml(product.name || "Producto")}"
                                        loading="lazy"
                                    >
                                  `
                                : `
                                    <span></span>
                                  `
                        }

                    </div>


                    <div>

                        <div class="admin-product-name">
                            ${escapeHtml(product.name || "Sin nombre")}
                        </div>

                        <div class="admin-product-category">
                            ${escapeHtml(product.category || "Sin categoría")}
                        </div>

                    </div>

                </div>

            </td>


            <td>
                ${escapeHtml(product.category || "-")}
            </td>


            <td>

                <span
                    class="condition-badge ${conditionClass}"
                >
                    ${escapeHtml(product.condition || "-")}
                </span>

            </td>


            <td>
                $${price.toFixed(2)}
            </td>


            <td>

                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:8px;
                    "
                >

                    <input
                        class="stock-input"
                        type="number"
                        min="0"
                        step="1"
                        value="${stock}"
                        data-stock="${escapeHtml(String(product.id))}"
                    >

                    <span
                        class="stock-badge ${stockClass}"
                    >
                        ${stockText}
                    </span>

                </div>

            </td>


            <td>

                <div class="table-actions">

                    <button
                        type="button"
                        class="table-action"
                        data-edit="${escapeHtml(String(product.id))}"
                    >
                        Editar
                    </button>


                    <button
                        type="button"
                        class="table-action delete"
                        data-delete="${escapeHtml(String(product.id))}"
                    >
                        Eliminar
                    </button>

                </div>

            </td>

        `;


        table.appendChild(row);

    });


    bindTableEvents();

}


/* =========================================================
   TABLE EVENTS
========================================================= */

function bindTableEvents() {

    document
        .querySelectorAll("[data-delete]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteProduct(
                        button.dataset.delete
                    );

                }
            );

        });


    document
        .querySelectorAll("[data-edit]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    editProduct(
                        button.dataset.edit
                    );

                }
            );

        });


    document
        .querySelectorAll("[data-stock]")
        .forEach(input => {

            input.addEventListener(
                "change",
                () => {

                    updateStock(
                        input.dataset.stock,
                        Number(input.value)
                    );

                }
            );

        });

}


/* =========================================================
   UPDATE STOCK
========================================================= */

async function updateStock(
    id,
    stock
) {

    if (
        !Number.isFinite(stock) ||
        stock < 0
    ) {

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from("products")
            .update({
                stock
            })
            .eq(
                "id",
                id
            );


    if (error) {

        alert(
            "No se pudo actualizar el stock."
        );

        console.error(error);

        return;

    }


    await loadProducts();

}


/* =========================================================
   DELETE PRODUCT
========================================================= */

async function deleteProduct(id) {

    const product =
        adminProducts.find(
            item =>
                String(item.id) === String(id)
        );


    if (!product) return;


    const confirmed =
        confirm(
            `¿Eliminar "${product.name}"?`
        );


    if (!confirmed) return;


    try {

        const {
            error
        } =
            await supabaseClient
                .from("products")
                .delete()
                .eq(
                    "id",
                    id
                );


        if (error) {

            throw error;

        }


        /*
            Si la eliminación fue correcta,
            recargamos los productos.
        */

        await loadProducts();


    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "No se pudo eliminar el producto."
        );

    }

}


/* =========================================================
   EDIT PRODUCT
========================================================= */

function editProduct(id) {

    const product =
        adminProducts.find(
            item =>
                String(item.id) === String(id)
        );


    if (!product) return;


    editingProductId =
        product.id;


    document.getElementById(
        "productName"
    ).value =
        product.name || "";


    document.getElementById(
        "productDescription"
    ).value =
        product.description || "";


    document.getElementById(
        "productPrice"
    ).value =
        product.price || "";


    document.getElementById(
        "productStock"
    ).value =
        product.stock || 0;


    document.getElementById(
        "productCategory"
    ).value =
        product.category || "";


    document.getElementById(
        "productCondition"
    ).value =
        product.condition || "Nuevo";


    const preview =
        document.getElementById(
            "imagePreview"
        );


    if (product.image_url) {

        preview.innerHTML = `
            <img
                src="${escapeHtml(product.image_url)}"
                alt="${escapeHtml(product.name || "Producto")}"
            >
        `;

        preview.classList.add(
            "has-image"
        );

    } else {

        preview.innerHTML =
            "<span></span>";

        preview.classList.remove(
            "has-image"
        );

    }


    document.getElementById(
        "uploadName"
    ).textContent =
        "Imagen actual. Puedes seleccionar otra para reemplazarla.";


    /*
        Al editar no es obligatorio
        seleccionar una imagen nueva.
    */

    imageInput.required = false;


    document.getElementById(
        "productFormMessage"
    ).textContent = "";


    showView("add-product");

}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

imageInput.addEventListener(
    "change",
    () => {

        const file =
            imageInput.files[0];


        if (!file) return;


        /*
            Validar WebP.
        */

        const isWebP =
            file.type === "image/webp" ||
            file.name
                .toLowerCase()
                .endsWith(".webp");


        if (!isWebP) {

            alert(
                "Solo se permiten imágenes WebP."
            );

            imageInput.value = "";

            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            event => {

                const preview =
                    document.getElementById(
                        "imagePreview"
                    );


                preview.innerHTML = `

                    <img
                        src="${event.target.result}"
                        alt="Vista previa"
                    >

                `;


                preview.classList.add(
                    "has-image"
                );

            };


        reader.readAsDataURL(file);


        document.getElementById(
            "uploadName"
        ).textContent =
            file.name;

    }
);


/* =========================================================
   UPLOAD IMAGE TO SUPABASE STORAGE
========================================================= */

async function uploadImage(file) {

    if (!file) {

        throw new Error(
            "No se seleccionó ninguna imagen."
        );

    }


    const isWebP =
        file.type === "image/webp" ||
        file.name
            .toLowerCase()
            .endsWith(".webp");


    if (!isWebP) {

        throw new Error(
            "La imagen debe estar en formato WebP."
        );

    }


    const fileName =
        `${crypto.randomUUID()}.webp`;


    const filePath =
        `products/${fileName}`;


    const {
        error
    } =
        await supabaseClient
            .storage
            .from("product-images")
            .upload(
                filePath,
                file,
                {
                    cacheControl: "3600",
                    contentType: "image/webp",
                    upsert: false
                }
            );


    if (error) {

        console.error(
            "Error subiendo imagen:",
            error
        );

        throw new Error(
            `No se pudo subir la imagen: ${error.message}`
        );

    }


    const {
        data
    } =
        supabaseClient
            .storage
            .from("product-images")
            .getPublicUrl(
                filePath
            );


    if (!data?.publicUrl) {

        throw new Error(
            "No se pudo obtener la URL pública de la imagen."
        );

    }


    return data.publicUrl;

}


/* =========================================================
   SAVE PRODUCT
========================================================= */

productForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const message =
            document.getElementById(
                "productFormMessage"
            );


        const submitButton =
            productForm.querySelector(
                'button[type="submit"]'
            );


        message.className =
            "admin-form-message";


        message.textContent =
            "Guardando producto...";


        submitButton.disabled = true;


        try {

            const name =
                document
                    .getElementById("productName")
                    .value
                    .trim();


            const description =
                document
                    .getElementById("productDescription")
                    .value
                    .trim();


            const price =
                Number(
                    document
                        .getElementById("productPrice")
                        .value
                );


            const stock =
                Number(
                    document
                        .getElementById("productStock")
                        .value
                );


            const category =
                document
                    .getElementById("productCategory")
                    .value;


            const condition =
                document
                    .getElementById("productCondition")
                    .value;


            /*
                Validaciones.
            */

            if (!name) {

                throw new Error(
                    "Introduce el nombre del producto."
                );

            }


            if (!description) {

                throw new Error(
                    "Introduce una descripción."
                );

            }


            if (
                !Number.isFinite(price) ||
                price < 0
            ) {

                throw new Error(
                    "Introduce un precio válido."
                );

            }


            if (
                !Number.isInteger(stock) ||
                stock < 0
            ) {

                throw new Error(
                    "Introduce un stock válido."
                );

            }


            if (!category) {

                throw new Error(
                    "Selecciona una categoría."
                );

            }


            if (!condition) {

                throw new Error(
                    "Selecciona el estado del producto."
                );

            }


            const file =
                imageInput.files[0];


            let imageUrl =
                null;


            /*
                EDITANDO
            */

            if (editingProductId) {

                const existing =
                    adminProducts.find(
                        item =>
                            String(item.id) ===
                            String(editingProductId)
                    );


                imageUrl =
                    existing?.image_url ||
                    null;

            }


            /*
                Si hay una imagen nueva,
                la subimos a Storage.
            */

            if (file) {

                imageUrl =
                    await uploadImage(file);

            }


            /*
                Crear producto nuevo:
                la imagen es obligatoria.
            */

            if (
                !editingProductId &&
                !imageUrl
            ) {

                throw new Error(
                    "Debes seleccionar una imagen WebP."
                );

            }


            /*
                Incluso editando, si por alguna razón
                no existe una imagen anterior, exigimos una nueva.
            */

            if (!imageUrl) {

                throw new Error(
                    "El producto necesita una imagen WebP."
                );

            }


            const productData = {

                name,

                description,

                price,

                category,

                condition,

                stock,

                image_url:
                    imageUrl

            };


            let result;


            /*
                UPDATE
            */

            if (editingProductId) {

                result =
                    await supabaseClient
                        .from("products")
                        .update(
                            productData
                        )
                        .eq(
                            "id",
                            editingProductId
                        );


            /*
                INSERT
            */

            } else {

                result =
                    await supabaseClient
                        .from("products")
                        .insert(
                            productData
                        );

            }


            if (result.error) {

                throw result.error;

            }


            /*
                Éxito.
            */

            message.className =
                "admin-form-message success";


            message.textContent =
                editingProductId
                    ? "Producto actualizado correctamente."
                    : "Producto agregado correctamente.";


            await loadProducts();


            /*
                Esperamos un poco para que
                el usuario vea el mensaje.
            */

            setTimeout(
                () => {

                    resetProductForm();

                    showView("products");

                },
                900
            );


        } catch (error) {

            console.error(
                "Error guardando producto:",
                error
            );


            message.className =
                "admin-form-message error";


            message.textContent =
                error.message ||
                "Ocurrió un error al guardar el producto.";


        } finally {

            submitButton.disabled = false;

        }

    }
);


/* =========================================================
   RESET PRODUCT FORM
========================================================= */

function resetProductForm() {

    productForm.reset();


    editingProductId = null;


    /*
        Al crear un producto nuevo,
        la imagen vuelve a ser obligatoria.
    */

    imageInput.required = true;


    const preview =
        document.getElementById(
            "imagePreview"
        );


    preview.innerHTML =
        "<span></span>";


    preview.classList.remove(
        "has-image"
    );


    document.getElementById(
        "uploadName"
    ).textContent = "";


    const message =
        document.getElementById(
            "productFormMessage"
        );


    message.textContent = "";

    message.className =
        "admin-form-message";

}


/* =========================================================
   SEARCH
========================================================= */

document
    .getElementById("adminSearch")
    .addEventListener(
        "input",
        renderAdminProducts
    );


/* =========================================================
   CATEGORY FILTER
========================================================= */

document
    .getElementById("adminCategoryFilter")
    .addEventListener(
        "change",
        renderAdminProducts
    );


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
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


/* =========================================================
   START
========================================================= */

checkSession();