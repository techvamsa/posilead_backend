const AppSchema = require("../modal/AppSchema");
const axios = require("axios");
const getApp = async (req, res, next) => {
  try {
    const app = await AppSchema.find({});
    res.status(200).json({
      success: true,
      data: app,
      message: "App Fetched Successfully",
    });
  } catch (error) {
    res.status(500).json(error);
  }
};
const getAppByAppId = async (req, res, next) => {
  const { AppID } = req.body;
  try {
    const app = await AppSchema.findOne({
      AppID,
    });
    res.status(200).json({
      success: true,
      data: app,
      message: "App Fetched Successfully",
    });
  } catch (error) {
    res.status(500).json(error);
  }
};
const getAppByPage = async (req, res, next) => {
  const { page_id } = req.body;
  try {
    const app = await AppSchema.findOne({
      Pages: { $elemMatch: { $eq: page_id } },
    });
    res.status(200).json({
      success: true,
      data: app,
      message: "App Fetched Successfully",
    });
  } catch (error) {
    res.status(500).json(error);
  }
};
const postApp = async (req, res, next) => {
  try {
    const { AppID, AppSecret, accessToken } = req.body;
    if (!AppID && !AppSecret && !accessToken) {
      return res.status(500).json({
        success: false,
      });
    }
    const {
      data: { access_token, expires_in },
    } = await axios.get(
      `https://graph.facebook.com/oauth/access_token?client_id=${AppID}&client_secret=${AppSecret}&grant_type=fb_exchange_token&fb_exchange_token=${accessToken}`
    );
    console.log(`Access locale token: ${accessToken}`);

    const {
      data: { name, id },
    } = await axios.get(
      `https://graph.facebook.com/v15.0/me?access_token=${access_token}`
    );
    await AppSchema.create({
      AppID,
      AppSecret,
      AppName:name,
      AccountId:id,
      PermanentAccessToken: access_token,
      expires_in: new Date(Date.now() + expires_in),
    });
    res.status(200).json({
      success: true,
      message: "App Created Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "App not created something went wrong",
    });
  }
};

const putApp = async (req, res, next) => {
  try {
    const app = await AppSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Updated Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: error,
    });
  }
};
const deleteApp = async (req, res, next) => {
  try {
    const app = await AppSchema.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "App Deleted Successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};
const Appdetails = async (req, res, next) => {
  try {
    const app = await AppSchema.findById(req.params.id);
    res.status(200).json({
      success: true,
      data: app,
      message: "App details fetched Successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};
const subscribePageInApp = async (req, res, next) => {
  const { AppID, pageId, access_token } = req.body;
  try {
    const { data } = await axios.post(
      `https://graph.facebook.com/${pageId}/subscribed_apps?subscribed_fields=leadgen&access_token=${access_token}`
    );

    if (data.success) {
      const app = await AppSchema.findOne({
        AppID,
      });
      console.log(app, "app data");
      await AppSchema.findByIdAndUpdate(app._id, {
        $addToSet: {
          Pages: pageId,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Subscribe Successfully",
    });
  } catch (error) {
    res.status(500).json(error);
  }
};
const UnsubscribePageInApp = async (req, res, next) => {
  const { AppID, pageId, access_token } = req.body;
  try {
    const { data } = await axios.delete(
      `https://graph.facebook.com/${pageId}/subscribed_apps?access_token=${access_token}`
    );

    if (data.success) {
      const app = await AppSchema.findOne({
        AppID,
      });

      await AppSchema.findByIdAndUpdate(app._id, {
        $pull: {
          Pages: pageId,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Unsubscribe Successfully",
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const GeneratePermanentToken = async (req, res, next) => {
  const { AppID } = req.body;
  console.log("running temporary token", AppID);

  try {
    const app = await AppSchema.findOne({
      AppID,
    });
    const {
      data: { access_token, expires_in },
    } = await axios.get(
      `https://graph.facebook.com/oauth/access_token?client_id=${app.AppID}&client_secret=${app.AppSecret}&grant_type=fb_exchange_token&fb_exchange_token=${app.PermanentAccessToken}`
    );

    await AppSchema.findOneAndUpdate(
      { AppID },
      {
        $set: { PermanentAccessToken: access_token, expires_in },
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Token update  Successfully",
      access_token,
      expires_in,
      app,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  getApp,
  postApp,
  putApp,
  deleteApp,
  Appdetails,
  getAppByPage,
  subscribePageInApp,
  UnsubscribePageInApp,
  getAppByAppId,
  GeneratePermanentToken,
};
