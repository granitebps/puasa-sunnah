import { FormEvent, useEffect, useRef, useState } from 'react';

import { ExportRequest, ExportScope, Fasting, Type } from '../types';
import CalendarImportGuide from './CalendarImportGuide';
import './AddToCalendarModal.css';

interface AddToCalendarModalProps {
  open: boolean;
  currentMonth: number;
  currentYear: number;
  fastings: Fasting[];
  types: Type[];
  isLoading: boolean;
  loadError: string | null;
  deliveryError: string | null;
  deliverySuccess: string | null;
  onClose: () => void;
  onLoad: () => void;
  onExport: (request: ExportRequest) => void;
}

const months = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

function AddToCalendarModal({
  open,
  currentMonth,
  currentYear,
  fastings,
  types,
  isLoading,
  loadError,
  deliveryError,
  deliverySuccess,
  onClose,
  onLoad,
  onExport,
}: AddToCalendarModalProps) {
  const [scope, setScope] = useState<ExportScope>('current-month');
  const [month, setMonth] = useState(currentMonth);
  const [selectedTypeIds, setSelectedTypeIds] = useState<number[]>([]);
  const [reminder, setReminder] = useState<ExportRequest['reminder']>('none');
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setScope('current-month');
    setMonth(currentMonth);
    setReminder('none');
    closeButtonRef.current?.focus();
  }, [currentMonth, open]);

  useEffect(() => {
    if (open) {
      onLoad();
    }
  }, [onLoad, open]);

  useEffect(() => {
    setSelectedTypeIds(types.map((type) => type.id));
  }, [types]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const allTypesSelected =
    types.length > 0 && selectedTypeIds.length === types.length;
  const canExport =
    !isLoading && !loadError && fastings.length > 0 && selectedTypeIds.length > 0;

  const toggleType = (typeId: number) => {
    setSelectedTypeIds((current) =>
      current.includes(typeId)
        ? current.filter((id) => id !== typeId)
        : [...current, typeId],
    );
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (canExport) {
      onExport({
        scope,
        month: scope === 'current-month' ? currentMonth : month,
        year: currentYear,
        typeIds: selectedTypeIds,
        reminder,
      });
    }
  };

  return (
    <div className='calendar-export-backdrop' onMouseDown={onClose}>
      <section
        aria-labelledby='calendar-export-title'
        aria-modal='true'
        className='calendar-export-modal'
        onMouseDown={(event) => event.stopPropagation()}
        role='dialog'
      >
        <div className='calendar-export-header'>
          <h2 id='calendar-export-title'>Add to calendar</h2>
          <button
            aria-label='Close add to calendar'
            className='calendar-export-close'
            onClick={onClose}
            ref={closeButtonRef}
            type='button'
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='calendar-export-step-header'>
            <span>Step 1</span>
            <h3>Choose and download schedule</h3>
          </div>
          <fieldset>
            <legend>Schedule period</legend>
            <label>
              <input
                checked={scope === 'current-month'}
                name='export-scope'
                onChange={() => setScope('current-month')}
                type='radio'
              />
              Current Month ({months[currentMonth - 1]} {currentYear})
            </label>
            <label>
              <input
                checked={scope === 'specific-month'}
                name='export-scope'
                onChange={() => setScope('specific-month')}
                type='radio'
              />
              Specific month
            </label>
            <label>
              <input
                checked={scope === 'current-year'}
                name='export-scope'
                onChange={() => setScope('current-year')}
                type='radio'
              />
              Current Year ({currentYear})
            </label>
          </fieldset>

          {scope === 'specific-month' && (
            <div className='calendar-export-date-fields'>
              <label>
                Month
                <select
                  onChange={(event) => setMonth(Number(event.target.value))}
                  value={month}
                >
                  {months.map((monthName, index) => (
                    <option key={monthName} value={index + 1}>
                      {monthName}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <fieldset disabled={isLoading}>
            <legend>Fasting types</legend>
            <label>
              <input
                checked={allTypesSelected}
                onChange={() =>
                  setSelectedTypeIds(allTypesSelected ? [] : types.map((type) => type.id))
                }
                type='checkbox'
              />
              All types
            </label>
            <div className='calendar-export-types'>
              {types.map((type) => (
                <label key={type.id}>
                  <input
                    checked={selectedTypeIds.includes(type.id)}
                    onChange={() => toggleType(type.id)}
                    type='checkbox'
                  />
                  {type.name}
                </label>
              ))}
            </div>
          </fieldset>

          <label className='calendar-export-reminder'>
            Notification
            <select
              onChange={(event) =>
                setReminder(event.target.value as ExportRequest['reminder'])
              }
              value={reminder}
            >
              <option value='none'>Export without reminder</option>
              <option value='one-day-before'>
                Export with reminder 1 day before at 9:00 AM
              </option>
            </select>
            <small className='calendar-export-help'>
              No reminder will be added by Puasa Sunnah Calendar. Your calendar app may still apply its own default notifications.
            </small>
          </label>

          <div aria-live='polite' className='calendar-export-status'>
            {isLoading && <p>Loading fasting schedule…</p>}
            {loadError && (
              <div className='calendar-export-error'>
                <p>{loadError}</p>
                <button onClick={onLoad} type='button'>
                  Retry
                </button>
              </div>
            )}
            {!isLoading && !loadError && fastings.length === 0 && (
              <p>No fasting schedule found for this period.</p>
            )}
            {!isLoading && !loadError && fastings.length > 0 && selectedTypeIds.length === 0 && (
              <p>Select at least one fasting type.</p>
            )}
            {deliveryError && <p className='calendar-export-error'>{deliveryError}</p>}
            {deliverySuccess && (
              <p className='calendar-export-success'>{deliverySuccess}</p>
            )}
          </div>

          <CalendarImportGuide openByDefault={Boolean(deliverySuccess)} />

          <div className='calendar-export-actions'>
            <button onClick={onClose} type='button'>
              Cancel
            </button>
            <button className='calendar-export-primary' disabled={!canExport} type='submit'>
              Download .ics file
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AddToCalendarModal;
