import React, { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";

const ChatWindow = ({ messages, isLoading, onViewFile }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
      {messages.map((msg, index) => (
        <ChatMessage 
          key={index} 
          sender={msg.sender} 
          text={msg.text}
          fileRef={msg.fileRef}
          action={msg.action}
          onViewFile={onViewFile}
        />
      ))}

      {isLoading && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;
