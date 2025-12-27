import mongoose from "mongoose";

const { Schema } = mongoose;

const submissionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  battle: {
    type: Schema.Types.ObjectId,
    ref: "Battle",
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp', 'c'],
    required: true
  },
  results: [{
    testcase: {
      input: String,
      expectedOutput: String,
      actualOutput: String,
      passed: Boolean,
      executionTime: Number, // in ms
      memoryUsed: Number // in KB
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending'
  },
  overallResult: {
    type: String,
    enum: ['accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error', 'compilation_error'],
    default: 'accepted'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model("Submission", submissionSchema);
