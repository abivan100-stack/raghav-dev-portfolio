import { SECTION_COPY, TIMELINE } from "../data/content";
import { Section } from "./ui";

export function Timeline() {
  return (
    <Section id="timeline" title={SECTION_COPY.timeline.title}>
      <ol className="timeline">
        {TIMELINE.map((item, index) => (
          <li
            key={item.title}
            className={["tl-item", item.minor ? "tl-minor" : "", index === 0 ? "tl-top" : ""].filter(Boolean).join(" ")}
          >
            <span className="tl-year">{item.year}</span>
            <div>
              <p className="tl-title">{item.title}</p>
              <p className="tl-sub">{item.place}</p>
              {item.project ? <p className="tl-project">{item.project}</p> : null}
            </div>
            <p className="tl-result">{item.result}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
