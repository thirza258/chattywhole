import React, { useState } from 'react';

interface ApiKeyPageProps {
  onKeySubmit: () => void;
}

const ApiPage: React.FC<ApiKeyPageProps> = ({ onKeySubmit }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSaveKey = () => {
    if (apiKey.trim() === '') {
      setError('API Key cannot be empty.');
      return;
    }

    // Save the key to localStorage
    localStorage.setItem('apiKey', apiKey);
    setError('');
    
    // Notify the parent component that the key has been submitted
    onKeySubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveKey();
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Enter Your API Key
        </h1>
        <p className="text-center text-gray-600 mb-6">
          An API key is required to use the application's features. Please enter your key below to continue.
        </p>
        <div className="mb-4">
          <input
            type="password"
            className="w-full border rounded-md px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        <button
          className="w-full bg-blue-600 text-white py-2 rounded-md text-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          onClick={handleSaveKey}
        >
          Save and Continue
        </button>
      </div>
    </div>
  );
};

export default ApiPage;