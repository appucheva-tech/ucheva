const dayjs = require('dayjs');
const bcrypt = require('bcrypt');
const SecurityDashboardModel = require('../models/securityDashboard');
const announcementReadModel = require('../models/announcementRead');
const staffModel = require('../models/staff');
const announcementModel = require('../models/announcement');

const getToday = () => dayjs().format('YYYY-MM-DD');

const toSafeInteger = (value, fallback, min, max) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

const formatTime = (date) => {
  if (!date) return null;

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date(date));
};

const formatDate = (date) => {
  if (!date) return null;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
};

const getScanAction = (dashboard) => {
  if (!dashboard || dashboard.status === 'not_checked_in') {
    return {
      label: 'Scan QR to Check In',
      method: 'POST',
      url: '/api/v1/security-dashboard/check-in'
    };
  }

  if (dashboard.status === 'checked_in') {
    return {
      label: 'Scan QR to Check Out',
      method: 'POST',
      url: '/api/v1/security-dashboard/check-out'
    };
  }

  return {
    label: 'Attendance Completed',
    method: null,
    url: null
  };
};

const getStatusText = (dashboard) => {
  if (!dashboard || dashboard.status === 'not_checked_in') {
    return {
      title: 'Ready to Check In',
      subtitle: 'Please scan the QR code to mark your attendance'
    };
  }

  if (dashboard.status === 'checked_in') {
    return {
      title: 'Checked In Successful',
      subtitle: `Check-in Time ${formatTime(dashboard.timeCheckedIn)}`
    };
  }

  return {
    title: 'Checked Out Successful',
    subtitle: `Check-out Time ${formatTime(dashboard.timeCheckedOut)}`
  };
};

const buildDashboardResponse = async (staff, dashboard) => {
  const announcements = await announcementModel
    .find({
      schoolUrl: staff.schoolUrl,
      status: 'sent',
      audience: { $in: ['staff', 'all'] }
    })
    .sort({ sentAt: -1, createdAt: -1 })
    .limit(3)
    .select('title content sentAt createdAt');

  return {
    greeting: `Good morning, Mr ${staff.firstName}`,
    welcomeText: 'Welcome back.',
    user: {
      id: staff._id,
      name: `${staff.firstName} ${staff.lastName}`,
      role: 'Security',
      profileImage: staff.staffProfileUrl || null
    },
    attendanceCard: {
      date: getToday(),
      status: dashboard?.status || 'not_checked_in',
      timeCheckedIn: dashboard?.timeCheckedIn || null,
      timeCheckedOut: dashboard?.timeCheckedOut || null,
      displayTimeCheckedIn: formatTime(dashboard?.timeCheckedIn),
      displayTimeCheckedOut: formatTime(dashboard?.timeCheckedOut),
      ...getStatusText(dashboard),
      scanAction: getScanAction(dashboard)
    },
    recentAnnouncements: announcements.map((announcement) => ({
      id: announcement._id,
      title: announcement.title,
      content: announcement.content,
      date: formatDate(announcement.sentAt || announcement.createdAt)
    }))
  };
};

const getSecurityStaff = async (staffId, schoolUrl) => {
  const staff = await staffModel.findOne({ _id: staffId, schoolUrl });

  if (!staff) {
    return null;
  }

  return staff;
};

const removeUndefinedValues = (payload) => {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );
};

exports.getSecurityDashboard = async (req, res, next) => {
  try {
    const { id: staffId } = req.user;
    const schoolUrl = req.headers['x-tenant'];

    if (!schoolUrl) {
      return res.status(400).json({ message: 'x-tenant header is required' });
    }

    const staff = await getSecurityStaff(staffId, schoolUrl);
    if (!staff) {
      return res.status(404).json({ message: 'Security staff not found' });
    }

    const today = getToday();
    let dashboard = await SecurityDashboardModel.findOne({
      staffId,
      schoolUrl,
      date: today
    });

    if (!dashboard) {
      dashboard = await SecurityDashboardModel.create({
        adminId: staff.adminId,
        staffId,
        schoolUrl,
        date: today
      });
    }

    const securityDashboard = await buildDashboardResponse(staff, dashboard);

    res.status(200).json({
      message: 'Security dashboard retrieved successfully',
      securityDashboard
    });
  } catch (error) {
    next(error);
  }
};

exports.checkInSecurity = async (req, res, next) => {
  try {
    const { id: staffId } = req.user;
    const schoolUrl = req.headers['x-tenant'];
    const { latitude, longitude } = req.body;

    if (!schoolUrl) {
      return res.status(400).json({ message: 'x-tenant header is required' });
    }

    const staff = await getSecurityStaff(staffId, schoolUrl);
    if (!staff) {
      return res.status(404).json({ message: 'Security staff not found' });
    }

    const today = getToday();
    const existingDashboard = await SecurityDashboardModel.findOne({ staffId, schoolUrl, date: today });

    if (existingDashboard?.timeCheckedIn) {
      return res.status(409).json({ message: 'You have already checked in today' });
    }

    const now = new Date();
    const dashboard = await SecurityDashboardModel.findOneAndUpdate(
      { staffId, schoolUrl, date: today },
      {
        $set: {
          adminId: staff.adminId,
          staffId,
          schoolUrl,
          date: today,
          status: 'checked_in',
          timeCheckedIn: now,
          lastActionAt: now,
          latitude,
          longitude
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const securityDashboard = await buildDashboardResponse(staff, dashboard);

    res.status(200).json({
      message: 'Checked In Successful',
      securityDashboard
    });
  } catch (error) {
    next(error);
  }
};

exports.checkOutSecurity = async (req, res, next) => {
  try {
    const { id: staffId } = req.user;
    const schoolUrl = req.headers['x-tenant'];
    const { latitude, longitude } = req.body;

    if (!schoolUrl) {
      return res.status(400).json({ message: 'x-tenant header is required' });
    }

    const staff = await getSecurityStaff(staffId, schoolUrl);
    if (!staff) {
      return res.status(404).json({ message: 'Security staff not found' });
    }

    const today = getToday();
    const existingDashboard = await SecurityDashboardModel.findOne({ staffId, schoolUrl, date: today });

    if (!existingDashboard?.timeCheckedIn) {
      return res.status(400).json({ message: 'Please check in before checking out' });
    }

    if (existingDashboard.timeCheckedOut) {
      return res.status(409).json({ message: 'You have already checked out today' });
    }

    const now = new Date();
    const dashboard = await SecurityDashboardModel.findOneAndUpdate(
      { staffId, schoolUrl, date: today },
      {
        $set: {
          status: 'checked_out',
          timeCheckedOut: now,
          lastActionAt: now,
          latitude,
          longitude
        }
      },
      { new: true }
    );

    const securityDashboard = await buildDashboardResponse(staff, dashboard);

    res.status(200).json({
      message: 'Checked Out Successful',
      securityDashboard
    });
  } catch (error) {
    next(error);
  }
};

exports.getSecurityAnnouncements = async (req, res, next) => {
  try {
    const { id: staffId } = req.user;
    const schoolUrl = req.headers['x-tenant'];
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

    if (!schoolUrl) {
      return res.status(400).json({ message: 'x-tenant header is required' });
    }

    const staff = await getSecurityStaff(staffId, schoolUrl);
    if (!staff) {
      return res.status(404).json({ message: 'Security staff not found' });
    }

    const adminId = staff.adminId;
    const safePage = toSafeInteger(page, 1, 1, 100000);
    const safeLimit = toSafeInteger(limit, 10, 1, 100);
    const offset = (safePage - 1) * safeLimit;
    const userId = staffId;
    const baseWhere = {
      adminId,
      schoolUrl,
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
      message: 'Security announcements retrieved successfully',
      securityAnnouncements: {
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
          const readAt = readMap[announcement._id.toString()] || null;

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
                url: `/api/v1/security-dashboard/announcements/${announcement.id}`
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

exports.markSecurityAnnouncementAsRead = async (req, res, next) => {
  try {
    const { id: staffId } = req.user;
    const schoolUrl = req.headers['x-tenant'];
    const { id: announcementId } = req.params;

    if (!schoolUrl) {
      return res.status(400).json({ message: 'x-tenant header is required' });
    }

    const staff = await getSecurityStaff(staffId, schoolUrl);
    if (!staff) {
      return res.status(404).json({ message: 'Security staff not found' });
    }

    const adminId = staff.adminId;
    const userId = staffId;

    const announcement = await announcementModel.findOne({
      _id: announcementId,
      adminId,
      schoolUrl,
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
        userRole: 'security',
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

exports.getSecuritySettings = async (req, res, next) => {
  try {
    const { id: staffId } = req.user;
    const schoolUrl = req.headers['x-tenant'];

    if (!schoolUrl) {
      return res.status(400).json({ message: 'x-tenant header is required' });
    }

    const staff = await getSecurityStaff(staffId, schoolUrl);
    if (!staff) {
      return res.status(404).json({ message: 'Security staff not found' });
    }

    const latestDashboard = await SecurityDashboardModel.findOne({ staffId, schoolUrl }).sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Security settings retrieved successfully',
      securitySettings: {
        title: 'Settings',
        subtitle: 'Manage your profile and account preferences.',
        profileInformation: {
          firstName: staff.firstName,
          lastName: staff.lastName,
          role: latestDashboard?.roleTitle || 'Security',
          phoneNumber: staff.phoneNumber,
          email: staff.email,
          address: staff.address,
          imageUrl: staff.staffProfileUrl || null,
          uploadHint: latestDashboard?.profileUploadHint || 'PNG, JPG, Max 2MB',
          requiredFields: latestDashboard?.profileSettingsRequiredFields || ['firstName', 'lastName', 'phoneNumber', 'email', 'address'],
          saveAction: {
            label: 'Save Changes',
            method: 'PUT',
            url: '/api/v1/security-dashboard/settings/profile'
          }
        },
        security: {
          title: 'Security',
          changePassword: {
            title: 'Change Password',
            subtitle: 'Update your account password.',
            requiredFields: latestDashboard?.passwordChangeRequiredFields || ['oldPassword', 'newPassword', 'confirmPassword'],
            action: {
              label: 'Change Password',
              method: 'PUT',
              url: '/api/v1/security-dashboard/settings/password'
            }
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSecuritySettingsProfile = async (req, res, next) => {
  try {
    const { id: staffId } = req.user;
    const schoolUrl = req.headers['x-tenant'];
    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      address,
      imageUrl
    } = req.body;

    if (!schoolUrl) {
      return res.status(400).json({ message: 'x-tenant header is required' });
    }

    const staff = await getSecurityStaff(staffId, schoolUrl);
    if (!staff) {
      return res.status(404).json({ message: 'Security staff not found' });
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

    res.status(200).json({
      message: 'Security settings profile updated successfully',
      profile: {
        firstName: staff.firstName,
        lastName: staff.lastName,
        role: 'Security',
        phoneNumber: staff.phoneNumber,
        email: staff.email,
        address: staff.address,
        imageUrl: staff.staffProfileUrl || null
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.changeSecuritySettingsPassword = async (req, res, next) => {
  try {
    const { id: staffId } = req.user;
    const schoolUrl = req.headers['x-tenant'];
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!schoolUrl) {
      return res.status(400).json({ message: 'x-tenant header is required' });
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'oldPassword, newPassword and confirmPassword are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'password does not match' });
    }

    const staff = await getSecurityStaff(staffId, schoolUrl);
    if (!staff) {
      return res.status(404).json({ message: 'Security staff not found' });
    }

    const passwordCorrect = await bcrypt.compare(oldPassword, staff.password || '');
    if (!passwordCorrect) {
      return res.status(400).json({ message: 'incorrect password' });
    }

    const salt = await bcrypt.genSalt(10);
    staff.password = await bcrypt.hash(newPassword, salt);
    await staff.save();

    res.status(200).json({
      message: 'Security password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};
