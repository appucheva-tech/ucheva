const joi = require('joi');

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$%^&*-]).{8,}$/;
const namePattern = /^[a-zA-Z\s]{2,50}$/;

const field = (label) => ({
    required: `${label} is required`,
    empty: `${label} cannot be empty`,
    string: `${label} must be text`,
    number: `${label} must be a number`,
    integer: `${label} must be a whole number`,
    date: `${label} must be a valid date`,
    email: `${label} must be a valid email address`,
    uuid: `${label} must be a valid ID`,
    min: `${label} is too short`,
    max: `${label} is too long`,
    positive: `${label} must be greater than zero`,
    invalid: `${label} is invalid`
});

const messageMap = (label, extra = {}) => {
    const msg = field(label);

    return {
        'any.required': msg.required,
        'any.only': extra.only || msg.invalid,
        'string.base': msg.string,
        'string.empty': msg.empty,
        'string.email': msg.email,
        'string.guid': msg.uuid,
        'string.min': extra.min || msg.min,
        'string.max': extra.max || msg.max,
        'string.pattern.base': extra.pattern || msg.invalid,
        'number.base': msg.number,
        'number.integer': msg.integer,
        'number.min': extra.min || `${label} is below the allowed minimum`,
        'number.max': extra.max || `${label} is above the allowed maximum`,
        'number.positive': msg.positive,
        'date.base': msg.date,
        'date.format': `${label} must be in YYYY-MM-DD format`,
        'date.max': extra.max || `${label} is later than allowed`,
        'array.base': `${label} must be a list`,
        'array.min': extra.min || `${label} must contain at least one item`,
        'object.min': extra.min || `Please provide at least one ${label} field`,
        ...extra
    };
};

const text = (label, min = 2, max = 100) => joi.string().trim().min(min).max(max).messages(messageMap(label, {
    'string.min': `${label} must be at least ${min} characters`,
    'string.max': `${label} must not exceed ${max} characters`
}));

const name = (label) => joi.string().trim().pattern(namePattern).messages(messageMap(label, {
    pattern: `${label} must contain only letters and spaces, and must be between 2 and 50 characters`
}));

const email = (label = 'Email') => joi.string().trim().lowercase().email().messages(messageMap(label));

const phone = (label = 'Phone number', pattern = /^\+?[0-9]{7,15}$/) => joi.string().trim().pattern(pattern).messages(messageMap(label, {
    pattern: `${label} must be a valid phone number`
}));

const uuid = (label = 'ID') => joi.string().guid({ version: ['uuidv4'] }).messages(messageMap(label));

const password = (label = 'Password') => joi.string().trim().pattern(passwordPattern).messages(messageMap(label, {
    pattern: `${label} must be at least 8 characters and include uppercase, lowercase, number, and special character`
}));

const confirmPassword = (ref, label = 'Confirm password') => joi.string().trim().valid(joi.ref(ref)).messages(messageMap(label, {
    only: 'Passwords do not match'
}));

const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        const errors = error.details.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message
        }));

        return res.status(400).json({
            message: errors[0].message,
            errors
        });
    }

    req.body = value;
    next();
};

exports.registerValidator = validate(joi.object({
    schoolName: joi.string().trim().pattern(/^[a-zA-Z\s]{3,}$/).required().messages(messageMap('School name', {
        pattern: 'School name must contain only letters and spaces, and must be at least 3 characters'
    })),
    schoolUrl: joi.string().trim().pattern(/^\S+$/).required().messages(messageMap('School URL', {
        pattern: 'School URL must be one word with no spaces'
    })),
    email: email().required(),
    phoneNumber: phone('Phone number', /^\+?[0-9]{11,14}$/).required().messages(messageMap('Phone number', {
        pattern: 'Phone number must be between 11 and 14 digits'
    })),
    address: text('Address', 5, 255).required(),
    password: password().required(),
    confirmPassword: confirmPassword('password').required()
}));

exports.loginValidator = validate(joi.object({
    role: joi.string().valid('admin', 'staff', 'parent').optional().messages(messageMap('Role', {
        only: 'Role must be admin, staff, or parent'
    })),
    email: email().required(),
    password: password().required()
}));

exports.emailValidator = validate(joi.object({
    email: email().required()
}));

exports.otpValidator = validate(joi.object({
    email: email().required(),
    otp: joi.string().trim().pattern(/^\d{6}$/).required().messages(messageMap('OTP', {
        pattern: 'OTP must be exactly 6 digits'
    }))
}));

exports.resetPasswordValidator = validate(joi.object({
    email: email().required(),
    newPassword: password('New password').required(),
    confirmPassword: confirmPassword('newPassword').required()
}));

exports.createStaffSchema = validate(joi.object({
    firstName: name('First name').required(),
    lastName: name('Last name').required(),
    otherName: name('Other name').optional(),
    gender: joi.string().valid('male', 'female').required().messages(messageMap('Gender', {
        only: 'Gender must be male or female'
    })),
    dateOfBirth: joi.date().iso().max(new Date(new Date().setFullYear(new Date().getFullYear() - 16))).required().messages(messageMap('Date of birth', {
        max: 'Staff must be at least 16 years old'
    })),
    nationality: joi.string().valid('nigerian', 'non-nigerian').required().messages(messageMap('Nationality', {
        only: 'Nationality must be nigerian or non-nigerian'
    })),
    address: text('Address', 3, 255).required(),
    qualification: text('Qualification', 2, 100).required(),
    maritalStatus: joi.string().valid('single', 'married', 'divorced', 'widowed').required().messages(messageMap('Marital status', {
        only: 'Marital status must be single, married, divorced, or widowed'
    })),
    phoneNumber: phone('Phone number', /^[0-9]{11,15}$/).required().messages(messageMap('Phone number', {
        pattern: 'Phone number must contain 11 to 15 digits'
    })),
    email: email().required(),
    staffType: joi.string().valid('class teacher', 'subject teacher').required().messages(messageMap('Staff type', {
        only: 'Staff type must be class teacher or subject teacher'
    })),
    classId: joi.when('staffType', {
        is: 'class teacher',
        then: uuid('Class ID').required(),
        otherwise: uuid('Class ID').optional()
    })
}));

exports.createStudentSchema = validate(joi.object({
    admissionNumber: joi.string().trim().pattern(/^[a-zA-Z0-9-/]+$/).optional().allow('').messages(messageMap('Admission number', {
        pattern: 'Admission number can contain only letters, numbers, hyphens, and slashes'
    })),
    firstName: text('First name', 2, 50).required(),
    lastName: text('Last name', 2, 50).required(),
    otherName: text('Other name', 2, 50).allow('').optional(),
    adminId: uuid('Admin ID').optional(),
    staffId: uuid('Staff ID').optional(),
    gender: joi.string().valid('male', 'female').required().messages(messageMap('Gender', {
        only: 'Gender must be male or female'
    })),
    dateOfBirth: joi.date().iso().max(new Date(new Date().setFullYear(new Date().getFullYear() - 8))).required().messages(messageMap('Date of birth', {
        max: 'Student must be at least 8 years old'
    })),
    nationality: joi.string().valid('nigerian', 'non nigerian').required().messages(messageMap('Nationality', {
        only: 'Nationality must be nigerian or non nigerian'
    })),
    address: text('Address', 3, 255).required(),
    classId: uuid('Class ID').required(),
    department: text('Department', 2, 100).optional(),
    religion: text('Religion', 2, 50).optional(),
    parentGuardiansAddress: text('Parent or guardian address', 3, 255).required(),
    parentGuardiansFirstName: text('Parent or guardian name', 2, 100).required(),
    parentGuardiansLastName: text('Parent or guardian name', 2, 100).required(),
    relationship: joi.string().valid('father', 'mother', 'guardian').required().messages(messageMap('Relationship', {
        only: 'Relationship must be father, mother, or guardian'
    })),
    phoneNumber: phone('Parent or guardian phone number').required(),
    parentGuardiansEmail: email('Parent or guardian email').required()
}));

exports.createClassValidator = validate(joi.object({
    className: text('Class name', 2, 80).required(),
    amount: joi.number().positive().required().messages(messageMap('Amount')),
    paymentOption: joi.string().valid('full payment', 'installment').required().messages(messageMap('Payment option', {
        only: 'Payment option must be full payment or installment'
    })),
    teacherId: uuid('Teacher ID').optional().allow(null),
    numberOfInstallments: joi.when('paymentOption', {
        is: 'installment',
        then: joi.number().integer().min(2).required().messages(messageMap('Number of installments', {
            min: 'Number of installments must be at least 2'
        })),
        otherwise: joi.number().integer().min(2).optional().allow(null).messages(messageMap('Number of installments', {
            min: 'Number of installments must be at least 2'
        }))
    })
}));

exports.updateClassValidator = validate(joi.object({
    className: text('Class name', 2, 80).optional(),
    amount: joi.number().positive().optional().messages(messageMap('Amount')),
    paymentOption: joi.string().valid('full', 'full payment', 'installment').optional().messages(messageMap('Payment option', {
        only: 'Payment option must be full, full payment, or installment'
    })),
    teacherId: uuid('Teacher ID').optional().allow(null),
    numberOfInstallments: joi.number().integer().min(2).optional().allow(null).messages(messageMap('Number of installments', {
        min: 'Number of installments must be at least 2'
    }))
}).min(1).messages(messageMap('class update', {
    min: 'Please provide at least one class field to update'
})));

exports.createSubjectValidator = validate(joi.object({
    subjectName: text('Subject name', 2, 80).required(),
   applicableClasses: joi.array()
    .items(joi.string())
    .min(1)
    .required()
    .messages({
        'array.base': 'Applicable classes must be an array',
        'array.min': 'At least one class must be selected',
        'any.required': 'Applicable classes is required'
    }),
    applicableDepartment: text('Applicable department', 2, 80).required(),
    teacherId: uuid('Teacher ID').required(),
    classId: uuid('Class ID').optional(),
    staffId: uuid('Staff ID').optional()
}));

exports.createPasswordValidator = validate(joi.object({
    password: password().required(),
    confirmPassword: confirmPassword('password').required()
}));

exports.changePasswordValidator = validate(joi.object({
    newPassword: password('New password').required(),
    confirmPassword: confirmPassword('newPassword').required()
}));

exports.parentSettingsValidator = validate(joi.object({
    firstName: text('First name', 2, 50).optional(),
    lastName: text('Last name', 2, 50).optional(),
    phoneNumber: phone('Phone number', /^\+?[0-9\s]{7,20}$/).optional(),
    email: email().optional(),
    parentGuardiansAddress: text('Parent or guardian address', 3, 255).optional(),
    oldPassword: joi.string().trim().messages(messageMap('Old password')).optional(),
    newPassword: password('New password').optional(),
    confirmPassword: joi.when('newPassword', {
        is: joi.exist(),
        then: confirmPassword('newPassword').required(),
        otherwise: joi.string().trim().messages(messageMap('Confirm password')).optional()
    })
}).min(1).messages(messageMap('parent settings', {
    min: 'Please provide at least one parent setting to update'
})));

exports.markAttendanceValidator = validate(joi.object({
    attendance: joi.array().items(joi.object({
        studentId: uuid('Student ID').required(),
        status: joi.string().valid('present', 'absent').required().messages(messageMap('Attendance status', {
            only: 'Attendance status must be present or absent'
        }))
    })).min(1).required().messages(messageMap('Attendance list', {
        min: 'Attendance list must contain at least one student'
    }))
}));

exports.createScoreValidator = validate(joi.object({
    subject: text('Subject', 2, 80).required(),
    score: joi.array().items(joi.object({
        studentId: uuid('Student ID').required(),
        continuousAssessment: joi.number().min(0).max(100).required().messages(messageMap('Continuous assessment', {
            min: 'Continuous assessment cannot be less than 0',
            max: 'Continuous assessment cannot be more than 100'
        })),
        exam: joi.number().min(0).max(100).required().messages(messageMap('Exam score', {
            min: 'Exam score cannot be less than 0',
            max: 'Exam score cannot be more than 100'
        }))
    })).min(1).required().messages(messageMap('Score list', {
        min: 'Score list must contain at least one student'
    }))
}));

exports.profileSettingsValidator = validate(joi.object({
    term: text('Term', 2, 20).optional(),
    session: text('Term', 2, 20).optional(),
    oldPassword: joi.string().trim().messages(messageMap('Old password')).optional(),
    newPassword: password('New password').optional(),
    phoneNumber: phone('Phone number', /^\+?[0-9\s]{7,20}$/).optional(),
    confirmPassword: joi.when('newPassword', {
        is: joi.exist(),
        then: confirmPassword('newPassword').required(),
        otherwise: joi.string().trim().messages(messageMap('Confirm password')).optional()
    }),
    adminFirstName: text('Admin first name', 2, 50).optional(),
    adminLastName: text('Admin last name', 2, 50).optional(),
    continuousAssessmentConfig: joi.number().integer().min(0).max(100).optional().messages(messageMap('Continuous assessment config', {
        min: 'Continuous assessment config cannot be less than 0',
        max: 'Continuous assessment config cannot be more than 100'
    })),
    examConfig: joi.number().integer().min(0).max(100).optional().messages(messageMap('Exam config', {
        min: 'Exam config cannot be less than 0',
        max: 'Exam config cannot be more than 100'
    })),
    total: joi.number().integer().min(0).max(100).optional().messages(messageMap('Total', {
        min: 'Total cannot be less than 0',
        max: 'Total cannot be more than 100'
    }))
}).min(1).messages(messageMap('profile settings', {
    min: 'Please provide at least one profile setting to update'
})));

exports.initializePaymentValidator = validate(joi.object({
    classId: uuid('Class ID').optional(),
    className: text('Class name', 2, 80).optional(),
    parentName: text('Parent name', 2, 100).optional(),
    parentEmail: email('Parent email').optional(),
    paymentPlan: joi.string().valid('full payment', 'installment').optional().messages(messageMap('Payment plan', {
        only: 'Payment plan must be full payment or installment'
    })),
    amount: joi.number().positive().optional().messages(messageMap('Amount')),
    currency: joi.string().valid('NGN', 'USD', 'EUR').default('NGN').messages(messageMap('Currency', {
        only: 'Currency must be NGN, USD, or EUR'
    })),
    paymentType: joi.string().valid('card', 'bank transfer', 'mobile payment').default('card').messages(messageMap('Payment type', {
        only: 'Payment type must be card, bank transfer, or mobile payment'
    }))
}));

exports.scanAttendanceValidator = validate(joi.object({
    token: joi.string().trim().required().messages(messageMap('Attendance token')),
    latitude: joi.number().optional().messages(messageMap('Latitude')),
    longitude: joi.number().optional().messages(messageMap('Longitude'))
}));

exports.qrTokenValidator = validate(joi.object({
    qrToken: joi.string().trim().required().messages(messageMap('QR token'))
}));
