const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const authMiddleware = require("../middleware");
const {Accounts , User} = require('../mongoose/db')


router.get("/balance", authMiddleware, async (req, res) => {
   const userId = req.userId;
    try {
      const account = await Accounts.findOne({
        userId :  userId 
      });

      res.json({
          balance: account.balance
      })
    }
   catch(err) {
     res.json({
       err : err 
     })
   }
});

router.post("/transfer", authMiddleware, async function(req,res) {
   const session  = await mongoose.startSession();
  

   session.startTransaction();
  const {ammount, to} = req.body;

  // Fetch the accounts within the transaction
  const account =  await Accounts.findOne({userId : req.userId}).session(session);
    console.log(account);

  if(!account || account.balance <  ammount) {
     await session.abortTransaction();
    return res.status(400).json({
        message: "Insufficient balance"
    });
  }

  const toAccount = await Accounts.findOne({ userId: to }).session(session);

  if (!toAccount) {
      await session.abortTransaction();
      return res.status(400).json({
          message: "Invalid account"
      });
  }
    
  await Accounts.updateOne({ userId: req.userId }, { $inc: { balance: -ammount } }).session(session);
  await Accounts.updateOne({ userId: to }, { $inc: { balance: ammount } }).session(session);

  await session.commitTransaction();
  res.status(200).json({
      message: "Transfer successful"
  });
  
})


module.exports = router;