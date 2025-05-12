const userSchema = require("../modal/UserSchema");
const jwt = require("jsonwebtoken");
const handleError = require("../util/handleError");
const mail = require("../util/nodeMailer");
const { updateMany } = require("../modal/pageSchema");

const getUser = async (req, res, next) => {
  try {
    const user = await userSchema.find({ isCompany: true });
    res.status(200).json({
      success: true,
      message: "Fetched Successfully",
      data: user,
    });
  } catch (error) {
    next(handleError(500, error));
  }
};

const postUser = async (req, res, next) => {
  try {
    console.log("running");
    await userSchema.create(req.body);
    res.status(200).json({
      success: true,
      message: "User Created Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error,
    });
  }
};
const putUser = async (req, res, next) => {
  try {
    console.log(req.params.id, "running");
    await userSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "User Updated Successful",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};
const deleteUser = async (req, res, next) => {
  console.log("delete");
  try {
    await userSchema.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "User Deleted Successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};
const userDetails = async (req, res, next) => {
  try {
    const user = await userSchema.findById(req.params.id).populate("App");
    res.status(200).json({
      success: true,
      message: "App details fetched Successful",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};
const login = async (req, res, next) => {
  console.log("Ffffff", req.body);

  try {
    const user = await userSchema
      .findOne({ Email: req.body.Email })
      .populate("App");

    if (!user) {
      return res
        .status(500)
        .json({ success: false, message: "User Not Found" });
    }
    if (user.Password !== req.body.Password) {
      return res
        .status(500)
        .json({ success: false, message: "Wrong credentials" });
    }

    console.log("Dyh", user);

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

      console.log("jjj", others);

      return res.status(200).json({
        data: others,
        token,
        success: true,
        message: "Login successful",
      });
    } else {
      next(handleError(401, "Wrong Username or Password"));
      return;
      // res.status(401).json({success:false,message:"Wrong Username or Password"})
    }
  } catch (error) {
    return next(handleError(error));
  }
};
const userprofile = async (req, res, next) => {
  try {
    // console.log(req.user)
    const user = await userSchema.findById(req.user.id).populate("App");
    res
      .status(200)
      .json({ success: true, message: "Data Fetched successful", data: user });
  } catch (error) {
    console.log("r", error);
    return next(handleError(500, error));
  }
};

const SubscribePageWithUser = async (req, res, next) => {
  try {
    const { userId, PageId } = req.body;
    console.log(userId, PageId);
    await userSchema.findByIdAndUpdate(userId, {
      $addToSet: { PageId },
    });
    res.status(200).json({
      success: true,
      message: "Subscribe Successfully",
    });
  } catch (error) {
    return next(handleError(500, error));
  }
};
const UnsubscribePageWithUser = async (req, res, next) => {
  const { userId, PageId } = req.body;
  try {
    await userSchema.findByIdAndUpdate(userId, {
      $pull: {
        PageId,
      },
    });
    res.status(200).json({
      success: true,
      message: "Unsubscribe Successfully",
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const addService = async (req, res, next) => {
  console.log("Dddddddddd");
  const { userId, PageId } = req.params;
  try {
    await userSchema.findByIdAndUpdate(userId, {
      $push: {
        Services: {
          Service: {
            salesPerson: [
              {
                name: "ddddddd",
              },
            ],
            ServiceName: "fffffff",
          },
        },
      },
    });
    res.status(200).json({
      success: true,
      message: "Unsubscribe Successfully",
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const UpdatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    console.log(oldPassword, newPassword, confirmPassword);
    if (!oldPassword || !newPassword || !confirmPassword) {
      return next(handleError(400, "please fill all the field"));
    }

    const user = await userSchema.findById(req.params.id);

    if (!user) {
      return next(handleError(401, "User Doesn't Exist"));
    }

    if (String(oldPassword) !== String(user.Password)) {
      return next(handleError(401, "oldPassword do not match"));
    }

    if (newPassword !== confirmPassword) {
      return next(
        handleError(400, "newPassword or confirmPassword must be same")
      );
    }

    await userSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          Password: newPassword,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "your password has been updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { Email } = req.body;
    console.log(Email);
    const Otp = Math.floor(Math.random() * 1000000);
    const user = await userSchema.findOne({ Email });
    if (user) {
      await userSchema.findOneAndUpdate(
        { Email },
        {
          $set: {
            Otp,
          },
        },
        { new: true }
      );

      const mailinfodata = await mail(
        Email,
        "Your Forgot Password Otp is :- ",
        "PossiLead Forgot Password Otp",
        Otp
      );

      if (mailinfodata.messageId) {
        return res.status(200).json({
          success: true,
          message: `Otp Send to ${Email} `,
        });
      } else {
        return next(handleError(201, "Otp Not sent Please try again"));

        // return   res.status(200).json({
        //   success: false,
        //   message: "Otp Not sent Please try again"
        // })
      }
    } else {
      return next(handleError(401, "Sorry! Email is not Registered"));
      //   return res.status(500).json({
      //     success: false,
      //     message: "Sorry! Email is not Registered"
      //   })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something Went Wrong",
    });
  }
};

const setNewPassword = async (req, res, next) => {
  try {
    const { Email, Otp, Password } = req.body;
    console.log(Otp, Email, Password, "checking");
    if (!Email || !Otp || !Password) {
      return next(handleError(400, "Please fill all the Field"));
    }

    const user = await userSchema.findOne({ Email });

    if (!user) {
      return next(handleError(401, "Email Not Matched"));
    }
    console.log(user.Otp, "user.Otp");

    if (user.Otp == Otp) {
      console.log("jhgfhg");
      await userSchema.findByIdAndUpdate(
        user._id,
        {
          $set: {
            Password,
          },
          $unset: {
            Otp: "",
          },
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Password Updated Successfully",
      });
    } else {
      return next(handleError(401, "Otp Doesn,t match"));
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addUrlData = async (req, res) => {
  console.log("running", req.params.id);
  const { urlData } = req.body;
  try {
    const user = await userSchema.updateOne(
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
const DeleteUrlData = async (req, res) => {
  console.log("running", req.params.id);
  const { urlData } = req.body;
  try {
    const user = await userSchema.updateOne(
      { _id: req.params.id },
      {
        $pull: {
          CustomData: {urlName:urlData.urlName},
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

module.exports = {
  getUser,
  UpdatePassword,
  forgotPassword,
  setNewPassword,
  postUser,
  putUser,
  deleteUser,
  userDetails,
  login,
  userprofile,
  SubscribePageWithUser,
  UnsubscribePageWithUser,
  addService,
  addUrlData,
  DeleteUrlData
};
