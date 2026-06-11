const jwt = require('jsonwebtoken')

const adminModel = require('../models/admin');
const staffModel = require('../models/staff')

exports.authenticate = async(req,res,next)=>{
   try {
     const token = req.headers.authorization.split(' ')[1]

     await jwt.verify(token, process.env.JWT_SECRET_LOGIN, (error, result)=>{
        if(error){
            return res.status(400).json({
                message: 'login required'
            })
        }
        req.user = result

        next()
        
    })
    
   } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
        return next({
            message: 'session expired, login to continue',
            statusCodel: 400
        })
    }
    next(error)
   }
};


exports.checkAdmin = async(req,res,next)=>{
    try {
    const auth = req.headers.authorization;

           if(!auth){
            return res.status(400).json({
                message: 'auth required'
            })
        };
    const token = auth.split(' ')[1];

    if(!token){
        return res.status(400).json({
            message: 'token required'
        })
    }

     await jwt.verify(token, process.env.JWT_SECRET_LOGIN, async(error, result)=>{
        if(error){
            return next({
                message: error.message,
                statusCode: 400
            })
        }
        const findAdmin = await adminModel.findByPk(result.id)
        if(!findAdmin){
            return next({
                message: 'admin not found',
                statusCode: 404
            })
        }

        const role = findAdmin.role

        if (role !== 'admin'){
            return next({
                message: 'unauthorized access',
                statusCode: 403
            })
        }
        req.user = result

        next()
        
    })
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
        return next({
            message: 'session expired, login to continue',
            statusCodel: 400
        })
    }
     next(error)
    }
};

exports.checkSubjectTeacher = async(req,res,next)=>{
    try {
        const auth = req.headers.authorization;

           if(!auth){
            return res.status(400).json({
                message: 'auth required'
            })
        };

        const token = auth.split(' ')[1];

    if(!token){
        return res.status(400).json({
            message: 'token required'
        })
    }

     await jwt.verify(token, process.env.JWT_SECRET_LOGIN, async(error, result)=>{
        if(error){
            return next({
                message: error.message,
                statusCode: 400
            })
        }
        const findSubjectTeacher = await staffModel.findByPk(result.id)
        if(!findSubjectTeacher){
            return next({
                message: 'subject teacher not found',
                statusCode: 404
            })
        }

        const role = findSubjectTeacher.staffType

        if (role !== 'subject teacher'){
            return next({
                message: 'unauthorized access',
                statusCode: 403
            })
        }
        req.user = result

        next()
        
    })
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
        return next({
            message: 'session expired, login to continue',
            statusCodel: 400
        })
    }
     next(error)
    }
};
exports.checkClassTeacher = async(req,res,next)=>{
    try {
        const auth = req.headers.authorization;

           if(!auth){
            return res.status(400).json({
                message: 'auth required'
            })
        };

        const token = auth.split(' ')[1];

    if(!token){
        return res.status(400).json({
            message: 'token required'
        })
    }

     await jwt.verify(token, process.env.JWT_SECRET_LOGIN, async(error, result)=>{
        if(error){
            return next({
                message: error.message,
                statusCode: 400
            })
        }
        const findClassTeacher = await staffModel.findByPk(result.id)
        if(!findClassTeacher){
            return next({
                message: 'class teacher not found',
                statusCode: 404
            })
        }

        const role = findClassTeacher.staffType

        if (role !== 'class teacher'){
            return next({
                message: 'unauthorized access',
                statusCode: 403
            })
        }
        req.user = result

        next()
        
    })
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
        return next({
            message: 'session expired, login to continue',
            statusCodel: 400
        })
    }
     next(error)
    }
};

exports.checkStaff = async(req,res,next)=>{
    try {
        const auth = req.headers.authorization;
           if(!auth){
            return res.status(400).json({
                message: 'auth required'
            })
        };

        const token = auth.split(' ')[1];

    if(!token){
        return res.status(400).json({
            message: 'token required'
        })
    }

     await jwt.verify(token, process.env.JWT_SECRET_LOGIN, async(error, result)=>{
        if(error){
            return next({
                message: error.message,
                statusCode: 400
            })
        }
        const findStaff = await staffModel.findByPk(result.id)
        if(!findStaff){
            return next({
                message: 'staff not found',
                statusCode: 404
            })
        }

        const role = findStaff.role

        if (role !== 'staff'){
            return next({
                message: 'unauthorized access',
                statusCode: 403
            })
        }
        req.user = result

        next()
        
    })
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
        return next({
            message: 'session expired, login to continue',
            statusCodel: 400
        })
    }
     next(error)
    }
};

exports.checkInvite = async(req,res,next)=>{
    try {
      const {token} = req.params

    if(!token){
        return res.status(400).json({
            message: 'auth required'
        })
    }

     await jwt.verify(token, process.env.JWT_SECRET_INVITE, async(error, result)=>{
        if(error){
            return next({
                message: error.message,
                statusCode: 400
            })
        };
        
        const findStaff = await staffModel.findByPk(result.id)
        if(!findStaff){
            return next({
                message: 'staff does not exist',
                statusCode: 404
            })
        }

        const role = findStaff.role

        if (role !== 'staff'){
            return next({
                message: 'unauthorized access',
                statusCode: 403
            })
        }
        req.user = result

        next()
        
    })
    } catch (error) {
     next(error)
    }
};