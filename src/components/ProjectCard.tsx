import type { Project, SignalStep, TechMention } from "../data/content";
import { PROJECT_SPEC_LABELS } from "../data/content";
import { Tip } from "./ui";

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
 * One project as a spec entry: name and result in the left column,
 * description and spec rows in the body. The featured project
 * shows its signal chain as staged blocks above the spec.
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
        <h2 id={`${project.slug}-name`}>{project.name}</h2>
        <p className={`entry-result tone-${project.resultTone}`}>{project.result}</p>
      </header>
      <div className="entry-body">
        <p className="entry-desc">{project.description}</p>
        {project.featured && project.sysline ? (
          <SignalChain steps={project.sysline} staged />
        ) : null}
        <dl className="spec spec-compact">
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
