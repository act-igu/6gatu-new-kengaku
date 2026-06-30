import { useCallback, useMemo, useState } from 'react';
import type { Candidate, StatusCode } from './types';
import {
  CURRENT_STAFF_ID,
  createNewCandidate,
  mockCandidates,
} from './data/mockData';
import { StatusPane } from './components/StatusPane';
import { CandidateListPane } from './components/CandidateListPane';
import { DetailPane } from './components/DetailPane';
import { OperationPane } from './components/OperationPane';
import { getStatusLabel, isArchivedStatus } from './types';

export default function App() {
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [selectedStatus, setSelectedStatus] = useState<StatusCode>('NEW');
  const [selectedId, setSelectedId] = useState<string | null>('cand-001');
  const [globalSearch, setGlobalSearch] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const selectedCandidate = useMemo(
    () => candidates.find((c) => c.id === selectedId) ?? null,
    [candidates, selectedId],
  );

  const showSaveNotice = useCallback((message: string) => {
    setSaveNotice(message);
    window.setTimeout(() => setSaveNotice(null), 2000);
  }, []);

  const updateCandidate = useCallback(
    (id: string, updater: (c: Candidate) => Candidate) => {
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? updater(c) : c)),
      );
    },
  [],
  );

  const handleSaveCandidate = useCallback(
    (updated: Candidate) => {
      updateCandidate(updated.id, () => ({
        ...updated,
        updated_at: new Date().toISOString(),
      }));
      showSaveNotice('保存しました');
    },
    [updateCandidate, showSaveNotice],
  );

  const handleStatusChange = useCallback(
    (id: string, newStatus: StatusCode) => {
      updateCandidate(id, (c) => ({
        ...c,
        status: newStatus,
        updated_at: new Date().toISOString(),
      }));
      if (!globalSearch) {
        setSelectedStatus(newStatus);
      }
      showSaveNotice(`ステータスを「${getStatusLabel(newStatus)}」に変更しました`);
    },
    [updateCandidate, globalSearch, showSaveNotice],
  );

  const handleAppendMemo = useCallback(
    (id: string, body: string) => {
      const now = new Date().toISOString();
      updateCandidate(id, (c) => ({
        ...c,
        memos: [
          {
            entry_id: `memo-${crypto.randomUUID().slice(0, 8)}`,
            occurred_at: now,
            contact_date: now.slice(0, 10),
            author_staff_id: CURRENT_STAFF_ID,
            body,
          },
          ...c.memos,
        ],
        updated_at: now,
      }));
      showSaveNotice('面談記録を追記しました');
    },
    [updateCandidate, showSaveNotice],
  );

  const handleNewCandidate = useCallback(() => {
    const created = createNewCandidate();
    setCandidates((prev) => [created, ...prev]);
    setSelectedStatus('NEW');
    setGlobalSearch(false);
    setSelectedId(created.id);
    showSaveNotice('新規候補者を登録しました');
  }, [showSaveNotice]);

  const handleSelectStatus = useCallback(
    (code: StatusCode) => {
      setSelectedStatus(code);
      setGlobalSearch(false);
      const first = candidates.find((c) => c.status === code);
      setSelectedId(first?.id ?? null);
    },
    [candidates],
  );

  const breadcrumbName =
    selectedCandidate?.pane3.display_name ?? '（未選択）';

  const breadcrumbStatus = selectedCandidate && globalSearch
    ? getStatusLabel(selectedCandidate.status)
    : getStatusLabel(selectedStatus);

  return (
    <div className="app">
      <header className="app-header">
        <nav className="breadcrumb" aria-label="パンくず">
          <span>入居問い合わせ・見学</span>
          <span className="sep">&gt;</span>
          <span>{breadcrumbStatus}</span>
          <span className="sep">&gt;</span>
          <span className="current">{breadcrumbName}</span>
        </nav>
        <div className="header-actions">
          <label className="global-search-toggle">
            <input
              type="checkbox"
              checked={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.checked)}
            />
            全体検索
          </label>
          <button type="button" className="btn-header" onClick={handleNewCandidate}>
            ＋ 新規登録
          </button>
          {saveNotice && (
            <span className="save-notice" role="status">
              {saveNotice}
            </span>
          )}
        </div>
      </header>

      <main className="four-pane-layout">
        <StatusPane
          selectedStatus={selectedStatus}
          globalSearch={globalSearch}
          candidates={candidates}
          onSelectStatus={handleSelectStatus}
        />
        <CandidateListPane
          selectedStatus={selectedStatus}
          globalSearch={globalSearch}
          candidates={candidates}
          selectedId={selectedId}
          onSelectCandidate={(id) => {
            setSelectedId(id);
            const cand = candidates.find((c) => c.id === id);
            if (cand && globalSearch && !isArchivedStatus(cand.status)) {
              setSelectedStatus(cand.status);
            }
          }}
        />
        <DetailPane
          candidate={selectedCandidate}
          onSave={handleSaveCandidate}
        />
        <OperationPane
          candidate={selectedCandidate}
          onSave={handleSaveCandidate}
          onStatusChange={handleStatusChange}
          onAppendMemo={handleAppendMemo}
        />
      </main>
    </div>
  );
}
