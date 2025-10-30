// Página PaginaBoleta, donde se llama el componente "Boleta" y muestra la generación de boleta
// Una vez hecho el pago.

import { useState, useEffect } from "react";
import Boleta from "../components/Boleta"

export default function PaginaBoleta(){
    const [datosCliente, setDatosCliente] = useState({});
    const [datosDireccion, setDatosDireccion] = useState({});
    const [metodoPago, setMetodoPago] = useState(null);
    const [datosPago, setDatosPago] = useState({});

    useEffect(() => {
        // Cargar datos del cliente y dirección desde localStorage
        const cliente = localStorage.getItem('datosCliente');
        const direccion = localStorage.getItem('datosDireccion');
        const mp = localStorage.getItem('metodoPago');
        const dp = localStorage.getItem('datosPago');
        
        if (cliente) {
            setDatosCliente(JSON.parse(cliente));
        }
        
        if (direccion) {
            setDatosDireccion(JSON.parse(direccion));
        }

        if (mp) {
            setMetodoPago(mp);
        }

        if (dp) {
            setDatosPago(JSON.parse(dp));
        } 
         
    }, []);

    return (
        <div>
            <Boleta cliente={datosCliente} 
            direccion={datosDireccion}
            metodoPago ={metodoPago}
            datosPago ={datosPago} />
        </div>
    )
}