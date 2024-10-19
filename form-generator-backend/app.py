from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from docx import Document
import re
from database import Template

app = Flask(__name__)
CORS(app)

@app.route('/upload', methods=['POST'])
def upload_file():
    print("_______________Uploaded file received________________", request.files)
    
    # Assuming the uploaded file is sent with key 'file'
    doc_file = request.files['docFile']
    name = request.form.get('name')
    heading = request.form.get('heading')
    # Read the file content as binary before saving it
    doc_file_content = doc_file.read()
    file_path = 'uploaded.docx'
    
    with open(file_path, 'wb') as f:
        f.write(doc_file_content)

    # Create an instance of the Template class
    template_obj = Template() 

    # Save the template in the database with the binary content of the DOC file
    pdf_file_content = request.files["pdfFile"].read()
    
    print(name,heading,"+++++++++++++++++++++++++++----------=========")
    print("File uploaded and saved.", template_obj.save_template(name,heading,pdf_file_content, doc_file_content ))
    template_obj.close()

    # Load the document and find placeholders
    doc = Document(file_path)
    placeholders = []

    for p in doc.paragraphs:
        if '{{' in p.text:
            found_placeholders = re.findall(r'\{\{\s*(.*?)\s*\}\}', p.text)
            placeholders.extend(found_placeholders)

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

        for placeholder, value in data.items():
            placeholder_regex = r'\{\{\s*' + re.escape(placeholder.strip()) + r'\s*\}\}'
            pattern = re.compile(placeholder_regex, re.IGNORECASE)

            for p in doc.paragraphs:
                full_text = ''.join(run.text for run in p.runs)
                matches = pattern.finditer(full_text)

                for match in matches:
                    updated = True
                    start, end = match.span()

                    current_index = 0
                    for run in p.runs:
                        run_length = len(run.text)
                        run_end_index = current_index + run_length

                        if current_index < end and run_end_index > start:
                            new_run_text = full_text[:start] + value + full_text[end:]
                            run.text = new_run_text[current_index:current_index + run_length]

                        current_index += run_length

        if updated:
            doc.save('uploaded.docx')
            print("Document updated and saved as uploaded.docx.")
            return send_file('uploaded.docx', as_attachment=True)
        else:
            print("No placeholders found to replace.")
            return {"error": "No placeholders found"}, 400

    except Exception as e:
        print(f"Error updating document: {e}")
        return {"error": "Error updating document"}, 500

@app.route('/templates', methods=['GET'])
def get_templates():
    # Create an instance of the Template class
    template_obj = Template()
    templates = template_obj.getAll()  # Get all templates
    template_obj.close()
    
    return jsonify(templates)  # Return templates as JSON

if __name__ == '__main__':
    app.run(debug=True)
