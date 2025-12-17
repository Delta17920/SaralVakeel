import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Fix for Next.js/Webpack worker loading
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

interface PdfViewerProps {
    url: string;
    pageNumber?: number;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url, pageNumber = 1 }) => {
    const [numPages, setNumPages] = useState<number | null>(null);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    return (
        <div className="flex flex-col items-center border rounded-lg overflow-hidden bg-gray-50 h-full">
            <div className="w-full h-full overflow-y-auto flex justify-center p-4">
                {url ? (
                    <Document
                        file={url}
                        onLoadSuccess={onDocumentLoadSuccess}
                        className="shadow-lg"
                    >
                        <Page
                            pageNumber={pageNumber}
                            width={500}
                            renderTextLayer={true}
                            renderAnnotationLayer={false}
                        />
                    </Document>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        No PDF selected
                    </div>
                )}
            </div>
            <div className="p-2 bg-white border-t border-gray-200 w-full text-center text-sm text-gray-600">
                Page {pageNumber} of {numPages || '--'}
            </div>
        </div>
    );
};

export default PdfViewer;
