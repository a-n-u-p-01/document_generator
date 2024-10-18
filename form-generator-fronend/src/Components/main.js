import React, { useState } from 'react';

function main() {
    const [file, setFile] = useState(null);
    const [placeholders, setPlaceholders] = useState([]);
    const [inputs, setInputs] = useState({});

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setPlaceholders(data.placeholders);
            setInputs(data.placeholders.reduce((acc, placeholder) => {
                acc[placeholder] = '';
                return acc;
            }, {}));
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setInputs({ ...inputs, [name]: value });
    };



    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log("Submitting data:", inputs);  // Log input data
        try {
            // Call the server to get the updated Word document first
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
    
            // Now convert the Word document to PDF using ConvertAPI
            const convertResponse = await fetch('https://v2.convertapi.com/convert/docx/to/pdf', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer secret_XA6DBzAjh8XjCOTX',
                },
                body: formData,
            });
    
            if (!convertResponse.ok) throw new Error('Conversion request failed');
    
            const convertData = await convertResponse.json();
            console.log(convertData); 
            const pdfFile = convertData.Files[0]; 
            const link = document.createElement('a');
            link.href = `data:application/pdf;base64,${pdfFile.FileData}`;
            link.download = pdfFile.FileName;
            link.click();
    
        } catch (error) {
            console.error('Error generating document:', error);
        }
    };
    

    return (
        <div className="App">
            <h1>Word Document Placeholder Replacer</h1>
            <form onSubmit={handleUpload}>
                <input type="file" accept=".docx" onChange={handleFileChange} required />
                <button type="submit">Upload</button>
            </form>
            {placeholders.length > 0 && (
                <form onSubmit={handleSubmit}>
                    <h2>Fill in the placeholders:</h2>
                    {placeholders.map((placeholder, index) => (
                        <div key={index}>
                            <label>{placeholder}:</label>
                            <input
                                type="text"
                                name={placeholder}
                                value={inputs[placeholder]}
                                onChange={handleInputChange}
                            />
                        </div>
                    ))}
                    <button type="submit">Generate Document</button>
                </form>
            )}
        </div>
    );
}

export default main;
