const emailService = require("../utils/nodemailer");
const cryptoRandomString = require("crypto-random-string");
const Code = require("../models/secretCode");


const sendCode = (req) => {
  // Send Confirmation Email
  const secretCode = cryptoRandomString({
    length: 4,
  });
    const codeData = {
        code: secretCode,
        email:req.body.email
  }


   Code.create(codeData)
    .then(() => {
      console.log("Saved Code");
    })
    .catch(() => {
      console.log("Error Ocurred");
    });

    const data = {
      from: "Iloenyenwa Victor",
      to: req.body.email,
      subject: "Password Reset Code",
      html: ` <h3 style=" color:rgb(92, 61, 180); font-size: 50px; font-weight: lighter; font-family: sans-serif;">
      Welcome to SaveFX </h3>
      <p style="font-size: x-large; font-weight: lighter; font-family: sans-serif;">
         Your Password Reset Code is </p>
      <br>
      <strong style="font-size:x-large; font-weight:bold">${secretCode}</strong>
      <br>
      <code>Note that this code is only valid for 10 minutes</code>
    <p style="font-size: large; font-weight: lighter; font-family: sans-serif;text-align: left;margin-top: 0px;"> SaveFX Team.</p>`,
      };
    
  emailService
    .sendMail(data, (err, res) => {
      if (err) {
        console.log(err)
      } else {
        console.log("Confirmation Email Sent...")
      }
    })
  
};

module.exports = sendCode