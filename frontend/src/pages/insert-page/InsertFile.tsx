import React, { useState } from 'react';
import services from '../services/services';

interface InsertFileProps {
  onUploadSuccess: (documentName: string) => void;
}

const InsertFile: React.FC<InsertFileProps> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [documentName, setDocumentName] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setError('');
        setDocumentName(file.name);
      } else {
        setError('Invalid file type. Please upload a PDF file.');
        setSelectedFile(null);
        setDocumentName('');
        event.target.value = '';
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file to upload.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      await services.insertFile(selectedFile);
      
      onUploadSuccess(documentName as string);
    } catch (err) {
      setError('An error occurred during file upload. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Upload Your Document
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Select a PDF document to start a chat session with its content.
        </p>
        <div className="mb-4">
          <label htmlFor="file-upload" className="sr-only">
            Choose file
          </label>
          <input
            id="file-upload"
            type="file"
            className="w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            onChange={handleFileChange}
            accept="application/pdf"
          />
        </div>

        {documentName && (
          <p className="text-center text-sm text-gray-500 mb-4">
            Selected: <strong>{documentName}</strong>
          </p>
        )}

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        
        <button
          className="w-full bg-blue-600 text-white py-2 rounded-md text-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:bg-blue-300"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload and Start Chat'}
        </button>
      </div>
    </div>
  );
};

export default InsertFile;