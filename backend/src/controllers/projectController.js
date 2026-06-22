const Project = require("../models/Project");
const Hackathon = require("../models/Hackathon");
const Team = require("../models/Team");
const Evaluation = require("../models/Evaluation");
const { uploadFile } = require("../services/gridfsService");
const aiService = require("../services/aiService");
const pdfParse = require("pdf-parse");
const axios = require("axios");

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

    if (!req.file) return res.status(400).json({ message: "No PPT file provided" });

    const driveRes = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    
    project.pptFile = {
      fileId: driveRes.fileId,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      viewUrl: driveRes.viewUrl,
      downloadUrl: driveRes.downloadUrl
    };

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

    if (!project.pptFile || !project.pptFile.fileId) {
      return res.status(400).json({ message: "Please upload a PPT file before submitting." });
    }

    if (!project.summary || project.summary.trim().length < 50) {
      return res.status(400).json({ message: "Please provide a valid project summary (at least 50 characters) before submitting." });
    }

    project.status = "submitted";
    await project.save();

    // Request AI evaluation (async, don't wait)
    setImmediate(async () => {
      try {
        let extractedText = project.summary;
        
        // If ppt extraction was available, we'd add it here. For now, we rely on the text summary.

        // Request AI evaluation
        const aiEvaluation = await aiService.requestAIReview({
          projectId: project._id.toString(),
          techStack: project.techStack,
          projectText: project.description,
          pdfText: extractedText || "No text available",
        });

        // Create evaluation records with AI scores
        const hackathonRubric = hackathon.rubric || {};
        const evaluationData = {
          projectId: project._id,
          hackathonId: hackathon._id,
          aiSuggestedScores: aiEvaluation.scores || {},
          status: "ai_evaluated",
        };

        await Evaluation.updateMany(
          { projectId: project._id },
          { ...evaluationData },
          { new: true }
        );

        console.log("AI evaluation completed for project:", project._id);

        // Auto-trigger human panels based on the new sequential pipeline design
        const evaluationController = require("./evaluationController");
        const mockRequest = { params: { id: hackathon._id.toString() } };
        const mockResponse = { 
          status: () => ({ json: () => {} }) 
        };
        
        await evaluationController.assignReviewersAI(mockRequest, mockResponse);
        console.log("Human judge split panels successfully assigned for project:", project._id);

      } catch (err) {
        console.error("Pipeline assignment automation error:", err.message);
      }
    });

    res.status(200).json({ 
      success: true, 
      data: project,
      message: "Project submitted! AI is analyzing your submission and assigning review panels."
    });
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
    if (!isMember && !isOrganizer) return res.status(403).json({ message: "Not authorized to view this project" });

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
