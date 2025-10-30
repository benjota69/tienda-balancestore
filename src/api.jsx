// Definición de la API de Catalogo.

// Catalogo
export const obtenerCatalogo = async () => {
    try {
        const resp2 = await fetch("https://demo7298405.mockable.io/api/v1/productos/all");
        if (!resp2.ok) throw Error("No se pudo obtener el catálogo");
        return await resp2.json();
    } catch (error) {
        console.log(error);
        return { total_products: 0, products: [] };
    }

};

// Buscar 1 producto por id así poder ingresar a "catalogo/{id}" y que se muestre el producto
// Correspondiente al id.
export const obtenerProductoPorId = async (id) => {
    try {
      const data = await obtenerCatalogo();
      const list = Array.isArray(data) ? data : (data.products || []);
      return list.find(p => String(p.id ?? p._id) === String(id)) || null;
    } catch (e) {
      return null;
    }
};