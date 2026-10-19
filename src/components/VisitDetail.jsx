import { Stars } from './Stars';
import MapPicker from './MapPicker';
import { TYPES, fmtDate } from '../lib/util';

export default function VisitDetail({ v, onEdit, onDelete, onScrap, onClose, onShowOnMap }) {
  const pinned = typeof v.lat === 'number';
  return (
    <div>
      <h2>{v.sticker} {v.name}</h2>
      <div className="meta"><span className="tag">{TYPES[v.type]}</span>{fmtDate(v.date)}{v.area ? ` · ${v.area}` : ''}</div>
      <p><Stars value={v.rating} /> <b>{v.rating.toFixed(1)}</b><br />
        <span className="meta">Kopi {v.ratings.coffee || '-'} · Suasana {v.ratings.vibe || '-'} · Pelayanan {v.ratings.service || '-'}</span></p>
      {v.photos.length > 0 && <div className="detail-photos">{v.photos.map((p, i) => <img key={i} src={p} alt={`Foto ${v.name} ${i + 1}`} />)}</div>}
      {v.menu && <p>{v.menu}</p>}
      {(v.brew || v.bean) && <p className="meta">{[v.brew, v.bean].filter(Boolean).join(' · ')}</p>}
      {v.flavors?.length > 0 && <div>{v.flavors.map(x => <span className="tag" key={x}>{x}</span>)}</div>}
      {v.note && <p style={{ whiteSpace: 'pre-wrap' }}>{v.note}</p>}
      {pinned && <MapPicker pos={{ lat: v.lat, lng: v.lng }} readOnly height={160} onPick={() => {}} />}
      <div className="actions">
        <button className="ghost danger" onClick={onDelete}>Hapus</button>
        <button className="ghost" onClick={onEdit}>Ubah</button>
        {pinned && <button className="ghost" onClick={onShowOnMap}>Di peta</button>}
        <button className="ghost" onClick={onScrap}>Scrapbook</button>
        <button className="outline" onClick={onClose}>Tutup</button>
      </div>
    </div>
  );
}
