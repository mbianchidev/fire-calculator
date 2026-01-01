import { Link } from 'react-router-dom';
import './NotFoundPage.css';

export function NotFoundPage() {
  return (
    <main className="not-found-page" id="main-content">
      <div className="not-found-container">
        <div className="not-found-icon" aria-hidden="true">🔍</div>
        <h1 className="not-found-title">404 - Page Not Found</h1>
        <p className="not-found-message">
          Oops! The page you're looking for doesn't exist. 
          It might have been moved or deleted.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn-home">
            <span aria-hidden="true">🏠</span> Back to Home
          </Link>
          <Link to="/fire-calculator" className="btn-calculator">
            <span aria-hidden="true">🔥</span> FIRE Calculator
          </Link>
        </div>
        <div className="helpful-links">
          <h2>Popular Pages</h2>
          <nav aria-label="Popular pages navigation">
            <ul>
              <li>
                <Link to="/asset-allocation">
                  <span aria-hidden="true">📊</span> Asset Allocation Manager
                </Link>
              </li>
              <li>
                <Link to="/expense-tracker">
                  <span aria-hidden="true">💰</span> Cashflow Tracker
                </Link>
              </li>
              <li>
                <Link to="/monte-carlo">
                  <span aria-hidden="true">🎲</span> Monte Carlo Simulations
                </Link>
              </li>
              <li>
                <Link to="/settings">
                  <span aria-hidden="true">⚙️</span> Settings
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </main>
  );
}
