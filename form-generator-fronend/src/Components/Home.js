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
  const [heading, setHeading] = useState(""); // State for the heading

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setFileName(event.target.files[0].name); // Set the filename
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      const response = await fetch(`http://localhost:5000/templates`);
      const data = await response.json();
      setUploadedFiles(data);
    };
    fetchTemplates();
  }, []);

  const handleUpload = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("docFile", file);
    formData.append("name", fileName);
    formData.append("heading", heading); // Append the heading to the formData

    const pdfFile = await convertWordToPdf(file);
    console.log(pdfFile + " this is the pdf file");
    formData.append("pdfFile", pdfFile);

    formData.forEach((value, key) => {
      console.log(key, value);
    });

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setPlaceholders(data.placeholders);
      setFile(null);
      setHeading(""); // Reset heading after upload
    } catch (error) {
      console.error("Error uploading file:", error);
    }
    setIsEdit(true);
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-1 p-4 pt-28">
        {isEdit ? (
          <EditForm setIsEdit={setIsEdit} placeholders={placeholders} fileName={fileName} />
        ) : (
          <>
            <form onSubmit={handleUpload} className="flex flex-col items-end p-2">
              <input
                type="file"
                accept=".docx"
                onChange={handleFileChange}
                required
                className="w-52 font-thin mb-2"
              />
              {file && ( // Show heading input only if a file is selected
                <input
                  type="text"
                  placeholder="Enter heading"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  required
                  className="border border-gray-300 p-2 rounded mb-2"
                />
              )}
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold text-xs h-8 w-24 rounded-full"
              >
                Upload
              </button>
            </form>
            <div className="text-2xl ml-10 font-sans">Public Templates for use</div>
            <div className="grid grid-cols-4 m-5 gap-2">
              {uploadedFiles.map((uploadedFile, index) => (
                <TemplateCard key={index} uploadedFile={uploadedFile} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
