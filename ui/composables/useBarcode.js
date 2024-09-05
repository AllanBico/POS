import JsBarcode from 'jsbarcode';

export function useBarcode() {
    /**
     * Generate a barcode and render it on a canvas or SVG element
     * @param {HTMLElement} element - The target HTML canvas or SVG element to render the barcode
     * @param {string} code - The string input to generate the barcode from
     * @param {Object} options - Optional configuration for JsBarcode
     */
    const generateBarcode = (element, code, options = {}) => {
        if (!element || !code) {
            console.error("Element and code are required to generate a barcode.");
            return;
        }

        // Default options for barcode generation
        const defaultOptions = {
            format: 'CODE128', // Common barcode format
            width: 2,
            height: 100,
            displayValue: true,
            ...options, // Merge with user-provided options
        };

        try {
            JsBarcode(element, code, defaultOptions);
        } catch (error) {
            console.error("Failed to generate barcode:", error);
        }
    };

    /**
     * Print the barcode from a canvas element
     * @param {HTMLElement} element - The target HTML canvas element containing the barcode
     */
    const printBarcode = (element) => {
        if (!element) {
            console.error("Element is required to print the barcode.");
            return;
        }
        // Create an off-screen canvas/image element for printing
        const newWindow = window.open('', '', 'width=800,height=600');
        if (newWindow) {
            newWindow.document.write('<html><head><title>Print Barcode</title></head><body>');

            if (element.tagName === 'CANVAS') {
                const imageData = element.toDataURL(); // Get image data from the canvas
                newWindow.document.write(`<img src="${imageData}" onload="window.print();window.close()" />`);
            } else if (element.tagName === 'SVG') {
                newWindow.document.write(element.outerHTML);
                newWindow.document.write('<script>window.onload = function(){ window.print(); window.close(); }<\/script>');
            }
            newWindow.document.write('</body></html>');
            newWindow.document.close();
        }
    };


    return {
        generateBarcode,
        printBarcode,
    };
}
