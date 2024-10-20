import React, { useState } from "react";

function EditForm({ setIsEdit, placeholders }) {
  const [inputs, setInputs] = useState({});
  const [fileName, setFileName] = useState(''); // State for the file name
  const [isUpdating, setIsUpdating] = useState(false);
  const [pdfLink, setPdfLink] = useState(null); // State for the PDF link

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setInputs({ ...inputs, [name]: value });
  };

  const handleFileNameChange = (event) => {
    setFileName(event.target.value); // Update fileName state
  };

  const downloadPdf = () => {
    if (pdfLink) {
      const link = document.createElement('a');
      link.href = pdfLink;
      link.download = `${fileName}-updated.pdf`; // Use the user-provided file name
      link.click();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Submitting data:", inputs); 
    try {
      setIsUpdating(true);
      const response = await fetch('http://localhost:5000/replace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const blob = await response.blob();

      // Create a FormData object
      const formData = new FormData();
      formData.append('File', blob, 'Updated.docx'); // Append the blob with a filename

      // Convert the Word document to PDF using ConvertAPI
      const convertResponse = await fetch('https://v2.convertapi.com/convert/docx/to/pdf', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer secret_XA6DBzAjh8XjCOTX',
        },
        body: formData,
      });

      if (!convertResponse.ok) throw new Error('Conversion request failed');
      const convertData = await convertResponse.json();
      console.log(convertData + " modified");
      const pdfFile = convertData.Files[0];
      console.log("modified data+++++", blob, pdfFile);
      
      // Set the PDF link to the state
      setPdfLink(`data:application/pdf;base64,${pdfFile.FileData}`);
      setIsUpdating(false); // Reset the updating state

    } catch (error) {
      console.error('Error generating document:', error);
      setIsUpdating(false); // Reset the updating state on error
    }
  };

  return (
    <>
      {!isUpdating && pdfLink === null ? ( // Show form if not updating and no PDF link
        <div className="flex justify-center mt-8">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg border border-gray-700 w-[60%] shadow-md"
          >
            {/* File Name Input at the Top */}
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-2 text-gray-700">
                Enter File Name:
              </label>
              <input
                type="text"
                value={fileName}
                onChange={handleFileNameChange}
                className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                required 
              />
            </div>
            <h2 className="text-xl font-semibold mb-4">Fill in the placeholders:</h2>
            {placeholders.map((placeholder, index) => (
              <div key={index} className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">
                  {placeholder}:
                </label>
                <input
                  type="text"
                  name={placeholder}
                  value={inputs[placeholder] || ''} 
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required 
                />
              </div>
            ))}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200"
            >
              Generate Document
            </button>
          </form>
        </div>
      ) : isUpdating ? ( 
        <div className="flex justify-center mt-8">
          <p>Processing...</p>
        </div>
      ) : (
        <div className="mt-4 flex justify-center">
          <button
            onClick={downloadPdf}
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200"
          >
            Download PDF
          </button>
        </div>
      )}
    </>
  );
}

export default EditForm;
