export const criterios = (() => {

    const nombresCriterios = [
        "Presupuesto y cronograma",
        "Montos máximos para excepciones",
        "Registro previo de todos los procedimientos",
        "Investigación de mercado obligatoria",
        "Existencia de oferta de bienes y/o servicios",
        "Existencia de proveedores",
        "Precio de bienes y/o servicios",
        "Medios consultados para la investigación",
        "Justificación para la selección de empresas",
        "Soporte documental",
        "Utilización de fraccionamientos",
        "Incorporación de OIC y área jurídica",

    ]

    const acciones = [1, 1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3];
    const posicion = ["1", "2", "3", "1", "1", "2", "3", "4", "5", "6", "7", "8"];

    return Array.from(Array(12), () => ({ nombreCrit: '', accion: '', posicion: '' }))
        .map((criterio, index) => ({
            nombreCrit: nombresCriterios[index],
            accion: acciones[index],
            posicion: posicion[index]
        }));
})(); 