import { CONTACT_ITEMS, SECTION_COPY } from "../data/content";
import { LinkIcon, Section } from "./ui";

/**
 * The end of the page: the heading is set as a statement, then the three
 * addresses sit across the full width as large inline links on ruled columns.
 * Email stays a real mailto:; external links open in a new tab.
 */
export function Contact() {
  const copy = SECTION_COPY.contact;
  return (
    <Section id="contact" title={copy.title} lead={copy.lead}>
      <ul className="closing-list">
        {CONTACT_ITEMS.map((item) => (
          <li className="closing-item" key={item.label}>
            <a
              className="closing-link"
              href={item.href}
              aria-label={`${item.label}: ${item.value}`}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener" : undefined}
            >
              <span className="closing-link-icon">
                <LinkIcon label={item.label} size={22} />
              </span>
              <span className="closing-link-value">{item.value}</span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
