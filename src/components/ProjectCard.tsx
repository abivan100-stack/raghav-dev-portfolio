import type { Project, SignalStep, TechMention } from "../data/content";
import { PROJECT_SPEC_LABELS } from "../data/content";
import { Tip } from "./ui";

/** "CRASH (Chennai Road Accident Safety Hub)" -> "CRASH". */
export const shortName = (name: string) => name.split(" (")[0];

/**
 * A name with an aside, "CRASH (Chennai Road Accident Safety Hub)", sets the
 * short name large and the aside small beneath it. The text still reads as one
 * name to a screen reader.
 */
export function ProjectName({ name }: { name: string }) {
  const main = shortName(name);
  if (main === name) return <>{name}</>;
  return (
    <>
      <span className="name-main">{main}</span>{" "}
      <span className="name-aside">{name.slice(main.length + 1)}</span>
    </>
  );
}

/** Signal chain as a row of parts joined by traces (drawn in CSS). */
function SignalChain({ steps, staged = false }: { steps: SignalStep[]; staged?: boolean }) {
  return (
    <ol className={staged ? "chain chain-staged" : "chain"}>
      {steps.map((step, i) => (
        <li key={`${step.text.label}-${i}`}>
          {step.strong ? <span className="chain-stage">{step.strong}</span> : null}
          <span className="chain-part">
            <Tip label={step.text.label} tip={step.text.tip} />
          </span>
        </li>
      ))}
    </ol>
  );
}

function TechLine({ items }: { items: TechMention[] }) {
  return (
    <>
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`}>
          <Tip label={item.label} tip={item.tip} />
          {i < items.length - 1 ? ", " : ""}
        </span>
      ))}
    </>
  );
}

/**
 * One project as a full-width band: a name header, then the
 * description, the ruled spec list, the signal chain and the links. The
 * featured project is set larger. The `id` is the deep-link anchor.
 */
export function ProjectCard({ project }: { project: Project }) {
  const labels = PROJECT_SPEC_LABELS;
  return (
    <article
      className={project.featured ? "entry entry-featured" : "entry"}
      id={project.slug}
      data-station="top"
      aria-labelledby={`${project.slug}-name`}
    >
      <header className="entry-head">
        <div className="entry-heading">
          <h2 className="entry-name" id={`${project.slug}-name`}>
            <ProjectName name={project.name} />
          </h2>
          <p className={`entry-result tone-${project.resultTone}`}>{project.result}</p>
        </div>
      </header>
      <div className="entry-body">
        <p className="entry-desc">{project.description}</p>
        {project.featured && project.sysline ? <SignalChain steps={project.sysline} staged /> : null}
        <dl className="spec spec-compact entry-spec">
          <div className="spec-row">
            <dt>{labels.event}</dt>
            <dd>{project.event}</dd>
          </div>
          {project.contrib ? (
            <div className="spec-row">
              <dt>{labels.contrib}</dt>
              <dd>{project.contrib}</dd>
            </div>
          ) : null}
          {!project.featured && project.sysline ? (
            <div className="spec-row">
              <dt>{labels.flow}</dt>
              <dd>
                <SignalChain steps={project.sysline} />
              </dd>
            </div>
          ) : null}
          {project.techline ? (
            <div className="spec-row">
              <dt>{labels.tech}</dt>
              <dd>
                <TechLine items={project.techline} />
              </dd>
            </div>
          ) : null}
        </dl>
        {project.links ? (
          <p className="entry-links">
            {project.links.map((link) => (
              <a key={link.href} className="text-link" href={link.href} target="_blank" rel="noopener">
                {link.label}
              </a>
            ))}
          </p>
        ) : null}
      </div>
    </article>
  );
}
