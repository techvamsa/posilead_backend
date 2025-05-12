const pageSchema = require("../modal/pageSchema");
const messageLogs = require("../modal/WhatAppMessage");
const axios = require("axios");
const fs = require("fs");
const { ObjectId } = require("mongodb");
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
function validatePhoneNumber(_numbers) {
  let num;
  const numLength = _numbers.length;
  switch (numLength) {
    case 13:
      num = _numbers.slice(3, 13);
      break;
    case 12:
      num = _numbers.slice(2, 12);
      break;
    case 10:
      num = _numbers.slice(0, 10);
      break;
    default:
      num = _numbers;
  }
  return num;
}

const postMessageLogs = async (req, res, next) => {
  try {
    const {
      full_name,
      phone_number,
      email,
      User,
      page_id,
      form_id,
      message_logs,
      leadgen_id,
    } = req.body;

    await messageLogs.create({
      full_name,
      phone_number,
      email,
      User,
      page_id,
      form_id,
      message_logs,
      leadgen_id,
    });
    res.status(200).json({
      success: true,
      message: "Message Created Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const findMessageLogs = async (req, res, next) => {
  try {
    console.log(req.query);
    const data = await messageLogs.findOne(req.query ? req.query : {});

    console.log("data", leadsData);
    return res.status(200).json({
      success: true,
      leadsData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

const AllMessageLogs = async (req, res, next) => {
  try {
    // console.log(req.query);
    const { User } = req.body;
    const data = await messageLogs.aggregate([
      {
        $match: {
          User: ObjectId(User),
        },
      },
      {
        $unwind: "$message_logs", // marge multiple docs in one array of objects
      },
    ]);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};
const AllMessageLogsByTime = async (req, res, next) => {
  try {
    const { User, toTime, fromTime } = req.body;
    let from;
    let To;
    if (fromTime && toTime) {
      from = new Date(`${fromTime.split("T")[0]}T00:00:00.000+05:30`).valueOf(); //21
      To = new Date(`${toTime.split("T")[0]}T23:59:59.000+05:30`).valueOf();
    }
    const data = await messageLogs.aggregate([
      {
        $match: {
          User: ObjectId(User),
        },
      },
      {
        $project: {
          full_name: 1, // Field want to display 0 for not selected
          phone_number: 1,
          email: 1,
          message_logs: {
            $filter: {
              input: "$message_logs",
              as: "act",
              cond: {
                $and: [
                  { $gte: ["$$act.created_date", from] },
                  { $lte: [`$$act.created_date`, To] },
                ],
              },
            },
          },
        },
      },
      {
        $unwind: "$message_logs", // marge multiple docs in one array of objects
      },
    ]);

    console.log(data, "chekc");

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};
// message send message Logs
const scheduleWMForConversionLead = async (req, res, next) => {
  let d = new Date();
  let TodayDate = d.setUTCHours(0, 0, 0, 0);
  try {
    const data = await pageSchema.aggregate([
      {
        $match: {
          "leads.LeadType": "CONVERSION LEAD",
        },
      },
      {
        $project: {
          _id: 1, // Field want to display
          appId: 1,
          form_id: 1,
          leads: {
            $filter: {
              input: "$leads",
              as: "act",
              cond: {
                $eq: ["$$act.lead_Action_time", TodayDate],
              },
            },
          },
        },
      },
      {
        $unwind: "$leads", // marge multiple docs in one array of objects
      },
      {
        $lookup: {
          from: "users",
          localField: "appId",
          foreignField: "AppId",
          as: "whatsappSubscription",
        },
      },
      {
        $match: {
          "whatsappSubscription.whatsAppMarketing": true,
          "leads.LeadType": "CONVERSION LEAD",
        },
      },
    ]);

    data.forEach(async (ele) => {
      const TemplateName =
        ele?.whatsappSubscription[0]?.Template?.CONVERSION_LEADS[
          ele?.leads?.day_After_Message
        ];
      const day_After_Message = ele?.leads?.day_After_Message;
      const full_name = ele?.leads?.full_name;
      const phone_number = ele?.leads?.phone_number;
      const leadgen_id = ele?.leads?.leadgen_id;
      const form_id = ele?.form_id;
      const InteraktToken = ele?.whatsappSubscription[0]?.InteraktToken;
      let day;
      let date;
      switch (day_After_Message) {
        case 3:
          day = 7;
          date = new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate() + 7
          ).setUTCHours(0, 0, 0, 0);
          break;
        default:
          day = 0;
          date = new Date(0).setUTCHours(0, 0, 0, 0);
      }

      new Date(d.getFullYear(), d.getMonth(), d.getDate() + day).setUTCHours(
        0,
        0,
        0,
        0
      );
      try {
        await axios.post(
          "https://api.interakt.ai/v1/public/message/",
          {
            countryCode: phone_number.slice(0, 3),
            phoneNumber: phone_number.slice(3, 13), //ele.leads.phone_number
            callbackData: "some text here",
            type: "Template",
            template: {
              name: TemplateName, // user?.Template.welComeMessage
              languageCode: "en",
              bodyValues: [full_name], // ele?.leads?.full_name
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${InteraktToken}`, // user.InteraktToken
            },
          }
        );
        await pageSchema.updateOne(
          { form_id, "leads.leadgen_id": leadgen_id },
          {
            "leads.$.lead_Action_time": date,
            "leads.$.day_After_Message": day,
          }
        );

        try {
          // console.log("leadgen",leadgen);
          const leadsData = await messageLogs.findOne({
            leadgen_id,
          });
          // const leadsData = await messageLogs.findOne(req.query?req.query:{})

          console.log("myData-myData-firstTime");
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
            console.log("check data update 1", data);
          } else {
            console.log("myData-myData-myData");

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
          console.log("check data create 2", data);
        }
        res.status(200).json({
          success: true,
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};
const scheduleWMForHotLead = async (req, res, next) => {
  try {
    let d = new Date();
    let TodayDate = d.setUTCHours(0, 0, 0, 0);
    const data = await pageSchema.aggregate([
      {
        $match: {
          "leads.LeadType": "HOT LEAD",
        },
      },
      {
        $project: {
          _id: 1, // Field want to display
          appId: 1,
          form_id: 1,
          leads: {
            $filter: {
              input: "$leads",
              as: "act",
              cond: {
                $eq: ["$$act.lead_Action_time", 1676160000000],
              },
            },
          },
        },
      },
      {
        $unwind: "$leads", // marge multiple docs in one array of objects
      },
      {
        $lookup: {
          from: "users",
          localField: "appId",
          foreignField: "AppId",
          as: "whatsappSubscription",
        },
      },
      {
        $match: {
          "whatsappSubscription.whatsAppMarketing": true,
          "leads.LeadType": "HOT LEAD",
        },
      },
    ]);

    data.forEach(async (ele) => {
      const TemplateName =
        ele?.whatsappSubscription[0]?.Template?.HOT_LEADS[
          ele?.leads?.day_After_Message
        ];
      const day_After_Message = ele?.leads?.day_After_Message;
      const full_name = ele?.leads?.full_name;
      const phone_number = ele?.leads?.phone_number;
      const leadgen_id = ele?.leads?.leadgen_id;
      const form_id = ele?.form_id;
      const InteraktToken = ele?.whatsappSubscription[0]?.InteraktToken;
      let day;
      let date;
      switch (day_After_Message) {
        case 2:
          day = 6;
          date = new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate() + 6
          ).setUTCHours(0, 0, 0, 0);
          break;
        case 6:
          day = 30;
          date = new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate() + 30
          ).setUTCHours(0, 0, 0, 0);
          break;
        default:
          day = 0;
          date = new Date(0).setUTCHours(0, 0, 0, 0);
      }

      try {
        await axios.post(
          "https://api.interakt.ai/v1/public/message/",

          {
            countryCode: phone_number.slice(0, 3),
            phoneNumber: phone_number.slice(3, 13), //ele.leads.phone_number
            callbackData: "some text here",
            type: "Template",
            template: {
              name: TemplateName, // user?.Template.welComeMessage
              languageCode: "en",
              bodyValues: [full_name], // ele?.leads?.full_name
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${InteraktToken}`, // user.InteraktToken
            },
          }
        );

        await pageSchema.updateOne(
          { form_id, "leads.leadgen_id": leadgen_id },
          {
            "leads.$.lead_Action_time": date,
            "leads.$.day_After_Message": day,
          }
        );
        res.status(200).json({
          success: true,
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
        });
      }
    });
    res.status(200).json(data);
  } catch (error) {
    console.log("error: ", error);
    return res.status(500).json({
      success: false,
    });
  }
};
const scheduleWMForQualified = async (req, res, next) => {
  try {
    let d = new Date();
    let TodayDate = d.setUTCHours(0, 0, 0, 0);
    const data = await pageSchema.aggregate([
      {
        $match: {
          "leads.LeadType": "QUALIFIED",
        },
      },
      {
        $project: {
          _id: 1, // Field want to display
          appId: 1,
          form_id: 1,
          leads: {
            $filter: {
              input: "$leads",
              as: "act",
              cond: {
                $eq: ["$$act.lead_Action_time", 1676160000000],
              },
            },
          },
        },
      },
      {
        $unwind: "$leads", // marge multiple docs in one array of objects
      },
      {
        $lookup: {
          from: "users",
          localField: "appId",
          foreignField: "AppId",
          as: "whatsappSubscription",
        },
      },
      {
        $match: {
          "whatsappSubscription.whatsAppMarketing": true,
          "leads.LeadType": "QUALIFIED",
        },
      },
    ]);

    data.forEach(async (ele) => {
      const TemplateName =
        ele?.whatsappSubscription[0]?.Template?.QUALIFIED[
          ele?.leads?.day_After_Message
        ];
      const day_After_Message = ele?.leads?.day_After_Message;
      const full_name = ele?.leads?.full_name;
      const phone_number = ele?.leads?.phone_number;
      const leadgen_id = ele?.leads?.leadgen_id;
      const form_id = ele?.form_id;
      const InteraktToken = ele?.whatsappSubscription[0]?.InteraktToken;
      let day;
      let date;
      switch (day_After_Message) {
        case 45:
          day = 90;
          date = new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate() + 90
          ).setUTCHours(0, 0, 0, 0);

          break;
        case 90:
          day = 180;
          date = new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate() + 180
          ).setUTCHours(0, 0, 0, 0);
          break;
        default:
          day = 0;
          date = new Date(0).setUTCHours(0, 0, 0, 0);
      }

      try {
        await axios.post(
          "https://api.interakt.ai/v1/public/message/",
          {
            countryCode: phone_number.slice(0, 3),
            phoneNumber: phone_number.slice(3, 13), //ele.leads.phone_number
            callbackData: "some text here",
            type: "Template",
            template: {
              name: TemplateName, // user?.Template.welComeMessage
              languageCode: "en",
              bodyValues: [full_name], // ele?.leads?.full_name
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${InteraktToken}`, // user.InteraktToken
            },
          }
        );

        await pageSchema.updateOne(
          { form_id, "leads.leadgen_id": leadgen_id },
          {
            "leads.$.lead_Action_time": date,
            "leads.$.day_After_Message": day,
          }
        );
        res.status(200).json({
          success: false,
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
        });
      }
    });
    res.status(200).json(data);
  } catch (error) {
    console.log("error: ", error);
    return res.status(500).json({
      success: false,
    });
  }
};
const scheduleWMForNOT_PICKUP = async (req, res, next) => {
  try {
    let d = new Date();
    let TodayDate = d.setUTCHours(0, 0, 0, 0);
    const data = await pageSchema.aggregate([
      {
        $match: {
          "leads.LeadType": "NOT PICKUP",
        },
      },
      {
        $project: {
          _id: 1, // Field want to display
          appId: 1,
          form_id: 1,
          leads: {
            $filter: {
              input: "$leads",
              as: "act",
              cond: {
                $eq: ["$$act.lead_Action_time", 1676160000000],
              },
            },
          },
        },
      },
      {
        $unwind: "$leads", // marge multiple docs in one array of objects
      },
      {
        $lookup: {
          from: "users",
          localField: "appId",
          foreignField: "AppId",
          as: "whatsappSubscription",
        },
      },
      {
        $match: {
          "whatsappSubscription.whatsAppMarketing": true,
          "leads.LeadType": "NOT PICKUP",
        },
      },
    ]);

    data.forEach(async (ele) => {
      const TemplateName =
        ele?.whatsappSubscription[0]?.Template?.NOT_PICKUP[
          ele?.leads?.day_After_Message
        ];
      const day_After_Message = ele?.leads?.day_After_Message;
      const full_name = ele?.leads?.full_name;
      const phone_number = ele?.leads?.phone_number;
      const leadgen_id = ele?.leads?.leadgen_id;
      const form_id = ele?.form_id;
      const InteraktToken = ele?.whatsappSubscription[0]?.InteraktToken;
      let day;
      let date;
      switch (day_After_Message) {
        case 7:
          day = 30;
          date = new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate() + 30
          ).setUTCHours(0, 0, 0, 0);
          break;
        default:
          day = 0;
          date = new Date(0).setUTCHours(0, 0, 0, 0);
      }

      try {
        await axios.post(
          "https://api.interakt.ai/v1/public/message/",
          {
            countryCode: "+91",
            phoneNumber: validatePhoneNumber(phone_number), //ele.leads.phone_number
            callbackData: "some text here",
            type: "Template",
            template: {
              name: TemplateName, // user?.Template.welComeMessage
              languageCode: "en",
              bodyValues: [full_name], // ele?.leads?.full_name
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${InteraktToken}`, // user.InteraktToken
            },
          }
        );

        await pageSchema.updateOne(
          { form_id, "leads.leadgen_id": leadgen_id },
          {
            "leads.$.lead_Action_time": date,
            "leads.$.day_After_Message": day,
          }
        );
        res.status(200).json({
          success: true,
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
        });
      }
    });
    res.status(200).json(data);
  } catch (error) {
    console.log("error: ", error);
    return res.status(500).json({
      success: false,
    });
  }
};
const testCronJob = async (req, res) => {
  console.log("running testCronJob");
  try {
    cron.schedule("*/10 * * * * *", () => {
      const newDate = new Date();
      fs.writeFile("cronTask.txt", `${newDate}`, function (err) {
        if (err) return console.log(err);
      });
      console.log("check running");
    }); // 5 :56 PM
    res.status(200);
  } catch (error) {}
};

const sendBulkMessage = async (req, res, next) => {
  const {
    InteraktToken,
    fromTime,
    toTime,
    SendMessage, // boolean
    page_id,
    TemplateName,
    MySearchObjectData,
    myAggregateSearchData,
  } = req.body;
  let from = convertDateToUtcFrom(fromTime);
  let To = convertDateToUtcTo(toTime);
  const MySearchObject = {
    page_id: page_id,
  };
  MySearchObjectData.forEach((ele) => {
    if (ele[1]) {
      if (ele[0] === "Services") {
        return (MySearchObject[ele[0]] = ObjectId(ele[1]));
      }
      return (MySearchObject[ele[0]] = ele[1]);
    }
  });
  const myAggregateSearch = [
    { $gte: ["$$act.newDate", from] },
    { $lte: [`$$act.newDate`, To] },
  ];
  myAggregateSearchData.forEach((ele) => {
    if (ele[1]) {
      myAggregateSearch.push({ $eq: [`$$act.${ele[0]}`, ele[1]] });
    }
  });
  try {
    const data = await pageSchema.aggregate([
      {
        $match: MySearchObject,
      },
      {
        $project: {
          leads: {
            $filter: {
              input: "$leads",
              as: "act",
              cond: {
                $and: myAggregateSearch,
              },
            },
          },
        },
      },
      {
        $unwind: "$leads", // marge multiple docs in one array of objects
      },
    ]);

    if (SendMessage === true) {
      data.forEach(async (ele) => {
        const full_name = ele?.leads?.full_name;
        const phone_number = ele?.leads?.phone_number;
        try {
          await axios.post(
            "https://api.interakt.ai/v1/public/message/",
            {
              countryCode: "+91",
              phoneNumber: validatePhoneNumber(phone_number), //ele.leads.phone_number
              callbackData: "some text here",
              type: "Template",
              template: {
                name: TemplateName, // user?.Template.welComeMessage
                languageCode: "en",
                bodyValues: [full_name], // ele?.leads?.full_name
              },
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${InteraktToken}`, // user.InteraktToken
              },
            }
          );
        } catch (error) {}
      });
    }

    res.status(200).json({
      success: true,
      message: "message initiate successfully",
      data,
    });
  } catch (error) {
    console.log("error: ", error);
    return res.status(500).json({
      success: false,
    });
  }
};

module.exports = {
  scheduleWMForConversionLead,
  scheduleWMForHotLead,
  scheduleWMForQualified,
  scheduleWMForNOT_PICKUP,
  testCronJob,
  postMessageLogs,
  findMessageLogs,
  AllMessageLogs,
  AllMessageLogsByTime,
  sendBulkMessage,
};
