import json
from openai import AzureOpenAI
import os

client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version="2024-10-21",
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)

def analyze_resume_review(text):

    prompt = f"""
TASK:
Analyze the resume and return ONLY a valid JSON object.

RESUME:
{text}

RULES:
- Output MUST be valid JSON.
- Do NOT output markdown.
- Do NOT output explanations.
- Do NOT output comments.
- Do NOT output notes.
- Do NOT output text before JSON.
- Do NOT output text after JSON.
- Do NOT use first-person language.
- Do NOT invent information.
- Use evidence found in the resume only.
- Never return null.
- Never return undefined.
- Every field must exist.
- All array items must be strings.
- No extra fields.

SCORING:
- score must be an integer.
- score must be between 1 and 100.

SKILLS:
- Extract only from resume content.
- Minimum 3 items.

STRENGTHS:
- Based only on evidence found in the resume.
- Minimum 1 item.

WEAKNESSES:
- Based only on missing or limited evidence in the resume.
- Minimum 1 item.

RECOMMENDATIONS:
- Must address weaknesses.
- Minimum 1 item.

JSON:

{{
  "score": 80,
  "skills": [
    "Skill 1",
    "Skill 2",
    "Skill 3"
  ],
  "strengths": [
    "Strength 1"
  ],
  "weaknesses": [
    "Weakness 1"
  ],
  "recommendations": [
    "Recommendation 1"
  ]
}}

Return ONLY the JSON object.
"""



    response = client.chat.completions.create(
    model=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
    messages=[
        {
            "role": "user",
            "content": prompt
        }
    ],
    temperature=0,
    response_format={"type": "json_object"}
)

    result = response.choices[0].message.content

    print(result)

    try:
        parsed_result = json.loads(result)
        return parsed_result

    except Exception as e:
        return {
        "error": str(e),
        "raw_response": result
    }
