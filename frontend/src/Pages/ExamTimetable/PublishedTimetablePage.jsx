import { memo, useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import '../../Style/Pages/ExamTimetablePage.css';
import { useAlert } from '../../Components/AlertContextProvider';
import { useAuth } from '../../Components/AuthContext';
import { useConfirm } from '../../Components/ConfirmContextProvider';
import {
    getExams,
    printTimetable,
    downloadTimetable,
    formatTo12Hour,
    deleteExam,
    updateExam
} from '../../Script/ExamDataFetcher';
import Trash from '../../Icons/Trash';
import EditIcon from '../../Icons/Edit';
import { getSubjectsDetailsList } from '../../Script/SubjectsDataFetcher';
import SearchIcon from '../../Icons/Search';
import ExamTimetableIcon from '../../Icons/ExamTimetableIcon';
import Printer from '../../Icons/Printer';
import Download from '../../Icons/Download';

import { TIME_SLOTS, SEMESTERS, DEPARTMENTS, canScheduleTimetable } from '../../Script/Constants';

function PublishedTimetablePage() {
    const { user } = useAuth();
    const isCoordinator = canScheduleTimetable(user?.email);
    const { showError, showSuccess } = useAlert();
    const { showErrorConfirm } = useConfirm();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterSemester, setFilterSemester] = useState();
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterExamType, setFilterExamType] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const searchRef = useRef(null);

    useEffect(() => {
        function handleKeyDown(e) {
            const tag = document.activeElement?.tagName;
            const isEditable = document.activeElement?.isContentEditable;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || isEditable) return;
            if (e.key === '/') {
                e.preventDefault();
                searchRef.current?.focus();
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useLayoutEffect(() => {
        const appRoot = document.querySelector('.app');
        if (!appRoot) return;

        appRoot.classList.add('published-timetable-no-page-scroll');
        appRoot.classList.add('exam-timetable-hide-outer-scrollbar');
        return () => {
            appRoot.classList.remove('published-timetable-no-page-scroll');
            appRoot.classList.remove('exam-timetable-hide-outer-scrollbar');
        };
    }, []);

    // Edit modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingExam, setEditingExam] = useState(null);
    const [editDepartment, setEditDepartment] = useState('');
    const [editSemester, setEditSemester] = useState(1);
    const [editCourse, setEditCourse] = useState('');
    const [editDate, setEditDate] = useState('');
    const [editTimeSlot, setEditTimeSlot] = useState(0);
    const [editExamType, setEditExamType] = useState('MSE I');
    const [editTestCoordinator, setEditTestCoordinator] = useState('');
    const [subjectsDetails, setSubjectsDetails] = useState([]);

    // Print modal state
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printDepartment, setPrintDepartment] = useState('');
    const [printSemester, setPrintSemester] = useState();
    const [printExamType, setPrintExamType] = useState('');

    // Download modal state
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [downloadDepartment, setDownloadDepartment] = useState('');
    const [downloadSemester, setDownloadSemester] = useState();
    const [downloadExamType, setDownloadExamType] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const examData = await getExams(filterSemester, filterDepartment || undefined, 'PUBLISHED');
            setExams(examData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [filterSemester, filterDepartment]);

    useEffect(() => {
        loadData();
        getSubjectsDetailsList(data => {
            setSubjectsDetails(data);
        });
    }, [loadData, filterSemester, filterDepartment]);

    const handlePrint = () => {
        if (exams.length === 0) {
            showError('No exams available to print');
            return;
        }
        // Reset print filters and show modal
        setPrintDepartment('');
        setPrintSemester(undefined);
        setPrintExamType('');
        setShowPrintModal(true);
    };

    const handleConfirmPrint = () => {
        if (!printDepartment || !printSemester || !printExamType) {
            showError('Please select Department, Semester, and Exam Type');
            return;
        }

        // Filter exams based on selection
        const filteredExams = exams.filter(exam =>
            exam.department === printDepartment &&
            exam.semester === printSemester &&
            (printExamType === 'Retest' ? exam.examType.includes('Retest') : exam.examType === printExamType)
        );

        if (filteredExams.length === 0) {
            showError(`No exams found for ${printDepartment} SEM ${printSemester} ${printExamType}`);
            return;
        }

        setShowPrintModal(false);
        printTimetable(filteredExams, subjectsDetails, 'Examination Timetable');
    };

    const handleDownload = () => {
        if (exams.length === 0) {
            showError('No exams available to download');
            return;
        }
        // Reset download filters and show modal
        setDownloadDepartment('');
        setDownloadSemester(undefined);
        setDownloadExamType('');
        setShowDownloadModal(true);
    };

    const handleConfirmDownload = async () => {
        if (!downloadDepartment || !downloadSemester || !downloadExamType) {
            showError('Please select Department, Semester, and Exam Type');
            return;
        }

        // Filter exams based on selection
        const filteredExams = exams.filter(exam =>
            exam.department === downloadDepartment &&
            exam.semester === downloadSemester &&
            (downloadExamType === 'Retest' ? exam.examType.includes('Retest') : exam.examType === downloadExamType)
        );

        if (filteredExams.length === 0) {
            showError(`No exams found for ${downloadDepartment} SEM ${downloadSemester} ${downloadExamType}`);
            return;
        }

        setShowDownloadModal(false);

        // Direct PDF download with exact same format as print
        try {
            await downloadTimetable(filteredExams, subjectsDetails, 'Examination Timetable');
            showSuccess('PDF downloaded successfully!');
        } catch (error) {
            console.error('Download error:', error);
            showError('Failed to download PDF. Please try again.');
        }
    };

    const handleDelete = (id) => {
        showErrorConfirm('Permanently delete this exam?', () => {
            setLoading(true);
            deleteExam(
                id,
                () => {
                    showSuccess('Exam deleted successfully');
                    loadData();
                },
                (msg) => {
                    showError('Failed to delete exam: ' + msg);
                    setLoading(false);
                }
            );
        });
    };


    const handleEdit = (exam) => {
        showErrorConfirm(
            'Edit published exam? May affect schedules.',
            () => {
                setEditingExam(exam);
                setEditDepartment(exam.department || 'CSE');
                setEditSemester(exam.semester);
                setEditCourse(exam.courseName);
                setEditDate(exam.examDate);
                setEditExamType(exam.examType || 'MSE I');
                setEditTestCoordinator(exam.testCoordinator || '');

                // Find matching time slot — backend returns "HH:MM:SS", TIME_SLOTS has "HH:MM"
                // Use startsWith to handle the seconds suffix difference
                const slotIdx = TIME_SLOTS.findIndex(s =>
                    exam.startTime && exam.startTime.startsWith(s.start)
                );
                const resolvedIdx = slotIdx >= 0 ? slotIdx : 0;
                setEditTimeSlot(resolvedIdx);

                setShowEditModal(true);
            }
        );
    };

    const handleSaveEdit = async () => {
        if (!editingExam) return;

        if (!editDepartment || !editSemester || !editCourse || !editDate || !editTestCoordinator) {
            showError('Please fill all required fields');
            return;
        }

        // Always derive times from the selected TIME_SLOTS index to avoid backend format mismatch
        const slot = TIME_SLOTS[editTimeSlot];
        const startTime = slot.start;
        const endTime = slot.end;
        const durationMinutes = slot.duration;

        const updateData = {
            department: editDepartment,
            semester: editSemester,
            courseName: editCourse,
            examDate: editDate,
            startTime: startTime,
            endTime: endTime,
            durationMinutes: durationMinutes,
            examType: editExamType,
            testCoordinator: editTestCoordinator
        };

        setLoading(true);
        updateExam(
            editingExam.id,
            updateData,
            () => {
                showSuccess('Exam updated successfully');
                setShowEditModal(false);
                setEditingExam(null);
                loadData();
            },
            (msg) => {
                showError(msg);
                setLoading(false);
            }
        );
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
        setEditingExam(null);
    };

    // Filter and group exams by date
    const visiblePublishedExams = exams.filter(exam => {
        // Exam type filter
        if (filterExamType && exam.examType !== filterExamType) return false;
        // Search query filter (by name, department, or date)
        const query = searchQuery.trim().toLowerCase();
        if (!query) return true;
        if (exam.courseName && exam.courseName.toLowerCase().includes(query)) return true;
        if (exam.department && exam.department.toLowerCase().includes(query)) return true;
        if (exam.examDate) {
            const dateStr = String(exam.examDate);

            // 1. Match raw API format "2026-01-29"
            if (dateStr.includes(query)) return true;

            // 2. Match dd-mm-yyyy format using string manipulation (reliable for ISO strings)
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const ddmmyyyy = `${parts[2]}-${parts[1]}-${parts[0]}`; // 29-01-2026
                if (ddmmyyyy.includes(query)) return true;
            }

            // 3. Match displayed date format accurately (handling timezone shifts)
            try {
                const d = new Date(dateStr);
                if (!isNaN(d.getTime())) {
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();
                    const displayDate = `${day}-${month}-${year}`;

                    if (displayDate.includes(query)) return true;

                    // Also match human formats
                    const long = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase();
                    if (long.includes(query)) return true;
                }
            } catch { /* ignore */ }
        }
        return false;
    });

    const examsByDate = visiblePublishedExams.reduce((acc, exam) => {
        if (!acc[exam.examDate]) acc[exam.examDate] = [];
        acc[exam.examDate].push(exam);
        return acc;
    }, {});

    const groupedExamEntries = Object.entries(examsByDate).sort(([a], [b]) => a.localeCompare(b));
    const hasVisibleExams = groupedExamEntries.length > 0;
    const emptyTitle = exams.length > 0
        ? 'No published examinations match the current filters.'
        : 'No published examination timetable available yet.';
    const emptySubtitle = exams.length > 0
        ? 'Try changing Department, Semester, Exam Type, or search.'
        : 'Please check back later.';

    return (
        <div className='page exam-timetable student-view'>
            <div className='page-header'>
                <h1 className='page-title'>
                    <span className='title-icon'><ExamTimetableIcon size={28} /></span>
                    Published Examination Timetable
                </h1>
                <div className='header-actions'>

                    {exams.length > 0 && (
                        <>
                            <button
                                className='btn btn-print'
                                onClick={handlePrint}
                            >
                                <Printer width={14} height={14} /> Print
                            </button>
                            <button
                                className='btn btn-download'
                                onClick={handleDownload}
                            >
                                <Download width={14} height={14} /> Download
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className='filter-section'>
                <div className='filter-bar'>
                    <label>Filter by:</label>
                    <select
                        value={filterDepartment}
                        onChange={e => setFilterDepartment(e.target.value)}
                    >
                        <option value="">All Departments</option>
                        {DEPARTMENTS.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                    <select
                        value={filterSemester || ''}
                        onChange={e => setFilterSemester(e.target.value ? Number(e.target.value) : undefined)}
                    >
                        <option value="">All Semesters</option>
                        {SEMESTERS.map(sem => (
                            <option key={sem} value={sem}>SEM {sem}</option>
                        ))}
                    </select>
                    <select
                        value={filterExamType}
                        onChange={e => setFilterExamType(e.target.value)}
                    >
                        <option value="">Exam Type</option>
                        <option value="MSE I">MSE I</option>
                        <option value="MSE II">MSE II</option>
                        <option value="Retest MSE I">Retest MSE I</option>
                        <option value="Retest MSE II">Retest MSE II</option>
                    </select>

                    <label className='published-count-badge' aria-live='polite'>
                        <span>Published:</span>
                        <strong>{loading ? '...' : visiblePublishedExams.length}</strong>
                    </label>

                    <div className="exam-search-container">
                        <span className="exam-search-icon" style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ width: '16px', height: '16px' }}>
                                <SearchIcon fillColor="#64748b" />
                            </div>
                        </span>
                        <input
                            ref={searchRef}
                            type="text"
                            className="exam-search-input"
                            placeholder="Start typing..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Escape' && e.target.blur()}
                        />
                        <span className="exam-search-shortcut">/</span>
                    </div>
                </div>
            </div>

            {/* Timetable Display */}
            <div className='timetable-display'>
                {loading ? (
                    <div className='loading-state'>Loading...</div>
                ) : (
                    <div className={`exam-table-container ${!hasVisibleExams ? 'empty-results' : ''}`}>
                        <table className='exam-table'>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th className='time-col'>Time</th>
                                    <th>Exam Type</th>
                                    <th>Department</th>
                                    <th>Semester</th>
                                    <th className='course-col'>Course</th>
                                    {isCoordinator && <th>ACTIONS</th>}
                                </tr>
                            </thead>
                            {hasVisibleExams && (
                                <tbody>
                                    {groupedExamEntries
                                    .flatMap(([date, dateExams]) =>
                                        dateExams.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((exam, idx) => (
                                            <tr key={exam.id}>
                                                {idx === 0 && (
                                                    <td rowSpan={dateExams.length} className='date-cell'>
                                                        {(() => {
                                                            const d = new Date(date);
                                                            const day = String(d.getDate()).padStart(2, '0');
                                                            const month = String(d.getMonth() + 1).padStart(2, '0');
                                                            const year = d.getFullYear();
                                                            return `${day}-${month}-${year}`;
                                                        })()}
                                                    </td>
                                                )}
                                                <td className='time-cell'>{formatTo12Hour(exam.startTime)} - {formatTo12Hour(exam.endTime)}</td>
                                                <td style={{ textAlign: 'center' }}><span className='exam-type-badge'>{exam.examType || '-'}</span></td>
                                                <td><span className='dept-badge'>{exam.department || 'N/A'}</span></td>
                                                <td><span className='sem-badge'>SEM {exam.semester}</span></td>
                                                <td className='course-cell'>{exam.courseName}</td>
                                                {isCoordinator && (
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                            <button
                                                                className='btn-icon'
                                                                title='Edit Exam'
                                                                onClick={() => handleEdit(exam)}
                                                                style={{ width: '32px', height: '32px', padding: '6px' }}
                                                            >
                                                                <EditIcon width={16} height={16} />
                                                            </button>
                                                            <button
                                                                className='btn-icon delete'
                                                                title='Delete Exam'
                                                                onClick={() => handleDelete(exam.id)}
                                                                style={{ width: '32px', height: '32px', padding: '6px' }}
                                                            >
                                                                <Trash width={16} height={16} fill="currentColor" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            )}
                        </table>
                        {!hasVisibleExams && (
                            <div className='empty-state table-empty-state'>
                                <p>📭 {emptyTitle}</p>
                                <p>{emptySubtitle}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>



            {/* Edit Modal */}
            {showEditModal && editingExam && (
                <div className='modal-overlay' onClick={handleCancelEdit}>
                    <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                        <div className='modal-header'>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <EditIcon width={20} height={20} />
                                Edit Exam
                            </h2>
                            <button className='modal-close-btn' onClick={handleCancelEdit} title='Close'>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6L6 18"></path>
                                    <path d="M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-row'>
                                <div className='form-group'>
                                    <label>Department *</label>
                                    <select
                                        value={editDepartment}
                                        onChange={(e) => setEditDepartment(e.target.value)}
                                        className='form-select'
                                    >
                                        {DEPARTMENTS.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className='form-group'>
                                    <label>Semester *</label>
                                    <select
                                        value={editSemester}
                                        onChange={(e) => setEditSemester(Number(e.target.value))}
                                        className='form-select'
                                    >
                                        {SEMESTERS.map(sem => (
                                            <option key={sem} value={sem}>SEM {sem}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className='form-group'>
                                <label>Course *</label>
                                <select
                                    value={editCourse}
                                    onChange={(e) => setEditCourse(e.target.value)}
                                    className='form-select'
                                >
                                    <option value="">Select a course</option>
                                    {/* Show current course if it exists and isn't in the filtered list */}
                                    {editCourse && !subjectsDetails.some(s => s.name === editCourse && s.semester === editSemester) && (
                                        <option value={editCourse}>{editCourse} (Current)</option>
                                    )}
                                    {subjectsDetails
                                        .filter(s => s.semester === editSemester)
                                        .map(subject => (
                                            <option key={subject.name} value={subject.name}>
                                                {subject.name} ({subject.subjectCode})
                                            </option>
                                        ))
                                    }
                                    {/* Fallback: show all subjects if none match the semester */}
                                    {subjectsDetails.filter(s => s.semester === editSemester).length === 0 &&
                                        subjectsDetails.length > 0 && (
                                            <>
                                                <option disabled>─── All Subjects ───</option>
                                                {subjectsDetails.map(subject => (
                                                    <option key={subject.name} value={subject.name}>
                                                        {subject.name} ({subject.subjectCode}) - SEM {subject.semester}
                                                    </option>
                                                ))}
                                            </>
                                        )}
                                </select>
                            </div>

                            <div className='form-row'>
                                <div className='form-group'>
                                    <label>Exam Date *</label>
                                    <input
                                        type="date"
                                        value={editDate}
                                        onChange={(e) => setEditDate(e.target.value)}
                                        className='form-input'
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className='form-group'>
                                    <label>Exam Type</label>
                                    <select
                                        value={editExamType}
                                        onChange={(e) => setEditExamType(e.target.value)}
                                        className='form-select'
                                    >
                                        <option value="MSE I">MSE I</option>
                                        <option value="MSE II">MSE II</option>
                                        <option value="Retest MSE I">Retest MSE I</option>
                                        <option value="Retest MSE II">Retest MSE II</option>
                                    </select>
                                </div>
                            </div>

                            <div className='form-row'>
                                <div className='form-group'>
                                    <label>Time Slot *</label>
                                    <select
                                        value={editTimeSlot}
                                        onChange={(e) => {
                                            const idx = Number(e.target.value);
                                            setEditTimeSlot(idx);
                                        }}
                                        className='form-select'
                                    >
                                        {TIME_SLOTS.map((slot, idx) => (
                                            <option key={idx} value={idx}>
                                                {slot.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className='form-group'>
                                    <label>Test Coordinator *</label>
                                    <input
                                        type="text"
                                        value={editTestCoordinator}
                                        onChange={(e) => setEditTestCoordinator(e.target.value)}
                                        className='form-input'
                                        placeholder="Coordinator"
                                    />
                                </div>
                            </div>


                        </div>
                        <div className='modal-footer'>
                            <button className='btn modal-cancel-btn' onClick={handleCancelEdit}>
                                Cancel
                            </button>
                            <button className='btn modal-save-btn' onClick={handleSaveEdit}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .student-view .filter-section {
                    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
                    padding: 1rem 1.25rem;
                    border-radius: 10px;
                    margin-bottom: 1rem;
                    border: 1px solid var(--surfaceBorder, #cbd5e1);
                    box-shadow: var(--surfaceShadowSm, 0 6px 16px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.04));
                }
                .student-view .filter-bar {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                }
                .student-view .filter-bar .exam-search-container {
                    margin-left: auto !important;
                    flex: 0 0 auto;
                    width: 280px;
                    max-width: 280px;
                }
                .student-view .filter-bar label {
                    font-weight: 500;
                    color: var(--textColor2, #666);
                }
                .student-view .timetable-display {
                    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
                    padding: 1.25rem 1.25rem 0;
                    border-radius: 10px;
                    border: 1px solid var(--surfaceBorder, #cbd5e1);
                    box-shadow: var(--surfaceShadow, 0 10px 24px rgba(15, 23, 42, 0.06), 0 2px 8px rgba(15, 23, 42, 0.04));
                }
                .student-view .loading-state {
                    text-align: center;
                    padding: 3rem;
                    color: var(--textColor2, #888);
                }
                .student-view .timetable-footer {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 1rem;
                    font-size: 0.85rem;
                    color: var(--textColor2, #666);
                }
                .student-view .note {
                    font-style: italic;
                }

                body.dark .student-view .filter-section {
                    background: linear-gradient(180deg, #1e293b 0%, #172033 100%);
                    border-color: var(--borderColor, #475569);
                    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22), 0 2px 8px rgba(0, 0, 0, 0.16);
                }

                body.dark .student-view .timetable-display {
                    background: linear-gradient(180deg, #1e293b 0%, #172033 100%);
                    border-color: var(--borderColor, #475569);
                    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.24), 0 2px 8px rgba(0, 0, 0, 0.16);
                }

                body.dark .student-view .timetable-display .exam-table-container {
                    background: #243042;
                    border-color: var(--borderColor, #475569);
                    box-shadow: none;
                }

                .student-view .filter-section,
                .student-view .page-header,
                .student-view .page-title,
                .student-view .header-actions,
                .student-view .filter-bar label,
                .student-view .filter-bar select,
                .student-view .filter-bar .exam-search-container,
                .student-view .filter-bar .exam-search-input,
                .student-view .filter-bar .exam-search-shortcut,
                .student-view .timetable-display,
                .student-view .timetable-display .exam-table-container,
                .student-view .exam-table,
                .student-view .exam-table thead th,
                .student-view .exam-table tbody td,
                .student-view .exam-table .date-cell,
                .student-view .btn.btn-print,
                .student-view .btn.btn-print svg,
                .student-view .btn.btn-download,
                .student-view .btn.btn-download svg,
                .student-view .btn-icon,
                .student-view .btn-icon svg,
                .student-view .dept-badge,
                .student-view .sem-badge,
                .student-view .exam-type-badge {
                    transition: none !important;
                    animation: none !important;
                }

                /* Professional Adaptive UI (Light Default, Dark Override) */
                
                /* LIGHT MODE (Default) */
                .modal-content {
                    background: #ffffff;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 600px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    color: #24292f;
                    border: 1px solid #d0d7de;
                    font-family: 'Segoe UI', system-ui, sans-serif;
                }

                .modal-header {
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid #d0d7de;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-header h2 {
                    margin: 0;
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #24292f;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .modal-body {
                    padding: 1rem 1.25rem;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .form-group {
                    margin-bottom: 0.85rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.35rem;
                    font-weight: 600;
                    font-size: 0.85rem;
                    color: #57606a;
                }

                .form-select,
                .form-input {
                    width: 100%;
                    padding: 0.6rem 0.85rem;
                    border: 1px solid #d0d7de;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    background: #f6f8fa;
                    color: #24292f;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }

                .form-select option,
                .form-select optgroup {
                    background: #ffffff;
                    color: #24292f;
                }

                .form-select:focus,
                .form-input:focus {
                    outline: none;
                    border-color: #0969da; /* Light mode focus blue */
                    box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.15);
                    background: #ffffff;
                }

                .form-input[type="date"] {
                    color-scheme: light;
                }

                .modal-footer {
                    padding: 0.85rem 1.25rem;
                    border-top: 1px solid #d0d7de;
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                    background: #ffffff;
                    border-bottom-left-radius: 12px;
                    border-bottom-right-radius: 12px;
                }
                
                /* Close button */
                .modal-close-btn {
                    background: none;
                    border: none;
                    color: #656d76;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    transition: all 0.15s ease;
                }
                .modal-close-btn:hover {
                    background: rgba(0, 0, 0, 0.06);
                    color: #24292f;
                }

                /* Save Button */
                .btn.modal-save-btn {
                    background: rgba(37, 99, 235, 0.08);
                    color: #2563eb;
                    border: 1.5px solid #2563eb;
                    border-radius: 8px;
                    padding: 0.5rem 1.25rem;
                    font-weight: 600;
                    font-size: 0.85rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    box-shadow: none;
                    transition: all 0.2s ease;
                }
                .btn.modal-save-btn:hover {
                    background: rgba(37, 99, 235, 0.14);
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);
                }

                /* Cancel Button */
                .btn.modal-cancel-btn {
                    background: transparent;
                    color: #656d76;
                    border: 1.5px solid #d0d7de;
                    border-radius: 8px;
                    padding: 0.5rem 1.25rem;
                    font-weight: 600;
                    font-size: 0.85rem;
                    box-shadow: none;
                    transition: all 0.2s ease;
                }
                .btn.modal-cancel-btn:hover {
                    background: rgba(0, 0, 0, 0.04);
                    border-color: #afb8c1;
                    color: #24292f;
                }

                .form-select:hover,
                .form-input:hover {
                    border-color: #afb8c1;
                }

                /* DARK MODE OVERRIDES */
                body.dark .modal-content {
                    background: linear-gradient(180deg, #1f2c40 0%, #182233 100%);
                    border-color: #42536a;
                    color: #f8fafc;
                    box-shadow: 0 24px 52px rgba(0, 0, 0, 0.38);
                }

                body.dark .modal-header {
                    border-bottom-color: #3f4f65;
                }

                body.dark .modal-header h2 {
                    color: #f8fafc;
                }

                body.dark .form-group label {
                    color: #cbd5e1;
                }

                body.dark .form-select,
                body.dark .form-input {
                    background: #243042;
                    border-color: #50637b;
                    color: #f8fafc;
                    color-scheme: dark;
                }

                body.dark .form-select:focus,
                body.dark .form-input:focus {
                    border-color: #60a5fa;
                    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.18);
                    background: #243042;
                }

                body.dark .form-select option,
                body.dark .form-select optgroup {
                    background: #243042;
                    color: #f8fafc;
                }

                body.dark .form-select option:checked,
                body.dark .form-select option:hover {
                    background: #2563eb;
                    color: #ffffff;
                }

                body.dark .form-select option:disabled {
                    background: #243042;
                    color: #94a3b8;
                }

                body.dark .form-input[type="date"] {
                    /* Providing a default to ensure filter works consistently */
                    color-scheme: normal;
                }
                
                body.dark .form-input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(1) brightness(1.5);
                    cursor: pointer;
                    opacity: 0.8;
                    transition: opacity 0.2s;
                }
                
                body.dark .form-input[type="date"]::-webkit-calendar-picker-indicator:hover {
                    opacity: 1;
                }

                body.dark .modal-footer {
                    background: #182233;
                    border-top-color: #3f4f65;
                }

                /* Dark mode for new modal buttons */
                body.dark .modal-close-btn {
                    color: #a8b4c5;
                }
                body.dark .modal-close-btn:hover {
                    background: rgba(96, 165, 250, 0.12);
                    color: #f8fafc;
                }

                body.dark .btn.modal-save-btn {
                    background: rgba(59, 130, 246, 0.1);
                    color: #60a5fa;
                    border-color: rgba(96, 165, 250, 0.5);
                }
                body.dark .btn.modal-save-btn:hover {
                    background: rgba(59, 130, 246, 0.18);
                    border-color: #60a5fa;
                    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
                }

                body.dark .btn.modal-cancel-btn {
                    background: transparent;
                    color: #cbd5e1;
                    border-color: #50637b;
                }
                body.dark .btn.modal-cancel-btn:hover {
                    background: rgba(148, 163, 184, 0.08);
                    border-color: #7b8da3;
                    color: #f8fafc;
                }

                body.dark .form-select:hover,
                body.dark .form-input:hover {
                    border-color: #6b7d94;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                @media (max-width: 768px) {
                    .student-view .filter-bar {
                        display: grid;
                        grid-template-columns: max-content repeat(3, minmax(0, 1fr));
                        justify-content: start;
                        align-items: center;
                        overflow-x: hidden;
                        padding-bottom: 0;
                        padding-right: 0;
                        column-gap: 0.35rem;
                        row-gap: 0.5rem;
                    }

                    .student-view .filter-bar label {
                        margin-right: 0;
                    }

                    .student-view .filter-bar select {
                        font-size: 0.75rem;
                        padding: 0.34rem 0.42rem;
                        width: 100%;
                        min-width: 0;
                    }

                    .student-view .filter-bar .exam-search-container {
                        margin-left: 0 !important;
                        grid-column: 1 / -1;
                        width: 100%;
                        max-width: 100%;
                    }
                    
                    /* Hide scrollbar for cleaner look */
                    .student-view .filter-bar::-webkit-scrollbar {
                        height: 0px;
                        background: transparent;
                    }

                    .modal-content {
                        width: 95%;
                        padding: 0;
                    }
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            {/* Print Selection Modal */}
            {showPrintModal && (
                <div className='modal-overlay' style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className='modal-content' style={{
                        background: 'var(--containerColor)',
                        padding: '20px',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '400px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Printer width={20} height={20} color="#6366f1" /> Print Timetable
                        </h3>

                        <div className='form-group' style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Department *</label>
                            <select
                                value={printDepartment}
                                onChange={e => setPrintDepartment(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                            >
                                <option value="">Select Department</option>
                                {DEPARTMENTS.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        <div className='form-group' style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Semester *</label>
                            <select
                                value={printSemester || ''}
                                onChange={e => setPrintSemester(e.target.value ? Number(e.target.value) : undefined)}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                            >
                                <option value="">Select Semester</option>
                                {SEMESTERS.map(sem => (
                                    <option key={sem} value={sem}>SEM {sem}</option>
                                ))}
                            </select>
                        </div>

                        <div className='form-group' style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Exam Type *</label>
                            <select
                                value={printExamType}
                                onChange={e => setPrintExamType(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                            >
                                <option value="">Select Exam Type</option>
                                <option value="MSE I">MSE I</option>
                                <option value="MSE II">MSE II</option>
                                <option value="Retest">Retest</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                className='btn secondary'
                                onClick={() => setShowPrintModal(false)}
                                style={{ padding: '10px 20px' }}
                            >
                                Cancel
                            </button>
                            <button
                                className='btn primary'
                                onClick={handleConfirmPrint}
                                style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Printer width={16} height={16} color="white" /> Print
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Download Selection Modal */}
            {showDownloadModal && (
                <div className='modal-overlay' style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className='modal-content' style={{
                        background: 'var(--containerColor)',
                        padding: '20px',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '400px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Download width={20} height={20} color="#28a745" /> Download Timetable
                        </h3>

                        <div className='form-group' style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Department *</label>
                            <select
                                value={downloadDepartment}
                                onChange={e => setDownloadDepartment(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                            >
                                <option value="">Select Department</option>
                                {DEPARTMENTS.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        <div className='form-group' style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Semester *</label>
                            <select
                                value={downloadSemester || ''}
                                onChange={e => setDownloadSemester(e.target.value ? Number(e.target.value) : undefined)}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                            >
                                <option value="">Select Semester</option>
                                {SEMESTERS.map(sem => (
                                    <option key={sem} value={sem}>Semester {sem}</option>
                                ))}
                            </select>
                        </div>

                        <div className='form-group' style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Exam Type *</label>
                            <select
                                value={downloadExamType}
                                onChange={e => setDownloadExamType(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                            >
                                <option value="">Select Exam Type</option>
                                <option value="MSE I">MSE I</option>
                                <option value="MSE II">MSE II</option>
                                <option value="Retest">Retest</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                className='btn secondary'
                                onClick={() => setShowDownloadModal(false)}
                                style={{ padding: '10px 20px' }}
                            >
                                Cancel
                            </button>
                            <button
                                className='btn primary'
                                onClick={handleConfirmDownload}
                                style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                            >
                                <Download width={14} height={14} color="white" /> Download
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default memo(PublishedTimetablePage);
