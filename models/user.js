const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "pending",
        required:false
    },
    balance: {
        type: Number,
        default: 0,
        required: false,
    },
    currency: {
        type: String,
        default:"NGN",
        required: false,
    },
    dateCreated: {
        type: Date,
        default: Date.now(),
        required:false
    },
    lastDepositDate: Date,
    lastIncrementDate: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date

  
});

module.exports = mongoose.model("User", UserSchema);
