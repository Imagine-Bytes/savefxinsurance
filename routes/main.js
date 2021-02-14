const express = require("express");
const defaultController = require("../controllers/default");
const cleanWater = require("../utils/saveFx");
const router = express.Router();
const dotenv = require("dotenv");

dotenv.config();

// Invokes the 10 Days Wallet Increment Function
// cleanWater();

// this is the Oauth Link that will be clicked by the user to begin the authentication process
// the link should be used on the frontend on the href attribute of the sign-in with google button
const oauthLink =
  "https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&client_id=268077209573-51p0chpgvsomdupi1ig1s95gac6idm35.apps.googleusercontent.com&prompt=consent&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fhome&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile";

// This is the Google redirect Page
// Normally this should be a page where the user chooses a password for his account @Frontend
router.get("/home", defaultController.googleSignIn);

// Register User
router.post("/register", defaultController.register);

// Login User
router.post("/login", defaultController.login);

// User Account Verification
router.get(
  "/verification/verify-account/:userId/:secretCode",
  defaultController.verifyUser
);

// Verification Redirect Route
router.get("/account/verified", defaultController.redirectPath);

// Password Reset Route #1
// Sends Reset Link to a Registered Email Address
router.post("/forgot", defaultController.forgot);

// Password Reset Route #2
// Verifies Token and Renders Reset Page
router.get("/reset/:token", defaultController.verifyToken);

// Password Reset Route #3
// Verifies Token and Sets New Password for the account
router.post("/reset/:token", defaultController.resetPassword);

// Balance Increment via Direct Deposit
// adequate security measures to verify increment would be implemented in the future
router.post("/deposit-success", defaultController.depositSuccess);

module.exports = router;
