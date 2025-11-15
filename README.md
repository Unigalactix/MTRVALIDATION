<div align="center">
   <img width="100%" alt="MTR Validation" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# MTR Validation (Streamlit + Azure OpenAI)

Interactive Streamlit app that ingests a procedure (PDF or raw text) and extracts a structured JSON representation of key metadata (MTR fields) using Azure OpenAI. This repository was previously a React/Vite front‑end; it has been streamlined into a single Python application (`app.py`).

## Features
- Upload PDF (first up to 5 pages parsed) or paste raw text
- Provide a category for contextual extraction
- Azure OpenAI Chat Completion call with strict system instruction
- Returns validated JSON (or an error JSON if formatting fails)
- Download the JSON output directly from the UI
- Environment variables loaded securely from `.env` (not committed)

## Prerequisites
1. Python 3.11+ (tested with 3.12)
2. An Azure OpenAI resource with a deployed model (GPT‑4o / GPT‑4 or suitable) supporting the Chat Completions API.
3. The following environment values:
    - `AZURE_OPENAI_ENDPOINT` (e.g. `https://your-resource.openai.azure.com`)
    - `AZURE_OPENAI_API_KEY`
    - `AZURE_OPENAI_DEPLOYMENT` (deployment name of your model)
    - `AZURE_OPENAI_API_VERSION` (e.g. `2024-06-01`)

## Quick Start (Windows PowerShell)
```powershell
# Clone (if you haven't already)
git clone https://github.com/Unigalactix/MTRVALIDATION.git
cd MTRVALIDATION

# Create & activate virtual environment
python -m venv .venv
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (example values)
@'
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your_key_here
AZURE_OPENAI_DEPLOYMENT=your_deployment_name
AZURE_OPENAI_API_VERSION=2024-06-01
'@ | Out-File -Encoding UTF8 .env

# Run the app
streamlit run app.py
```

## Usage
1. Start the app: `streamlit run app.py`.
2. In the left panel or main page (UI elements rendered by Streamlit):
    - Enter a Category (context label).
    - Upload a PDF OR paste procedure text into the text area.
3. Click the Process button.
4. The model produces JSON. If successful, a download button appears.
5. If the response is not valid JSON, the app displays an error JSON wrapper so you can inspect why.

### JSON Output Structure (Excerpt)
```jsonc
{
   "MTR": {
      "procedureId": "...",
      "title": "...",
      "category": "...",
      "revision": "...",
      "effectiveDate": "YYYY-MM-DD",
      "author": "...",
      "steps": [
         { "number": 1, "text": "...", "tools": ["..."], "warnings": ["..."] }
      ]
   },
   "extraction": {
      "model": "<deployment name>",
      "timestamp": "ISO8601"
   }
}
```
The actual schema is enforced via a system prompt template inside `app.py`.

## Environment & Security
- Secrets are never committed; `.env` is ignored via `.gitignore`.
- If any required variable is missing, the app shows a descriptive error block instead of attempting a call.

## Troubleshooting
| Issue | Likely Cause | Fix |
|-------|--------------|-----|
| Missing JSON output | Model returned non‑JSON text | App wraps error; retry or refine content. |
| 401 / 403 errors | Invalid key or insufficient permissions | Regenerate key; confirm role assignments in Azure portal. |
| Empty PDF text | Scanned or image‑only PDF | OCR not implemented; supply extracted text manually. |
| Key not loaded | `.env` not found / wrong variable names | Confirm names match list above and restart. |

## Extending
- Add OCR: integrate `pytesseract` + `pdf2image` for image‑based PDFs.
- Add stricter JSON validation: load a `pydantic` model to validate before display.
- Logging: integrate `structlog` or `logging` for audit trails.

## Former Front‑End (Removed)
React/Vite/Tailwind implementation and GitHub Pages workflow were intentionally removed to simplify maintenance. All functionality now resides in `app.py`.

## License
No explicit license specified. Add one if you plan external distribution.

---
Need enhancements (OCR, validation, more fields)? Open an issue or PR.
