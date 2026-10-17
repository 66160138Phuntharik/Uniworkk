const supabase = require('../config/supabase');

// GET /api/companies/profile
const getCompanyProfile = async (req, res) => {
  const companyName = req.query.company || req.user?.name;

  try {
    let query = supabase.from('company_profiles').select('*');
    if (companyName) {
      query = query.ilike('company_name', companyName.trim());
    }

    let { data, error } = await query.limit(1).maybeSingle();

    if (error) {
      console.error('Supabase getCompanyProfile error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    if (data) {
      const profile = {
        id: data.id,
        companyName: data.company_name,
        tagline: data.tagline,
        industry: data.industry,
        foundedYear: data.founded_year,
        companySize: data.company_size,
        website: data.website,
        contactEmail: data.contact_email,
        contactPhone: data.contact_phone,
        location: data.location,
        address: data.address,
        description: data.description,
        perks: data.perks || [],
        techStack: data.tech_stack || [],
      };
      return res.json({ profile });
    }

    // Default clean profile if none exists yet
    return res.json({
      profile: {
        companyName: req.user?.name || '',
        tagline: '',
        industry: '',
        foundedYear: '',
        companySize: '',
        website: '',
        contactEmail: req.user?.email || '',
        contactPhone: '',
        location: '',
        address: '',
        description: '',
        perks: [],
        techStack: [],
      },
    });
  } catch (err) {
    console.error('getCompanyProfile error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// PUT /api/companies/profile
const updateCompanyProfile = async (req, res) => {
  try {
    const companyName = req.body.companyName || req.user?.name;

    // Check existing
    let targetId = null;
    const { data: existing } = await supabase
      .from('company_profiles')
      .select('id')
      .ilike('company_name', (companyName || '').trim())
      .maybeSingle();

    if (existing) {
      targetId = existing.id;
    } else {
      const { data: maxC } = await supabase
        .from('company_profiles')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();
      targetId = (maxC?.id || 0) + 1;
    }

    const { data: updated, error } = await supabase
      .from('company_profiles')
      .upsert({
        id: targetId,
        company_name: req.body.companyName,
        tagline: req.body.tagline,
        industry: req.body.industry,
        founded_year: req.body.foundedYear ? parseInt(req.body.foundedYear) : undefined,
        company_size: req.body.companySize,
        website: req.body.website,
        contact_email: req.body.contactEmail,
        contact_phone: req.body.contactPhone,
        location: req.body.location,
        address: req.body.address,
        description: req.body.description,
        perks: req.body.perks || [],
        tech_stack: req.body.techStack || [],
      }, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase updateCompanyProfile error:', error.message);
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      message: 'Company profile updated successfully.',
      profile: {
        id: updated.id,
        companyName: updated.company_name,
        tagline: updated.tagline,
        industry: updated.industry,
        foundedYear: updated.founded_year,
        companySize: updated.company_size,
        website: updated.website,
        contactEmail: updated.contact_email,
        contactPhone: updated.contact_phone,
        location: updated.location,
        address: updated.address,
        description: updated.description,
        perks: updated.perks,
        techStack: updated.tech_stack,
      },
    });
  } catch (err) {
    console.error('updateCompanyProfile error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getCompanyProfile,
  updateCompanyProfile,
};
