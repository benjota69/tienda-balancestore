// Página Checkout con datos personales del cliente y llamando el componente "MetodoPago"
// Para poder ingresar una tarjeta o pagar con transferencia.

import { useState } from "react";
import { useCart } from "../context/CartContext";
import { Navigate, useNavigate } from "react-router-dom";
import MetodoPago from "../components/MetodoPago"
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function Checkout() {
    
    const navigate = useNavigate();

    const { items, increase, decrease, removeFromCart, clearCart, total } = useCart();
    const [form, setForm] = useState({ nombre:"", apellidos:"", correo:"", calle:"", depto:"", region:"", comuna:"", indicaciones:"" });
    const [mensaje, setMensaje] = useState("");
    const [metodoPago, setMetodoPago] = useState(null);
    const [datosPago, setDatosPago] = useState({});

    // Llamamos el Login (Autenticador)
    const { user } = useAuth();

    const formatoNombre = (full) => {
      if (!full) return { nombre: "", apellidos: "" };
      const [nombre, ...rest] = full.trim().split(/\s+/);
      return { nombre: nombre || "", apellidos: rest.join(" ") || "" };
    };

    useEffect(() => {
      if (!user) return;
      const { nombre, apellidos } = user.nombreCompleto
        ? formatoNombre(user.nombreCompleto)
        : { nombre: user.username || "", apellidos: "" };
  
      setForm((f) => ({
        ...f,
        nombre,
        apellidos,
        correo: user.email || f.correo
      }));
    }, [user]);

    // Manejar datos del método de pago
    const handleMetodoPago = (metodo, datos) => {
        setMetodoPago(metodo);
        setDatosPago(datos);
    };

    // Validación 
    const handlePago = () => {
        if (!form.nombre || !form.apellidos || !form.correo || !form.calle || !form.region || !form.comuna) {
            setMensaje("Por favor completa todos los campos obligatorios");
            return;
        }
        
        // Validar método de pago
        if (!metodoPago) {
            setMensaje("Por favor selecciona un método de pago");
            return;
        }
        
        if (metodoPago === 'debito' || metodoPago === 'credito') {
            if (!datosPago.numeroTarjeta || !datosPago.nombreTarjeta || !datosPago.vencimientoTarjeta || !datosPago.cvvTarjeta) {
                setMensaje("Por favor completa todos los datos de la tarjeta");
                return;
            }
        }
        
        // Guardar datos para la boleta
        localStorage.setItem('datosCliente', JSON.stringify({
            nombre: form.nombre,
            apellidos: form.apellidos,
            correo: form.correo
        }));
        
        localStorage.setItem('datosDireccion', JSON.stringify({
            calle: form.calle,
            depto: form.depto,
            region: form.region,
            comuna: form.comuna,
            indicaciones: form.indicaciones
        }));

        // Guarda el método elegido al pagar y detalles
        localStorage.setItem('metodoPago', metodoPago);
        localStorage.setItem('datosPago', JSON.stringify(datosPago));
        
        navigate('/app/boleta');
    };

    // Regiones y comunas básicas (demostración)
    const regiones = [
        { value: "rm", label: "Región Metropolitana de Santiago" },
        { value: "v", label: "Valparaíso" },
        { value: "biobio", label: "Biobío" }
    ];
    const comunasPorRegion = {
        rm: ["Cerrillos", "Providencia", "Colina", "Lampa", "Pirque", "Puente Alto", "Paine", "Curacaví", "Cerro Navia"],
        v: ["Valparaíso", "Viña del Mar", "Quilpué", "Quillota", "La Calera", "La Cruz"],
        biobio: ["Concepción", "Talcahuano", "San Pedro de la Paz", "Los Álamos", "Penco", "Hualpén"],
    };

    return (
      <>
      
        <div className="container-fluid">
      

              <h1 style={{color: '#1b5e20'}}>Checkout</h1>
              <p>Siguiente paso del pago, método de pago y dirección de envío.</p>
              <hr></hr>      
            {/* Información del cliente */}
            <h4 className="mt-4">Información del cliente</h4>
            <p className="text-muted" style={{marginTop:-6}}>Completa la siguiente información</p>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Nombre *</label>
                <input className="form-control" value={form.nombre} onChange={e=>setForm(f=>({...f, nombre:e.target.value}))} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Apellidos *</label>
                <input className="form-control" value={form.apellidos} onChange={e=>setForm(f=>({...f, apellidos:e.target.value}))} />
              </div>
              <div className="col-md-12">
                <label className="form-label">Correo *</label>
                <input type="email" className="form-control" value={form.correo} onChange={e=>setForm(f=>({...f, correo:e.target.value}))} />
                <hr></hr>
              </div>
            </div>
      
            {/* Dirección de entrega */}
            <h4>Dirección de entrega de los productos</h4>
            <p className="text-muted" style={{marginTop:-6}}>Ingrese dirección de forma detallada</p>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Dirección 1 *</label>
                <input className="form-control" value={form.calle} onChange={e=>setForm(f=>({...f, calle:e.target.value}))} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Número (opcional)</label>
                <input className="form-control" value={form.depto} onChange={e=>setForm(f=>({...f, depto:e.target.value}))} placeholder="Ej: 603" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Región *</label>
                <select className="form-select" value={form.region} onChange={e=>setForm(f=>({ ...f, region:e.target.value, comuna:"" }))}>
                  <option value="">Selecciona región</option>
                  {regiones.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Comuna *</label>
                <select className="form-select" value={form.comuna} onChange={e=>setForm(f=>({...f, comuna:e.target.value}))} disabled={!form.region}>
                  <option value="">Selecciona comuna</option>
                  {(comunasPorRegion[form.region] || []).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Indicaciones para la entrega (opcional)</label>
                <textarea className="form-control" rows={3} value={form.indicaciones} onChange={e=>setForm(f=>({...f, indicaciones:e.target.value}))} placeholder="Ej.: Vehículo gris afuera de la casa."></textarea>
                <hr></hr>
              </div>
            </div>
                <h4>Método de pago</h4>
            <div>
              <MetodoPago onChange={handleMetodoPago} />
            
            </div>
          
            <div className="d-flex justify-content-end gap-2 mb-2">
            <button type="button" className="btn btn-success" onClick={handlePago}>
                Hacer el pago ${Number(total).toLocaleString('es-CL')}
            </button>
            </div>
          
            {mensaje && <div className="alert alert-warning mb-4">{mensaje}</div>}
          </div>
      
      </>
        
      );
}