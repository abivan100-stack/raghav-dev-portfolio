import { CURRENTLY, SECTION_COPY } from "../data/content";
import { Section } from "./ui";

/**
 * Two-column split. The prose runs in the left column
 * and the "right now" list forms a rail on the right, so this is the only
 * section on the page that sets text side by side. It keeps its accessible name
 * without showing a heading.
 */
export function About() {
  const copy = SECTION_COPY.about;
  const now = SECTION_COPY.currently;
  return (
    <Section id="about" title={copy.title}>
      <div className="about-split">
        <div className="about-prose">
          {copy.paragraphs.map((paragraph, index) => (
            <p className={index === 0 ? "about-lede" : undefined} key={paragraph}>
              {paragraph}
            </p>
          ))}
        </div>
        <aside className="about-now">
          <h3 className="about-now-title">{now.title}</h3>
          <ul className="about-now-list">
            {CURRENTLY.map((item) => (
              <li className="about-now-item" key={item.title}>
                <span className="about-now-name">{item.title}</span>
                <span className="about-now-sub">{item.sub}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </Section>
  );
}
