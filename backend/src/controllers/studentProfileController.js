const supabase = require('../config/supabase');

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

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', studentId)
      .maybeSingle();

    const { data: docs } = await supabase
      .from('documents')
      .select('*')
      .eq('student_id', studentId)
      .order('is_primary', { ascending: false });

    const { data: acceptedApp } = await supabase
      .from('applications')
      .select('company, position')
      .eq('student_id', studentId)
      .eq('status', 'accepted')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (student || profile || user) {
      const finalCompany = student?.company || acceptedApp?.company || null;
      const finalPosition = student?.position || acceptedApp?.position || null;
      const finalStatus = finalCompany ? 'placed' : (student?.status || 'searching');

      const mergedProfile = {
        studentId,
        studentCode: student?.student_code || profile?.student_code || '',
        nameTh: profile?.name_th || student?.name || user?.name || '',
        nameEn: student?.name || profile?.name_en || user?.name || '',
        faculty: student?.faculty || profile?.faculty || 'Faculty of Informatics',
        department: student?.major || profile?.department || user?.major || 'Computer Science',
        year: student?.year || profile?.year || '4th Year',
        gpa: student?.gpa !== undefined && student?.gpa !== null
          ? parseFloat(student.gpa)
          : (profile?.gpa ? parseFloat(profile.gpa) : 3.5),
        email: student?.email || profile?.email || user?.email || '',
        status: finalStatus,
        company: finalCompany,
        position: finalPosition,
      };

      const mappedDocs = (docs || []).map((d) => ({
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
      }));

      return res.json({ profile: mergedProfile, documents: mappedDocs });
    }

    return res.status(404).json({ error: 'Student profile not found.' });
  } catch (err) {
    console.error('getStudentProfile error:', err.message);
    return res.status(500).json({ error: err.message });
  }
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
          student_code: studentCode || '',
          updated_at: new Date().toISOString(),
        })
        .eq('student_id', studentId)
        .select()
        .maybeSingle();
      updatedProfile = data;
    } else {
      const { data: maxP } = await supabase
        .from('student_profiles')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();
      const nextPId = (maxP?.id || 0) + 1;

      const { data } = await supabase
        .from('student_profiles')
        .insert({
          id: nextPId,
          student_id: studentId,
          student_code: studentCode || '',
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
      studentCode: updatedProfile?.student_code || studentCode || '',
      nameTh: updatedProfile?.name_th || nameTh,
      nameEn: nameEn,
      faculty: faculty,
      department: department,
      gpa: parsedGpa || 3.5,
    };

    return res.json({
      message: 'Profile updated successfully.',
      profile: returnProfile,
    });
  } catch (err) {
    console.error('updateStudentProfile error:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getStudentProfile,
  updateStudentProfile,
};
