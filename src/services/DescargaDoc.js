function DescargaDoc(doc) {
    // Create a link element - think of this as creating an invisible download button
    const link = document.createElement('a');
    
    // Set the file path - this is the same as before
    link.href = doc;
    
    // This is the key difference - the 'download' attribute tells the browser
    // to download the file instead of navigating to it
    link.download = doc;
    
    // Programmatically click our invisible download link
    link.click();
}

export default DescargaDoc;