import mongoose from "mongoose";

const exampleSchema = new mongoose.Schema({
  input: String,
  output: String,
  explanation: String
});

const testcaseSchema = new mongoose.Schema({
  input: String,
  output: String,
  hidden: { type: Boolean, default: false }
});

const problemSchema = new mongoose.Schema({
  slug: { type: String, unique: true },            
  title: String,
  
  difficulty: { type: String, enum: ["easy", "medium", "hard"] },

  description: String,                             

  examples: [exampleSchema],                        
  constraints: [String],                           
  topics: [String],                                 
  companies: [String],                             

  hints: {
    h1: String,
    h2: String,
    h3: String
  },

  testcases: [testcaseSchema],                      
  
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Problem", problemSchema);