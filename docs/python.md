# Usage (in the backend folder)

1. **Create a virtual environment:**
   ```sh
   python -m venv venv
   ```

2. **Activate the virtual environment:**
   - **Windows:**
     ```sh
     .\venv\Scripts\activate
     ```
   - **macOS/Linux:**
     ```sh
     source venv/bin/activate
     ```

3. **Install dependencies:**
   ```sh
   pip install marker-pdf
   ```

4. **Run the script:**
   ```sh
   python src\cvToMarkdown.py "src\mockCV.pdf"
   ```

5. **To exit the virtual environment:**
   ```sh
   deactivate
   ```