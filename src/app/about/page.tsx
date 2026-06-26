import { Github, Instagram, Linkedin, Mail, Sparkles } from "lucide-react";
import Image from "next/image";
import { PageIntro } from "@/components/PageIntro";
import { Panel } from "@/components/Panel";
import { getAbout } from "@/lib/content";
import type { SocialType } from "@/lib/types";

export const metadata = { title: "About" };

const icons = { linkedin: Linkedin, github: Github, instagram: Instagram, email: Mail } satisfies Record<SocialType, typeof Linkedin>;

export default async function AboutPage() {
  const about = await getAbout();
  if (!about) return <div className="center-state"><h1>About information is coming soon.</h1><p>Add valid content to data/details/about.json.</p></div>;

  return (
    <>
      <PageIntro description="A quick read on what I care about, what I’m learning, and the kind of work I want to create." eyebrow="Identity node · 01" title="About me" />
      <div className="about-grid">
        <Panel className="profile-panel">
          <div className="profile-image"><Image alt={about.profileImageAlt} fill priority sizes="240px" src={about.profileImage} /></div>
          <p className="eyebrow">Portfolio owner</p>
          <h2>{about.name}</h2>
          <p className="profile-headline">{about.headline}</p>
          <div className="soft-block"><p>{about.educationSummary}</p></div>
          <ul className="dot-list">{about.keySkills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
        </Panel>

        <Panel className="story-panel" title="Personal transmission">
          <Sparkles aria-hidden="true" className="story-spark" />
          <p className="story-lead">{about.introduction}</p>
          <div className="story-split"><div><span>Career goals</span><p>{about.careerGoals}</p></div><div><span>Currently</span><p>{about.personalNote}</p></div></div>
        </Panel>

        <Panel className="social-panel" title="Social connect">
          <div className="social-list">
            {about.socials.map((social) => {
              const Icon = icons[social.type] ?? Mail;
              return <a href={social.url} key={social.label} rel="noreferrer" target={social.url.startsWith("mailto:") ? undefined : "_blank"}><Icon aria-hidden="true" /><span><strong>{social.label}</strong><small>Open connection ↗</small></span></a>;
            })}
          </div>
        </Panel>
      </div>
    </>
  );
}
