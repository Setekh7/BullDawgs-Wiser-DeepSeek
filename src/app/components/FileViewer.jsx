import React, { useState } from "react";

const FileViewer = ({ fileContent, fileName, onClose, onUploadToChat }) => {
    const [content, setContent] = useState(fileContent || "");
    const [isEditing, setIsEditing] = useState(false);
    const [editingFileName, setEditingFileName] = useState(fileName || "");

    const handleSave = () => {
        // create a blob from the content
        const blob = new Blob([content], { type: "text/plain" });

        // create a download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = editingFileName;
        document.body.appendChild(a);
        a.click();

        // cleanup
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleUploadToChat = () => {
        if (onUploadToChat) {
            onUploadToChat(content);
        }
    };

    
    return (
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-2 bg-gray-200 dark:bg-gray-800">
            {isEditing ? (
              <input
                type="text"
                value={editingFileName}
                onChange={(e) => setEditingFileName(e.target.value)}
                className="px-2 py-1 rounded dark:bg-gray-700 dark:text-white"
              />
            ) : (
              <h3 className="font-medium">{fileName}</h3>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
              >
                {isEditing ? "View Mode" : "Edit Mode"}
              </button>
              {/* File Editing Mode Buttons */}
              {isEditing && (
                <>
                    <button
                        onClick={handleSave}
                        className="px-2 py-1 rounded bg-green-500 text-white hover:bg-green-600"
                    >
                  Download
                </button>
                <button
                onClick={handleUploadToChat}
                className="px-2 py-1 rounded bg-purple-500 text-white hover:bg-purple-600"
              >
                Send to Chat
              </button>
              </>
              )}
              <button
                onClick={onClose}
                className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-auto bg-white dark:bg-gray-700">
            {isEditing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none"
              />
            ) : (
              <div className="whitespace-pre-wrap">{content}</div>
            )}
          </div>
        </div>
      );
    };
    
    export default FileViewer;