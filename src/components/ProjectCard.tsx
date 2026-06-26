import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link className="project-card" href={`/projects/${project.slug}`}>
      <div className="project-cover">
        <Image alt={project.coverImageAlt || ""} fill loading="eager" sizes="(max-width: 760px) 100vw, 45vw" src={project.coverImage} />
      </div>
      <div className="project-card-content">
        <p className="eyebrow">Project archive</p>
        <h2>{project.name}</h2>
        <p>{project.tagline}</p>
        <span>Explore build history <ArrowUpRight aria-hidden="true" size={17} /></span>
      </div>
    </Link>
  );
}
