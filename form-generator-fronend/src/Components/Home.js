import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import TemplateCard from "./TemplateCard";
import EditForm from "./EditForm";
import { convertWordToPdf } from "../Utils/WordToPdf";

function Home() {
  const [file, setFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [placeholders, setPlaceholders] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [fileName, setFileName] = useState("");
  const [heading, setHeading] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    } else {
      setFile(null);
      setFileName("");
    }
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      const response = await fetch(`http://localhost:5000/templates`);
      const data = await response.json();
      setUploadedFiles(data.reverse()); // Reverse the array before setting the state
    };
    fetchTemplates();
  }, []);

  const handleUpload = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("docFile", file);
    formData.append("name", fileName);
    formData.append("heading", heading);
    formData.append("save", 1);
    
    const pdfFile = await convertWordToPdf(file);
    formData.append("pdfFile", pdfFile);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setPlaceholders(data.placeholders);
      setFile(null);
      setHeading("");
    } catch (error) {
      console.error("Error uploading file:", error);
    }
    setIsEdit(true);
  };

  const handleUse = async (docFile) => {
    const formData = new FormData();
    formData.append("docFile", docFile);
    formData.append("name", "");
    formData.append("heading", "");
    formData.append("save", 0);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setPlaceholders(data.placeholders);
      setHeading("");
      setIsEdit(true);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 p-8 pt-20 bg-white shadow-md rounded-lg">
        {isEdit ? (
          <EditForm setIsEdit={setIsEdit} placeholders={placeholders} />
        ) : (
          <>
            <form onSubmit={handleUpload} className="flex pt-1 flex-col items-end mb-6 space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleFileChange}
                  required
                  className="border border-gray-300 rounded p-1 w-60"
                />
                <input
                  type="text"
                  placeholder="Heading"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  required
                  className="border border-gray-300 p-1 rounded w-52"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm h-10 w-24 rounded"
                >
                  Upload
                </button>
              </div>
            </form>
            <h2 className="text-xl font-semibold mb-4">Recent Uploaded Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {uploadedFiles.map((uploadedFile, index) => (
                <TemplateCard key={index} uploadedFile={uploadedFile} handleUse={handleUse} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
