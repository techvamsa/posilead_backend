const pageSchema = require("../modal/pageSchema");
const ReferralLead = require("../modal/ReferralLead");
const {
  convertDateToUtcTo,
  convertDateToUtcFrom,
} = require("../util/ImpFunctions.js");

const ObjectId = require("mongodb").ObjectId;

// utils
const convertTwoArrIntoOne = (arr1, arr2) => {
  const a = arr1;
  const b = arr2;
  let c;
  a.forEach((ele, index) => {
    const value = b.find((e, index) => {
      if (e.date === ele.date) {
        b.splice(index, 1);
      }
      return e.date === ele.date;
    });
    if (value) {
      a[index] = {
        date: ele.date,
        leads: ele.leads + value.leads,
      };
    }
  });
  c = [...a, ...b];
  return c.sort((a, b) => a.date - b.date);
};

const convertTwoArrIntoOneByLeadType = (arr1, arr2) => {
  const a = arr1;
  const b = arr2;

  let c;
  a.forEach((ele, index) => {
    const findData = b.find((e, index) => {
      if (e.name === ele.name) {
        b.splice(index, 1);
      }
      return e.name === ele.name;
    });

    if (findData) {
      a[index] = {
        name: ele.name,
        value: ele.value + findData.value,
      };
    }
  });
  c = [...a, ...b];

  return c;
};
// utils

const getLeadCountByServices = async (req, res, next) => {
  const { appId, fromTime, toTime, pageId } = req.body;

  let from = convertDateToUtcFrom(fromTime);
  let To = convertDateToUtcTo(toTime);
  try {
    const leads = await pageSchema.aggregate([
      {
        $match: {
          appId,
          page_id: pageId,
        },
      },
      // {$set: {incharge: {$toObjectId: "$Services"} }},
      {
        $lookup: {
          from: "services",
          localField: "Services",
          foreignField: "_id",
          as: "inventory_docs",
        },
      },
      {
        $unwind: "$inventory_docs", // marge multiple docs in one array of objects
      },
      {
        $project: {
          inventory_docs: 1,
          leads: {
            $filter: {
              input: "$leads",
              as: "act",
              cond: {
                $and: [
                  { $gt: ["$$act.newDate", from] },
                  { $lte: [`$$act.newDate`, To] },
                ],
              },
            },
          },
        },
      },

      {
        $unwind: "$leads", // marge multiple docs in one array of objects
      },
      {
        $group: {
          _id: "$inventory_docs.serviceName",
          value: { $sum: 1 },
        },
      },
    ]);

    const newArrayOfObj = leads.map(({ _id: name, ...rest }) => ({
      name,
      ...rest,
    }));

    res.status(200).json({
      success: true,
      data: newArrayOfObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
const getSalesPersonLeadsCount = async (req, res, next) => {
  const { appId, fromTime, toTime, pageId, UserId } = req.body;
  let from = convertDateToUtcFrom(fromTime);
  let To = convertDateToUtcTo(toTime);
  try {
    const myReferralLead = await ReferralLead.aggregate([
      {
        $match: {
          newDate: {
            $gt: from,
            $lte: To,
          },
          User: ObjectId(UserId),
        },
      },
      {
        $group: {
          _id: "$salesPerson.name",
          value: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    const leads = await pageSchema.aggregate([
      {
        $match: {
          appId,
          page_id: pageId,
        },
      },
      {
        $project: {
          leads: {
            $filter: {
              input: "$leads",
              as: "act",
              cond: {
                $and: [
                  { $gt: ["$$act.newDate", from] },
                  { $lte: [`$$act.newDate`, To] },
                ],
              },
            },
          },
        },
      },
      {
        $unwind: "$leads", // marge multiple docs in one array of objects
      },
      {
        $group: {
          _id: "$leads.salesPerson.name",
          count: { $sum: 1 },
        },
      }, //
    ]);
    const newArrayOfObj = leads
      .map(({ _id: name, count: value }) => ({ name, value }))
      .filter((e) => e.name !== null);

    const myReferralLeadObj = myReferralLead
      .map(({ _id: name, ...value }) => ({ name, ...value }))
      .filter((e) => e.name !== null);
    const myAddedArr = convertTwoArrIntoOneByLeadType(
      newArrayOfObj,
      myReferralLeadObj
    ).map(({ value: count, ...name }) => ({
      ...name,
      count,
    }));

    res.status(200).json({
      success: true,
      data: myAddedArr,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
const getSalesPersonLeadTypeCount = async (req, res, next) => {
  const { appId, fromTime, toTime, salesPerson_id, pageId, UserId } = req.body;

  const AllLeadType = [
    { name: "NEW LEAD", value: 0 },
    { name: "NOT PICKUP", value: 0 },
    { name: "HOT LEAD", value: 0 },
    { name: "QUALIFIED", value: 0 },
    { name: "NOT QUALIFIED", value: 0 },
    { name: "CONVERSION LEAD", value: 0 },
  ];
  const MyToTime = new Date(toTime);
  const MyFromTime = new Date(fromTime);
  let from = new Date(
    MyFromTime.getFullYear(),
    MyFromTime.getMonth(),
    MyFromTime.getDate(),
    0,
    0,
    0
  ).setUTCHours(0, 0, 0, 0);

  let To = new Date(
    MyToTime.getFullYear(),
    MyToTime.getMonth(),
    MyToTime.getDate(),
    23,
    59,
    59
  ).setUTCHours(0, 0, 0, 0);
  try {
    const myReferralLead = await ReferralLead.aggregate([
      {
        $match: {
          newDate: {
            $gt: from,
            $lte: To,
          },
          User: ObjectId(UserId),
          "salesPerson.id": salesPerson_id.toString(),
        },
      },
      {
        $group: {
          _id: "$LeadType",
          value: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const leads = await pageSchema.aggregate([
      {
        $match: {
          appId,
          page_id: pageId,
        },
      },
      {
        $project: {
          leads: {
            $filter: {
              input: "$leads",
              as: "act",
              cond: {
                $and: [
                  { $gt: ["$$act.newDate", from] },
                  { $lte: [`$$act.newDate`, To] },
                  { $eq: [`$$act.salesPerson.id`, salesPerson_id.toString()] },
                ],
              },
            },
          },
        },
      },
      {
        $unwind: "$leads", // marge multiple docs in one array of objects
      },
      {
        $group: {
          _id: "$leads.LeadType",
          count: { $sum: 1 },
        },
      },
    ]);
    const myReferralLeadObj = myReferralLead.map(({ _id: name, ...rest }) => ({
      name,
      ...rest,
    }));
    const newArrayOfObj = leads.map(({ _id: name, count: value }) => ({
      name,
      value,
    }));

    const myAddedArr = convertTwoArrIntoOneByLeadType(
      newArrayOfObj,
      myReferralLeadObj
    ).map(({ value: count, ...name }) => ({
      ...name,
      count,
    }));
    AllLeadType.forEach((ele, index) => {
      const x = myAddedArr.find((e) => e.name === ele.name);
      if (x) {
        AllLeadType[index] = x;
      }
    });

    res.status(200).json({
      success: true,
      data: AllLeadType,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
const getThisMonthGraphByTime = async (req, res, next) => {
  const { appId, fromTime, toTime, pageId, UserId } = req.body;

  let from = convertDateToUtcFrom(fromTime);
  let To = convertDateToUtcTo(toTime);

  try {
    const myReferralLead = await ReferralLead.aggregate([
      {
        $match: {
          newDate: {
            $gt: from,
            $lte: To,
          },
          User: ObjectId(UserId),
        },
      },
      { $group: { _id: "$newDate", leads: { $sum: 1 } } },
      {
        $sort: { _id: 1 },
      },
    ]);

    const leads = await pageSchema.aggregate([
      {
        $match: {
          appId,
          page_id: pageId,
        },
      },
      {
        $project: {
          leads: {
            $filter: {
              input: "$leads",
              as: "act",
              cond: {
                $and: [
                  { $gt: ["$$act.newDate", from] },
                  { $lte: [`$$act.newDate`, To] },
                ],
              },
            },
          },
        },
      },
      {
        $unwind: "$leads", // marge multiple docs in one array of objects
      },
      { $group: { _id: "$leads.newDate", leads: { $sum: 1 } } }, //  The output is one document for each unique group key leads.newDate.
      {
        $sort: { _id: 1 },
      },
    ]);
    const myReferralLeadObj = myReferralLead.map(({ _id: date, ...rest }) => ({
      date: new Date(date).getDate(),
      ...rest,
    }));
    const newArrayOfObj = leads.map(({ _id: date, ...rest }) => ({
      date: new Date(date).getDate(),
      ...rest,
    }));

    res.status(200).json({
      success: true,
      data: convertTwoArrIntoOne(newArrayOfObj, myReferralLeadObj),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
const getReportLeadTypeByType = async (req, res, next) => {
  try {
    const { appId, key, value, fromTime, toTime, pageId, UserId } = req.body;
    let from = convertDateToUtcFrom(fromTime);
    let To = convertDateToUtcTo(toTime);
    const totalDocs = await ReferralLead.find({
      newDate: {
        $gte: from,
        $lte: To,
      },
      [key]: {
        $eq: value,
      },
      User: UserId,
    }).countDocuments();

    const leads = await pageSchema.aggregate([
      {
        $match: {
          appId,
          page_id: pageId,
        },
      },
      {
        $project: {
          leads: {
            $filter: {
              input: "$leads",
              as: "act",
              cond: {
                $and: [
                  { $gte: ["$$act.newDate", from] },
                  { $lte: [`$$act.newDate`, To] },
                  { $eq: [`$$act.${key}`, value] },
                ],
              },
            },
          },
        },
      },
    ]);

    let newArray = [];
    leads.map((p) => {
      if (p.leads.length != 0) {
        p.leads.map((o) => {
          newArray.push(o);
        });
      }
    });
    res.status(200).json({
      success: true,
      message: "success",
      // data: leads
      perviousDayLeads: newArray.length + totalDocs,
      // allPerviousDayLeads: newArray,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: "not success",
      error: error.message,
    });
  }
};
const getTotalNoOfLeads = async (req, res, next) => {
  try {
    const { appId, fromTime, toTime, pageId, UserId } = req.body;

    let from = convertDateToUtcFrom(fromTime);
    let To = convertDateToUtcTo(toTime);
    const leads = await pageSchema.aggregate([
      {
        $match: {
          appId,
          page_id: pageId,
        },
      },
      {
        $project: {
          leads: {
            $filter: {
              input: "$leads",
              as: "act",
              cond: {
                $and: [
                  { $gte: ["$$act.newDate", from] },
                  { $lte: [`$$act.newDate`, To] },
                ],
              },
            },
          },
        },
      },
    ]);
    const totalDocs = await ReferralLead.find({
      newDate: {
        $gt: from,
        $lte: To,
      },
      User: ObjectId(UserId),
    }).countDocuments();

    let newArray = [];

    leads.map((p) => {
      if (p.leads.length != 0) {
        p.leads.map((o) => {
          newArray.push(o);
        });
      }
    });

    res.status(200).json({
      success: true,
      message: "success",
      // data: leads
      perviousDayLeads: newArray.length + totalDocs,
      // allPerviousDayLeads: newArray,
    });
  } catch (error) {
    console.log("error", error);
    res.status(200).json({
      success: false,
      message: "not success",
      error: error.message,
    });
  }
};
const getTotalNoOfLeadsType = async (req, res, next) => {
  try {
    const { appId, fromTime, toTime, pageId, UserId } = req.body;
    const AllLeadType = [
      { name: "NEW LEAD", value: 0 },
      { name: "NOT PICKUP", value: 0 },
      { name: "HOT LEAD", value: 0 },
      { name: "QUALIFIED", value: 0 },
      { name: "NOT QUALIFIED", value: 0 },
      { name: "CONVERSION LEAD", value: 0 },
    ];
    let from = convertDateToUtcFrom(fromTime);
    let To = convertDateToUtcTo(toTime);
    const myReferralLead = await ReferralLead.aggregate([
      {
        $match: {
          newDate: {
            $gt: from,
            $lte: To,
          },
          User: ObjectId(UserId),
        },
      },
      {
        $group: {
          _id: "$LeadType",
          value: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const leads = await pageSchema.aggregate([
      {
        $match: {
          appId,
          page_id: pageId,
        },
      },
      {
        $project: {
          leads: {
            $filter: {
              input: "$leads",
              as: "act",
              cond: {
                $and: [
                  { $gt: ["$$act.newDate", from] },
                  { $lte: [`$$act.newDate`, To] },
                ],
              },
            },
          },
        },
      },
      {
        $unwind: "$leads", // marge multiple docs in one array of objects
      },
      {
        $group: {
          _id: "$leads.LeadType",
          value: { $sum: 1 },
        },
      },
    ]);

    const newArrayOfObj = leads.map(({ _id: name, ...rest }) => ({
      name,
      ...rest,
    }));
    const myReferralLeadObj = myReferralLead.map(({ _id: name, ...rest }) => ({
      name,
      ...rest,
    }));

    const myAddedArr = convertTwoArrIntoOneByLeadType(
      newArrayOfObj,
      myReferralLeadObj
    );
    AllLeadType.forEach((ele, index) => {
      const x = myAddedArr.find((e) => e.name === ele.name);
      if (x) {
        AllLeadType[index] = x;
      }
    });

    res.status(200).json({
      success: true,
      data: AllLeadType,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: "not success",
      error: error.message,
    });
  }
};

const getTotalNoOfLeadsForSalesPerson = async (req, res, next) => {
  try {
    const { appId, fromTime, toTime, pageId, UserId, salesPersonId } = req.body;

    let from = convertDateToUtcFrom(fromTime);
    let To = convertDateToUtcTo(toTime);
    const leads = await pageSchema.aggregate([
      {
        $match: {
          appId,
          page_id: pageId,
        },
      },
      {
        $project: {
          leads: {
            $filter: {
              input: "$leads",
              as: "act",
              cond: {
                $and: [
                  { $gte: ["$$act.newDate", from] },
                  { $lte: [`$$act.newDate`, To] },
                  { $eq: [`$$act.salesPerson.id`, salesPersonId] },
                ],
              },
            },
          },
        },
      },
    ]);
    const totalDocs = await ReferralLead.find({
      newDate: {
        $gt: from,
        $lte: To,
      },
      User: ObjectId(UserId),
      "salesPerson.id": salesPersonId,
    }).countDocuments();

    let newArray = [];

    leads.map((p) => {
      if (p.leads.length != 0) {
        p.leads.map((o) => {
          newArray.push(o);
        });
      }
    });

    res.status(200).json({
      success: true,
      message: "success",
      // data: leads
      perviousDayLeads: newArray.length + totalDocs,
      // allPerviousDayLeads: newArray,
    });
  } catch (error) {
    console.log("error", error);
    res.status(200).json({
      success: false,
      message: "not success",
      error: error.message,
    });
  }
};

const getReportLeadTypeByTypeForSalesPerson = async (req, res, next) => {
  try {
    const { appId, key, value, fromTime, toTime, pageId, UserId,salesPersonId } = req.body;
    let from = convertDateToUtcFrom(fromTime);
    let To = convertDateToUtcTo(toTime);
    const totalDocs = await ReferralLead.find({
      newDate: {
        $gte: from,
        $lte: To,
      },
      [key]: {
        $eq: value,
      },
      User: UserId,
      "salesPerson.id": salesPersonId,
    }).countDocuments();

    const leads = await pageSchema.aggregate([
      {
        $match: {
          appId,
          page_id: pageId,
        },
      },
      {
        $project: {
          leads: {
            $filter: {
              input: "$leads",
              as: "act",
              cond: {
                $and: [
                  { $gte: ["$$act.newDate", from] },
                  { $lte: [`$$act.newDate`, To] },
                  { $eq: [`$$act.${key}`, value] },
                  { $eq: [`$$act.salesPerson.id`, salesPersonId] },
                ],
              },
            },
          },
        },
      },
    ]);

    let newArray = [];
    leads.map((p) => {
      if (p.leads.length != 0) {
        p.leads.map((o) => {
          newArray.push(o);
        });
      }
    });
    res.status(200).json({
      success: true,
      message: "success",
      // data: leads
      perviousDayLeads: newArray.length + totalDocs,
      // allPerviousDayLeads: newArray,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: "not success",
      error: error.message,
    });
  }
};
module.exports = {
  getLeadCountByServices,
  getSalesPersonLeadsCount,
  getSalesPersonLeadTypeCount,
  getThisMonthGraphByTime,
  getReportLeadTypeByType,
  getTotalNoOfLeads,
  getTotalNoOfLeadsType,
  getTotalNoOfLeadsForSalesPerson,
  getReportLeadTypeByTypeForSalesPerson
};
