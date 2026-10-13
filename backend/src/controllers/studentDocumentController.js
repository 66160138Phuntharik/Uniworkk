const supabase = require('../config/supabase');
const { mockDocuments } = require('../data/mockData');

// GET /api/students/:id/documents ดูเอกสารทั้งหมดของนิสิต
const getStudentDocuments = async (req, res) => {
  const studentId = parseInt(req.params.id);

  try {
    const { data: docs, error } = await supabase
      .from('documents')
      .select('*')
      .eq('student_id', studentId)
      .order('is_primary', { ascending: false });

    if (!error && docs && docs.length > 0) {
      const mapped = docs.map((d) => ({
        id: d.id,
        studentId: d.student_id,
        title: d.title,
        type: d.type,
        fileName: d.file_name,
        fileSize: d.file_size || '1.2 MB',
        fileType: d.file_type || 'application/pdf',
        fileUrl: d.file_url || null,
        uploadDate: d.upload_date,
        isPrimary: d.is_primary,
        status: d.status || 'verified',
      }));
      return res.json({ documents: mapped, total: mapped.length });
    }
  } catch (err) {
    console.warn('Supabase getStudentDocuments fallback:', err.message);
  }

  const docs = mockDocuments.filter((d) => d.studentId === studentId);
  res.json({ documents: docs, total: docs.length });
};

// POST /api/students/:id/documents อัพโหลดเอกสาร (Resume หรือ CV)
const uploadStudentDocument = async (req, res) => {
  const studentId = parseInt(req.params.id);
  const { title, type, fileName, fileSize, isPrimary } = req.body;

  if (!title || !fileName) {
    return res.status(400).json({ error: 'Document title and file name are required.' });
  }

  const docType = type === 'cv' ? 'cv' : 'resume';

  try {
    if (isPrimary) {
      await supabase
        .from('documents')
        .update({ is_primary: false })
        .eq('student_id', studentId);
    }

    const { data: maxD } = await supabase
      .from('documents')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextDocId = (maxD?.id || 0) + 1;

    const { data: newDoc, error } = await supabase
      .from('documents')
      .insert({
        id: nextDocId,
        student_id: studentId,
        title: title.trim(),
        type: docType,
        file_name: fileName.trim(),
        file_size: fileSize || '1.4 MB',
        file_type: fileName.endsWith('.pdf') ? 'application/pdf' : 'application/msword',
        is_primary: isPrimary === true,
        status: 'verified',
      })
      .select()
      .maybeSingle();

    if (!error && newDoc) {
      const formatted = {
        id: newDoc.id,
        studentId: newDoc.student_id,
        title: newDoc.title,
        type: newDoc.type,
        fileName: newDoc.file_name,
        fileSize: newDoc.file_size,
        fileType: newDoc.file_type,
        fileUrl: newDoc.file_url,
        uploadDate: newDoc.upload_date,
        isPrimary: newDoc.is_primary,
        status: newDoc.status,
      };
      return res.status(201).json({ message: 'Document uploaded to Supabase successfully.', document: formatted });
    }
  } catch (err) {
    console.warn('Supabase upload fallback:', err.message);
  }

  // Fallback to mock data
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
const deleteStudentDocument = async (req, res) => {
  const studentId = parseInt(req.params.id);
  const docId = parseInt(req.params.docId);

  try {
    const { data: deleted, error } = await supabase
      .from('documents')
      .delete()
      .eq('id', docId)
      .eq('student_id', studentId)
      .select()
      .maybeSingle();

    if (!error && deleted) {
      return res.json({ message: 'Document deleted from Supabase successfully.', document: deleted });
    }
  } catch (err) {
    console.warn('Supabase delete fallback:', err.message);
  }

  const docIdx = mockDocuments.findIndex((d) => d.id === docId && d.studentId === studentId);
  if (docIdx === -1) {
    return res.status(404).json({ error: 'Document not found.' });
  }

  const [removed] = mockDocuments.splice(docIdx, 1);
  res.json({ message: 'Document deleted successfully.', document: removed });
};

// PATCH /api/students/:id/documents/:docId/primary ตั้งค่าเอกสารหลัก
const setPrimaryDocument = async (req, res) => {
  const studentId = parseInt(req.params.id);
  const docId = parseInt(req.params.docId);

  try {
    await supabase
      .from('documents')
      .update({ is_primary: false })
      .eq('student_id', studentId);

    const { data: updated, error } = await supabase
      .from('documents')
      .update({ is_primary: true })
      .eq('id', docId)
      .eq('student_id', studentId)
      .select()
      .maybeSingle();

    if (!error && updated) {
      return res.json({ message: 'Primary document updated in Supabase successfully.', document: updated });
    }
  } catch (err) {
    console.warn('Supabase setPrimary fallback:', err.message);
  }

  const targetDoc = mockDocuments.find((d) => d.id === docId && d.studentId === studentId);
  if (!targetDoc) {
    return res.status(404).json({ error: 'Document not found.' });
  }

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
