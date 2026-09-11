/**
 * admin_2.js - Lógica del Panel de Administración
 * Integrado con Supabase JS Client v2
 */

// ==========================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN SUPABASE
// ==========================================
const SUPABASE_URL = "https://tvlabyorkrelsqxzbjth.supabase.co";
const SUPABASE_KEY = "sb_publishable_75rNY0L4KuTmPs44Z7RuIA_ggXpHe69";[cite: 3]

// Inicializar cliente de Supabase
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

if (!supabaseClient) {
    console.error("No se pudo cargar la librería SDK de Supabase.");
}

// Variables Globales de Estado
let currentProducts = [];
let selectedImageFile = null;

// ==========================================
// 2. REFERENCIAS AL DOM
// ==========================================
const DOM = {
    // Pantallas
    adminLogin: document.getElementById("adminLogin"),
    adminPanel: document.getElementById("adminPanel"),
    
    // Auth Forms
    loginForm: document.getElementById("loginForm"),
    loginEmail: document.getElementById("loginEmail"),
    loginPassword: document.getElementById("loginPassword"),
    loginButton: document.getElementById("loginButton"),
    loginError: document.getElementById("loginError"),
    loginErrorMessage: document.getElementById("loginErrorMessage"),
    togglePassword: document.getElementById("togglePassword"),
    userEmailDisplay: document.getElementById("userEmailDisplay"),
    logoutBtn: document.getElementById("logoutBtn"),

    // Dashboard Stats
    totalProductsCount: document.getElementById("totalProductsCount"),
    totalIphonesCount: document.getElementById("totalIphonesCount"),
    lowStockCount: document.getElementById("lowStockCount"),
    
    // Tabla / Búsqueda
    searchInput: document.getElementById("searchInput"),
    productsTableBody: document.getElementById("productsTableBody"),
    openCreateModalBtn: document.getElementById("openCreateModalBtn"),

    // Modal Producto
    productModal: document.getElementById("productModal"),
    productForm: document.getElementById("productForm"),
    modalTitle: document.getElementById("modalTitle"),
    closeModalBtn: document.getElementById("closeModalBtn"),
    cancelModalBtn: document.getElementById("cancelModalBtn"),
    saveProductBtn: document.getElementById("saveProductBtn"),
    modalError: document.getElementById("modalError"),
    modalErrorMessage: document.getElementById("modalErrorMessage"),

    // Form Inputs Generales
    productId: document.getElementById("productId"),
    pTitle: document.getElementById("pTitle"),
    pCategory: document.getElementById("pCategory"),
    pPrice: document.getElementById("pPrice"),
    pStock: document.getElementById("pStock"),
    pImageFile: document.getElementById("pImageFile"),
    imagePreviewContainer: document.getElementById("imagePreviewContainer"),
    imagePreview: document.getElementById("imagePreview"),
    imageFileName: document.getElementById("imageFileName"),
    pDescription: document.getElementById("pDescription"),

    // Campos iPhone
    iphoneAdminSection: document.getElementById("iphoneAdminSection"),
    pColor: document.getElementById("pColor"),
    pBattery: document.getElementById("pBattery"),
    pStorage: document.getElementById("pStorage"),
    pTrueTone: document.getElementById("pTrueTone"),
    pFaceId: document.getElementById("pFaceId"),

    // Modal Eliminar
    deleteModal: document.getElementById("deleteModal"),
    closeDeleteModalBtn: document.getElementById("closeDeleteModalBtn"),
    cancelDeleteBtn: document.getElementById("cancelDeleteBtn"),
    confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),
    deleteProductId: document.getElementById("deleteProductId")
};

// ==========================================
// 3. EVENT LISTENERS E INICIALIZACIÓN
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
    checkAuthState();
    setupEventListeners();
});

function setupEventListeners() {
    // Auth
    if (DOM.loginForm) DOM.loginForm.addEventListener("submit", handleLogin);
    if (DOM.logoutBtn) DOM.logoutBtn.addEventListener("click", handleLogout);
    if (DOM.togglePassword) DOM.togglePassword.addEventListener("click", togglePasswordVisibility);

    // Búsqueda
    if (DOM.searchInput) DOM.searchInput.addEventListener("input", filterProducts);

    // Modales abrir/cerrar
    if (DOM.openCreateModalBtn) DOM.openCreateModalBtn.addEventListener("click", () => openProductModal());
    if (DOM.closeModalBtn) DOM.closeModalBtn.addEventListener("click", closeProductModal);
    if (DOM.cancelModalBtn) DOM.cancelModalBtn.addEventListener("click", closeProductModal);
    
    if (DOM.closeDeleteModalBtn) DOM.closeDeleteModalBtn.addEventListener("click", closeDeleteModal);
    if (DOM.cancelDeleteBtn) DOM.cancelDeleteBtn.addEventListener("click", closeDeleteModal);
    if (DOM.confirmDeleteBtn) DOM.confirmDeleteBtn.addEventListener("click", executeProductDelete);

    // Form Submit
    if (DOM.productForm) DOM.productForm.addEventListener("submit", handleProductFormSubmit);

    // Control Dinámico de Visibilidad del Formulario de iPhone
    if (DOM.pCategory) {
        DOM.pCategory.addEventListener("change", (e) => {
            toggleIphoneSection(e.target.value === "iphone");
        });
    }

    // Selección de imagen .webp
    if (DOM.pImageFile) {
        DOM.pImageFile.addEventListener("change", handleImageSelection);
    }
}

// Función auxiliar para mostrar u ocultar la sección iPhone con soporte de CSS inline y clases
function toggleIphoneSection(show) {
    if (!DOM.iphoneAdminSection) return;
    if (show) {
        DOM.iphoneAdminSection.classList.remove("hidden");
        DOM.iphoneAdminSection.style.display = "block";
    } else {
        DOM.iphoneAdminSection.classList.add("hidden");
        DOM.iphoneAdminSection.style.display = "none";
    }
}

// ==========================================
// 4. AUTENTICACIÓN
// ==========================================
async function checkAuthState() {
    if (!supabaseClient) return;

    const { data: { session }, error } = await supabaseClient.auth.getSession();

    if (session && !error) {
        showPanel(session.user);
    } else {
        showLogin();
    }
}

function showLogin() {
    DOM.adminLogin.classList.remove("hidden");
    DOM.adminPanel.classList.add("hidden");
}

function showPanel(user) {
    DOM.adminLogin.classList.add("hidden");
    DOM.adminPanel.classList.remove("hidden");
    if (DOM.userEmailDisplay) DOM.userEmailDisplay.textContent = user.email;
    
    fetchProducts();
}

async function handleLogin(e) {
    e.preventDefault();
    hideAlert(DOM.loginError);

    const email = DOM.loginEmail.value.trim();
    const password = DOM.loginPassword.value.trim();

    if (!email || !password) {
        showAlert(DOM.loginError, DOM.loginErrorMessage, "Ingresa un correo y contraseña válidos.");
        return;
    }

    const originalBtnText = DOM.loginButton.innerHTML;
    DOM.loginButton.disabled = true;
    DOM.loginButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        <span>Iniciando...</span>
    `;[cite: 3]

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        showPanel(data.user);

    } catch (err) {
        console.error("Error en login:", err.message);
        showAlert(DOM.loginError, DOM.loginErrorMessage, err.message || "Credenciales inválidas.");
    } finally {
        DOM.loginButton.disabled = false;
        DOM.loginButton.innerHTML = originalBtnText;[cite: 3, 4]
    }
}

async function handleLogout() {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    showLogin();
}

function togglePasswordVisibility() {
    const type = DOM.loginPassword.getAttribute("type") === "password" ? "text" : "password";
    DOM.loginPassword.setAttribute("type", type);
    
    const icon = DOM.togglePassword.querySelector("i");
    if (icon) {
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
    }
}

// ==========================================
// 5. CRUD PRODUCTOS (SUPABASE DATABASE)
// ==========================================
async function fetchProducts() {
    DOM.productsTableBody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center loading-cell">
                <i class="fa-solid fa-spinner fa-spin"></i> Cargando inventario...
            </td>
        </tr>
    `;

    try {
        const { data, error } = await supabaseClient
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        currentProducts = data || [];
        renderProductsTable(currentProducts);
        updateStatistics(currentProducts);

    } catch (err) {
        console.error("Error cargando productos:", err);
        DOM.productsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center error-cell">
                    <i class="fa-solid fa-triangle-exclamation"></i> Error al cargar datos: ${err.message}
                </td>
            </tr>
        `;
    }
}

function renderProductsTable(products) {
    if (products.length === 0) {
        DOM.productsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center empty-cell">
                    No se encontraron productos en el inventario.
                </td>
            </tr>
        `;
        return;
    }

    DOM.productsTableBody.innerHTML = products.map(product => {
        const p = normalizeProduct(product);[cite: 3]
        const isIphone = p.category.toLowerCase() === "iphone";

        let iphoneDetailsHtml = `<span class="badge badge-gray">N/A</span>`;

        if (isIphone) {
            iphoneDetailsHtml = `
                <div class="iphone-table-details">
                    <small><b>Color:</b> ${escapeHtml(p.color || 'No especificado')}</small><br>
                    <small><b>Batería:</b> ${p.battery ? p.battery + '%' : 'N/A'}</small><br>
                    <small><b>Capacidad:</b> ${p.storage || 'N/A'}</small><br>
                    <small><b>TrueTone:</b> ${p.truetone ? 'Sí' : 'No'} | <b>FaceID:</b> ${p.faceid ? 'Sí' : 'No'}</small>
                </div>
            `;
        }

        const imageSrc = p.image_url || 'https://via.placeholder.com/60?text=No+Image';

        return `
            <tr>
                <td>
                    <img src="${imageSrc}" alt="${p.title}" class="table-img-thumb">
                </td>
                <td>
                    <strong>${escapeHtml(p.title)}</strong>
                </td>
                <td>
                    <span class="badge ${isIphone ? 'badge-apple' : 'badge-default'}">
                        ${escapeHtml(p.category)}
                    </span>
                </td>
                <td class="price-cell">
                    $${parseFloat(p.price).toFixed(2)}
                </td>
                <td>
                    <span class="stock-badge ${p.stock <= 2 ? 'stock-low' : 'stock-ok'}">
                        ${p.stock} unids
                    </span>
                </td>
                <td>${iphoneDetailsHtml}</td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn edit-btn" onclick="openProductModal('${p.id}')" title="Editar">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="openDeleteModal('${p.id}')" title="Eliminar">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function updateStatistics(products) {
    const total = products.length;
    const iphones = products.filter(p => (p.category || '').toLowerCase() === 'iphone').length;
    const lowStock = products.filter(p => Number(p.stock) <= 2).length;

    if (DOM.totalProductsCount) DOM.totalProductsCount.textContent = total;
    if (DOM.totalIphonesCount) DOM.totalIphonesCount.textContent = iphones;
    if (DOM.lowStockCount) DOM.lowStockCount.textContent = lowStock;
}

function filterProducts() {
    const query = DOM.searchInput.value.toLowerCase().trim();
    if (!query) {
        renderProductsTable(currentProducts);
        return;
    }

    const filtered = currentProducts.filter(p => {
        const title = (p.title || '').toLowerCase();
        const category = (p.category || '').toLowerCase();
        return title.includes(query) || category.includes(query);
    });

    renderProductsTable(filtered);
}

// ==========================================
// 6. GESTIÓN DE MODALES Y FORMULARIOS
// ==========================================
function openProductModal(productId = null) {
    hideAlert(DOM.modalError);
    DOM.productForm.reset();
    selectedImageFile = null;
    DOM.imagePreviewContainer.classList.add("hidden");

    if (productId) {
        // Modo Edición
        DOM.modalTitle.textContent = "Editar Producto";
        const product = currentProducts.find(p => String(p.id) === String(productId));
        
        if (product) {
            const p = normalizeProduct(product);[cite: 3]
            DOM.productId.value = p.id;
            DOM.pTitle.value = p.title;
            DOM.pCategory.value = p.category;
            DOM.pPrice.value = p.price;
            DOM.pStock.value = p.stock;
            DOM.pDescription.value = p.description;

            if (p.category === "iphone") {
                toggleIphoneSection(true);
                DOM.pColor.value = p.color || "";
                DOM.pBattery.value = p.battery || "";
                DOM.pStorage.value = p.storage || "";
                DOM.pTrueTone.checked = !!p.truetone;
                DOM.pFaceId.checked = !!p.faceid;
            } else {
                toggleIphoneSection(false);
            }

            if (p.image_url) {
                DOM.imagePreview.src = p.image_url;
                DOM.imageFileName.textContent = "Imagen existente cargada";
                DOM.imagePreviewContainer.classList.remove("hidden");
            }
        }
    } else {
        // Modo Creación
        DOM.modalTitle.textContent = "Nuevo Producto";
        DOM.productId.value = "";
        toggleIphoneSection(false);
    }

    DOM.productModal.classList.remove("hidden");
}

function closeProductModal() {
    DOM.productModal.classList.add("hidden");
}

function handleImageSelection(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "image/webp" && !file.name.toLowerCase().endsWith(".webp")) {
        showAlert(DOM.modalError, DOM.modalErrorMessage, "Formato no permitido. Por favor selecciona una imagen .webp");
        DOM.pImageFile.value = "";
        selectedImageFile = null;
        DOM.imagePreviewContainer.classList.add("hidden");
        return;
    }

    hideAlert(DOM.modalError);
    selectedImageFile = file;

    const reader = new FileReader();
    reader.onload = function (event) {
        DOM.imagePreview.src = event.target.result;
        DOM.imageFileName.textContent = file.name;
        DOM.imagePreviewContainer.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
}

// ==========================================
// 7. SUBIDA A STORAGE Y SALVADO EN DB
// ==========================================
async function uploadImage(file) {
    const fileExt = "webp";
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { data, error } = await supabaseClient
        .storage
        .from("product-images")
        .upload(filePath, file, {
            contentType: "image/webp",
            upsert: false
        });

    if (error) throw error;

    const { data: publicUrlData } = supabaseClient
        .storage
        .from("product-images")
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
}

async function handleProductFormSubmit(e) {
    e.preventDefault();
    hideAlert(DOM.modalError);

    const isEdit = Boolean(DOM.productId.value);
    const category = DOM.pCategory.value;

    if (!category) {
        showAlert(DOM.modalError, DOM.modalErrorMessage, "Debes seleccionar una categoría.");
        return;
    }

    // Preparar objeto de envío
    const productPayload = {
        title: DOM.pTitle.value.trim(),
        category: category,
        price: parseFloat(DOM.pPrice.value),
        stock: parseInt(DOM.pStock.value, 10),
        description: DOM.pDescription.value.trim()
    };

    // Mapeo dinámico si es iPhone
    if (category === "iphone") {
        productPayload.color = DOM.pColor.value.trim() || null;
        productPayload.battery = DOM.pBattery.value ? parseInt(DOM.pBattery.value, 10) : null;
        productPayload.storage = DOM.pStorage.value || null;
        productPayload.truetone = DOM.pTrueTone.checked;
        productPayload.faceid = DOM.pFaceId.checked;
    } else {
        productPayload.color = null;
        productPayload.battery = null;
        productPayload.storage = null;
        productPayload.truetone = false;
        productPayload.faceid = false;
    }

    DOM.saveProductBtn.disabled = true;
    DOM.saveProductBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando...`;

    try {
        if (selectedImageFile) {
            const uploadedUrl = await uploadImage(selectedImageFile);
            productPayload.image_url = uploadedUrl;
        }

        if (isEdit) {
            const { error } = await supabaseClient
                .from("products")
                .update(productPayload)
                .eq("id", DOM.productId.value);

            if (error) throw error;
        } else {
            if (!productPayload.image_url) {
                throw new Error("Debes cargar una imagen .webp obligatoria para un producto nuevo.");
            }

            const { error } = await supabaseClient
                .from("products")
                .insert([productPayload]);

            if (error) throw error;
        }

        closeProductModal();
        fetchProducts();

    } catch (err) {
        console.error("Error guardando el producto:", err);
        showAlert(DOM.modalError, DOM.modalErrorMessage, err.message || "No se pudo guardar el producto.");
    } finally {
        DOM.saveProductBtn.disabled = false;
        DOM.saveProductBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Guardar Producto`;
    }
}

// ==========================================
// 8. ELIMINACIÓN DE PRODUCTOS
// ==========================================
function openDeleteModal(id) {
    DOM.deleteProductId.value = id;
    DOM.deleteModal.classList.remove("hidden");
}

function closeDeleteModal() {
    DOM.deleteModal.classList.add("hidden");
}

async function executeProductDelete() {
    const id = DOM.deleteProductId.value;
    if (!id) return;

    DOM.confirmDeleteBtn.disabled = true;
    DOM.confirmDeleteBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Eliminando...`;

    try {
        const { error } = await supabaseClient
            .from("products")
            .delete()
            .eq("id", id);

        if (error) throw error;

        closeDeleteModal();
        fetchProducts();

    } catch (err) {
        console.error("Error al eliminar el producto:", err);
        alert("Error al eliminar: " + err.message);
    } finally {
        DOM.confirmDeleteBtn.disabled = false;
        DOM.confirmDeleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i> Eliminar`;
    }
}

// ==========================================
// 9. FUNCIONES DE SOPORTE / UTILS
// ==========================================
function normalizeProduct(raw) {
    return {
        id: raw.id,
        title: raw.title || "Sin título",
        category: raw.category || "otros",
        price: raw.price || 0,
        stock: raw.stock || 0,
        description: raw.description || "",
        image_url: raw.image_url || "",
        color: raw.color || "",
        battery: raw.battery,
        storage: raw.storage,
        truetone: raw.truetone,
        faceid: raw.faceid
    };
}

function showAlert(container, label, message) {
    if (label) label.textContent = message;
    if (container) container.classList.remove("hidden");
}

function hideAlert(container) {
    if (container) container.classList.add("hidden");
}

function escapeHtml(str) {
    if (typeof str !== "string") return str;
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
