const { mockCompanyProfiles } = require('../data/mockData');

// GET /api/companies/profile
const getCompanyProfile = (req, res) => {
  const targetCompanyId = req.user?.id || 2;
  let profile = mockCompanyProfiles.find(
    (p) => p.companyId === targetCompanyId
  );
  if (!profile) {
    profile = mockCompanyProfiles[0];
  }
  res.json({ profile });
};

// PUT /api/companies/profile
const updateCompanyProfile = (req, res) => {
  const targetCompanyId = req.user?.id || 2;
  let profile = mockCompanyProfiles.find(
    (p) => p.companyId === targetCompanyId
  );
  if (!profile) {
    profile = mockCompanyProfiles[0];
  }

  const updatableFields = [
    'companyName',
    'tagline',
    'industry',
    'foundedYear',
    'companySize',
    'website',
    'contactEmail',
    'contactPhone',
    'location',
    'address',
    'description',
    'perks',
    'techStack',
  ];

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      profile[field] = req.body[field];
    }
  });

  res.json({ message: 'Company profile updated successfully.', profile });
};

module.exports = {
  getCompanyProfile,
  updateCompanyProfile,
};
