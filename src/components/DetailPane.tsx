import { useEffect, useState, type ReactNode } from 'react';
import type { AcceptanceAssessment, Candidate, Gender, Role } from '../types';
import {
  certificateStatuses,
  disabilityTypes,
  formatDate,
  fromDatetimeLocalValue,
  resolveGenderLabel,
  siteTags,
  supportCategories,
  supportNeedLabels,
  toDatetimeLocalValue,
} from '../data/mockData';
import {
  maskAddress,
  maskContactName,
  maskDateOfBirth,
  maskEmail,
  maskOfficialName,
  maskPhone,
} from '../utils/masking';
import { DuplicateBanner, ViewerNotice } from './SharedAlerts';

interface DetailPaneProps {
  candidate: Candidate | null;
  allCandidates: Candidate[];
  role: Role;
  onSave: (candidate: Candidate) => void;
  onSelectDuplicate: (id: string) => void;
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="field-row">
      <label className="field-label">{label}</label>
      <div className="field-value">{children}</div>
    </div>
  );
}

export function DetailPane({
  candidate,
  allCandidates,
  role,
  onSave,
  onSelectDuplicate,
}: DetailPaneProps) {
  const [draft, setDraft] = useState<Candidate | null>(null);
  const [dirty, setDirty] = useState(false);
  const isViewer = role === 'viewer';

  useEffect(() => {
    if (candidate) {
      setDraft(structuredClone(candidate));
      setDirty(false);
    } else {
      setDraft(null);
      setDirty(false);
    }
  }, [candidate?.id, candidate?.updated_at]);

  if (!candidate || !draft) {
    return (
      <section className="pane pane-detail">
        <header className="detail-header">
          <h2 className="pane-title">詳細情報</h2>
        </header>
        <p className="empty-message">候補者を選択してください</p>
      </section>
    );
  }

  const p = draft.pane3;
  const acc = draft.acceptance;

  const updatePane3 = <K extends keyof typeof p>(
    key: K,
    value: (typeof p)[K],
  ) => {
    setDraft((prev) =>
      prev ? { ...prev, pane3: { ...prev.pane3, [key]: value } } : prev,
    );
    setDirty(true);
  };

  const updateAcceptance = <K extends keyof AcceptanceAssessment>(
    key: K,
    value: AcceptanceAssessment[K],
  ) => {
    setDraft((prev) =>
      prev
        ? { ...prev, acceptance: { ...prev.acceptance, [key]: value } }
        : prev,
    );
    setDirty(true);
  };

  const toggleSupportNeed = (
    key: keyof AcceptanceAssessment['support_needs'],
  ) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        acceptance: {
          ...prev.acceptance,
          support_needs: {
            ...prev.acceptance.support_needs,
            [key]: !prev.acceptance.support_needs[key],
          },
        },
      };
    });
    setDirty(true);
  };

  const updateSchedule = <K extends keyof Candidate['schedule']>(
    key: K,
    value: Candidate['schedule'][K],
  ) => {
    setDraft((prev) =>
      prev ? { ...prev, schedule: { ...prev.schedule, [key]: value } } : prev,
    );
    setDirty(true);
  };

  const toggleSiteTag = (code: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const tags = prev.site_tags.includes(code)
        ? prev.site_tags.filter((t) => t !== code)
        : [...prev.site_tags, code];
      return { ...prev, site_tags: tags };
    });
    setDirty(true);
  };

  const handleSave = () => {
    if (draft) onSave(draft);
    setDirty(false);
  };

  const readonlyInput = isViewer ? { readOnly: true, disabled: true } : {};

  return (
    <section className="pane pane-detail">
      <header className="detail-header">
        <h2 className="pane-title">詳細情報</h2>
        {!isViewer && (
          <button
            type="button"
            className="btn-save"
            disabled={!dirty}
            onClick={handleSave}
          >
            保存
          </button>
        )}
      </header>

      <ViewerNotice role={role} />
      <DuplicateBanner
        candidate={draft}
        allCandidates={allCandidates}
        onSelectDuplicate={onSelectDuplicate}
      />

      <div className="detail-section">
        <h3 className="section-title">受付・基本</h3>
        <FieldRow label="受付日">
          <span className="readonly-value">{formatDate(draft.created_at)}</span>
        </FieldRow>
        <FieldRow label="表示名">
          <input
            type="text"
            value={p.display_name}
            onChange={(e) => updatePane3('display_name', e.target.value)}
            {...readonlyInput}
          />
        </FieldRow>
        <FieldRow label="主連絡先">
          <input
            type="tel"
            value={maskPhone(p.phone_primary, role)}
            onChange={(e) => updatePane3('phone_primary', e.target.value)}
            {...readonlyInput}
          />
        </FieldRow>
        <FieldRow label="二次連絡先">
          <input
            type="text"
            placeholder="氏名（例: 田中 花子・母）"
            value={maskContactName(p.contact_secondary_name, role)}
            onChange={(e) =>
              updatePane3('contact_secondary_name', e.target.value)
            }
            {...readonlyInput}
          />
          <input
            type="tel"
            className="field-sub-input"
            placeholder="電話番号"
            value={maskPhone(p.phone_secondary, role)}
            onChange={(e) => updatePane3('phone_secondary', e.target.value)}
            {...readonlyInput}
          />
        </FieldRow>
        <FieldRow label="性別">
          <select
            value={p.gender}
            onChange={(e) => updatePane3('gender', e.target.value as Gender)}
            disabled={isViewer}
          >
            <option value="UNKNOWN">{resolveGenderLabel('UNKNOWN')}</option>
            <option value="MALE">{resolveGenderLabel('MALE')}</option>
            <option value="FEMALE">{resolveGenderLabel('FEMALE')}</option>
            <option value="OTHER">{resolveGenderLabel('OTHER')}</option>
          </select>
        </FieldRow>
        <FieldRow label="生年月日">
          <input
            type={isViewer ? 'text' : 'date'}
            value={
              isViewer
                ? maskDateOfBirth(p.date_of_birth, role)
                : (p.date_of_birth ?? '')
            }
            onChange={(e) =>
              updatePane3('date_of_birth', e.target.value || null)
            }
            {...readonlyInput}
          />
        </FieldRow>
        <FieldRow label="障害支援区分">
          <select
            value={p.support_category}
            onChange={(e) => updatePane3('support_category', e.target.value)}
            disabled={isViewer}
          >
            {supportCategories.map((cat) => (
              <option key={cat.code} value={cat.code}>
                {cat.label}
              </option>
            ))}
          </select>
        </FieldRow>
        <FieldRow label="拠点タグ">
          <div className="tag-checkboxes">
            {siteTags.map((tag) => (
              <label key={tag.code} className="tag-checkbox">
                <input
                  type="checkbox"
                  checked={draft.site_tags.includes(tag.code)}
                  onChange={() => toggleSiteTag(tag.code)}
                  disabled={isViewer}
                />
                {tag.label}
              </label>
            ))}
          </div>
        </FieldRow>
      </div>

      <div className="detail-section">
        <h3 className="section-title">受け入れ判定</h3>
        <FieldRow label="障害種別">
          <select
            value={acc.disability_type}
            onChange={(e) =>
              updateAcceptance(
                'disability_type',
                e.target.value as AcceptanceAssessment['disability_type'],
              )
            }
            disabled={isViewer}
          >
            {disabilityTypes.map((d) => (
              <option key={d.code} value={d.code}>
                {d.label}
              </option>
            ))}
          </select>
        </FieldRow>
        <FieldRow label="主たる障害">
          <input
            type="text"
            placeholder="未設定"
            value={acc.primary_disability}
            onChange={(e) =>
              updateAcceptance('primary_disability', e.target.value)
            }
            {...readonlyInput}
          />
        </FieldRow>
        <FieldRow label="必要な支援">
          <div className="tag-checkboxes">
            {supportNeedLabels.map(({ key, label }) => (
              <label key={key} className="tag-checkbox">
                <input
                  type="checkbox"
                  checked={acc.support_needs[key]}
                  onChange={() => toggleSupportNeed(key)}
                  disabled={isViewer}
                />
                {label}
              </label>
            ))}
          </div>
        </FieldRow>
        <FieldRow label="医療的ケア">
          <label className="inline-check">
            <input
              type="checkbox"
              checked={acc.medical_care_required}
              onChange={(e) =>
                updateAcceptance('medical_care_required', e.target.checked)
              }
              disabled={isViewer}
            />
            必要
          </label>
          <input
            type="text"
            className="field-sub-input"
            placeholder="医療的ケアの詳細"
            value={acc.medical_care_note}
            onChange={(e) =>
              updateAcceptance('medical_care_note', e.target.value)
            }
            {...readonlyInput}
          />
        </FieldRow>
        <FieldRow label="負担上限額">
          <input
            type="text"
            placeholder="未設定（例: 9300）"
            value={acc.user_burden_limit ?? ''}
            onChange={(e) =>
              updateAcceptance('user_burden_limit', e.target.value || null)
            }
            {...readonlyInput}
          />
        </FieldRow>
        <FieldRow label="受給者証">
          <select
            value={acc.certificate_status}
            onChange={(e) =>
              updateAcceptance(
                'certificate_status',
                e.target.value as AcceptanceAssessment['certificate_status'],
              )
            }
            disabled={isViewer}
          >
            {certificateStatuses.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </FieldRow>
        <FieldRow label="判定メモ">
          <textarea
            placeholder="受け入れ可否の所見など"
            rows={2}
            value={acc.acceptance_notes}
            onChange={(e) =>
              updateAcceptance('acceptance_notes', e.target.value)
            }
            {...readonlyInput}
          />
        </FieldRow>
      </div>

      <div className="detail-section">
        <h3 className="section-title">スケジュール</h3>
        <FieldRow label="見学日時">
          <input
            type="datetime-local"
            value={toDatetimeLocalValue(draft.schedule.tour_datetime)}
            onChange={(e) =>
              updateSchedule(
                'tour_datetime',
                fromDatetimeLocalValue(e.target.value),
              )
            }
            disabled={isViewer}
          />
        </FieldRow>
        <FieldRow label="入居予定日">
          <input
            type="date"
            value={draft.schedule.move_in_planned_date ?? ''}
            onChange={(e) =>
              updateSchedule('move_in_planned_date', e.target.value || null)
            }
            disabled={isViewer}
          />
        </FieldRow>
      </div>

      <div className="detail-section">
        <h3 className="section-title">本人・基本</h3>
        <FieldRow label="正式氏名">
          <input
            type="text"
            placeholder="未設定"
            value={maskOfficialName(p.official_name, role)}
            onChange={(e) => updatePane3('official_name', e.target.value)}
            {...readonlyInput}
          />
        </FieldRow>
        <FieldRow label="住所・居住状況">
          <textarea
            placeholder="未設定"
            rows={3}
            value={maskAddress(p.address_situation, role)}
            onChange={(e) => updatePane3('address_situation', e.target.value)}
            {...readonlyInput}
          />
        </FieldRow>
      </div>

      <div className="detail-section">
        <h3 className="section-title">相談支援・紹介経路</h3>
        <FieldRow label="専門員氏名">
          <input
            type="text"
            placeholder="未設定"
            value={p.specialist_name}
            onChange={(e) => updatePane3('specialist_name', e.target.value)}
            {...readonlyInput}
          />
        </FieldRow>
        <FieldRow label="事業所名">
          <input
            type="text"
            placeholder="未設定"
            value={p.specialist_office}
            onChange={(e) => updatePane3('specialist_office', e.target.value)}
            {...readonlyInput}
          />
        </FieldRow>
        <FieldRow label="専門員電話">
          <input
            type="tel"
            placeholder="未設定"
            value={maskPhone(p.specialist_phone, role)}
            onChange={(e) => updatePane3('specialist_phone', e.target.value)}
            {...readonlyInput}
          />
        </FieldRow>
        <FieldRow label="専門員メール">
          <input
            type="email"
            placeholder="未設定"
            value={maskEmail(p.specialist_email, role)}
            onChange={(e) => updatePane3('specialist_email', e.target.value)}
            {...readonlyInput}
          />
        </FieldRow>
        <FieldRow label="紹介・問い合わせ経路">
          <textarea
            placeholder="未設定"
            rows={2}
            value={p.referral_route}
            onChange={(e) => updatePane3('referral_route', e.target.value)}
            {...readonlyInput}
          />
        </FieldRow>
      </div>
    </section>
  );
}
