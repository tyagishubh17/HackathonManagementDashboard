const xlsx = require("xlsx");

exports.generateRegistrationExcel = (registrations, hackathonName) => {
  // Map data to flat structure for excel
  const data = registrations.map((r) => {
    return {
      "Name": r.userId?.fullName || "N/A",
      "Email": r.userId?.email || "N/A",
      "Status": r.status,
      "Experience": r.experienceLevel,
      "Skills": r.skills ? r.skills.join(", ") : "",
      "Institution": r.institution || "",
      "Country": r.country || "",
      "Gender": r.gender || "",
      "Registration Date": new Date(r.createdAt).toLocaleDateString(),
      "Team Assigned": r.teamId ? "Yes" : "No",
      "Duplicate Confidence": r.duplicateCheckResult?.confidence ? `${(r.duplicateCheckResult.confidence * 100).toFixed(1)}%` : "N/A",
      "Resume Link": r.resumeFile?.viewUrl || "N/A",
    };
  });

  // Create a new workbook and worksheet
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(data);

  // Auto-size columns roughly
  const cols = [
    { wch: 20 }, // Name
    { wch: 30 }, // Email
    { wch: 15 }, // Status
    { wch: 15 }, // Experience
    { wch: 40 }, // Skills
    { wch: 20 }, // Institution
    { wch: 15 }, // Country
    { wch: 10 }, // Gender
    { wch: 20 }, // Reg Date
    { wch: 15 }, // Team Assigned
    { wch: 20 }, // Dup Confidence
    { wch: 50 }, // Resume Link
  ];
  worksheet["!cols"] = cols;

  // Freeze top row
  worksheet["!views"] = [{ state: "frozen", xSplit: 0, ySplit: 1 }];

  // Append sheet
  xlsx.utils.book_append_sheet(workbook, worksheet, "Registrations");

  // Generate buffer
  return xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
};
