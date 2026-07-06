export type SocialType = "linkedin" | "github" | "instagram" | "email";

export interface AboutData {
  name: string;
  headline: string;
  profileImage: string;
  profileImageAlt: string;
  educationSummary: string;
  keySkills: string[];
  introduction: string;
  careerGoals: string;
  personalNote: string;
  socials: Array<{ label: string; url: string; type: SocialType }>;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
  mediaType?: "image" | "pdf";
  mediaPath?: string;
  achievement?: string;
}

export interface CertificateData {
  skills: Record<string, string[]>;
  certificates: Certificate[];
}

export interface DemoVideo {
  type: "local" | "external";
  src: string;
  title: string;
}

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  coverImage: string;
  coverImageAlt: string;
  overview: string;
  latestDemoVideo?: DemoVideo;
  githubUrl?: string;
  liveUrl?: string;
  futureRoadmap: string[];
  featured?: boolean;
}

export interface ProjectVersion {
  version: number;
  name: string;
  date: string;
  description: string;
  features: string[];
  techStack: string[];
  lessonsLearned: string[];
  improvements: string[];
  notes?: string;
  screenshots?: {
  title: string;
  image: string;
  alt?: string;
}[];
}
