const zomeserver = require('zome-server');
var mongoose = require('zome-server').mongoose;

const User = require('mongo-dbmanager').usermodel;
const Feedback = require('mongo-dbmanager').feedbackmodel;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const nodemailer = require("nodemailer");
/**
 * @description : This function will add user in database 
 * it will have different condition based on the role
 * 4 Types of Role this system will have
 * super_admin , property-owner, property-manager, tenant
 * if super_admin : 
 *   required fields : name , email ,role, username , password
 * if property_owner : 
 *   required fields : name , email ,role, username , password , properties (array of ids)
 * if property-manager : 
 *   required fields : name , email ,role, username , password ,properties(array of ids , it will have only one element), buildings (array of ids)
 * if tenant : 
 *   required fields : name , email ,role, deviceid
 * @returns : it will return json object 
 */
let createUser = async (req, res, next)=>{
    try{
        console.log("req.body::",req.body)
        const { name, email,username,role,password,properties,buildings,deviceid } = req.body;
        if(!role || !["super_admin","property-owner","property-manager","tenant"].includes(role)){
            return res.status(200).send({ status: false, message: "Please provide valid role!", data: {}, error: null });
        }
        let reqData = {};
        reqData['role'] = role;
        if(role === "super_admin"){
            // name, email,username,role,password
            if (!name || !email || !username || !password){
                return res.status(200).send({ status: false,message:"Please provide required fields", data:{},error:null });
            }
            reqData['full_name'] = name;
            reqData['email'] = email;
            reqData['username'] = username;
            reqData['password'] = password;

        }else if(role === "property-owner" || role === "PROPERTY-OWNER"){
            if (!name || !email || !username || !password || !properties || !properties.length){
                return res.status(200).send({ status: false,message:"Please provide required fields", data:{},error:null });
            }
            reqData['full_name'] = name;
            reqData['email'] = email;
            reqData['username'] = username;
            reqData['password'] = password;
            reqData['properties'] = properties;
        }else if(role === "property-manager" || role === "PROPERTY-MANAGER"){
            if (!name || !email || !username || !password || !properties || !properties.length || !buildings || !buildings.length){
                return res.status(200).send({ status: false,message:"Please provide required fields", data:{},error:null });
            }
            reqData['full_name'] = name;
            reqData['email'] = email;
            reqData['username'] = username;
            reqData['password'] = password;
            reqData['properties'] = properties;
            reqData['buildings'] = buildings;
        }else if(role === "tenant" || role === "TENANT"){
            // || !username
            if (!name || !email || !deviceid){
                return res.status(200).send({ status: false,message:"Please provide required fields", data:{},error:null });
            }
            reqData['full_name'] = name;
            reqData['email'] = email;
            // reqData['username'] = username;
            reqData['deviceid'] = deviceid;            
        }

        if(reqData['password']){
            const salt = await bcrypt.genSalt(10);
            reqData['password']= await bcrypt.hash(reqData['password'], salt);
        }
        zomeserver.Connection();
        let checkUsername = await User.findOne({ username: username });
        if (checkUsername) {
            mongoose.connection.close();
            return res.status(200).json({ status: false, message: "Username already exists!", data: {}, error: null });
        }
        let checkUserEmail = await User.findOne({ email: email });
        if (checkUserEmail) {
            mongoose.connection.close();
            return res.status(200).json({ status: false, message: "Email already exists!", data: {}, error: null });
        }
        let UserCreated = await User.create(reqData);
        if (UserCreated) {
            mongoose.connection.close();
            return res.status(200).send({ status: true, message: "User created successfully!", data: {}, error: null });
        } else {
            mongoose.connection.close();
            return res.status(200).send({ status: false, message: "User not created!", data: {}, error: null });
        }    
    }catch(error){
        mongoose.connection.close();
        console.log("error::", error)
        return res.status(200).send({ status: false, message: "Something went wrong!", data: {}, error: null });
    }
}

let updateUser = async (req, res, next)=>{
    try {
        const { name, email,username,properties,buildings,deviceid,account_number } = req.body;
        zomeserver.Connection();
        let updateValue = {};
        if(name){
            updateValue['full_name'] = name;
        }
        if(email){
            updateValue['email'] = email;
            let checkUserEmail = await User.findOne({ email: email });
            if (checkUserEmail) {
                if(checkUserEmail._id != req.params.id){
                    mongoose.connection.close();
                    return res.status(200).json({ status: false, message: "Email already exists!", data: {}, error: null });
                }                
            }
        }
        if(username){
            updateValue['username'] = username;
            let checkUsername = await User.findOne({ username: username });
            if (checkUsername) {
                if(checkUsername._id != req.params.id){
                    mongoose.connection.close();
                    return res.status(200).json({ status: false, message: "Username already exists!", data: {}, error: null });
                }
            }
        }
        if(properties){
            updateValue['properties'] = properties;
        }
        if(buildings){
            updateValue['buildings'] = buildings;
        }
        if(deviceid){
            updateValue['deviceid'] = deviceid;
        }
        if(account_number){
            updateValue['account_number'] = account_number;
        }
        
        
        zomeserver.Connection();
        let filter = {_id:req.params.id};
        // need to check for the user update obj value saearch and update
        let userUpdatedObj = await User.findOneAndUpdate(filter, req.body);
        if (userUpdatedObj) {
            mongoose.connection.close();
            return res.status(200).send({ status: true, message: "User Updated successfully!", data: {}, error: null });
        } else {
            mongoose.connection.close();
            return res.status(200).send({ status: false, message: "User not updated!", data: {}, error: null });
        }
    } catch (error) {
        mongoose.connection.close();
        console.log("error::",error)
        return res.status(200).send({ status: false, message: "Something went wrong!", data: {}, error: null });
    }   
}
let listUser = async (req, res, next)=>{
    try{
        let pageNo = 1;
        let limit = 20;
        let skip = 0;
        if(req.query.page){
            pageNo = parseInt(req.query.page);
        }
        if(req.query.limit){
            limit = parseInt(req.query.limit);
        }
        skip = (pageNo-1)*limit;
        zomeserver.Connection();
        let filter = {};
        if(req.query.name){
            filter['full_name'] = { $regex: '.*' + req.query.name + '.*',$options: 'i' };            
        }
        let totalLength = await User.countDocuments(filter);
        let users = [];
        if(totalLength){            
            users = await User.find(filter).select({ "password": 0,"properties": 0,"buildings":0,"date_updated":0}).skip(skip).limit(limit);
        }
        mongoose.connection.close();
        return res.status(200).send({ status: true, message: "User Listing API!", data: users, error: null,totalLength:totalLength });     
    }catch(error){
        mongoose.connection.close();
        console.log("error::", error)
        return res.status(200).send({ status: false, message: "Something went wrong!", data: [], error: null,totalLength:0 });
    }
}

let removeUser = async (req, res, next)=>{
    try{
        zomeserver.Connection();
        let id = req.params.id;
        let userRemove = await User.deleteOne({ _id: id});
        if (userRemove) {
            mongoose.connection.close();
            return res.status(200).send({ status: true, message: "User removed successfully!", data: {}, error: null });
        } else {
            mongoose.connection.close();
            return res.status(200).send({ status: false, message: "User not found!", data: {}, error: null });
        }    
    }catch(error){
        mongoose.connection.close();
        console.log("error::", error)
        return res.status(200).send({ status: false, message: "Something went wrong!", data: {}, error: null });
    }
}

let getUserDetails = async (req, res, next)=>{
    try{
        zomeserver.Connection();
        let id = req.params.id;
        let userDetail = await User.findOne({_id: id }).select({ "password": 0,"date_updated":0}).populate("properties",{"date_updated":0}).populate("buildings",{"date_updated":0});
        // let userDetail = await User.findById(id);
        if (userDetail) {
            mongoose.connection.close();
            return res.status(200).send({ status: true, message: "User find successfully!", data: userDetail, error: null });
        } else {
            mongoose.connection.close();
            return res.status(200).send({ status: false, message: "User not found!", data: {}, error: null });
        }     
    }catch(error){
        mongoose.connection.close();
        console.log("error::", error)
        return res.status(200).send({ status: false, message: "Something went wrong!", data: {}, error: null });
    }
}

let feedbackDetails = async (req, res, next) => {
    try {
        zomeserver.Connection();
        const { phoneNumber, email, deviceType, comment } = req.body;
        let feedback = new Feedback({
            email: email,
            phoneNumber: phoneNumber,
            deviceType: deviceType,
            comment: comment
        });
        const isEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const isNumber = /^[0-9]{10}$/;
        if (!isEmail.test(email)) {
            return res.status(200).json({ msg: "Please enter valid email address" });
        }
        if (!isNumber.test(phoneNumber)) {
            return res.status(200).json({ msg: "Please enter 10 digit phone number" });
        }

        let feedbackSave = await feedback.save();
        if (feedbackSave) {
            mongoose.connection.close();
            return res.status(200).send({ status: true, message: "Feedback saved successfully!", data: {}, error: null });
        } else {
            mongoose.connection.close();
            return res.status(200).send({ status: false, message: "Feedback not saved!", data: {}, error: null });
        }
    } catch (error) {
        cosnole.log("error::", error)
        mongoose.connection.close();
        return res.status(200).send({ status: false, message: "Something went wrong!", data: {}, error: null });
    }
} 
let sendFeedbackEmail = async (req, res, next) => {
    let email = req.body.email;
    let message = req.body.message;
    let phone = req.body.phone;
    let deviceType = req.body.deviceType;
    let subject = "User Feedback from " + deviceType + " device";
    let emailMessage = 'Feedback from ' + email + '\n' + message + '\n' + "Phone Number: " + phone;
    zomeserver.Connection();
    if(!email){
        mongoose.connection.close();
        res.status(401).json({status:401,msg:"Enter Your Email"})
    }
    try {
        
        let smtpconfig =  {
            service: "gmail",
            auth: {
              user: "zomeservice@gmail.com", 
              pass: "ojxtnffvyinkhzws",
            },
            secure: true, // use SSL
          }
        var transporter = nodemailer.createTransport(smtpconfig);
          
                const mailOptions = {
                    from: email,
                    to:"zome-notifications@bhojr.com",
                    bcc:"swayam.barik@qureez.com",
                    subject:"User Feedback", 
                    text:emailMessage,
                    subject:subject
                }
                transporter.sendMail(mailOptions,(error,info)=>{
                    if(error){
                    mongoose.connection.close();
                    res.status(401).json({status:401,message:"email not send"})
                }else{
                    console.log("Email sent",info.response);
                    mongoose.connection.close();
                    res.status(201).json({status:201,message:"Email sent successfully."})
                }
            })
        

    } catch (error) {
        mongoose.connection.close();
        res.status(500).json({status:500,message:"otp expired.."})
    }

};


// send email Link For reset Password
let resetPassword = async (req, res, next) => {
    const {email} = req.body;
    zomeserver.Connection();
    if(!email){
        mongoose.connection.close();
        res.status(401).json({status:401,msg:"Enter Your Email"})
    }

    try {
        const userfind = await User.findOne({email:email});
        let otp = Math.floor(1000 + Math.random() * 9000);         
        const otptoken = jwt.sign({otp:otp}, JWT_SECRET,{expiresIn:"10m"} );        
        const setusertoken = await User.findByIdAndUpdate({_id:userfind._id},{verifytoken : otptoken,otp:otp,new:true});
        let smtpconfig =  {
            service: "gmail",
            auth: {
              user: "zomeservice@gmail.com", 
              pass: "ojxtnffvyinkhzws",
            },
            secure: true, // use SSL
          }
        var transporter = nodemailer.createTransport(smtpconfig);
          if(setusertoken){
                    const mailOptions = {
                    from: "zomeservice@gmail.com",
                    to:email,
                    subject:"Sending email For password reset", 
                    text:`This OTP is Valid For 10 minutes ${otp}`
                }
                transporter.sendMail(mailOptions,(error,info)=>{
                    if(error){
                    mongoose.connection.close();
                    res.status(401).json({status:401,message:"email not send"})
                }else{
                    console.log("Email sent",info.response);
                    mongoose.connection.close();
                    res.status(201).json({status:201,message:"Email sent successfully."})
                }
            })
        }

    } catch (error) {
        mongoose.connection.close();
        res.status(500).json({status:500,message:"otp expired.."})
    }

};


let otpValidate = async (req, res, next) => {
    const {email,otp} = req.params;    
    try {
        zomeserver.Connection();
        const validuser = await User.findOne({email:email,otp: otp});
        const getOtpExpiry = await User.findOne({email:email},{verifytoken :1})
        const  {verifytoken} = getOtpExpiry;
        let verifyToken = jwt.verify(verifytoken,JWT_SECRET);
         if(validuser && verifyToken.otp){
            res.status(201).json({status:201,validuser})
        }else{
            res.status(404).json({status:404,message:"incorrect otp"})
        }
    } catch (error) {
        res.status(401).json({status:401,error})
    }
};


// change password
let updatePassword = async (req, res, next) => {
     const {email} = req.params;
     const {password} = req.body;
    try {
        zomeserver.Connection();
        if(password){
            if (password !== "") {

                console.log(password,"password..");
               // const ismatch = await bcrypt.compare(current_password, user.password);
                const isContainsUppercase = /^(?=.*[A-Z]).*$/;
                const isContainsNumber = /^(?=.*[0-9]).*$/;
                const isContainsSymbol =/^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/;
                const isValidLength = /^.{8,}$/;
                const isNonWhiteSpace = /^\S*$/;
                const isContainsLowercase = /^(?=.*[a-z]).*$/;

               if (!isNonWhiteSpace.test(password)) {
                console.log("Password must not contain Whitespaces. ")
                    return res.status(211).json({status:211, msg: "Password must not contain whitespaces." });
                } 
                else if (!isContainsUppercase.test(password)) {
                    console.log(" i m here 412")
                    return res.status(212).json({ status:212,msg: "Password must have at least one uppercase character." });
                } 
                 else if (!isContainsLowercase.test(password)) {
                    console.log("Password must have at least one Lowercase Character")
                    return res.status(213).json({ status:213,msg: "Password must have at least one lowercase character." });
                } 
                 else if (!isContainsNumber.test(password)) {
                    console.log("assword must contain at least one Digit.")
                    return res.status(214).json({ status:214,msg: "Password must contain at least one digit." });
                } 
                 else if (!isContainsSymbol.test(password)) {
                    console.log("Password must contain at least one Special Symbol.")
                    return res.status(215).json({ status:215,msg: "Password must contain at least one special symbol." });
                } 
                 else if (!isValidLength.test(password)) {
                    console.log("Password must be 3-16 Characters Long")
                    return res.status(216).json({status:216, msg: "Password must be of atleast 8 characters." });
                } 
                            
            }
            const newpassword = await bcrypt.hash(password,12);
            const setnewuserpass = await User.findOneAndUpdate({email:email},{password:newpassword});
            setnewuserpass.save();
            console.log("password updated successfully.")
            res.status(201).json({status:201,setnewuserpass})
            
        }else{
                res.status(401).json({status:401,message:"user does not exist"})
            }
    } catch (error) {
        res.status(401).json({status:401,error})
    }
}


// send email Link For forgot Username
let forgotUsername = async (req, res, next) => {
    console.log(req.body,"email...")

    const {email} = req.body;
    zomeserver.Connection();
    if(!email){
        mongoose.connection.close();
        res.status(401).json({status:401,msg:"Enter Your Email"})
    }

    try {
        const userfind = await User.findOne({email:email});
   
        
        const userName = await User.findOne({_id:userfind._id},{username : 1});
     
       let smtpconfig =  {
            service: "gmail",
            auth: {
              user: "zomeservice@gmail.com", 
              pass: "ojxtnffvyinkhzws",
            },
            secure: true, // use SSL
          }


        var transporter = nodemailer.createTransport(smtpconfig);


          if(userfind){
                    const mailOptions = {
                    from: "zomeservice@gmail.com",
                    to:email,
                    subject:"Sending email For forgot username", 
                    text:`Your username is :  ${userName.username}`
                }

                transporter.sendMail(mailOptions,(error,info)=>{

                    if(error){
                    mongoose.connection.close();
                    res.status(401).json({status:401,message:"email not send"})
                }else{
                    console.log("Email sent",info.response);
                    mongoose.connection.close();
                    res.status(201).json({status:201,message:"Email sent successfully."})
                }
            })

        }

    } catch (error) {
        mongoose.connection.close();
        res.status(401).json({status:401,message:"invalid user"})
    }

};




module.exports = {
    createUser,
    updateUser,
    listUser,
    removeUser,
    getUserDetails,
    feedbackDetails,
    resetPassword,
    updatePassword,
    forgotUsername,
    otpValidate,
    sendFeedbackEmail
}