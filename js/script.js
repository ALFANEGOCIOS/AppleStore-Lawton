// ============================================
// APPLESTORE LAWTON
// SUPABASE CONNECTION
// ============================================

const SUPABASE_URL = "https://tvlabyorkrelsqxzbjth.supabase.co";

const SUPABASE_KEY = "sb_publishable_75rNY0L4KuTmPs44Z7RuIA_ggXpHe69";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ============================================
// COMPROBAR CONEXIÓN
// ============================================

async function testSupabaseConnection() {

    try {

        const { data, error } = await supabaseClient
            .from("products")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (error) {
            console.error("Error conectando con Supabase:", error);

            showToast(
                "Error conectando con la base de datos",
                "error"
            );

            return;
        }

        console.log("=================================");
        console.log("SUPABASE CONECTADO CORRECTAMENTE");
        console.log("=================================");

        console.log("Productos encontrados:", data);

        console.log(`Total de productos: ${data.length}`);

        showToast(
            `Supabase conectado. ${data.length} productos encontrados.`,
            "success"
        );

        return data;

    } catch (error) {

        console.error(
            "Error inesperado:",
            error
        );

        showToast(
            "No se pudo conectar con Supabase",
            "error"
        );
    }
}


// ============================================
// CARGAR PRODUCTOS
// ============================================

async function getProducts() {

    const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (error) {

        console.error(
            "Error obteniendo productos:",
            error
        );

        return [];

    }

    return data;
}


// ============================================
// TOAST
// ============================================

function showToast(message, type = "success") {

    let toast = document.getElementById("toast");

    if (!toast) {
        return;
    }

    toast.textContent = message;

    toast.className = "toast show";

    if (type === "error") {
        toast.classList.add("error");
    }

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3500);
}


// ============================================
// INICIAR
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        testSupabaseConnection();

    }
);