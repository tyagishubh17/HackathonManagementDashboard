const { createCanvas } = require("canvas");
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
    issuedAt: "June 21, 2026",
    certificateId: "CERT-WIN-001",
    accentColor: "#B8860B",
    headerColor: "#7B3F00",
    title: "CERTIFICATE OF ACHIEVEMENT",
    subtitle: "— First Place Winner —",
    bodyText: "has won First Place in the hackathon",
    file: "winner.png",
  },
  {
    type: "runner_up",
    participantName: "Priya Sharma",
    hackathonName: "TechSprint 2026",
    organizerName: "Shubh Tyagi",
    issuedAt: "June 21, 2026",
    certificateId: "CERT-RUN-002",
    accentColor: "#708090",
    headerColor: "#2F4F4F",
    title: "CERTIFICATE OF ACHIEVEMENT",
    subtitle: "— Second Place —",
    bodyText: "has achieved Second Place in the hackathon",
    file: "runner_up.png",
  },
  {
    type: "participation",
    participantName: "Rahul Verma",
    hackathonName: "TechSprint 2026",
    organizerName: "Shubh Tyagi",
    issuedAt: "June 21, 2026",
    certificateId: "CERT-PAR-003",
    accentColor: "#B8860B",
    headerColor: "#1a237e",
    title: "CERTIFICATE OF PARTICIPATION",
    subtitle: null,
    bodyText: "has successfully participated in the hackathon",
    file: "participation.png",
  },
];

for (const s of samples) {
  // A4 landscape at 96dpi ~ 1123 x 794
  const W = 1123, H = 794;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const gold = s.accentColor;
  const navy = s.headerColor;

  // Background
  ctx.fillStyle = "#FDFAF3";
  ctx.fillRect(0, 0, W, H);

  // Outer border
  ctx.strokeStyle = gold;
  ctx.lineWidth = 4;
  ctx.strokeRect(18, 18, W - 36, H - 36);

  // Inner border
  ctx.strokeStyle = gold;
  ctx.lineWidth = 1;
  ctx.strokeRect(25, 25, W - 50, H - 50);

  // Corner ornaments
  const corners = [[18, 18], [W - 48, 18], [18, H - 48], [W - 48, H - 48]];
  corners.forEach(([x, y]) => {
    ctx.strokeStyle = gold;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 30, 30);
  });

  // Header band
  ctx.fillStyle = "#FFFBEF";
  ctx.fillRect(18, 18, W - 36, 100);

  // Re-draw borders over fill
  ctx.strokeStyle = gold;
  ctx.lineWidth = 4;
  ctx.strokeRect(18, 18, W - 36, H - 36);
  ctx.lineWidth = 1;
  ctx.strokeRect(25, 25, W - 50, H - 50);

  // Logo (top-left)
  ctx.fillStyle = navy;
  ctx.font = "bold 16px sans-serif";
  ctx.fillText("FAIRJUDGE", 50, 52);
  ctx.fillStyle = "#888";
  ctx.font = "11px sans-serif";
  ctx.fillText("Hackathon Platform", 50, 70);

  // Certificate ID (top-right)
  ctx.fillStyle = "#aaa";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(`Certificate ID: ${s.certificateId}`, W - 45, 60);
  ctx.textAlign = "left";

  // Main title (centered)
  ctx.fillStyle = navy;
  ctx.font = "bold 26px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(s.title, W / 2, 55);

  // Subtitle
  if (s.subtitle) {
    ctx.fillStyle = gold;
    ctx.font = "14px sans-serif";
    ctx.fillText(s.subtitle, W / 2, 80);
  }
  ctx.textAlign = "left";

  // Divider
  ctx.strokeStyle = gold;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(45, 122);
  ctx.lineTo(W - 45, 122);
  ctx.stroke();

  // Star ornament
  ctx.fillStyle = gold;
  ctx.font = "18px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("✦", W / 2, 118);
  ctx.textAlign = "left";

  // "This is to certify that"
  ctx.fillStyle = "#555";
  ctx.font = "15px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("This is to certify that", W / 2, 160);

  // Participant Name
  ctx.fillStyle = navy;
  ctx.font = "bold 44px sans-serif";
  ctx.fillText(s.participantName, W / 2, 220);

  // Name underline
  const nameWidth = Math.min(s.participantName.length * 24, W - 200);
  const nlX = (W - nameWidth) / 2;
  ctx.strokeStyle = navy;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(nlX, 230);
  ctx.lineTo(nlX + nameWidth, 230);
  ctx.stroke();

  // Body text
  ctx.fillStyle = "#555";
  ctx.font = "15px sans-serif";
  ctx.fillText(s.bodyText, W / 2, 262);

  // Hackathon name
  ctx.fillStyle = gold;
  ctx.font = "bold 28px sans-serif";
  ctx.fillText(s.hackathonName, W / 2, 305);

  ctx.textAlign = "left";

  // Bottom section
  const bottomY = H - 145;

  // Date (right)
  ctx.fillStyle = "#666";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(`Date of Issue: ${s.issuedAt}`, W - 55, bottomY);
  ctx.textAlign = "left";

  // Signature line
  const sigX = 65;
  const sigLineY = bottomY + 40;
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sigX, sigLineY);
  ctx.lineTo(sigX + 210, sigLineY);
  ctx.stroke();

  ctx.fillStyle = "#333";
  ctx.font = "bold 13px sans-serif";
  ctx.fillText(s.organizerName, sigX, sigLineY + 18);

  ctx.fillStyle = "#777";
  ctx.font = "11px sans-serif";
  ctx.fillText("Event Organizer", sigX, sigLineY + 34);

  // Footer divider
  ctx.strokeStyle = gold;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(45, H - 50);
  ctx.lineTo(W - 45, H - 50);
  ctx.stroke();

  // Footer text
  ctx.fillStyle = "#bbb";
  ctx.font = "9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    "Issued via FairJudge — AI-Powered Hackathon Management Platform  |  This certificate is digitally generated and valid without a physical signature.",
    W / 2,
    H - 36
  );
  ctx.textAlign = "left";

  // Save PNG
  const filePath = path.join(outDir, s.file);
  const buf = canvas.toBuffer("image/png");
  fs.writeFileSync(filePath, buf);
  console.log(`Generated: ${filePath}`);
}
