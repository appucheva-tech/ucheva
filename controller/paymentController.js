const axios = require('axios');
const paymentModel = require('../models/payment');
const studentModel = require('../models/student');
const adminModel = require('../models/admin');
const classModel = require('../models/schoolclass');
const walletModel = require('../models/wallet');

const KORA_BASE_URL = 'https://api.korapay.com/merchant/api/v1';


exports.initializePayment = async (req, res, next) => {
  try {
    const { id } = req.user; 
    const { studentId } = req.params;
    const {
      classId,
      className,
      parentName,
      parentEmail,
      currency = 'NGN',
      paymentType 
    } = req.body;

    const admin = await adminModel.findByPk(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const student = await studentModel.findOne({ where: { id: studentId, adminId: id } });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const classWhere = { adminId: id };
    if (classId) {
      classWhere.id = classId;
    } else if (className) {
      classWhere.className = className;
    } else {
      classWhere.id = student.classId;
    }

    const schoolClass = await classModel.findOne({ where: classWhere });

    if (!schoolClass) {
      return res.status(404).json({ message: 'Student class not found' });
    }

    if (student.classId && schoolClass.id !== student.classId) {
      return res.status(400).json({ message: 'Selected class does not match student class' });
    }

    const payableAmount = Number(schoolClass.amount);
    if (!payableAmount || payableAmount <= 0) {
      return res.status(400).json({ message: 'Invalid class payment amount' });
    }

    const serviceCharge = 600;
    const amountInNaira = payableAmount + serviceCharge;
    const reference = `UCH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const customerName = parentName || student.parentGuardiansName;
    const customerEmail = parentEmail || student.parentGuardiansEmail;

    if (!customerEmail) {
      return res.status(400).json({ message: 'Parent email is required' });
    }

    // call Kora API to initialize charge
    const koraResponse = await axios.post(
      `${KORA_BASE_URL}/charges/initialize`,
      {
        amount: amountInNaira,
        currency,
        reference,
        customer: {
          name: customerName,
          email: customerEmail,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.KORA_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!koraResponse.data.status) {
      return res.status(400).json({ message: 'Payment initialization failed', details: koraResponse.data });
    }

    // save payment record
    const payment = await paymentModel.create({
      schoolUrl: admin.schoolUrl,
      adminId: id,
      studentId,
      staffId: student.staffId || null,
      amount: payableAmount,
      paymentType,
      paymentStatus: 'pending',
      reference,
      currency,
      paymentDate: new Date(),
      parentName: customerName,
      parentEmail: customerEmail,
    });

    res.status(201).json({
      message: 'Payment initialized successfully',
      payment: {
        id: payment.id,
        reference: payment.reference,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.paymentStatus,
        classId: schoolClass.id,
        className: schoolClass.className,
        classAmount: payableAmount,
        serviceCharge,
        totalCharged: amountInNaira,
      },
      checkoutUrl: koraResponse.data.data.checkout_url,
      koraReference: koraResponse.data.data.reference,
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ message: 'Reference is required' });
    }

    // call Kora API to verify charge
    const koraResponse = await axios.get(
      `${KORA_BASE_URL}/charges/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.KORA_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!koraResponse.data.status) {
      return res.status(400).json({ message: 'Verification failed', details: koraResponse.data });
    }

    const koraStatus = koraResponse.data.data.status; // 'success' | 'failed' | 'pending'
    const mappedStatus = koraStatus === 'success' ? 'success' : koraStatus === 'failed' ? 'failed' : 'pending';

    const payment = await paymentModel.findOne({ where: { reference } });
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    const wallet = await walletModel.findOne({where:{adminId: payment.adminId}})
    if(koraStatus === 'success'){
      wallet.balance += payment.amount
    }

    await payment.update({ paymentStatus: mappedStatus });

    res.status(200).json({
      message: mappedStatus === 'success' ? 'Payment verified successfully' : `Payment status: ${mappedStatus}`,
      payment: {
        id: payment.id,
        reference: payment.reference,
        amount: payment.amount,
        currency: payment.currency,
        status: mappedStatus,
        paidAt: mappedStatus === 'success' ? new Date() : null,
      },
      koraData: koraResponse.data.data,
    });
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status || 400).json({
        message: 'Kora API verification error',
        details: error.response.data,
      });
    }
    next(error);
  }
};

exports.getPaymentHistory = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { studentId } = req.query;

    const whereClause = { adminId: id };
    if (studentId) {
      whereClause.studentId = studentId;
    }

    const payments = await paymentModel.findAll({
      where: whereClause,
      include: {
        model: studentModel,
        as: 'student',
        attributes: ['firstName', 'lastName', 'admissionNumber', 'studentClass'],
      },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      message: 'Payment history retrieved successfully',
      payments,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentByReference = async (req, res, next) => {
  try {
    const { reference } = req.params;

    const payment = await paymentModel.findOne({
      where: { reference },
      include: {
        model: studentModel,
        as: 'student',
        attributes: ['firstName', 'lastName', 'admissionNumber', 'studentClass'],
      },
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json({
      message: 'Payment retrieved successfully',
      payment,
    });
  } catch (error) {
    next(error);
  }
};
