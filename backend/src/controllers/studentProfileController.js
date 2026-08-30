const { mockStudents, mockProfiles, mockDocuments } = require('../data/mockData');

// GET /api/students/:id/profile ดูโปรไฟล์
const getStudentProfile = (req, res) => {
  const studentId = parseInt(req.params.id);
  const basicInfo = mockStudents.find((s) => s.id === studentId);
  const detailedProfile = mockProfiles.find((p) => p.studentId === studentId);

  if (!basicInfo && !detailedProfile) {
    return res.status(404).json({ error: 'Student profile not found.' });
  }

  const profile = {
    ...(basicInfo || {}),
    ...(detailedProfile || {
      studentId,
      studentCode: '66160138',
      nameEn: basicInfo?.name || 'Student',
      email: basicInfo?.email || 'student@university.edu',
    }),
  };

  const studentDocs = mockDocuments.filter((d) => d.studentId === studentId);
  res.json({ profile, documents: studentDocs });
};

// PUT /api/students/:id/profile แก้ไขโปรไฟล์
const updateStudentProfile = (req, res) => {
  const studentId = parseInt(req.params.id);
  let profileIdx = mockProfiles.findIndex((p) => p.studentId === studentId);

  if (profileIdx === -1) {
    const newProfile = { studentId, ...req.body };
    mockProfiles.push(newProfile);
    return res.json({ message: 'Profile created successfully.', profile: newProfile });
  }

  mockProfiles[profileIdx] = {
    ...mockProfiles[profileIdx],
    ...req.body,
    studentId, // preserve studentId
  };

  // Sync basic info if updated
  const studentIdx = mockStudents.findIndex((s) => s.id === studentId);
  if (studentIdx !== -1) {
    if (req.body.nameEn) mockStudents[studentIdx].name = req.body.nameEn;
    if (req.body.gpa) mockStudents[studentIdx].gpa = req.body.gpa;
    if (req.body.department) mockStudents[studentIdx].major = req.body.department;
  }

  res.json({ message: 'Profile updated successfully.', profile: mockProfiles[profileIdx] });
};

module.exports = {
  getStudentProfile,
  updateStudentProfile,
};
