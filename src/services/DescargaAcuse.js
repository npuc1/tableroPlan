import acuse from '../components/misc/acuse';
import { marked } from "marked";

function DescargaAcuse() {

    const htmlContent = marked(acuse);

    // Crear el PDF

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.html';
    link.click();
    URL.revokeObjectURL(url);

}

export default DescargaAcuse;