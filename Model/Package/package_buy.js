const { Schema, model } = require("mongoose");

const packageBuySchema = Schema(
    {
        packageid: {
            type: "ObjectId",
            ref: "Packages"
        },
        recruiterid: {
            type: "ObjectId",
            ref: "Recruiters_profile"
        },
        starddate: {
            type: Date
        },
        enddate: {
            type: Date
        },
        active_type: {
            type: Number,
            default: 1
        },
        
        active: {
            type : Boolean,
            default: true
        },
        transactionID: {},
        expireAt: { type: Date,  expires: 11 , default: Date.now}

    },
    { timestamps: true }
);





var PackageBuy = model("Packages_buy", packageBuySchema);

module.exports = PackageBuy;
