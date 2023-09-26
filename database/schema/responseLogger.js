const mongoose = require("mongoose");
const { String, Number } = mongoose.Schema.Types;

const responseLogScema = mongoose.Schema(
  {
    domain: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    responseTime: {
      type: Number,
      required: true,
    },
    userId: {
      type: Number,
      required: false,
    },
    userIp: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ResponseLog = mongoose.model("responseLog", responseLogScema);
module.exports = ResponseLog;
