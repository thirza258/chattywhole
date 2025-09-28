import React from 'react';
import ReactMarkdown from "react-markdown";

// Interface corrected to match the component's needs
interface SidebarProps {
  selectedTool: string;
  setSelectedTool: (tool: string) => void;
  history: {
    prompt: string;
    response: string;
    model_name: string;
    created_at: string;
  }[];
}

const Sidebar: React.FC<SidebarProps> = ({ selectedTool, setSelectedTool, history }) => {
  // Array of tools to make it easier to manage
  const tools = [
    "Prompt",
    "Proofreader",
    "Rewriter",
    "Summarizer",
    "Translator",
    "Writer"
  ];

  return (
    <div className="w-1/4 bg-gray-200 h-full p-4 border-r-2 border-white z-10 shadow-lg flex-shrink-0 flex flex-col">
      <div className="flex-shrink-0">
        <h2 className="mb-4 text-xl font-semibold">Tools</h2>
        <ul>
          {/* Mapped over the tools array to create links */}
          {tools.map((tool) => (
            <li key={tool} className="mb-4">
              <a
                href="#"
                className={`block p-2 rounded hover:bg-gray-300 ${selectedTool === tool ? "font-bold bg-gray-300" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedTool(tool);
                }}
              >
                {tool}
              </a>
            </li>
          ))}
        </ul>
        <hr className="my-4 border-t-2 border-gray-400" />
        <h2 className="mb-4 text-xl font-semibold">History</h2>
      </div>
      <div className="overflow-y-auto flex-grow">
        {history.length > 0 ? (
          history.map((entry, index) => (
            <div
              key={index}
              className="mb-4 p-4 bg-white shadow rounded-lg border border-gray-300"
            >
              <h3 className="font-bold text-lg mb-2">{entry.model_name}</h3>
              <div className="text-sm text-gray-800 space-y-2">
                <div>
                  <strong>Prompt:</strong> {entry.prompt}
                </div>
                <div>
                  <strong>Response:</strong> <ReactMarkdown>{entry.response}</ReactMarkdown>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-right">
                {new Date(entry.created_at).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No history available.</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;