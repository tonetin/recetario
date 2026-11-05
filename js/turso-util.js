// turso-util.js
// Funciones para acceder con SQL a la base de datos de Turso


export const tursoFetch = async (sqlText,  tursoUrl, tursoToken) => {
    try {
        // Hacemos la llamada directa al API HTTP v2 de Turso
        const response = await fetch(`${tursoUrl}/v2/pipeline`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tursoToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                requests: [
                    {
                        type: "execute",
                        stmt: {
                            sql: sqlText
                        }
                    },
                    {
                        type: "close"
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        
        return data

    } catch (error) {
        console.log = `Error de Conexión: \n${error.message}`;
        console.error(error);
    }

}    // Fin de la función tursoFetch



export const tursoSelect = async (sqlText, tursoUrl, tursoToken) => {
    var datosSelect = await tursoFetch(sqlText, tursoUrl, tursoToken)
    
    // Extraemos las filas devueltas por Turso de forma limpia
    const filas = datosSelect.results[0].response.result.rows;
                
    let datosCrudos = []
    if (filas.length != 0) {
        for (var fila = 0; fila < filas.length; fila++) {
            let filaAct = {}
            for (var valorAct = 0; valorAct < filas[fila].length; valorAct++) {
                filaAct[datosSelect.results[0].response.result.cols[valorAct]["name"]] = 
                    filas[fila][valorAct]["type"] != 'null' ? filas[fila][valorAct]["value"] : ""
            }
            datosCrudos.push(filaAct)
        }  
    }
    return datosCrudos

}  // Fin de la función tursoSelect



export const tursoCount = async (tableName, whereText, tursoUrl, tursoToken) => {
    var datosSelect = await tursoFetch("SELECT COUNT(*) FROM " + tableName + " WHERE " + whereText,
                                        tursoUrl, tursoToken)
    // Extraemos las filas devueltas por Turso de forma limpia
    const filas = datosSelect.results[0].response.result.rows;
                
    let numRegistros = []
    if (filas.length != 0) {
        numRegistros = filas[0][0]["value"]
    } else {
        numRegistros = 0
    }  
    return numRegistros

}  // Fin de la función tursoCount



export const tursoUpdate = async (tableName, whereText, newValues, tursoUrl, tursoToken) => {
    var sqlText = "UPDATE " + tableName + " SET "
    Object.entries(newValues).forEach(([clave, valor]) => {
        sqlText += `${clave} = '${valor}', `
    })
    sqlText = sqlText.slice(0, -2) + " WHERE " + whereText

    var resultado = await tursoFetch(sqlText, tursoUrl, tursoToken)
    
    let exitoUpdate = true

    if (resultado.results[0].error) {
        console.error("Error al actualizar:", resultado.results[0].error)
        exitoUpdate = false
      } 

    return exitoUpdate

}  // Fin de la función tursoUpdate