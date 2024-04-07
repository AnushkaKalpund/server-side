// Import all dependencies
const dotenv = require('dotenv');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();

// configure ENV file
dotenv.config({path : './config.env'});
require('./db/conn');
const port = process.env.PORT || 3001;

// require model
const Users = require('./models/userSchema');
const Message = require('./models/msgSchema');
const authenticate = require ('./middleware/authenticate')

// getdata from frontend
app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cookieParser());

app.get('/',(req,res) => {
    res.send("Hello World");
})

// registration
app.post('/register', async (req,res) =>{
    try {
        // get body or data
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        const createUser = new Users({
            username : username,
            email : email,
            password : password
        });

        // save method is used to create user or insert user
        const created = await createUser.save()
        console.log(created);
        res.status(200).send("Registered");
    } catch (error) {
        res.status(400).send(error)
    }
})

// login user
app.post('/login', async (req,res) =>{
    try {
        const email = req.body.email;
        const password = req.body.password;

        // find user if exist
        const user = await Users.findOne({email : email});
        if(user){
            // verify password
            const isMatch = await bcrypt.compare(password, user.password);

            if(isMatch){
                // generated token defined in user schema
                const token = await user.generateToken();
                res.cookie("jwt", token, {
                    // expires token in 24hour
                    expires : new Date(Date.now() + 86400000),
                    httpOnly : true
                })
                res.status(200).send("LoggendIn");
            }else{
                res.status(400).send("Invalid Credentials");
            }
        }else{
            res.status(400).send("Invalid Credentials");
        }
    } catch (error) {
        res.status(400).send(error);
    }
})

// message
app.post('/message', async (req,res) =>{
    try {
        // get body or data
        const name = req.body.name;
        const email = req.body.email;
        const message = req.body.message;

        const sendMsg = new Message({
            name : name,
            email : email,
            message : message
        });

        // save method is used to create user or insert user
        const created = await sendMsg.save();
        console.log(created);
        res.status(200).send("Sent");
    } catch (error) {
        res.status(400).send(error)
    }
})

// logout page
app.get('/logout', (req,res) =>{
    res.clearCookie("jwt",{path : '/'})
    res.status(200).send("User logged out")
})

// authentication
app.get('/auth',authenticate, (req, res)=>{

})


// run server
app.listen(port,() =>{
    console.log("Server is Listening")
})

// backend completed
