import React, { useEffect, useState } from "react";

function TemplateCard({ wordFile }) {
  const [pdfData, setPdfData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (wordFile && wordFile.pdfFile) {
      try {
        const byteCharacters = atob(wordFile.pdfFile);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setPdfData(url);
      } catch (err) {
        setError("Error creating PDF URL: " + err.message);
      }
    }
  }, [wordFile]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="w-80 h-fit flex items-center justify-center m-4 p-2 rounded shadow-lg bg-white">
      {pdfData ? (
        <div className="flex flex-col justify-center w-full">
        <span>Name</span>
          <iframe
            src={pdfData}
            width="100%"
            height="300" // Set a fixed height for the iframe
            title="PDF Document"
            className="overflow-y-hidden rounded shadow"
            allow="fullscreen"
          />
          <button className="bg-green-400 mt-1 hover:bg-green-500 text-white font-semibold py-1 px-2 rounded transition duration-300">
            Use
          </button>
        </div>
      ) : (
        <div>Loading PDF...</div>
      )}
    </div>
  );
}

export default TemplateCard;
