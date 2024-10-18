from flask import Flask, request, send_file
from flask_cors import CORS
from docx import Document
import re
from database import Template
app = Flask(__name__)
CORS(app)
@app.route('/upload', methods=['POST'])
def upload_file():
    print("_______________Uploaded file received________________", request.form.get("pdfFile"))
    
    # Assuming the uploaded file is sent with key 'file'
    file = request.files['file']

    # Read the file content as binary before saving it
    doc_file_content = file.read()  # Read the content of the uploaded file    
    # Save the file locally
    file_path = 'uploaded.docx'
    with open(file_path, 'wb') as f:
        f.write(doc_file_content)  # Save the binary content to a file

    # Create an instance of the Template class
    template_obj = Template() 

    # Save the template in the database with the binary content of the DOC file
    pdf_file = request.form.get("pdfFile")  # Get the PDF file name from the form
    print("File uploaded and saved.", template_obj.save_template(pdf_file, doc_file_content))
    template_obj.close()

    # Load the document and find placeholders
    doc = Document(file_path)
    placeholders = []

    for p in doc.paragraphs:
        if '{{' in p.text:
            found_placeholders = re.findall(r'\{\{\s*(.*?)\s*\}\}', p.text)
            placeholders.extend(found_placeholders)

    # Remove duplicates
    placeholders = list(set(placeholders))
    print(f"Found placeholders: {placeholders}")

    return {'placeholders': placeholders}


@app.route('/replace', methods=['POST'])
def replace_placeholders():
    data = request.json

    if not data:
        return {"error": "No data provided"}, 400

    print(f"Received data for replacement: {data}")

    try:
        doc = Document('uploaded.docx')
        updated = False

        # Prepare regex pattern for all placeholders
        for placeholder, value in data.items():
            placeholder_regex = r'\{\{\s*' + re.escape(placeholder.strip()) + r'\s*\}\}'
            pattern = re.compile(placeholder_regex, re.IGNORECASE)

            # Iterate through paragraphs
            for p in doc.paragraphs:
                # Concatenate runs to check for placeholders
                full_text = ''.join(run.text for run in p.runs)
                matches = pattern.finditer(full_text)

                for match in matches:
                    updated = True  # Mark that we've found a match
                    start, end = match.span()  # Get start and end indices of the match

                    # Replace the placeholder text in the paragraph
                    # Iterate through runs to update text
                    current_index = 0
                    for run in p.runs:
                        run_length = len(run.text)
                        run_end_index = current_index + run_length

                        # Check if the match falls within this run
                        if current_index < end and run_end_index > start:
                            # Create new text by replacing the match
                            new_run_text = full_text[:start] + value + full_text[end:]
                            # Clear the run and set the new text
                            run.text = new_run_text[current_index:current_index + run_length]
                            print(f"Updated run text: {run.text}")

                        current_index += run_length

        if updated:
            doc.save('uploaded.docx')  # Save the updated document
            print("Document updated and saved as uploaded.docx.")
            return send_file('uploaded.docx', as_attachment=True)
        else:
            print("No placeholders found to replace.")
            return {"error": "No placeholders found"}, 400

    except Exception as e:
        print(f"Error updating document: {e}")
        return {"error": "Error updating document"}, 500

if __name__ == '__main__':
    app.run(debug=True)
