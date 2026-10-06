import { CONTACT_ITEMS, SECTION_COPY } from "../data/content";
import { LinkIcon } from "./ui";

/** Closing board: the email set large, other places to find me below it. */
export function Contact() {
  const copy = SECTION_COPY.contact;
  const [primary, ...others] = CONTACT_ITEMS;
  return (
    <section className="section section-contact" id="contact" aria-labelledby="contact-title">
      <div className="container">
        <div className="board contact-board">
          <h2 id="contact-title" className="contact-title">
            {copy.title}
          </h2>
          <p className="contact-lead">{copy.lead}</p>
          <a className="contact-primary" href={primary.href}>
            {primary.value}
          </a>
          <ul className="contact-list">
            {others.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener" : undefined}
                >
                  <span className="contact-label">
                    <LinkIcon label={item.label} />
                    {item.label}
                  </span>
                  <span className="contact-value">{item.value}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
