const joi = require('joi');

const password = joi.string().trim().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$%^&*-]).{8,}$/).messages({
    'string.pattern.base': 'Password must be a minimum of 8 characters and contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
});

const uuid = joi.string().guid({ version: ['uuidv4'] });

const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
        abortEarly: true,
        stripUnknown: true
    });

    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }

    req.body = value;
    next();
};

exports.registerValidator = validate(joi.object({
    schoolName: joi.string().trim().pattern(/^[a-zA-Z\s]{3,}$/).required().messages({
        'any.required': 'School name is required',
        'string.empty': 'School name cannot be empty',
        'string.pattern.base': 'School name cannot contain digits and must be a minimum of 3 characters'
    }),
    schoolUrl: joi.string().trim().pattern(/^\S+$/).required().messages({
        'any.required': 'School URL is required',
        'string.empty': 'School URL cannot be empty',
        'string.pattern.base': 'School URL must be a single word with no spaces'
    }),
    email: joi.string().trim().email().required().messages({
        'any.required': 'Email is required',
        'string.empty': 'Email cannot be empty',
        'string.email': 'Invalid email format'
    }),
    phoneNumber: joi.string().trim().pattern(/^\+?[0-9]{11,14}$/).required().messages({
        'any.required': 'Phone number is required',
        'string.empty': 'Phone number cannot be empty',
        'string.pattern.base': 'Phone number must be a valid number between 11 and 14 digits'
    }),
    address: joi.string().trim().min(5).required().messages({
        'any.required': 'Address is required',
        'string.empty': 'Address cannot be empty',
        'string.min': 'Address must be at least 5 characters'
    }),
    password: password.required().messages({
        'any.required': 'Password is required',
        'string.empty': 'Password cannot be empty'
    }),
    confirmPassword: joi.string().trim().valid(joi.ref('password')).required().messages({
        'any.required': 'Confirm password is required',
        'string.empty': 'Confirm password cannot be empty',
        'any.only': 'Passwords do not match'
    })
}));

exports.loginValidator = validate(joi.object({
    role: joi.string().valid('admin', 'staff', 'parent').required().messages({
        'any.required': 'Role is required',
        'string.empty': 'Role cannot be empty',
        'any.only': 'Role must be either admin, parent or staff'
    }),
    email: joi.string().email().trim().required().messages({
        'any.required': 'Email is required',
        'string.empty': 'Email cannot be empty',
        'string.email': 'Invalid email format'
    }),
    password: password.required().messages({
        'any.required': 'Password is required',
        'string.empty': 'Password cannot be empty'
    })
}));

exports.emailValidator = validate(joi.object({
    email: joi.string().trim().email().required()
}));

exports.otpValidator = validate(joi.object({
    email: joi.string().trim().email().required(),
    otp: joi.string().trim().pattern(/^\d{6}$/).required()
}));

exports.resetPasswordValidator = validate(joi.object({
    email: joi.string().trim().email().required(),
    newPassword: password.required(),
    confirmPassword: joi.string().trim().valid(joi.ref('newPassword')).required().messages({
        'any.only': 'Passwords do not match'
    })
}));

exports.createStaffSchema = validate(joi.object({
    firstName: joi.string().trim().pattern(/^[a-zA-Z\s]{2,50}$/).required(),
    lastName: joi.string().trim().pattern(/^[a-zA-Z\s]{2,50}$/).required(),
    otherName: joi.string().trim().pattern(/^[a-zA-Z\s]{2,50}$/).optional().allow(''),
    gender: joi.string().valid('male', 'female').required(),
    dateOfBirth: joi.date().iso().max(new Date(new Date().setFullYear(new Date().getFullYear() - 16))).required().messages({
        'date.max': 'You must be at least 16 years old'
    }),
    nationality: joi.string().valid('nigerian', 'non-nigerian').required(),
    address: joi.string().trim().min(3).max(255).required(),
    qualification: joi.string().trim().min(2).max(100).required(),
    maritalStatus: joi.string().valid('single', 'married', 'divorced', 'widowed').required(),
    phoneNumber: joi.string().trim().pattern(/^[0-9]{11,15}$/).required(),
    email: joi.string().trim().lowercase().email().required(),
    staffType: joi.string().valid('class teacher', 'subject teacher').required(),
    classId: joi.when('staffType', {
        is: 'class teacher',
        then: uuid.required(),
        otherwise: uuid.optional()
    })
}));

exports.createStudentSchema = validate(joi.object({
    admissionNumber: joi.string().trim().pattern(/^[a-zA-Z0-9\-\/]+$/).optional().allow(''),
    firstName: joi.string().trim().min(2).max(50).required(),
    lastName: joi.string().trim().min(2).max(50).required(),
    otherName: joi.string().trim().min(2).max(50).required(),
    adminId: uuid.optional(),
    staffId: uuid.optional(),
    gender: joi.string().valid('male', 'female').required(),
    dateOfBirth: joi.date().iso().max(new Date(new Date().setFullYear(new Date().getFullYear() - 8))).required().messages({
        'date.max': 'You must be at least 8 years old'
    }),
    nationality: joi.string().valid('nigerian', 'non-nigerian').required(),
    address: joi.string().trim().min(3).max(255).required(),
    studentClass: joi.string().trim().max(50).required(),
    department: joi.string().trim().max(100).required(),
    session: joi.alternatives().try(joi.number().integer().min(1900).max(3000), joi.string().trim().min(4).max(20)).required(),
    religion: joi.string().trim().min(2).max(50).optional(),
    parentGuardiansName: joi.string().trim().min(2).max(100).required(),
    parentGuardiansAddress: joi.string().trim().min(3).max(255).required(),
    relationship: joi.string().valid('father', 'mother', 'guardian').required(),
    phoneNumber: joi.string().trim().pattern(/^[0-9]{7,15}$/).required(),
    parentGuardiansEmail: joi.string().trim().lowercase().email().required()
}));

exports.createClassValidator = validate(joi.object({
    className: joi.string().trim().min(2).max(80).required(),
    amount: joi.number().positive().required(),
    paymentOption: joi.string().valid('full payment', 'installment').required(),
    teacherId: uuid.required(),
    numberOfInstallments: joi.when('paymentOption', {
        is: 'installment',
        then: joi.number().integer().min(2).required(),
        otherwise: joi.number().integer().min(2).optional().allow(null)
    })
}));

exports.updateClassValidator = validate(joi.object({
    className: joi.string().trim().min(2).max(80).optional(),
    amount: joi.number().positive().optional(),
    paymentOption: joi.string().valid('full', 'installment').optional(),
    teacherId: uuid.optional(),
    numberOfInstallments: joi.number().integer().min(2).optional().allow(null)
}).min(1));

exports.createSubjectValidator = validate(joi.object({
    subjectName: joi.string().trim().min(2).max(80).required(),
    applicableSection: joi.string().trim().min(2).max(80).required(),
    applicableDepartment: joi.string().trim().min(2).max(80).required(),
    subjectTeacher: joi.string().trim().min(2).max(100).required(),
    classId: uuid.optional(),
    staffId: uuid.optional()
}));

exports.createPasswordValidator = validate(joi.object({
    password: password.required(),
    confirmPassword: joi.string().trim().valid(joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match'
    })
}));

exports.changePasswordValidator = validate(joi.object({
    newPassword: password.required(),
    confirmPassword: joi.string().trim().valid(joi.ref('newPassword')).required().messages({
        'any.only': 'Passwords do not match'
    })
}));

exports.parentSettingsValidator = validate(joi.object({
    parentFirstName: joi.string().trim().min(2).max(50).optional(),
    parentLastName: joi.string().trim().min(2).max(50).optional(),
    parentGuardiansName: joi.string().trim().min(2).max(100).optional(),
    phoneNumber: joi.string().trim().pattern(/^\+?[0-9\s]{7,20}$/).optional(),
    parentGuardiansEmail: joi.string().trim().lowercase().email().optional(),
    parentGuardiansAddress: joi.string().trim().min(3).max(255).optional(),
    oldPassword: joi.string().trim().optional(),
    newPassword: password.optional(),
    confirmPassword: joi.when('newPassword', {
        is: joi.exist(),
        then: joi.string().trim().valid(joi.ref('newPassword')).required(),
        otherwise: joi.string().trim().optional()
    })
}).min(1));

exports.markAttendanceValidator = validate(joi.object({
    attendance: joi.array().items(joi.object({
        studentId: uuid.required(),
        status: joi.string().valid('present', 'absent').required()
    })).min(1).required()
}));

exports.createScoreValidator = validate(joi.object({
    subject: joi.string().trim().min(2).max(80).required(),
    score: joi.array().items(joi.object({
        studentId: uuid.required(),
        continuousAssessment: joi.number().min(0).max(100).required(),
        exam: joi.number().min(0).max(100).required()
    })).min(1).required()
}));

exports.profileSettingsValidator = validate(joi.object({
    firstName: joi.string().trim().min(2).max(50).optional(),
    lastName: joi.string().trim().min(2).max(50).optional(),
    address: joi.string().trim().min(3).max(255).optional(),
    oldPassword: joi.string().trim().optional(),
    newPassword: password.optional(),
    confirmPassword: joi.when('newPassword', {
        is: joi.exist(),
        then: joi.string().trim().valid(joi.ref('newPassword')).required(),
        otherwise: joi.string().trim().optional()
    }),
    adminFirstName: joi.string().trim().min(2).max(50).optional(),
    adminLastName: joi.string().trim().min(2).max(50).optional(),
    schoolType: joi.alternatives().try(
        joi.array().items(joi.string().valid('nursery', 'primary', 'secondary')),
        joi.string().trim()
    ).optional(),
    continuousAssessmentConfig: joi.number().integer().min(0).max(100).optional(),
    examConfig: joi.number().integer().min(0).max(100).optional(),
    total: joi.number().integer().min(0).max(100).optional()
}).min(1));

exports.initializePaymentValidator = validate(joi.object({
    classId: uuid.optional(),
    className: joi.string().trim().min(2).max(80).optional(),
    parentName: joi.string().trim().min(2).max(100).optional(),
    parentEmail: joi.string().trim().lowercase().email().optional(),
    currency: joi.string().valid('NGN', 'USD', 'EUR').default('NGN'),
    paymentType: joi.string().valid('card', 'bank transfer', 'mobile payment').default('card')
}));

exports.scanAttendanceValidator = validate(joi.object({
    token: joi.string().trim().required(),
    latitude: joi.number().optional(),
    longitude: joi.number().optional()
}));

exports.qrTokenValidator = validate(joi.object({
    qrToken: joi.string().trim().required()
}));
