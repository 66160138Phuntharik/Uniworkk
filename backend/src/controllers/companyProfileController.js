const supabase = require('../config/supabase');
const { mockCompanyProfiles } = require('../data/mockData');

// GET /api/companies/profile
const getCompanyProfile = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('company_profiles')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (!error && data) {
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
  } catch (err) {
    console.warn('Supabase getCompanyProfile fallback:', err.message);
  }

  const profile = mockCompanyProfiles[0];
  res.json({ profile });
};

// PUT /api/companies/profile
const updateCompanyProfile = async (req, res) => {
  try {
    const { data: updated, error } = await supabase
      .from('company_profiles')
      .update({
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
        perks: req.body.perks,
        tech_stack: req.body.techStack,
      })
      .eq('id', 1)
      .select()
      .maybeSingle();

    if (!error && updated) {
      return res.json({
        message: 'Company profile updated in Supabase successfully.',
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
    }
  } catch (err) {
    console.warn('Supabase updateCompanyProfile fallback:', err.message);
  }

  const profile = mockCompanyProfiles[0];
  Object.assign(profile, req.body);
  res.json({ message: 'Company profile updated successfully.', profile });
};

module.exports = {
  getCompanyProfile,
  updateCompanyProfile,
};
