import { CONTACT_ITEMS, SECTION_COPY } from "../data/content";
import { LinkIcon, Section } from "./ui";

/** The email set large; other places to find me below it. */
export function Contact() {
  const copy = SECTION_COPY.contact;
  const [primary, ...others] = CONTACT_ITEMS;
  return (
    <Section id="contact" title={copy.title} lead={copy.lead}>
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
    </Section>
  );
}
