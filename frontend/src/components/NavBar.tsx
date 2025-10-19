import React from "react";

interface NavBarProps {
  selectedTool: string;
  hasApiKey: boolean;
  onClearApiKey: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ selectedTool, hasApiKey, onClearApiKey }) => {
  return (
    <nav className="w-full h-16 bg-gray-800 text-white flex items-center justify-between px-4 border-b-2 border-white z-10">
      <div className="flex items-center gap-4">
        <img src="/logo.png" alt="Nevatal Logo" className="h-8 w-8" />
        <h1 className="text-lg font-bold">Nevatal</h1>
        <button
          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-md text-sm"
          onClick={() => {
            alert("About Us coming soon!");
          }}
        >
          About Us
        </button>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex gap-4">
          <span className="font-bold text-blue-400">
            {selectedTool} Page 
          </span>
        </div>

        {hasApiKey ? (
          <button
            className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-md text-sm"
            onClick={onClearApiKey}  
          >
            Clear API Key
          </button>
        ) : (
          <button
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded-md text-sm"
            onClick={() => {
              localStorage.setItem("apiKey", "dummy-key");
              window.location.reload();
            }}
          >
            Renew API Key
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;