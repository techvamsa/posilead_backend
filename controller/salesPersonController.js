const salesPerson = require("../modal/salesPerson");
const jwt = require("jsonwebtoken");
const handleError = require("../util/handleError");

const getSalesPerson = async (req, res, next) => {
  try {
    const user = await salesPerson
      .find(req.query ? req.query : {})
      .populate("Service");
    res.status(200).json({
      success: true,
      message: "SalesPerson",
      data: user,
    });
  } catch (error) {
    next(handleError(500, error));
  }
};

const postSalesPerson = async (req, res, next) => {
  try {
    console.log("running");
    await salesPerson.create(req.body);
    res.status(200).json({
      success: true,
      message: "SalesPerson Created Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({});
  }
};
const putSalesPerson = async (req, res, next) => {
  try {
    await salesPerson.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "SalesPerson Updated Successful",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};
const deleteSalesPerson = async (req, res, next) => {
  console.log("delete");
  try {
    await salesPerson.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "SalesPerson Deleted Successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};

const login = async (req, res, next) => {
  try {
    const user = await salesPerson
      .findOne({ Email: req.body.Email })
      .populate("User");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }
    if (user.Password !== req.body.Password) {
      return res
        .status(401)
        .json({ success: false, message: "Wrong credentials" });
    }
    if (!user.Activity) {
      return res
        .status(401)
        .json({
          success: false,
          message: "You are is Deactivate please contact you Team manager",
        });
    }

    if (user) {
      const token = jwt.sign(
        {
          id: user._id,
          isAdmin: user.isAdmin,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "30d" }
      );

      const { Password, ...others } = user._doc;
      return res
        .status(200)
        .json({
          data: others,
          token,
          success: true,
          message: "Login Successfully",
        });
    } else {
      return next(handleError(401, "Wrong Username or Password"));

      // res.status(401).json({success:false,message:"Wrong Username or Password"})
    }
  } catch (error) {
    return next(handleError(error));
  }
};

const salespersonprofile = async (req, res, next) => {
  try {
    const salesperson = await salesPerson
      .findById(req.user.id)
      .populate("User Service");
    res.status(200).json({
      success: true,
      message: "User Fetched Successfully",
      data: salesperson,
    });
  } catch (error) {
    next(error);
  }
};

const DeleteUrlData = async (req, res) => {
  console.log("running", req.params.id);
  const { urlData } = req.body;
  try {
    const user = await salesPerson.updateOne(
      { _id: req.params.id },
      {
        $pull: {
          CustomData: { urlName: urlData.urlName },
        },
      }
    );
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "some error occurred",
    });
  }
};

const addUrlData = async (req, res) => {
  console.log("running 123", req.params.id);
  const { urlData } = req.body;
  try {
    const user = await salesPerson.updateOne(
      { _id: req.params.id },
      {
        $push: {
          CustomData: urlData,
        },
      }
    );
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Otp Not sent Please try again",
    });
  }
};
module.exports = {
  getSalesPerson,
  postSalesPerson,
  putSalesPerson,
  deleteSalesPerson,
  login,
  salespersonprofile,
  DeleteUrlData,
  addUrlData,
};
