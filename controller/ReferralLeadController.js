const ReferralLead = require("../modal/ReferralLead");
const handleError = require("../util/handleError");
const { convertUTCDateToLocalDate } = require("./PageController");

const getReferralLead = async (req, res, next) => {
  try {
    let results;
    const { page, limit } = req.query;
    let totalDocs;
    if (page || limit) {
      query = req.query;
      delete query.page;
      delete query.limit;
      totalDocs = await ReferralLead.find(
        req.query ? { ...query } : {}
      ).countDocuments();
      results = await ReferralLead.find(req.query ? { ...query } : {})
        .skip((page - 1) * limit)
        .limit(limit);
    } else {
      totalDocs = await ReferralLead.find(
        req.query ? { ...req.query } : {}
      ).countDocuments();
      results = await ReferralLead.find(req.query ? { ...req.query } : {});
      // .skip((page - 1) * limit)
      // .limit(limit);
    }

    res.status(200).json({
      totalDocs,
      success: true,
      message: "ReferralLead",
      data: results,
    });
  } catch (error) {
    console.log(error);
    next(handleError(500, error));
  }
};
const getReferralLeadBYFilter = async (req, res, next) => {
  const { page, limit } = req.body;

  let body;
  if (page || limit) {
    body = req.body;
    delete body.page;
    delete body.limit;
  }

  try {
    const totalDocs = await ReferralLead.find(
      body ? body : {}
    ).countDocuments();
    const Leads = await ReferralLead.find(body ? { ...body } : {})
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "ReferralLead",
      data: Leads,
      totalDocs,
    });
  } catch (error) {
    console.log(error);
    next(handleError(500, error));
  }
};
const postReferralLead = async (req, res, next) => {
  try {
    console.log("running");
    await ReferralLead.create({
      ...req.body,
      newDate: convertUTCDateToLocalDate(),
    });
    res.status(201).json({
      success: true,
      message: "ReferralLead Created Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({});
  }
};
const putReferralLead = async (req, res, next) => {
  try {
    await ReferralLead.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "ReferralLead Updated Successful",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};
const deleteReferralLead = async (req, res, next) => {
  console.log("delete");
  try {
    await ReferralLead.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "ReferralLead Deleted Successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};
const getReferralLeadByTime = async (req, res, next) => {
  try {
    const { toTime, fromTime, User, page, limit, myFilterData } = req.body;
    from = new Date(
      `${fromTime.split("T")[0]}T00:00:00.000+05:30`
    ).toISOString(); //21
    To = new Date(`${toTime.split("T")[0]}T23:59:59.000+05:30`).toISOString();
    const mySearchData = {
      createdAt: {
        $gte: from,
        $lte: To,
      },
      User,
    };
    // console.log("myFilterData",myFilterData);
    myFilterData.forEach((element) => {
      if (element) {
        const myKey = JSON.parse(element);

        mySearchData[myKey[0]] = myKey[1];
      }
    });

    console.log("check this data", mySearchData);

    const totalDocs = await ReferralLead.find(mySearchData).countDocuments();
    const Leads = await ReferralLead.find(mySearchData)
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "ReferralLead",
      data: Leads,
      totalDocs,
    });
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
};
const ReferralLeadAction = async (req, res, next) => {
  const { LeadType } = req.body;
  try {
    await ReferralLead.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          LeadType,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "ReferralLead Updated Successful",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};
// phone_number
const createBulkLead = async (req, res, next) => {
  try {
    console.log("ddddmm", req.body);

    const { bulkLead } = req.body;
    console.log("running createBulkLead function ", bulkLead);
    const data = await ReferralLead.insertMany(
      bulkLead.map((obj) => ({ ...obj, newDate: convertUTCDateToLocalDate() }))
    );
    res.status(201).json({
      success: true,
      message: "All Leads Created",
      data,
    });
  } catch (error) {
    console.log("check error", error);
    return res.status(500).json({
      success: true,
      message: error,
    });
  }
};
const searchLeadByName = async (req, res, next) => {
  const { page, limit, queryStr, User } = req.query;
  console.log("chekc this user ", page, limit, queryStr, User);
  try {
    const data = await ReferralLead.find({
      // User: User,
      $or: [
        {
          full_name: { $regex: queryStr, $options: "i" },
        },
        {
          email: { $regex: queryStr, $options: "i" },
        },
        {
          phone_number: { $regex: queryStr, $options: "i" },
        },
      ],
    })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalDocs = await ReferralLead.find({
      User: User,
      $or: [
        {
          full_name: { $regex: queryStr, $options: "i" },
        },
        {
          email: { $regex: queryStr, $options: "i" },
        },
        {
          phone_number: { $regex: queryStr, $options: "i" },
        },
      ],
    }).countDocuments();

    res.status(200).json({
      success: true,
      message: "search Leads ",
      data,
      totalDocs,
    });
  } catch (error) {
    console.log("check error", error);
    return res.status(500).json({
      success: true,
      message: error,
    });
  }
};

const searchAllByFilter = async (req, res, next) => {
  try {
    const { toTime, fromTime, User, page, limit, salesPersonId, LeadType } =
      req.body;
    let from = new Date(
      `${fromTime.split("T")[0]}T00:00:00.000+05:30`
    ).toISOString(); //21
    let To = new Date(
      `${toTime.split("T")[0]}T23:59:59.000+05:30`
    ).toISOString();

    const Leads = await ReferralLead.find({
      $or: [
        { LeadType: { $eq: LeadType } },
        { "salesPerson.id": { $eq: salesPersonId } },
      ],
      createdAt: {
        $gte: from,
        $lte: To,
      },
      User,
    })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "ReferralLead",
      data: Leads,
      totalDocs,
    });
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
};

module.exports = {
  getReferralLead,
  postReferralLead,
  putReferralLead,
  deleteReferralLead,
  getReferralLeadByTime,
  ReferralLeadAction,
  getReferralLeadBYFilter,
  createBulkLead,
  searchLeadByName,
  searchAllByFilter,
};
