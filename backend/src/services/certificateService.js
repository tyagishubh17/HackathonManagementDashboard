const PDFDocument = require("pdfkit");

const TYPE_CONFIG = {
  winner: {
    title: "CERTIFICATE OF ACHIEVEMENT",
    subtitle: "First Place Winner",
    accentColor: "#B8860B",
    headerColor: "#7B3F00",
  },
  runner_up: {
    title: "CERTIFICATE OF ACHIEVEMENT",
    subtitle: "Second Place",
    accentColor: "#708090",
    headerColor: "#2F4F4F",
  },
  participation: {
    title: "CERTIFICATE OF PARTICIPATION",
    subtitle: null,
    accentColor: "#B8860B",
    headerColor: "#1a237e",
  },
};

function generateCertificatePDF({ participantName, hackathonName, organizerName, issuedAt, certificateId, type = "participation" }) {
  return new Promise((resolve, reject) => {
    const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.participation;
    const doc = new PDFDocument({ layout: "landscape", size: "A4", margin: 0 });

    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const W = doc.page.width;
    const H = doc.page.height;
    const gold = cfg.accentColor;
    const navy = cfg.headerColor;

    // Background
    doc.rect(0, 0, W, H).fill("#FDFAF3");

    // Outer border
    doc.rect(18, 18, W - 36, H - 36).lineWidth(4).strokeColor(gold).stroke();
    // Inner border
    doc.rect(25, 25, W - 50, H - 50).lineWidth(1).strokeColor(gold).stroke();

    // Corner ornaments
    const corners = [[18, 18], [W - 48, 18], [18, H - 48], [W - 48, H - 48]];
    corners.forEach(([x, y]) => {
      doc.rect(x, y, 30, 30).lineWidth(2).strokeColor(gold).stroke();
    });

    // Header band
    doc.rect(18, 18, W - 36, 88).fill("#FFFBEF");

    // Re-draw top borders over the fill
    doc.rect(18, 18, W - 36, H - 36).lineWidth(4).strokeColor(gold).stroke();
    doc.rect(25, 25, W - 50, H - 50).lineWidth(1).strokeColor(gold).stroke();

    // Logo text (top-left)
    doc.fontSize(13).font("Helvetica-Bold").fillColor(navy).text("FAIRJUDGE", 48, 38);
    doc.fontSize(8).font("Helvetica").fillColor("#888").text("Hackathon Platform", 48, 54);

    // Certificate ID (top-right)
    doc.fontSize(7.5).font("Helvetica").fillColor("#aaa").text(`Certificate ID: ${certificateId}`, W - 260, 48, { width: 220, align: "right" });

    // Main title (centered in header)
    doc.fontSize(20).font("Helvetica-Bold").fillColor(navy).text(cfg.title, 0, 42, { align: "center", width: W });

    if (cfg.subtitle) {
      doc.fontSize(11).font("Helvetica").fillColor(gold).text(`— ${cfg.subtitle} —`, 0, 66, { align: "center", width: W });
    }

    // Divider line
    doc.moveTo(45, 110).lineTo(W - 45, 110).lineWidth(0.75).strokeColor(gold).stroke();

    // Decorative stars / ornament on divider
    doc.fontSize(14).font("Helvetica").fillColor(gold).text("✦", W / 2 - 7, 102);

    // Body text
    doc.fontSize(13).font("Helvetica").fillColor("#555").text("This is to certify that", 0, 132, { align: "center", width: W });

    // Participant Name
    doc.fontSize(36).font("Helvetica-Bold").fillColor(navy).text(participantName, 60, 158, { align: "center", width: W - 120 });

    // Name underline
    const approxNameWidth = Math.min(participantName.length * 20, W - 200);
    const nameLineX = (W - approxNameWidth) / 2;
    const nameLineY = 205;
    doc.moveTo(nameLineX, nameLineY).lineTo(nameLineX + approxNameWidth, nameLineY).lineWidth(1).strokeColor(navy).stroke();

    // Participation text
    const bodyText = type === "winner"
      ? "has won First Place in the hackathon"
      : type === "runner_up"
        ? "has achieved Second Place in the hackathon"
        : "has successfully participated in the hackathon";

    doc.fontSize(13).font("Helvetica").fillColor("#555").text(bodyText, 0, 218, { align: "center", width: W });

    // Hackathon name
    doc.fontSize(22).font("Helvetica-Bold").fillColor(gold).text(hackathonName, 80, 242, { align: "center", width: W - 160 });

    // Bottom section
    const bottomY = H - 128;

    // Date
    const dateStr = new Date(issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    doc.fontSize(10).font("Helvetica").fillColor("#666").text(`Date of Issue: ${dateStr}`, W - 280, bottomY, { width: 240, align: "right" });

    // Signature block (left)
    const sigX = 65;
    const sigLineY = bottomY + 32;

    // Signature line
    doc.moveTo(sigX, sigLineY).lineTo(sigX + 210, sigLineY).lineWidth(1).strokeColor("#444").stroke();

    doc.fontSize(11).font("Helvetica-Bold").fillColor("#333").text(organizerName, sigX, sigLineY + 7, { width: 210 });
    doc.fontSize(9).font("Helvetica").fillColor("#777").text("Event Organizer", sigX, sigLineY + 23, { width: 210 });

    // Footer
    doc.moveTo(45, H - 45).lineTo(W - 45, H - 45).lineWidth(0.5).strokeColor(gold).stroke();
    doc.fontSize(7.5).font("Helvetica").fillColor("#bbb").text(
      "Issued via FairJudge — AI-Powered Hackathon Management Platform  |  This certificate is digitally generated and valid without a physical signature.",
      0,
      H - 38,
      { align: "center", width: W }
    );

    doc.end();
  });
}

module.exports = { generateCertificatePDF };
