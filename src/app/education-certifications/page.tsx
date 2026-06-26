import { Award, ExternalLink, FileText } from "lucide-react";
import Image from "next/image";
import { PageIntro } from "@/components/PageIntro";
import { Panel } from "@/components/Panel";
import { getCertificates } from "@/lib/content";

export const metadata = { title: "Education & Certifications" };

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.valueOf()) ? date : new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(parsed);
}

export default async function EducationPage() {
  const data = await getCertificates();
  return (
    <>
      <PageIntro description="The tools I use, the ideas beneath them, and a growing record of structured learning." eyebrow="Learning matrix · 02" title="Education & certifications" />
      <div className="education-grid">
        <Panel className="skills-panel" title="Technical map">
          {Object.keys(data.skills).length ? Object.entries(data.skills).map(([group, skills], index) => <section className={`skill-group tone-${index % 3}`} key={group}><h3>{group}</h3><ul className="dot-list">{skills.map((skill) => <li key={skill}>{skill}</li>)}</ul></section>) : <p>No skills added yet.</p>}
        </Panel>
        <Panel className="cert-panel" title="Verified learning">
          {data.certificates.length ? <div className="certificate-list">{data.certificates.map((certificate) => <article className="certificate-card" key={certificate.id}>
            <div className="certificate-preview">
              {certificate.mediaType === "image" && certificate.mediaPath ? <Image alt={`${certificate.title} certificate preview`} fill sizes="200px" src={certificate.mediaPath} /> : <FileText aria-hidden="true" />}
            </div>
            <div><p className="eyebrow">{certificate.issuer} · {formatDate(certificate.date)}</p><h3>{certificate.title}</h3>{certificate.achievement ? <p>{certificate.achievement}</p> : null}<div className="action-row">{certificate.credentialUrl ? <a href={certificate.credentialUrl} rel="noreferrer" target="_blank"><Award size={16} /> Verify credential</a> : null}{certificate.mediaPath ? <a href={certificate.mediaPath} rel="noreferrer" target="_blank"><ExternalLink size={16} /> View {certificate.mediaType ?? "file"}</a> : null}</div></div>
          </article>)}</div> : <div className="empty-state"><Award /><p>No certificate uploaded yet.</p></div>}
        </Panel>
      </div>
    </>
  );
}
