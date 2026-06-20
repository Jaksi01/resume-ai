from openai import AzureOpenAI
import json
import os

client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version="2024-10-21",
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)


def replace_nulls(obj):

    if isinstance(obj, dict):
        return {
            k: replace_nulls(v)
            for k, v in obj.items()
        }

    if isinstance(obj, list):
        return [
            replace_nulls(item)
            for item in obj
        ]

    if obj is None:
        return 0

    return obj


def analyze_job_match(
    text,
    role=""
):

    prompt = f"""
You are a professional AI Job Match Analyzer.

Analyze the resume below.

RESUME:
{text}

TARGET ROLE:
{role}

IMPORTANT:

1. Return ONLY valid JSON.
2. Do NOT explain anything.
3. Do NOT add markdown.
4. Do NOT add extra text.
5. Never return null.
6. All numeric values must be integers.
7. Every field must always exist.

JOB MATCH SCORE RULES:

job_match_score evaluates how well the resume matches the Target Role.

Factors:
- Skill overlap
- Relevant experience
- Relevant technologies
- Relevant projects
- Relevant education

If Target Role is empty:
- job_match_score = 0
- matched_skills = [No target role provided]
- missing_skills = [No target role provided]


If Target Role is provided:
- job_match_score must be between 1 and 100
- do not return null

MATCHED SKILLS RULES:

matched_skills:
- skills found in both the resume and target role

missing_skills:
- skills required by the target role but missing from the resume

IMPORTANT:

- If one or more required skills are missing:
  return the missing skills.

- If the candidate already meets the minimum skill requirements for the target role:
  missing_skills MUST contain exactly one item:

  ["Your skills meet the minimum requirements for this role"]

- Do not leave missing_skills empty when a Target Role is provided.

- Do not invent missing skills.

CAREER MATCHES RULES:

Career matches MUST be generated ONLY from the resume content.

Do NOT use the Target Role when generating career_matches.

Career matches should be based ONLY on:
- skills
- projects
- technologies
- experience
- certifications
- education

The goal of career_matches is to identify the careers that best fit the candidate's actual profile.

Career matches must:
- reflect the candidate's strongest areas
- be realistic and achievable
- be based on evidence found in the resume
- not be influenced by the selected Target Role

Suggest EXACTLY 3 career roles.

The first role must be the strongest overall career fit.

The second role must be another strong career option closely related to the candidate's profile.

The third role must be a reasonable alternative career path based on transferable skills found in the resume.

Sort from highest match_percentage to lowest.

Career matches must remain mostly consistent when the Target Role changes because they are based on the resume, not the Target Role.

Role requirements:

- Use concise and professional job titles.
- Avoid overly long role names.
- Avoid company-specific job descriptions.
- Avoid fictional roles.
- Avoid duplicate roles.
- Avoid nearly identical roles.

Examples of bad role suggestions:
- Software Engineer
- Junior Software Engineer
- Software Developer

Examples of better role suggestions:
- Cloud Engineer
- DevOps Engineer
- Backend Developer

or

- Data Scientist
- Machine Learning Engineer
- Data Analyst

match_percentage:

- represents how well the resume aligns with the suggested role
- must be between 1 and 100
- never return 0
- never return null
- must be realistic
- should reflect actual career fit

The difference between match percentages should be reasonable.

Avoid unrealistic scoring such as:
- 95, 60, 10
- 90, 50, 1

Prefer realistic distributions such as:
- 90, 85, 80
- 85, 78, 72
- 75, 68, 60

RECOMMENDATIONS RULES:

- Always provide at least 1 recommendation.

- If the candidate already meets the minimum skill requirements:
  include positive feedback acknowledging that the candidate meets the minimum requirements for the target role.

- Recommendations should focus on:
  - improving competitiveness
  - practical experience
  - projects
  - certifications
  - leadership
  - communication skills
  - advanced technical skills
  - portfolio development

STRENGTHS RULES:

- Must be based on evidence found in the resume.
- Must highlight the candidate's strongest qualifications.

WEAKNESSES RULES:

- Must be constructive and professional.
- Must identify realistic improvement areas.
- Do not generate fake weaknesses unrelated to the resume.

Always provide:
- at least 3 skills
- at least 1 strength
- at least 1 weakness
- at least 1 recommendation

Use EXACTLY this structure:

{{
  "job_match_score": 0,

  "skills": [],

  "matched_skills": [],

  "missing_skills": [],

  "career_matches": [
    {{
      "role": "",
      "match_percentage": 0
    }},
    {{
      "role": "",
      "match_percentage": 0
    }},
    {{
      "role": "",
      "match_percentage": 0
    }}
  ],

  "strengths": [],

  "weaknesses": [],

  "recommendations": []
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

        parsed_result = replace_nulls(parsed_result)

        defaults = {

            "job_match_score": 0,

            "skills": [],

            "matched_skills": [],
            "missing_skills": [],

            "career_matches": [],

            "strengths": [],
            "weaknesses": [],
            "recommendations": []
        }

        for key, value in defaults.items():

            if key not in parsed_result:
                parsed_result[key] = value

        # FIX JOB MATCH SCORE
        if not isinstance(
            parsed_result["job_match_score"],
            int
        ):
            parsed_result["job_match_score"] = 0

        # ENSURE CAREER MATCHES EXISTS
        if not isinstance(
            parsed_result["career_matches"],
            list
        ):
            parsed_result["career_matches"] = []

        # ENSURE EXACTLY 3 CAREER MATCHES
        while len(parsed_result["career_matches"]) < 3:

            parsed_result["career_matches"].append({
                "role": "Not Available",
                "match_percentage": 1
            })

        parsed_result["career_matches"] = (
            parsed_result["career_matches"][:3]
        )

        # FIX INVALID PERCENTAGES
        for career in parsed_result["career_matches"]:

            if "role" not in career:
                career["role"] = "Not Available"

            percentages = []

            for key in list(career.keys()):

                normalized = (
                    str(key)
                    .lower()
                    .replace("\u200b", "")
                    .replace("\u200c", "")
                    .replace("\u200d", "")
                    .replace(" ", "")
                )

                if (
                    "match" in normalized
                    and "percentage" in normalized
                ):

                    try:
                        percentages.append(
                            int(career[key])
                        )
                    except:
                        pass

                    if key != "match_percentage":
                        del career[key]

            if len(percentages) > 0:
                career["match_percentage"] = max(
                    percentages
                )

            if (
                "match_percentage" not in career
                or career["match_percentage"] is None
            ):
                career["match_percentage"] = 1

            try:
                career["match_percentage"] = int(
                    career["match_percentage"]
                )
            except:
                career["match_percentage"] = 1

            if career["match_percentage"] <= 0:
                career["match_percentage"] = 1

            if career["match_percentage"] > 100:
                career["match_percentage"] = 100
                        

                # FIX SKILLS
        for field in [
            "skills",
            "matched_skills",
            "missing_skills"
        ]:
            if not isinstance(parsed_result[field], list):
                parsed_result[field] = []

            parsed_result[field] = [
                str(x)
                for x in parsed_result[field]
            ]

        # FIX MISSING SKILLS
        if role.strip():

            if len(parsed_result["missing_skills"]) == 0:

                parsed_result["missing_skills"] = [
                    "Your skills meet the minimum requirements for this role"
                ]

        else:

            parsed_result["matched_skills"] = [
                "No target role provided"
            ]

            parsed_result["missing_skills"] = [
                "No target role provided"
            ]

        # FIX STRENGTHS
        if not isinstance(parsed_result["strengths"], list):
            parsed_result["strengths"] = []

        parsed_result["strengths"] = [
            str(x)
            for x in parsed_result["strengths"]
        ]

        # FIX WEAKNESSES
        if not isinstance(parsed_result["weaknesses"], list):
            parsed_result["weaknesses"] = []

        parsed_result["weaknesses"] = [
            str(x)
            for x in parsed_result["weaknesses"]
        ]

                # FIX RECOMMENDATIONS
        if not isinstance(parsed_result["recommendations"], list):
            parsed_result["recommendations"] = []

        fixed_recommendations = []

        for item in parsed_result["recommendations"]:

            if isinstance(item, dict):

                if "description" in item:
                    fixed_recommendations.append(
                        str(item["description"])
                    )

                elif "action" in item:
                    fixed_recommendations.append(
                        str(item["action"])
                    )

                elif "reasoning" in item:
                    fixed_recommendations.append(
                        str(item["reasoning"])
                    )

            else:
                fixed_recommendations.append(
                    str(item)
                )

        parsed_result["recommendations"] = fixed_recommendations

        # ADD POSITIVE FEEDBACK
        if parsed_result["missing_skills"] == [
            "Your skills meet the minimum requirements for this role"
        ]:

            if not any(
                "minimum" in rec.lower()
                for rec in parsed_result["recommendations"]
            ):

                parsed_result["recommendations"].insert(
                    0,
                    "You meet the minimum skill requirements for this role."
                )

        # FALLBACK RECOMMENDATIONS
        if len(parsed_result["recommendations"]) == 0:

            if parsed_result["job_match_score"] >= 70:

                parsed_result["recommendations"] = [
                    "You are a strong candidate for this role. Continue building advanced projects, certifications, and leadership experience to further strengthen your profile."
                ]

            else:

                parsed_result["recommendations"] = [
                    "Focus on developing missing skills, building practical projects, and gaining hands-on experience to improve your job match score."
                ]

        # SORT CAREER MATCHES
        parsed_result["career_matches"] = sorted(
            parsed_result["career_matches"],
            key=lambda x: x.get(
                "match_percentage",
                0
            ),
            reverse=True
        )

        return parsed_result

    except Exception as e:

        print("JSON Error:", e)

        return {

            "job_match_score": 0,

            "skills": [],

            "matched_skills": [],
            "missing_skills": [],

            "career_matches": [
                {
                    "role": "Not Available",
                    "match_percentage": 1
                },
                {
                    "role": "Not Available",
                    "match_percentage": 1
                },
                {
                    "role": "Not Available",
                    "match_percentage": 1
                }
            ],

            "strengths": [],
            "weaknesses": [],
            "recommendations": [],

            "error": str(e)
        }