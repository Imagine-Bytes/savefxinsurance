const User = require("../models/user");

const SaveFXIncrement = () => {

    const walletIncrement = () => {
        // Checks to find all Users whose balance is greater than ZERO; subject to change if the client chooses minimal deposit for increment eligiblity
  User.find({ balance: { $gt: 0 } })
  .then((users) => {
    users.forEach((user) => {
      const incrementDays = Date.now() - user.lastIncrementDate;
      if (incrementDays === 10) {
// the user balance is set to double every 10 days (No specific amount of increment was stated so this can be modified to meet the clients' need)
        user.balance = user.balance * 2;
        user.lastIncrementDate = Date.now();
        user.save((err, user) => {
          if (err) return console.log({ err });
          console.log("Wallet Incremented");
        });
      }
    });
  })
  .catch((err) => {
    console.log({ err });
  });
    }

    // This makes this script to run once a day ... Everyday
    setInterval(() => {
        walletIncrement();
      }, 1000 * 60 * 60 * 24);
  

};

module.exports = SaveFXIncrement;
