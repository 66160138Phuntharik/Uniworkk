const mockStudents = [
  {
    id: 1,
    name: 'test001 eiei',
    major: 'Computer Science',
    email: 'test001@go.buu.ac.th',
    gpa: 3.8,
    status: 'placed',
    company: 'TechNova Solutions',
    position: 'Frontend Developer Intern',
    startDate: '2026-06-01',
  },
  {
    id: 2,
    name: 'test002 eiei',
    major: 'Data Science',
    email: 'test002@go.buu.ac.th',
    gpa: 3.6,
    status: 'interviewing',
    company: 'DataRock',
    position: 'Data Analyst Intern',
    startDate: null,
  },
  {
    id: 3,
    name: 'test003 eiei',
    major: 'Information Technology',
    email: 'test003@go.buu.ac.th',
    gpa: 3.2,
    status: 'searching',
    company: null,
    position: null,
    startDate: null,
  },
];

const mockApplications = [
  { id: 1, studentId: 1, company: 'TechNova Solutions', position: 'Frontend Developer Intern', date: '2026-05-15', status: 'accepted' },
  { id: 2, studentId: 1, company: 'DataRock', position: 'Web Developer (Node.js)', date: '2026-05-12', status: 'interviewing' },
  { id: 3, studentId: 1, company: 'CloudScale Tech', position: 'Fullstack Intern', date: '2026-05-10', status: 'reviewing' },
  { id: 4, studentId: 2, company: 'DataRock', position: 'Data Analyst Intern', date: '2026-05-08', status: 'interviewing' },
];

let mockProfiles = [
  {
    studentId: 1,
    studentCode: '66160138',
    nameTh: 'ภูริทัต บุญส่ง',
    nameEn: 'Alex Johnson',
    faculty: 'Faculty of Informatics',
    department: 'Computer Science',
    year: '4th Year',
    gpa: 3.8,
    email: 'test001@go.buu.ac.th',
  },
];

let mockDocuments = [
  {
    id: 1,
    studentId: 1,
    title: 'Alex Johnson - Software Engineer Resume (2026)',
    type: 'resume',
    fileName: 'Alex_Johnson_Resume_2026.pdf',
    fileSize: '1.2 MB',
    fileType: 'application/pdf',
    uploadDate: '2026-05-10',
    isPrimary: true,
    status: 'verified',
  },
  {
    id: 2,
    studentId: 1,
    title: 'Alex Johnson - Academic & Professional CV',
    type: 'cv',
    fileName: 'Alex_Johnson_CV_Academic.pdf',
    fileSize: '1.8 MB',
    fileType: 'application/pdf',
    uploadDate: '2026-05-02',
    isPrimary: false,
    status: 'verified',
  },
];

// api getstudent ทั้งหมด
const getStudents = (req, res) => {
  res.json({ students: mockStudents, total: mockStudents.length });
};

// ตาม id รายคน
const getStudentById = (req, res) => {
  const student = mockStudents.find((s) => s.id === parseInt(req.params.id));
  if (!student) return res.status(404).json({ error: 'Student not found.' });
  res.json(student);
};

// getapp ของแต่ละคน
const getApplications = (req, res) => {
  const apps = mockApplications.filter((a) => a.studentId === parseInt(req.params.id));
  res.json({ applications: apps, total: apps.length });
};

// POST รายงานของแต่ละคน
const submitReport = (req, res) => {
  const { week, content, highlights, challenges } = req.body;
  if (!week || !content) {
    return res.status(400).json({ error: 'Week number and content are required.' });
  }
  res.status(201).json({
    message: `Weekly report for Week ${week} submitted successfully.`,
    data: { week, content, highlights, challenges, studentId: req.params.id, submittedAt: new Date().toISOString() },
  });
};

// api/students/:id/profile ดูโปรไฟล์
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

// api/students/:id/profile แก้ไขโปรไฟล์
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

// api/students/:id/documents ดูเอกสาร
const getStudentDocuments = (req, res) => {
  const studentId = parseInt(req.params.id);
  const docs = mockDocuments.filter((d) => d.studentId === studentId);
  res.json({ documents: docs, total: docs.length });
};

// api/students/:id/documents อัพโหลดเอกสาร --------------------
const uploadStudentDocument = (req, res) => {
  const studentId = parseInt(req.params.id);
  const { title, type, fileName, fileSize, isPrimary } = req.body;

  if (!title || !fileName) {
    return res.status(400).json({ error: 'Document title and file name are required.' });
  }

  // ประเภทเอกสาร
  const docType = type === 'cv' ? 'cv' : 'resume';

  // ถ้าเป็นเอกสารหลัก
  if (isPrimary) {
    mockDocuments.forEach((doc) => {
      if (doc.studentId === studentId) {
        doc.isPrimary = false;
      }
    });
  }

  const newDoc = {
    id: mockDocuments.length ? Math.max(...mockDocuments.map((d) => d.id)) + 1 : 1,
    studentId,
    title,
    type: docType,
    fileName,
    fileSize: fileSize || '1.2 MB',
    fileType: fileName.endsWith('.pdf') ? 'application/pdf' : 'application/msword',
    uploadDate: new Date().toISOString().split('T')[0],
    isPrimary: isPrimary === true,
    status: 'verified',
  };

  mockDocuments.push(newDoc);
  res.status(201).json({ message: 'Document uploaded successfully.', document: newDoc });
};

// api/students/:id/documents/:docId ลบเอกสาร
const deleteStudentDocument = (req, res) => {
  const studentId = parseInt(req.params.id);
  const docId = parseInt(req.params.docId);

  const docIdx = mockDocuments.findIndex((d) => d.id === docId && d.studentId === studentId);
  if (docIdx === -1) {
    return res.status(404).json({ error: 'Document not found.' });
  }

  const [removed] = mockDocuments.splice(docIdx, 1);
  res.json({ message: 'Document deleted successfully.', document: removed });
};

// api/students/:id/documents/:docId/primary ตั้งค่าเอกสารหลัก
const setPrimaryDocument = (req, res) => {
  const studentId = parseInt(req.params.id);
  const docId = parseInt(req.params.docId);

  const targetDoc = mockDocuments.find((d) => d.id === docId && d.studentId === studentId);
  if (!targetDoc) {
    return res.status(404).json({ error: 'Document not found.' });
  }

  // ยกเลิกการตั้งค่าเอกสารหลัก
  mockDocuments.forEach((d) => {
    if (d.studentId === studentId) {
      d.isPrimary = false;
    }
  });

  targetDoc.isPrimary = true;
  res.json({ message: 'Primary document updated successfully.', document: targetDoc });
};

module.exports = {
  getStudents,
  getStudentById,
  getApplications,
  submitReport,
  getStudentProfile,
  updateStudentProfile,
  getStudentDocuments,
  uploadStudentDocument,
  deleteStudentDocument,
  setPrimaryDocument,
};
