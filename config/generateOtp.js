const otpGenerator = require("otp-generator");

const generateOTP = () => {
  const OTP = otpGenerator.generate(6, {
    upperCaseAlphabets: true,
    specialChars: false,
  });

  console.log("Generating OTP")
  return OTP;
};

module.exports = generateOTP;