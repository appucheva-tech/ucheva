const axios = require('axios');
const paymentModel = require('../models/payment');
const studentModel = require('../models/student');
const feeModel = require('../models/feestructure');
const admins = require('../models/admin')

const KORA_BASE_URL = 'https://api.korapay.com/merchant/api/v1';


exports.initializePayment = async (req, res, next) => {
  try {
    const { id } = req.user; // admin id
    const { studentId, feeId, amount, parentName, parentEmail, currency } = req.body;

    // validate student
    const student = await studentModel.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    let payableAmount = amount;
    let feeType = null;

    // if a feeId is provided, pull amount from the fee structure
    if (feeId) {
      const feeStructure = await feeModel.findOne({ where: { id: feeId, adminId: id } });
      if (!feeStructure) {
        return res.status(404).json({ message: 'Fee structure not found' });
      }
      payableAmount = feeStructure.payableAmount || feeStructure.amount;
      feeType = feeStructure.feeType;
    }

    if (!payableAmount || payableAmount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    // amount must be in kobo / smallest currency unit for Kora
    const amountInKobo = Math.round(payableAmount * 100);

    const reference = `UCH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // call Kora API to initialize charge
    const koraResponse = await axios.post(
      `${KORA_BASE_URL}/charges/initialize`,
      {
        amount: amountInKobo,
        currency: currency || 'NGN',
        reference,
        customer: {
          name: parentName || student.parentGuardiansName,
          email: parentEmail || student.email,
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
      schoolUrl: admins.schoolUrl,
      adminId: id,
      studentId,
      staffId: student.staffId || null,
      amount: payableAmount,
      paymentType: 'card',
      paymentStatus: 'pending',
      reference,
      currency: currency || 'NGN',
      paymentDate: new Date(),
      parentName: parentName || student.parentGuardiansName,
      parentEmail: parentEmail || student.email,
    });

    res.status(201).json({
      message: 'Payment initialized successfully',
      payment: {
        id: payment.id,
        reference: payment.reference,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.paymentStatus,
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

    // update payment record
    const payment = await paymentModel.findOne({ where: { reference } });
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
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
