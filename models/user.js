const { default: mongoose } = require("mongoose");

const user =new mongoose.Schema({
    id:"",
    name: '',
    email: '',
    password: ''
})

module.exports = mongoose.model("user",user);