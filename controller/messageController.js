const messageModel = require('../models/message');

exports.createMessage = async(req,res,next)=>{
    try {
        const { email, name, subject, message } = req.body;
        const data = await messageModel.create({    
            email,
            name,
            subject,
            message
         })
         res.status(201).json({
            message: 'Message sent successfully',
             data
         })
    } catch (error) {
        next(error)
    }   
};

exports.getAllMessages = async(req,res,next)=>{
    try {
        const messages = await messageModel.findOne();
        res.status(200).json({
            message: 'Messages retrieved successfully',
            data: messages
        })
    } catch (error) {
        next(error)
    }
};

exports.getOneMessage = async(req,res,next)=>{
    try {
        const { id } = req.params;
        const data = await messageModel.findById(id);
        if (!data) {
            return res.status(404).json({
                message: 'Message not found'
            })
        }
        res.status(200).json({
            message: 'Message retrieved successfully',
            data
        })
    } catch (error) {
        next(error)
    }
};

exports.deleteMessage = async(req,res,next)=>{
    try {
        const { id } = req.params;
        const data = await messageModel.findByIdAndDelete(id)
        if (!data) {
            return res.status(404).json({
                message: 'Message not found'
            })  
        };
        res.status(200).json({
            message: 'Message deleted successfully',
            data
        })  
    } catch (error) {
        next(error)
    }
};
