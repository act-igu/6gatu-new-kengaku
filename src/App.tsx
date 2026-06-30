import { useMemo, useState } from 'react';
import type { StatusCode } from './types';
import { mockCandidates } from './data/mockData';
import { StatusPane } from './components/StatusPane';
import { CandidateListPane } from './components/CandidateListPane';
import { DetailPane } from './components/DetailPane';
import { OperationPane } from './components/OperationPane';
import { getStatusLabel } from './types';

export default function App() {
  const [selectedStatus, setSelectedStatus] = useState<StatusCode>('NEW');
  const [selectedId, setSelectedId] = useState<string | null>('cand-001');

  const selectedCandidate = useMemo(
    () => mockCandidates.find((c) => c.id === selectedId) ?? null,
    [selectedId],
  );

  const breadcrumbName =
    selectedCandidate?.pane3.display_name ?? '（未選択）';

  return (
    <div className="app">
      <header className="app-header">
        <nav className="breadcrumb" aria-label="パンくず">
          <span>入居問い合わせ・見学</span>
          <span className="sep">&gt;</span>
          <span>{getStatusLabel(selectedStatus)}</span>
          <span className="sep">&gt;</span>
          <span className="current">{breadcrumbName}</span>
        </nav>
      </header>

      <main className="four-pane-layout">
        <StatusPane
          selectedStatus={selectedStatus}
          candidates={mockCandidates}
          onSelectStatus={(code) => {
            setSelectedStatus(code);
            const first = mockCandidates.find((c) => c.status === code);
            setSelectedId(first?.id ?? null);
          }}
        />
        <CandidateListPane
          selectedStatus={selectedStatus}
          candidates={mockCandidates}
          selectedId={selectedId}
          onSelectCandidate={setSelectedId}
        />
        <DetailPane candidate={selectedCandidate} />
        <OperationPane candidate={selectedCandidate} />
      </main>
    </div>
  );
}
