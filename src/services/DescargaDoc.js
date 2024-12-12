function DescargaDoc(doc) {
    const link = document.createElement('a');
    link.href = doc;
    link.download = doc;
    link.click();
}

export default DescargaDoc;