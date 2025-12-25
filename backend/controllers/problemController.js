import Problem from "../models/Problem.js";

export const createProblem = async (req, res) => {
  try {
    const {
      slug,
      title,
      difficulty,
      description,
      examples,
      constraints,
      topics,
      companies,
      hints,
      testcases
    } = req.body;

    // Create and save new problem
    const problem = new Problem({
      slug,
      title,
      difficulty,
      description,
      examples,
      constraints,
      topics,
      companies,
      hints,
      testcases
    });

    await problem.save();

    res.status(201).json({
      success: true,
      message: "Problem added successfully",
      data: problem
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const getAllProblemsForAdmin = async(req,res) =>{
  try{
    const problems = await Problem.find().sort({createdAt:-1});
    res.status(200).json({
      success:true,
      count:problems.length,
      data:problems
    });
  }
  catch(error){
    res.status(500).json({
      success:false,
      message:error.message
    });
  }
};

export const getAllProblemsForUser = async (req, res) => {
  try {
    const problems = await Problem.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: problems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const getProblemBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const problem = await Problem.findOne(
      { slug },
      "-testcases.hidden"   // do NOT leak hidden flag logic
    );

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    res.status(200).json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
