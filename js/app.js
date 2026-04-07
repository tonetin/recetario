import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.6/+esm";

const supabase = createClient(
    "https://rdkimdzkeojokgszkiih.supabase.co",
    "sb_publishable_T-Y72XdxyHIg8Io5fhUpLg_q1SCjTLE"
);

const ORD_ANTIGUAS = 0,
      ORD_NUEVAS = 1,
      ORD_TITULO = 2;

const ORDER = [
    {
        texto_div: "Primero las mas antiguas",
        codigo: `'id', { ascending: false }`,
    },
    { texto_div: "Primero las mas recientes", codigo: `'id'` },
    { texto_div: "Alfabéticamente por el título", codigo: `'titulo'` },
];

const RECETAS_POR_PAGINA = 12,
      LIMITE_RECETAS = 100


const PAGINA_SIGUIENTE = 1, 
      PAGINA_ANTERIOR = -1,
      MISMA_PAGINA = 0

const idListaRecetas = 0,
      tituloListaRecetas = 1


var globalRespuesta



const modalReceta = document.getElementById("modal-receta");
const formReceta = document.getElementById("form-receta");
const closeModalReceta = document.getElementById("closeRegisterModal");
const buttonCloseModalReceta = document.getElementById("botonSalirReceta");
const textAreaReceta = document.getElementById("textAreaReceta");
const buttonSaveModalReceta = document.getElementById("botonGuardarReceta");

const buttonCambioFiltroOrden = document.getElementById("btCambioFiltroOrden");
const modalCambioFiltroOrden = document.getElementById("modalFiltroOrden");
const buttonSalirModalFiltroOrden = document.getElementById(
    "botonSalirModalFiltroOrden"
);
const buttonAplicarFiltroOrden = document.getElementById(
    "botonAplicarFiltroOrden"
);
const iconCloseModelFiltroOrden = document.getElementById(
    "closeModalFiltroOrden"
);
const buttonBorrarFiltros = document.getElementById("botonBorrarFiltros");


const dbSelect = async (filtro, orden, filtroPagina = MISMA_PAGINA) => {
    let query = supabase.from("Recetas").select("id, titulo");

    if (filtro.length > 0) {
        let orText1 = `${campoToDb(filtro[0].campo)}.ilike.%${filtro[0].palabra}%`
        if (filtro.length > 1) { 
            let orText2 = `${campoToDb(filtro[2].campo)}.ilike.%${filtro[2].palabra}%`
            if (filtro[1] == "o") {
                let orQuery = orText1 + ", " + orText2
                query = query.or(orQuery)
            } else {
                query = query.ilike(campoToDb(filtro[0].campo), '%' + filtro[0].palabra + '%')
                query = query.ilike(campoToDb(filtro[2].campo), '%' + filtro[2].palabra + '%')     
            }
        } else {
            // query = query.ilike(`${campoToDb(filtro[0].campo)}`, `'%${filtro[0].palabra}%'`)
            query = query.ilike(campoToDb(filtro[0].campo), '%' + filtro[0].palabra + '%')
        }
    } 
    
    // if (filtroPagina != MISMA_PAGINA) {
    //     switch (orden) {
    //         case ORD_ANTIGUAS:
    //             query = (filtroPagina == PAGINA_ANTERIOR) ? (query.gt('id', primerId)) : (query.lt('id', ultimoId))
    //             break
    //         case ORD_NUEVAS:
    //             query = (filtroPagina == PAGINA_ANTERIOR) ? (query.lt('id', primerId)) : (query.gt('id', ultimoId))
    //         case ORD_TITULO:
    //             query = (filtroPagina == PAGINA_ANTERIOR) ? (query.lt('titulo', primerTitulo)) : (query.gt('titulo', ultimoTitulo))
    //     }
    // }


    // query = query.textSearch("titulo", `carn`);
    // query = query.textSearch('titulo', 'crep')

    // query = query.or('titulo.ilike."%acelga%"')
    // query = query.or('titulo.ilike."%judia%"')
    switch (orden) {    
        case 0: 
            query = query.order('id', { ascending: false }) 
            break
        case 1: 
            query = query.order('id')   
            break  
        case 2: 
            query = query.order('titulo')   
            break
    }

    query = query.limit(LIMITE_RECETAS);

    try {
        const { data, error } = await query;
        return data;
    } catch {
        return error;
    }
};


const dbSelectCount = async (filtro, filtroPagina = MISMA_PAGINA) => {
    let query = supabase.from("Recetas").select("*", { count: "exact", head: true });

    if (filtro.length > 0) {
        let orText1 = `${campoToDb(filtro[0].campo)}.ilike.%${filtro[0].palabra}%`
        if (filtro.length > 1) { 
            let orText2 = `${campoToDb(filtro[2].campo)}.ilike.%${filtro[2].palabra}%`
            if (filtro[1] == "o") {
                let orQuery = orText1 + ", " + orText2
                query = query.or(orQuery)
            } else {
                query = query.ilike(campoToDb(filtro[0].campo), '%' + filtro[0].palabra + '%')
                query = query.ilike(campoToDb(filtro[2].campo), '%' + filtro[2].palabra + '%')   
            }
        } else {
            query = query.ilike(campoToDb(filtro[0].campo), '%' + filtro[0].palabra + '%')
        }
    } 
    // if (filtroPagina != MISMA_PAGINA) {
    //     switch (orden) {
    //         case ORD_ANTIGUAS:
    //             query = (filtroPagina == PAGINA_ANTERIOR) ? (query.gt('id', primerId)) : (query.lt('id', ultimoId))
    //             break
    //         case ORD_NUEVAS:
    //             query = (filtroPagina == PAGINA_ANTERIOR) ? (query.lt('id', primerId)) : (query.gt('id', ultimoId))
    //             break
    //         case ORD_TITULO:
    //             query = (filtroPagina == PAGINA_ANTERIOR) ? (query.lt('titulo', primerTitulo)) : (query.gt('titulo', ultimoTitulo))
    //             break
    //     }
    // }

    try {
        const { count, error } = await query
            // .from("Recetas")
            // .select("*", { count: "exact", head: true });
        return count;
    } catch {
        return error;
    }
};


const dbSelectReceta = async (idReceta) => {
    try {
        const { data, error } = await supabase
            .from("Recetas")
            .select("id, titulo, receta, credito")
            .eq("id", idReceta);
        return data;
    } catch {
        return error;
    }
};


var filtro = []
var filtroTxt = "";
var orden = ORD_NUEVAS;

var pagina = 1

var ultimoId = ""
var ultimoTitulo = ""
var primerId = ""
var primerTitulo = ""

var listaRecetas = []
var numRecetas 


var bl_filtro = document.getElementById("filtro_texto");
var bl_orden = document.getElementById("orden_texto");
var bl_recetas = document.getElementById("table_recetas");


// const comenzar = trueFalseModal('¡ATENCION!', "¿Seguro que que quieres comprobar si funciona el modal?")
// if (comenzar) { 
//     createTable()
// }


async function createTable(cambioPagina=MISMA_PAGINA) {
    if (pagina > listaRecetas.length) {
        numRecetas = await dbSelectCount(filtro, cambioPagina)
        if (numRecetas == 0) {
            alert('No hay recetas para los filtros especificados')
            openFiltroOrden()
            return
        } else if (numRecetas > LIMITE_RECETAS && filtro.length != 0) {
            alert(`Con los filtros actuales hay mas de ${LIMITE_RECETAS} recetas.\nSe mostrarán las ${LIMITE_RECETAS} primeras`)
        }

        const datosCrudos = await dbSelect(filtro, orden, cambioPagina);
        for (let item = 0; item < datosCrudos.length; item++) {
            listaRecetas.push([datosCrudos[item]["id"], datosCrudos[item]["titulo"]])
        }
    }

    numRecetas = listaRecetas.length
        
    bl_recetas.innerHTML = ""
    if (pagina > 1){
        bl_recetas.innerHTML += `<tr>
                                    <td class="has-text-centered" data-id="PAGINA_ANTERIOR">
                                    <span class="icon has-text-link"><i class="fas fa-angle-double-up"></i></span>
                                    <span class="has-text-link" mr-5 ml-5>Recetas anteriores<span>
                                    <span class="icon"><i class="fas fa-angle-double-up"></i></span></td>
                                </tr>`;    
    }
    let indComienzo = RECETAS_POR_PAGINA * (pagina - 1)
    let indFinal = Math.min((RECETAS_POR_PAGINA * pagina), numRecetas)
    for (let item = indComienzo; item < indFinal; item++) {
        bl_recetas.innerHTML += `<tr>
                            <td data-id=${listaRecetas[item][idListaRecetas]}>
                            ${listaRecetas[item][tituloListaRecetas]}</td>
                            </tr>`;
    }
    
    if (numRecetas > indFinal) {
        bl_recetas.innerHTML += `<tr>
                                    <td class="has-text-centered" data-id="PAGINA_SIGUIENTE">
                                    <span class="icon has-text-link"><i class="fas fa-angle-double-down"></i></span>
                                    <span class="has-text-link" mr-5 ml-5>Siguientes recetas<span>
                                    <span class="icon"><i class="fas fa-angle-double-down"></i></span></td>
                                </tr>`;
    }

    if (filtro.length == 0) {
        filtroTxt = `Ninguno    (se muestran las ${LIMITE_RECETAS} primeras recetas)`;
    } else {
        filtroTxt =
            '"' +
            filtro[0].palabra +
            '" en ' +
            `<span class="has-text-danger">${filtro[0].campo}</span>`;
        if (filtro.length > 1) {
            filtroTxt =
                filtroTxt +
                `<span class="mr-5 ml-5">( ${filtro[1].toUpperCase()} )</span>`;
            filtroTxt +=
                '"' +
                filtro[2].palabra +
                '" en ' +
                `<span class="has-text-danger">${filtro[2].campo}</span>`;
        }
    }

    bl_filtro.innerHTML = filtroTxt;
    bl_orden.innerText = ORDER[orden].texto_div;
}


document.getElementById("table_recetas").addEventListener("click", function (e) {
    const receta = e.target.closest("tr");
    if (receta) {
        if (receta.cells[0].dataset.id == "PAGINA_ANTERIOR") {
            pagina -= 1
            createTable()
        } else if (receta.cells[0].dataset.id == "PAGINA_SIGUIENTE") {
            pagina += 1
            createTable()
        } else {
            openMainReceta(receta.cells[0].dataset.id)
        }
    }
});

closeModalReceta.addEventListener("click", function () {
    modalReceta.classList.remove("is-active");
});
buttonCloseModalReceta.addEventListener("click", function () {
    modalReceta.classList.remove("is-active");
});
formReceta.addEventListener("input", function () {
    buttonSaveModalReceta.style.display = "block";
});

const openMainReceta = async (idReceta) => {
    let dataReceta = await dbSelectReceta(idReceta);
    buttonSaveModalReceta.style.display = "none";

    formReceta["titulo"].value = dataReceta[0]["titulo"];
    formReceta["credito"].value = dataReceta[0]["credito"];
    formReceta["pasos"].value = dataReceta[0]["receta"];
    textAreaReceta.scrollTop = 0;

    modalReceta.classList.add("is-active");
};

function openFiltroOrden() {
    const ordenTxt = orden.toString();
    document.querySelector(
        `[name="orden"][value='${ordenTxt}']`
    ).checked = true;
    modalCambioFiltroOrden.classList.add("is-active");

    if (filtro.length > 0) {
        document.getElementById("inputFiltro1").value = filtro[0].palabra;
        document.getElementById("selectCampo1").value = filtro[0].campo;
        if (filtro.length == 3) {
            document.querySelector(
                `[name="yo1"][value=${filtro[1]}]`
            ).checked = true;
            document.getElementById("inputFiltro2").value = filtro[2].palabra;
            document.getElementById("selectCampo2").value = filtro[2].campo;
        }
    }
}

function aplicarFiltroOrden() {
    var opcOrden, opcFiltro;
    const oldOpcOrden = orden,
        oldOpcFiltro = filtro;

    let radioBtOrdenActivo = document.querySelector(
        'input[name="orden"]:checked'
    );
    if (radioBtOrdenActivo) {
        opcOrden = parseInt(radioBtOrdenActivo.value);
    } else {
        opcOrden = oldOpcOrden;
    }
    let isOrdenChanged = opcOrden !== oldOpcOrden;

    let campo2 = "";
    let yoActivoValue = "";
    let palabra1 = document.getElementById("inputFiltro1").value;
    let campo1 = document.getElementById("selectCampo1").value;
    let palabra2 = document.getElementById("inputFiltro2").value;
    if (palabra2 !== "") {
        campo2 = document.getElementById("selectCampo2").value;
        yoActivoValue = document.querySelector('input[name="yo1"]:checked');
        if (!yoActivoValue) {
            document.querySelector(
                'input[name="yo1"][value="y"]'
            ).checked = true;
            yoActivoValue = "y";
        } else {
            yoActivoValue = document.querySelector(
                'input[name="yo1"]:checked'
            ).value;
        }
    }
    let newFiltro = [];
    if (palabra1 !== "") {
        newFiltro.push({ palabra: `${palabra1}`, campo: `${campo1}` });
        if (palabra2 !== "" && yoActivoValue !== "") {
            newFiltro.push(yoActivoValue);
            newFiltro.push({ palabra: `${palabra2}`, campo: `${campo2}` });
        }
    }

    let isFiltroChanged = !areFiltrosIguales(filtro, newFiltro)

    if (isFiltroChanged == true || isOrdenChanged == true) {
        orden = opcOrden
        filtro = []
        filtro = JSON.parse(JSON.stringify(newFiltro))
        pagina = 1
        listaRecetas = []
        createTable()
    }
    modalCambioFiltroOrden.classList.remove("is-active")
}

function borrarFiltros() {
    document.getElementById("inputFiltro1").value = "";
    document.getElementById("selectCampo1").value = "Título";
    document.querySelector(`[name="yo1"][value="y"`).checked = false;
    document.querySelector(`[name="yo1"][value="o"`).checked = false;
    document.getElementById("inputFiltro2").value = "";
    document.getElementById("selectCampo2").value = "Título";
}

function campoToDb(campoTxt) {
    var campoDb
        switch (campoTxt) {
            case 'Título':
                campoDb = 'titulo'
                break;  
            case 'Cocinero/a':
                campoDb = "credito"
                break
            case 'Receta':
                campoDb = 'receta'
                break
        }
    return campoDb
}

function areFiltrosIguales(filtro1, filtro2) {
    let sonIguales = true
    sonIguales = (filtro1.length === filtro2.length)
    if (sonIguales == true && filtro1.length > 0) {
        for (let ind = 0; ind < filtro1.length; ind++) {
            if (ind == 0 || ind == 2) {
                sonIguales = (filtro1[ind].palabra == filtro2[ind].palabra) &&
                             (filtro1[ind].campo == filtro2[ind].campo)
                if (sonIguales == true && ind == 1) {
                    sonIguales = (filtro1[ind] == filtro2[ind])
                } 
                if (sonIguales == false) {
                    return false
                } 
            }
        }
    }
    return sonIguales
}



buttonCambioFiltroOrden.addEventListener("click", openFiltroOrden);
buttonSalirModalFiltroOrden.addEventListener("click", function () {
    modalCambioFiltroOrden.classList.remove("is-active");
});
buttonAplicarFiltroOrden.addEventListener("click", aplicarFiltroOrden);
iconCloseModelFiltroOrden.addEventListener("click", function () {
    modalCambioFiltroOrden.classList.remove("is-active");
});
buttonBorrarFiltros.addEventListener("click", borrarFiltros);


createTable()

// function asignarGlobalRespuesta(valor) {
//     globalRespuesta = valor
//     alert(`globalRespuesta es ahora ${globalRespuesta}`)
// }


// function abrirModal(titulo, mensaje, botones) {
//     // botones es un array de objetos: {text, action: function, classname is-...}

//     // Creación del contenedor
//     const modalWindow = document.createElement('div')
//     modalWindow.className = 'modal'

//     // Estructura interior
//     modalWindow.innerHTML = `
//         <div class="modal-background"></div>
//         <div class="modal-card">
//             <header class="modal-card-head">
//             <p class="modal-card-title" id="tituloModal">${titulo}</p>` +
//             // Boton de cerrar si se quiere
//             // <button class="delete" aria-label="close" id="closeModalFiltroOrden"></button>
//             `</header>

//             <section class="modal-card-body">
//                 <div class="modal-content">
//                     <p>${mensaje}</p>
//                 </div>
//             </section>
        
//             <div class="modal-card-foot">
//                 <div class="buttons"></div>
//             </div>
//    `

//     const footer = modalWindow.querySelector('.modal-card-foot .buttons')
//     botones.forEach(boton => {
//         const button = document.createElement('button')
//         button.innerText = boton.text
//         button.className = `button is-${boton.className || 'success'}`
//         if (boton.action) {
//             button.addEventListener('click', boton.action) 
//         }
//         button.addEventListener('click', () => { document.body.removeChild(modalWindow) } )
        
//         footer.appendChild(button)
//     });
    
//     // Añadir al DOM
//     document.body.appendChild(modalWindow)
//     modalWindow.classList.add("is-active");
// }


// const trueFalseModal = (titulo, mensaje) => {
//     try {
//             abrirModal(titulo, mensaje,
//                 [{text: 'Sí', className: 'success', action: () => { asignarGlobalRespuesta(true) } },
//                 {text: 'No', className: 'danger', action: () => { asignarGlobalRespuesta(false) } } ]
//                 )
//         } 
//     catch {
//         console.log('Error')
//     }  
// }


// function obtenerPermiso() {
//     return new Promise(resolve => trueFalseModal('¡ATENCION!', "¿Seguro que que quieres comprobar si funciona el modal?"))
// }




// document.addEventListener('DOMContentLoaded', async function() {
//     console.log('El DOM está listo.');
//     // Tu código aquí
//     const resultado = await obtenerPermiso();
//     if (globalRespuesta) alert('Podríamos continuar')


//     createTable()
    
// });
