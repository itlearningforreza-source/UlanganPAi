export const Timer = ({ timeRemaining, active }) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formatted = minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
  
  let statusClass = '';
  if (timeRemaining <= 60) statusClass = 'danger';
  else if (timeRemaining <= 180) statusClass = 'warning';
  
  return (
    <div className={`timer-display ${statusClass}`} role="timer" aria-live="polite" aria-label={`Waktu tersisa ${formatted}`}>
      <svg className="timer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <span>{formatted}</span>
    </div>
  );
};
