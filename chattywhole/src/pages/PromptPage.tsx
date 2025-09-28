import React from 'react';
import NavBar from './components/NavBar';
import Chatbot from './components/Chatbot';
import Sidebar from './components/Sidebar';
import { useState, useEffect } from 'react';
import services from '../services/services';
import './App.css';
import 'tailwindcss/tailwind.css';
import { v4 as uuidv4 } from 'uuid';


function PromptPage() {
  const [selectedModel, setSelectedModel] = useState("GPT");
  const [history, setHistory] = useState([]);

  if (!localStorage.getItem('conversationId')) {
    localStorage.setItem('conversationId', uuidv4());
  }

  const fetchHistory = async () => {
    const response = await services.getHistory();
    setHistory(response.data);
  }

  useEffect(() => {
    fetchHistory();
  }, [history]);

  return (
    <div className="h-screen flex flex-col">
      <NavBar />
      <div className="flex flex-grow overflow-hidden">
      <Sidebar selectedModel={selectedModel} setSelectedModel={setSelectedModel} history={history} />
        <div className="flex-grow overflow-y-auto bg-white p-4">
        <Chatbot selectedModel={selectedModel} />
        </div>
      </div>
    </div>
  );
}
export default PromptPage; 
