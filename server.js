
if(process.env.NODE_ENV !== 'production'){
    require("dotenv").config()
}

const express = require("express")
const app = express()
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const userSchema = require("./models/user")
const passport = require("passport")
const initializeP = require("./passportConfig")
const user = require("./models/user")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")

app.use(methodOverride("_method"))


initializeP(passport, (email)=>{
    user.find(user => user.email === email),
    (id)=> user.find(user => user.id === id)
})


app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())


app.set("view engine","ejs")
app.use(express.static("public"))
app.use(express.urlencoded({extended:true}))

mongoose.connect(process.env.DATABASE_URL)

app.get("/",checkAuthentication,(req,res)=>{
    res.render("index")
})
app.get("/login",checkNotAuthentication,(req,res)=>{
    res.render("login")
})
app.get("/register",checkNotAuthentication,(req,res)=>{
    res.render("register")
})


app.post("/login",handleLogin)

async function handleLogin(req,res){
    try{
        const email= req.body.email
        const pass= req.body.password
        const userRegistered = await userSchema.find({email:`${email}`})
        
        if( userRegistered.length!=0 && (await bcrypt.compare(pass,userRegistered[0].password))){
            res.send("Thanks for Logging in")
        }else{
            res.send("Sorry user not found or pass is incorrect")
        }
    }catch(err){
        console.log(err)
    }
}

app.post("/login",passport.authenticate("local",{
    successRedirect:"/",
    failureRedirect:"/login",
    failureFlash: true
}))


app.post("/register",checkNotAuthentication,async (req,res)=>{
    if(req.body.password==req.body.Cpassword){
        var pass = await bcrypt.hash(req.body.password, 10)
        const Userlogin ={
            id:Date.now().toString(),
            name:req.body.name,
            email:req.body.email,
            password:pass
        }
        const user = await userSchema.create(Userlogin)
        res.send("user created")
    }else{
        res.send("password not match")
    }
})

app.get("*",(req,res)=>{
    res.send("Error: Page Does not exist")
})

function checkAuthentication(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }else{
        res.redirect("/login")
    }
}
function checkNotAuthentication(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect("/")
    }
    next()
}

app.delete("/logout",(req,res)=>{
    req.logout()
    res.redirect("/login")
})

app.listen(process.env.PORT)