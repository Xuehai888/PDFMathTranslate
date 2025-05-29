import { useAuth } from '../contexts/AuthContext';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Document, Page, pdfjs } from 'react-pdf';
import toast from 'react-hot-toast';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function Dashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [translatedFiles, setTranslatedFiles] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [previewType, setPreviewType] = useState(null); // 'original' or 'translated'

  const onDrop = useCallback((acceptedFiles) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    if (pdfFiles.length !== acceptedFiles.length) {
      toast.error('Only PDF files are allowed');
      return;
    }
    setFiles(prev => [...prev, ...pdfFiles.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    }
  });

  const handleTranslate = async () => {
    if (files.length === 0) {
      toast.error('Please upload at least one PDF file');
      return;
    }

    setIsTranslating(true);
    try {
      // Simulate translation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTranslatedFiles(files.map(file => ({
        original: file,
        translated: file, // In real implementation, this would be the translated file
      })));
      toast.success('Translation completed!');
    } catch (error) {
      toast.error('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handlePreview = (file, type) => {
    setSelectedFile(file);
    setPreviewType(type);
    setPageNumber(1);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">PDF Translator</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
          >
            <input {...getInputProps()} />
            <p className="text-gray-600">
              {isDragActive
                ? 'Drop the PDF files here...'
                : 'Drag and drop PDF files here, or click to select files'}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* File List and Controls */}
            <div>
              {files.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files</h2>
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
                        <span className="text-gray-700">{file.file.name}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePreview(file, 'original')}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Preview
                          </button>
                          <span className="text-sm text-gray-500">
                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className={`mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors
                      ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isTranslating ? 'Translating...' : 'Translate Files'}
                  </button>
                </div>
              )}

              {translatedFiles.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Translated Files</h2>
                  <ul className="space-y-2">
                    {translatedFiles.map((file, index) => (
                      <li key={index} className="bg-white p-4 rounded-lg shadow">
                        <h3 className="font-medium text-gray-900">{file.original.file.name}</h3>
                        <div className="mt-2 flex space-x-4">
                          <button
                            onClick={() => handlePreview(file.original, 'original')}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Preview Original
                          </button>
                          <button
                            onClick={() => handlePreview(file.translated, 'translated')}
                            className="text-green-600 hover:text-green-800"
                          >
                            Preview Translated
                          </button>
                          <button className="text-purple-600 hover:text-purple-800">
                            Download
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* PDF Preview */}
            {selectedFile && (
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {previewType === 'original' ? 'Original PDF' : 'Translated PDF'}
                  </h2>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                      disabled={pageNumber <= 1}
                      className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-gray-600">
                      Page {pageNumber} of {numPages || '?'}
                    </span>
                    <button
                      onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages || prev))}
                      disabled={pageNumber >= (numPages || 1)}
                      className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Document
                    file={selectedFile.url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="flex justify-center"
                  >
                    <Page
                      pageNumber={pageNumber}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="max-w-full"
                    />
                  </Document>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}