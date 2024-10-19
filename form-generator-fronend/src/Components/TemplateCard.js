import React, { useEffect, useState } from "react";

function TemplateCard({ uploadedFile, handleUse }) {
  const [pdfData, setPdfData] = useState(null);
  const [docData, setDocData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (uploadedFile) {

      // Handle PDF file
      if (uploadedFile.pdf_file) {
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
        } catch (err) {
          console.error(err);
          setError("Error creating PDF URL: " + err.message);
        }
      }
      // Handle DOC file
      if (uploadedFile.doc_file) {
        try {
          const base64DocData = uploadedFile.doc_file;
          const byteCharacters = atob(base64DocData);
          const byteNumbers = new Uint8Array(byteCharacters.length);

          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const blobDoc = new Blob([byteNumbers], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
          setDocData(blobDoc);
        } catch (err) {
          console.error(err);
          setError("Error creating DOC URL: " + err.message);
        }
      }
    }
  }, [uploadedFile]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="w-80 h-fit flex items-center justify-center m-4 p-2 rounded border border-gray-300 bg-white">
      {pdfData ? (
        <div className="flex flex-col justify-center w-full">
          <span className="font-semibold m-1">{uploadedFile.heading}</span>
          <iframe
            src={pdfData}
            width="100%"
            height="300"
            title="PDF Document"
            className="overflow-y-hidden rounded-t-md"
            allow="fullscreen"
          />
          <button onClick={() => {
            console.log("Using Document Data:", docData);
            handleUse(docData);
          }} className="bg-green-400 hover:bg-green-500 text-white font-semibold py-1 px-2 rounded-b-md transition duration-300">
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
