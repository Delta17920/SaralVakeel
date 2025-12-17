import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Fix for Next.js/Webpack worker loading
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

interface PdfViewerProps {
    url: string;
    pageNumber?: number;
    onPageChange?: (page: number) => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url, pageNumber = 1, onPageChange }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [scale, setScale] = useState(1.0);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Initial width calculation and resize observer
    React.useEffect(() => {
        if (!containerRef.current) return;

        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth - 32); // Subtract padding
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    const changePage = (offset: number) => {
        if (onPageChange) {
            onPageChange(pageNumber + offset);
        }
    };

    const previousPage = () => changePage(-1);
    const nextPage = () => changePage(1);

    return (
        <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-gray-100 shadow-inner">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-white p-2 border-b shadow-sm z-10 sticky top-0">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600"
                        title="Zoom Out"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                    </button>
                    <span className="text-sm font-medium w-12 text-center">{Math.round(scale * 100)}%</span>
                    <button
                        onClick={() => setScale(s => Math.min(2.5, s + 0.1))}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600"
                        title="Zoom In"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        disabled={pageNumber <= 1}
                        onClick={previousPage}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600 disabled:opacity-30"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="text-sm text-gray-600">
                        {pageNumber} / {numPages || '--'}
                    </span>
                    <button
                        disabled={numPages ? pageNumber >= numPages : false}
                        onClick={nextPage}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600 disabled:opacity-30"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            {/* Document Container */}
            <div
                ref={containerRef}
                className="flex-1 overflow-auto bg-gray-50 flex justify-center p-4 relative"
            >
                {url ? (
                    <Document
                        file={url}
                        onLoadSuccess={onDocumentLoadSuccess}
                        className="shadow-xl"
                        loading={<div className="text-gray-400 mt-10">Loading PDF...</div>}
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            width={containerWidth || 500}
                            renderTextLayer={true}
                            renderAnnotationLayer={false}
                            className="bg-white"
                        />
                    </Document>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        No PDF selected
                    </div>
                )}
            </div>
        </div>
    );
};

export default PdfViewer;
