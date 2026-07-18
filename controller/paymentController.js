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

const getSuccessfulAmountPaid = async (studentId, adminId) => {
  const [result] = await paymentModel.aggregate([
    { $match: { studentId, adminId, paymentStatus: 'success' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  return toNumber(result?.total);
};

const getInstallmentAmount = (schoolClass, balance) => {
  const configuredAmount = toNumber(schoolClass.payableAmount);
  const calculatedAmount = schoolClass.numberOfInstallments
    ? Number((toNumber(schoolClass.amount) / schoolClass.numberOfInstallments).toFixed(2))
    : 0;
  const installmentAmount = configuredAmount || calculatedAmount;

  return Math.min(installmentAmount, balance);
};

exports.getClassPay = async (req, res, next) => {
    try {
        const { id } = req.user;

        const parent = await parentModel.findById(id);
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }

        const student = await studentModel.findOne({ parentId: id });
        if (!student) {
            return res.status(404).json({ message: 'No student found for this parent' });
        }

        const classPay = await schoolClasses.findOne({
            _id: student.classId,
            schoolUrl: parent.schoolUrl
        });
        if (!classPay) {
            return res.status(404).json({ message: 'Class payment details not found' });
        }

        const totalAmount = Number(classPay.amount);
        const amountPaid = await getSuccessfulAmountPaid(student.id, student.adminId);
        const balance = Math.max(totalAmount - amountPaid, 0);
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
                paymentStatus: getComputedPaymentStatus(amountPaid, totalAmount, student.paymentStatus),
                ...(isInstallment && {
                    numberOfInstallments: classPay.numberOfInstallments,
                    payableAmount: classPay.payableAmount,
                    amountPerInstallment: installmentAmount,
                    nextInstallmentAmount: getInstallmentAmount(classPay, balance),
                    installmentsPaid: installmentAmount ? Math.floor(amountPaid / installmentAmount) : 0
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
      parentName,
      parentEmail,
      currency = 'NGN',
      paymentType,
      paymentPlan,
      amount
    } = req.body;

    const schoolUrl = req.headers["x-tenant"];
    if (!schoolUrl) {
      return res.status(404).json({ message: 'invalid school domain' });
    }

    const parent = await parentModel.findById(id);
    if (!parent) {
      return res.status(404).json({ message: 'parent not found' });
    }

    const student = await studentModel.findOne({ _id: studentId, parentId: id });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const schoolClass = await classModel.findOne({
      _id: student.classId,
      schoolUrl: student.schoolUrl
    });
    if (!schoolClass) {
      return res.status(404).json({ message: 'Student class not found' });
    }

    const totalFee = Number(schoolClass.amount);
    const amountPaid = await getSuccessfulAmountPaid(student.id, student.adminId);

    student.balance = Math.max(totalFee - amountPaid, 0);

    const isInstallment = schoolClass.paymentOption === 'installment';
    const selectedPaymentPlan = paymentPlan || (isInstallment ? 'installment' : 'full payment');

    if (student.balance <= 0) {
      return res.status(400).json({ message: 'Student fee has already been fully paid' });
    }

    if (selectedPaymentPlan === 'installment' && !isInstallment) {
      return res.status(400).json({ message: 'Installment payment is not enabled for this class' });
    }

    if (
      selectedPaymentPlan === 'installment' &&
      (!schoolClass.numberOfInstallments || schoolClass.numberOfInstallments < 2)
    ) {
      return res.status(400).json({ message: 'Invalid class installment configuration' });
    }

    let payableAmount =
      selectedPaymentPlan === 'installment'
        ? getInstallmentAmount(schoolClass, student.balance)
        : student.balance;

    if (amount !== undefined) {
      const requestedAmount = Number(amount);
      if (!requestedAmount || requestedAmount <= 0) {
        return res.status(400).json({ message: 'Payment amount must be greater than zero' });
      }
      if (requestedAmount > student.balance) {
        return res.status(400).json({ message: 'Payment amount cannot exceed outstanding balance' });
      }
      if (selectedPaymentPlan !== 'installment' && requestedAmount !== student.balance) {
        return res.status(400).json({ message: 'Partial amount is only allowed for installment payments' });
      }
      payableAmount = requestedAmount;
    }

    if (!payableAmount || payableAmount <= 0) {
      return res.status(400).json({ message: 'Invalid class payment amount' });
    }

    const serviceCharge = 600;
    const amountInNaira = payableAmount + serviceCharge;
    const reference = `UCH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const customerName = parentName || student.parentGuardiansFirstName;
    const customerEmail = parentEmail || student.parentGuardiansEmail;

    if (!customerEmail) {
      return res.status(400).json({ message: 'Parent email is required' });
    }

    // Call Kora API to initialize charge
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
        redirect_url: `https://${schoolUrl}.ucheva.com/payment-verification/`
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

    // Save payment record
    const payment = await paymentModel.create({
      schoolUrl: parent.schoolUrl,
      adminId: student.adminId,
      studentId,
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
        paymentPlan: selectedPaymentPlan,
        classAmount: totalFee,
        amountPaid,
        outstandingBalance: student.balance,
        paymentAmount: payableAmount,
        remainingBalanceAfterPayment: Math.max(student.balance - payableAmount, 0),
        numberOfInstallments: isInstallment ? schoolClass.numberOfInstallments : null,
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
  paymentStatus,
  classSection,  
  term,          
  page = 1,
  limit = 6
    } = req.query;

    const admin = await adminModel.findById(adminId).select('id schoolName');
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

    const totalStudents = await studentModel.countDocuments({ adminId });
    const totalStaff = await staffModel.countDocuments({ adminId });
    const totalStudentsThisWeek = await studentModel.countDocuments({
      adminId,
      createdAt: { $gte: getStartOfDay(thisWeekStart), $lte: getEndOfDay(now) }
    });
    const totalStudentsPreviousWeek = await studentModel.countDocuments({
      adminId,
      createdAt: { $gte: getStartOfDay(previousWeekStart), $lte: getEndOfDay(thisWeekStart) }
    });
    const totalStaffThisWeek = await staffModel.countDocuments({
      adminId,
      createdAt: { $gte: getStartOfDay(thisWeekStart), $lte: getEndOfDay(now) }
    });
    const totalStaffPreviousWeek = await staffModel.countDocuments({
      adminId,
      createdAt: { $gte: getStartOfDay(previousWeekStart), $lte: getEndOfDay(thisWeekStart) }
    });

    const presentStudentsToday = await studentAttendanceModel.countDocuments({ status: 'present', date: today });
    const presentStaffToday = await staffAttendanceModel.countDocuments({ adminId, status: 'present', date: today });
    const totalPeople = totalStudents + totalStaff;
    const attendanceRate = totalPeople
      ? Number((((presentStudentsToday + presentStaffToday) / totalPeople) * 100).toFixed(2))
      : 0;

    const totalFeesCollected = toNumber((await paymentModel.aggregate([
      { $match: { adminId, paymentStatus: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]))[0]?.total || 0);
    const feesCollectedThisWeek = toNumber((await paymentModel.aggregate([
      { $match: { adminId, paymentStatus: 'success', paymentDate: { $gte: getStartOfDay(thisWeekStart), $lte: getEndOfDay(now) } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]))[0]?.total || 0);
    const feesCollectedPreviousWeek = toNumber((await paymentModel.aggregate([
      { $match: { adminId, paymentStatus: 'success', paymentDate: { $gte: getStartOfDay(previousWeekStart), $lte: getEndOfDay(thisWeekStart) } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]))[0]?.total || 0);

    const allStudentsForFees = await studentModel.find({ adminId }).select('id classId');
    const totalExpectedFees = allStudentsForFees.reduce((sum, student) => {
      return sum + toNumber(student.classes?.amount);
    }, 0);
    const percentCollected = totalExpectedFees
      ? Number(((totalFeesCollected / totalExpectedFees) * 100).toFixed(2))
      : 0;

    const students = await studentModel.find(studentWhere).sort({ createdAt: -1 }).select('id firstName lastName studentClass paymentStatus classId');

    const studentIds = students.map((student) => student.id);
    const paymentRows = studentIds.length
      ? await paymentModel.find({ adminId, studentId: { $in: studentIds } }).sort({ paymentDate: -1 }).select('id studentId amount paymentType paymentStatus reference currency paymentDate')
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
        currentTerm: admin.term || `SELECT CONCAT(YEAR(CURDATE() - INTERVAL 8 MONTH), '/', YEAR(CURDATE() + INTERVAL 4 MONTH))`,
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
    const schoolUrl = req.headers["x-tenant"];
        if(!schoolUrl){
            return res.status(404).json({
                message: 'invalid school domain'
            })
        }

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

    const payment = await paymentModel.findOne({ reference });
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    const studentRecord = payment ? await studentModel.findById(payment.studentId).select('id adminId parentId paymentStatus') : null;

    if (studentRecord?.parentId?.toString() !== req.user.id?.toString()) {
      return res.status(403).json({ message: 'Unauthorized to verify this payment' });
    }

    const wallet = await walletModel.findOne({ adminId: payment.adminId })
    const previousPaymentStatus = payment.paymentStatus;

    if(koraStatus === 'success' && previousPaymentStatus !== 'success' && wallet){
      wallet.balance = toNumber(wallet.balance) + toNumber(payment.amount)
      wallet.paymentReceived = toNumber(wallet.paymentReceived) + toNumber(payment.amount)
      wallet.totalTransaction = toNumber(wallet.totalTransaction) + 1
      
      await wallet.save()
    }

    payment.paymentStatus = mappedStatus;
    await payment.save();

    if (mappedStatus === 'success') {
      const student = await studentModel.findById(payment.studentId).select('id classId paymentStatus');

      if (student) {
        const schoolClass = await classModel.findById(student.classId).select('amount');
        const totalFee = toNumber(schoolClass?.amount);
        const amountPaid = await getSuccessfulAmountPaid(student.id, payment.adminId);
        const paymentStatus = getComputedPaymentStatus(amountPaid, totalFee, student.paymentStatus);
        student.paymentStatus = paymentStatus;
        await student.save();
      }
    }

    res.status(200).json({
      message: mappedStatus === 'success' ? 'Payment verified successfully' : `Payment status: ${mappedStatus}`,
      payment: {
        id: payment.id,
        reference: payment.reference,
        amount: payment.amount,
        currency: payment.currency,
        status: mappedStatus,
        previousStatus: previousPaymentStatus,
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

    const payments = await paymentModel.find(whereClause).sort({ createdAt: -1 });

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

    const payment = await paymentModel.findOne({ reference });

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


