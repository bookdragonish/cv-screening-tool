# Usage: Activate venv in backend folder, then run:
#   .\venv\Scripts\activate
#   python src\cvToMarkdown.py "src\mockCV.pdf"
# And to exit, run:
#   deactivate

import sys

from marker.converters.pdf import PdfConverter
from marker.models import create_model_dict
from marker.output import text_from_rendered

def cv_to_markdown(pdf_path: str):
    converter = PdfConverter(
        artifact_dict=create_model_dict(),
    )
    rendered = converter(pdf_path)
    text, _, _ = text_from_rendered(rendered)
    return text

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Format for the input: python cvToMarkdown.py <pdf_path>")
        sys.exit(1)
    pdf_path = sys.argv[1]
    text = cv_to_markdown(pdf_path)
    print(text)