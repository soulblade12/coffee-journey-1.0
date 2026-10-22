import React, { useEffect } from 'react';
import { MapPin, BookOpen, Image as ImageIcon, Trophy, Plus, Sparkles } from 'lucide-react';
import { useVisitsStore } from '@/store/useVisitsStore';
import { useUiStore } from '@/store/useUiStore';
import { computeUserStats } from '@/features/gamification/lib';
import { MapView } from '@/features/map/MapView';
import { Journal } from '@/features/journal/Journal';
import { Scrapbook } from '@/features/scrapbook/Scrapbook';
import { Quest } from '@/features/gamification/components/Quest';
import { QuickCheckinModal } from '@/features/visits/QuickCheckinModal';
import { VisitForm } from '@/features/visits/VisitForm';
import { VisitDetail } from '@/features/visits/VisitDetail';
import { Modal } from '@/shared/ui';
import { COPY } from '@/shared/copy/id';

const TABS = [
  { id: 'map', label: '01 // PETA KAFE', Icon: MapPin },
  { id: 'journal', label: '02 // LOGBOOK SEDUHAN', Icon: BookOpen },
  { id: 'scrap', label: '03 // BUKU KENANGAN', Icon: ImageIcon },
  { id: 'quest', label: '04 // PETUALANGAN', Icon: Trophy },
];

export default function App() {
  const { visits, loading, fetchVisits, saveVisit, patchVisitRecord, removeVisitRecord, importVisitsList } =
    useVisitsStore();

  const {
    activeTab,
    setActiveTab,
    quickCheckinDraft,
    openQuickCheckin,
    closeQuickCheckin,
    fullForm,
    openFullForm,
    closeFullForm,
    detailId,
    openDetail,
    closeDetail,
    scrapId,
    setScrapId,
    mapFocus,
    setMapFocus,
    toast,
    showToast,
  } = useUiStore();

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const stats = computeUserStats(visits);
  const detailVisit = visits.find((v) => v.id === detailId);
  const editingVisit = fullForm?.id ? visits.find((v) => v.id === fullForm.id) : null;

  const handleSaveVisit = async (data, isEditId = null) => {
    try {
      console.log('[App] handleSaveVisit called with:', data);
      const res = await saveVisit(data, isEditId || fullForm?.id);
      console.log('[App] saveVisit returned:', res);
      closeQuickCheckin();
      closeFullForm();
      showToast(res.toastMessage);
    } catch (err) {
      console.error('[App] handleSaveVisit error:', err);
      showToast('Kapasitas penyimpanan penuh. Kurangi resolusi atau jumlah foto.');
    }
  };

  const handleDeleteVisit = async (id) => {
    if (!confirm('Hapus catatan kunjungan ini dari logbook?')) return;
    await removeVisitRecord(id);
    closeDetail();
    showToast('Catatan kunjungan berhasil dihapus.');
  };

  return (
    <div className="min-h-screen bg-walnut-shadow text-warm-cream flex flex-col font-sans selection:bg-ember-accent selection:text-warm-cream">
      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 px-4 sm:px-8 py-3.5 bg-walnut-shadow/95 backdrop-blur-md border-b border-cork-border">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className="flex items-center gap-2 font-sans font-medium uppercase tracking-wider text-sm sm:text-base text-warm-cream hover:opacity-90 transition-opacity"
          >
            <span>{COPY.brand}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-ember-accent" />
          </button>
          <span className="hidden md:inline-block font-mono text-[10px] text-driftwood uppercase border border-cork-border/60 px-2 py-0.5 rounded-sm">
            {COPY.tagline}
          </span>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 p-1 bg-[#140c06] border border-cork-border rounded-ghost" aria-label="Navigasi Utama">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded-ghost transition-colors ${
                activeTab === id
                  ? 'bg-bark-brown text-warm-cream font-medium border border-cork-border/70'
                  : 'text-driftwood hover:text-warm-cream'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#140c06] border border-cork-border rounded-pill text-xs font-mono text-driftwood">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-warm-cream font-medium">LVL {stats.level}</span>
            <span className="hidden sm:inline">// {stats.xp} XP</span>
          </div>

          <button
            type="button"
            onClick={() => openQuickCheckin({})}
            className="inline-flex items-center gap-1.5 font-sans font-medium uppercase tracking-wider text-xs px-4 py-2 rounded-pill bg-bark-brown text-warm-cream hover:bg-[#4a3120] border border-cork-border/60 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{COPY.nav.pinCafe}</span>
          </button>
        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 pb-24 lg:pb-12">
        {activeTab === 'map' && (
          <MapView
            visits={visits}
            focus={mapFocus}
            onAdd={(draft) => openQuickCheckin(draft)}
            onOpen={(id) => openDetail(id)}
          />
        )}

        {activeTab === 'journal' && (
          <Journal
            visits={visits}
            onOpen={(id) => openDetail(id)}
            onGoMap={() => setActiveTab('map')}
          />
        )}

        {activeTab === 'scrap' && (
          <Scrapbook
            visits={visits}
            selectedId={scrapId}
            onSelect={(id) => setScrapId(id)}
            onUpdate={(id, patch) => patchVisitRecord(id, patch)}
            notify={showToast}
          />
        )}

        {activeTab === 'quest' && (
          <Quest
            visits={visits}
            notify={showToast}
            onImport={async (list) => {
              await importVisitsList(list);
              showToast('Cadangan data berhasil diimpor!');
            }}
          />
        )}
      </main>

      {/* Mobile & Tablet Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-walnut-shadow/95 backdrop-blur-md border-t border-cork-border flex items-center justify-around py-2 px-3 pb-[max(8px,env(safe-area-inset-bottom))]">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded text-center transition-colors ${
              activeTab === id
                ? 'text-warm-cream bg-bark-brown/50'
                : 'text-driftwood hover:text-warm-cream'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-mono uppercase tracking-tight">
              {label.replace(/^\d+\s*\/\/\s*/, '')}
            </span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <footer className="hidden lg:flex items-center justify-between px-8 py-4 border-t border-cork-border/40 text-xs font-mono text-driftwood">
        <span>ORYZO DARKROOM EDITORIAL // JEJAK KOPI 2.0</span>
        <span>PENYIMPANAN: DEXIE INDEXEDDB LOKAL // PETA SATELIT: ESRI WORLD IMAGERY</span>
      </footer>

      {/* 30-Second Quick Check-in Drawer */}
      <QuickCheckinModal
        open={Boolean(quickCheckinDraft)}
        draft={quickCheckinDraft}
        onClose={closeQuickCheckin}
        onSaveQuick={(data) => handleSaveVisit(data)}
        onOpenFullForm={(draftPrefill) => openFullForm({ draft: draftPrefill })}
      />

      {/* Full Visit Form Modal */}
      <Modal open={Boolean(fullForm)} onClose={closeFullForm}>
        {fullForm && (
          <VisitForm
            key={fullForm.id || 'new'}
            initial={editingVisit}
            draft={fullForm.draft}
            onSave={(data) => handleSaveVisit(data, fullForm.id)}
            onCancel={closeFullForm}
            notify={showToast}
          />
        )}
      </Modal>

      {/* Visit Detail Modal */}
      <Modal open={Boolean(detailVisit)} onClose={closeDetail}>
        {detailVisit && (
          <VisitDetail
            v={detailVisit}
            allVisits={visits}
            onClose={closeDetail}
            onDelete={() => handleDeleteVisit(detailVisit.id)}
            onEdit={() => {
              const editId = detailVisit.id;
              closeDetail();
              openFullForm({ id: editId });
            }}
            onScrap={() => {
              setScrapId(detailVisit.id);
              closeDetail();
              setActiveTab('scrap');
            }}
            onShowOnMap={() => {
              if (typeof detailVisit.lat === 'number' && typeof detailVisit.lng === 'number') {
                setMapFocus({ lat: detailVisit.lat, lng: detailVisit.lng });
              }
              closeDetail();
              setActiveTab('map');
            }}
          />
        )}
      </Modal>

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 lg:bottom-6 right-4 sm:right-8 z-[10000] flex items-center gap-2 px-4 py-2.5 bg-[#180f08] border border-cork-border text-warm-cream text-xs font-mono rounded shadow-2xl animate-fade-in"
        >
          <span className="w-2 h-2 rounded-full bg-ember-accent" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
