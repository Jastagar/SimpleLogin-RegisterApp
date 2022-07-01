const bcrypt = require("bcrypt")
const localStrat = require("passport-local").Strategy

function initializeP(passport){
    const authenticateUser = async (email,password,done)=>{
        const user = getUserByEmail(email)
        if(user==null){
            return done(null, false, {message:"User not found"})
        }
        try{
            if(await bcrypt.compare(password,user.password)){
                return done(null, user)
            }else{
                return done(null, false, {message:"Incorrect password try again"})
            }
        }catch(err){
            return done(err)
        }
    }    
    passport.use(new localStrat({usernameField:"email"},authenticateUser))
    passport.serializeUser((user,done)=> done(null,user.id))
    passport.deserializeUser((id,done)=>{  return done(getUserById(id)) })
}

module.exports = initializeP