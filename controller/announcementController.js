const announcementModel = require('../models/announcement');
const adminModel = require('../models/admin');
const { Op } = require('sequelize');

const statusTabs = {
  all: null,
  drafts: 'draft',
  scheduled: 'scheduled',
  template: 'template',
  sent: 'sent'
};

const toSafeInteger = (value, fallback, min, max) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

const getAnnouncementDisplayDate = (announcement) => {
  return announcement.sentAt || announcement.scheduledAt || announcement.createdAt;
};

const formatTime = (date) => {
  if (!date) return null;
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date(date));
};

exports.createAnnouncement = async (req, res, next) => {
  try {
    const { id: adminId } = req.user;
    const {
      title,
      content,
      audience = 'all',
      status = 'draft',
      scheduledAt
    } = req.body;

    const admin = await adminModel.findByPk(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    if (!['staff', 'parents', 'all'].includes(audience)) {
      return res.status(400).json({ message: 'Audience must be staff, parents, or all' });
    }

    if (!['draft', 'scheduled', 'template', 'sent'].includes(status)) {
      return res.status(400).json({ message: 'Status must be draft, scheduled, template, or sent' });
    }

    if (status === 'scheduled' && !scheduledAt) {
      return res.status(400).json({ message: 'Scheduled date is required for scheduled announcements' });
    }

    const announcement = await announcementModel.create({
      adminId,
      schoolUrl: admin.schoolUrl,
      title,
      content,
      audience,
      status,
      scheduledAt: scheduledAt || null,
      sentAt: status === 'sent' ? new Date() : null
    });

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement
    });
  } catch (error) {
    next(error);
  }
};

exports.getAnnouncementDashboard = async (req, res, next) => {
  try {
    const { id: adminId } = req.user;
    const {
      tab = 'all',
      search,
      page = 1,
      limit = 10
    } = req.query;

    const admin = await adminModel.findByPk(adminId, {
      attributes: ['id', 'schoolName', 'schoolUrl']
    });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const safePage = toSafeInteger(page, 1, 1, 100000);
    const safeLimit = toSafeInteger(limit, 10, 1, 100);
    const offset = (safePage - 1) * safeLimit;
    const selectedStatus = statusTabs[String(tab).toLowerCase()] ?? null;
    const whereClause = { adminId };

    if (selectedStatus) {
      whereClause.status = selectedStatus;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }

    const [
      draftCount,
      scheduledCount,
      templateCount,
      sentCount,
      announcementResult
    ] = await Promise.all([
      announcementModel.count({ where: { adminId, status: 'draft' } }),
      announcementModel.count({ where: { adminId, status: 'scheduled' } }),
      announcementModel.count({ where: { adminId, status: 'template' } }),
      announcementModel.count({ where: { adminId, status: 'sent' } }),
      announcementModel.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: safeLimit,
        offset
      })
    ]);

    const announcements = announcementResult.rows.map((announcement) => {
      const record = announcement.toJSON();
      const displayDate = getAnnouncementDisplayDate(record);

      return {
        ...record,
        displayDate,
        displayTime: formatTime(displayDate),
        actions: {
          canEdit: record.status !== 'sent',
          canSend: ['draft', 'scheduled'].includes(record.status),
          canReuse: ['template', 'sent'].includes(record.status)
        }
      };
    });

    res.status(200).json({
      message: 'Announcement dashboard retrieved successfully',
      announcementDashboard: {
        title: 'Announcements',
        subtitle: 'Create and manage messages for staff and parents.',
        createAction: {
          label: 'Create Announcement',
          method: 'POST',
          url: '/api/v1/announcement'
        },
        activeTab: tab,
        search: search || '',
        cards: {
          draft: {
            value: draftCount,
            subtitle: 'Not yet sent'
          },
          scheduled: {
            value: scheduledCount,
            subtitle: 'Upcoming messages'
          },
          templates: {
            value: templateCount,
            subtitle: 'Reusable Messages'
          },
          sent: {
            value: sentCount,
            subtitle: 'Sent successfully'
          }
        },
        tabs: ['all', 'drafts', 'scheduled', 'template', 'sent'],
        announcements,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total: announcementResult.count,
          totalPages: Math.ceil(announcementResult.count / safeLimit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAnnouncementByPk = async(req,res,next) =>{
    const {id} = req.user;
    const announceId = req.params.id

    const getAnnouncement = await announcementModel.findByPk(announceId)

    if (!getAnnouncement){
      return res.status(404).json({
        message: 'announcement does not exist'
      })
    }

    res.status(200).json({
      message: 'announcement retrieved successfully',
      getAnnouncement
    })
}

exports.getAllAnnouncement = async(req,res,next)=>{
  try {
    const {id} = req.user;
    const getAll = await announcementModel.findAll({where: {adminId: id}})

    res.status(200).json({
      message: 'all announcement retrieved successfully',
      getAll
    })

  } catch (error) {
    next(error)
  }
}

exports.updateAnnoucement = async(req,res,next)=>{
 try {
   const {id} = req.user;
    const announceId = req.params.id
    const {title, content, audience, status, scheduledAt} = req.body
    const updateAnnouncement = await announcementModel.update({title, content, audience, status, scheduledAt}, {where: {id: announceId}}) 

    if(!updateAnnouncement){
      return res.status(404).json({
        message: 'announcement not found'
      })
    };

    

 } catch (error) {
    next(error)
 }
}


exports.deleteAnnouncement = async(req,res,next)=>{
  try {
    const {id} = req.params
    const getAnnouncement = await announcementModel.destroy({where: {id}})

    if(!getAnnouncement){
      return res.status(404).json({
        message: 'announcement not found'
      })
    }

    res.status(200).json({
      message: 'announcement deleted successfully',
    })

  } catch (error) {
    next(error)
  }
}
