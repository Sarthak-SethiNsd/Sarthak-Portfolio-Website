import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  AboutData,
  CertificateData,
  Project,
  ProjectVersion,
} from "@/lib/types";

const dataRoot = path.join(process.cwd(), "data");

async function readJson<T>(filePath: string): Promise<T |null> {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
  } catch (error) {
    console.warn(`Unable to load content at ${filePath}`, error);
    return null;
  }
}

export async function getAbout(): Promise<AboutData | null> {
  return readJson<AboutData>(
    path.join(dataRoot, "details", "about.json")
  );
}

export async function getCertificates(): Promise<CertificateData> {
  return (
    (await readJson<CertificateData>(
      path.join(dataRoot, "certificates", "certificates.json")
    )) ?? {
      skills: {},
      certificates: [],
    }
  );
}

export async function getProjects(): Promise<Project[]> {
  const projectsRoot = path.join(dataRoot, "projects");

  try {
    const folders = await fs.readdir(projectsRoot, {
      withFileTypes: true,
    });

    const projects = await Promise.all(
      folders
        .filter((entry) => entry.isDirectory())
        .map((entry) =>
          readJson<Project>(
            path.join(projectsRoot, entry.name, "project.json")
          )
        )
    );

    return projects.filter(
      (project): project is Project =>
        Boolean(project?.slug && project?.name)
    );
  } catch (error) {
    console.warn("Unable to scan project folders", error);
    return [];
  }
}

export async function getProject(slug: string): Promise<Project | null> {
  // Allow lowercase letters, numbers, hyphens (-), and underscores (_)
  if (!/^[a-z0-9_-]+$/.test(slug)) return null;

  return readJson<Project>(
    path.join(dataRoot, "projects", slug, "project.json")
  );
}

export async function getProjectVersions(
  slug: string
): Promise<ProjectVersion[]> {
  // Allow lowercase letters, numbers, hyphens (-), and underscores (_)
  if (!/^[a-z0-9_-]+$/.test(slug)) return [];

  const projectRoot = path.join(dataRoot, "projects", slug);

  try {
    const files = (await fs.readdir(projectRoot)).filter((file) =>
      /^v\d+\.json$/i.test(file)
    );

    const versions = await Promise.all(
      files.map((file) =>
        readJson<ProjectVersion>(path.join(projectRoot, file))
      )
    );

    return versions
      .filter(
        (version): version is ProjectVersion =>
          Boolean(version?.version)
      )
      .sort((a, b) => b.version - a.version);
  } catch (error) {
    console.warn(`Unable to scan versions for ${slug}`, error);
    return [];
  }
}