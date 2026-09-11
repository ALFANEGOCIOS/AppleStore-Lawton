/* =========================================================
   LA TIENDA DE ULI APPLE
   ADMIN PANEL
========================================================= */


/* =========================================================
   SUPABASE
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
   ELEMENTOS
========================================================= */

const loginSection =
    document.getElementById("adminLogin");

const adminPanel =
    document.getElementById("adminPanel");

const loginForm =
    document.getElementById("loginForm");

const loginButton =
    document.getElementById("loginButton");

const loginError =
    document.getElementById("loginError");

const logoutButton =
    document.getElementById("logoutButton");

const adminProductsTable =
    document.getElementById("adminProductsTable");

const adminProductSearch =
    document.getElementById("adminProductSearch");

const adminCategoryFilter =
    document.getElementById("adminCategoryFilter");

const productForm =
    document.getElementById("productForm");

const productFormTitle =
    document.getElementById("productFormTitle");

const productName =
    document.getElementById("productName");

const productDescription =
    document.getElementById("productDescription");

const productPrice =
    document.getElementById("productPrice");

const productStock =
    document.getElementById("productStock");

const productCategory =
    document.getElementById("productCategory");

const productCondition =
    document.getElementById("productCondition");

const productImage =
    document.getElementById("productImage");

const imageUploadButton =
    document.getElementById("imageUploadButton");

const imagePreview =
    document.getElementById("imagePreview");

const uploadName =
    document.getElementById("uploadName");

const productFormMessage =
    document.getElementById("productFormMessage");

const saveProductButton =
    document.getElementById("saveProductButton");

const totalProducts =
    document.getElementById("totalProducts");

const totalStock =
    document.getElementById("totalStock");

const availableProducts =
    document.getElementById("availableProducts");

const lowStockProducts =
    document.getElementById("lowStockProducts");


/* =========================================================
   ESTADO
========================================================= */

let products = [];

let editingProductId = null;

let selectedImageFile = null; // Guardará el Blob procesado en WebP


/* =========================================================
   MAPA DE VISTAS
========================================================= */

const viewIds = {
    dashboard: "dashboardView",
    products: "productsView",
    "add-product": "addProductView"
};


/* =========================================================
   INICIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeAdmin
);


async function initializeAdmin() {

    console.log(
        "La Tienda de Uli Apple Admin iniciado."
    );

    setupNavigation();

    setupLogin();

    setupLogout();

    setupProductForm();

    setupImageUpload();

    setupProductFilters();

    await checkSession();

}


/* =========================================================
   SESIÓN
========================================================= */

async function checkSession() {

    try {

        const {
            data,
            error
        } = await supabaseClient.auth.getSession();

        if (error) {
            console.error(
                "Error comprobando sesión:",
                error
            );

            showLogin();

            return;
        }

        if (data.session) {

            console.log(
                "Sesión activa."
            );

            showAdminPanel();

        } else {

            showLogin();

        }

    } catch (error) {

        console.error(
            "Error inesperado:",
            error
        );

        showLogin();

    }

}


/* =========================================================
   LOGIN
========================================================= */

function setupLogin() {

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener(
        "submit",
        handleLogin
    );

}


async function handleLogin(event) {

    event.preventDefault();

    const email =
        document
            .getElementById("adminEmail")
            .value
            .trim();

    const password =
        document
            .getElementById("adminPassword")
            .value;

    loginError.textContent = "";

    loginButton.disabled = true;

    loginButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        <span>Iniciando...</span>
    `;

    try {

        const {
            data,
            error
        } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });


        if (error) {

            console.error(
                "Error de login:",
                error
            );

            loginError.textContent =
                getAuthErrorMessage(error);

            return;
        }


        if (!data.session) {

            loginError.textContent =
                "No se pudo iniciar la sesión.";

            return;
        }


        console.log(
            "Login correcto."
        );

        showAdminPanel();

    } catch (error) {

        console.error(
            "Error inesperado:",
            error
        );

        loginError.textContent =
            "Ocurrió un error inesperado.";

    } finally {

        loginButton.disabled = false;

        loginButton.innerHTML = `
            <span>Iniciar sesión</span>
            <i class="fa-solid fa-arrow-right"></i>
        `;

    }

}


/* =========================================================
   MENSAJES DE AUTENTICACIÓN
========================================================= */

function getAuthErrorMessage(error) {

    if (!error) {
        return "Error al iniciar sesión.";
    }

    const message =
        String(error.message || "")
            .toLowerCase();


    if (
        message.includes("invalid login credentials")
    ) {
        return "Correo o contraseña incorrectos.";
    }


    if (
        message.includes("email not confirmed")
    ) {
        return "El correo todavía no ha sido confirmado.";
    }


    if (
        message.includes("too many requests")
    ) {
        return "Demasiados intentos. Espera unos minutos.";
    }


    return (
        error.message ||
        "No se pudo iniciar sesión."
    );

}


/* =========================================================
   MOSTRAR LOGIN
========================================================= */

function showLogin() {

    if (loginSection) {
        loginSection.style.display = "flex";
    }

    if (adminPanel) {
        adminPanel.style.display = "none";
    }

}


/* =========================================================
   MOSTRAR PANEL
========================================================= */

function showAdminPanel() {

    if (loginSection) {
        loginSection.style.display = "none";
    }

    if (adminPanel) {

        adminPanel.style.removeProperty(
            "display"
        );

    }


    loadProducts();

    showView("dashboard");

}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener(
        "click",
        handleLogout
    );

}


async function handleLogout() {

    try {

        await supabaseClient.auth.signOut();

    } catch (error) {

        console.error(
            "Error cerrando sesión:",
            error
        );

    }

    products = [];

    editingProductId = null;

    selectedImageFile = null;

    showLogin();

}


/* =========================================================
   NAVEGACIÓN
========================================================= */

function setupNavigation() {

    const buttons =
        document.querySelectorAll(
            "[data-view-button]"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const view =
                    button.dataset.viewButton;

                if (
                    view === "add-product" &&
                    !editingProductId
                ) {
                    resetProductForm();
                }

                showView(view);

            }
        );

    });

}


/* =========================================================
   CAMBIAR VISTA
========================================================= */

function showView(view) {

    const targetId =
        viewIds[view];


    if (!targetId) {

        console.error(
            "Vista desconocida:",
            view
        );

        return;
    }


    const target =
        document.getElementById(targetId);


    if (!target) {

        console.error(
            "No existe el elemento:",
            targetId
        );

        return;
    }


    const views =
        document.querySelectorAll(
            ".admin-view"
        );


    views.forEach(item => {

        item.classList.remove(
            "active"
        );

    });


    target.classList.add(
        "active"
    );


    const navButtons =
        document.querySelectorAll(
            "[data-view-button]"
        );


    navButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.viewButton === view
        );

    });


    if (
        view === "add-product" &&
        productFormTitle
    ) {

        productFormTitle.textContent =
            editingProductId
                ? "Editar producto"
                : "Agregar producto";

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   CARGAR PRODUCTOS
========================================================= */

async function loadProducts() {

    if (!adminProductsTable) {
        return;
    }


    adminProductsTable.innerHTML = `
        <tr>
            <td
                colspan="6"
                class="admin-table-loading"
            >
                <i class="fa-solid fa-spinner fa-spin"></i>
                Cargando productos...
            </td>
        </tr>
    `;


    try {

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


        if (response.error) {

            console.warn(
                "Consulta con created_at falló. Reintentando...",
                response.error
            );


            response =
                await supabaseClient
                    .from("products")
                    .select("*");

        }


        if (response.error) {

            console.error(
                "Error cargando productos:",
                response.error
            );

            showTableError(
                response.error
            );

            return;
        }


        products =
            (response.data || [])
                .map(normalizeProduct);


        console.log(
            "Productos cargados:",
            products
        );


        renderProducts();

        updateDashboard();


    } catch (error) {

        console.error(
            "Error inesperado cargando productos:",
            error
        );

        showTableError(error);

    }

}


/* =========================================================
   NORMALIZAR PRODUCTO
========================================================= */

function normalizeProduct(product) {

    return {

        id:
            product.id,

        name:
            product.name ??
            product.product_name ??
            "Sin nombre",

        description:
            product.description ??
            "",

        price:
            Number(
                product.price ?? 0
            ),

        currency:
            product.currency ??
            "USD",

        category:
            product.category ??
            "Otros",

        condition:
            product.condition ??
            "Nuevo",

        stock:
            Number(
                product.stock ?? 0
            ),

        image_url:
            product.image_url ??
            product.image ??
            "",

        created_at:
            product.created_at ??
            null

    };

}


/* =========================================================
   RENDER PRODUCTOS
========================================================= */

function renderProducts() {

    if (!adminProductsTable) {
        return;
    }


    const search =
        (
            adminProductSearch?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const category =
        adminCategoryFilter?.value ||
        "all";


    const filtered =
        products.filter(product => {

            const matchesSearch =
                !search ||
                product.name
                    .toLowerCase()
                    .includes(search) ||
                product.description
                    .toLowerCase()
                    .includes(search);


            const matchesCategory =
                category === "all" ||
                product.category === category;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    if (filtered.length === 0) {

        adminProductsTable.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="admin-table-empty"
                >
                    <i class="fa-regular fa-folder-open"></i>
                    <br><br>
                    No hay productos que mostrar.
                </td>
            </tr>
        `;

        return;
    }


    adminProductsTable.innerHTML =
        filtered
            .map(renderProductRow)
            .join("");

}


/* =========================================================
   FILA DE PRODUCTO
========================================================= */

function renderProductRow(product) {

    const image =
        product.image_url
            ? `
                <img
                    src="${escapeHtml(product.image_url)}"
                    alt="${escapeHtml(product.name)}"
                    loading="lazy"
                    onerror="this.style.display='none'"
                >
            `
            : `
                <div
                    style="
                        width:100%;
                        height:100%;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        color:#b7b7bc;
                    "
                >
                    <i class="fa-regular fa-image"></i>
                </div>
            `;


    const conditionClass =
        product.condition === "Usado"
            ? "used"
            : "new";


    return `
        <tr>

            <td>

                <div class="admin-product">

                    <div class="admin-product-image">
                        ${image}
                    </div>

                    <div>

                        <div class="admin-product-name">
                            ${escapeHtml(product.name)}
                        </div>

                        <div class="admin-product-category">
                            ${escapeHtml(product.category)}
                        </div>

                    </div>

                </div>

            </td>


            <td>
                ${escapeHtml(product.category)}
            </td>


            <td>
                ${formatPrice(
                    product.price,
                    product.currency
                )}
            </td>


            <td>

                <span
                    class="condition-badge ${conditionClass}"
                >
                    ${escapeHtml(product.condition)}
                </span>

            </td>


            <td>

                <input
                    type="number"
                    class="stock-input"
                    value="${product.stock}"
                    min="0"
                    step="1"
                    data-stock-id="${escapeHtml(String(product.id))}"
                    aria-label="Stock de ${escapeHtml(product.name)}"
                >

            </td>


            <td>

                <div class="table-actions">

                    <button
                        type="button"
                        class="table-action"
                        data-edit-id="${escapeHtml(String(product.id))}"
                    >
                        <i class="fa-solid fa-pen"></i>
                        Editar
                    </button>


                    <button
                        type="button"
                        class="table-action delete"
                        data-delete-id="${escapeHtml(String(product.id))}"
                    >
                        <i class="fa-solid fa-trash"></i>
                        Eliminar
                    </button>

                </div>

            </td>

        </tr>
    `;

}


/* =========================================================
   EVENTOS DE TABLA
========================================================= */

document.addEventListener(
    "click",
    event => {

        const editButton =
            event.target.closest(
                "[data-edit-id]"
            );


        if (editButton) {

            editProduct(
                editButton.dataset.editId
            );

            return;
        }


        const deleteButton =
            event.target.closest(
                "[data-delete-id]"
            );


        if (deleteButton) {

            deleteProduct(
                deleteButton.dataset.deleteId
            );

            return;
        }

    }
);


document.addEventListener(
    "change",
    event => {

        const stockInput =
            event.target.closest(
                "[data-stock-id]"
            );


        if (!stockInput) {
            return;
        }


        updateStock(
            stockInput.dataset.stockId,
            stockInput.value
        );

    }
);


/* =========================================================
   ACTUALIZAR STOCK
========================================================= */

async function updateStock(
    productId,
    value
) {

    const stock =
        Math.max(
            0,
            parseInt(value, 10) || 0
        );


    try {

        const {
            error
        } = await supabaseClient
            .from("products")
            .update({
                stock
            })
            .eq(
                "id",
                productId
            );


        if (error) {

            console.error(
                "Error actualizando stock:",
                error
            );

            alert(
                "No se pudo actualizar el stock."
            );

            return;
        }


        const product =
            products.find(
                item =>
                    String(item.id) ===
                    String(productId)
            );


        if (product) {
            product.stock = stock;
        }


        updateDashboard();


    } catch (error) {

        console.error(
            "Error inesperado:",
            error
        );

    }

}


/* =========================================================
   EDITAR PRODUCTO
========================================================= */

function editProduct(productId) {

    const product =
        products.find(
            item =>
                String(item.id) ===
                String(productId)
        );


    if (!product) {

        console.error(
            "Producto no encontrado:",
            productId
        );

        return;
    }


    editingProductId =
        product.id;


    selectedImageFile =
        null;


    productName.value =
        product.name || "";


    productDescription.value =
        product.description || "";


    productPrice.value =
        product.price || "";


    productStock.value =
        product.stock || 0;


    productCategory.value =
        product.category || "";


    productCondition.value =
        product.condition || "Nuevo";


    productFormMessage.textContent = "";

    productFormMessage.className =
        "admin-form-message";


    if (product.image_url) {

        imagePreview.innerHTML = `
            <img
                src="${escapeHtml(product.image_url)}"
                alt="${escapeHtml(product.name)}"
            >
        `;

        uploadName.textContent =
            "Imagen actual. Puedes seleccionar otra.";

    } else {

        showImagePlaceholder();

    }


    productImage.required = false;


    if (productFormTitle) {
        productFormTitle.textContent =
            "Editar producto";
    }


    saveProductButton.innerHTML = `
        <i class="fa-solid fa-floppy-disk"></i>
        Actualizar producto
    `;


    showView("add-product");

}


/* =========================================================
   ELIMINAR PRODUCTO
========================================================= */

async function deleteProduct(productId) {

    const product =
        products.find(
            item =>
                String(item.id) ===
                String(productId)
        );


    if (!product) {
        return;
    }


    const confirmed =
        window.confirm(
            `¿Eliminar "${product.name}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } = await supabaseClient
            .from("products")
            .delete()
            .eq(
                "id",
                productId
            );


        if (error) {

            console.error(
                "Error eliminando producto:",
                error
            );

            alert(
                "No se pudo eliminar el producto."
            );

            return;
        }


        products =
            products.filter(
                item =>
                    String(item.id) !==
                    String(productId)
            );


        renderProducts();

        updateDashboard();


    } catch (error) {

        console.error(
            "Error inesperado:",
            error
        );

    }

}


/* =========================================================
   FORMULARIO
========================================================= */

function setupProductForm() {

    if (!productForm) {
        return;
    }


    productForm.addEventListener(
        "submit",
        handleProductSubmit
    );

}


async function handleProductSubmit(event) {

    event.preventDefault();


    productFormMessage.textContent = "";

    productFormMessage.className =
        "admin-form-message";


    const name =
        productName.value.trim();

    const description =
        productDescription.value.trim();

    const price =
        Number(productPrice.value);

    const stock =
        Math.max(
            0,
            parseInt(
                productStock.value,
                10
            ) || 0
        );

    const category =
        productCategory.value;

    const condition =
        productCondition.value;


    if (!name) {

        showFormMessage(
            "Escribe el nombre del producto.",
            "error"
        );

        return;
    }


    if (
        Number.isNaN(price) ||
        price < 0
    ) {

        showFormMessage(
            "Introduce un precio válido.",
            "error"
        );

        return;
    }


    if (!category) {

        showFormMessage(
            "Selecciona una categoría.",
            "error"
        );

        return;
    }


    if (
        !editingProductId &&
        !selectedImageFile
    ) {

        showFormMessage(
            "Selecciona una imagen para el producto.",
            "error"
        );

        return;
    }


    saveProductButton.disabled = true;

    saveProductButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Guardando y subiendo imagen...
    `;


    try {

        let imageUrl = null;


        if (editingProductId) {

            const existingProduct =
                products.find(
                    item =>
                        String(item.id) ===
                        String(editingProductId)
                );


            imageUrl =
                existingProduct?.image_url ||
                null;

        }


        if (selectedImageFile) {

            imageUrl =
                await uploadImage(
                    selectedImageFile
                );

        }


        const productData = {

            name,

            description,

            price,

            currency: "USD",

            category,

            condition,

            stock,

            image_url: imageUrl

        };


        let response;


        if (editingProductId) {

            response =
                await supabaseClient
                    .from("products")
                    .update(productData)
                    .eq(
                        "id",
                        editingProductId
                    )
                    .select()
                    .single();

        } else {

            response =
                await supabaseClient
                    .from("products")
                    .insert(
                        productData
                    )
                    .select()
                    .single();

        }


        if (response.error) {

            console.error(
                "Error guardando producto:",
                response.error
            );

            throw response.error;
        }


        showFormMessage(
            editingProductId
                ? "Producto actualizado correctamente."
                : "Producto agregado correctamente.",
            "success"
        );


        await loadProducts();


        setTimeout(
            () => {

                resetProductForm();

                showView("products");

            },
            700
        );


    } catch (error) {

        console.error(
            "Error guardando producto:",
            error
        );


        showFormMessage(
            error.message ||
            "No se pudo guardar el producto.",
            "error"
        );


        saveProductButton.disabled = false;

        saveProductButton.innerHTML = `
            <i class="fa-solid fa-check"></i>
            ${editingProductId
                ? "Actualizar producto"
                : "Guardar producto"
            }
        `;

    }

}


/* =========================================================
   CONVERSIÓN DE IMAGEN A WEBP (CANVAS API)
========================================================= */

function convertImageToWebP(file, quality = 0.85) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = event => {

            const img = new Image();

            img.onload = () => {

                const canvas = document.createElement("canvas");

                canvas.width = img.width;

                canvas.height = img.height;

                const ctx = canvas.getContext("2d");

                ctx.drawImage(img, 0, 0);

                canvas.toBlob(
                    blob => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error("No se pudo convertir la imagen a WebP."));
                        }
                    },
                    "image/webp",
                    quality
                );

            };

            img.onerror = error => reject(error);

            img.src = event.target.result;

        };

        reader.onerror = error => reject(error);

        reader.readAsDataURL(file);

    });

}


/* =========================================================
   SUBIR IMAGEN A SUPABASE
========================================================= */

async function uploadImage(fileBlob) {

    if (!fileBlob) {
        throw new Error(
            "No se seleccionó ninguna imagen."
        );
    }


    const fileName =
        `${crypto.randomUUID()}.webp`;


    const filePath =
        `products/${fileName}`;


    console.log(
        "Subiendo imagen WebP procesada:",
        filePath
    );


    const {
        error: uploadError
    } = await supabaseClient
        .storage
        .from("product-images")
        .upload(
            filePath,
            fileBlob,
            {
                cacheControl: "3600",
                upsert: false,
                contentType: "image/webp"
            }
        );


    if (uploadError) {

        console.error(
            "Error subiendo imagen:",
            uploadError
        );

        throw uploadError;
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
   IMAGE UPLOAD UI
========================================================= */

function setupImageUpload() {

    if (
        !imageUploadButton ||
        !productImage
    ) {
        return;
    }


    imageUploadButton.addEventListener(
        "click",
        () => {

            productImage.click();

        }
    );


    productImage.addEventListener(
        "change",
        handleImageSelection
    );

}


async function handleImageSelection(event) {

    const file =
        event.target.files?.[0];


    if (!file) {
        return;
    }


    if (!file.type.startsWith("image/")) {

        showFormMessage(
            "El archivo seleccionado no es una imagen válida.",
            "error"
        );

        productImage.value = "";

        return;
    }


    try {

        uploadName.textContent = "Procesando imagen a WebP...";

        imagePreview.innerHTML = `
            <div class="image-preview-placeholder">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Procesando e imágen...</span>
            </div>
        `;


        // Convertir cualquier formato (PNG, JPG, etc.) a WebP
        const webpBlob = await convertImageToWebP(file, 0.85);


        selectedImageFile = webpBlob;


        const formattedName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

        uploadName.textContent = `${formattedName}.webp (Convertida con éxito)`;


        // Vista previa desde el objeto WebP generado
        const previewUrl = URL.createObjectURL(webpBlob);

        imagePreview.innerHTML = `
            <img
                src="${previewUrl}"
                alt="Vista previa"
            >
        `;


    } catch (error) {

        console.error("Error convirtiendo la imagen:", error);

        showFormMessage(
            "Error al procesar la imagen seleccionada.",
            "error"
        );

        showImagePlaceholder();

    }

}


/* =========================================================
   RESET FORM
========================================================= */

function resetProductForm() {

    editingProductId = null;

    selectedImageFile = null;


    productForm.reset();


    productCondition.value =
        "Nuevo";


    productImage.value =
        "";


    productImage.required =
        true;


    showImagePlaceholder();


    uploadName.textContent =
        "Soporta JPG, PNG, WebP (se convertirá a WebP automáticamente)";


    productFormMessage.textContent = "";

    productFormMessage.className =
        "admin-form-message";


    if (productFormTitle) {

        productFormTitle.textContent =
            "Agregar producto";

    }


    if (saveProductButton) {

        saveProductButton.disabled =
            false;

        saveProductButton.innerHTML = `
            <i class="fa-solid fa-check"></i>
            Guardar producto
        `;

    }

}


/* =========================================================
   PLACEHOLDER IMAGEN
========================================================= */

function showImagePlaceholder() {

    imagePreview.innerHTML = `
        <div class="image-preview-placeholder">

            <i class="fa-regular fa-image"></i>

            <span>
                Selecciona una imagen
            </span>

        </div>
    `;

}


/* =========================================================
   MENSAJE FORMULARIO
========================================================= */

function showFormMessage(
    message,
    type
) {

    productFormMessage.textContent =
        message;

    productFormMessage.className =
        `admin-form-message ${type}`;

}


/* =========================================================
   FILTROS
========================================================= */

function setupProductFilters() {

    if (adminProductSearch) {

        adminProductSearch.addEventListener(
            "input",
            renderProducts
        );

    }


    if (adminCategoryFilter) {

        adminCategoryFilter.addEventListener(
            "change",
            renderProducts
        );

    }

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const total =
        products.length;


    const stock =
        products.reduce(
            (
                total,
                product
            ) =>
                total +
                Number(product.stock || 0),
            0
        );


    const available =
        products.filter(
            product =>
                Number(product.stock) > 0
        ).length;


    const lowStock =
        products.filter(
            product =>
                Number(product.stock) > 0 &&
                Number(product.stock) <= 2
        ).length;


    if (totalProducts) {
        totalProducts.textContent =
            total;
    }


    if (totalStock) {
        totalStock.textContent =
            stock;
    }


    if (availableProducts) {
        availableProducts.textContent =
            available;
    }


    if (lowStockProducts) {
        lowStockProducts.textContent =
            lowStock;
    }

}


/* =========================================================
   TABLA ERROR
========================================================= */

function showTableError(error) {

    if (!adminProductsTable) {
        return;
    }


    adminProductsTable.innerHTML = `
        <tr>
            <td
                colspan="6"
                class="admin-table-error"
            >
                <i class="fa-solid fa-triangle-exclamation"></i>

                <br><br>

                No se pudieron cargar los productos.

                <br><br>

                <small>
                    ${escapeHtml(
                        error?.message ||
                        "Error desconocido"
                    )}
                </small>
            </td>
        </tr>
    `;

}


/* =========================================================
   FORMATO PRECIO
========================================================= */

function formatPrice(
    price,
    currency = "USD"
) {

    const symbols = {
        USD: "$",
        CUP: "CUP ",
        EUR: "€"
    };


    const symbol =
        symbols[currency] ||
        "$";


    const number =
        Number(price || 0);


    if (currency === "CUP") {

        return (
            symbol +
            new Intl.NumberFormat(
                "es-ES",
                {
                    maximumFractionDigits: 0
                }
            ).format(number)
        );

    }


    return (
        symbol +
        new Intl.NumberFormat(
            "en-US",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ).format(number)
    );

}


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
