import type { Profile, Skill, SkillTag, Project, Experience, Education } from './types';

export const profile: Profile = {
  name: 'Deepen Yadav',
  title: 'Executive Engineer',
  org: 'Ajmer Development Authority',
  tagline:
    'Civil engineer in the Rajasthan State Government since 2017. Takes on delayed urban infrastructure projects (sewage treatment plants and public housing) and sees them through to completion.',
  location: 'Ajmer, Rajasthan, India',
  url: 'https://deepen-yadav.github.io/profile/',
  serviceSince: 2017,
  languages: [],
};

export const projects: Project[] = [
  {
    code: 'P-01',
    name: '3.5 MLD Sewage Treatment Plant',
    category: 'Sewerage',
    status: 'done',
    statusLabel: 'Completed',
    summary: 'Inherited as a time-barred project on joining ADA in 2019.',
    actions: [
      'Had the existing contractor terminated',
      'Retendered the balance work',
      'Saw the plant through to completion',
    ],
  },
  {
    code: 'P-02',
    name: '40 MLD Sewage Treatment Plant',
    category: 'Sewerage',
    status: 'done',
    statusLabel: 'Operational',
    summary: 'Inherited as a time-barred project on joining ADA in 2019.',
    actions: [
      'Rs. 30 million of the defaulting contractor\'s money confiscated',
      'Balance work retendered and restarted',
      'Plant completed and operational today',
    ],
  },
  {
    code: 'P-03',
    name: 'Housing Project I',
    category: 'Housing',
    status: 'done',
    statusLabel: 'Occupied',
    summary: 'Inherited as a time-barred project on joining ADA in 2019.',
    actions: ['Project completed', 'Residents have moved in'],
  },
  {
    code: 'P-04',
    name: 'Housing Project II',
    category: 'Housing',
    status: 'progress',
    statusLabel: 'Target Mar 2027',
    summary: 'Inherited as a time-barred project on joining ADA in 2019.',
    actions: [
      'Earlier contract terminated by the department headquarters',
      'Work retendered',
      'Finishing work in progress; completion expected by March 2027',
    ],
  },
];

export const experience: Experience[] = [
  {
    role: 'Executive Engineer',
    org: 'Ajmer Development Authority (ADA)',
    place: 'Ajmer, Rajasthan',
    period: '2019 – Present',
    detail:
      'Given charge of all of ADA\'s time-barred projects on joining, including its sewage treatment plants and housing projects.',
  },
  {
    role: 'Scheme & Project Monitoring',
    org: 'Local Self Government Department, Headquarters',
    place: 'Jaipur, Rajasthan',
    period: '2017 – 2019',
    detail:
      'Monitored the department\'s major schemes and projects at sites across Rajasthan for two years.',
  },
  {
    role: 'Municipal Engineering',
    org: 'Local Self Government Department (Municipality)',
    place: 'Rajasthan',
    period: '2017',
    detail: 'First posting after joining the department in 2017. Spent the first few months in a municipality.',
  },
];

export const education: Education[] = [
  {
    degree: 'M.Tech.',
    field: 'Construction Engineering & Management',
    school: 'Indian Institute of Technology, Delhi',
  },
  {
    degree: 'B.E. (Hons.)',
    field: 'Civil Engineering',
    school: 'Birla Institute of Technology & Science, Pilani',
  },
];

export const skills: Skill[] = [
  { name: 'Civil Engineering', tag: 'eng' },
  { name: 'Construction Engineering', tag: 'eng' },
  { name: 'Sewage Treatment Plants', tag: 'eng' },
  { name: 'Housing Projects', tag: 'eng' },
  { name: 'Urban Infrastructure', tag: 'eng' },
  { name: 'Construction Management', tag: 'mgmt' },
  { name: 'Project Monitoring', tag: 'mgmt' },
  { name: 'Contract Management', tag: 'mgmt' },
  { name: 'Tendering & Retendering', tag: 'mgmt' },
  { name: 'Public Works Administration', tag: 'mgmt' },
];

export const skillTags: Record<SkillTag, string> = {
  eng: 'Engineering',
  mgmt: 'Project & Contract Management',
};

const completedProjects = projects.filter((p) => p.status === 'done').length;

/** headline numbers shown on the page and the CV */
export const keyFigures: { value: string; unit: string; label: string }[] = [
  { value: '43.5', unit: 'MLD', label: 'Sewage treatment capacity brought into operation' },
  {
    value: `${completedProjects}/${projects.length}`,
    unit: '',
    label: 'Time-barred projects completed; the last is due Mar 2027',
  },
  { value: '30', unit: 'M', label: 'Rupees confiscated from a defaulting contractor' },
  {
    value: `${new Date().getFullYear() - profile.serviceSince}+`,
    unit: 'yrs',
    label: `In state government service since ${profile.serviceSince}`,
  },
];
