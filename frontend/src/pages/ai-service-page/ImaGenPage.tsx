import React, { useState } from 'react';
import services from '../services/services';

const ImaGenPage: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handlePromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }

    setIsLoading(true);
    setError('');
    setImageUrl(''); 

    try {
      const response = await services.generateImage(prompt);
      
      if (response.data && response.data.url) {
        setImageUrl(response.data.url);
      } else {
        throw new Error("Invalid response format from server.");
      }

    } catch (err) {
      console.error("Error generating image:", err);
      setError("Failed to generate image. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${prompt.slice(0, 20).replace(/\s+/g, '_') || 'generated-image'}.png`; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">

      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Image Generation</h1>
          <p className="text-gray-600 mt-2">Describe the image you want our AI to create. Be as specific as you want.</p>
          <p className="text-red-600 font-medium bg-red-50 p-2 rounded-md border border-red-200">⚠️ To use this page, make sure you have an API key and Google Cloud connected to your account</p>
          <button
            onClick={() => setPrompt('')}
            className="mt-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-600"
          >
            Clear Prompt
          </button>

        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6 flex flex-col">
        <div className="flex-grow grid grid-rows-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-md flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-700">Your Prompt</h2>
              <button
                onClick={() => navigator.clipboard.readText().then(text => setPrompt(text))}
                className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-600"
              >
                Paste
              </button>
            </div>
            <textarea
              className="w-full h-full p-4 rounded-b-lg resize-none focus:outline-none"
              placeholder="e.g., A photorealistic portrait of a cat wearing a monocle"
              value={prompt}
              onChange={handlePromptChange}
            />
          </div>

          {/* Result Section */}
          <div className="bg-white rounded-lg shadow-md flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-700">Generated Image</h2>
              <div className="space-x-2">
                <button
                  onClick={() => navigator.clipboard.writeText(imageUrl)}
                  className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-600 disabled:opacity-50"
                  disabled={!imageUrl}
                >
                  Copy URL
                </button>
                <button
                  onClick={handleDownload}
                  className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-600 disabled:opacity-50"
                  disabled={!imageUrl}
                >
                  Download
                </button>
              </div>
            </div>
            <div className="w-full h-full p-4 flex items-center justify-center bg-gray-50 rounded-b-lg">
              {isLoading ? (
                <div className="text-gray-600">Generating your image...</div>
              ) : error ? (
                <div className="text-red-500 px-4 text-center">{error}</div>
              ) : imageUrl ? (
                <img src={imageUrl} alt={prompt} className="max-h-full max-w-full object-contain rounded-md shadow-sm" />
              ) : (
                <div className="text-gray-500">Your generated image will appear here.</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <button
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
            onClick={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Image'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default ImaGenPage;