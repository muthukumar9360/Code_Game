import mongoose from "mongoose";

const { Schema } = mongoose;

const battleSchema = new Schema({
  participants: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['waiting', 'ready', 'playing', 'active', 'submitted', 'finished'],
      default: 'waiting'
    },
    submissionTime: Date,
    result: {
      type: String,
      enum: ['win', 'lose', 'draw', 'timeout']
    },
    bestScore: {
      type: Number,
      default: 0
    },
    username: {
      type: String,
      default: ''
    },
    lastCode: {
      type: String,
      default: ''
    },
    lastLanguage: {
      type: String,
      default: 'python'
    },
    timeLeft: {
      type: Number, // seconds remaining for this participant
      default: null
    },
    bestSubmission: {
      type: Schema.Types.ObjectId,
      ref: 'Submission',
      default: null
    },
    assignedProblem: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
      default: null
    },
    assignedProblemIndex: {
      type: Number,
      default: 0
    },
    solvedProblems: [{
      type: Schema.Types.ObjectId,
      ref: 'Problem'
    }],
    team: {
      type: String,
      default: 'solo'
    },
    approvalStatus: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'approved'
    },
    warningsCount: {
      type: Number,
      default: 0
    }
  }],
  problem: {
    type: Schema.Types.ObjectId,
    ref: "Problem"
  },
  problems: [{
    type: Schema.Types.ObjectId,
    ref: "Problem"
  }],
  problemCount: {
    type: Number,
    default: 1
  },
  selectionMode: {
    type: String,
    enum: ['random', 'manual'],
    default: 'random'
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'finished'],
    default: 'waiting'
  },
  startTime: Date,
  endTime: Date,
  duration: {
    type: Number, // in minutes
    default: 30
  },
  tier: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
    required: true,
    default: 'Bronze'
  },
  battleType: {
    type: String,
    default: '1vs1'
  },
  maxParticipants: {
    type: Number,
    default: 2
  },
  startMode: {
    type: String,
    enum: ['immediate', 'scheduled'],
    default: 'immediate'
  },
  scheduledStartTime: Date,
  scheduledEndTime: Date,
  isTournament: {
    type: Boolean,
    default: false
  },
  tournamentMode: {
    type: String,
    enum: ['real', 'friendly'],
    default: 'real'
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  accessPassword: {
    type: String,
    default: null
  },
  isRanked: {
    type: Boolean,
    default: false
  },
  roomId: {
    type: String,
    unique: true,
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Battle", battleSchema); 