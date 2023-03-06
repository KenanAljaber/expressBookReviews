const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
 const JWT_SECRET='randomSecret';
const app = express();

app.use(express.json());


app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    if(req.session.authorization){
        const token= req.session.authorization['token'];
       jwt.verify(token,JWT_SECRET,(err,user)=>{
                if(!err){
                    req.user=user;
                    next();
                }else{
                    return res.status(401).send({
                        message: 'user could not be authenticated',
                        error:err
                    });
                }
        })
       
    }else{
        return res.status(401).send('Please login!');
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
