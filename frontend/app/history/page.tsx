"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";

interface HistoryItem {
  id: number;
  filename: string;
  analysis_type: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://ai-resume-analyzer-gac3h0dmdahmhnbf.indonesiacentral-01.azurewebsites.net/history/1")
      .then((res) => res.json())
      .then((data) => {
        console.log("DATA:", data);
  
        if (Array.isArray(data)) {
          setHistory(data);
        } else {
          setHistory([]);
        }
  
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-950 text-white p-10">

        <div className="max-w-6xl mx-auto">

          <h1 className="text-5xl font-bold mb-3">
            Analysis History
          </h1>

          <p className="text-slate-400 mb-10">
            View your previous resume reviews and job analyses.
          </p>

          {loading && (
            <div className="text-center py-20">
              Loading history...
            </div>
          )}

          {!loading && history.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
              <h2 className="text-2xl font-semibold mb-3">
                No Analysis Found
              </h2>

              <p className="text-slate-400">
                Upload a resume and run an analysis first.
              </p>
            </div>
          )}

          <div className="grid gap-6">

            {history.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg"
              >
                <div className="flex justify-between items-center">

                  <div>
                    <h2 className="text-xl font-bold">
                      {item.filename}
                    </h2>

                    <p className="text-slate-400 mt-2">
                      {item.analysis_type}
                    </p>
                  </div>

                  <div className="flex gap-3">

                    <a
                      href={`https://ai-resume-analyzer-gac3h0dmdahmhnbf.indonesiacentral-01.azurewebsites.net/history/detail/${item.id}`}
                      target="_blank"
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl"
                    >
                      Detail
                    </a>

                    <a
                      href={`https://ai-resume-analyzer-gac3h0dmdahmhnbf.indonesiacentral-01.azurewebsites.net/download/${item.id}`}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl"
                    >
                      Download PDF
                    </a>

                  </div>

                </div>
              </div>
            ))}

          </div>

        </div>
      </div>
    </>
  );
}