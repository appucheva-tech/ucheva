const Student = require("../models/student");
const Scores = require("../models/scores");
const Admin = require("../models/admin");

exports.getReportCardByAdmissionNumber = async (req, res) => {
  try {

      const schooldomain = req.headers["x-tenant"]
            if(!schooldomain){
                return res.status(404).json({
                    message: 'invalid school domain'
                })
            }

    const { admissionNumber } = req.params;

    const student = await Student.findOne({
      admissionNumber,
      schoolUrl: schooldomain,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }




    const scores = await Scores.find({
      studentId: student._id,
    }).sort({ subject: 1 });


    if (!scores.length) {
      return res.status(404).json({
        success: false,
        message: "No report card found",
      });
    }

    const school = await Admin.findOne({
      schoolUrl: student.schoolUrl,
    });

    const totalCA = scores.reduce(
      (sum, item) => sum + item.continuousAssessment,
      0
    );

    const totalExam = scores.reduce(
      (sum, item) => sum + item.exam,
      0
    );

    const grandTotal = scores.reduce(
      (sum, item) => sum + item.totalScore,
      0
    );

    const averageScore = Number(
      (grandTotal / scores.length).toFixed(2)
    );

    let overallGrade;

    if (averageScore >= 70) overallGrade = "A";
    else if (averageScore >= 60) overallGrade = "B";
    else if (averageScore >= 50) overallGrade = "C";
    else if (averageScore >= 45) overallGrade = "D";
    else overallGrade = "F";

    return res.status(200).json({
      success: true,
      reportCard: {
        school: {
          schoolName: school?.schoolName,
          address: school?.address,
          phoneNumber: school?.phoneNumber,
        },

        student: {
          id: student.id,
          name: `${student.firstName} ${student.lastName} ${student.otherName || ""}`,
          admissionNumber: student.admissionNumber,
          class: student.studentClass,
          gender: student.gender,
          dateOfBirth: student.dateOfBirth,
          session: student.session,
        },

        summary: {
          totalCA,
          totalExam,
          grandTotal,
          averageScore,
          overallGrade,
        },

        subjects: scores.map((item) => ({
          subject: item.subject,
          continuousAssessment: item.continuousAssessment,
          exam: item.exam,
          totalScore: item.totalScore,
          grade:
            item.totalScore >= 70
              ? "A"
              : item.totalScore >= 60
              ? "B"
              : item.totalScore >= 50
              ? "C"
              : item.totalScore >= 45
              ? "D"
              : "F",
        })),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};