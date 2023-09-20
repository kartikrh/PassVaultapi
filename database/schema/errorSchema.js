const mongoose = require("mongoose");
const { Date, Mixed, String } = mongoose.Schema.Types;

const errorSchema = mongoose.Schema(
  {
    error: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    userData: {
      type: Mixed,
      default: {},
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
    },
  }
);

const Error = mongoose.model("Error", errorSchema);
module.exports = Error;
