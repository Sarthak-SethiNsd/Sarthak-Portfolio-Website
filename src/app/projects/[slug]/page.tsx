import { ArrowLeft, CalendarDays, Github, Globe } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Panel } from "@/components/Panel";
import { VideoPlayer } from "@/components/VideoPlayer";
import { getProject, getProjects, getProjectVersions } from "@/lib/content";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return (await getProjects()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = await getProject((await params).slug);
  return { title: project?.name ?? "Project" };
}

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);

  return Number.isNaN(parsed.valueOf())
    ? date
    : new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(parsed);
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  const [project, versions] = await Promise.all([
    getProject(slug),
    getProjectVersions(slug),
  ]);

  if (!project) notFound();

  const showProjectResources = Boolean(
    project.latestDemoVideo ||
      project.futureRoadmap.length
  );

  const resourcePanelCount =
    Number(Boolean(project.latestDemoVideo)) +
    Number(Boolean(project.futureRoadmap.length));

  return (
    <div className="project-detail-page">
      <Link className="back-link" href="/projects">
        <ArrowLeft size={16} /> Project archive
      </Link>

      <section className="project-hero">
        <div>
          <p className="eyebrow">
            Active build file &middot; {String(versions.length).padStart(2, "0")} releases
          </p>

          <h1>{project.name}</h1>

          <p>{project.overview}</p>
        </div>

        <div className="project-hero-image">
          <Image
            alt={project.coverImageAlt}
            fill
            priority
            sizes="(max-width: 760px) 100vw, 40vw"
            src={project.coverImage}
          />
        </div>
      </section>

      <section className="version-section">
        <div className="section-heading">
          <p className="eyebrow">Development log</p>
          <h2>Version history</h2>
        </div>

        {versions.length ? (
          <div className="timeline">
            {versions.map((version) => (
              <article className="version-card" key={version.version}>
                <div className="version-marker">
                  <span>V{version.version}</span>
                </div>

                <div className="version-content">
                  <div className="version-header">
                    <div>
                      <h3>{version.name}</h3>

                      <p>
                        <CalendarDays size={15} /> {formatDate(version.date)}
                      </p>
                    </div>

                    <span className="status-chip">
                      Release {version.version}
                    </span>
                  </div>

                  <p className="version-description">
                    {version.description}
                  </p>

                  <div className="version-columns">
                    <div>
                      <h4>Features</h4>

                      <ul>
                        {version.features.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4>Tech stack</h4>

                      <div className="tag-list">
                        {version.techStack.map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                      </div>
                    </div>

                    {version.improvements.length ? (
                      <div>
                        <h4>Improvements</h4>

                        <ul>
                          {version.improvements.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <div>
                      <h4>Lessons learned</h4>

                      <ul>
                        {version.lessonsLearned.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {version.screenshots?.length ? (
                    <div className="screenshot-gallery">
                      {version.screenshots.map((screenshot) => (
                        <figure
                          className="screenshot-card"
                          key={`${version.version}-${screenshot.image}`}
                        >
                          <div className="screenshot-image">
                            <Image
                              alt={screenshot.alt ?? screenshot.title}
                              fill
                              sizes="(max-width: 760px) 100vw, 50vw"
                              src={screenshot.image}
                            />
                          </div>

                          <figcaption>{screenshot.title}</figcaption>
                        </figure>
                      ))}
                    </div>
                  ) : null}

                  {version.notes ? (
                    <p className="version-note">
                      Note: {version.notes}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p>No version history available yet.</p>
        )}
      </section>

      {showProjectResources ? (
        <div
          className={`project-bottom-grid${
            resourcePanelCount === 1
              ? " project-bottom-grid-single"
              : ""
          }`}
        >
          {project.latestDemoVideo ? (
            <Panel title="Latest demo">
              <VideoPlayer video={project.latestDemoVideo} />
            </Panel>
          ) : null}

          {project.futureRoadmap.length ? (
            <Panel title="Future roadmap">
              <ul className="roadmap-list">
                {project.futureRoadmap.map((item, index) => (
                  <li key={item}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}
        </div>
      ) : null}

      <section className="project-links-section" aria-label="Project links">
        <Panel title="Project links">
          <div className="project-links">
            {project.githubUrl ? (
              <a className="primary-link" href={project.githubUrl} rel="noreferrer" target="_blank">
                <Github size={18} /> View GitHub repository
              </a>
            ) : null}

            {project.liveUrl ? (
              <a className="primary-link" href={project.liveUrl} rel="noreferrer" target="_blank">
                <Globe size={18} /> View Live Website
              </a>
            ) : null}

            {!project.githubUrl && !project.liveUrl ? (
              <p className="project-links-unavailable">Project links are not available yet.</p>
            ) : null}
          </div>
        </Panel>
      </section>
    </div>
  );
}
