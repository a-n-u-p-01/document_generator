import React, { useEffect, useState } from "react";

function TemplateCard({ uploadedFile, handleUse }) {
  const [pdfData, setPdfData] = useState(null);
  const [docData, setDocData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Simulate a delay for loading (e.g., 2 seconds)
    const timer = setTimeout(() => {
      setLoading(false); // Set loading to false after 2 seconds
    }, 2000);

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

    // Cleanup timeout on unmount
    return () => clearTimeout(timer);
  }, [uploadedFile]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Skeleton Loader JSX
  const SkeletonLoader = () => (
    <div className="w-full h-72 bg-gray-300 animate-pulse rounded-md">
      <div className="h-6 bg-gray-400 rounded w-1/2 mb-2 mt-4 mx-auto"></div>
      <div className="h-full bg-gray-200 rounded"></div>
    </div>
  );

  return (
    <div className="w-80 h-fit flex items-center justify-center m-4 p-2 rounded border border-gray-300 bg-white">
      {loading ? (
        <SkeletonLoader /> // Show skeleton loader when loading
      ) : (
        <div className="flex flex-col justify-center w-full">
          <span className="font-semibold m-1">{uploadedFile.heading}</span>
          {pdfData ? (
            <iframe
              src={pdfData}
              width="100%"
              height="300"
              title="PDF Document"
              className="overflow-y-hidden rounded-t-md"
              allow="fullscreen"
            />
          ) : (
            <div>No PDF available</div>
          )}
          <button
            onClick={() => {
              console.log("Using Document Data:", docData);
              handleUse(docData);
            }}
            className="bg-green-400 hover:bg-green-500 text-white font-semibold py-1 px-2 rounded-b-md transition duration-300"
          >
            Use
          </button>
        </div>
      )}
    </div>
  );
}

export default TemplateCard;
