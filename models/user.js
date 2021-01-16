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
    
    dateCreated: {
        type: Date,
        default: Date.now(),
        required:false
    }

  
});

module.exports = mongoose.model("User", UserSchema);
