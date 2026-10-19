import { Stars } from './Stars';
import MapPicker from './MapPicker';
import { TYPES, fmtDate } from '../lib/util';

export default function VisitDetail({ v, onEdit, onDelete, onScrap, onClose, onShowOnMap }) {
  const pinned = typeof v.lat === 'number';
  return (
    <div className="inversa-detail-view">
      <div className="detail-head">
        <div className="telemetry-bar">
          <span className="data-tag">LOG DETAIL // {v.id.slice(0, 8)}</span>
          <span className="type-badge">{TYPES[v.type] || 'KAFE'}</span>
          {pinned && (
            <span className="coord-chip-lime">
              ⌖ {v.lat.toFixed(5)}, {v.lng.toFixed(5)}
            </span>
          )}
        </div>
        <h2 className="detail-title">{v.name}</h2>
        <div className="detail-meta-date mono">
          {fmtDate(v.date)}{v.area ? ` // ${v.area}` : ''}
        </div>
      </div>

      <div className="detail-rating-strip">
        <div className="rating-primary">
          <Stars value={v.rating} />
          <span className="big-score mono">{v.rating.toFixed(1)} / 5.0</span>
        </div>
        <div className="rating-breakdown mono">
          <span>KOPI: {v.ratings.coffee || '-'}/5</span>
          <span>SUASANA: {v.ratings.vibe || '-'}/5</span>
          <span>PELAYANAN: {v.ratings.service || '-'}/5</span>
        </div>
      </div>

      {v.photos.length > 0 && (
        <div className="detail-photo-gallery">
          {v.photos.map((p, i) => (
            <img key={i} src={p} alt={`Foto dokumentasi ${v.name} ${i + 1}`} />
          ))}
        </div>
      )}

      {(v.menu || v.brew || v.bean) && (
        <div className="detail-info-block">
          <span className="mono-sub">PROFIL SEDUHAN & MENU</span>
          {v.menu && <p className="detail-menu-name">🍽️ {v.menu}</p>}
          {(v.brew || v.bean) && (
            <p className="detail-brew-meta mono">
              {[v.brew, v.bean].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      )}

      {v.flavors?.length > 0 && (
        <div className="detail-info-block">
          <span className="mono-sub">TASTING NOTES</span>
          <div className="tactical-chips-grid">
            {v.flavors.map(x => (
              <span key={x} className="tactical-chip selected static">{x}</span>
            ))}
          </div>
        </div>
      )}

      {v.note && (
        <div className="detail-info-block">
          <span className="mono-sub">JURNAL LAPANGAN</span>
          <p className="detail-note-body">{v.note}</p>
        </div>
      )}

      {pinned && (
        <div className="detail-info-block">
          <span className="mono-sub">KOORDINAT PETA SATELIT</span>
          <MapPicker pos={{ lat: v.lat, lng: v.lng }} readOnly height={180} onPick={() => {}} />
        </div>
      )}

      <div className="detail-actions-footer">
        <button type="button" className="btn-ghost danger" onClick={onDelete}>
          HAPUS RECORD //
        </button>
        <button type="button" className="btn-ghost" onClick={onEdit}>
          UBAH // EDIT
        </button>
        {pinned && (
          <button type="button" className="btn-ghost highlight" onClick={onShowOnMap}>
            ⌖ FOKUS PETA LAPANGAN
          </button>
        )}
        <button type="button" className="btn-lime" onClick={onScrap}>
          🖼️ BUKA SCRAPBOOK
        </button>
        <button type="button" className="btn-ghost" onClick={onClose}>
          TUTUP [ESC]
        </button>
      </div>
    </div>
  );
}
