const acuse = (estado, datosEstado) => {

    const logoPath = './SNA.png';

    // secciona el objeto estatal en secciones por isntitución
    const sectionTables = Object.entries(datosEstado)
        .map(([sectionName, sectionData]) => {
            // mapea el objeto seccionado por cada institución
            const criteriosConsiderados = Object.entries(sectionData)
                .filter(([_, value], index) => {
                    return value === true && index >= 0 && index <= 11
                })
                .map(([field, _]) => {
                    return `${field[0]}.${field[1]}`
                })
                .join(', ');

            const enlaces = Object.entries(sectionData)
                .filter(([field, value]) => {
                    return field.startsWith("normLink") && value !== ""
                })
                .map(([field, value]) => {
                    return `<a href="${value}">Acción 3.${field[8]}</a>`
                })
                .join(', ');

            if (sectionData.reported) {
                if (criteriosConsiderados) {
                    return `
                            <div class="section">
                                <table>
                                    <col width='750' />
                                    <col width='200px' />
                                    <tr>
                                        <th>${sectionName}</th>
                                        <th>Reporte: Sí</th>
                                    </tr>
                                    <tr>
                                        <td>Criterios considerados</td>
                                        <td>Enlaces</td>
                                    </tr>
                                    <tr>
                                        <td>${criteriosConsiderados}</td>
                                        <td>${enlaces}</td>
                                    </tr>
                                </table>
                            </div>
                            <br>
                        `;
                }
                return `
                            <div class="section">
                                <table>
                                    <col width='750' />
                                    <col width='200px' />
                                    <tr>
                                        <th>${sectionName}</th>
                                        <th>Reporte: Sí</th>
                                    </tr>
                                    <tr>
                                        <td colspan="2">Observación: La normatividad institucional no considera los criterios del Plan de Acción.</td>
                                    </tr>
                                </table>
                            </div>
                            <br>
                        `;
            }
            return `
                            <div class="section">
                                <table>
                                    <col width='750' />
                                    <col width='200px' />
                                    <tr>
                                        <th>${sectionName}</th>
                                        <th>Reporte: No</th>
                                    </tr>
                                    <tr>
                                        <td>Criterios considerados</td>
                                        <td>Enlaces</td>
                                    </tr>
                                    <tr>
                                        <td>NA</td>
                                        <td>NA</td>
                                    </tr>
                                </table>
                            </div>
                            <br>
                        `
        })
        .join('');

    // complete HTML doc
    return `
<!DOCTYPE html>

<html>

<head>
    <title>Acuse</title>
    <style>
        body {
        }

        table {
            table-layout: fixed;
            word-break: break-all;
            border-collapse: collapse;
            width:80%;
            margin: auto;
        }

        td {
            height:25px;
            border-bottom: 1px solid #dddddd;
            padding: 8px;
            font-weight: Light;
        }
        
        th {
            border-top: 2px solid #dddddd;
            border-bottom: 2px solid #dddddd;
            height:20px;
            text-align: left;
            padding: 8px;
        }
    </style>
</head>

<body>
    <div><img src="${logoPath}" alt="logo SNA"></div>
    <div style="text-align: right; padding-right: 3%; padding-left: 5%; padding-top: 5%;">
        <h3>ACUSE DE REPORTE DE CUMPLIMIENTO</h3>
        <p>PLAN DE ACCIÓN PARA FORTALECER LOS PROCESOS DE CONTRATACIONES PÚBLICAS EN MATERIA DE ADQUISICIONES,
            ARRENDAMIENTOS Y SERVICIOS DEL SECTOR PÚBLICO</p>
    </div>
    <div style="padding-left: 3%;">
        <p> Acuse generado el 
            ${new Date().toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',    
                minute: '2-digit', 
                second: '2-digit'   
            })}
        </p>
    </div>
    <div style="padding-left: 3%; padding-right: 3%; padding-top: 3%; padding-bottom: 1%; text-align: justify;">
        <h4>Sistema Estatal Anticorrupción de ${estado}</h4>
        <p>La emisión del presente acuse por parte de la Secretaría Ejecutiva del Sistema Nacional Anticorrupción
            atiende al reporte de información en el Tablero de Seguimiento a la Acción 3: “Homologar el marco estatal de
            contrataciones públicas, priorizando el fortalecimiento de la regulación relativa a excepciones para
            realizar contrataciones por vía de adjudicación directa” del Plan de Acción para fortalecer los procesos de
            contrataciones públicas en materia de adquisiciones, arrendamientos y servicios del sector público,
            consistente en los siguientes datos:</p>
    </div>
    <div>
        ${sectionTables}
    </div>
</body>

</html>
    `;
};

export default acuse;