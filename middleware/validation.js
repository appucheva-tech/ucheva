const Joi = require('joi');


exports.createStaffSchema = (req,res,next)=>{
    const schema = Joi.object({
    firstName: Joi.string().trim().min(2).max(50).required(),
    lastName: Joi.string().trim().min(2).max(50).required(),
    otherName: Joi.string().trim().min(2).max(50).required(),
    adminId: Joi.string().guid({ version: ['uuidv4'] }).required(),
    gender: Joi.string().valid('male', 'female').required(),
    dateOfBirth: Joi.date().iso().less('now').required(),
    nationality: Joi.string().valid('nigerian', 'non-nigerian').required(),
    address: Joi.string().trim().min(3).max(255).required(),
    maritalStatus: Joi.string().valid('single', 'married', 'divorced', 'widowed').required(),
    phoneNumber: Joi.string().trim().pattern(/^[0-9]{7,15}$/).required().messages({
        'string.pattern.base': 'phoneNumber must contain 7 to 15 digits'
    }),
    email: Joi.string().trim().lowercase().email().required(),
    staffType: Joi.string().valid('teaching', 'non-teaching').required(),
    role: Joi.string().trim().min(2).max(100).required(),
    teachingType: Joi.when('staffType', {
        is: 'teaching',
        then: Joi.string().valid('class teacher', 'subject teacher').required(),
        otherwise: Joi.string().valid('class teacher', 'subject teacher').optional()
    }),
    classAssigned: Joi.when('teachingType', {
        is: 'class teacher',
        then: Joi.string().trim().max(50).required(),
        otherwise: Joi.string().trim().max(50).optional()
    }),
    subjectAssigned: Joi.when('teachingType', {
        is: 'subject teacher',
        then: Joi.string().trim().max(100).required(),
        otherwise: Joi.string().trim().max(100).optional()
    }),
    classesToTeach: Joi.when('teachingType', {
        is: 'subject teacher',
        then: Joi.string().trim().max(255).required(),
        otherwise: Joi.string().trim().max(255).optional()
    })
});
     const {error} = schema.validate(req.body);

    if (error){
        return res.status(400).json({
            message: error.details[0].message
        })
    }
    next()
};

exports.createStudentSchema = (req,res,next)=>{
    const schema = Joi.object({
    firstName: Joi.string().trim().min(2).max(50).required(),
    lastName: Joi.string().trim().min(2).max(50).required(),
    otherName: Joi.string().trim().min(2).max(50).required(),
    adminId: Joi.string().guid({ version: ['uuidv4'] }).optional(),
    staffId: Joi.string().guid({ version: ['uuidv4'] }).optional(),
    gender: Joi.string().valid('male', 'female').required(),
    dateOfBirth: Joi.date().iso().less('now').required(),
    nationality: Joi.string().valid('nigerian', 'non-nigerian').required(),
    address: Joi.string().trim().min(3).max(255).required(),
    class: Joi.string().trim().max(50).required(),
    department: Joi.string().trim().max(100).required(),
    session: Joi.number().integer().min(1900).max(3000).required(),
    parentGuardiansName: Joi.string().trim().min(2).max(100).required(),
    relationship: Joi.string().valid('father', 'mother', 'guardian').required(),
    phoneNumber: Joi.string().trim().pattern(/^[0-9]{7,15}$/).required().messages({
        'string.pattern.base': 'phoneNumber must contain 7 to 15 digits'
    }),
    email: Joi.string().trim().lowercase().email().required()
});
     const {error} = schema.validate(req.body);

    if (error){
        return res.status(400).json({
            message: error.details[0].message
        })
    }
    next()
};
