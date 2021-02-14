const User = require("../models/user");
const Code = require("../models/secretCode");
const sendMail = require("../utils/sendMail");
const sendCode = require("../utils/sendCode");
const generateToken = require("../utils/generateToken");
const Oauth = require("../utils/Oauth");
const userInfo = require("../utils/getUserInfo");
const bcrypt = require("bcrypt");
const cryptoRandomString = require("crypto-random-string");

const defaultController = {
  googleSignIn: (req, res) => {
    Oauth(req.query.code)
      .then((token) => {
        userInfo(token)
          .then((info) => {
            const userData = {
              firstName: info.given_name,
              lastName: info.family_name,
              email: info.email,
            };
            User.findOne({
              email: req.body.email,
            })
              .then((user) => {
                if (!user) {
                  User.create(userData)
                    .then((user) => {
                      console.log("User Registered");
                      const username = info.family_name;
                      generateToken(res, username);
                      return;
                    })
                    .catch((err) => {
                      console.log({ err });
                      return;
                    });
                } else {
                  const username = info.family_name;
                  generateToken(res, username);
                  return;
                }
              })
              .catch((err) => {
                res.json({ error: err });
                return;
              });
          })
          .catch((err) => {
            res.json({ err });
          });
      })
      .catch((err) => {
        res.json({ err });
      });
  },
  register: (req, res) => {
    const userData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
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
                sendMail(req, user);
                return;
              })
              .catch((err) => {
                res.json({ err });
                return;
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
  },
  login: (req, res) => {
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
  },
  verifyUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      const response = await Code.findOne({
        email: user.email,
        code: req.params.secretCode,
      });

      if (!user) {
        console.log("User not found");
      } else {
        await User.updateOne({ email: user.email }, { status: "active" });
        await Code.deleteMany({ email: user.email });

        let redirectPath;

        if (process.env.NODE_ENV == "production") {
          redirectPath = `${req.protocol}://${req.get("host")}account/verified`;
        } else {
          redirectPath = `http://127.0.0.1:5000/account/verified`;
        }

        res.redirect(redirectPath);
      }
    } catch (err) {
      console.log("Verification failed...");
    }
  },
  redirectPath: (req, res) => {
    res.send("<h1> You're Verified</h1>");
    // res.redirect("/home")
  },
  forgot: (req, res) => {
    const email = req.body.email;

    User.findOne({ email })
      .then((user) => {
        if (!user) {
          res.json({ message: "This email address is not registered" });
        } else {
          const token = cryptoRandomString({ length: 12 });
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
          user.save((err, user) => {
            if (err) return console.log({ err });
            console.log("Token updated");
            sendCode(req, user, token);
          });
        }
        return;
      })
      .catch((err) => {
        res.json({ message: err });
      });
  },
  verifyToken: (req, res) => {
    User.findOne(
      {
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() },
      },
      (err, user) => {
        if (!user) {
          res.json({
            message: "Password reset token is invalid or has expired.",
          });
          return res.redirect("/forgot");
        }
        res.send("<h1> You can reset your password</h1>");
        // res.render('reset', {user: req.user});
      }
    );
  },
  resetPassword: (req, res) => {
    User.findOne(
      {
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() },
      },
      (err, user) => {
        if (!user) {
          res.json({
            message: "Password reset token is invalid or has expired.",
          });
          return res.redirect("/forgot");
        }
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          user.password = hash;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
          user.save((err) => {
            res.json({ message: "Password has been reset" });
          });
        });
      }
    );
  },
  depositSuccess: (req, res) => {
    const email = req.body.email;
    User.find({ email })
      .then((user) => {
        user.balance = user.balance + balanceAdded;
        user.lastDepositDate = Date.now();
        user.lastIncrementDate = Date.now();
        user.save((err, user) => {
          if (err) return console.log({ err });
          console.log("Deposit Successful...");
        });
      })
      .catch((err) => {
        res.json({ err });
      });
  },
};

module.exports = defaultController;
