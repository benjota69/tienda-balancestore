// Componente Productos, el encargado de mostrar los Productos que se comunican
// gracias a la API definida en "api.jsx".

import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { obtenerCatalogo } from "../api";
import { useCart } from "../context/CartContext";

export default function Productos({ 
  title = "Productos",
  subtitle = "",
  showFilters = true,
  showSorting = true,
  filterByCategory = null,
  filterByDiscount = false,
  limit = null,
  className = ""
}) {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Configuración de filtros y ordenamiento
  const initialCategory = filterByCategory || (searchParams.get('cat') || 'todas').toLowerCase();
  const [category, setCategory] = useState(initialCategory);
  const initialSort = (searchParams.get('sort') || 'price_desc').toLowerCase();
  const [sort, setSort] = useState(initialSort);
  
  const { addToCart } = useCart();

  // Función para normalizar productos (extraída de ambos archivos)
  function normalizeProduct(p) {
    const title = p.nombre ?? p.title ?? "Producto";
    const description = p.descripcion ?? p.description ?? "";
    
    const rawPrice = p.precio ?? p.price;
    const originalPrice = rawPrice !== undefined ? Number(rawPrice) : undefined;
    
    const discount = p.descuento ?? p.discount ?? 0;
    const discountPercent = Number(discount);
    const finalPrice = p.precioFinal ?? p.finalPrice ?? originalPrice;
    
    let image = p.imagen ?? p.image;
    if (!image && Array.isArray(p?.images) && p.images.length > 0) image = p.images[0];
    if (!image && typeof p?.image === "object" && p.image?.url) image = p.image.url;

    const category = (p.categoria ?? p.category ?? p.tipo ?? 'otros');
    const stock = p.stock ?? p.stockDisponible ?? 10;

    return { 
        id: p.id || p._id || cryptoRandomId(), 
        title, 
        description, 
        originalPrice, 
        finalPrice,
        discountPercent,
        image, 
        category, 
        stock 
    };
  }

  function cryptoRandomId() {
    try {
      return Math.random().toString(36).slice(2);
    } catch {
      return Date.now();
    }
  }

  // Cargar productos
  useEffect(() => { 
    (async () => {
      try {
        setCargando(true);
        const data = await obtenerCatalogo();
        const list = Array.isArray(data) ? data : (data.products || []);
        const normalized = list.map((raw) => normalizeProduct(raw));
        
        // Aplicar filtro de descuento si es necesario
        let filteredItems = normalized;
        if (filterByDiscount) {
          filteredItems = normalized.filter(p => p.discountPercent > 0);
        }
        
        setItems(filteredItems);
      } catch (e) {
        setError("No se pudo cargar el catálogo");
      } finally {
        setCargando(false);
      }
    })();
  }, [filterByDiscount]);

  // Calcular categorías disponibles
  const categories = useMemo(() => {
    const set = new Set(items.map(p => String(p.category || 'otros').toLowerCase()));
    return ['todas', ...Array.from(set)];
  }, [items]);

  // Fallback: si la categoría actual no existe (p.ej., query param inválido), volver a 'todas'
  useEffect(() => {
    if (categories.length && !categories.includes(category)) {
      setCategory('todas');
    }
  }, [categories, category]);

  // Filtrar por categoría
  const filteredItems = useMemo(() => {
    if (category === 'todas') return items;
    return items.filter(p => String(p.category || 'otros').toLowerCase() === category);
  }, [items, category]);

  // Ordenar productos
  const sortedItems = useMemo(() => {
    const arr = [...filteredItems];
    if (sort === 'price_desc') {
      return arr.sort((a,b) => (Number(b.finalPrice||0)) - (Number(a.finalPrice||0)));
    }
    if (sort === 'category') {
      return arr.sort((a,b) => String(a.category||'').localeCompare(String(b.category||'')));
    }
    return arr;
  }, [filteredItems, sort]);

  // Aplicar límite si se especifica
  const displayItems = useMemo(() => {
    return limit ? sortedItems.slice(0, limit) : sortedItems;
  }, [sortedItems, limit]);

  // Manejar cambios de filtros
  function handleCategoryChange(next) {
    setCategory(next);
    if (showFilters) {
      const nextParams = new URLSearchParams(searchParams);
      if (next && next !== 'todas') nextParams.set('cat', next); 
      else nextParams.delete('cat');
      setSearchParams(nextParams, { replace: true });
    }
  }

  function handleSortChange(next) {
    setSort(next);
    if (showSorting) {
      const nextParams = new URLSearchParams(searchParams);
      if (next) nextParams.set('sort', next); 
      else nextParams.delete('sort');
      setSearchParams(nextParams, { replace: true });
    }
  }

  return (
    <div className={`container-fluid ${className}`}>
      {/* Header con título y controles */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h2 className="mb-0">{title}</h2>
          {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
        </div>
        
        {(showFilters || showSorting) && (
          <div className="d-flex align-items-center gap-3">
            {showFilters && (
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="cat" className="text-muted" style={{fontSize:'.9rem'}}>Categoría</label>
                <select id="cat" className="form-select form-select-sm" style={{width:180}}
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
            )}
            
            {showSorting && (
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="sort" className="text-muted" style={{fontSize:'.9rem'}}>Ordenar</label>
                <select id="sort" className="form-select form-select-sm" style={{width:200}}
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}>
                  <option value="price_desc">Precio: mayor a menor</option>
                  <option value="category">Categoría (A-Z)</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid de productos */}
      <div className="card border-success-subtle shadow-sm">
        <div className="card-body">
          {cargando && (
            <div className="text-center py-4">
              <div className="spinner-border text-success" role="status" aria-hidden="true"></div>
              <div className="mt-2 text-muted">Cargando...</div>
            </div>
          )}

          {!cargando && error && (
            <div className="alert alert-danger mb-0" role="alert">{error}</div>
          )}

          {!cargando && !error && items.length === 0 && (
            <p className="text-muted mb-0">No hay productos.</p>
          )}

          {!cargando && !error && items.length > 0 && (
            <div className="row g-3">
              {displayItems.map((p) => (
                <div key={p.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <div className="card h-100">
                    {p.image && (
                      <Link to={`/app/catalogo/${p.id}`} className="d-block">
                        <img src={p.image} className="card-img-top" alt={p.title} 
                             style={{objectFit:'contain', height:'160px', background:'#fff'}} />
                      </Link>
                    )} 
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title" style={{minHeight:'3rem'}}>{p.title}</h5>
                      <span className="badge" style={{alignSelf:'flex-start', background:'#e9f5ec', color:'#2e7d32', border:'1px solid #cfe8d8'}}>
                        {String(p.category || 'Otros')}
                      </span>
                      {p.description && (
                        <p className="card-text text-muted" style={{fontSize:'.9rem'}}>
                          {String(p.description).substring(0,100)}
                          {String(p.description).length>100?'...':''}
                        </p>
                      )}
                      <div className="mt-auto d-flex flex-column gap-2">
                        {p.discountPercent > 0 && (
                          <div className="d-flex align-items-center gap-2">
                            <span className="text-decoration-line-through text-muted small">
                              ${Number(p.originalPrice).toLocaleString('es-CL')}
                            </span>
                            <span className="badge bg-danger small">
                              -{p.discountPercent}%
                            </span>
                          </div>
                        )}
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="fw-semibold" style={{color:'#2e7d32'}}>
                            ${Number(p.finalPrice).toLocaleString('es-CL')}
                          </span>
                          <div className="d-flex gap-2">
                            <Link
                              to={`/app/catalogo/${p.id}`}
                              className="btn btn-sm btn-success"
                            >
                              Ver detalle
                            </Link>
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-success" 
                              onClick={() => addToCart({ 
                                id: p.id, 
                                title: p.title, 
                                price: p.finalPrice, 
                                image: p.image, 
                                stock: p.stock ?? 10 
                              })}
                            >
                              Agregar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}