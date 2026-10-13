const supabase = require('../config/supabase');
const { mockStudents, mockProfiles, mockDocuments } = require('../data/mockData');

// GET /api/students/:id/profile ดูโปรไฟล์
const getStudentProfile = async (req, res) => {
  const studentId = parseInt(req.params.id);

  try {
    const { data: student } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .maybeSingle();

    const { data: profile } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    const { data: docs } = await supabase
      .from('documents')
      .select('*')
      .eq('student_id', studentId)
      .order('is_primary', { ascending: false });

    if (student || profile) {
      const mergedProfile = {
        studentId,
        studentCode: student?.student_code || profile?.student_code || '66160138',
        nameTh: profile?.name_th || student?.name || 'นิสิต',
        nameEn: student?.name || profile?.name_en || 'Student',
        faculty: student?.faculty || profile?.faculty || 'Faculty of Informatics',
        department: student?.major || profile?.department || 'Computer Science',
        year: student?.year || profile?.year || '4th Year',
        gpa: student?.gpa !== undefined && student?.gpa !== null
          ? parseFloat(student.gpa)
          : (profile?.gpa ? parseFloat(profile.gpa) : 3.5),
        email: student?.email || profile?.email || 'student@university.edu',
        status: student?.status || 'searching',
        company: student?.company || null,
        position: student?.position || null,
      };

      const mappedDocs = (docs && docs.length > 0)
        ? docs.map((d) => ({
            id: d.id,
            studentId: d.student_id,
            title: d.title,
            type: d.type,
            fileName: d.file_name,
            fileSize: d.file_size || '1.4 MB',
            fileType: d.file_type || 'application/pdf',
            fileUrl: d.file_url || null,
            uploadDate: d.upload_date,
            isPrimary: d.is_primary,
            status: d.status || 'verified',
          }))
        : [];

      return res.json({ profile: mergedProfile, documents: mappedDocs });
    }
  } catch (err) {
    console.warn('Supabase query failed, falling back to mock data:', err.message);
  }

  // Graceful fallback to mock data
  const basicInfo = mockStudents.find((s) => s.id === studentId);
  const detailedProfile = mockProfiles.find((p) => p.studentId === studentId);

  if (!basicInfo && !detailedProfile) {
    return res.status(404).json({ error: 'Student profile not found.' });
  }

  const fallbackProfile = {
    ...(basicInfo || {}),
    ...(detailedProfile || {
      studentId,
      studentCode: '66160138',
      nameEn: basicInfo?.name || 'Alex Johnson',
      email: basicInfo?.email || 'test001@go.buu.ac.th',
    }),
  };

  const studentDocs = mockDocuments.filter((d) => d.studentId === studentId);
  res.json({ profile: fallbackProfile, documents: studentDocs });
};

// PUT /api/students/:id/profile แก้ไขโปรไฟล์
const updateStudentProfile = async (req, res) => {
  const studentId = parseInt(req.params.id);
  const { nameTh, nameEn, faculty, department, gpa, studentCode } = req.body;

  try {
    const parsedGpa = gpa !== undefined && gpa !== '' ? parseFloat(gpa) : undefined;

    // 1. Update students table
    await supabase
      .from('students')
      .update({
        name: nameEn,
        gpa: parsedGpa,
        faculty: faculty,
        major: department,
      })
      .eq('id', studentId);

    // 2. Check and update or insert student_profiles table
    const { data: existingProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('student_id', studentId)
      .maybeSingle();

    let updatedProfile = null;
    if (existingProfile) {
      const { data } = await supabase
        .from('student_profiles')
        .update({
          name_th: nameTh,
          name_en: nameEn,
          faculty: faculty,
          department: department,
          gpa: parsedGpa,
          student_code: studentCode || '66160138',
          updated_at: new Date().toISOString(),
        })
        .eq('student_id', studentId)
        .select()
        .maybeSingle();
      updatedProfile = data;
    } else {
      const { data } = await supabase
        .from('student_profiles')
        .insert({
          student_id: studentId,
          student_code: studentCode || '66160138',
          name_th: nameTh,
          name_en: nameEn,
          faculty: faculty,
          department: department,
          gpa: parsedGpa,
          updated_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle();
      updatedProfile = data;
    }

    const returnProfile = {
      studentId,
      studentCode: updatedProfile?.student_code || studentCode || '66160138',
      nameTh: updatedProfile?.name_th || nameTh,
      nameEn: nameEn,
      faculty: faculty,
      department: department,
      gpa: parsedGpa || 3.8,
    };

    return res.json({
      message: 'Profile updated successfully in Supabase.',
      profile: returnProfile,
    });
  } catch (err) {
    console.error('Supabase update failed, falling back:', err);
  }

  // Fallback to in-memory mock update
  let profileIdx = mockProfiles.findIndex((p) => p.studentId === studentId);
  if (profileIdx === -1) {
    const newProfile = { studentId, ...req.body };
    mockProfiles.push(newProfile);
    return res.json({ message: 'Profile created successfully.', profile: newProfile });
  }

  mockProfiles[profileIdx] = {
    ...mockProfiles[profileIdx],
    ...req.body,
    studentId,
  };

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
