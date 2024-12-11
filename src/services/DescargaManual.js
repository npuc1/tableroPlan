function DescargaManual() {
    // Create a link element - think of this as creating an invisible download button
    const link = document.createElement('a');
    
    // Set the file path - this is the same as before
    link.href = '/Manual de usuario - Tablero.pdf';
    
    // This is the key difference - the 'download' attribute tells the browser
    // to download the file instead of navigating to it
    link.download = 'Manual de usuario - Tablero.pdf';
    
    // Programmatically click our invisible download link
    link.click();
}

export default DescargaManual;