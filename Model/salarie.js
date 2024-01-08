const { mixin } = require("lodash");
const { Schema, model } = require("mongoose");

const salirietypeSchema = Schema(
  {
    salary: Schema.Types.Mixed,
    type: Number,
    simbol: String,
    currency: String,
    other_salary: {
      type: [Schema.Types.ObjectId],
      ref: "Salary",
    },
    sortOrder: Number,
  },
  { timestamps: true }
);

function limitArray(limit) {
  return function (value) {
    return value.length <= limit;
  };
}

module.exports.Salirietype = model("Salary", salirietypeSchema);
