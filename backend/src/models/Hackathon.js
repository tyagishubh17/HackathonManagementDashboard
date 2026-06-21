const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const rubricItemSchema = new mongoose.Schema({
  criteria: { type: String, required: true },
  weight: { type: Number, required: true, min: 0, max: 100 },
  description: String,
  maxScore: { type: Number, default: 10 },
}, { _id: false });

const hackathonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["draft", "pending_verification", "upcoming", "registration_open", "ongoing", "evaluating", "completed", "cancelled"],
      default: "draft",
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    timeline: {
      registrationStart: Date,
      registrationEnd: Date,
      hackathonStart: Date,
      hackathonEnd: Date,
      submissionDeadline: Date,
    },
    config: {
      maxTeamSize: { type: Number, default: 4 },
      minTeamSize: { type: Number, default: 1 },
      allowCrossCollegeTeams: { type: Boolean, default: true },
      allowIndividual: { type: Boolean, default: false },
      autoAssignTeams: { type: Boolean, default: false },
      requireResume: { type: Boolean, default: false },
      maxParticipants: { type: Number },
    },
    rubric: [rubricItemSchema],
    announcements: [
      {
        text: { type: String, required: true },
        postedAt: { type: Date, default: Date.now },
      }
    ],
    problemStatements: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: String, enum: ["Web", "App", "AI", "Blockchain", "Hardware", "Open Innovation"] },
        difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
        maxTeams: { type: Number },
        scheduledAt: { type: Date },
        updatedAt: { type: Date },
        referenceFile: {
          fileId: String,
          fileName: String,
          mimeType: String,
          viewUrl: String,
          downloadUrl: String,
          isLocal: Boolean
        }
      },
    ],
    prizes: [
      {
        title: String,
        amount: Number,
        description: String,
      },
    ],
    faq: [
      {
        question: String,
        answer: String,
      },
    ],
    stats: {
      participantsCount: { type: Number, default: 0 },
      teamsCount: { type: Number, default: 0 },
      projectsCount: { type: Number, default: 0 },
    },
    rejectionReason: { type: String, default: null },
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectedAt: { type: Date },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    publishedAt: { type: Date },
    cancelledAt: { type: Date },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    hasUnreviewedEdits: { type: Boolean, default: false },
    editReason: { type: String, default: null },
    organizerFeedback: { type: String, default: null },
  },
  { timestamps: true }
);

// Indexes
hackathonSchema.index({ organizerId: 1 });
hackathonSchema.index({ status: 1 });
hackathonSchema.index({ title: "text", description: "text" }); // Text index for search
hackathonSchema.index({ verificationStatus: 1, status: 1 });
hackathonSchema.index({ organizerId: 1, status: 1 });
hackathonSchema.index({ status: 1, verificationStatus: 1, createdAt: -1 });

// Validation: Rubric weights must sum to 100
hackathonSchema.path("rubric").validate(function (rubrics) {
  if (!rubrics || rubrics.length === 0) return true;
  const sum = rubrics.reduce((acc, curr) => acc + curr.weight, 0);
  return sum === 100;
}, "Rubric weights must sum exactly to 100");

// Cascade Delete Hook
hackathonSchema.pre("delete", async function (next) {
  try {
    const hackathonId = this._conditions._id;
    await mongoose.model("Registration").delete({ hackathonId });
    await mongoose.model("Team").delete({ hackathonId });
    await mongoose.model("Project").delete({ hackathonId });
    await mongoose.model("Evaluation").delete({ hackathonId });
    next();
  } catch (err) {
    next(err);
  }
});

// Method to return public-safe data
hackathonSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    shortDescription: this.shortDescription,
    status: this.status,
    timeline: this.timeline,
    config: {
      maxTeamSize: this.config.maxTeamSize,
      minTeamSize: this.config.minTeamSize,
      allowIndividual: this.config.allowIndividual,
      maxParticipants: this.config.maxParticipants,
    },
    rubric: this.rubric.map((r) => ({ criteria: r.criteria, description: r.description })),
    problemStatements: this.problemStatements.map((p) => {
      const isUpcoming = p.scheduledAt && new Date(p.scheduledAt) > new Date();
      if (isUpcoming) {
        return {
          id: p._id,
          title: p.title,
          category: p.category,
          scheduledAt: p.scheduledAt,
          isUpcoming: true,
        };
      }
      return {
        id: p._id,
        title: p.title,
        description: p.description,
        category: p.category,
        difficulty: p.difficulty,
        scheduledAt: p.scheduledAt,
        updatedAt: p.updatedAt,
        referenceFile: p.referenceFile,
        isUpcoming: false,
      };
    }),
    announcements: this.announcements ? this.announcements.map((a) => ({ id: a._id, text: a.text, postedAt: a.postedAt })) : [],
    stats: { participantsCount: this.stats.participantsCount },
    organizer: this.organizerId ? { id: this.organizerId._id, name: this.organizerId.fullName } : null,
    faq: this.faq,
  };
};

// Soft delete
hackathonSchema.plugin(mongooseDelete, { overrideMethods: "all", deletedAt: true });

module.exports = mongoose.model("Hackathon", hackathonSchema);
