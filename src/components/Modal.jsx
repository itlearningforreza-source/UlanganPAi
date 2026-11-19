export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Tutup modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Ya", cancelText = "Batal", variant = "primary", loading = false }) => {
  if (!isOpen) return null;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p style={{color: 'var(--color-text-muted)', marginBottom: '1.5rem'}}>{message}</p>
      <div className="modal-footer">
        <button className="btn btn-outline" onClick={onClose} disabled={loading}>{cancelText}</button>
        <button className={`btn btn-${variant}`} onClick={onConfirm} disabled={loading}>
          {loading ? (
            <>
              <svg className="loading-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4" strokeDashoffset="31.4"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></circle></svg>
              Memproses...
            </>
          ) : (
            confirmText
          )}
        </button>
      </div>
    </Modal>
  );
};
