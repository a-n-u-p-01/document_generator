export const convertWordToPdf = async (docFile) => {
  console.log(docFile + " converting doc to pdf");
  const formData = new FormData();
  formData.append("File", docFile, "Updated.docx");

  try {
    const convertResponse = await fetch(
      "https://v2.convertapi.com/convert/docx/to/pdf",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer secret_XA6DBzAjh8XjCOTX",
        },
        body: formData,
      }
    );

    if (!convertResponse.ok) throw new Error('Conversion request failed');

    const convertData = await convertResponse.json();
    console.log("Conversion response data:", convertData);

    const pdfFile = convertData.Files[0];
    if (!pdfFile || !pdfFile.FileData) {
      throw new Error('No valid PDF data returned');
    }

    // console.log("Word to PDF conversion successful", pdfFile, docFile);

    // Convert base64 to a Blob
    const pdfBlob = await fetch(`data:application/pdf;base64,${pdfFile.FileData}`).then(res => res.blob());
    
    // Create a URL for the blob
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Trigger a download
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'converted.pdf'; // Name for the downloaded file
    document.body.appendChild(link); // Append link to the body
    link.click(); // Programmatically click the link
    document.body.removeChild(link); // Remove the link after downloading
    URL.revokeObjectURL(pdfUrl); // Clean up the URL object

    return pdfBlob; // Return the PDF Blob directly
  } catch (error) {
    console.error("Error:", error);
    return "Something went wrong while converting";
  }
};
