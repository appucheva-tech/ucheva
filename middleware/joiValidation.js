const joi = require('joi')


exports.registerValidator = (req, res, next) => {
    const schema = joi.object({
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
        password: joi.string().trim().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$%^&*-]).{8,}$/).required().messages({
            'any.required': 'Password is required',
            'string.empty': 'Password cannot be empty',
            'string.pattern.base': 'Password must be a minimum of 8 characters and contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
        }),
        confirmPassword: joi.string().trim().valid(joi.ref('password')).required().messages({
            'any.required': 'Confirm password is required',
            'string.empty': 'Confirm password cannot be empty',
            'any.only': 'Passwords do not match'
        })
    })

    const { error } = schema.validate(req.body)
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        })
    }
    next()
}

exports.loginValidator = (req, res, next) => {
    const schema = joi.object({
        role: joi.string().valid('admin','staff','parent').required().messages({
            'any.required': 'Role is required',
            'string.empty': 'Role cannot be empty',
            'string.valid': 'Role must be either admin, parent or staff'
        }),
        email: joi.string().email().trim().required().messages({
            'any.required': 'Email is required',
            'string.empty': 'Email cannot be empty',
            'string.email': 'Invalid email format'
        }),
        password: joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$%^&*-]).{8,}$/).required().messages({
            'any.required': 'Password is required',
            'string.empty': 'Password cannot be empty',
            'string.pattern.base': 'Password must be a minimum of 8 characters and contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
        })
    })

    const { error } = schema.validate(req.body)
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        })
    }
    next()
}


exports.createStaffSchema = (req,res,next)=>{
    const schema = joi.object({
        firstName: joi.string().trim().pattern(/^[a-zA-Z\s]{2,50}$/).required().messages({
            'any.required': 'First name is required',
            'string.empty': 'First name cannot be empty',
            'string.pattern.base': 'First name can only contain letters and spaces and must be between 2 and 50 characters',
        }),
        lastName: joi.string().trim().pattern(/^[a-zA-Z\s]{2,50}$/).required().messages({
            'any.required': 'Last name is required',
            'string.empty': 'Last name cannot be empty',
            'string.pattern.base': 'Last name can only contain letters and spaces and must be between 2 and 50 characters'
        }),
        otherName: joi.string().trim().pattern(/^[a-zA-Z\s]{2,50}$/).optional().allow('').messages({
            'string.empty': 'Other name cannot be empty',
            'string.pattern.base': 'Other name can only contain letters and spaces and must be between 2 and 50 characters'
        }),
        gender: joi.string().valid('male', 'female').required().messages({
            'any.required': 'Gender is required',
            'string.valid': 'Invalid gender value'
        }),
        dateOfBirth: joi.date().iso().less('now').required().messages({
            'any.required': 'Date of birth is required',
            'date.less': 'Date of birth must be in the past'
        }),
        nationality: joi.string().valid('nigerian', 'non-nigerian').required().messages({
            'any.required': 'Nationality is required',
            'string.valid': 'Invalid nationality value'
        }),
        address: joi.string().trim().min(3).max(255).required().messages({
            'any.required': 'Address is required',
            'string.empty': 'Address cannot be empty',
            'string.min': 'Address must be at least 3 characters long',
            'string.max': 'Address must be at most 255 characters long'
        }),
        qualification: joi.string().trim().pattern(/^[a-zA-Z\s]{2,50}$/).required().messages({
            'any.required': 'qualification is required',
            'string.empty': 'qualificationcannot be empty',
            'string.pattern.base': 'qualification can only contain letters and spaces and must be between 2 and 50 characters'
        }),
        department: joi.string().trim().pattern(/^[a-zA-Z\s]{2,50}$/).optional().messages({
            'string.pattern.base': 'department can only contain letters and spaces and must be between 2 and 50 characters'
        }),
        maritalStatus: joi.string().valid('single', 'married', 'divorced', 'widowed').required().messages({
            'any.required': 'Marital status is required',
            'string.valid': 'Invalid marital status value'
        }),
        phoneNumber: joi.string().trim().pattern(/^[0-9]{11,15}$/).required().messages({
            'any.required': 'Phone number is required',
            'string.empty': 'Phone number cannot be empty',
            'string.pattern.base': 'Phone number must contain 11 to 15 digits'
        }),
        email: joi.string().trim().lowercase().email().required().messages({
            'any.required': 'Email is required',
            'string.empty': 'Email cannot be empty',
            'string.email': 'Invalid email format'
        }),
        staffType: joi.string().valid('teaching staff', 'non-teaching staff').required().messages({
            'any.required': 'Staff type is required',
            'string.base': 'Staff type must be a string',
            'any.only': 'Invalid staff type value'
        }),

        staffRole: joi.string().required().when('staffType', {
            is: 'teaching staff',
            then: joi.string().valid('teacher').required().messages({
            'any.required': 'Staff role is required',
            'any.only': 'Staff role must be "teacher" for teaching staff'
        }),
        otherwise: joi.string().valid('bursary', 'security').required().messages({
            'any.required': 'Staff role is required',
            'any.only': 'Staff role must be "bursary" or "security" for non-teaching staff'
        })
        }),
        teacherType: joi.string().when('staffRole', {
             is: 'teacher',
             then: joi.string().valid('class teacher', 'subject teacher').required().messages({
            'any.required': 'Teacher type is required when staff role is teacher',
            'any.only': 'Invalid teacher type value'
        }),
             otherwise: joi.any().strip() // removes the field entirely if not a teacher
        }),
        classAssigned: joi.string().trim().max(50).optional().messages({
            'string.max': 'Class assigned must be at most 50 characters long'
        }),
        subjectAssigned: joi.alternatives().try(
            joi.array().items(joi.string().trim().max(100)),
            joi.string().trim().max(255)
        ).optional().messages({
            'string.max': 'Subject assigned must be at most 255 characters long'
        }),
        classesToTeach:  joi.alternatives().try(
            joi.array().items(joi.string().trim().max(100)),
            joi.string().trim().max(255)
        ).optional().messages({
            'string.max': 'class to teach must be at most 255 characters long'
        }),
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
    const schema = joi.object({
    admissionNumber: joi.string().trim().pattern(/^[a-zA-Z0-9\-\/]+$/).optional().allow('').messages({
        'string.base': 'Admission number must be a string',
        'string.pattern.base': 'Admission number can only contain letters, numbers, hyphens and slashes'
        }),
    firstName: joi.string().trim().min(2).max(50).required().messages({
        'any.required': 'First name is required',
        'string.empty': 'First name cannot be empty',
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name must be at most 50 characters long'
    }),
    lastName: joi.string().trim().min(2).max(50).required().messages({
        'any.required': 'Last name is required',
        'string.empty': 'Last name cannot be empty',
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name must be at most 50 characters long'
    }),
    otherName: joi.string().trim().min(2).max(50).required().messages({
        'any.required': 'Other name is required',
        'string.empty': 'Other name cannot be empty',
        'string.min': 'Other name must be at least 2 characters long',
        'string.max': 'Other name must be at most 50 characters long'
    }),
    adminId: joi.string().guid({ version: ['uuidv4'] }).optional(),
    staffId: joi.string().guid({ version: ['uuidv4'] }).optional(),
    gender: joi.string().valid('male', 'female').required().messages({
        'any.required': 'Gender is required',
        'string.valid': 'Invalid gender value'
    }),
    dateOfBirth: joi.date().iso().less('now').required().messages({
        'any.required': 'Date of birth is required',
        'date.less': 'Date of birth must be in the past'
    }),
    nationality: joi.string().valid('nigerian', 'non-nigerian').required().messages({
        'any.required': 'Nationality is required',
        'string.valid': 'Invalid nationality value'
    }),
    address: joi.string().trim().min(3).max(255).required().messages({
        'any.required': 'Address is required',
        'string.empty': 'Address cannot be empty',
        'string.min': 'Address must be at least 3 characters long',
        'string.max': 'Address must be at most 255 characters long'
    }),
    studentClass: joi.string().trim().max(50).required().messages({
        'any.required': 'Student class is required',
        'string.empty': 'Student class cannot be empty',
        'string.max': 'Student class must be at most 50 characters long'
    }),
    department: joi.string().trim().max(100).optional().messages({
        'any.required': 'Department is required',
        'string.empty': 'Department cannot be empty',
        'string.max': 'Department must be at most 100 characters long'
    }),
    session: joi.number().integer().min(1900).max(3000).required().messages({
        'any.required': 'Session is required',
        'number.min': 'Session must be a valid year',
        'number.max': 'Session must be a valid year'
    }),
    religion: joi.string().trim().min(2).max(50).optional().messages({
        'any.required': 'religion is required',
        'string.empty': 'religion cannot be empty',
        'string.min': 'religion must be at least 2 characters long',
        'string.max': 'religion must be at most 50 characters long'
    }),
    parentGuardiansName: joi.string().trim().min(2).max(100).required().messages({
        'any.required': 'Parent/guardian name is required',
        'string.empty': 'Parent/guardian name cannot be empty',
        'string.min': 'Parent/guardian name must be at least 2 characters long',
        'string.max': 'Parent/guardian name must be at most 100 characters long'
    }),
    parentGuardiansAddress: joi.string().trim().min(3).max(255).required().messages({
        'any.required': 'ParentGuardians Address is required',
        'string.empty': 'ParentGuardians Address cannot be empty',
        'string.min': 'ParentGuardians Address must be at least 3 characters long',
        'string.max': 'ParentGuardians Address must be at most 255 characters long'
    }),
    relationship: joi.string().valid('father', 'mother', 'guardian').required().messages({
        'any.required': 'Relationship is required',
        'string.valid': 'Invalid relationship value'
    }),
    phoneNumber: joi.string().trim().pattern(/^[0-9]{7,15}$/).required().messages({
        'any.required': 'Phone number is required',
        'string.empty': 'Phone number cannot be empty',
        'string.pattern.base': 'Phone number must contain 7 to 15 digits'
    }),
    email: joi.string().trim().lowercase().email().required().messages({
        'any.required': 'Email is required',
        'string.empty': 'Email cannot be empty',
        'string.email': 'Invalid email format'
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
