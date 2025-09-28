import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import services from './services/services';
import NavBar from './components/NavBar';
import Sidebar from './components/Sidebar';

// Import all your page components
import ApiKeyPage from './pages/ApiPage'; // Import the new page
import PromptPage from './pages/PromptPage';
import ProofreaderPage from './pages/ProofreaderPage';
import RewriterPage from './pages/RewriterPage';
import SummarizerPage from './pages/SummarizerPage';
import TranslatorPage from './pages/TranslatorPage';
import WriterPage from './pages/WriterPage';

function App() {
  // New state to track if the API key is set
  const [hasApiKey, setHasApiKey] = useState(false);

  const [selectedTool, setSelectedTool] = useState("Prompt");
  const [history, setHistory] = useState([]);

  // This effect runs on initial app load
  useEffect(() => {
    // Check localStorage for the API key
    const storedKey = localStorage.getItem('apiKey');
    if (storedKey) {
      setHasApiKey(true);
    }

    if (!localStorage.getItem('conversationId')) {
      localStorage.setItem('conversationId', uuidv4());
    }
  }, []);

  // This effect fetches history, but only if an API key exists
  useEffect(() => {
    if (!hasApiKey) return; // Don't fetch if there's no key

    const fetchHistory = async () => {
      try {
        const response = await services.getHistory();
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };

    fetchHistory();
  }, [hasApiKey]); // Re-fetch history when the key is submitted

  // This function will be passed to ApiKeyPage
  const handleKeySubmission = () => {
    setHasApiKey(true);
  };
  
  // This function can be used for a "Log Out" or "Clear Key" button
  const handleClearKey = () => {
    localStorage.removeItem('apiKey');
    setHasApiKey(false);
  };


  // Helper function to render the correct page
  const renderSelectedPage = () => {
    switch (selectedTool) {
      case "Prompt": return <PromptPage />;
      case "Proofreader": return <ProofreaderPage />;
      case "Rewriter": return <RewriterPage />;
      case "Summarizer": return <SummarizerPage />;
      case "Translator": return <TranslatorPage />;
      case "Writer": return <WriterPage />;
      default: return <PromptPage />;
    }
  };

  // CONDITIONAL RENDERING:
  // If no API key is found, render the ApiKeyPage
  if (!hasApiKey) {
    return <ApiKeyPage onKeySubmit={handleKeySubmission} />;
  }

  // If an API key exists, render the main application
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <NavBar /> 
      <div className="flex flex-grow overflow-hidden">
        <Sidebar 
          selectedTool={selectedTool} 
          setSelectedTool={setSelectedTool} 
          history={history} 
        />
        <main className="flex-grow overflow-y-auto p-6">
          {renderSelectedPage()}
        </main>
      </div>
    </div>
  );
}

export default App;