"""Streamlit Azure OpenAI MTR Extraction App"""

import os
import json
from io import BytesIO
from typing import Optional
import streamlit as st

try:
    from dotenv import load_dotenv
    load_dotenv()
    DOTENV_LOADED = True
except ImportError:
    DOTENV_LOADED = False

try:
    from openai import AzureOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

st.set_page_config(page_title="AI-Powered MTR Validation (Azure)", page_icon="🤖", layout="wide")

AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION")

st.markdown(
    """
<style>
  .stApp { background:#0E1117; color:#f5f5f5; }
  h1,h2,h3 { color:#fff; }
  .stButton>button { background:#262730; color:#fff; border:1px solid #4B4E53; }
  .stButton>button:hover { color:#00A67E; border-color:#00A67E; }
  .stFileUploader { border:1px dashed #4B4E53; padding:0.75rem; background:#1a1c23; }
  .json-box { font-family:monospace; white-space:pre; background:#1a1c23; padding:1rem; border-radius:6px; }
</style>
""",
    unsafe_allow_html=True,
)

MTR_JSON_TEMPLATE = """{
  "Category": "{Category}",
  "CompanyMTRFileID": null,
  "HeatNumber": "",
  "CertificationDate": "",
  "MatlFacilityDetails": {
    "{Category}ManufacturerName": "",
    "{Category}ManufacturerLocation": ""
  },
  "HN{Category}Details": [
    {
      "{Category}Number": "",
      "NominalOD": "{NominalOD} {NominalODUnit}",
      "NominalWallThickness": "{NominalWallThickness} {NominalWallThicknessUnit}",
      "HN{Category}TensileTestResults": {
        "YieldStrength": "{YieldStrength} {YieldStrengthUnit}",
        "YieldStrengthMeasurementLocation": "",
        "UltimateTensileStrength": "{UltimateTensileStrength} {UltimateTensileStrengthUnit}",
        "BodyTensileSpecimenSize": "",
        "BodyTensileSpecimenType": "",
        "BodyTensileSpecimenOrientation": "",
        "BodyTensileSpecimenGaugeLength": "{BodyTensileSpecimenGaugeLength} {BodyTensileSpecimenGaugeLengthUnit}",
        "ElongationPercentage": "",
        "YTRatio": "",
        "SeamWeldTensileStrength": "{SeamWeldTensileStrength} {SeamWeldTensileStrengthUnits}",
        "BendTest": "",
        "FlatteningTest": "",
        "GuidedBendTest": ""
      },
      "HN{Category}CVNResults": {
        "CVNAbsorbedEnergyAverage": "{CVNAbsorbedEnergyAverage} {CVNAbsorbedEnergyUnit}",
        "CVNAbsorbedEnergy1": "{CVNAbsorbedEnergy1} {CVNAbsorbedEnergyUnit}",
        "CVNAbsorbedEnergy2": "{CVNAbsorbedEnergy2} {CVNAbsorbedEnergyUnit}",
        "CVNAbsorbedEnergy3": "{CVNAbsorbedEnergy3} {CVNAbsorbedEnergyUnit}",
        "CVNDuctilityShearAveragePercentage": "",
        "CVNDuctilityShear1Percentage": "",
        "CVNDuctilityShear2Percentage": "",
        "CVNDuctilityShear3Percentage": "",
        "CVNSpecimenLocation": "",
        "CVNSpecimenOrientation": "",
        "CVNTestTemperature": "{CVNTestTemperature} {CVNTestTemperatureUnit}"
      },
      "HN{Category}HydroTestResults": {
        "CertifiedMinHydroTestPressure": "{CertifiedMinHydroTestPressure}{CertifiedHydroTestPressureUnit}",
        "SpecifiedMinimumHydroStaticTestDuration": "{SpecifiedMinimumHydroStaticTestDuration}{SpecifiedHydrostaticTestDurationUnit}"
      },
      "HN{Category}ChemicalResults": {
        "SectionLabel": "{Heat/LADLE/L/H/NO LABEL}",
        "C": "",
        "Mn": "", 
        "P": "", 
        "S": "", 
        "Si": "", 
        "Ti": "", 
        "Cu": "", 
        "Ni": "",
        "Mo": "", 
        "Cr": "", 
        "V": "", 
        "Al": "", 
        "B": "", 
        "N": "", 
        "Ca": "",
        "CEPcm": "", 
        "CEPcmCriteria": "", 
        "CEIIW": "", 
        "CEIIWCriteria": ""
      },
      "HN{Category}ChemicalCompResults": {
        "SectionLabel": "{CHECK1/PRODUCT1/P/NO LABEL}",
       "C": "",
        "Mn": "", 
        "P": "", 
        "S": "", 
        "Si": "", 
        "Ti": "", 
        "Cu": "", 
        "Ni": "",
        "Mo": "", 
        "Cr": "", 
        "V": "", 
        "Al": "", 
        "B": "", 
        "N": "", 
        "Ca": "",
      },
      "HN{Category}ChemicalComp2Results": {
        "SectionLabel": "{CHECK2/PRODUCT2/P/NO LABEL}",
       "C": "",
        "Mn": "", 
        "P": "", 
        "S": "", 
        "Si": "", 
        "Ti": "", 
        "Cu": "", 
        "Ni": "",
        "Mo": "", 
        "Cr": "", 
        "V": "", 
        "Al": "", 
        "B": "", 
        "N": "", 
        "Ca": "",
      },
      "HN{Category}ChemicalEquivResults": {
        "SectionLabel": "{CHECK/PRODUCT/P/NO LABEL}",
        "CEPcm": "", 
        "CEPcmCriteria": "", 
        "CEIIW": "", 
        "CEIIWCriteria": ""
      }
    }
  ],
  "ExtractionNotes": ""
}"""

SYSTEM_INSTRUCTION = (
    "You are an expert assistant for Mill Test Report (MTR) extraction. "
    "Return ONLY valid JSON matching the supplied template; if a field is missing leave blank or null. "
    f"Template: {MTR_JSON_TEMPLATE}"
)

def build_client() -> Optional[AzureOpenAI]:
    if not OPENAI_AVAILABLE:
        return None
    if not (AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY and AZURE_OPENAI_DEPLOYMENT and AZURE_OPENAI_API_VERSION):
        return None
    try:
        return AzureOpenAI(
            api_key=AZURE_OPENAI_API_KEY,
            api_version=AZURE_OPENAI_API_VERSION,
            azure_endpoint=AZURE_OPENAI_ENDPOINT,
        )
    except Exception:
        return None

def extract_pdf_text(uploaded_file) -> str:
    if not uploaded_file:
        return ""
    name = uploaded_file.name.lower()
    if name.endswith(".pdf") and PDF_AVAILABLE:
        try:
            reader = PyPDF2.PdfReader(BytesIO(uploaded_file.read()))
            pages = []
            for page in reader.pages[:5]:
                pages.append(page.extract_text() or "")
            return "\n\n".join(pages)
        except Exception as e:
            return f"(PDF extraction error: {e})"
    try:
        return uploaded_file.read().decode(errors="ignore")
    except Exception:
        return "(Unable to decode file as text)"

def call_azure_openai(client: AzureOpenAI, category: str, file_text: str) -> str:
    prompt = (
        f"Extract MTR data for category '{category}'. Source text below:\n\n{file_text}\n\nReturn ONLY JSON."
    )
    try:
        resp = client.chat.completions.create(
            model=AZURE_OPENAI_DEPLOYMENT,
            messages=[
                {"role": "system", "content": SYSTEM_INSTRUCTION},
                {"role": "user", "content": prompt},
            ],
            temperature=0.0,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        return json.dumps({"error": str(e)})

st.title("AI-Powered MTR Validation (Azure OpenAI)")
st.caption("Environment variable driven; Gemini remnants removed. .env loaded: {}".format("yes" if DOTENV_LOADED else "no"))
client = build_client()
if not OPENAI_AVAILABLE:
    st.error("openai package not installed (pip install -r requirements.txt)")
elif client is None:
    st.warning("Azure OpenAI env vars incomplete or client init failed.")

category = st.text_input("Category", value="Pipe")
uploaded = st.file_uploader("Upload MTR PDF or text", type=["pdf","txt","csv","md","json"])  # pdf prioritized
run_btn = st.button("Extract JSON", disabled=client is None)

if run_btn and client:
    with st.spinner("Extracting..."):
        file_text = extract_pdf_text(uploaded)
        output = call_azure_openai(client, category, file_text)
    st.subheader("Result JSON")
    st.markdown(f"<div class='json-box'>{output}</div>", unsafe_allow_html=True)
    try:
        parsed = json.loads(output)
        st.download_button("Download JSON", json.dumps(parsed, indent=2), file_name="mtr_extraction.json", mime="application/json")
    except Exception:
        st.info("Model output not valid JSON for parsing; raw shown.")

st.divider()
st.caption("Never commit real secrets. Use secure secret storage in production.")