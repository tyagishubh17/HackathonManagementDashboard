"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const API_BASE = (api.defaults.baseURL as string) || "http://localhost:5000/api";
import { Award, Download, Trophy, Medal, Loader2, FileText } from "lucide-react";

const TYPE_STYLES: Record<string, { label: string; bg: string; text: string; border: string; icon: any }> = {
  winner: {
    label: "Winner — 1st Place",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    icon: Trophy,
  },
  runner_up: {
    label: "Runner-up — 2nd Place",
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    icon: Medal,
  },
  participation: {
    label: "Participation",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    icon: Award,
  },
};

export default function CertificatesPage() {
  const { data: certificates, isLoading } = useQuery({
    queryKey: ["myCertificates"],
    queryFn: () => api.get("/certificates/mine").then((res: any) => res.data.data),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Award className="text-indigo-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">My Certificates</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Download your participation and achievement certificates from completed hackathons.
            </p>
          </div>
        </div>
      </div>

      {/* Certificate List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      ) : !certificates || certificates.length === 0 ? (
        <div className="bg-white rounded-2xl border shadow-sm p-12 text-center">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-bold text-gray-700 mb-1">No Certificates Yet</h3>
          <p className="text-gray-400 text-sm">
            Certificates will appear here once an organizer publishes results for a hackathon you participated in.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {certificates.map((cert: any) => {
            const style = TYPE_STYLES[cert.type] || TYPE_STYLES.participation;
            const Icon = style.icon;
            const certData: Record<string, string> =
              cert.certificateData instanceof Object
                ? cert.certificateData
                : {};

            return (
              <div
                key={cert._id}
                className={`relative bg-white rounded-2xl border-2 ${style.border} shadow-sm overflow-hidden hover:shadow-md transition`}
              >
                {/* Top accent strip */}
                <div className={`h-1.5 w-full ${cert.type === "winner" ? "bg-amber-400" : cert.type === "runner_up" ? "bg-slate-400" : "bg-indigo-500"}`} />

                <div className="p-6">
                  {/* Badge */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-4 ${style.bg} ${style.text} ${style.border}`}>
                    <Icon size={13} />
                    {style.label}
                  </div>

                  {/* Certificate preview */}
                  <div className={`rounded-xl border p-5 mb-4 ${style.bg} ${style.border}`}>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Certificate of {cert.type === "participation" ? "Participation" : "Achievement"}</p>
                    <p className="text-gray-500 text-xs mb-1">This certifies that</p>
                    <p className="text-xl font-black text-gray-900 mb-2">{certData.participantName}</p>
                    <p className="text-gray-500 text-xs mb-1">
                      {cert.type === "winner"
                        ? "has won First Place in"
                        : cert.type === "runner_up"
                          ? "has achieved Second Place in"
                          : "has successfully participated in"}
                    </p>
                    <p className={`text-base font-bold ${style.text}`}>{certData.hackathonName || cert.hackathonId?.title}</p>

                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Organizer</p>
                        <p className="text-sm font-bold text-gray-700">{certData.organizerName || "—"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Issued</p>
                        <p className="text-xs text-gray-600 font-medium">
                          {new Date(cert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Download button */}
                  <a
                    href={`${API_BASE}/certificates/${cert._id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-sm shadow-indigo-200"
                  >
                    <Download size={16} />
                    Download Certificate (PDF)
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
