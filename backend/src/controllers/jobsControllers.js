import Job from "../schemaModel/jobschema.js";

export const JobsChecking = async (req, res) => {
  try {
    const toArray = (val) => (!val ? [] : Array.isArray(val) ? val : [val]);

    const city = toArray(req.query.city);
    const jobType = toArray(req.query.jobType);
    const workMode = toArray(req.query.workMode);
    const experienceLevel = toArray(req.query.experienceLevel);
    const region = toArray(req.query.region);
    const { salary, page } = req.query;

    console.log("QUERY:", JSON.stringify(req.query));

    const query = { isActive: true };

    if (jobType.length) {
      query.jobType = { $in: jobType };
    }
    if (experienceLevel.length) {
      query.experienceLevel = { $in: experienceLevel };
    }
    if (city.length) {
      const regexes = city.map((c) => new RegExp(c.replace(/ /g, "\\s*"), "i"));
      query["location.city"] = { $in: regexes };
    }
    if (region.length) {
      const regexes = region.map(
        (r) => new RegExp(r.replace(/\s+/g, "\\s*"), "i")
      );
      query["location.region"] = { $in: regexes };
    }
    if (workMode.length) {
      query.workMode = { $in: workMode };
    }
    if (salary?.ranges?.length) {
      query.$or = salary.ranges.map((r) => ({
        "salary.min": { $lte: r.max },
        "salary.max": { $gte: r.min },
        "salary.currency": salary.currency,
        "salary.period": salary.period,
      }));
    }

    const pageNumber = Number(page) || 1;
    const limit = 10;
    const skip = (pageNumber - 1) * limit;
    const total = await Job.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    const jobsList = await Job.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ expiredAt: 1 });

    return res.status(200).json({
      success: true,
      data: jobsList,
      page: pageNumber,
      totalPages,
    });
  } catch (error) {
    console.error("Researching data invalid", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
