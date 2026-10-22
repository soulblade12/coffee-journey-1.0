import React, { useRef } from 'react';
import { Download, Upload, Trophy, Flame, CheckCircle2, Award } from 'lucide-react';
import { Card, Button, Tag } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import {
  computeUserStats,
  getWeeklyMissions,
  BADGES,
  earnedBadges,
  titleForLevel,
  xpForLevel,
  levelProgress,
} from '../lib';
import { todayStr } from '@/shared/lib/date';
import { COPY } from '@/shared/copy/id';

export function Quest({ visits = [], onImport, notify }) {
  const stats = computeUserStats(visits);
  const missions = getWeeklyMissions(visits);
  const earned = earnedBadges(stats);
  const nextLevelXp = xpForLevel(stats.level + 1);
  const fileInputRef = useRef(null);

  const handleExportBackup = () => {
    const dataStr = JSON.stringify(visits, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jejak-kopi-cadangan-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify?.('Cadangan data berhasil diunduh!');
  };

  const handleImportBackup = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error();
      if (confirm(`Ganti data saat ini dengan ${parsed.length} entri dari berkas cadangan?`)) {
        await onImport(parsed);
      }
    } catch {
      notify?.('Format berkas cadangan JSON tidak valid.');
    }
  };

  const pct = Math.round(levelProgress(stats.xp, stats.level) * 100);

  return (
    <div className="flex flex-col gap-6 w-full text-warm-cream">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-cork-border/40">
        <div>
          <span className="text-[11px] font-mono text-driftwood uppercase tracking-wider">
            {COPY.brand} // {COPY.nav.gamification}
          </span>
          <h1 className="text-2xl sm:text-3xl font-sans font-medium uppercase tracking-tight text-warm-cream mt-0.5">
            Petualangan & Lencana
          </h1>
          <p className="text-xs text-driftwood mt-1 max-w-xl">
            Progres eksplorasi kopimu: akumulasi XP, misi mingguan, dan koleksi lencana kebanggaan para penikmat seduhan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleExportBackup} className="inline-flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Ekspor Cadangan
          </Button>
          <label className="cursor-pointer">
            <span className="inline-flex items-center justify-center font-sans font-medium uppercase tracking-wider text-xs px-3.5 py-1.5 rounded-ghost gap-1.5 bg-transparent text-warm-cream border border-cork-border hover:border-driftwood transition-colors">
              <Upload className="w-3.5 h-3.5" />
              Impor Cadangan
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Level & XP Hero Card */}
      <Card className="flex flex-col gap-5 p-6 bg-[#160d07] border-cork-border">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Tag variant="ember" className="inline-flex items-center gap-1.5">
            <Trophy className="w-3 h-3" />
            LEVEL {stats.level} // REPUTASI
          </Tag>
          <span className="font-mono text-xs text-driftwood">
            {stats.xp} TOTAL XP TERKUMPUL
          </span>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-sans font-bold uppercase tracking-wide text-warm-cream">
            {titleForLevel(stats.level)}
          </h2>
          <span className="text-xs text-driftwood font-mono mt-1 flex items-center gap-1.5">
            {stats.weeklyStreak > 0 ? (
              <>
                <Flame className="w-3.5 h-3.5 text-ember-accent" />
                Streak Ngopi: {stats.weeklyStreak} Minggu Berturut-turut
              </>
            ) : (
              'Mulai streak ngopimu minggu ini!'
            )}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-1.5">
          <div className="h-2 w-full bg-walnut-shadow rounded-full overflow-hidden border border-cork-border/50">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-ember-accent to-warm-cream transition-all duration-300 rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-driftwood">
            <span>{stats.xp} XP</span>
            <span>
              {Math.max(0, nextLevelXp - stats.xp)} XP lagi menuju Level {stats.level + 1}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-cork-border/30">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-driftwood uppercase">Kedai Dicoba</span>
            <span className="text-xl font-bold font-mono text-warm-cream">{stats.uniquePlaces}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-driftwood uppercase">Total Kunjungan</span>
            <span className="text-xl font-bold font-mono text-warm-cream">{stats.visitedCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-driftwood uppercase">Wishlist</span>
            <span className="text-xl font-bold font-mono text-amber-300">{stats.wishlistCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-driftwood uppercase">Stiker Koleksi</span>
            <span className="text-xl font-bold font-mono text-warm-cream">{stats.stickersCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-driftwood uppercase">Profil Rasa</span>
            <span className="text-xl font-bold font-mono text-emerald-300">{stats.flavorsCount}</span>
          </div>
        </div>
      </Card>

      {/* Weekly Missions */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-mono text-driftwood uppercase tracking-wider">
            Target Misi Mingguan
          </span>
          <span className="text-xs font-mono text-warm-cream/80">
            {missions.filter((m) => m.done).length} / {missions.length} Selesai
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {missions.map((m) => (
            <div
              key={m.id}
              className={`p-3.5 rounded-card border flex flex-col justify-between gap-2.5 transition-colors ${
                m.done
                  ? 'bg-emerald-950/20 border-emerald-800/40'
                  : 'bg-[#140c06] border-cork-border'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{m.emoji}</span>
                  <span className="text-xs font-medium text-warm-cream uppercase tracking-wide">
                    {m.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bark-brown text-amber-200">
                  +{m.xp} XP
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <div className="h-1.5 w-full bg-walnut-shadow rounded-full overflow-hidden border border-cork-border/40">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      m.done ? 'bg-emerald-400' : 'bg-ember-accent'
                    }`}
                    style={{ width: `${Math.round((m.current / m.goal) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-driftwood">
                  <span>Progres: {m.current} / {m.goal}</span>
                  {m.done && <span className="text-emerald-400 font-bold">✓ SELESAI</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges Collection */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-mono text-driftwood uppercase tracking-wider">
            Koleksi Lencana ({earned.size} / {BADGES.length})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {BADGES.map((b) => {
            const has = earned.has(b.id);
            return (
              <div
                key={b.id}
                className={`p-3 rounded-card border flex flex-col items-center text-center gap-1.5 transition-colors ${
                  has
                    ? 'bg-[#180f08] border-ember-accent/40 shadow-sm'
                    : 'bg-[#120a05] border-cork-border/30 opacity-40'
                }`}
              >
                <span className="text-2xl">{b.icon}</span>
                <span className="font-sans font-medium text-xs text-warm-cream uppercase tracking-wide">
                  {b.name}
                </span>
                <span className="text-[10px] text-driftwood leading-tight line-clamp-2">
                  {b.desc}
                </span>
                {has && (
                  <span className="text-[9px] font-mono text-emerald-400 font-bold mt-1">
                    ✓ TERBUKA
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Quest;
