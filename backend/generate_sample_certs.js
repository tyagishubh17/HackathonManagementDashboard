const { generateCertificatePDF } = require("./src/services/certificateService");
const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "sample_certificates");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const samples = [
  {
    type: "winner",
    participantName: "Alex Johnson",
    hackathonName: "TechSprint 2026",
    organizerName: "Shubh Tyagi",
    issuedAt: new Date("2026-06-21"),
    certificateId: "CERT-WIN-001",
    file: "winner.pdf",
  },
  {
    type: "runner_up",
    participantName: "Priya Sharma",
    hackathonName: "TechSprint 2026",
    organizerName: "Shubh Tyagi",
    issuedAt: new Date("2026-06-21"),
    certificateId: "CERT-RUN-002",
    file: "runner_up.pdf",
  },
  {
    type: "participation",
    participantName: "Rahul Verma",
    hackathonName: "TechSprint 2026",
    organizerName: "Shubh Tyagi",
    issuedAt: new Date("2026-06-21"),
    certificateId: "CERT-PAR-003",
    file: "participation.pdf",
  },
];

(async () => {
  for (const s of samples) {
    const buf = await generateCertificatePDF(s);
    const filePath = path.join(outDir, s.file);
    fs.writeFileSync(filePath, buf);
    console.log(`Generated: ${filePath}`);
  }
})();
