import { Link } from 'react-router';
import { useAuth } from '../lib/auth';
import { useOverlayHeader } from './Layout';
import { NeuralNetwork } from './NeuralNetwork';
import { cx } from './ui';
import './EmployersHero.css';

/**
 * For employers hero: navy duotone photo, neural-network background and a giant lime headline.
 * The floating cards describe real WorkNest features rather than sample numbers.
 */
export function EmployersHero() {
  const { user } = useAuth();
  // Visitors see the header floating over the hero; signed in, it sits below the app header.
  const overlay = useOverlayHeader();
  const post = user?.role === 'employer' ? '/employer/internships/new' : '/signup?role=employer';

  return (
    <section className={cx('emp-hero', overlay ? 'under-header' : 'in-app')}>
      <div className="mesh" aria-hidden>
        <i />
        <i />
        <i />
      </div>
      <div className="bgphoto duo" aria-hidden>
        <img src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&q=75&auto=format&fit=crop" alt="" />
      </div>
      <div className="shade" aria-hidden />
      <NeuralNetwork className="neural" />
      <div className="grain" aria-hidden />

      <div className="floater f1" aria-hidden><span className="ic">✦</span><div>Skill match %<small>on every applicant</small></div></div>
      <div className="floater f2" aria-hidden><span className="ic">⇄</span><div>One applicant board<small>drag from applied to hired</small></div></div>
      <div className="floater f3" aria-hidden><span className="ic">⚡</span><div>Students notified<small>at every stage change</small></div></div>
      <div className="floater f4" aria-hidden><span className="ic">✓</span><div>Free to post<small>export applicants to CSV</small></div></div>

      <h1>
        <span className="line"><span className="in">Hire your</span></span>
        <span className="line"><span className="in">next interns</span></span>
      </h1>

      <p className="sub">
        Post internships for free. WorkNest scores every applicant on how well their skills match your role, so you can spot the right candidates first.
      </p>

      <Link className="cta" to={post}>
        Post an internship
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </Link>

      {!user && (
        <p className="already">
          Already hiring on WorkNest? <Link to="/login">Log in</Link>
        </p>
      )}
    </section>
  );
}
