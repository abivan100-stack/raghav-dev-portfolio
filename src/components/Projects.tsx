import { PROJECTS, PROJECTS_PAGE_PATH, SECTION_COPY } from "../data/content";
import { ProjectCard, ProjectName } from "./ProjectCard";
import { Section } from "./ui";

/**
 * Home page: every project as one full-width index row — the name at display
 * size with its summary beneath, and the outcome at the right.
 * The whole row links to the project's deep link.
 */
export function ProjectIndex() {
  const copy = SECTION_COPY.projects;
  return (
    <Section id="projects" title={copy.title} lead={copy.lead}>
      <ol className="index-list">
        {PROJECTS.map((project) => (
          <li key={project.slug} className="index-item">
            <a className="index-row" href={`${PROJECTS_PAGE_PATH}#${project.slug}`}>
              <span className="index-main">
                <span className="index-name">
                  <ProjectName name={project.name} />
                </span>
                <span className="index-summary">{project.summary}</span>
              </span>
              <span className={`index-outcome tone-${project.resultTone}`}>{project.result}</span>
            </a>
          </li>
        ))}
      </ol>
      <a className="text-link index-all" href={PROJECTS_PAGE_PATH}>
        {copy.viewAll}
      </a>
    </Section>
  );
}

/** Projects page: page title, then every project as a full-width band. */
export function ProjectList() {
  const copy = SECTION_COPY.projectsPage;
  return (
    <section className="page" id="projects" aria-labelledby="projects-title">
      <div className="container lane-pad">
        <header className="page-head">
          <h1 id="projects-title" data-start>
            {copy.title}
          </h1>
          <p className="page-lead">{copy.lead}</p>
        </header>
        {PROJECTS.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
