const mongoose = require("mongoose");


const url = "mongodb+srv://admin:7g23RyNaECkvuxJ3@cluster0.tlbv1gv.mongodb.net/paytm ";

mongoose.connect(url)
.then(function() {
  console.log("mongoose has been connected")
}).catch((err) => {
  console.log("unbale to conect mongoose" + err)
})

const userSchema = new mongoose.Schema({
  username : {
    type : String,
    required: true,
    unique : true,
    trim: true,
    lowercase : true,
    minLength: 3,
    maxLength: 30
    
  },
  password : {
    type : String,
    required : true,
    minLength : 3,   
  },
  firstName : {
    type: String,
      required: true,
      trim: true,
      maxLength: 50
    
  },
  lastName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50
  }
  
})


const accountSchema = new mongoose.Schema({
  userId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to User model
      ref: 'User',
      required: true
  },
  balance: {
      type: Number,
      required: true
  }
});

const Accounts = mongoose.model('Account', accountSchema);

const User = mongoose.model('Users', userSchema );

module.exports = {User , Accounts}
