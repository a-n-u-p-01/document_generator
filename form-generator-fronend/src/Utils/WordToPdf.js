export const convertWordToPdf = async (docFile) => {
  console.log(docFile + "convert dock - pdf");
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
    if (!convertResponse.ok) throw new Error("Conversion request failed");
    const convertData = await convertResponse.json();
    console.log(convertData);
    const pdfFile = convertData.Files[0];
    console.log("word - pdf converted succesfull");
    return pdfFile.FileData;
  } catch (error) {
    return "something went worng while converting";
  }
};
