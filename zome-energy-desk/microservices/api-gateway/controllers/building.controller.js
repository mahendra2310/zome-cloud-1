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

const Building = require('mongo-dbmanager').buildingmodel;
const Property = require('mongo-dbmanager').propertymodel;
const regEx = /^[0-9a-zA-Z ]+$/;

let createBuilding = async (req, res, next) => {
    try {
        const { name,propertyId,block,address} = req.body;
        if (!name || !propertyId || !block || !address) {
            return res.status(200).send({ status: false, message: "Please provide required fields", data: {}, error: null });
        }
        if(!name.match(regEx)){
            return res.status(200).send({ status: false,message:"Please Enter Number or Alphabets  in name.", data:{},error:null });
        }
        zomeserver.Connection();
        let propertyDetail = await Property.findById(propertyId);
        if(!propertyDetail){
            mongoose.connection.close();
            return res.status(200).send({ status: false, message: "Please select valid Property!", data: {}, error: null });
        }
        let buildingObj = {
            name:name,
            propertyId:propertyId,
            block:block,
            address:address
        }
        let buildingCreated = await Building.create(buildingObj);
        if (buildingCreated) {
            mongoose.connection.close();
            return res.status(200).send({ status: true, message: "Building created successfully!", data: {}, error: null });
        } else {
            mongoose.connection.close();
            return res.status(200).send({ status: false, message: "Building not created!", data: {}, error: null });
        }
    } catch (error) {
        log.info("error::", error)
        mongoose.connection.close();
        return res.status(200).send({ status: false, message: "Something went wrong!", data: {}, error: null });
    }
}

let updateBuilding = async (req, res, next) => {
    try {
        const { propertyId } = req.body;
        if (!propertyId) {
            return res.status(200).send({ status: false, message: "Please provide required fields", data: {}, error: null });
        }
        if(req.body.name && !(req.body.name).match(regEx)){
            return res.status(200).send({ status: false,message:"Please Enter Number or Alphabets in name.", data:{},error:null });
        }
        zomeserver.Connection();
        
        let buildingDetail = await Building.findById(req.params.id);
        if(!buildingDetail){
            return res.status(200).send({ status: false,message:"Building not found.", data:{},error:null });
        }
        let filter = { _id: req.params.id }
        let propertyDetail = await Property.findById(propertyId);
        if (!propertyDetail) {
            mongoose.connection.close();
            return res.status(200).send({ status: false, message: "Please select valid Property!", data: {}, error: null });
        }
        log.info("filter::", filter, req.body);
        let buildingUpdated = await Building.findOneAndUpdate(filter, req.body);
        if (buildingUpdated) {
            mongoose.connection.close();
            return res.status(200).send({ status: true, message: "Building Updated successfully!", data: {}, error: null });
        } else {
            mongoose.connection.close();
            return res.status(200).send({ status: false, message: "Building not updted!", data: {}, error: null });
        }
    } catch (error) {
        mongoose.connection.close();
        return res.status(200).send({ status: false, message: "Something went wrong!", data: {}, error: null });
    }
}
let listBuilding = async (req, res, next) => {
    try {
        zomeserver.Connection();
        let filter = {};
        if(req.query.propertyId){
            filter.propertyId = req.query.propertyId;
        }
        let pageNo = 1;
        let limit = 1000;
        let skip = 0;
        if(req.query.page){
            pageNo = parseInt(req.query.page);
        }
        if(req.query.limit){
            limit = parseInt(req.query.limit);
        }
        skip = (pageNo-1)*limit;
        if(req.query.user_id){
            let userDetail = await User.findById(req.query.user_id);
            if(!userDetail){
                mongoose.connection.close();
                return res.status(200).send({ status: false, message: "Building not found!", data: [], error: null,totalLength:0 });
            }
            filter['_id'] = {$in:userDetail.buildings}
        }
        
        let totalLength = await Building.countDocuments(filter);
        let buildingList = [];
        if(totalLength){            
            buildingList = await Building.find(filter).skip(skip).limit(limit).populate('propertyId', {'name': 1});
        }
        const { userRole } = req.user;
        if (userRole === "property-owner" || userRole ==="property-manager") {
            if (userRole) {
                const userBuildingId = await User.find({ _id: req.user.userId }, { buildings: 1 });
                let buildingIdArray = userBuildingId.map(a => a.buildings);
                let buildings = buildingIdArray[0];
                let buildingOwnerList = []
                filter['_id'] = { $in: buildings }
                buildingOwnerList = await Building.find(filter);
                mongoose.connection.close();
                return res.status(200).send({ status: true, message: "Building Listed successfully!", data: buildingOwnerList, error: null, totalLength: totalLength });
            } else {
                mongoose.connection.close();
                return res.status(200).send({ status: false, message: "Building not found!", data: [], error: null, totalLength: 0 });
            }
        }
        if (buildingList.length) {
            mongoose.connection.close();
            return res.status(200).send({ status: true, message: "Building Listed successfully!", data: buildingList, error: null,totalLength:totalLength });
        } else {
            mongoose.connection.close();
            return res.status(200).send({ status: false, message: "Building not found!", data: [], error: null,totalLength:0 });
        }
    } catch (error) {
          mongoose.connection.close();
        return res.status(200).send({ status: false, message: "Something went wrong!", data: {}, error: null,totalLength:0 });
    }
}

let removeBuilding = async (req, res, next) => {
    try {
        zomeserver.Connection();
        let id = req.params.id;
        let buildingDetail = await Building.findById(req.params.id);
        if(!buildingDetail){
            return res.status(200).send({ status: false,message:"Building not found.", data:{},error:null });
        }
        let buildingRemoved = await Building.deleteOne({ _id: id });
        if (buildingRemoved) {
            mongoose.connection.close();
            return res.status(200).send({ status: true, message: "Building removed successfully!", data: {}, error: null });
        } else {
            mongoose.connection.close();
            return res.status(200).send({ status: false, message: "Building not found!", data: {}, error: null });
        }
    } catch (error) {
        mongoose.connection.close();
        return res.status(200).send({ status: false, message: "Something went wrong!", data: {}, error: null });
    }
}

let getBuildingDetails = async (req, res, next) => {
    try {
        zomeserver.Connection();
        let id = req.params.id;
        let buildingDetail = await Building.findById(id);
        if (buildingDetail) {
            mongoose.connection.close();
            return res.status(200).send({ status: true, message: "Building find successfully!", data: buildingDetail, error: null });
        } else {
            mongoose.connection.close();
            return res.status(200).send({ status: false, message: "Building not found!", data: {}, error: null });
        }
    } catch (error) {
        mongoose.connection.close();
        return res.status(200).send({ status: false, message: "Something went wrong!", data: {}, error: null });
    }
}

module.exports = {
    createBuilding,
    updateBuilding,
    listBuilding,
    removeBuilding,
    getBuildingDetails
}