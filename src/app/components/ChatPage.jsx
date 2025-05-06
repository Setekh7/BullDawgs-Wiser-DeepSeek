"use client";

import React, { useState } from "react";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import DarkModeToggle from "./DarkModeToggle";
import FileViewer from "./FileViewer";
import { v4 as uuid } from "uuid"; 

const ChatPage = () => {
  const [messages, setMessages] = useState([
    { id: uuid(), sender: "BullDawg-Wiser", text: "Hi! I am BullDawg-Wiser, your AI‑driven academic advisor. Please ask me a question to get started." },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");
  
  const handleViewFile = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFileContent(reader.result);
      setFileName(file.name);
      setFileViewerOpen(true);
    };
    reader.readAsText(file);
  };

  const createNewTextFile = () => {
    setFileContent("");
    setFileName("file.txt");
    setFileViewerOpen(true);
  };

  const handleUploadFromEditor = (content, filename) => {
    // check if file name is valid
    if (!filename) {
      filename = "file.txt";
    }

    // create a file object from content
    const blob = new Blob([content], { type: "text/plain" });
    const file = new File([blob], filename, { type: "text/plain" });

    // Ensure file has proper properties
    Object.defineProperty(file, 'name', {
      writable: true,
      value: filename
    })

    // add the file to the chat as if it was uploaded
    handleSendMessage("", file);

    // close the file viewer
    setFileViewerOpen(false);
  }

  const handleSendMessage = async (inputText, selectedFile) => {
    if (!inputText.trim() && !selectedFile) return;

     // Make sure we have a valid display text
    let displayText;
    if (inputText.trim()) {
      displayText = inputText.trim();
    } else if (selectedFile && selectedFile.name) {
      displayText = `Uploaded ${selectedFile.name}`;
    } else {
      displayText = "Uploaded file";
    }

    setMessages(prev => [
      ...prev,
      {
        id: uuid(),               // permanent id
        sender: "User",
        text: displayText,
        fileRef: selectedFile,
      },
    ]);
    setIsLoading(true);

    try {
      let response;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("message", inputText || "");
        formData.append("file", selectedFile);

        response = await fetch("/api/openai", { 
          method: "POST", 
          body: formData 
        });
      } else {
        response = await fetch("/api/openai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: inputText }),
        });
      }

      if (!response.ok) throw new Error("Failed to get response");
      const data = await response.json();
      setMessages((prev) => [...prev, { 
        id: uuid(),
        sender: "BullDawg-Wiser", 
        text: data.answer 
      }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { 
        id: uuid(),
        sender: "BullDawg-Wiser", 
        text: "Sorry, I encountered an error processing your request." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="absolute top-2 right-2">
        <DarkModeToggle />
      </div>
      <div className="w-full max-w-3xl h-[90vh] bg-gray-100 dark:bg-gray-900 shadow-lg rounded-lg flex flex-col overflow-hidden">
        {fileViewerOpen ? (
          <FileViewer 
            fileContent={fileContent} 
            fileName={fileName}
            onClose={() => setFileViewerOpen(false)}
            onUploadToChat={handleUploadFromEditor}
          />
        ) : (
          <>
            <ChatWindow 
              messages={messages} 
              isLoading={isLoading} 
              onViewFile={(file) => handleViewFile(file)} 
            />
            <ChatInput 
              onSendMessage={handleSendMessage} 
              onCreateNewFile={createNewTextFile}  
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
