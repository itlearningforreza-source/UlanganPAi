export const Progress = ({ current, total, answered, impossibleIndex = 9 }) => {
  const progress = ((current + 1) / total) * 100;
  
  return (
    <div className="progress-container" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Kemajuan kuis">
      <div className="progress-header">
        <span>Progres: {current + 1} / {total}</span>
        <span>{answered} dijawab</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{width: progress + '%'}}></div>
      </div>
      <div className="question-dots" role="tablist" aria-label="Navigasi soal">
        {Array.from({length: total}, (_, i) => (
          <button
            key={i}
            className={`question-dot ${i === current ? 'active current' : ''} ${answeredIndices.includes(i) ? 'answered' : ''} ${i === impossibleIndex ? 'impossible' : ''}`}
            onClick={() => onGoToQuestion(i)}
            aria-label={`Soal ${i + 1}${i === impossibleIndex ? ' (Impossible Challenge)' : ''}${i === current ? ', saat ini' : ''}${answeredIndices.includes(i) ? ', dijawab' : ''}`}
            aria-selected={i === current}
            role="tab"
          />
        ))}
      </div>
    </div>
  );
};

// We need to pass answered indices and onGoToQuestion as props
export const ProgressBar = ({ current, total, answeredIndices, impossibleIndex = 9, onGoToQuestion }) => {
  const progress = ((current + 1) / total) * 100;
  
  return (
    <div className="progress-container" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Kemajuan kuis">
      <div className="progress-header">
        <span>Progres: {current + 1} / {total}</span>
        <span>{answeredIndices.length} dijawab</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{width: progress + '%'}}></div>
      </div>
      <div className="question-dots" role="tablist" aria-label="Navigasi soal">
        {Array.from({length: total}, (_, i) => (
          <button
            key={i}
            className={`question-dot ${i === current ? 'active current' : ''} ${answeredIndices.includes(i) ? 'answered' : ''} ${i === impossibleIndex ? 'impossible' : ''}`}
            onClick={() => onGoToQuestion(i)}
            aria-label={`Soal ${i + 1}${i === impossibleIndex ? ' (Impossible Challenge)' : ''}${i === current ? ', saat ini' : ''}${answeredIndices.includes(i) ? ', dijawab' : ''}`}
            aria-selected={i === current}
            role="tab"
          />
        ))}
      </div>
    </div>
  );
};
