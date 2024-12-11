import acuse from '../components/misc/acuse';
// import { marked } from "marked";

function DescargaAcuse(estado, datosEstado) {

    const rawHtml = acuse(estado, datosEstado)

    // const htmlContent = marked(rawHtml);

    // crear el PDF

    const blob = new Blob([rawHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.html';
    link.click();
    URL.revokeObjectURL(url);

    console.log(datosEstado)

}

export default DescargaAcuse;