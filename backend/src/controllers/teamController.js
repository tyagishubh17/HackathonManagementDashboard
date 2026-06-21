const Team = require("../models/Team");
const Registration = require("../models/Registration");
const Hackathon = require("../models/Hackathon");
const { formTeams } = require("../services/aiService");

// Organizer Endpoints
exports.formTeamsAI = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    // Get all confirmed participants not yet in a team
    const participants = await Registration.find({ 
      hackathonId: hackathon._id, 
      status: "confirmed",
      teamId: { $exists: false }
    }).populate("userId", "fullName email");

    if (participants.length === 0) {
      return res.status(400).json({ message: "No unmatched confirmed participants available for team formation." });
    }

    const aiSuggestedTeams = await formTeams(participants, hackathon.config);

    const savedTeams = [];
    const previewTeams = [];

    for (let i = 0; i < aiSuggestedTeams.length; i++) {
      const suggestedTeam = aiSuggestedTeams[i];
      const memberUserIds = suggestedTeam.members.map(m => m.user_id).filter(Boolean);
      const memberRegIds = suggestedTeam.members.map(m => m.registration_id).filter(Boolean);

      if (memberUserIds.length === 0) continue;

      const teamName = `Team ${i + 1}`;

      // Create the Team document
      const newTeam = await Team.create({
        hackathonId: hackathon._id,
        name: teamName,
        members: memberUserIds,
      });

      // Update the registrations of the members to reference this team
      await Registration.updateMany(
        { _id: { $in: memberRegIds } },
        { $set: { teamId: newTeam._id } }
      );

      savedTeams.push(newTeam);

      // Format suggestions to match the frontend expectations
      previewTeams.push({
        name: teamName,
        members: suggestedTeam.members.map(m => ({
          fullName: m.name,
          skills: m.skills || []
        }))
      });
    }

    res.status(200).json({ 
      success: true, 
      message: `${savedTeams.length} teams successfully formed and saved.`, 
      data: previewTeams 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createTeam = async (req, res) => {
  try {
    const { name, members, problemStatementId } = req.body;
    const hackathon = await Hackathon.findById(req.params.id);

    // Validate members
    if (members.length > hackathon.config.maxTeamSize || members.length < hackathon.config.minTeamSize) {
      return res.status(400).json({ message: `Team size must be between ${hackathon.config.minTeamSize} and ${hackathon.config.maxTeamSize}` });
    }

    const team = await Team.create({
      hackathonId: req.params.id,
      name,
      members,
      problemStatementId,
    });

    // Update participants' teamId
    await Registration.updateMany(
      { hackathonId: req.params.id, userId: { $in: members } },
      { $set: { teamId: team._id } }
    );

    res.status(201).json({ success: true, data: team });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find({ hackathonId: req.params.id })
      .populate("members", "fullName email")
      .populate("problemStatementId");
    res.status(200).json({ success: true, data: teams });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.teamId, req.body, { new: true });
    if (!team) return res.status(404).json({ message: "Team not found" });
    
    // Sync members in Registration if members changed
    if (req.body.members) {
      await Registration.updateMany({ teamId: team._id }, { $unset: { teamId: 1 } });
      await Registration.updateMany(
        { hackathonId: req.params.id, userId: { $in: req.body.members } },
        { $set: { teamId: team._id } }
      );
    }

    res.status(200).json({ success: true, data: team });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.disbandTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    await Registration.updateMany({ teamId: team._id }, { $unset: { teamId: 1 } });
    await team.delete();

    res.status(200).json({ success: true, message: "Team disbanded successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Participant Endpoints
exports.getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({ members: req.user._id })
      .populate("hackathonId", "title")
      .populate("members", "fullName email");
    res.status(200).json({ success: true, data: teams });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.joinTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const hackathon = await Hackathon.findById(team.hackathonId);
    if (team.members.length >= hackathon.config.maxTeamSize) {
      return res.status(400).json({ message: "Team is full" });
    }

    if (team.members.includes(req.user._id)) {
      return res.status(400).json({ message: "Already in team" });
    }

    // Must be registered
    const reg = await Registration.findOne({ hackathonId: team.hackathonId, userId: req.user._id, status: "confirmed" });
    if (!reg) return res.status(403).json({ message: "Must be a confirmed participant to join a team" });

    team.members.push(req.user._id);
    await team.save();

    reg.teamId = team._id;
    await reg.save();

    res.status(200).json({ success: true, data: team });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.leaveTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    team.members = team.members.filter(m => m.toString() !== req.user._id.toString());
    
    if (team.members.length === 0) {
      await team.delete();
    } else {
      await team.save();
    }

    const reg = await Registration.findOne({ hackathonId: team.hackathonId, userId: req.user._id });
    if (reg) {
      reg.teamId = undefined;
      await reg.save();
    }

    res.status(200).json({ success: true, message: "Left team" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
