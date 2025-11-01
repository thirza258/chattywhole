import React, { useState } from 'react'; 
import services from '../services/services';
import type { Response } from '../interface';
import ReactMarkdown from 'react-markdown';

const TranslatorPage: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [resultText, setResultText] = useState<string>('');
  const [sourceLang, setSourceLang] = useState<string>('en');
  const [targetLang, setTargetLang] = useState<string>('es'); 

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  }; 

  const handleTranslate = async () => {
    try {
      const response: Response = await services.postTranslator(inputText, languages.find(lang => lang.code === targetLang)?.name || '', languages.find(lang => lang.code === sourceLang)?.name || '');
      setResultText(services.handleResponseData(response.data));
    } catch (error) {
      console.error("Error fetching response:", error);
    }
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'id', name: 'Indonesian' },
    { code: 'ms', name: 'Malay' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ar', name: 'Arabic' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' }
  ]; 

  return (
    <div className="flex flex-col h-screen bg-gray-100">

      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Translator Page</h1>
          <p className="text-gray-600 text-sm mt-2">Break language barriers instantly — translate your content with context-aware precision.</p>
          <p className="text-gray-500 text-sm">Translate text, documents, and websites into over 100 languages with ease.</p>
        </div>
      </header> 

      <main className="flex-grow container mx-auto px-4 py-6 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="w-1/2 pr-2">
            <div className="flex items-center justify-between">
              <label htmlFor="source-lang" className="text-lg font-semibold text-gray-700">Source Language</label>
              <button
                onClick={() => navigator.clipboard.readText().then(text => setInputText(text))}
                className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Paste
              </button>
            </div>
            <select
              id="source-lang"
              className="w-full mt-1 p-2 border rounded-md"
              value={sourceLang}
              onChange={e => setSourceLang(e.target.value)}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
          <div className="w-1/2 pl-2">
            <div className="flex items-center justify-between">
              <label htmlFor="target-lang" className="text-lg font-semibold text-gray-700">Target Language</label>
              <button
                onClick={() => navigator.clipboard.writeText(targetLang)}
                className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Copy
              </button>
            </div>
            <select
              id="target-lang"
              className="w-full mt-1 p-2 border rounded-md"
              value={targetLang}
              onChange={e => setTargetLang(e.target.value)}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div> 

        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">          
          <div className="bg-white rounded-lg shadow-md flex flex-col">
            <textarea
              className="w-full h-full p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 outline outline-1 outline-gray-300"
              placeholder="Enter your text here..."
              value={inputText}
              onChange={handleInputChange}
            />
          </div>

          <div className="bg-white rounded-lg shadow-md flex flex-col">
            <div className="w-full h-full p-4 rounded-lg outline outline-1 outline-gray-300">
              <ReactMarkdown>{resultText as string}</ReactMarkdown>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button
            className="w-full bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleTranslate}
          >
            Translate
          </button>
        </div>
      </main>
    </div>
  );
}; 

export default TranslatorPage;