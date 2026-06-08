import Job from "../schemaModel/jobschema.js";

export const getJobsList = async (req, res) => {
  try {
    const jobsList = await Job.find();
    res.status(200).json(jobsList);
  } catch (error) {
    console.error("Get Jobs Error", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
