require("dotenv").config()

const express = require("express")
const app = express()
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const userSchema = require("./models/user")


app.set("view engine","ejs")
app.use(express.static("public"))
app.use(express.urlencoded({extended:true}))

mongoose.connect(process.env.DATABASE_URL)

app.get("/",(req,res)=>{
    res.render("index")
})
app.get("/login",(req,res)=>{
    res.render("login")
})
app.get("/register",(req,res)=>{
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

app.post("/register",async (req,res)=>{
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

app.listen(3000,()=>{
    console.log("Server is running on port 3000")       
})