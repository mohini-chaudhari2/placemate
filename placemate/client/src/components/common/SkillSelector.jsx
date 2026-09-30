import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './SkillSelector.css';

// Built-in resilient fallback skill set
const FALLBACK_CATEGORIES = [
  'All',
  'Programming',
  'Frontend',
  'Backend',
  'Database',
  'AI & Machine Learning',
  'Data Science',
  'Cloud & DevOps',
  'Mobile',
  'Testing',
  'Soft Skills',
];

const POPULAR_SKILLS = [
  'React',
  'Python',
  'JavaScript',
  'Java',
  'SQL',
  'MongoDB',
  'Node.js',
  'AWS',
  'Docker',
  'Git',
  'Problem Solving',
  'Communication',
];

const DEFAULT_SKILLS = [
  // Programming
  { name: 'C', category: 'Programming', aliases: ['c lang'] },
  { name: 'C++', category: 'Programming', aliases: ['cpp'] },
  { name: 'C#', category: 'Programming', aliases: ['csharp'] },
  { name: 'Java', category: 'Programming', aliases: ['core java'] },
  { name: 'Python', category: 'Programming', aliases: ['py'] },
  { name: 'JavaScript', category: 'Programming', aliases: ['js', 'es6'] },
  { name: 'TypeScript', category: 'Programming', aliases: ['ts'] },
  { name: 'Go', category: 'Programming', aliases: ['golang'] },
  { name: 'Rust', category: 'Programming', aliases: ['rustlang'] },
  { name: 'PHP', category: 'Programming' },
  { name: 'Ruby', category: 'Programming' },
  { name: 'Kotlin', category: 'Programming' },
  { name: 'Swift', category: 'Programming' },

  // Frontend
  { name: 'HTML', category: 'Frontend' },
  { name: 'CSS', category: 'Frontend' },
  { name: 'React', category: 'Frontend', aliases: ['reactjs', 'react.js'] },
  { name: 'Angular', category: 'Frontend', aliases: ['angularjs'] },
  { name: 'Vue', category: 'Frontend', aliases: ['vuejs'] },
  { name: 'Next.js', category: 'Frontend', aliases: ['nextjs'] },
  { name: 'Tailwind CSS', category: 'Frontend', aliases: ['tailwind'] },
  { name: 'Bootstrap', category: 'Frontend' },

  // Backend
  { name: 'Node.js', category: 'Backend', aliases: ['nodejs'] },
  { name: 'Express.js', category: 'Backend', aliases: ['express'] },
  { name: 'Django', category: 'Backend' },
  { name: 'Flask', category: 'Backend' },
  { name: 'Spring Boot', category: 'Backend', aliases: ['springboot'] },
  { name: '.NET', category: 'Backend', aliases: ['dotnet'] },
  { name: 'REST API', category: 'Backend' },
  { name: 'GraphQL', category: 'Backend' },

  // Database
  { name: 'SQL', category: 'Database' },
  { name: 'MySQL', category: 'Database' },
  { name: 'PostgreSQL', category: 'Database', aliases: ['postgres'] },
  { name: 'MongoDB', category: 'Database', aliases: ['mongo'] },
  { name: 'Redis', category: 'Database' },
  { name: 'Firebase', category: 'Database' },

  // AI & ML
  { name: 'Machine Learning', category: 'AI & Machine Learning', aliases: ['ml'] },
  { name: 'Deep Learning', category: 'AI & Machine Learning' },
  { name: 'TensorFlow', category: 'AI & Machine Learning' },
  { name: 'PyTorch', category: 'AI & Machine Learning' },
  { name: 'NLP', category: 'AI & Machine Learning' },
  { name: 'Computer Vision', category: 'AI & Machine Learning' },
  { name: 'Generative AI', category: 'AI & Machine Learning', aliases: ['genai', 'llm'] },

  // Data Science
  { name: 'Data Analysis', category: 'Data Science' },
  { name: 'Pandas', category: 'Data Science' },
  { name: 'NumPy', category: 'Data Science' },
  { name: 'Power BI', category: 'Data Science' },
  { name: 'Tableau', category: 'Data Science' },
  { name: 'Excel', category: 'Data Science' },
  { name: 'Statistics', category: 'Data Science' },

  // Cloud & DevOps
  { name: 'AWS', category: 'Cloud & DevOps' },
  { name: 'Azure', category: 'Cloud & DevOps' },
  { name: 'Google Cloud', category: 'Cloud & DevOps', aliases: ['gcp'] },
  { name: 'Docker', category: 'Cloud & DevOps' },
  { name: 'Kubernetes', category: 'Cloud & DevOps', aliases: ['k8s'] },
  { name: 'Git', category: 'Cloud & DevOps' },
  { name: 'GitHub', category: 'Cloud & DevOps' },
  { name: 'GitLab', category: 'Cloud & DevOps' },
  { name: 'CI/CD', category: 'Cloud & DevOps' },

  // Mobile
  { name: 'React Native', category: 'Mobile' },
  { name: 'Flutter', category: 'Mobile' },
  { name: 'Android Development', category: 'Mobile' },
  { name: 'iOS Development', category: 'Mobile' },

  // Testing
  { name: 'Manual Testing', category: 'Testing' },
  { name: 'Automation Testing', category: 'Testing' },
  { name: 'Selenium', category: 'Testing' },
  { name: 'Jest', category: 'Testing' },
  { name: 'Cypress', category: 'Testing' },
  { name: 'Postman', category: 'Testing' },

  // Soft Skills
  { name: 'Communication', category: 'Soft Skills' },
  { name: 'Leadership', category: 'Soft Skills' },
  { name: 'Teamwork', category: 'Soft Skills' },
  { name: 'Problem Solving', category: 'Soft Skills' },
  { name: 'Time Management', category: 'Soft Skills' },
  { name: 'Presentation', category: 'Soft Skills' },
  { name: 'Critical Thinking', category: 'Soft Skills' },
];

function SkillSelector({
  selectedSkills = [],
  onChange,
  allowCustom = true,
  maxSkills = 50,
}) {
  const [librarySkills, setLibrarySkills] = useState(DEFAULT_SKILLS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [customSkill, setCustomSkill] = useState('');
  const [customError, setCustomError] = useState('');
  const { toast } = useToast();

  // Fetch official skill library from API
  useEffect(() => {
    let isMounted = true;
    const fetchSkillLibrary = async () => {
      try {
        setLoading(true);
        const response = await api.get('/skills');
        if (isMounted && response.data?.skills?.length > 0) {
          setLibrarySkills(response.data.skills);
        }
      } catch (err) {
        console.warn('Could not load skills from backend, using fallback library:', err.message);
        // Fallback is already initialized in state
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSkillLibrary();
    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to check if a skill is selected (case-insensitive)
  const isSkillSelected = (skillName) => {
    const target = skillName.trim().toLowerCase();
    return (selectedSkills || []).some(
      (s) => String(s).trim().toLowerCase() === target
    );
  };

  // Toggle selection
  const toggleSkill = (skillName) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;

    if (isSkillSelected(trimmed)) {
      const updated = (selectedSkills || []).filter(
        (s) => String(s).trim().toLowerCase() !== trimmed.toLowerCase()
      );
      onChange?.(updated);
    } else {
      if ((selectedSkills || []).length >= maxSkills) {
        toast.warning(`You can select at most ${maxSkills} skills.`);
        return;
      }
      onChange?.([...(selectedSkills || []), trimmed]);
    }
  };

  // Remove a specific selected skill
  const removeSkill = (skillName) => {
    const updated = (selectedSkills || []).filter(
      (s) => String(s).trim().toLowerCase() !== skillName.trim().toLowerCase()
    );
    onChange?.(updated);
  };

  // Clear all
  const clearAll = () => {
    onChange?.([]);
  };

  // Add custom skill
  const handleAddCustom = (e) => {
    e?.preventDefault();
    const clean = customSkill.trim();
    if (!clean) return;

    if (isSkillSelected(clean)) {
      setCustomError('This skill is already in your selected list.');
      return;
    }

    if ((selectedSkills || []).length >= maxSkills) {
      setCustomError(`Maximum limit of ${maxSkills} skills reached.`);
      return;
    }

    // Check if this skill exists in library with canonical casing
    const libraryMatch = librarySkills.find(
      (s) => s.name.toLowerCase() === clean.toLowerCase()
    );

    const canonicalName = libraryMatch ? libraryMatch.name : clean;

    onChange?.([...(selectedSkills || []), canonicalName]);
    setCustomSkill('');
    setCustomError('');
  };

  // Categories list derived from library
  const categories = useMemo(() => {
    const set = new Set();
    librarySkills.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ['All', ...Array.from(set)];
  }, [librarySkills]);

  // Filter skills by category & search term
  const filteredSkills = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return librarySkills.filter((item) => {
      // Category match
      if (selectedCategory !== 'All') {
        if (
          !item.category ||
          item.category.toLowerCase() !== selectedCategory.toLowerCase()
        ) {
          return false;
        }
      }

      // Search match
      if (search) {
        const nameMatch = item.name.toLowerCase().includes(search);
        const aliasMatch = Array.isArray(item.aliases)
          ? item.aliases.some((a) => a.toLowerCase().includes(search))
          : false;
        if (!nameMatch && !aliasMatch) return false;
      }

      return true;
    });
  }, [librarySkills, selectedCategory, searchTerm]);

  return (
    <div className="skill-selector">
      {/* 1. Search Bar */}
      <div className="skill-search-wrapper">
        <span className="skill-search-icon" aria-hidden="true">
          🔍
        </span>
        <input
          type="text"
          className="skill-search-input"
          placeholder="Search skills by name (e.g. React, Python, Docker)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            className="skill-search-clear"
            onClick={() => setSearchTerm('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* 2. Popular Skills Row */}
      <div className="skill-popular-section">
        <div className="skill-popular-title">
          <span>⚡ Popular Skills</span>
        </div>
        <div className="skill-popular-chips">
          {POPULAR_SKILLS.map((skillName) => {
            const selected = isSkillSelected(skillName);
            return (
              <button
                key={skillName}
                type="button"
                className={`popular-chip ${selected ? 'is-selected' : ''}`}
                onClick={() => toggleSkill(skillName)}
              >
                <span className="popular-chip-check">
                  {selected ? '✓' : '+'}
                </span>
                {skillName}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="skill-category-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`skill-category-tab ${
              selectedCategory === cat ? 'active' : ''
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 4. Selected Skills Section */}
      <div className="skill-selected-section">
        <div className="skill-selected-header">
          <div className="skill-selected-heading">
            <span>Selected Skills</span>
            <span className="skill-selected-count">
              {selectedSkills.length}
            </span>
          </div>
          {selectedSkills.length > 0 && (
            <button
              type="button"
              className="skill-clear-all-btn"
              onClick={clearAll}
            >
              Clear All
            </button>
          )}
        </div>

        <div className="skill-selected-chips">
          {selectedSkills.length === 0 ? (
            <span className="skill-empty-selection">
              No skills selected yet. Choose from the library below or search for specific skills.
            </span>
          ) : (
            selectedSkills.map((skill) => (
              <span key={skill} className="selected-skill-chip">
                <span>{skill}</span>
                <button
                  type="button"
                  className="selected-skill-chip-remove"
                  onClick={() => removeSkill(skill)}
                  aria-label={`Remove ${skill}`}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* 5. Available Skills Grid */}
      {loading ? (
        <div className="skill-loading-box">
          <div className="skill-spinner" />
          <p>Loading skill library...</p>
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="skill-empty-box">
          <p>No matching skills found in "{selectedCategory}".</p>
          {allowCustom && searchTerm.trim() && (
            <button
              type="button"
              className="skill-custom-btn"
              onClick={() => handleAddCustom({ preventDefault: () => {} })}
            >
              + Add "{searchTerm.trim()}" as custom skill
            </button>
          )}
        </div>
      ) : (
        <div className="skill-library-grid">
          {filteredSkills.map((item) => {
            const isSelected = isSkillSelected(item.name);
            return (
              <button
                key={item.name}
                type="button"
                className={`skill-item-card ${isSelected ? 'is-active' : ''}`}
                onClick={() => toggleSkill(item.name)}
                aria-pressed={isSelected}
              >
                <div className="skill-item-info">
                  <span className="skill-item-name">{item.name}</span>
                  {item.category && (
                    <span className="skill-item-category">
                      {item.category}
                    </span>
                  )}
                </div>
                <div className="skill-item-checkbox">
                  {isSelected ? '✓' : ''}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 6. Optional Custom Skill Entry */}
      {allowCustom && (
        <form onSubmit={handleAddCustom} className="skill-custom-add-row">
          <input
            type="text"
            className="skill-custom-input"
            placeholder="Cannot find a skill? Type custom skill here..."
            value={customSkill}
            onChange={(e) => {
              setCustomSkill(e.target.value);
              setCustomError('');
            }}
          />
          <button type="submit" className="skill-custom-btn">
            + Add Skill
          </button>
        </form>
      )}
      {customError && (
        <div style={{ color: 'var(--danger)', fontSize: '0.825rem', marginTop: '-0.75rem' }}>
          ⚠️ {customError}
        </div>
      )}
    </div>
  );
}

export default SkillSelector;
