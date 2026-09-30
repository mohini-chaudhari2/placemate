const defaultSkills = [
  // Programming
  { name: 'C', category: 'Programming', aliases: ['c lang', 'c-lang'], popularity: 70 },
  { name: 'C++', category: 'Programming', aliases: ['cpp', 'c plus plus'], popularity: 85 },
  { name: 'C#', category: 'Programming', aliases: ['csharp', 'c sharp', '.net c#'], popularity: 75 },
  { name: 'Java', category: 'Programming', aliases: ['core java', 'java se', 'java ee'], popularity: 95 },
  { name: 'Python', category: 'Programming', aliases: ['python3', 'py'], popularity: 98 },
  { name: 'JavaScript', category: 'Programming', aliases: ['js', 'ecmascript', 'es6'], popularity: 99 },
  { name: 'TypeScript', category: 'Programming', aliases: ['ts'], popularity: 90 },
  { name: 'Go', category: 'Programming', aliases: ['golang'], popularity: 75 },
  { name: 'Rust', category: 'Programming', aliases: ['rustlang'], popularity: 70 },
  { name: 'PHP', category: 'Programming', aliases: ['php7', 'php8'], popularity: 65 },
  { name: 'Ruby', category: 'Programming', aliases: ['ruby on rails', 'ror'], popularity: 60 },
  { name: 'Kotlin', category: 'Programming', aliases: ['kotlin android'], popularity: 75 },
  { name: 'Swift', category: 'Programming', aliases: ['swift ios'], popularity: 70 },

  // Frontend
  { name: 'HTML', category: 'Frontend', aliases: ['html5'], popularity: 95 },
  { name: 'CSS', category: 'Frontend', aliases: ['css3'], popularity: 95 },
  { name: 'React', category: 'Frontend', aliases: ['react.js', 'reactjs'], popularity: 98 },
  { name: 'Angular', category: 'Frontend', aliases: ['angularjs', 'angular.js', 'angular 2+'], popularity: 80 },
  { name: 'Vue', category: 'Frontend', aliases: ['vue.js', 'vuejs'], popularity: 78 },
  { name: 'Next.js', category: 'Frontend', aliases: ['nextjs', 'next'], popularity: 88 },
  { name: 'Tailwind CSS', category: 'Frontend', aliases: ['tailwind', 'tailwindcss'], popularity: 88 },
  { name: 'Bootstrap', category: 'Frontend', aliases: ['bootstrap 5', 'bootstrap 4'], popularity: 75 },

  // Backend
  { name: 'Node.js', category: 'Backend', aliases: ['nodejs', 'node'], popularity: 95 },
  { name: 'Express.js', category: 'Backend', aliases: ['express', 'expressjs'], popularity: 92 },
  { name: 'Django', category: 'Backend', aliases: ['django framework', 'python django'], popularity: 82 },
  { name: 'Flask', category: 'Backend', aliases: ['python flask'], popularity: 78 },
  { name: 'Spring Boot', category: 'Backend', aliases: ['springboot', 'spring framework', 'spring'], popularity: 90 },
  { name: '.NET', category: 'Backend', aliases: ['dotnet', '.net core', 'asp.net'], popularity: 78 },
  { name: 'REST API', category: 'Backend', aliases: ['rest', 'restful api', 'web api'], popularity: 92 },
  { name: 'GraphQL', category: 'Backend', aliases: ['graphql api'], popularity: 75 },

  // Database
  { name: 'SQL', category: 'Database', aliases: ['structured query language', 'relational database'], popularity: 95 },
  { name: 'MySQL', category: 'Database', aliases: ['my sql'], popularity: 92 },
  { name: 'PostgreSQL', category: 'Database', aliases: ['postgres', 'pgsql'], popularity: 90 },
  { name: 'MongoDB', category: 'Database', aliases: ['mongo', 'nosql mongodb'], popularity: 94 },
  { name: 'Redis', category: 'Database', aliases: ['redis cache'], popularity: 80 },
  { name: 'Firebase', category: 'Database', aliases: ['firestore', 'firebase realtime'], popularity: 78 },

  // AI & Machine Learning
  { name: 'Machine Learning', category: 'AI & Machine Learning', aliases: ['ml'], popularity: 90 },
  { name: 'Deep Learning', category: 'AI & Machine Learning', aliases: ['dl', 'neural networks'], popularity: 85 },
  { name: 'TensorFlow', category: 'AI & Machine Learning', aliases: ['tf'], popularity: 80 },
  { name: 'PyTorch', category: 'AI & Machine Learning', aliases: ['torch'], popularity: 85 },
  { name: 'NLP', category: 'AI & Machine Learning', aliases: ['natural language processing'], popularity: 80 },
  { name: 'Computer Vision', category: 'AI & Machine Learning', aliases: ['cv', 'opencv'], popularity: 78 },
  { name: 'Generative AI', category: 'AI & Machine Learning', aliases: ['genai', 'llm', 'large language models'], popularity: 92 },

  // Data Science
  { name: 'Data Analysis', category: 'Data Science', aliases: ['data analytics', 'data analyst'], popularity: 88 },
  { name: 'Pandas', category: 'Data Science', aliases: ['python pandas'], popularity: 86 },
  { name: 'NumPy', category: 'Data Science', aliases: ['numpy python'], popularity: 85 },
  { name: 'Power BI', category: 'Data Science', aliases: ['powerbi', 'microsoft power bi'], popularity: 85 },
  { name: 'Tableau', category: 'Data Science', aliases: ['tableau desktop'], popularity: 82 },
  { name: 'Excel', category: 'Data Science', aliases: ['ms excel', 'advanced excel'], popularity: 88 },
  { name: 'Statistics', category: 'Data Science', aliases: ['statistical analysis', 'business statistics'], popularity: 78 },

  // Cloud & DevOps
  { name: 'AWS', category: 'Cloud & DevOps', aliases: ['amazon web services', 'amazon aws'], popularity: 94 },
  { name: 'Azure', category: 'Cloud & DevOps', aliases: ['microsoft azure'], popularity: 86 },
  { name: 'Google Cloud', category: 'Cloud & DevOps', aliases: ['gcp', 'google cloud platform'], popularity: 82 },
  { name: 'Docker', category: 'Cloud & DevOps', aliases: ['containers', 'docker containers'], popularity: 90 },
  { name: 'Kubernetes', category: 'Cloud & DevOps', aliases: ['k8s'], popularity: 84 },
  { name: 'Git', category: 'Cloud & DevOps', aliases: ['git version control'], popularity: 96 },
  { name: 'GitHub', category: 'Cloud & DevOps', aliases: ['github actions'], popularity: 95 },
  { name: 'GitLab', category: 'Cloud & DevOps', aliases: ['gitlab ci'], popularity: 75 },
  { name: 'CI/CD', category: 'Cloud & DevOps', aliases: ['continuous integration', 'cicd'], popularity: 85 },

  // Mobile
  { name: 'React Native', category: 'Mobile', aliases: ['react-native', 'rn'], popularity: 82 },
  { name: 'Flutter', category: 'Mobile', aliases: ['flutter dart', 'dart flutter'], popularity: 84 },
  { name: 'Android Development', category: 'Mobile', aliases: ['android', 'android studio'], popularity: 80 },
  { name: 'iOS Development', category: 'Mobile', aliases: ['ios', 'xcode'], popularity: 76 },

  // Testing
  { name: 'Manual Testing', category: 'Testing', aliases: ['qa testing', 'software testing'], popularity: 78 },
  { name: 'Automation Testing', category: 'Testing', aliases: ['test automation', 'qa automation'], popularity: 84 },
  { name: 'Selenium', category: 'Testing', aliases: ['selenium webdriver'], popularity: 82 },
  { name: 'Jest', category: 'Testing', aliases: ['jestjs', 'react testing library'], popularity: 78 },
  { name: 'Cypress', category: 'Testing', aliases: ['cypress.io', 'e2e cypress'], popularity: 75 },
  { name: 'Postman', category: 'Testing', aliases: ['api testing postman'], popularity: 88 },

  // Soft Skills
  { name: 'Communication', category: 'Soft Skills', aliases: ['verbal communication', 'written communication'], popularity: 96 },
  { name: 'Leadership', category: 'Soft Skills', aliases: ['team leadership', 'initiative'], popularity: 88 },
  { name: 'Teamwork', category: 'Soft Skills', aliases: ['collaboration', 'team player'], popularity: 95 },
  { name: 'Problem Solving', category: 'Soft Skills', aliases: ['critical problem solving', 'analytical thinking'], popularity: 98 },
  { name: 'Time Management', category: 'Soft Skills', aliases: ['punctuality', 'task prioritization'], popularity: 90 },
  { name: 'Presentation', category: 'Soft Skills', aliases: ['public speaking', 'presentation skills'], popularity: 85 },
  { name: 'Critical Thinking', category: 'Soft Skills', aliases: ['decision making'], popularity: 90 },
];

module.exports = defaultSkills;
