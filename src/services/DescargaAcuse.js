// DescargaAcuse.js
import { pdf } from '@react-pdf/renderer';
import AcusePDF from './AcusePDF';

async function DescargaAcuse(estado, datosEstado) {
    try {
        // Generate and download PDF using the template
        const blob = await pdf(<AcusePDF estado={estado} datosEstado={datosEstado} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `acuse_${estado}_${new Date().toISOString().split('T')[0]}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
}

export default DescargaAcuse;