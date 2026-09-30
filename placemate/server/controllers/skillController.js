const Skill = require('../models/Skill');
const defaultSkills = require('../data/defaultSkills');

/**
 * Ensure default skills exist in the database.
 * Runs idempotently on first query if collection is empty.
 */
const ensureSkillsSeeded = async () => {
  try {
    const count = await Skill.countDocuments();
    if (count === 0) {
      console.log('Skill library is empty. Seeding default skills...');
      await Skill.insertMany(defaultSkills);
      console.log(`Successfully seeded ${defaultSkills.length} default skills.`);
    }
  } catch (error) {
    console.error('Error ensuring skills are seeded:', error.message);
  }
};

/**
 * GET /api/skills
 * Supports:
 * - ?search=react
 * - ?category=Frontend
 * - ?search=java&category=Programming
 * - ?popular=true
 */
const getSkills = async (req, res) => {
  try {
    await ensureSkillsSeeded();

    const { search, category, popular } = req.query;

    const filter = { active: true };

    if (category && category.trim() && category.toLowerCase() !== 'all') {
      filter.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();
      const searchRegex = new RegExp(searchTerm, 'i');
      filter.$or = [
        { name: searchRegex },
        { aliases: searchRegex },
      ];
    }

    if (popular === 'true' || popular === '1') {
      filter.popularity = { $gte: 85 };
    }

    const skills = await Skill.find(filter)
      .sort({ popularity: -1, name: 1 })
      .lean();

    res.json({
      count: skills.length,
      skills,
    });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({
      message: 'Failed to fetch skills',
      error: error.message,
    });
  }
};

/**
 * Normalizes an array of skill names against the official Skill Library.
 * Matches case-insensitively by name and by known aliases.
 * Returns unique array of canonical skill names.
 */
const canonicalizeSkills = async (skillNames = []) => {
  if (!Array.isArray(skillNames)) return [];

  const rawList = skillNames
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter(Boolean);

  if (rawList.length === 0) return [];

  // Fetch all active skills for matching
  const allLibrarySkills = await Skill.find({ active: true }).lean();

  const canonicalMap = new Map(); // lowercase name/alias -> canonical name

  allLibrarySkills.forEach((skill) => {
    canonicalMap.set(skill.name.toLowerCase(), skill.name);
    if (Array.isArray(skill.aliases)) {
      skill.aliases.forEach((alias) => {
        canonicalMap.set(alias.toLowerCase(), skill.name);
      });
    }
  });

  const resolved = [];
  const seen = new Set();

  rawList.forEach((input) => {
    const key = input.toLowerCase();
    // If found in library or alias, use canonical name; otherwise preserve clean title-case/input
    const canonical = canonicalMap.get(key) || input;
    const lowerCanon = canonical.toLowerCase();

    if (!seen.has(lowerCanon)) {
      seen.add(lowerCanon);
      resolved.push(canonical);
    }
  });

  return resolved;
};

module.exports = {
  getSkills,
  canonicalizeSkills,
  ensureSkillsSeeded,
};
