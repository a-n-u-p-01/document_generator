import React, { useEffect, useState } from "react";

function TemplateCard({ uploadedFile }) {
  const [pdfData, setPdfData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (uploadedFile && uploadedFile.pdf_file) {
      try {
        const base64Data = uploadedFile.pdf_file;
       
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Uint8Array(byteCharacters.length);
       
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([byteNumbers], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
       
        setPdfData(url);

        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.error(err);
        setError("Error creating PDF URL: " + err.message);
      }
    }
  }, [uploadedFile]);

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
            height="300"
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
