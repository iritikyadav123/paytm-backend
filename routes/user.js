const express = require("express");
const zod = require("zod");
const {User,Accounts} = require("../mongoose/db");
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config");
const bcrypt = require("bcrypt");
const authMiddleware = require("../middleware");

const router = express.Router();

// this is  a user check middleware that check user input in proper way or not
const userSchema = zod.object({
  username: zod.string().email(),
  password: zod.string().min(4),
  firstName: zod.string(),
  lastName: zod.string(),
});
const userStructureCheckMiddleware = (req, res, next) => {
  const validation = userSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(411).json({
      msg: "your input is instructue way / Incorrect inputs",
    });
  } else {
    next();
  }
};
//this middleware we used for checking repeatation in database of user
const userRepeatCheckMiddleware = async (req, res, next) => {
  const user = await User.findOne({
    username: req.body.username,
  });
  if (user) {
    res.status(411).json({
      message: "Email already taken / Incorrect inputs",
    });
  } else {
    next();
  }
};

router.post(
  "/signUp",
  userStructureCheckMiddleware,
  userRepeatCheckMiddleware,
  async (req, res) => {
    let randomNum = Math.floor(Math.random() * 10000) + 1;
        randomNum < 2000 ? randomNum + 2000 : randomNum;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    try {
      const user = await User.create({
        username: req.body.username,
        password: hashedPassword,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
      });
      const account = await Accounts.create({
        userId  : user._id,
        balance :  randomNum
      })
      const userId = user._id;
      
      if (user) {
        const jwtToken = await jwt.sign({ userId }, JWT_SECRET);
        if (jwtToken) {
          res.json({
            message: "User created successfully",
            token: jwtToken,
          });
        }
      } else {
        res.status(503).json({
          msg: "unable to save your data in database",
        });
      }
    } catch (err) {
      res.status(411).json({
        msg: "some issue in database" + err,
      });
    }
  },
);

router.post("/signIn", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    res.status(411).json({
      msg: "Your username is incorrect ",
    });
  } else {
    const userPass = await bcrypt.compare(password, user.password);
    if (!userPass) {
      resizeTo.status(401).json({
        msg: "Your Password is incorrect",
      });
    } else {
      const userId = user._id;
      const Token = jwt.sign({ userId }, JWT_SECRET);
      res.json({
        msg: "Your signIn has successfully",
        token: Token,
      });
    }
  }
});

const updateBody = zod.object({
  password: zod.string().optional(),
  firstName: zod.string().optional(),
  lastName: zod.string().optional(),
});

router.post("/update", authMiddleware, async (req, res) => {
  const { success } = updateBody.safeParse(req.body);
  if (!success) {
    res.status(411).json({
      message: "Error while updating information",
    });
  }
  if (res.password != null) {
    const hashedPassword = await bcrypt.hash(req.password, 10);
    req.body.password = hashedPassword;
  }
    await User.updateOne({ _id: req.userId }, req.body);

    res.json({
      message: "Updated successfully",
    });
  
});


router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

router.get('/user',authMiddleware, async(req, res) => {
    try {
      const user = await User.findOne({_id : req.userId});
      if(user) {
        res.json({
          username : user.username,
          firstName : user.firstName,
          lastName : user.lastName
        })
      }
    }catch {
      res.status(403).json({
        msg : "invalid User "
      })
    }
  
})
module.exports = router;
