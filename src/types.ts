export interface Profile {
  name: string;
  title: string;
  org: string;
  tagline: string;
  location: string;
  /** public site URL, used in the CV */
  url: string;
  /** year joined government service */
  serviceSince: number;
  email?: string;
  linkedin?: string;
  languages: string[];
  dateOfBirth?: string;
}

export type SkillTag = 'eng' | 'mgmt';

export interface Skill {
  name: string;
  /** 1–5; omit to show the skill without a proficiency meter */
  level?: number;
  tag: SkillTag;
}

export type ProjectStatus = 'done' | 'progress';

export interface Project {
  /** drawing-style sheet number, e.g. P-01 */
  code: string;
  name: string;
  category: string;
  status: ProjectStatus;
  statusLabel: string;
  summary: string;
  actions: string[];
}

export interface Experience {
  role: string;
  org: string;
  place: string;
  period: string;
  detail: string;
}

export interface Education {
  degree: string;
  field: string;
  school: string;
  period?: string;
}
