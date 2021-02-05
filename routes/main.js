const express = require("express");
const bcrypt = require("bcrypt");
const sendMail = require("../utils/sendMail")
const sendCode = require("../utils/sendCode")
const Code = require("../models/secretCode");
const cryptoRandomString = require("crypto-random-string");
const generateToken = require("../utils/generateToken");
const router = express.Router();
const User = require("../models/user");
const dotenv = require("dotenv");
const Oauth = require('../utils/Oauth');
const userInfo = require('../utils/getUserInfo');
// Allows access to environment variables
dotenv.config();

// this is the Oauth Link that will be clicked by the user to begin the authentication process
// the link should be used on the frontend on the href attribute of the sign-in with github button
const OauthLink ="https://github.com/login/oauth/authorize?allow_signup=true&client_id=2dc59041ad2b9f812288&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fgithublogin&scope=read%3Auser%20user%3Aemail"

// This is the Github redirect Page
// Normally this should be a page where the user chooses a password for his account @Frontend
router.get("/githublogin", (req, res) => {
  // this code would be sent back to githubregister route along with the users'password 
  res.json({
    "Githubcode": req.query.code});
  
});

// this collects the user data from github via the code and creates an account 
// it accepts 2 parameters : the GithubCode and a password 
router.post("/githubregister", (req, res) => {
  const code = req.body.code;
  const password = req.body.password;
  Oauth(code)
    .then((token) => {
      userInfo(token)
        .then((info) => {
          const userData = {
            firstName: info.given_name,
            lastName:info.family_name,
            email: info.email,
            password: password,
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
              res.json({ error: err });
              return;
            });
        })
        .catch((err) => {
          res.json({err});
        });
    })
    .catch((err) => {
      res.json({ err });
    });
})

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
              res.json("User Registered");
              sendMail(req,user)
              return
            })
            .catch((err) => {
              res.json({ err })
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
router.get("/verification/verify-account/:userId/:secretCode", async (req, res) => {
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
  // res.redirect("/home")
})


// Password Reset Route #1
// Sends Reset Link to a Registered Email Address
router.post("/forgot", (req, res) => {
  const email = req.body.email;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
      res.json({message:"This email address is not registered"})
      } else {
        const token = cryptoRandomString({ length: 12 });
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        user.save((err,user) => {
          if (err) return console.log({err});
          console.log("Token updated")
          sendCode(req, user, token)
        })
      }
      return
    })
    .catch((err) => {
    res.json({message:err})
  })
})

// Password Reset Route #2
// Verifies Token and Renders Reset Page
router.get('/reset/:token', (req, res) => {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
    if (!user) {
      res.json({message:"Password reset token is invalid or has expired."})
      return res.redirect('/forgot');
    }
    res.send("<h1> You can reset your password</h1>")
    // res.render('reset', {user: req.user});
  });
});


// Password Reset Route #3
// Verifies Token and Sets New Password for the account
router.post('/reset/:token', (req, res) => {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
    if (!user) {
      res.json({ message: "Password reset token is invalid or has expired." })
      return res.redirect('/forgot');
    }
    bcrypt.hash(req.body.password, 10, (err, hash) => {
      user.password = hash;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      user.save((err) => {
        res.json({ message: "Password has been reset" })
      });
    });



  });

});



module.exports = router;
