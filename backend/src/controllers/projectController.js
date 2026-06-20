const Project = require("../models/Project");
const Hackathon = require("../models/Hackathon");
const Team = require("../models/Team");
const { uploadFile } = require("../services/googleDriveService");

exports.createProject = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    const team = await Team.findOne({ hackathonId: hackathon._id, members: req.user._id });
    if (!team) return res.status(403).json({ message: "You must be part of a team to submit a project." });

    const existingProject = await Project.findOne({ teamId: team._id });
    if (existingProject) return res.status(400).json({ message: "Project already exists for this team. Use update." });

    const project = await Project.create({
      hackathonId: hackathon._id,
      teamId: team._id,
      title: req.body.title,
      description: req.body.description,
      problemStatementId: req.body.problemStatementId,
      techStack: req.body.techStack,
      status: "draft",
    });

    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const team = await Team.findById(project.teamId);
    if (!team.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to update this project" });
    }

    if (project.status === "submitted") {
      return res.status(400).json({ message: "Cannot edit after final submission." });
    }

    Object.assign(project, req.body);
    await project.save();

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.uploadFiles = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const team = await Team.findById(project.teamId);
    if (!team.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!req.files || req.files.length === 0) return res.status(400).json({ message: "No files provided" });

    const uploads = [];
    for (const file of req.files) {
      const driveRes = await uploadFile(file.buffer, file.originalname, file.mimetype);
      uploads.push({
        name: file.originalname,
        url: driveRes.webViewLink,
        fileType: file.mimetype,
      });
    }

    project.submissionFiles.push(...uploads);
    await project.save();

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.submitProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const hackathon = await Hackathon.findById(project.hackathonId);
    if (new Date() > new Date(hackathon.timeline.submissionDeadline)) {
      return res.status(400).json({ message: "Submission deadline has passed." });
    }

    const team = await Team.findById(project.teamId);
    if (!team.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    project.status = "submitted";
    await project.save();

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("teamId")
      .populate("problemStatementId");
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Basic role check: if public/organizer/member
    const isMember = project.teamId.members.includes(req.user._id);
    const isOrganizer = req.user.role === "organizer" || req.user.role === "super_admin";
    // If hackathon is evaluating/completed, projects are usually public, but we enforce member/organizer for now
    if (!isMember && !isOrganizer) return res.status(403).json({ message: "Not authorized to view this project" });

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
