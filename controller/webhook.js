// app.get("/messaging-webhook", (req, res) => {});
const fs = require("fs");
const axios = require("axios");
// facebook webHook congregation
const getWebhook = async (req, res, next) => {
  // Parse the query params
  console.log(req.params, "params");
  console.log(req.query, "query");
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode is in the query string of the request
  if (mode && token) {
    // Check the mode and token sent is correct
    if (mode === "subscribe" && token === process.env.WebHook_SECRET_KEY) {
      // Respond with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      res.status(403);
    }
  }
};

const postWebhook = async (req, res, next) => {
  // Parse the query params
  // res.status(200).json(req.body);
  console.log("web hook responce fb")
  try {
    // Parse the request body from the POST
    let body = req.body;
    console.log(body, "body")
    // Check the webhook event is from a Page subscription
    if (!req.body.entry) {
      return res.status(500).send({ error: "Invalid POST data received" });
    }
    if (body.object === "page") {
       console.log(req.body.entry, "req.body.entry")
      // Iterate over each entry - there may be multiple if batched
      for (const entry of req.body.entry) {
        for (const change of entry.changes) {
          await processNewLead(
            change?.value?.leadgen_id,
            change?.value?.adgroup_id,
            change?.value?.ad_id,
            change?.value?.page_id,
            change?.value?.form_id
          );
        }

      }
      res.status(200).send("EVENT_RECEIVED");
    }
  } catch (error) {
    fs.writeFile("responseError4.txt", JSON.stringify(data), function (err) {
      if (err) return err;
      console.log("Hello World > helloworld.txt");
    });
    console.log(error, "post event failed");
  }
};

const checkPostWebhook = async (req, res, next) => {
  try {
    const page_id = "102279349307892";
    const form_id = "1495160767680095";
    // leadId, adgroup_id, ad_id, page_id, form_id
    processNewLead(
      471735818369901,
      23852911420740016,
      23852911420740016,
      page_id,
      form_id
    );
  } catch (error) {
    console.log(error, "postNewLeads error");
    //  console.log(error, "checkPostWebhook event failed");
    return res.status(500).json(error);
  }
};

async function processNewLead(leadId, adgroup_id, ad_id, page_id, form_id) {
  let response;
  let application;
  let adGroupId;
  let adId;
  if (!adgroup_id && !ad_id) {
    adGroupId = undefined;
    adId = undefined;
  } else {
    adGroupId = adgroup_id;
    adId = ad_id;
  }
  try {
    const { data } = await axios.post(
      `https://posilead.techvamsa.com/api/app/findAppUsingPageId`,
      {
        page_id: page_id,
      }
    );
    application = data.data;
    console.log(data, "check");
  } catch (error) {
    return false;
  }

  try {
    response = await axios.get(
      `https://graph.facebook.com/v15.0/${leadId}/?access_token=${application.PermanentAccessToken}`
    );
    console.log(response.data, "check response");
  } catch (err) {
    console.log(err, "leads error");
    return false;
  }
  // Ensure valid API response returned
  if (
    !response.data ||
    (response.data && (response.data.error || !response.data.field_data))
  ) {
    return console.warn(
      `An invalid response was received from the Facebook API: ${response}`
    );
  }
  // Lead fields
  let leadForm = {};
  // Extract fields
  for (const field of response.data.field_data) {
    // Get field name & value
    const fieldName = field.name;
    const fieldValue = field.values[0];
    leadForm[fieldName] = fieldValue;
  }

  try {
    const { data } = await axios.post(
      "https://posilead.techvamsa.com/api/page",
      {
        adgroup_id: adGroupId,
        ad_id: adId,
        page_id,
        form_id,
        appId: application.AppID,
        application,
        leads: {
          leadgen_id: leadId,
          Lead_Created_Date: Date.now(),
          ...leadForm,
          LeadType: "NEW LEAD",
          isAssigned: false,
        },
      }
    );

    console.log(data, "data is here");
  } catch (error) {
    console.log(error, "error is here");
    return false;
  }
}
// facebook webHook congregation

// whatsApp webHook congregation

const whatsAppWebHook = (req, res) => {
  try {
    console.log("running get");

    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];
    if (mode && token) {
      // Check the mode and token sent is correct
      if (
        mode === "subscribe" &&
        token === process.env.WebHook_WhatAppToken_SECRET_KEY
      ) {
        // Respond with the challenge token from the request
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
      } else {
        // Respond with '403 Forbidden' if verify tokens do not match
        return res.status(403);
      }
    }
  } catch (error) {
    return res.sendStatus(400);
  }
};

const PostWhatsAppWebHook = async (req, res) => {
  console.log(req.body, "check");
  const body = req.body
  try {
    if (!req.body.entry) {
      console.log("running post", 198);
      return res.status(500).send({ error: "Invalid POST data received" });

    }
    if (body.object === "whatsapp_business_account") {
      console.log("running post", 198);
      // Iterate over each entry - there may be multiple if batched
      for (const entry of req.body.entry) {
        for (const change of entry.changes) {
          if (change.field === "messages") {
            // do message api call
            fs.writeFile(
              "messagesFile.txt",
              JSON.stringify(req.body),
              function (err) {
                if (err) return err;
                console.log("Hello World > helloworld.txt");
              }
            );
          }
          if (change.field === "account_review_update") {
            // do message api call
            fs.writeFile(
              "account_review_update.txt",
              JSON.stringify(req.body),
              function (err) {
                if (err) return err;
                console.log("Hello World > helloworld.txt");
              }
            );
          }
          if (change.field === "account_update") {
            // do message api call
            fs.writeFile(
              "account_update.txt",
              JSON.stringify(req.body),
              function (err) {
                if (err) return err;
                console.log("Hello World > helloworld.txt");
              }
            );
          }
          if (change.field === "business_capability_update") {
            // do message api call
            fs.writeFile(
              "business_capability_update.txt",
              JSON.stringify(req.body),
              function (err) {
                if (err) return err;
                console.log("Hello World > helloworld.txt");
              }
            );
          }
          if (change.field === "message_template_status_update") {
            // do message api call
            fs.writeFile(
              "message_template_status_update.txt",
              JSON.stringify(req.body),
              function (err) {
                if (err) return err;
                console.log("Hello World > helloworld.txt");
              }
            );
          }
          if (change.field === "phone_number_name_update") {
            // do message api call
            fs.writeFile(
              "phone_number_name_update.txt",
              JSON.stringify(req.body),
              function (err) {
                if (err) return err;
                console.log("Hello World > helloworld.txt");
              }
            );
          }
          if (change.field === "phone_number_quality_update") {
            // do message api call
            fs.writeFile(
              "phone_number_quality_update.txt",
              JSON.stringify(req.body),
              function (err) {
                if (err) return err;
                console.log("Hello World > helloworld.txt");
              }
            );
          }
          if (change.field === "security") {
            // do message api call
            fs.writeFile(
              "security.txt",
              JSON.stringify(req.body),
              function (err) {
                if (err) return err;
                console.log("Hello World > helloworld.txt");
              }
            );
          }
        }
      }
      res.status(200).send("EVENT_RECEIVED");
    }

    // console.log("Incoming webhook: " + JSON.stringify(req.body));

  } catch (error) {
    return res.sendStatus(400);
  }
};
// whatsApp webHook congregation
module.exports = {
  getWebhook,
  postWebhook,
  checkPostWebhook,
  whatsAppWebHook,
  PostWhatsAppWebHook,
};
