import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Candidate, Staff, StatusCode } from './types';
import { CURRENT_STAFF_ID } from './data/mockData';
import { StatusPane } from './components/StatusPane';
import { CandidateListPane } from './components/CandidateListPane';
import { DetailPane } from './components/DetailPane';
import { OperationPane } from './components/OperationPane';
import { RoleBadge } from './components/SharedAlerts';
import { getStatusLabel, isArchivedStatus } from './types';
import { findDuplicateCandidates } from './utils/duplicates';
import * as api from './api/client';

export default function App() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<StatusCode>('NEW');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState(false);
  const [currentStaffId, setCurrentStaffId] = useState(CURRENT_STAFF_ID);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [staff, list] = await Promise.all([
        api.fetchStaff(),
        api.fetchCandidates(),
      ]);
      setStaffList(staff);
      setCandidates(list);
      if (list.length > 0) {
        setSelectedId((current) => {
          if (current && list.some((c) => c.id === current)) return current;
          return (list.find((c) => c.status === 'NEW') ?? list[0]).id;
        });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'データの読み込みに失敗しました',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentStaff = useMemo(
    () => staffList.find((s) => s.staff_id === currentStaffId) ?? staffList[0],
    [staffList, currentStaffId],
  );

  const selectedCandidate = useMemo(
    () => candidates.find((c) => c.id === selectedId) ?? null,
    [candidates, selectedId],
  );

  const showSaveNotice = useCallback((message: string) => {
    setSaveNotice(message);
    window.setTimeout(() => setSaveNotice(null), 2500);
  }, []);

  const replaceCandidate = useCallback((updated: Candidate) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c)),
    );
  }, []);

  const handleSaveCandidate = useCallback(
    async (updated: Candidate) => {
      setSaving(true);
      try {
        const saved = await api.updateCandidate(updated);
        replaceCandidate(saved);
        const duplicates = findDuplicateCandidates(saved, candidates).filter(
          (d) => d.id !== saved.id,
        );
        if (duplicates.length > 0) {
          showSaveNotice(
            `保存しました（同一電話の候補者が ${duplicates.length} 件あります）`,
          );
        } else {
          showSaveNotice('保存しました');
        }
      } catch (err) {
        showSaveNotice(
          err instanceof Error ? err.message : '保存に失敗しました',
        );
      } finally {
        setSaving(false);
      }
    },
    [candidates, replaceCandidate, showSaveNotice],
  );

  const handleStatusChange = useCallback(
    async (id: string, newStatus: StatusCode) => {
      setSaving(true);
      try {
        const updated = await api.updateCandidateStatus(id, newStatus);
        replaceCandidate(updated);
        if (!globalSearch) {
          setSelectedStatus(newStatus);
        }
        showSaveNotice(
          `ステータスを「${getStatusLabel(newStatus)}」に変更しました`,
        );
      } catch (err) {
        showSaveNotice(
          err instanceof Error ? err.message : 'ステータス変更に失敗しました',
        );
      } finally {
        setSaving(false);
      }
    },
    [globalSearch, replaceCandidate, showSaveNotice],
  );

  const handleAppendMemo = useCallback(
    async (id: string, body: string) => {
      setSaving(true);
      try {
        const updated = await api.appendMemo(id, body, currentStaffId);
        replaceCandidate(updated);
        showSaveNotice('面談記録を追記しました');
      } catch (err) {
        showSaveNotice(
          err instanceof Error ? err.message : '追記に失敗しました',
        );
      } finally {
        setSaving(false);
      }
    },
    [currentStaffId, replaceCandidate, showSaveNotice],
  );

  const handleNewCandidate = useCallback(async () => {
    setSaving(true);
    try {
      const created = await api.createCandidate(currentStaffId);
      setCandidates((prev) => [created, ...prev]);
      setSelectedStatus('NEW');
      setGlobalSearch(false);
      setSelectedId(created.id);
      showSaveNotice('新規候補者を登録しました');
    } catch (err) {
      showSaveNotice(
        err instanceof Error ? err.message : '登録に失敗しました',
      );
    } finally {
      setSaving(false);
    }
  }, [currentStaffId, showSaveNotice]);

  const handleSelectStatus = useCallback(
    (code: StatusCode) => {
      setSelectedStatus(code);
      setGlobalSearch(false);
      const first = candidates.find((c) => c.status === code);
      setSelectedId(first?.id ?? null);
    },
    [candidates],
  );

  const handleSelectCandidate = useCallback(
    (id: string) => {
      setSelectedId(id);
      const cand = candidates.find((c) => c.id === id);
      if (cand && globalSearch && !isArchivedStatus(cand.status)) {
        setSelectedStatus(cand.status);
      }
    },
    [candidates, globalSearch],
  );

  const breadcrumbName =
    selectedCandidate?.pane3.display_name ?? '（未選択）';

  const breadcrumbStatus =
    selectedCandidate && globalSearch
      ? getStatusLabel(selectedCandidate.status)
      : getStatusLabel(selectedStatus);

  const isViewer = currentStaff?.role === 'viewer';

  if (loading) {
    return (
      <div className="app app-loading">
        <p>データを読み込んでいます...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app app-error">
        <h1>接続エラー</h1>
        <p>{error}</p>
        <p className="error-hint">
          DATABASE_URL が設定されているか、<code>npm run db:setup</code>{' '}
          を実行したか確認してください。
        </p>
        <button type="button" className="btn-header" onClick={loadData}>
          再試行
        </button>
      </div>
    );
  }

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
          <div className="staff-switcher">
            <label htmlFor="staff-select" className="staff-label">
              ログイン
            </label>
            <select
              id="staff-select"
              className="staff-select"
              value={currentStaffId}
              onChange={(e) => setCurrentStaffId(e.target.value)}
            >
              {staffList
                .filter((s) => s.active)
                .map((s) => (
                  <option key={s.staff_id} value={s.staff_id}>
                    {s.display_name}
                  </option>
                ))}
            </select>
            {currentStaff && <RoleBadge staff={currentStaff} />}
          </div>
          <label className="global-search-toggle">
            <input
              type="checkbox"
              checked={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.checked)}
            />
            全体検索
          </label>
          {!isViewer && (
            <button
              type="button"
              className="btn-header"
              disabled={saving}
              onClick={handleNewCandidate}
            >
              ＋ 新規登録
            </button>
          )}
          {saving && <span className="saving-indicator">保存中...</span>}
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
          onSelectCandidate={handleSelectCandidate}
        />
        <DetailPane
          candidate={selectedCandidate}
          allCandidates={candidates}
          role={currentStaff?.role ?? 'viewer'}
          onSave={handleSaveCandidate}
          onSelectDuplicate={handleSelectCandidate}
        />
        <OperationPane
          candidate={selectedCandidate}
          allCandidates={candidates}
          role={currentStaff?.role ?? 'viewer'}
          onSave={handleSaveCandidate}
          onStatusChange={handleStatusChange}
          onAppendMemo={handleAppendMemo}
          onSelectDuplicate={handleSelectCandidate}
        />
      </main>
    </div>
  );
}
