const GRADE_KEY = [
  { min: 70, max: 100, grade: 'A', remark: 'Excellent' },
  { min: 60, max: 69, grade: 'B', remark: 'Very Good' },
  { min: 50, max: 59, grade: 'C', remark: 'Good' },
  { min: 45, max: 49, grade: 'D', remark: 'Fair' },
  { min: 0, max: 44, grade: 'E', remark: 'Needs Improvement' },
];

const getGrade = (score) => {
  const numericScore = Number(score) || 0;
  const match = GRADE_KEY.find((g) => numericScore >= g.min && numericScore <= g.max);
  // Fallback protects against unexpected values (e.g. negative or >100 due to bad input)
  return match || GRADE_KEY[GRADE_KEY.length - 1];
};

module.exports = { GRADE_KEY, getGrade };