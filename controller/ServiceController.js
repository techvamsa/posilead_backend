const ServicesSchema = require("../modal/ServicesSchema");
const jwt = require("jsonwebtoken");
const handleError = require("../util/handleError")


const getServices = async (req, res, next) => {
    try {
        const Services = await ServicesSchema.find(req.query?req.query:{})
        res.status(200).json({
            success: true,
            message: "Services",
            data: Services
        })
    } catch (error) {
        next(handleError(500,error))
    }
}

const postServices = async (req, res, next) => {
    try {
        console.log("running");
        await ServicesSchema.create(req.body);
        res.status(200).json({
            success: true,
            message: "Services Created Successfully",
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
        })
    }
}
const putServices = async (req, res, next) => {
    try {
        console.log(req.params.id,"running")
      await ServicesSchema.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true })

        res.status(200).json({
            success: true,
            message: "Services Updated Successful"
        })
    } catch (error) {
      return  res.status(500).json(error)

    }
}
const deleteServices = async (req, res, next) => {
    console.log('delete')
    try {
      await ServicesSchema.findByIdAndDelete(req.params.id)
        res.status(200).json({ success: true, message: "Services Deleted Successfully" })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        })

    }
}




module.exports = {getServices,postServices ,putServices ,deleteServices}