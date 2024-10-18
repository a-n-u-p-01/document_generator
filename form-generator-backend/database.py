import mysql.connector

class Template:
    def __init__(self):
        self.connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="1230",
            database="template"
        )
        self.cursor = self.connection.cursor()

    def save_template(self, pdfFile, docFile):
        # Example SQL query to insert the template into the database
        sql = "INSERT INTO templates (pdf_file, doc_file) VALUES (%s, %s)"
        values = (pdfFile, docFile)
        
        self.cursor.execute(sql, values)
        self.connection.commit()

        # Return a temp_obj that might represent the saved template
        temp_obj = {"id": self.cursor.lastrowid, "pdfFile": pdfFile, "docFile": docFile}
        return "file saved"

    def close(self):
        self.cursor.close()
        self.connection.close()

# Example usage:
# template = Template()
# result = template.save_template("file.pdf", "file.docx")
# print(result)
# template.close()
