const Joi = require("joi");
const mongoose = require("mongoose");
//mongoose.set("debug", true);

const uniqueIdSchema = new mongoose.Schema(
  {
    _id: String,
    insertDate: {
      type: Date,
      default: () => {
        return new Date();
      },
    },
  },
  { timestamps: true },
);

const UniqueId = mongoose.model("UniqueId", uniqueIdSchema);

async function generateId(type) {
  let unique = async function () {
    let tempID = new UniqueId({
      _id: (
        Math.random().toString(36).substr(2, 2) +
        Date.now().toString(36).substr(4, 4) +
        Math.random().toString(36).substr(2, 2)
      ).toUpperCase(),
    });
    return type + tempID;
  };

  let loopFlag = true;
  while (loopFlag) {
    var uniqueid = await unique();
    //console.log("UniqueId:", uniqueid._id)
    try {
      await uniqueid.save();
      loopFlag = false;
    } catch (Ex) {
      if (Ex.code === 11000) {
      } else {
        console.log(Ex);
        return res.send({ msg: Ex });
      }
    }
  }
  return uniqueid._id;
}

//generateId();

//setInterval(createCustomer(, 1000000);
//setInterval(generateId, 3000);

module.exports.UniqueId = UniqueId;
module.exports.generateId = generateId;
