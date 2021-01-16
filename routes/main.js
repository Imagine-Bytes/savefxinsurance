const express = require("express");
const bcrypt = require("bcrypt");
const sendMail = require("../utils/sendMail")
const Code = require("../models/secretCode");
const generateToken = require("../utils/generateToken");
const router = express.Router();
const User = require("../models/user");

// Register User
router.post("/register", (req, res) => {
  const userData = {
    firstName: req.body.firstName,
    lastName:req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  };
  User.findOne({
    email: req.body.email,
  })
    .then((user) => {
      if (!user) {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          userData.password = hash;
          User.create(userData)
            .then((user) => {
              console.log("User Registered");
              sendMail(req,user)
              return
            })
            .catch((err) => {
              console.log({ err })
              return
            });
        });
      } else {
        res.json({ error: "The provided email is registered already" });
        return;
      }
    })
    .catch((err) => {
      res.send({ error: err });
      return;
    });
});

// Login User
router.post("/login", (req, res) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        if (bcrypt.compareSync(req.body.password, user.password)) {
          const username = user.username;
          generateToken(res, username);
          return;
        } else {
          res.json({ error: "Password is incorrect" });
          return;
        }
      }
      res.json({ error: "User doesn't exist" });
    })
    .catch((err) => {
      res.json({ error: err });
    });
});

// User Account Verification
router.get(
  "/verification/verify-account/:userId/:secretCode",
  async (req, res) => {
      try {
          const user = await User.findById(req.params.userId);
          const response = await Code.findOne({
              email: user.email,
              code: req.params.secretCode,
          });

          if (!user) {
              console.log("User not found")
          } else {
              await User.updateOne(
                  { email: user.email },
                  { status: "active" }
              );
              await Code.deleteMany({ email: user.email });

              let redirectPath;

              if (process.env.NODE_ENV == "production") {
                  redirectPath = `${req.protocol}://${req.get(
                      "host"
                  )}account/verified`;
              } else {
                  redirectPath = `http://127.0.0.1:5000/account/verified`;
              }

              res.redirect(redirectPath);
          }
      } catch (err) {
          console.log( "Verification failed...");
      }
  }
);

// Verification Redirect Route
router.get("/account/verified", (req, res) => {
  res.send("<h1> You're Verified</h1>")
 })


// Reset Password route  #1
// To request for Reset Code
 router.post("/resetpassword/getcode", (req, res) => {
   const email = req.body.email;
   User.findOne({ email })
     .then((user) => {
       if (user) {
         sendCode(req)
       } else {
        res.json({message: "The provided email is not registered"})
       }
     
     })
     .catch((err) => {
     res.json({err})
   })

 });

// Reset Password route  #2
// To verify wheter the code given by user to match  the reset code 
 router.post("/resetpassword/verifycode", (req, res) => {
   const email = req.body.email;
   const resetCode = req.body.code;
   Code.findOne({ email })
     .then((code) => {
       if (code) {
         if (code.code === resetCode) {
           let redirectPath;

              if (process.env.NODE_ENV == "production") {
                  redirectPath = `${req.protocol}://${req.get(
                      "host"
                  )}resetpassword/reset`;
              } else {
                  redirectPath = `http://127.0.0.1:5000/resetpassword/reset`;
              }

              res.redirect(redirectPath);
         } else {
           res.json({message:"The code you entered was incorrect"})
         }
       } else {
         res.json({message:"Reset code doesn't exist"})
       }
     
   })

 });

 // Reset Password route  #3
// Actual reset route , here the new password the user inputs is set as his account password
 router.post("/resetpassword/reset", (req, res) => {
  const email = req.body.email;
   
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    const hashedPassword = hash;
    User.updateOne({ email }, { password: hashedPassword })
      .then((user) => {
        res.json({ message: "Password Updated" })
      })
      .catch((err) => {
        res.json({ err })
      });
    Code.deleteOne({ email })
      .then((user) => {
        res.json({ message: "Delete Done." })
      })
      .catch((err) => {
        res.json({ err })
      });
    
  });
  

});


module.exports = router;
