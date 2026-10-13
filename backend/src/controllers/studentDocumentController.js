const path = require('path');
const fs = require('fs');
const supabase = require('../config/supabase');

// GET /api/students/:id/documents ดูเอกสารทั้งหมดของนิสิต
const getStudentDocuments = async (req, res) => {
  const studentId = parseInt(req.params.id);

  try {
    const { data: docs, error } = await supabase
      .from('documents')
      .select('*')
      .eq('student_id', studentId)
      .order('is_primary', { ascending: false });

    if (error) {
      console.error('Supabase getStudentDocuments error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    const mapped = (docs || []).map((d) => ({
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
  } catch (err) {
    console.error('getStudentDocuments error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// POST /api/students/:id/documents อัพโหลดเอกสารจริง (Resume หรือ CV)
const uploadStudentDocument = async (req, res) => {
  const studentId = parseInt(req.params.id);

  let finalFileName = '';
  let finalFileSize = '1.4 MB';
  let finalFileType = 'application/pdf';
  let finalFileUrl = null;
  let finalTitle = req.body.title ? req.body.title.trim() : '';
  const finalType = req.body.type === 'cv' ? 'cv' : 'resume';
  const isPrimary = req.body.isPrimary === true || req.body.isPrimary === 'true';

  // 1. If real file was uploaded via Multer
  if (req.file) {
    finalFileName = req.file.originalname;
    const bytes = req.file.size;
    if (bytes >= 1024 * 1024) {
      finalFileSize = (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    } else {
      finalFileSize = Math.round(bytes / 1024) + ' KB';
    }
    finalFileType = req.file.mimetype;
    finalFileUrl = `${req.protocol}://${req.get('host')}/uploads/documents/${req.file.filename}`;
    if (!finalTitle) {
      finalTitle = path.basename(req.file.originalname, path.extname(req.file.originalname));
    }
  } else {
    // 2. Fallback to body fields
    finalFileName = req.body.fileName ? req.body.fileName.trim() : '';
    finalFileSize = req.body.fileSize || '1.4 MB';
    finalFileType = req.body.fileType || (finalFileName.endsWith('.pdf') ? 'application/pdf' : 'application/msword');
    finalFileUrl = req.body.fileUrl || null;
  }

  if (!finalTitle || !finalFileName) {
    return res.status(400).json({ error: 'Document title and file are required.' });
  }

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
        title: finalTitle,
        type: finalType,
        file_name: finalFileName,
        file_size: finalFileSize,
        file_type: finalFileType,
        file_url: finalFileUrl,
        is_primary: isPrimary,
        status: 'verified',
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase uploadStudentDocument error:', error);
      return res.status(400).json({ error: error.message });
    }

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
    return res.status(201).json({ message: 'Document uploaded successfully.', document: formatted });
  } catch (err) {
    console.error('uploadStudentDocument error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// DELETE /api/students/:id/documents/:docId ลบเอกสาร
const deleteStudentDocument = async (req, res) => {
  const studentId = parseInt(req.params.id);
  const docId = parseInt(req.params.docId);

  try {
    const { data: targetDoc } = await supabase
      .from('documents')
      .select('*')
      .eq('id', docId)
      .eq('student_id', studentId)
      .maybeSingle();

    if (!targetDoc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    // Try deleting physical file if it exists in local uploads
    if (targetDoc.file_url && targetDoc.file_url.includes('/uploads/documents/')) {
      try {
        const fileNameOnDisk = targetDoc.file_url.split('/uploads/documents/')[1];
        const filePath = path.join(__dirname, '../../uploads/documents', fileNameOnDisk);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileErr) {
        console.warn('Physical file deletion warning:', fileErr.message);
      }
    }

    const { data: deleted, error } = await supabase
      .from('documents')
      .delete()
      .eq('id', docId)
      .eq('student_id', studentId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase deleteStudentDocument error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ message: 'Document deleted successfully.', document: deleted });
  } catch (err) {
    console.error('deleteStudentDocument error:', err.message);
    return res.status(500).json({ error: err.message });
  }
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

    if (error) {
      console.error('Supabase setPrimaryDocument error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    if (!updated) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    return res.json({ message: 'Primary document updated successfully.', document: updated });
  } catch (err) {
    console.error('setPrimaryDocument error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getStudentDocuments,
  uploadStudentDocument,
  deleteStudentDocument,
  setPrimaryDocument,
};
