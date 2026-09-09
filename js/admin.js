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


/* =========================================================
   CHECK SESSION
========================================================= */

async function checkSession() {

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();


    if (session) {

        showAdminPanel();

    } else {

        showLogin();

    }

}


function showLogin() {

    loginSection.style.display = "flex";

    adminPanel.style.display = "none";

}


function showAdminPanel() {

    loginSection.style.display = "none";

    adminPanel.style.display = "flex";

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


        const {
            error
        } =
            await supabaseClient.auth.signInWithPassword({
                email,
                password
            });


        if (error) {

            loginError.textContent =
                error.message;

            return;

        }


        showAdminPanel();

    }
);


/* =========================================================
   LOGOUT
========================================================= */

document
    .getElementById("logoutButton")
    .addEventListener(
        "click",
        async () => {

            await supabaseClient.auth.signOut();

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

}


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


document
    .querySelectorAll("[data-view-button]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showView(
                    button.dataset.viewButton
                );

            }
        );

    });


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("products")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(error);

        /*
            Mientras la tabla no exista,
            el panel mostrará el error en consola.

            Después de ejecutar el SQL,
            esto empezará a cargar productos reales.
        */

        adminProducts = [];

        updateDashboard();

        renderAdminProducts();

        return;

    }


    adminProducts =
        data || [];

    updateDashboard();

    renderAdminProducts();

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const total =
        adminProducts.length;


    const available =
        adminProducts.filter(
            product => product.stock > 3
        ).length;


    const lowStock =
        adminProducts.filter(
            product =>
                product.stock > 0 &&
                product.stock <= 3
        ).length;


    const outOfStock =
        adminProducts.filter(
            product =>
                product.stock <= 0
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
   RENDER TABLE
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

            const matchesSearch =
                !search ||
                product.name
                    .toLowerCase()
                    .includes(search);


            const matchesCategory =
                !category ||
                product.category === category;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    table.innerHTML = "";


    filtered.forEach(product => {

        const row =
            document.createElement("tr");


        const stockClass =
            product.stock <= 0
                ? "stock-out"
                : product.stock <= 3
                    ? "stock-low"
                    : "stock-available";


        row.innerHTML = `

            <td>

                <div class="table-product">

                    <img
                        src="${product.image_url || ""}"
                        alt="${product.name}"
                    >

                    <strong>
                        ${product.name}
                    </strong>

                </div>

            </td>


            <td>
                ${product.category}
            </td>


            <td>
                ${product.condition}
            </td>


            <td>
                $${Number(product.price).toFixed(2)}
            </td>


            <td>

                <input
                    class="stock-input"
                    type="number"
                    min="0"
                    value="${product.stock}"
                    data-stock="${product.id}"
                >

                <span
                    class="${stockClass}"
                    style="font-size:11px;"
                >
                    ${product.stock <= 0
                        ? "Agotado"
                        : product.stock <= 3
                            ? "Bajo"
                            : "OK"}
                </span>

            </td>


            <td>

                <div class="table-actions">

                    <button
                        class="table-action"
                        data-edit="${product.id}"
                    >
                        Editar
                    </button>

                    <button
                        class="table-action delete"
                        data-delete="${product.id}"
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

    if (stock < 0) {

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
            .eq("id", id);


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
   DELETE
========================================================= */

async function deleteProduct(id) {

    const product =
        adminProducts.find(
            item => item.id === id
        );


    if (!product) return;


    const confirmed =
        confirm(
            `¿Eliminar "${product.name}"?`
        );


    if (!confirmed) return;


    const {
        error
    } =
        await supabaseClient
            .from("products")
            .delete()
            .eq("id", id);


    if (error) {

        alert(
            "No se pudo eliminar el producto."
        );

        console.error(error);

        return;

    }


    await loadProducts();

}


/* =========================================================
   EDIT PRODUCT
========================================================= */

function editProduct(id) {

    const product =
        adminProducts.find(
            item => item.id === id
        );


    if (!product) return;


    editingProductId = id;


    document.getElementById(
        "productName"
    ).value = product.name;


    document.getElementById(
        "productDescription"
    ).value = product.description;


    document.getElementById(
        "productPrice"
    ).value = product.price;


    document.getElementById(
        "productStock"
    ).value = product.stock;


    document.getElementById(
        "productCategory"
    ).value = product.category;


    document.getElementById(
        "productCondition"
    ).value = product.condition;


    const preview =
        document.getElementById(
            "imagePreview"
        );


    preview.innerHTML = `

        <img
            src="${product.image_url}"
            alt="${product.name}"
        >

    `;


    document.getElementById(
        "uploadName"
    ).textContent =
        "Imagen actual";


    showView("add-product");

}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

const imageInput =
    document.getElementById(
        "productImage"
    );


imageInput.addEventListener(
    "change",
    () => {

        const file =
            imageInput.files[0];


        if (!file) return;


        const reader =
            new FileReader();


        reader.onload =
            event => {

                document.getElementById(
                    "imagePreview"
                ).innerHTML = `

                    <img
                        src="${event.target.result}"
                        alt="Vista previa"
                    >

                `;

            };


        reader.readAsDataURL(file);


        document.getElementById(
            "uploadName"
        ).textContent =
            file.name;

    }
);


/* =========================================================
   UPLOAD IMAGE
========================================================= */

async function uploadImage(file) {

    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    const fileName =
        `${crypto.randomUUID()}.${extension}`;


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
                    upsert: false
                }
            );


    if (error) {

        throw error;

    }


    const {
        data
    } =
        supabaseClient
            .storage
            .from("product-images")
            .getPublicUrl(filePath);


    return data.publicUrl;

}


/* =========================================================
   SAVE PRODUCT
========================================================= */

document
    .getElementById("productForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const message =
                document.getElementById(
                    "productFormMessage"
                );


            message.textContent =
                "Guardando producto...";


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


                const file =
                    imageInput.files[0];


                let imageUrl = null;


                /*
                    Si estamos editando y no
                    seleccionamos una imagen nueva,
                    conservamos la existente.
                */

                if (editingProductId) {

                    const existing =
                        adminProducts.find(
                            item =>
                                item.id ===
                                editingProductId
                        );

                    imageUrl =
                        existing?.image_url ||
                        null;

                }


                if (file) {

                    imageUrl =
                        await uploadImage(file);

                }


                if (!imageUrl) {

                    throw new Error(
                        "Debes seleccionar una imagen."
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


                if (editingProductId) {

                    result =
                        await supabaseClient
                            .from("products")
                            .update(productData)
                            .eq(
                                "id",
                                editingProductId
                            );

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


                message.style.color =
                    "#248a3d";


                message.textContent =
                    editingProductId
                        ? "Producto actualizado correctamente."
                        : "Producto agregado correctamente.";


                resetProductForm();


                await loadProducts();


                setTimeout(
                    () => {

                        showView("products");

                    },
                    1000
                );


            } catch (error) {

                console.error(error);

                message.style.color =
                    "#d70015";


                message.textContent =
                    error.message ||
                    "Ocurrió un error.";

            }

        }
    );


/* =========================================================
   RESET FORM
========================================================= */

function resetProductForm() {

    document
        .getElementById("productForm")
        .reset();


    editingProductId = null;


    document.getElementById(
        "imagePreview"
    ).innerHTML = `
        <span></span>
    `;


    document.getElementById(
        "uploadName"
    ).textContent = "";


    document.getElementById(
        "productFormMessage"
    ).textContent = "";

}


/* =========================================================
   SEARCH / FILTER
========================================================= */

document
    .getElementById("adminSearch")
    .addEventListener(
        "input",
        renderAdminProducts
    );


document
    .getElementById("adminCategoryFilter")
    .addEventListener(
        "change",
        renderAdminProducts
    );


/* =========================================================
   START
========================================================= */

checkSession();
