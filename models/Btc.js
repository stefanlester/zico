const mongoose = require("mongoose");

const btcschema = new mongoose.Schema({
  btcaddress: {
    type: String,
    required: true,
  },

  amount: {
    type: String,
    required: true,
  },

});

const Btc = mongoose.model("Btc", btcschema);

module.exports = Btc;