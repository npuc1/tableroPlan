import acuse from '../components/misc/acuse';
// import { marked } from "marked";

function DescargaAcuse() {

    const rawHtml = acuse()

    // const htmlContent = marked(rawHtml);

    // Crear el PDF

    const blob = new Blob([rawHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.html';
    link.click();
    URL.revokeObjectURL(url);

}

export default DescargaAcuse;