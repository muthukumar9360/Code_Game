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
