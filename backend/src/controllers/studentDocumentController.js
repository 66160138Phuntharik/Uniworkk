const { mockDocuments } = require('../data/mockData');

// GET /api/students/:id/documents ดูเอกสารทั้งหมดของนิสิต
const getStudentDocuments = (req, res) => {
  const studentId = parseInt(req.params.id);
  const docs = mockDocuments.filter((d) => d.studentId === studentId);
  res.json({ documents: docs, total: docs.length });
};

// POST /api/students/:id/documents อัพโหลดเอกสาร (Resume หรือ CV)
const uploadStudentDocument = (req, res) => {
  const studentId = parseInt(req.params.id);
  const { title, type, fileName, fileSize, isPrimary } = req.body;

  if (!title || !fileName) {
    return res.status(400).json({ error: 'Document title and file name are required.' });
  }

  // ประเภทเอกสาร (จำกัดเฉพาะ Resume หรือ CV)
  const docType = type === 'cv' ? 'cv' : 'resume';

  // ถ้าตั้งเป็นเอกสารหลัก ให้ยกเลิกเอกสารหลักเดิมของนิสิตคนนี้
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

// DELETE /api/students/:id/documents/:docId ลบเอกสาร
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

// PATCH /api/students/:id/documents/:docId/primary ตั้งค่าเอกสารหลัก
const setPrimaryDocument = (req, res) => {
  const studentId = parseInt(req.params.id);
  const docId = parseInt(req.params.docId);

  const targetDoc = mockDocuments.find((d) => d.id === docId && d.studentId === studentId);
  if (!targetDoc) {
    return res.status(404).json({ error: 'Document not found.' });
  }

  // ยกเลิกการตั้งค่าเอกสารหลักเดิม
  mockDocuments.forEach((d) => {
    if (d.studentId === studentId) {
      d.isPrimary = false;
    }
  });

  targetDoc.isPrimary = true;
  res.json({ message: 'Primary document updated successfully.', document: targetDoc });
};

module.exports = {
  getStudentDocuments,
  uploadStudentDocument,
  deleteStudentDocument,
  setPrimaryDocument,
};
