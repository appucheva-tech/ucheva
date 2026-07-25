const announcementModel = require('../models/announcement');
const announcementReadModel = require('../models/announcementRead');
const adminModel = require('../models/admin');
const bcrypt = require('bcrypt');
const bursaryModel = require('../models/bursary');
const classModel = require('../models/schoolclass');
const paymentModel = require('../models/payment');
const staffAttendanceModel = require('../models/staffattendance');
const staffModel = require('../models/staff');
const studentModel = require('../models/student');

const toNumber = (value) => {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (value.toString) return Number(value.toString());
  return Number(value) || 0;
};

const getDateOnly = (date = new Date()) => {
  const cleanDate = new Date(date);
  cleanDate.setHours(0, 0, 0, 0);
  return cleanDate;
};

const formatTime = (date) => {
  if (!date) return null;
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date(date));
};

const getStudentName = (student) => {
  return [student?.firstName, student?.lastName].filter(Boolean).join(' ');
};

const getComputedPaymentStatus = (amountPaid, totalAmount, fallbackStatus) => {
  if (totalAmount > 0 && amountPaid >= totalAmount) return 'Full Payment';
  if (amountPaid > 0) return 'Part Payment';
  return fallbackStatus || 'Unpaid';
};

const getGreeting = (name) => {
  const hour = new Date().getHours();
  const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  return `Good ${period}, ${name}`;
};

const toSafeInteger = (value, fallback, min, max) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

const removeUndefinedValues = (payload) => {
  return Object.entries(payload).reduce((cleanPayload, [key, value]) => {
    if (value !== undefined) cleanPayload[key] = value;
    return cleanPayload;
  }, {});
};

const splitDisplayName = (name = '') => {
  const [firstName = '', ...rest] = String(name).trim().split(' ').filter(Boolean);
  return {
    firstName,
    lastName: rest.join(' ')
  };
};

const getBursaryProfile = async (admin, staffId) => {
  let bursary = await bursaryModel.findOne({ adminId: admin.id });

  if (!bursary) {
    bursary = await bursaryModel.create({
      adminId: admin._id,
      schoolUrl: admin.schoolUrl,
      displayName: admin.schoolName,
      roleTitle: 'Bursary'
    });
  }

  const staff = staffId ? await staffModel.findById(staffId).select('firstName lastName staffProfileUrl') : null;
  const displayName = staff ? getStudentName(staff) : bursary.displayName;

  return { bursary, staff, displayName };
};

const buildBursaryFeeRecords = async ({
  adminId,
  classSection,
  paymentStatus,
  page = 1,
  limit = 10
}) => {
  const safePage = toSafeInteger(page, 1, 1, 100000);
  const safeLimit = toSafeInteger(limit, 10, 1, 100);
  const offset = (safePage - 1) * safeLimit;
  const studentWhere = { adminId };

  if (classSection && classSection !== 'All Classes') {
    studentWhere.studentClass = classSection;
  }

  const [students, classes, payments] = await Promise.all([
    studentModel.find(studentWhere).sort({ createdAt: -1 }).select('id firstName lastName studentClass paymentStatus classId'),
    classModel.find({ adminId }).select('id amount className'),
    paymentModel.find({ adminId }).sort({ paymentDate: -1 }).select('id studentId amount paymentType paymentStatus reference currency paymentDate')
  ]);

  const classesById = classes.reduce((groups, schoolClass) => {
    groups[schoolClass._id] = schoolClass;
    return groups;
  }, {});

  const paymentsByStudent = payments.reduce((groups, payment) => {
    const studentKey = payment.studentId?.toString();
    if (!studentKey) return groups;
    if (!groups[studentKey]) groups[studentKey] = [];
    groups[studentKey].push(payment);
    return groups;
  }, {});

  const feeRecords = students.map((student) => {
    const studentPayments = paymentsByStudent[student._id] || [];
    const successfulPayments = studentPayments.filter((payment) => payment.paymentStatus === 'success');
    const amountPaid = successfulPayments.reduce((sum, payment) => sum + toNumber(payment.amount), 0);
    const schoolClass = classesById[student.classId?.toString()];
    const totalAmount = toNumber(schoolClass?.amount);
    const latestPayment = studentPayments[0] || null;
    const status = getComputedPaymentStatus(amountPaid, totalAmount, student.paymentStatus);

    return {
      studentId: student._id,
      studentName: getStudentName(student),
      class: student.studentClass || schoolClass?.className,
      totalAmount,
      amountPaid,
      outstandingAmount: Math.max(totalAmount - amountPaid, 0),
      paymentType: latestPayment?.paymentType || null,
      status,
      date: latestPayment?.paymentDate || null,
      reference: latestPayment?.reference || null,
      currency: latestPayment?.currency || 'NGN'
    };
  }).filter((record) => {
    return !paymentStatus || paymentStatus === 'All Status' || record.status.toLowerCase() === paymentStatus.toLowerCase();
  });

  const expectedFeeAmount = feeRecords.reduce((sum, record) => sum + record.totalAmount, 0);
  const collectedFeeAmount = feeRecords.reduce((sum, record) => sum + record.amountPaid, 0);
  const collectedFeeCount = feeRecords.filter((record) => record.status === 'Full Payment').length;
  const owingRecords = feeRecords.filter((record) => record.outstandingAmount > 0);
  const outstandingFeeAmount = owingRecords.reduce((sum, record) => sum + record.outstandingAmount, 0);

  return {
    summaryCards: {
      expectedFee: {
        title: 'Expected Fee',
        value: feeRecords.length,
        amount: expectedFeeAmount
      },
      collectedFee: {
        title: 'Collected Fee',
        value: collectedFeeCount,
        amount: collectedFeeAmount
      },
      outstandingFee: {
        title: 'Outstanding Fee',
        value: owingRecords.length,
        amount: outstandingFeeAmount
      },
      studentsOwing: {
        title: 'Students Owing',
        value: owingRecords.length
      }
    },
    feeRecords,
    paginatedFeeRecords: feeRecords.slice(offset, offset + safeLimit),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: feeRecords.length,
      totalPages: Math.ceil(feeRecords.length / safeLimit)
    }
  };
};

exports.getBursaryAnnouncements = async (req, res, next) => {
  try {
    const { id: adminId, staffId } = req.user;
    const {
      category = 'all',
      page = 1,
      limit = 10,
      search
    } = req.query;

    const normalizedCategory = String(category).toLowerCase();
    if (!['all', 'unread', 'read'].includes(normalizedCategory)) {
      return res.status(400).json({ message: 'Category must be all, unread, or read' });
    }

    const admin = await adminModel.findById(adminId).select('id schoolName schoolUrl');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const safePage = toSafeInteger(page, 1, 1, 100000);
    const safeLimit = toSafeInteger(limit, 10, 1, 100);
    const offset = (safePage - 1) * safeLimit;
    const userId = staffId || adminId;
    const baseWhere = {
      adminId,
      status: 'sent',
      audience: { $in: ['staff', 'all'] }
    };

    if (search) {
      baseWhere.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const readRecords = await announcementReadModel.find({ adminId, userId }).select('announcementId readAt');
    const readMap = readRecords.reduce((groups, readRecord) => {
      groups[readRecord.announcementId.toString()] = readRecord.readAt;
      return groups;
    }, {});
    const readAnnouncementIds = readRecords.map((readRecord) => readRecord.announcementId);
    const categoryWhere = { ...baseWhere };

    if (normalizedCategory === 'read') {
      categoryWhere._id = { $in: readAnnouncementIds };
    }

    if (normalizedCategory === 'unread') {
      categoryWhere._id = { $nin: readAnnouncementIds };
    }

    const [totalCount, readCount, announcementCount, announcementDocs] = await Promise.all([
      announcementModel.countDocuments(baseWhere),
      readAnnouncementIds.length
        ? announcementModel.countDocuments({ ...baseWhere, _id: { $in: readAnnouncementIds } })
        : 0,
      announcementModel.countDocuments(categoryWhere),
      announcementModel.find(categoryWhere)
        .sort({ sentAt: -1, createdAt: -1 })
        .skip(offset)
        .limit(safeLimit)
        .select('id title content audience status sentAt scheduledAt createdAt')
    ]);

    const unreadCount = Math.max(totalCount - readCount, 0);

    res.status(200).json({
      message: 'Bursary announcements retrieved successfully',
      bursaryAnnouncements: {
        title: 'Announcements',
        subtitle: 'Stay updated with school notices and updates.',
        activeCategory: normalizedCategory,
        search: search || '',
        categories: [
          { key: 'all', label: 'All', count: totalCount },
          { key: 'unread', label: 'Unread', count: unreadCount },
          { key: 'read', label: 'Read', count: readCount }
        ],
        announcements: announcementDocs.map((announcement) => {
          const displayDate = announcement.sentAt || announcement.scheduledAt || announcement.createdAt;
          const readAt = readMap[announcement._id] || null;

          return {
            id: announcement._id,
            title: announcement.title,
            content: announcement.content,
            audience: announcement.audience,
            status: announcement.status,
            category: readAt ? 'read' : 'unread',
            isRead: Boolean(readAt),
            readAt,
            date: displayDate,
            displayTime: formatTime(displayDate),
            actions: {
              view: {
                label: 'View announcement',
                method: 'GET',
                url: `/api/v1/bursary/announcements/${announcement.id}`
              }
            }
          };
        }),
        pagination: {
          page: safePage,
          limit: safeLimit,
          total: announcementCount,
          totalPages: Math.ceil(announcementCount / safeLimit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.markBursaryAnnouncementAsRead = async (req, res, next) => {
  try {
    const { id: adminId, staffId } = req.user;
    const { id: announcementId } = req.params;
    const userId = staffId || adminId;

    const announcement = await announcementModel.findOne({
      _id: announcementId,
      adminId,
      status: 'sent',
      audience: { $in: ['staff', 'all'] }
    });

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    const readRecord = await announcementReadModel.findOneAndUpdate(
      { announcementId, userId },
      {
        adminId,
        announcementId,
        userId,
        userRole: 'bursary',
        readAt: new Date()
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Announcement marked as read successfully',
      readRecord
    });
  } catch (error) {
    next(error);
  }
};

exports.getBursaryDashboard = async (req, res, next) => {
  try {
    const { id: adminId, staffId } = req.user;
    const { page = 1, limit = 6, classSection, paymentStatus } = req.query;

    const admin = await adminModel.findById(adminId).select('id schoolName schoolUrl');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const safePage = toSafeInteger(page, 1, 1, 100000);
    const safeLimit = toSafeInteger(limit, 6, 1, 100);
    const offset = (safePage - 1) * safeLimit;
    const { bursary, staff, displayName } = await getBursaryProfile(admin, staffId);

    const studentWhere = { adminId };
    if (classSection && classSection !== 'All Classes') {
      studentWhere.studentClass = classSection;
    }

    const [students, classes, payments, announcements, attendance] = await Promise.all([
      studentModel.find(studentWhere).sort({ createdAt: -1 }).select('id firstName lastName studentClass paymentStatus classId'),
      classModel.find({ adminId }).select('id amount className'),
      paymentModel.find({ adminId }).sort({ paymentDate: -1 }).select('id studentId amount paymentType paymentStatus reference currency paymentDate'),
      announcementModel.find({ adminId }).sort({ createdAt: -1 }).limit(3).select('id title content sentAt scheduledAt createdAt'),
      staffId
        ? staffAttendanceModel.findOne({
            adminId,
            staffId,
            date: getDateOnly()
          }).sort({ createdAt: -1 })
        : null
    ]);

    const classesById = classes.reduce((groups, schoolClass) => {
      groups[schoolClass._id] = schoolClass;
      return groups;
    }, {});

    const paymentsByStudent = payments.reduce((groups, payment) => {
      const studentKey = payment.studentId?.toString();
      if (!studentKey) return groups;
      if (!groups[studentKey]) groups[studentKey] = [];
      groups[studentKey].push(payment);
      return groups;
    }, {});

    const allFeeRecords = students.map((student) => {
      const studentPayments = paymentsByStudent[student._id] || [];
      const successfulPayments = studentPayments.filter((payment) => payment.paymentStatus === 'success');
      const amountPaid = successfulPayments.reduce((sum, payment) => sum + toNumber(payment.amount), 0);
      const schoolClass = classesById[student.classId?.toString()];
      const totalAmount = toNumber(schoolClass?.amount);
      const latestPayment = studentPayments[0] || null;
      const status = getComputedPaymentStatus(amountPaid, totalAmount, student.paymentStatus);

      return {
        studentId: student._id,
        studentName: getStudentName(student),
        class: student.studentClass || schoolClass?.className,
        totalAmount,
        amountPaid,
        outstandingAmount: Math.max(totalAmount - amountPaid, 0),
        paymentType: latestPayment?.paymentType || null,
        status,
        date: latestPayment?.paymentDate || null,
        reference: latestPayment?.reference || null,
        currency: latestPayment?.currency || 'NGN'
      };
    }).filter((record) => {
      return !paymentStatus || paymentStatus === 'All Status' || record.status.toLowerCase() === paymentStatus.toLowerCase();
    });

    const totalCollectedAmount = payments
      .filter((payment) => payment.paymentStatus === 'success')
      .reduce((sum, payment) => sum + toNumber(payment.amount), 0);
    const collectedFeeCount = allFeeRecords.filter((record) => record.status === 'Full Payment').length;
    const owingRecords = allFeeRecords.filter((record) => record.outstandingAmount > 0);
    const outstandingFeeCount = owingRecords.length;
    const outstandingFeeAmount = owingRecords.reduce((sum, record) => sum + record.outstandingAmount, 0);
    const paginatedFeeRecords = allFeeRecords.slice(offset, offset + safeLimit);
    const attendanceStatus = attendance?.status === 'present' || attendance?.timeCheckedIn ? 'Checked In' : 'Not Checked In';

    res.status(200).json({
      message: 'Bursary dashboard retrieved successfully',
      bursaryDashboard: {
        header: {
          greeting: getGreeting(displayName),
          overviewText: "Here's today's financial overview.",
          currentSession: bursary.currentSession || '2025/2026 Session',
          currentTerm: bursary.currentTerm || 'Third Term',
          date: new Date(),
          profile: {
            name: displayName,
            role: bursary.roleTitle,
            imageUrl: staff?.staffProfileUrl || null
          }
        },
        summaryCards: {
          attendance: {
            title: bursary.attendanceLabel,
            status: attendanceStatus,
            checkedInAt: attendance?.timeCheckedIn || null,
            checkedInTime: formatTime(attendance?.timeCheckedIn)
          },
          collectedFee: {
            title: 'Collected Fee',
            value: collectedFeeCount,
            amount: totalCollectedAmount
          },
          outstandingFee: {
            title: 'Outstanding Fee',
            value: outstandingFeeCount,
            amount: outstandingFeeAmount
          },
          studentsOwing: {
            title: 'Students Owing',
            value: owingRecords.length
          }
        },
        attendancePanel: {
          title: attendanceStatus === 'Checked In' ? 'Checked In Successful' : 'Attendance Pending',
          checkedInTime: formatTime(attendance?.timeCheckedIn),
          instruction: bursary.checkoutInstruction,
          actionLabel: attendanceStatus === 'Checked In' ? 'Scan QR to Check Out' : 'Scan QR to Check In'
        },
        recentAnnouncements: announcements.map((announcement) => ({
          id: announcement._id,
          title: announcement.title,
          content: announcement.content,
          date: announcement.sentAt || announcement.scheduledAt || announcement.createdAt
        })),
        paymentHistory: paginatedFeeRecords,
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

exports.getBursarySettings = async (req, res, next) => {
  try {
    const { id: adminId } = req.user;

    const admin = await adminModel.findById(adminId).select('id schoolName schoolUrl email phoneNumber address');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const { bursary, staff } = await getBursaryProfile(admin, null);
    const linkedStaff = bursary.staffId
      ? await staffModel.findById(bursary.staffId).select('firstName lastName email phoneNumber address staffProfileUrl')
      : staff;
    const fallbackName = splitDisplayName(bursary.displayName || admin.schoolName);

    res.status(200).json({
      message: 'Bursary settings retrieved successfully',
      bursarySettings: {
        title: 'Settings',
        subtitle: 'Manage your profile and account preferences.',
        profileInformation: {
          firstName: linkedStaff?.firstName || fallbackName.firstName,
          lastName: linkedStaff?.lastName || fallbackName.lastName,
          role: bursary.roleTitle || 'Bursary',
          phoneNumber: linkedStaff?.phoneNumber || admin.phoneNumber,
          email: linkedStaff?.email || admin.email,
          address: linkedStaff?.address || admin.address,
          imageUrl: linkedStaff?.staffProfileUrl || null,
          uploadHint: 'PNG, JPG, Max 2MB',
          saveAction: {
            label: 'Save Changes',
            method: 'PUT',
            url: '/api/v1/bursary/settings/profile'
          }
        },
        security: {
          title: 'Security',
          changePassword: {
            title: 'Change Password',
            subtitle: 'Update your account password.',
            action: {
              label: 'Change Password',
              method: 'PUT',
              url: '/api/v1/bursary/settings/password'
            }
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBursarySettingsProfile = async (req, res, next) => {
  try {
    const { id: adminId } = req.user;
    const {
      firstName,
      lastName,
      role,
      phoneNumber,
      email,
      address,
      imageUrl
    } = req.body;

    const admin = await adminModel.findById(adminId).select('id schoolUrl schoolName email phoneNumber address');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const { bursary } = await getBursaryProfile(admin, null);
    const displayName = [firstName, lastName].filter(Boolean).join(' ') || bursary.displayName;
    const updatePayload = removeUndefinedValues({
      displayName,
      roleTitle: role,
      staffId: bursary.staffId
    });

    let profile;
    if (bursary.staffId) {
      const staff = await staffModel.findOne({ _id: bursary.staffId, adminId });
      if (!staff) {
        return res.status(404).json({ message: 'Linked bursary staff not found' });
      }

      Object.assign(staff, removeUndefinedValues({
        firstName,
        lastName,
        phoneNumber,
        email: email?.toLowerCase().trim(),
        address,
        staffProfileUrl: imageUrl
      }));
      await staff.save();
      profile = {
        firstName: staff.firstName,
        lastName: staff.lastName,
        role: role || bursary.roleTitle,
        phoneNumber: staff.phoneNumber,
        email: staff.email,
        address: staff.address,
        imageUrl: staff.staffProfileUrl || null
      };
    } else {
      Object.assign(admin, removeUndefinedValues({
        email: email?.toLowerCase().trim(),
        phoneNumber,
        address
      }));
      await admin.save();
      profile = {
        firstName: splitDisplayName(displayName).firstName,
        lastName: splitDisplayName(displayName).lastName,
        role: role || bursary.roleTitle,
        phoneNumber: admin.phoneNumber,
        email: admin.email,
        address: admin.address,
        imageUrl: null
      };
    }

    const updatedBursary = await bursaryModel.findOneAndUpdate(
      { adminId },
      updatePayload,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Bursary settings profile updated successfully',
      bursary: updatedBursary,
      profile
    });
  } catch (error) {
    next(error);
  }
};

exports.changeBursarySettingsPassword = async (req, res, next) => {
  try {
    const { id: adminId } = req.user;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'oldPassword, newPassword and confirmPassword are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'password does not match' });
    }

    const admin = await adminModel.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const bursary = await bursaryModel.findOne({ adminId });
    const account = bursary?.staffId ? await staffModel.findById(bursary.staffId) : admin;
    if (!account) {
      return res.status(404).json({ message: 'Bursary account not found' });
    }

    const passwordCorrect = await bcrypt.compare(oldPassword, account.password || '');
    if (!passwordCorrect) {
      return res.status(400).json({ message: 'incorrect password' });
    }

    const salt = await bcrypt.genSalt(10);
    account.password = await bcrypt.hash(newPassword, salt);
    await account.save();

    res.status(200).json({
      message: 'Bursary password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.upsertBursaryProfile = async (req, res, next) => {
  try {
    const { id: adminId } = req.user;
    const {
      staffId,
      displayName,
      roleTitle,
      currentSession,
      currentTerm,
      attendanceLabel,
      checkoutInstruction,
      isActive
    } = req.body;

    const admin = await adminModel.findById(adminId).select('id schoolUrl');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const updatePayload = removeUndefinedValues({
      adminId,
      schoolUrl: admin.schoolUrl,
      staffId,
      displayName,
      roleTitle,
      currentSession,
      currentTerm,
      attendanceLabel,
      checkoutInstruction,
      isActive
    });

    const bursary = await bursaryModel.findOneAndUpdate(
      { adminId },
      updatePayload,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Bursary profile saved successfully',
      bursary
    });
  } catch (error) {
    next(error);
  }
};

exports.getBursaryFees = async (req, res, next) => {
  try {
    const { id: adminId } = req.user;
    const {
      classSection,
      paymentStatus,
      term = 'Third Term',
      page = 1,
      limit = 10
    } = req.query;

    const admin = await adminModel.findById(adminId).select('id schoolName schoolUrl');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const feeData = await buildBursaryFeeRecords({
      adminId,
      classSection,
      paymentStatus,
      page,
      limit
    });

    res.status(200).json({
      message: 'Bursary fees retrieved successfully',
      bursaryFees: {
        title: 'Fee Management',
        subtitle: 'Manage school fees, payments, and view payment records.',
        filters: {
          classSection: classSection || 'All Classes',
          paymentStatus: paymentStatus || 'All Status',
          term
        },
        actions: {
          export: {
            label: 'Export',
            method: 'GET',
            url: '/api/v1/bursary/fees?export=true'
          },
          reset: {
            label: 'Reset',
            method: 'GET',
            url: '/api/v1/bursary/fees'
          }
        },
        summaryCards: feeData.summaryCards,
        paymentRecords: feeData.paginatedFeeRecords,
        exportData: feeData.feeRecords,
        pagination: {
          ...feeData.pagination,
          rowsPerPage: feeData.pagination.limit,
          showingText: `Showing page ${feeData.pagination.page} of ${feeData.pagination.totalPages || 1}`
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
