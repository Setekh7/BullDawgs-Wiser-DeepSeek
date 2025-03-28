"use client";

import React, { useState } from "react";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import DarkModeToggle from "./DarkModeToggle";

const ChatPage = () => {
  const [messages, setMessages] = useState([
    { sender: "BullDawg-Wiser", text: "Hi! I am BullDawg-Wiser, your AI-driven academic advisor. Please ask me a question to get started." },
  ]);
  const [isLoading, setIsLoading] = useState(false);


  const handleSendMessage = async (inputText, selectedFile) => {
    if (!inputText.trim() && !selectedFile) return;

    const displayText = inputText.trim() || (selectedFile ? "Uploaded a file" : "");

    const newMessages = [...messages, { sender: "User", text: displayText }];
    setMessages(newMessages);
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
        sender: "BullDawg-Wiser", 
        text: data.answer 
      }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { 
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
        <ChatWindow messages={messages} isLoading={isLoading} />
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatPage;
