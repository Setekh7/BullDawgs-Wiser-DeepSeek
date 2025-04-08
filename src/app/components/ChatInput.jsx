import React, { useState, useRef } from "react";

const ChatInput = ({ onSendMessage }) => {
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      //inputRef.current.value = null; // Reset the file input
      fileInputRef.current.value = null; // Reset the file input
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Allow submission with just a file or with text (or both)
    if ((inputText.trim() || selectedFile)) {
      onSendMessage(inputText, selectedFile);
      setInputText("");
      // Don't reset the file immediately
      // Let ChatPage component decide when to reset it
    }
  };

  return (
    <form className="flex items-center w-full p-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700" 
    onSubmit={handleSubmit}>
      <input type="file" ref={fileInputRef} hidden accept=".txt" onChange={handleFileChange} />

      {/* File Attach Icon */}
      <button
        type="button"
        className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 p-2"
        onClick={() => fileInputRef.current?.click()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="20" height="20" fill="currentColor">
          <path d="M364.2 83.8c-24.4-24.4-64-24.4-88.4 0l-184 184c-42.1 42.1-42.1 110.3 0 152.4s110.3 42.1 152.4 0l152-152c10.9-10.9 28.7-10.9 39.6 0s10.9 28.7 0 39.6l-152 152c-64 64-167.6 64-231.6 0s-64-167.6 0-231.6l184-184c46.3-46.3 121.3-46.3 167.6 0s46.3 121.3 0 167.6l-176 176c-28.6 28.6-75 28.6-103.6 0s-28.6-75 0-103.6l144-144c10.9-10.9 28.7-10.9 39.6 0s10.9 28.7 0 39.6l-144 144c-6.7 6.7-6.7 17.7 0 24.4s17.7 6.7 24.4 0l176-176c24.4-24.4 24.4-64 0-88.4z"/>
        </svg>
      </button>

      {selectedFile && (
        <div className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-md flex items-center">
          {selectedFile.name}{" "}
          <button onClick={handleFileRemove} className="ml-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100">
            &#x2715;
          </button>
        </div>
      )}

      <input
        
        className="flex-1 p-2 mx-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-300"
        placeholder="Type your message..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      <button
        type="submit"
        className="ml-2 px-4 py-2 bg-black dark:bg-gray-700 text-white dark:text-gray-100 rounded-md hover:bg-gray-800 dark:hover:bg-gray-600"
      >
        <svg stroke="none" fill="currentColor" strokeWidth="0" viewBox="3 0 22 22" height="26" width="26" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L2 8.66667L11.5833 12.4167M22 2L15.3333 22L11.5833 12.4167M22 2L11.5833 12.4167" />
          </svg>
      </button>
    </form>
  );
};

export default ChatInput;
