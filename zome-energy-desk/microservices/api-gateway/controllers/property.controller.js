const zomeserver = require('zome-server');
const path = require('path');
var log = require('zome-server').logger.log;
var rest = require('zome-server').rest;
var errLib = require('zome-server').error;
var responseLib = require('zome-server').resp;
var protocol = process.env.PROTOCOL || 'http';
var serviceHost = process.env.SERVICE_HOST || 'localhost';
var msConfig = require('zome-config').microservices;
var mongoose = require('zome-server').mongoose;

const Property = require('mongo-dbmanager').propertymodel;
const regEx = /^[0-9a-zA-Z ]+$/;
let createProperty = async (req, res, next)=>{
    try{
        const { name, meter_id,latitude,longitude,address,city,state,country, pincode } = req.body;
        if (!name || !meter_id || !latitude || !longitude || !address || !city || !state || !country || !pincode){
            return res.status(200).send({ status: false,message:"Please provide required fields", data:{},error:null });
        }
        if(!name.match(regEx)){
            return res.status(200).send({ status: false,message:"Please Enter Number or Alphabets  in name.", data:{},error:null });
        }
        zomeserver.Connection();
        let propertyCreated = await Property.create(req.body);
        if (propertyCreated){
            mongoose.connection.close();
             return res.status(200).send({ status: true, message: "Property created successfully!", data: {}, error: null });
        }else{
            mongoose.connection.close();
            return res.status(200).send({ status: false, message: "Property not created!", data: {}, error: null });
        }        
    }catch(error){
        mongoose.connection.close();
        log.info("error::", error)
        if (error.code === 11000){ 
            return res.status(200).send({ status: false, message: `Please provide unique meter value or name!`, data: {}, error: null });
        }else{
            return res.status(200).send({ status: false, message: "Something went wrong!", data: {}, error: null });
        }
    }
}

let updateProperty = async (req, res, next)=>{
    try {
        zomeserver.Connection();
        let filter = {_id:req.params.id}
        if(req.body.name && !(req.body.name).match(regEx)){
            return res.status(200).send({ status: false,message:"Please Enter Number or Alphabets  in name.", data:{},error:null });
        }
        let propertyDetail = await Property.findById(req.params.id);
        if(!propertyDetail){
            return res.status(200).send({ status: false,message:"Property not found.", data:{},error:null });
        }
        let propertyUpdated = await Property.findOneAndUpdate(filter, req.body);
        if (propertyUpdated) {
            mongoose.connection.close();
            return res.status(200).send({ status: true, message: "Property Updated successfully!", data: {}, error: null });
        } else {
            mongoose.connection.close();
            return res.status(200).send({ status: false, message: "Property not updted!", data: {}, error: null });
        }
    } catch (error) {
        mongoose.connection.close();
        if (error.code === 11000) {
            return res.status(200).send({ status: false, message: `Please provide unique meter value!`, data: {}, error: null });
        } else {
            return res.status(200).send({ status: false, message: "Something went wrong!", data: {}, error: null });
        }
    }    
}
let listProperty = async (req, res, next)=>{
    try{
        zomeserver.Connection();
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
        let filter = {};
        if(req.query.user_id){
            let userDetail = await User.findById(req.query.user_id);
            if(!userDetail){
                mongoose.connection.close();
                return res.status(200).send({ status: false, message: "Property not found!", data: [], error: null,totalLength:0 });
            }
            filter['_id'] = {$in:userDetail.properties}
        }
        let totalLength = await Property.countDocuments(filter);
        let propertyList = [];
        if(totalLength){            
            propertyList = await Property.find(filter).skip(skip);
        }
        const { userRole } = req.user;
        if (userRole === "property-owner" ||userRole === "property-manager"  ) {
            if (userRole) {
                const userPropertyId = await User.find({ _id: req.user.userId }, { properties: 1 });
                let propertyIdArray = userPropertyId.map(a => a.properties);
                let properties = propertyIdArray[0];
                let propertyOwnerList = []
                filter['_id'] = { $in: properties }
                propertyOwnerList = await Property.find(filter);
                mongoose.connection.close();
                return res.status(200).send({ status: true, message: "Property Listed successfully!", data: propertyOwnerList, error: null, totalLength: totalLength });
            } else {
                mongoose.connection.close();
                return res.status(200).send({ status: false, message: "Property not found!", data: [], error: null, totalLength: 0 });
            }
        }
        else if (propertyList.length) {
            mongoose.connection.close();
            return res.status(200).send({ status: true, message: "Property Listed successfully!", data: propertyList, error: null, totalLength: totalLength });
        } else {
            mongoose.connection.close();
            return res.status(200).send({ status: false, message: "Property not found!", data: [], error: null, totalLength: 0 });
        }

    }catch(error){
        mongoose.connection.close();
        return res.status(200).send({ status: false, message: "Something went wrong!", data: [], error: null });
    }
}

let removeProperty = async (req, res, next)=>{
    try {
        zomeserver.Connection();
        let id = req.params.id;
        let propertyDetail = await Property.findById(req.params.id);
        if(!propertyDetail){
            return res.status(200).send({ status: false,message:"Property not found.", data:{},error:null });
        }
        let propertyRemoved = await Property.deleteOne({ _id: id});
        if (propertyRemoved) {
            mongoose.connection.close();
            return res.status(200).send({ status: true, message: "Property removed successfully!", data: {}, error: null });
        } else {
            mongoose.connection.close();
            return res.status(200).send({ status: false, message: "Property not found!", data: {}, error: null });
        }

    } catch (error) {
        mongoose.connection.close();
        return res.status(200).send({ status: false, message: "Something went wrong!", data: {}, error: null });
    }
}

let getPropertyDetails = async (req, res, next)=>{
    try {
        zomeserver.Connection();
        let id = req.params.id;
        let propertyDetail = await Property.findById(id);
        if (propertyDetail) {
            mongoose.connection.close();
            return res.status(200).send({ status: true, message: "Property find successfully!", data: propertyDetail, error: null });
        } else {
            mongoose.connection.close();
            return res.status(200).send({ status: false, message: "Property not found!", data: {}, error: null });
        }

    } catch (error) {
        mongoose.connection.close();
        return res.status(200).send({ status: false, message: "Something went wrong!", data: {}, error: null });
    }
}

let getallPropertyForMap = async (req, res, next)=>{
    try {
        zomeserver.Connection();
        const userId = req.user.userId;
        if(req.user.userRole === "support"){
            let superMapDataArray = [];
            superMapDataArray = await Property.find({},{latitude :1 , longitude : 1 , name : 1 });                
        if (superMapDataArray) {
            mongoose.connection.close();
            return res.status(200).send({ status: true, message: "Property on map displayed successfully!", data: superMapDataArray, error: null });
        } else {
            mongoose.connection.close();
            return res.status(200).send({ status: false, message: "Property not found!", data: {}, error: null });
        }
        }else {
            const userPropertyId = await User.find({ _id: userId }, { properties: 1 });
            let propertyIdArray = userPropertyId.map(a => a.properties)
            let properties = propertyIdArray[0];
            let MapDataArray = [];  
            let propertyfilter = {};
    
            propertyfilter['_id'] = { $in: properties }    
            MapDataArray = await Property.find(propertyfilter, {latitude :1 , longitude : 1 , name : 1 });    
    
            if (MapDataArray) {
                mongoose.connection.close();
                return res.status(200).send({ status: true, message: "Property displayed successfully!", data: MapDataArray, error: null });
            } else {
                mongoose.connection.close();
                return res.status(200).send({ status: false, message: "Property not found!", data: {}, error: null });
            }
        }

    } catch (error) {
        mongoose.connection.close();
        return res.status(200).send({ status: false, message: "Something went wrong!", data: {}, error: null });
    }
}
let getPropertyByUsers = async (req, res, next)=>{
    try {
        zomeserver.Connection();
        // let propertyName = req.body.name;
        let propertyDetail = await Property.find({},{name : 1});
        if (propertyDetail) {
            mongoose.connection.close();
            return res.status(200).send({ status: true, message: "Property find successfully!", data: propertyDetail, error: null });
        } else {
            mongoose.connection.close();
            return res.status(200).send({ status: false, message: "Property not found!", data: {}, error: null });
        }

    } catch (error) {
        mongoose.connection.close();
        return res.status(200).send({ status: false, message: "Something went wrong!", data: {}, error: null });
    }
}

module.exports = {
    createProperty,
    updateProperty,
    listProperty,
    removeProperty,
    getPropertyDetails,
    getallPropertyForMap,
    getPropertyByUsers
}