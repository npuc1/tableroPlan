const formato = (estado, datosEstado) => {
  
    // secciona el objeto estatal en secciones por isntitución
    const sectionTables = Object.entries(datosEstado)
        .map(([sectionName, sectionData]) => {
            // mapea el objeto seccionado por cada institución
            const criteriosConsiderados = Object.fromEntries(
                Object.entries(sectionData)
                .filter(([_, value], index) => {
                    return value === true && index >= 0 && index <= 11
                })
            )
            const filaCriterios = Object.entries(criteriosConsiderados)
                .map(([field, value]) => `
                    <tr>
                        <td>${field}</td>
                        <td>${value}</td>
                    </tr>
                `).join('');

            // complete inst table
            return `
                <div class="section">
                    <h2>${sectionName}</h2>
                    <h3>${"Reportó: " + sectionData.reported}</h3>
                    <table>
                        <tr>
                            <th>Criterios considerados</th>
                            <th>Enlaces</th>
                        </tr>
                        ${filaCriterios}
                    </table>
                </div>
            `;
        }).join('');

    // complete HTML doc
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Acuse</title>
            <style>
                .section {
                    margin-bottom: 2em;
                }
            </style>
        </head>
        <body>
            <p>${estado}</p>
            ${sectionTables}
        </body>
        </html>
    `;
};

export default formato;