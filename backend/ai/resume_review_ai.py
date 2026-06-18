import ollama
import json
import re


def analyze_resume_review(text):

    prompt = prompt = f"""
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



    response = ollama.chat(
        model='phi3',
        messages=[
            {
                'role': 'user',
                'content': prompt
            }
        ]
    )

    result = response['message']['content']

    print(result)

    # AMBIL JSON SAJA
    match = re.search(r'\{.*\}', result, re.DOTALL)

    if match:

        json_text = match.group(0)

        # HAPUS TRAILING COMMA
        json_text = re.sub(r',\s*]', ']', json_text)
        json_text = re.sub(r',\s*}', '}', json_text)

        try:
            parsed_result = json.loads(json_text)
            return parsed_result

        except Exception as e:

            return {
                "error": str(e),
                "cleaned_json": json_text,
                "raw_response": result
            }

    return {
        "error": "No valid JSON found",
        "raw_response": result
    }