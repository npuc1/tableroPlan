const formato = (estado, datosEstado) => {

    // secciona el objeto estatal en secciones por isntitución
    const sectionTables = Object.entries(datosEstado)
        .map(([sectionName, sectionData]) => {
            // mapea el objeto seccionado por cada institución
            const criteriosConsiderados = Object.entries(sectionData)
                .filter(([_, value], index) => {
                    return value === true && index >= 0 && index <= 11
                })
                .map(([field, _]) => field)
                .join(', ');

            if (sectionData.reported) {
                if (criteriosConsiderados) {
                    return `
                            <div class="section">
                                <table>
                                    <col width='800px' />
                                    <col width='150px' />
                                    <tr>
                                        <th>${sectionName}</th>
                                        <th>Reporte: Sí</th>
                                        <th class='F'></th>
                                    </tr>
                                    <tr>
                                        <th>Criterios considerados</th>
                                        <th>Enlaces</th>
                                        <th class='F'></th>
                                    </tr>
                                    <tr>
                                        <td>${criteriosConsiderados}</td>
                                        <td>Enlaces</td>
                                        <td class='F'></td>
                                    </tr>
                                </table>
                            </div>
                            <br>
                        `;
                }
                return `
                            <div class="section">
                                <table>
                                    <col width='800px' />
                                    <col width='150px' />
                                    <tr>
                                        <th>${sectionName}</th>
                                        <th>Reporte: Sí</th>
                                        <th class='F'></th>
                                    </tr>
                                    <tr>
                                        <th colspan="2">Observación: La normatividad institucional no considera los criterios del Plan de Acción.</th>
                                        <th class='F'></th>
                                    </tr>
                                </table>
                            </div>
                            <br>
                        `;
            }
            return `
                            <div class="section">
                                <table>
                                    <col width='800px' />
                                    <col width='150px' />
                                    <tr>
                                        <th>${sectionName}</th>
                                        <th>Reporte: No</th>
                                        <th class='F'></th>
                                    </tr>
                                    <tr>
                                        <th>Criterios considerados</th>
                                        <th>Enlaces</th>
                                        <th class='F'></th>
                                    </tr>
                                    <tr>
                                        <td>NA</td>
                                        <td>NA</td>
                                        <td class='F'></td>
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
        table {
            table-layout: fixed;
            word-break: break-all;
            border-collapse: collapse;
            width:100%;
        }

        td {
            height:25px;
            border: 1px solid #dddddd;
            padding: 8px;
        }
        
        th {
            border: 1px solid #dddddd;
            height:20px;
            text-align: left;
            padding: 8px;
        }
        
        body {
            font-family: geomanist;
        }

        .F {
            width:100%;
            border:none;
            border-left:1px solid;
        }

        .section {
            background-color: yellow;
        }
    </style>
</head>

<body>
    <div style="text-align: right;">
        <h3>ACUSE DE REPORTE DE CUMPLIMIENTO</h3>
        <p>PLAN DE ACCIÓN PARA FORTALECER LOS PROCESOS DE CONTRATACIONES PÚBLICAS EN MATERIA DE ADQUISICIONES,
            ARRENDAMIENTOS Y SERVICIOS DEL SECTOR PÚBLICO</p>
    </div>
    <div>
        <p>22/octubre/2024; 14:55:05</p>
    </div>
    <br>
    <div>
        <h4>Sistema Estatal Anticorrupción de ${estado}</h4>
        <p>La emisión del presente acuse por parte de la Secretaría Ejecutiva del Sistema Nacional Anticorrupción
            atiende al reporte de información en el Tablero de Seguimiento a la Acción 3: “Homologar el marco estatal de
            contrataciones públicas, priorizando el fortalecimiento de la regulación relativa a excepciones para
            realizar contrataciones por vía de adjudicación directa” del Plan de Acción para fortalecer los procesos de
            contrataciones públicas en materia de adquisiciones, arrendamientos y servicios del sector público,
            consistente en los siguientes datos:</p>
    </div>
    <br>
    <div>
        ${sectionTables}
    </div>
</body>

</html>
    `;
};

export default formato;