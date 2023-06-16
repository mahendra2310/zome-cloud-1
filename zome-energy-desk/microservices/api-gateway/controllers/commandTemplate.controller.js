const zomeserver = require('zome-server');
const path = require('path');
var log = require('zome-server').logger.log;
var rest = require('zome-server').rest;
var errLib = require('zome-server').error;
var responseLib = require('zome-server').resp;
var mongoose = require('zome-server').mongoose;

const CommandTemplate = require('mongo-dbmanager').commandTemplateModel;

module.exports = {
    addCommandTemplate: async (req, res, next) => {
        try {
            let { bundleName = "", commandsSequence = [] } = req.body;
            let createdBy = req.user.userId;
            let commandTemplate = new CommandTemplate({
                bundleName: bundleName,
                commandsSequence: commandsSequence,
                createdBy: createdBy
            });
            let savedCommandTemplate = await commandTemplate.save();
            return responseLib.handleSuccess({
                message: "Command Template added successfully",
                commandTemplate: savedCommandTemplate
            }, res);
        } catch (err) {
            log.error(err);
            next(err);
        }
    },

    getCommandTemplate: async (req, res, next) => {
        try {
            let commandTemplate = await CommandTemplate.find();
            return responseLib.handleSuccess({
                message: "Command Template fetched successfully",
                commandTemplate: commandTemplate
            }, res);
        } catch (err) {
            log.error(err);
            next(err);
        }
    },

    updateCommandTemplate: async (req, res, next) => {
        try {
            let { bundleName = "", commandsSequence = [] } = req.body;
            let updatedBy = req.user.userId;
            let commandTemplate = await CommandTemplate.findOneAndUpdate({ bundleName: bundleName }, {
                $set: {
                    commandsSequence: commandsSequence,
                    updatedBy: updatedBy
                }
            }, { new: true });
            return responseLib.handleSuccess({
                message: "Command Template updated successfully",
                commandTemplate: commandTemplate
            }, res);
        } catch (err) {
            log.error(err);
            next(err);
        }
    },

    deleteCommandTemplate: async (req, res, next) => {
        try {
            let { bundleName = "" } = req.body;
            let commandTemplate = await CommandTemplate.findOneAndUpdate({ bundleName: bundleName }, {
                $set: {
                    isDeleted: true
                }
            }, { new: true });
            return responseLib.handleSuccess({
                message: "Command Template deleted successfully",
                commandTemplate: commandTemplate
            }, res);
        } catch (err) {
            log.error(err);
            next(err);
        }
    }
}