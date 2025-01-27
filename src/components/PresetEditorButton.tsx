"use client";

import { useState } from "react";
import PresetEditor from "./PresetEditor"; // Adjust the import path if necessary

export default function PresetEditorButton() {
  const [isEditorVisible, setIsEditorVisible] = useState(false);

  return (
    <div>
      {/* Button to open Preset Editor */}
      <button
        onClick={() => setIsEditorVisible(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
         Preset Editor
      </button>

      {/* Overlay for Preset Editor */}
      {isEditorVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-3xl relative">
            {/* Close Button */}
            <button
              onClick={() => setIsEditorVisible(false)}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Close
            </button>

            {/* Preset Editor Component */}
            <PresetEditor closeEditor={function (): void {
                          throw new Error("Function not implemented.");
                      } } />
          </div>
        </div>
      )}
    </div>
  );
}
