import { CURRENTLY, SECTION_COPY } from "../data/content";
import { Section } from "./ui";

/** Who I am, then a short list of what's on the bench right now. */
export function About() {
  const copy = SECTION_COPY.about;
  const now = SECTION_COPY.currently;
  const [lede, ...rest] = copy.paragraphs;
  return (
    <Section id="about" title={copy.title}>
      <div className="about-grid">
        <div className="prose">
          <p className="lede">{lede}</p>
          {rest.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="now">
          <h3 className="now-title">{now.title}</h3>
          <ul className="now-list">
            {CURRENTLY.map((item) => (
              <li key={item.title}>
                <span className="now-item">{item.title}.</span> {item.sub}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
