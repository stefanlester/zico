const mongoose = require("mongoose");

const btc = new mongoose.Schema({
  btcaddress: {
    type: String,
    required: true,
  },

  amount: {
    type: String,
    required: true,
  },

});

const Btc = mongoose.model("Btc", btc);

module.exports = Btc;