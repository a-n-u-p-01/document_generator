import mysql.connector
import base64

class Template:
    def __init__(self):
        self.connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="1230",
            database="template"
        )
        self.cursor = self.connection.cursor()

    def save_template(self,name,heading, pdfFile, docFile):
        # SQL query to insert the template into the database
        sql = "INSERT INTO templates (name, heading, pdf_file, doc_file) VALUES (%s, %s, %s, %s)"
        values = (name,heading,pdfFile, docFile)
        
        self.cursor.execute(sql, values)
        self.connection.commit()

        # Return a temp_obj that might represent the saved template
        temp_obj = {"id": self.cursor.lastrowid, "pdf_file": pdfFile, "doc_file": docFile}
        return "file saved"
    
    def getAll(self):
        sql = "SELECT * FROM templates"
        self.cursor.execute(sql)
        
        # Fetch all results
        results = self.cursor.fetchall()
        
        # Return a list of dictionaries representing the templates
        templates = []
        for row in results:
            
            pdf_file = base64.b64encode(row[2]).decode('utf-8') if isinstance(row[2], bytes) else row[2]
            doc_file = base64.b64encode(row[3]).decode('utf-8') if isinstance(row[3], bytes) else row[3]
            
            template_obj = {
                "id": row[0],
                "pdf_file": pdf_file,
                "doc_file": doc_file,
                "name": row[1],
                "heading": row[4]
            }
            templates.append(template_obj)
        
        return templates

    def close(self):
        self.cursor.close()
        self.connection.close()

# Example usage:
# template = Template()
# result = template.save_template("file.pdf", "file.docx")
# print(result)
# all_templates = template.getAll()
# print(all_templates)
# template.close()
