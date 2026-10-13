const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { mockUsers } = require('../data/mockData');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

const login = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', cleanEmail)
      .eq('password', password)
      .eq('role', role)
      .maybeSingle();

    if (!error && user) {
      let studentDetails = null;
      if (user.role === 'student') {
        const { data: st } = await supabase
          .from('students')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        studentDetails = st;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const { password: _pw, ...safeUser } = user;
      return res.json({
        token,
        user: {
          ...safeUser,
          studentCode: studentDetails?.student_code || null,
          faculty: studentDetails?.faculty || null,
          major: studentDetails?.major || user.major,
        },
      });
    }
  } catch (err) {
    console.warn('Supabase login fallback:', err.message);
  }

  // Fallback to mock data
  const user = mockUsers.find(
    (u) => u.email.toLowerCase() === cleanEmail && u.password === password && u.role === role
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials or incorrect role selected.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  const { password: _pw, ...safeUser } = user;
  res.json({ token, user: safeUser });
};

const register = async (req, res) => {
  const { email, password, role, name, major, faculty, studentCode, nameTh } = req.body;
  if (!email || !password || !role || !name) {
    return res.status(400).json({ error: 'Full name, email, password, and role are required.' });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered. Please sign in instead.' });
    }

    // Safely compute next ID to prevent Postgres sequence desync
    const { data: maxU } = await supabase
      .from('users')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data: maxS } = await supabase
      .from('students')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextId = Math.max(maxU?.id || 0, maxS?.id || 0) + 1;
    const studentCodeFinal = studentCode?.trim() || `66${Math.floor(100000 + Math.random() * 900000)}`;
    const facultyFinal = faculty?.trim() || 'Faculty of Informatics';
    const majorFinal = major?.trim() || 'Computer Science';

    const userPayload = {
      id: nextId,
      email: cleanEmail,
      password,
      role,
      name: name.trim(),
      major: majorFinal,
    };

    const { data: newUser, error: userErr } = await supabase
      .from('users')
      .insert(userPayload)
      .select()
      .maybeSingle();

    if (userErr) {
      console.error('Supabase user insert error:', userErr);
      return res.status(400).json({ error: userErr.message });
    }

    // If role is student, also insert into students and student_profiles
    if (role === 'student') {
      const studentPayload = {
        id: nextId,
        student_code: studentCodeFinal,
        name: name.trim(),
        email: cleanEmail,
        faculty: facultyFinal,
        major: majorFinal,
        year: '4th Year',
        gpa: 3.50,
        status: 'searching',
      };

      const { error: studentErr } = await supabase.from('students').insert(studentPayload);
      if (studentErr) {
        console.error('Supabase student insert error:', studentErr);
      }

      const { data: maxP } = await supabase
        .from('student_profiles')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();
      const nextProfileId = (maxP?.id || 0) + 1;

      const profilePayload = {
        id: nextProfileId,
        student_id: nextId,
        student_code: studentCodeFinal,
        name_th: nameTh?.trim() || name.trim(),
        name_en: name.trim(),
        faculty: facultyFinal,
        department: majorFinal,
        year: '4th Year',
        gpa: 3.50,
        email: cleanEmail,
      };

      const { error: profileErr } = await supabase.from('student_profiles').insert(profilePayload);
      if (profileErr) {
        console.error('Supabase student_profiles insert error:', profileErr);
      }
    } else if (role === 'company') {
      // Create company_profiles entry
      const { data: maxC } = await supabase
        .from('company_profiles')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();
      const nextCompId = (maxC?.id || 0) + 1;

      await supabase.from('company_profiles').insert({
        id: nextCompId,
        company_name: name.trim(),
        industry: majorFinal || 'Technology & Software Development',
        location: 'Bangkok, Thailand',
        contact_email: cleanEmail,
        description: `${name.trim()} partners with universities to offer real-world internship opportunities.`,
        tech_stack: ['JavaScript', 'React', 'Node.js'],
        perks: ['Mentorship Program', 'Flexible Hours', 'Certificate of Completion'],
      });
    }

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _pw, ...safeUser } = newUser;
    return res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: {
        ...safeUser,
        studentCode: studentCodeFinal,
        faculty: facultyFinal,
        department: majorFinal,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { login, register };

