const pageSchema = require("../modal/pageSchema");
const salesPersonSchema = require("../modal/salesPerson");
const messageLogs = require("../modal/WhatAppMessage");
const ReferralLead = require("../modal/ReferralLead");
const userSchema = require("../modal/UserSchema");
const handleError = require("../util/handleError");
const mail = require("../util/nodeMailer");
const ObjectId = require("mongodb").ObjectId;
const fs = require("fs");
async function createFile(fileName, data) {
  await fs.writeFile("Output.txt", JSON.stringify(data), (err) => {
    // In case of a error throw err.
    if (err) throw err;
  });
}
const axios = require("axios");
const {
  convertDateToUtcFrom,
  convertDateToUtcTo,
} = require("../util/ImpFunctions.js");

function convertUTCDateToLocalDate() {
  const myTimeZone = new Date().toLocaleDateString("en-US", {
    timeZone: "Asia/Kolkata",
  });

  let mdy = myTimeZone.split("/");
  console.log(mdy, "dd");

  let year = mdy[2];
  let month = mdy[0];
  let date = mdy[1];

  if (date < 10) {
    date = `0${date}`;
  }
  if (month < 10) {
    month = `0${month}`;
  }

  let myDate = `${year}-${month}-${date}`;
  let newDate = new Date(`${myDate}T00:00:00.000+05:30`);
  return newDate.valueOf();
}
function convertDateToUtcWithDays(days) {
  const myTimeZone = new Date().toLocaleDateString("en-US", {
    timeZone: "Asia/Kolkata",
  });

  let mdy = myTimeZone.split("/");
  console.log(mdy, "dd");

  let year = mdy[2];
  let month = mdy[0];
  let date = mdy[1];

  if (date < 10) {
    date = `0${date}`;
  }
  if (month < 10) {
    month = `0${month}`;
  }

  let myDate = `${year}-${month}-${date}`;
  let newDate = new Date(`${myDate}T00:00:00.000+05:30`);
  return newDate.valueOf();
}
const convertTwoArrIntoOneByLeadType = (arr1, arr2) => {
  const a = arr1;
  const b = arr2;

  let c;
  a.forEach((ele, index) => {
    const findData = b.find((e, index) => {
      if (e._id === ele._id) {
        b.splice(index, 1);
      }
      return e._id === ele._id;
    });

    if (findData) {
      a[index] = {
        _id: ele._id,
        count: ele.count + findData.count,
      };
    }
  });
  c = [...a, ...b];

  return c;
};
const getPostPageSchema = async (req, res, next) => {
  try {
    const user = await pageSchema.find();
    res.status(200).json({
      success: true,
      message: "Fetched Successfully",
      data: user,
    });
  } catch (error) {
    return next(handleError(500, error));
    // res.status(500).json(error)
  }
};
const getPageById = async (req, res, next) => {
  try {
    const Page = await pageSchema
      .findById(req.params.id)
      .populate("Services salesPerson");
    res.status(200).json({
      success: true,
      message: "Fetched Successfully",
      data: Page,
    });
  } catch (error) {
    return next(handleError(500, error));

    // res.status(500).json(error)
  }
};

const updatePage = async (req, res, next) => {
  try {
    console.log(req.params.id, "running");
    const data = await pageSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Updated Successful",
      data,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

const postPageSchema = async (req, res, next) => {
  console.log("running");

  let currentDate = convertUTCDateToLocalDate();

  try {
    const { page_id, form_id, adgroup_id, ad_id, leads, appId, application } =
      req.body;

    const isExists = await pageSchema.findOne({
      page_id: page_id,
      form_id: form_id,
    });
    const user = await userSchema.findOne({ AppId: appId });
    const serviceId = isExists?.Services;
    const leadsLengths = isExists?.leads;
    let salesPersonId;
    if (application.leadDistribution == "AUTOMATIC") {
      if (serviceId) {
        const allSalesPerson = await salesPersonSchema.find({
          Service: serviceId,
        });
        //Send MAIL hey leads coming now but you have not amy salesperson Added
        if (allSalesPerson.length === 0) {
          const Email = user.Email;

          if (!isExists) {
            await mail(
              Email,
              `Hey ${user.Name} ,Now Leads are coming but Sales person Not Added (For Automatic Lead distribution) for Service Id :-`,
              "Regarding SalesPerson",
              serviceId
            );
          }
        } else {
          console.log("ss", leadsLengths.length % allSalesPerson.length);
          const salesPersonIndex = leadsLengths.length % allSalesPerson.length;

          salesPersonId = allSalesPerson[salesPersonIndex];
        }
      } else {
        const Email = user.Email;
        // Leads are coming but Service not added MAIL
        const data = await mail(
          Email,
          `Hey ${user.Name} ,Now Leads are coming but Service not added Please add Service so that lead can be distribute`,
          "Regarding Service",
          ""
        );
        console.log(data, "email data");
      }
    }

    if (isExists) {
      const { leads } = req.body;
      const isCustomField = {};
      const allIsCustomFields = Object.keys(isExists?.leads[0]).filter((e) =>
        e.startsWith("isCustom_")
      );

      allIsCustomFields.forEach((p) => {
        isCustomField[p] = "";
      });
      if (salesPersonId) {
        data = await pageSchema.findByIdAndUpdate(isExists._id, {
          $push: {
            leads: {
              ...isCustomField,
              ...leads,
              salesPerson: {
                id: salesPersonId._id.toString(),
                name: salesPersonId.Name,
              },
              LeadAssignedTime: Date.now(),
              newDate: currentDate,
              isAssigned: true,
            },
          },
        });
      } else {
        data = await pageSchema.findByIdAndUpdate(isExists._id, {
          $push: {
            leads: {
              ...isCustomField,
              ...leads,
              isAssigned: false,
              newDate: currentDate,
              LeadAssignedTime: Date.now(),
            },
          },
        });
      }
    } else {
      if (salesPersonId) {
        data = await pageSchema.create({
          page_id,
          form_id,
          adgroup_id,
          appId,
          ad_id,
          leads: [
            {
              ...leads,
              salesPerson: {
                id: salesPersonId._id.toString(),
                name: salesPersonId.Name,
              },
              LeadAssignedTime: Date.now(),
              newDate: currentDate,
              isAssigned: true,
              callLog: [],
            },
          ],
        });
      } else {
        data = await pageSchema.create({
          page_id,
          form_id,
          adgroup_id,
          appId,
          ad_id,
          leads: [
            {
              ...leads,
              // newDate: d.setUTCHours(0, 0, 0, 0),
              newDate: currentDate,
              LeadAssignedTime: Date.now(),
              isAssigned: false,
              callLog: [],
            },
          ],
        });
      }
    }

    //=> welcome message
    if (user?.whatsAppMarketing && user?.Template && user?.InteraktToken) {
      try {
        await axios.post(
          "https://api.interakt.ai/v1/public/message/",
          {
            countryCode: leads?.phone_number.slice(0, 3),
            phoneNumber: leads?.phone_number.slice(3, 13), //ele.leads.phone_number
            callbackData: "Welcome message",
            type: "Template",
            template: {
              name: user?.Template.welComeMessage, // user?.Template.welComeMessage
              languageCode: "en",
              bodyValues: [leads?.full_name], // ele?.leads?.full_name
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${user?.InteraktToken}`, // user.InteraktToken
            },
          }
        );
      } catch (error) {}
      try {
        await messageLogs.create({
          full_name: leads?.full_name,
          phone_number: leads?.phone_number,
          email: leads?.email,
          User: user?._id,
          leadgen_id: leads?.leadgen_id,
          page_id,
          form_id,
          message_logs: [
            {
              template: user?.Template?.welComeMessage,
              created_date: currentDate,
              created_time: Date.now(),
            },
          ],
        });
      } catch (error) {}
    }

    //=> welcome message
    res.status(200).json({
      success: true,
      message: "Page Leads Created Successfully",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};
const findUserPages = async (req, res, next) => {
  try {
    const { page_id, form_id } = req.body;
    let isExists;
    if (page_id && form_id) {
      isExists = await pageSchema
        .findOne({
          page_id: page_id,
          form_id: form_id,
        })
        .populate("Services");
    } else {
      isExists = await pageSchema
        .find({
          page_id: page_id,
        })
        .populate("Services");
    }
    if (isExists == null) {
      isExists = [];
    }

    return res.status(200).json({
      success: true,
      isExists,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

const setLeadType = async (req, res, next) => {
  try {
    const { form_id, leadgen, LeadType, user } = req.body;

    // console.log(
    //   "form_id, leadgen, LeadType, user",
    //   form_id,
    //   leadgen,
    //   LeadType,
    //   user
    // );
    let d = new Date();
    let day;
    let template;

    switch (LeadType) {
      case "QUALIFIED":
        day = 45;
        template = "QUALIFIED";
        break;
      case "HOT LEAD":
        day = 2;
        template = "HOT_LEADS";
        break;
      case "NOT PICKUP":
        day = 7;
        template = "NOT_PICKUP";
        break;
      case "CONVERSION LEAD":
        day = 3; // feedback message then the +4d consumption message
        template = "CONVERSION_LEADS";
        break;
    }
    let lead_actionTime;
    if (day) {
      lead_actionTime = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate() + day
      );
    } else {
      lead_actionTime = new Date(0);
    }

    const data = await pageSchema.updateOne(
      { form_id, "leads.leadgen_id": leadgen?.leadgen_id },
      {
        "leads.$.LeadType": LeadType,
        "leads.$.lead_Action_time": lead_actionTime.setUTCHours(0, 0, 0, 0),
        "leads.$.day_After_Message": day,
      }
    );

    if (
      user?.whatsAppMarketing &&
      user?.Template &&
      user?.InteraktToken &&
      user?.Template[template]?.firstMessage &&
      template
    ) {
      try {
        await axios.post(
          "https://api.interakt.ai/v1/public/message/",
          {
            countryCode: leadgen.phone_number.slice(0, 3),
            phoneNumber: leadgen.phone_number.slice(3, 13), //leadgen.phone_number
            callbackData: "  ",
            type: "Template",
            template: {
              name: user?.Template[template].firstMessage, // user?.Template.welComeMessage
              languageCode: "en",
              bodyValues: [leadgen.full_name], // leadgen.full_name
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${user.InteraktToken}`, // user.InteraktToken
            },
          }
        );
      } catch (error) {
        console.log("errorerrorerrorerrorerror", error.response.data);
      }

      try {
        console.log("leadgen", leadgen);
        console.log(
          {
            leadgen_id: leadgen?.leadgen_id,
            User: user._id,
            form_id,
          },
          "STEP - 1 "
        );
        const leadsData = await messageLogs.findOne({
          leadgen_id: leadgen?.leadgen_id,
          User: user._id,
          form_id,
        });
        // const leadsData = await messageLogs.findOne(req.query?req.query:{})

        console.log("STEP - 2 ", leadsData);
        if (leadsData) {
          console.log("myData-myData-secondTime");
          let data = await messageLogs.findByIdAndUpdate(leadsData._id, {
            $push: {
              message_logs: {
                template: user?.Template[template]?.firstMessage,
                created_date: convertUTCDateToLocalDate(),
                created_time: Date.now(),
              },
            },
          });
        } else {
          const data = await messageLogs.create({
            full_name: leadgen.full_name,
            phone_number: leadgen.phone_number,
            email: leadgen.email,
            User: user._id,
            leadgen_id: leadgen.leadgen_id,
            page_id: user.selectedPage.id,
            form_id,
            message_logs: [
              {
                template: user?.Template[template]?.firstMessage,
                created_date: convertUTCDateToLocalDate(),
                created_time: Date.now(),
              },
            ],
          });
          console.log("check data create 2", data);
        }
      } catch (error) {
        console.log("check data create ERROR 2", error);
      }
    }

    return res.json({
      data,
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      error,
    });
  }
};
// not use full check and delete
const addSalesPersonToLeads = async (req, res, next) => {
  try {
    const { form_id, leadgen_id, salesPerson } = req.body;

    const data = await pageSchema.updateOne(
      { form_id, "leads.leadgen_id": leadgen_id },
      {
        "leads.$.salesPerson": salesPerson,
      }
    );
    res.json({
      data,
    });
  } catch (error) {
    console.log("errr", error);
  }
};

const setAssignedLead = async (req, res, next) => {
  try {
    const { form_id, leadgen_id, salesPerson } = req.body;
    console.log(
      "form_id, leadgen_id, salesPerson ",
      form_id,
      leadgen_id,
      salesPerson
    );

    if (!salesPerson) {
      return false;
    }
    const data = await pageSchema.updateMany(
      { form_id, "leads.leadgen_id": leadgen_id },
      {
        "leads.$.salesPerson": salesPerson,
        "leads.$.isAssigned": true,
        "leads.$.LeadAssignedTime": Date.now(),
      }
    );
    console.log("data", data);
    res.json({
      data,
    });
  } catch (error) {
    return console.log("errr", error);
  }
};
const addOrEditComment = async (req, res, next) => {
  try {
    const { form_id, leadgen_id, comment } = req.body;

    const data = await pageSchema.updateOne(
      { form_id, "leads.leadgen_id": leadgen_id },
      {
        $push: { "leads.$.callLog": comment },
      }
    );
    res.json({
      data,
    });
  } catch (error) {
    return console.log("errr", error);
  }
};

// not working
const setServicesToForm = async (req, res, next) => {
  console.log("running");
  try {
    const data = await pageSchema.updateMany(
      {
        "leads.leadgen_id": {
          $in: ["1853447141682245", "539323508125510"],
        },
      },
      {
        $set: {
          "leads.$[elem].salesPerson": "63c139f044502fb5aff42fda",
        },
      },
      {
        arrayFilters: [
          {
            "elem.leadgen_id": {
              $in: ["1853447141682245", "539323508125510"],
            },
          },
        ],
      }
    );
    res.status(200).json(data);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const getLeadsData = async (req, res, next) => {
  const { key, value, formId, fromTime, toTime } = req.body;
  console.log("fromTime:-", fromTime, "toTime:-", toTime);
  let from;
  let To;
  let leads;
  if (fromTime && toTime) {
    from = new Date(`${fromTime.split("T")[0]}T00:00:00.000+05:30`).valueOf(); //21
    To = new Date(`${toTime.split("T")[0]}T23:59:59.000+05:30`).valueOf();
  }

  try {
    if (fromTime && toTime) {
      leads = await pageSchema.aggregate([
        {
          $match: {
            form_id: formId,
          },
        },
        {
          $project: {
            Services: 1, // Field want to display 0 for not selected
            formName: 1,
            pageName: 1,
            page_id: 1,
            form_id: 1,
            createdAt: 1,
            updatedAt: 1,
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
    } else {
      leads = await pageSchema.aggregate([
        {
          $match: {
            form_id: formId,
          },
        },
        {
          $project: {
            Services: 1, // Field want to display 0 for not selected
            formName: 1,
            pageName: 1,
            page_id: 1,
            form_id: 1,
            createdAt: 1,
            updatedAt: 1,
            leads: {
              $filter: {
                input: "$leads",
                as: "act",
                cond: { $eq: [`$$act.${key}`, value] },
              },
            },
          },
        },
      ]);
    }

    res.status(200).json({
      success: true,
      isExists: leads[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
    console.log("error", error);
  }
};

const getAllSalesPersonForms = async (req, res, next) => {
  console.log("running");
  const { Services } = req.body;
  try {
    const leads = await pageSchema.find(
      {
        Services,
      },
      {
        page_id: 1,
        pageName: 1,
        form_id: 1,
        formName: 1,
      }
    );

    res.status(200).json({
      success: true,
      isExists: leads,
    });
  } catch (error) {
    console.log("error", error);
  }
};
// Done
const getTotalNoOfPerviousDayLeads = async (req, res, next) => {
  try {
    const { appId } = req.body;

    const myTimeZone = new Date().toLocaleDateString("en-US", {
      timeZone: "Asia/Kolkata",
    });

    let mdy = myTimeZone.split("/");

    let year = mdy[2];
    let month = mdy[0];
    let date = mdy[1];

    if (date < 10) {
      date = `0${date}`;
    }
    if (month < 10) {
      month = `0${month}`;
    }
    let myDate = `${year}-${month}-${date - 1}`;
    let newDate = new Date(`${myDate}T00:00:00.000+05:30`);
    let perviousDayDate = newDate.valueOf();

    const leads = await pageSchema.aggregate([
      {
        $match: {
          appId,
        },
      },
      {
        $project: {
          // _id:1,// Field want to display
          leads: {
            $filter: {
              input: "$leads",
              as: "act",
              cond: { $gte: ["$$act.Lead_Created_Date", perviousDayDate] },
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
      perviousDayLeads: newArray.length,
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

const getDashBoardData = async (req, res, next) => {
  try {
    const { appId, key, value } = req.body;

    let newDate = new Date();
    newDate = newDate.setDate(newDate.getDate() - 1);
    newDate = new Date(newDate).toDateString();
    let perviousDayDate = new Date(newDate).getTime();
    const leads = await pageSchema.aggregate([
      {
        $match: {
          appId,
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
                  { $gte: ["$$act.Lead_Created_Date", perviousDayDate] },
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
      perviousDayLeads: newArray.length,
      allPerviousDayLeads: newArray,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: "not success",
      error: error.message,
    });
  }
};
// forms lead data previous
const graphData = async (req, res) => {
  try {
    const { appId } = req.body;
    const leads = await pageSchema.aggregate([
      {
        $match: {
          appId,
        },
      },
      {
        $project: {
          form_id: 1,
          pageName: 1,
          formName: 1,
          numberLeads: {
            $cond: {
              if: { $isArray: "$leads" },
              then: { $size: "$leads" },
              else: "NA",
            },
          },
        },
        // numberLeads is a Variable  then $cond is a condition and check if it leads is array then return length in  numberLead else return none
      },
    ]);
    res.status(200).json({
      leads,
      success: true,
      // message: "not success",
    });
  } catch (error) {}
};

// TIME DONE
const getLeadsByTime = async (req, res, next) => {
  try {
    const { appId, formId, fromTime, toTime } = req.body;
    let from = convertDateToUtcFrom(fromTime);
    let To = convertDateToUtcTo(toTime);
    const MyFilterArr = [
      { $gte: ["$$act.newDate", from] },
      { $lte: [`$$act.newDate`, To] },
    ];

    const leads = await pageSchema.aggregate([
      {
        $match: {
          appId: appId,
          form_id: formId,
        },
      },
      {
        $project: {
          Services: 1,
          leads: {
            $filter: {
              input: "$leads",
              as: "act",
              cond: {
                $and: MyFilterArr,
              },
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "success",
      data: leads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "not success",
      error: error.message,
    });
  }
};
// Done time changes
const getLeadsByTimeForSalesPerson = async (req, res, next) => {
  try {
    const { appId, formId, fromTime, toTime, salesPersonId } = req.body;

    let from = convertDateToUtcFrom(fromTime);
    let To = convertDateToUtcTo(toTime);
    const leads = await pageSchema.aggregate([
      {
        $match: {
          appId: appId,
          form_id: formId,
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
                  { $eq: [`$$act.salesPerson.id`, salesPersonId.toString()] },
                ],
              },
            },
          },
        },
      },
    ]);
    res.status(200).json({
      success: true,
      message: "success",
      data: leads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "not success",
      error: error.message,
    });
  }
};
const testPostLead = async (req, res, next) => {
  try {
    let d = new Date();
    d.setUTCHours(0, 0, 0, 0);

    const { data } = await axios.post("http://localhost:5000/api/page", {
      page_id: "101850946118854",
      form_id: "6560163654012977",
      appId: "577197084347049",
      leads: {
        leadgen_id: "839327390239472904",
        quantity: "10",
        full_name: "change this",
      },
    });
    res.status(200).json({
      data,
    });
  } catch (error) {
    console.log("error");
    res.status(500).json({
      error: error,
    });
  }
};

// DONE TIME CHANGES

const addCustomsField = async (req, res) => {
  const { key, form_id } = req.body;
  const myField = {};
  myField[`leads.$[].isCustom_${key}`] = "";

  try {
    const data = await pageSchema.updateOne({ form_id }, myField);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error,
    });
  }
};

const addFieldsToServices = async (req, res) => {
  const { key, Services, id } = req.body;

  const myField = {};
  myField[`leads.$[].isCustom_${key}`] = "";

  try {
    Services.map(async (e) => {
      await pageSchema.updateMany({ Services: e.value }, myField, {
        new: true,
      });
    });

    await userSchema.updateMany(
      { _id: id },
      {
        $push: {
          CustomKey: `isCustom_${key}`,
        },
      },
      {
        new: true,
      }
    );
    console.log("running 1375");

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error,
    });
  }
};

const addOrEditCallLog = async (req, res, next) => {
  try {
    const { key, value, form_id, leadgen_id } = req.body;
    console.log("running", key, value, form_id, leadgen_id);
    const myField = {};
    myField[`leads.$.${key}`] = value;
    const data = await pageSchema.updateOne(
      { form_id, "leads.leadgen_id": leadgen_id },
      myField
    );
    res.json({
      data,
    });
  } catch (error) {
    return console.log("errr", error);
  }
};

const deleteTableKey = async (req, res, next) => {
  try {
    const { form_id, key } = req.body;

    const myField = {};
    myField[`leads.$[].${key}`] = "";
    // myField[`leads.$[].comment`] = "";
    console.log(myField);
    await pageSchema.updateOne(
      {
        form_id,
      },
      {
        $unset: myField,
      },
      { safe: true, multi: false }
    );
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
    });
  }
};

const deleteTableAllKey = async (req, res, next) => {
  try {
    console.log("running");
    const { key, appId, userId } = req.body;
    const myField = {};
    myField[`leads.$[].${key}`] = "";
    console.log(myField);
    await pageSchema.updateMany(
      {
        appId,
      },
      {
        $unset: myField,
      },
      { safe: true, multi: false }
    );

    await userSchema.findByIdAndUpdate(userId, {
      $pull: {
        CustomKey: `${key}`,
      },
    });
    console.log("running this 2");
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
    });
  }
};
const addMultipleKeyAtTime = async (req, res) => {
  const myField = {};
  const { Services, form_id } = req.body;
  try {
    const data = await pageSchema.findOne({
      Services,
    });
    const allIsCustomFields = Object.keys(data?.leads[0]).filter((e) =>
      e.startsWith("isCustom_")
    );
    allIsCustomFields.map((key, i) => {
      myField[`leads.$[].${key}`] = "";
    });
    console.log(myField, "myField");
    await pageSchema.updateOne({ form_id }, myField); // current form_id id
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error,
    });
  }
};

//  get Sales Person leads
const getSalesPersonLeads = async (req, res, next) => {
  const { appId } = req.body;
  console.log(appId);
  try {
    const leads = await pageSchema.aggregate([
      {
        $match: {
          appId,
        },
      },
      {
        $unwind: "$leads", // marge multiple docs in one array of objects
      },
      {
        $group: {
          _id: "$leads.salesPerson.id",
          count: { $sum: 1 },
        },
      }, //  The output is one document for each unique group key leads.newDate.
    ]);

    res.status(200).json({
      success: true,
      data: leads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
const getCallLogs = async (req, res) => {
  const { form_id, appId, key, value } = req.query;

  try {
    const data = await pageSchema.aggregate([
      {
        $match: {
          form_id,
          appId,
        },
      },
      {
        $project: {
          createdAt: 1,
          leads: {
            $filter: {
              input: "$leads",
              as: "act",
              cond: { $eq: [`$$act.${key}`, value] },
            },
          },
        },
      },
    ]);
    // console.log("data",data);
    res.status(200).json({
      success: true,
      data: data[0].leads[0].callLog,
    });
  } catch (error) {}
};

const AddFieldToLeads = async (req, res) => {
  const { key, form_id, appId, leadgen_id, value } = req.body;
  console.log("working", key, form_id, leadgen_id, value, appId);
  const myField = {};
  myField[`leads.$.${key}`] = value;
  // for Admin star  (key => adminImpLead) value = bool
  // for sales person star => salesPersonImpLead
  try {
    const data = await pageSchema.updateOne(
      { form_id, "leads.leadgen_id": leadgen_id, appId },
      myField
    );
    console.log("working", data);
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error,
    });
  }
};
const salesPersonLeadsFilter = async (req, res) => {
  const { key, value, formId, fromTime, toTime, salesPersonId } = req.body;
  // console.log({ key, value, formId, fromTime, toTime,salesPersonId } ,"salesPersonLeadsFilter");
  try {
    let from = convertDateToUtcFrom(fromTime);
    let To = convertDateToUtcTo(toTime);
    const leads = await pageSchema.aggregate([
      {
        $match: {
          form_id: formId,
        },
      },
      {
        $project: {
          Services: 1, // Field want to display 0 for not selected
          formName: 1,
          pageName: 1,
          page_id: 1,
          form_id: 1,
          createdAt: 1,
          updatedAt: 1,
          leads: {
            $filter: {
              input: "$leads",
              as: "act",
              cond: {
                $and: [
                  { $gte: ["$$act.newDate", from] },
                  { $lte: [`$$act.newDate`, To] },
                  { $eq: [`$$act.salesPerson.id`, salesPersonId.toString()] },
                  { $eq: [`$$act.${key}`, value] },
                ],
              },
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      isExists: leads[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const AssignedLeadToSalesPersonInBulks = async (req, res) => {
  try {
    const { form_id, salesPerson, fromTime, toTime, LeadAssignedTime } =
      req.body;
    if (!salesPerson) {
      return res.status(400).json({ message: "salesPerson Required" });
    }
    let from = convertDateToUtcFrom(fromTime);
    let To = convertDateToUtcTo(toTime);
    const leads = await pageSchema.find({
      form_id,
    });
    const unAssignLeads = [];
    const AssignLeads = [];
    await leads[0].leads.filter((ele) => {
      if (
        ele["newDate"] >= from &&
        ele["newDate"] <= To &&
        !ele["isAssigned"]
      ) {
        unAssignLeads.push(ele);
      } else {
        AssignLeads.push(ele);
      }
    });
    await unAssignLeads.forEach((element, index) => {
      const salesPersonIndex = index % salesPerson.length;

      return (unAssignLeads[index] = {
        ...element,
        salesPerson: {
          id: salesPerson[salesPersonIndex].value._id.toString(),
          name: salesPerson[salesPersonIndex].value.Name,
        },
        LeadAssignedTime,
        isAssigned: true,
      });
    });

    await pageSchema.findByIdAndUpdate(
      leads[0]._id,
      {
        $set: {
          leads: [...unAssignLeads, ...AssignLeads],
        },
      },
      { new: true }
    );
    res.status(200).json({ message: "Lead Assigned to salesPerson" });
  } catch (error) {
    return res.status(400).json({ error: error });
  }
};

const getThisMonthGraph = async (req, res, next) => {
  const { appId, UserId } = req.body;

  try {
    const myTimeZone = new Date().toLocaleDateString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    let mdy = myTimeZone.split("/");
    let year = mdy[2];
    let month = mdy[0];
    if (month < 10) {
      month = `0${month}`;
    }
    let myDate = `${year}-${month}-01`;
    let newDate = new Date(`${myDate}T00:00:00.000+05:30`);
    const myReferralLead = await ReferralLead.aggregate([
      {
        $match: {
          newDate: {
            $gt: newDate.valueOf(),
            $lte: convertUTCDateToLocalDate(),
          },
          User: ObjectId(UserId),
        },
      },
      { $group: { _id: "$newDate", count: { $sum: 1 } } },
      {
        $sort: { _id: 1 },
      },
    ]);
    const leads = await pageSchema.aggregate([
      {
        $match: {
          appId,
        },
      },
      {
        $project: {
          _id: 1, // Field want to display
          leads: {
            $filter: {
              input: "$leads",
              as: "act",
              cond: {
                $and: [
                  {
                    $gt: ["$$act.newDate", newDate.valueOf()],
                  },
                  { $lte: ["$$act.newDate", convertUTCDateToLocalDate()] },
                ],
              },
            },
          },
        },
      },
      {
        $unwind: "$leads", // marge multiple docs in one array of objects
      },
      { $group: { _id: "$leads.newDate", count: { $sum: 1 } } }, //  The output is one document for each unique group key leads.newDate.
      {
        $sort: { _id: 1 },
      },
    ]);

    const leadsData = convertTwoArrIntoOneByLeadType(leads, myReferralLead);

    res.status(200).json({
      success: true,
      data: leadsData,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getThisMonthGraphForSalesPerson = async (req, res, next) => {
  const { appId, UserId, salesPersonId } = req.body;

  try {
    const myTimeZone = new Date().toLocaleDateString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    let mdy = myTimeZone.split("/");
    let year = mdy[2];
    let month = mdy[0];
    if (month < 10) {
      month = `0${month}`;
    }
    let myDate = `${year}-${month}-01`;
    let newDate = new Date(`${myDate}T00:00:00.000+05:30`);
    const myReferralLead = await ReferralLead.aggregate([
      {
        $match: {
          newDate: {
            $gt: newDate.valueOf(),
            $lte: convertUTCDateToLocalDate(),
          },
          User: ObjectId(UserId),
          "salesPerson.id": salesPersonId,
        },
      },
      { $group: { _id: "$newDate", count: { $sum: 1 } } },
      {
        $sort: { _id: 1 },
      },
    ]);
    const leads = await pageSchema.aggregate([
      {
        $match: {
          appId,
        },
      },
      {
        $project: {
          _id: 1, // Field want to display
          leads: {
            $filter: {
              input: "$leads",
              as: "act",
              cond: {
                $and: [
                  {
                    $gt: ["$$act.newDate", newDate.valueOf()],
                  },
                  { $lte: ["$$act.newDate", convertUTCDateToLocalDate()] },
                  {
                    $eq: ["$$act.salesPerson.id", salesPersonId],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $unwind: "$leads", // marge multiple docs in one array of objects
      },
      { $group: { _id: "$leads.newDate", count: { $sum: 1 } } }, //  The output is one document for each unique group key leads.newDate.
      {
        $sort: { _id: 1 },
      },
    ]);

    const leadsData = convertTwoArrIntoOneByLeadType(leads, myReferralLead);

    res.status(200).json({
      success: true,
      data: leadsData,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// db.your_collection_name.aggregate([
//   { $project: { keys: { $objectToArray: "$$ROOT" } } },
//   { $unwind: "$keys" },
//   { $group: { _id: null, allKeys: { $addToSet: "$keys.k" } } }
// ]);

const getKeys = async (req,res) => {
  try {
   const data = await pageSchema.aggregate([
    {
      $match: {
        form_id: "889761475569805",
      },
    },
    { $unwind: "$leads" },
      // { $project: { keys: { $objectToArray: "$$ROOT" } } },
      // { $unwind: "$keys" },
      // { $group: { _id: null, allKeys: { $addToSet: "$keys.k" } } },
    ]);
    res.status(200).json({
      success: true,
      data: data,
    });
    // console.log(data,"");

  } catch (error) {
    res.status(500).json({
      success: true,
      data: error,
    });
  }
};

module.exports = {
  getPostPageSchema,
  postPageSchema,
  updatePage,
  findUserPages,
  getPageById,
  setLeadType,
  setAssignedLead,
  setServicesToForm,
  getLeadsData,
  addSalesPersonToLeads,
  addOrEditComment,
  getAllSalesPersonForms,
  testPostLead,
  getTotalNoOfPerviousDayLeads,
  getDashBoardData,
  graphData,
  getThisMonthGraph,
  getLeadsByTime,
  deleteTableKey,
  addCustomsField,
  addOrEditCallLog,
  addFieldsToServices,
  deleteTableAllKey,
  addMultipleKeyAtTime,
  getLeadsByTimeForSalesPerson,
  getSalesPersonLeads,
  convertUTCDateToLocalDate,
  getCallLogs,
  AddFieldToLeads,
  salesPersonLeadsFilter,
  AssignedLeadToSalesPersonInBulks,
  getThisMonthGraphForSalesPerson,
  getKeys
};
