import { use } from "react";

export const obtenerUsuarios = async () => {

    try {
        const infoAPI = await fetch("http://demo0214519.mockable.io/api/v1/users/all")

    if(!infoAPI.ok)
        throw Error("No se encontraron usuarios");
        
        const usuarios = await infoAPI.json();

        return usuarios

    } catch (error) {
        console.log(error)
        return {total_users: 0, users: []}
    }

    

    

         
}