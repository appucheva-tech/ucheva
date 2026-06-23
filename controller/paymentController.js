const axios = require('axios');
const paymentModel = require('../models/payment');
const parentModel = require('../models/parent')
const studentModel = require('../models/student');
const adminModel = require('../models/admin');
const classModel = require('../models/schoolclass');
const walletModel = require('../models/wallet');
const staffModel = require('../models/staff');
const studentAttendanceModel = require('../models/studentattendance');
const staffAttendanceModel = require('../models/staffattendance');
const { Op } = require('sequelize');
const schoolClasses = require('../models/schoolclass');

const KORA_BASE_URL = 'https://api.korapay.com/merchant/api/v1';

const getDateOnly = (date = new Date()) => date.toISOString().split('T')[0];

const getStartOfDay = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getEndOfDay = (date) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

const toNumber = (value) => Number(value || 0);

const getStudentName = (student) => [student?.firstName, student?.lastName].filter(Boolean).join(' ');

const getComputedPaymentStatus = (amountPaid, totalAmount, fallbackStatus) => {
  if (totalAmount > 0 && amountPaid >= totalAmount) return 'full payment';
  if (amountPaid > 0) return 'part payment';
  return fallbackStatus || 'unpaid';
};

exports.getClassPay = async (req, res, next) => {
    try {
        const { id } = req.user;

        const parent = await parentModel.findByPk(id);
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }

        const student = await studentModel.findOne({ where: { parentId: id } });
        if (!student) {
            return res.status(404).json({ message: 'No student found for this parent' });
        }

        const classPay = await schoolClasses.findOne({
            where: { id: student.classId, schoolUrl: parent.schoolUrl }
        });
        if (!classPay) {
            return res.status(404).json({ message: 'Class payment details not found' });
        }

        const totalAmount = Number(classPay.amount);
        const amountPaid = Number(student.amountPaid || 0);
        const balance = totalAmount - amountPaid;
        const isInstallment = classPay.paymentOption === 'installment';
        const installmentAmount = isInstallment
            ? Number((totalAmount / classPay.numberOfInstallments).toFixed(2))
            : null;

        return res.status(200).json({
            message: 'Class payment details retrieved successfully',
            data: {
                studentName: `${student.firstName} ${student.lastName}`,
                class: classPay.className,
                classId: classPay.id,
                parentEmail: parent.email,
                paymentOption: classPay.paymentOption,
                totalFee: totalAmount,
                amountPaid,
                balance,
                paymentStatus: student.paymentStatus || 'unpaid',
                ...(isInstallment && {
                    numberOfInstallments: classPay.numberOfInstallments,
                    payableAmount: classPay.payableAmount,
                    amountPerInstallment: installmentAmount
                })
            }
        });

    } catch (error) {
        next(error);
    }
};


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

exports.getFeesDashboard = async (req, res, next) => {
  try {
    const { id: adminId } = req.user;
    const {
      classSection,
      paymentStatus,
      term = 'Third Term',
      page = 1,
      limit = 20
    } = req.query;

    const admin = await adminModel.findByPk(adminId, {
      attributes: ['id', 'schoolName']
    });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const now = new Date();
    const today = getDateOnly(now);
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - 7);
    const previousWeekStart = new Date(now);
    previousWeekStart.setDate(now.getDate() - 14);
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (safePage - 1) * safeLimit;

    const studentWhere = { adminId };
    if (classSection && classSection !== 'All Classes') {
      studentWhere.studentClass = classSection;
    }

    const totalStudents = await studentModel.count({ where: { adminId } });
    const totalStaff = await staffModel.count({ where: { adminId } });
    const totalStudentsThisWeek = await studentModel.count({
      where: {
        adminId,
        createdAt: { [Op.between]: [getStartOfDay(thisWeekStart), getEndOfDay(now)] }
      }
    });
    const totalStudentsPreviousWeek = await studentModel.count({
      where: {
        adminId,
        createdAt: { [Op.between]: [getStartOfDay(previousWeekStart), getEndOfDay(thisWeekStart)] }
      }
    });
    const totalStaffThisWeek = await staffModel.count({
      where: {
        adminId,
        createdAt: { [Op.between]: [getStartOfDay(thisWeekStart), getEndOfDay(now)] }
      }
    });
    const totalStaffPreviousWeek = await staffModel.count({
      where: {
        adminId,
        createdAt: { [Op.between]: [getStartOfDay(previousWeekStart), getEndOfDay(thisWeekStart)] }
      }
    });

    const presentStudentsToday = await studentAttendanceModel.count({
      where: { status: 'present', date: today },
      include: [{
        model: studentModel,
        as: 'student',
        where: { adminId },
        attributes: []
      }]
    });
    const presentStaffToday = await staffAttendanceModel.count({
      where: { adminId, status: 'present', date: today }
    });
    const totalPeople = totalStudents + totalStaff;
    const attendanceRate = totalPeople
      ? Number((((presentStudentsToday + presentStaffToday) / totalPeople) * 100).toFixed(2))
      : 0;

    const totalFeesCollected = toNumber(await paymentModel.sum('amount', {
      where: { adminId, paymentStatus: 'success' }
    }));
    const feesCollectedThisWeek = toNumber(await paymentModel.sum('amount', {
      where: {
        adminId,
        paymentStatus: 'success',
        paymentDate: { [Op.between]: [getStartOfDay(thisWeekStart), getEndOfDay(now)] }
      }
    }));
    const feesCollectedPreviousWeek = toNumber(await paymentModel.sum('amount', {
      where: {
        adminId,
        paymentStatus: 'success',
        paymentDate: { [Op.between]: [getStartOfDay(previousWeekStart), getEndOfDay(thisWeekStart)] }
      }
    }));

    const allStudentsForFees = await studentModel.findAll({
      where: { adminId },
      include: [{
        model: classModel,
        as: 'classes',
        attributes: ['amount']
      }],
      attributes: ['id']
    });
    const totalExpectedFees = allStudentsForFees.reduce((sum, student) => {
      return sum + toNumber(student.classes?.amount);
    }, 0);
    const percentCollected = totalExpectedFees
      ? Number(((totalFeesCollected / totalExpectedFees) * 100).toFixed(2))
      : 0;

    const students = await studentModel.findAll({
      where: studentWhere,
      include: [{
        model: classModel,
        as: 'classes',
        attributes: ['className', 'amount']
      }],
      attributes: ['id', 'firstName', 'lastName', 'studentClass', 'paymentStatus'],
      order: [['createdAt', 'DESC']]
    });

    const studentIds = students.map((student) => student.id);
    const paymentRows = studentIds.length
      ? await paymentModel.findAll({
        where: { adminId, studentId: { [Op.in]: studentIds } },
        attributes: [
          'id',
          'studentId',
          'amount',
          'paymentType',
          'paymentStatus',
          'reference',
          'currency',
          'paymentDate'
        ],
        order: [['paymentDate', 'DESC']]
      })
      : [];

    const paymentsByStudent = paymentRows.reduce((groups, payment) => {
      if (!groups[payment.studentId]) groups[payment.studentId] = [];
      groups[payment.studentId].push(payment);
      return groups;
    }, {});

    const allFeeRecords = students.map((student) => {
      const studentPayments = paymentsByStudent[student.id] || [];
      const successfulPayments = studentPayments.filter((payment) => payment.paymentStatus === 'success');
      const amountPaid = successfulPayments.reduce((sum, payment) => sum + toNumber(payment.amount), 0);
      const totalAmount = toNumber(student.classes?.amount);
      const latestPayment = studentPayments[0] || null;
      const computedStatus = getComputedPaymentStatus(amountPaid, totalAmount, student.paymentStatus);

      return {
        studentId: student.id,
        studentName: getStudentName(student),
        class: student.studentClass,
        totalAmount,
        amountPaid,
        paymentType: latestPayment?.paymentType || null,
        status: computedStatus,
        date: latestPayment?.paymentDate || null,
        reference: latestPayment?.reference || null,
        currency: latestPayment?.currency || 'NGN'
      };
    }).filter((record) => {
      return !paymentStatus || paymentStatus === 'All Status' || record.status === paymentStatus;
    });

    const paginatedFeeRecords = allFeeRecords.slice(offset, offset + safeLimit);

    res.status(200).json({
      message: 'Fees dashboard retrieved successfully',
      feesDashboard: {
        greeting: `Good morning, ${admin.schoolName}`,
        overviewText: `Here's an overview of ${admin.schoolName} activities today.`,
        currentTerm: term,
        filters: {
          classSection: classSection || 'All Classes',
          paymentStatus: paymentStatus || 'All Status',
          term
        },
        cards: {
          totalStudents: {
            value: totalStudents,
            fromLastWeek: totalStudentsThisWeek - totalStudentsPreviousWeek
          },
          totalStaff: {
            value: totalStaff,
            fromLastWeek: totalStaffThisWeek - totalStaffPreviousWeek
          },
          attendanceRate: {
            value: attendanceRate,
            fromLastWeek: 0
          },
          feesCollected: {
            value: totalFeesCollected,
            fromLastWeek: feesCollectedThisWeek - feesCollectedPreviousWeek,
            percentCollected
          }
        },
        feeRecords: paginatedFeeRecords,
        exportData: allFeeRecords,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total: allFeeRecords.length,
          totalPages: Math.ceil(allFeeRecords.length / safeLimit)
        }
      }
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
