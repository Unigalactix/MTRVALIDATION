import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = "gemini-2.5-flash";

export interface FilePart {
    inlineData: {
        data: string; // base64
        mimeType: string;
    };
}

const MTR_JSON_TEMPLATE = `{
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
        "C": "0.09", "Mn": "1.58", "P": "0.01", "S": "0", "Si": "0.28", "Ti": "0.013", "Cu": "0.002", "Ni": "0.003", "Mo": "0.001", "Cr": "0.02", "V": "0.01", "Al": "0.032", "B": "0.0002", "N": "0.005", "Ca": "0.008",
        "CEPcm": "0.18", "CEPcmCriteria": "0.25 max", "CEIIW": "", "CEIIWCriteria": ""
      },
      "HN{Category}ChemicalCompResults": {
        "SectionLabel": "{CHECK1/PRODUCT1/P/NO LABEL}",
        "C": "0.09", "Mn": "1.58", "P": "0.011", "S": "0.002", "Si": "0.28", "Ti": "0.013", "Cu": "0.002", "Ni": "0.003", "Mo": "0.001", "Cr": "0.02", "V": "0.008", "Al": "0.032", "B": "0.002", "N": "0.005", "Ca": "0.008"
      },
      "HN{Category}ChemicalComp2Results": {
        "SectionLabel": "{CHECK2/PRODUCT2/P/NO LABEL}",
        "C": "0.09", "Mn": "1.58", "P": "0.011", "S": "0.002", "Si": "0.28", "Ti": "0.013", "Cu": "0.002", "Ni": "0.003", "Mo": "0.001", "Cr": "0.02", "V": "0.008", "Al": "0.032", "B": "0.002", "N": "0.005", "Ca": "0.008"
      },
      "HN{Category}ChemicalEquivResults": {
        "SectionLabel": "{CHECK/PRODUCT/P/NO LABEL}",
        "CEPcm": "0.18", "CEPcmCriteria": "0.25 max", "CEIIW": "", "CEIIWCriteria": ""
      }
    }
  ],
  "ExtractionNotes": ""
}`;

export const run = async (prompt: string, file?: FilePart): Promise<{ response: string } | { error: string }> => {
    try {
        const contents = file ? { parts: [{ text: prompt }, file] } : prompt;
        
        const systemInstruction = `You are an AI assistant specializing in analyzing Mill Test Reports (MTRs).
Your primary task is to analyze text or a PDF from an MTR and extract key information.

- If the user provides an MTR (as text or a file), you MUST extract the data and respond with a single, valid JSON object conforming to the template below.
- Do NOT include any text, markdown, or explanations before or after the JSON object. The response should be only the JSON.
- If a value cannot be found in the MTR, use null or an empty string.

- If the user asks a general question about MTRs (e.g., "What is a heat number?"), answer it concisely in plain text. Do NOT use the JSON format for general questions.

JSON Template for MTR extraction:
${MTR_JSON_TEMPLATE}
`;

        const result = await ai.models.generateContent({
            model,
            contents,
            config: {
                systemInstruction
            }
        });

        const response = result.text;
        return { response };

    } catch (error) {
        console.error("Error running chat:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { error: `Failed to communicate with the Gemini API. ${errorMessage}` };
    }
};
