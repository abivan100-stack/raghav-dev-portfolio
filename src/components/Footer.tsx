import { FOOTER_COPY, PROFILE_NAME } from "../data/content";
import { scrollToTop } from "../lib/site";

export function Footer() {
  return (
    <footer className="footer">
      <div className="finish" data-finish aria-hidden="true" />
      <div className="container lane-pad footer-inner">
        <p className="footer-name">{PROFILE_NAME}</p>
        <p className="footer-meta">{FOOTER_COPY.place}</p>
        <a className="footer-top" href="#top" onClick={scrollToTop}>
          {FOOTER_COPY.backToTop}
        </a>
      </div>
    </footer>
  );
}
