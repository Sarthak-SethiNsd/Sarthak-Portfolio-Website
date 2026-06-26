import { PageIntro } from "@/components/PageIntro";
import { ProjectCard } from "@/components/ProjectCard";
import { getProjects } from "@/lib/content";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <PageIntro description="Products documented as living systems, each iteration, decision, and lesson has a place." eyebrow="Build archive - 03" title="Selected projects" />
      {projects.length ? (
        <div className="project-grid">{projects.map((project) => <ProjectCard key={project.slug} project={project} />)}</div>
      ) : (
        <div className="center-state">
          <h2>Projects Coming Soon</h2>
          <p>I am currently building AI and software projects. Completed projects will be added here once they are ready to showcase.</p>
        </div>
      )}
    </>
  );
}
