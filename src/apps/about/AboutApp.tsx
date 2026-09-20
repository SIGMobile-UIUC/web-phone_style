import { IdCard } from "lucide-react";
import { FaDiscord, FaInstagram } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo_white.png";
import { about } from "../../content/about";
import { site } from "../../content/site";
import AppFrame from "../../ui/AppFrame";
import "./about.css";

export default function AboutApp() {
  const navigate = useNavigate();

  return (
    <AppFrame title="About">
      <div className="about-hero">
        <span className="about-hero__logo">
          <img src={logo} alt="" />
        </span>
        <div>
          <div className="about-hero__name">{site.name}</div>
          <div className="about-hero__tag">{site.tagline}</div>
        </div>
      </div>

      <p className="about-headline">{about.headline}</p>
      <p className="ui-card__text">{about.intro}</p>

      <h2 className="ui-section">What we do</h2>
      {about.offers.map((o) => (
        <div className="ui-card" key={o.title}>
          <h3 className="ui-card__title">{o.title}</h3>
          <p className="ui-card__text">{o.text}</p>
        </div>
      ))}

      <h2 className="ui-section">Ideal project team</h2>
      <div className="ui-card">
        {about.idealTeam.map((t) => (
          <div className="about-team" key={t.role}>
            <div>
              <div className="about-team__role">{t.role}</div>
              {t.note && <div className="about-team__note">{t.note}</div>}
            </div>
            <span className="ui-chip">{t.size}</span>
          </div>
        ))}
      </div>

      <h2 className="ui-section">What makes a good app?</h2>
      <div className="ui-card">
        <ul className="about-list">
          {about.considerations.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      <h2 className="ui-section">Get involved</h2>
      <div className="ui-row">
        <button type="button" className="ui-button" onClick={() => navigate("/exec")}>
          <IdCard aria-hidden /> Meet the board
        </button>
        <a className="ui-button ui-button--soft" href={site.links.discord} target="_blank" rel="noopener noreferrer">
          <FaDiscord aria-hidden /> Discord
        </a>
        <a className="ui-button ui-button--soft" href={site.links.instagram} target="_blank" rel="noopener noreferrer">
          <FaInstagram aria-hidden /> Instagram
        </a>
      </div>
    </AppFrame>
  );
}
