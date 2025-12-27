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
      enum: ['waiting', 'ready', 'submitted', 'finished'],
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
    }
    ,
    timeLeft: {
      type: Number, // seconds remaining for this participant
      default: null
    },
    bestSubmission: {
      type: Schema.Types.ObjectId,
      ref: 'Submission',
      default: null
    }
  }],
  problem: {
    type: Schema.Types.ObjectId,
    ref: "Problem",
    required: true
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
    required: true
  },
  battleType: {
    type: String,
    enum: ['1vs1', '2vs2', '4vs4'],
    default: '1vs1'
  },
  roomId: {
    type: String,
    unique: true,
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Battle", battleSchema); 