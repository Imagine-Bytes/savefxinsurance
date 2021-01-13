const express = require("express");
const bcrypt = require("bcrypt");
const verifyToken = require("./verifyToken");
const generateToken = require("./generateToken");
const id = require("uuid");
const logOut = require("./logOut");
const router = express.Router();

//Register User
router.post("/register", (req, res) => {
  
    const userData = {
        username: req.body.username,
        email: req.body.email,
      password: req.body.password,
      created: today,
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
                res.json({ message: " User Registered" });
              })
              .catch((err) => {
                res.json({ error: "Register Failed" });
                return;
              });
          });
        } else {
          res.json({ error: "User already exists" });
          return;
        }
      })
      .catch((err) => {
        res.send({ error: err });
        return;
      });
  });
  
  //Login User
  router.post("/login", (req, res) => {
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (user) {
          if (bcrypt.compareSync(req.body.password, user.password)) {
            const id = user.id;
            const link = user.tree_link;
            const username = user.username;
            generateToken(res, link, id, username);
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


  
// Log Out User
// router.get("/user/logout", (req, res) => {
//     logOut(res);
//   });
  
 module.exports = router;