"use client";


import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/navbar";
import {
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Briefcase,
  Target,
  Upload,
} from "lucide-react";



import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  

  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [analysisId, setAnalysisId] = useState<number | null>(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);

    const formData = new FormData();

    formData.append("file", file);
    formData.append("role", role);

    try {
      const response = await axios.post(
        "http://localhost:8000/job-analysis",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setAnalysis(response.data.analysis);
      setAnalysisId(response.data.analysis_id);

      console.log("FULL RESPONSE:", response.data);
      console.log("ANALYSIS ID:", response.data.analysis_id);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze resume");
    }

    setLoading(false);
  };

  const chartData = [
    {
      name: "Match",
      value: analysis?.job_match_score || 0,
    },
    {
      name: "Remaining",
      value: 100 - (analysis?.job_match_score || 0),
    },
  ];

  const COLORS = ["#9333ea", "#e5e7eb"];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 transition-all duration-500">
      <Navbar />
      

     

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* UPLOAD SECTION */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 mb-10">

          <div className="flex flex-col gap-5">

            {/* FILE INPUT */}
            <label className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition bg-slate-50 dark:bg-slate-900">

              <Upload
                size={40}
                className="text-blue-600 mb-3"
              />

              <p className="text-slate-700 dark:text-slate-200 font-semibold text-lg">
                Choose Resume PDF
              </p>

              <p className="text-slate-500 text-sm mt-1">
                Upload your resume for AI job analysis
              </p>

              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    setFile(e.target.files[0]);
                  }
                }}
              />

              {file && (
                <p className="mt-4 text-blue-600 font-medium">
                  {file.name}
                </p>
              )}

            </label>

            {/* ROLE INPUT */}
            <input
              type="text"
              placeholder="Enter target role (example: AI Engineer)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white px-4 py-3 rounded-2xl outline-none"
            />

            {/* BUTTON */}
            <button
              onClick={handleUpload}
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:scale-105"
            >
              Analyze Resume
            </button>

          </div>

        </div>

        {/* LOADING */}
        {loading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <p className="text-xl font-semibold text-slate-700 dark:text-slate-200 animate-pulse">
              Analyzing Resume...
            </p>
          </div>
        )}

        {/* DASHBOARD */}
        {analysis && (
          <div className="space-y-8">

            {/* TOP CARD */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">

              <div className="flex flex-col lg:flex-row items-center justify-between gap-10">

                {/* LEFT */}
                <div className="flex-1 w-full">

                  {/* TITLE */}
                  <div className="flex items-center gap-3 mb-4">

                    <Target
                      className="text-purple-600"
                      size={32}
                    />

                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                      Job Match Analysis
                    </h2>

                  </div>

                  {/* SCORE */}
                  <p className="text-6xl font-bold text-purple-600 mb-6">
                    {analysis.job_match_score || 0}%
                  </p>

                  {/* PROGRESS BAR */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-5 overflow-hidden">

                    <div
                      className="bg-gradient-to-r from-purple-500 to-cyan-400 h-5 rounded-full transition-all duration-1000"
                      style={{
                        width: `${analysis.job_match_score || 0}%`,
                      }}
                    />

                  </div>

                  {/* DESCRIPTION */}
                  <div className="mt-5">

                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                      Resume Compatibility
                    </p>

                    <p className="text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">

                      {analysis.job_match_score >= 75 && (
                        <>
                          Your resume strongly matches the requirements for
                          <span className="font-bold text-green-600 dark:text-green-400">
                            {" "} {role}
                          </span>.
                        </>
                      )}

                      {analysis.job_match_score >= 40 &&
                        analysis.job_match_score < 75 && (
                          <>
                            Your resume partially matches the requirements for
                            <span className="font-bold text-yellow-600 dark:text-yellow-400">
                              {" "} {role}
                            </span>,
                            but there are still several areas that need improvement.
                          </>
                        )}

                      {analysis.job_match_score < 40 && (
                        <>
                          Your resume currently has low compatibility for
                          <span className="font-bold text-red-600 dark:text-red-400">
                            {" "} {role}
                          </span>.
                          Additional relevant skills, projects, and experience are recommended.
                        </>
                      )}

                    </p>

                  </div>

                </div>

                {/* CHART */}
                <div className="w-56 h-56 flex-shrink-0">

                  <ResponsiveContainer width="100%" height="100%">

                    <PieChart>

                      <Pie
                        data={chartData}
                        innerRadius={60}
                        outerRadius={85}
                        dataKey="value"
                      >

                        {chartData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index]}
                          />
                        ))}

                      </Pie>

                    </PieChart>

                  </ResponsiveContainer>

                </div>

              </div>

            </div>

            {/* 3 COLUMNS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* SKILLS */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">

                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 text-center">
                  Skills
                </h2>

                <div className="flex flex-wrap gap-3 justify-center">

                  {analysis.skills?.map((skill: string) => (
                    <span
                      key={skill}
                      className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full font-medium"
                    >
                      {skill}
                    </span>
                  ))}

                </div>

              </div>

              {/* STRENGTHS */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">

                <div className="flex items-center justify-center gap-3 mb-6">

                  <CheckCircle className="text-green-600" />

                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">
                    Strengths
                  </h2>

                </div>

                <ul className="space-y-4">

                  {analysis.strengths?.map((item: string) => (
                    <li
                      key={item}
                      className="text-slate-700 dark:text-slate-200 bg-green-50 dark:bg-green-900/20 p-4 rounded-xl"
                    >
                      {item}
                    </li>
                  ))}

                </ul>

              </div>

              {/* WEAKNESSES */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">

                <div className="flex items-center justify-center gap-3 mb-6">

                  <AlertTriangle className="text-red-600" />

                  <h2 className="text-2xl font-bold text-red-700 dark:text-red-400">
                    Weaknesses
                  </h2>

                </div>

                <ul className="space-y-4">

                  {analysis.weaknesses?.map((item: string) => (
                    <li
                      key={item}
                      className="text-slate-700 dark:text-slate-200 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl"
                    >
                      {item}
                    </li>
                  ))}

                </ul>

              </div>

            </div>

            {/* MISSING SKILLS */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">

              <div className="flex items-center justify-center gap-3 mb-6">

                <AlertTriangle className="text-orange-500" />

                <h2 className="text-2xl font-bold text-orange-500">
                  Missing Skills
                </h2>

              </div>

              <div className="flex flex-wrap gap-3 justify-center">

                {analysis.missing_skills?.map((skill: string) => (
                  <span
                    key={skill}
                    className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}

              </div>

            </div>

            {/* RECOMMENDATIONS */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">

              <div className="flex items-center justify-center gap-3 mb-6">

                <Lightbulb className="text-yellow-500" />

                <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  Recommendations
                </h2>

              </div>

              <ul className="space-y-4">

                {analysis.recommendations?.map((item: string) => (
                  <li
                    key={item}
                    className="text-slate-700 dark:text-slate-200 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl"
                  >
                    {item}
                  </li>
                ))}

              </ul>

            </div>

            {/* CAREER MATCHES */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">

              <div className="flex items-center justify-center gap-3 mb-8">

                <Briefcase className="text-cyan-500" />

                <h2 className="text-2xl font-bold text-cyan-500">
                  Alternative Best Matching Roles
                </h2>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {analysis.career_matches?.map(
                  (job: any, index: number) => (
                    <div
                      key={index}
                      className="bg-slate-100 dark:bg-slate-700 rounded-2xl p-6 text-center"
                    >

                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                        {job.role}
                      </h3>

                      <p className="text-4xl font-bold text-cyan-500">
                        {job.match_percentage}%
                      </p>

                    </div>
                  )
                )}

              </div>

            </div>

            {/* ACTION BUTTONS */}
<div className="flex flex-wrap justify-center gap-4 mt-8">
  <a
    href="/history"
    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
  >
    View History
  </a>

  {analysisId && (
    <a
      href={`http://localhost:8000/download/${analysisId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
    >
      Download PDF
    </a>
  )}
</div>

          </div>
        )}

      </div>

    </div>
  );
}