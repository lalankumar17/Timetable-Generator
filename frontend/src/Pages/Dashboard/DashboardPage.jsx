import { memo, useEffect, useState } from 'react';
import '../../Style/UnifiedPages.css';
import '../../Style/Pages/Dashboard.css';
import { getSubjectsDetailsList } from '../../Script/SubjectsDataFetcher';
import { getExamStatus, getExams } from '../../Script/ExamDataFetcher';
import { getHealthStatus } from '../../Script/HealthFetcher';
import { Link } from 'react-router-dom';
import { useAuth } from '../../Components/AuthContext';
import { useNotifications } from '../../Components/NotificationContext';
import AnalyticsChart from '../../Components/AnalyticsChart';
import { canScheduleTimetable } from '../../Script/Constants';


function DashboardPage() {
    const { user } = useAuth();
    const isCoordinator = canScheduleTimetable(user?.email);
    const { addNotification, removeNotificationByMessage } = useNotifications();
    const [subjectCount, setSubjectCount] = useState(0);
    const [examStatus, setExamStatus] = useState({ total: 0, published: 0, draft: 0 });
    const [recentExams, setRecentExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [health, setHealth] = useState({ backend: 'Loading...', db: 'Loading...' });
    const [semesterDistribution, setSemesterDistribution] = useState({});

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            getSubjectsDetailsList((data) => {
                setSubjectCount(Object.keys(data).length);
            });
            const status = await getExamStatus();
            setExamStatus(status);
            const exams = await getExams();
            const sortedByCreation = [...exams].sort((a, b) => b.id - a.id);
            setRecentExams(sortedByCreation.slice(0, 6));

            const healthStatus = await getHealthStatus();
            setHealth(healthStatus);
            if (healthStatus.backend === 'Disconnected') {
                addNotification('Backend system is disconnected', 'error', 0);
            } else if (healthStatus.backend === 'OK') {
                removeNotificationByMessage('Backend system is disconnected');
            }

            const dist = {};
            exams.forEach(exam => {
                const sem = `SEM ${exam.semester}`;
                dist[sem] = (dist[sem] || 0) + 1;
            });
            setSemesterDistribution(dist);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            addNotification('Error loading dashboard data', 'error');
        }
        setLoading(false);
    };

    return (
        <div className='dashboard-container compact-mode'>
            <div className='top-section'>
                <div className='welcome-card'>
                    <div className='welcome-content-wrapper'>
                        {isCoordinator ? (
                            <div className='welcome-header'>
                                <h1 className='welcome-generator-title'>Timetable Generator</h1>
                                <p className='welcome-generator-subtitle'>Manage curriculum &amp; exams.</p>
                                <Link to="/ExamTimetable" className='btn-light btn-sm'>+ New Schedule</Link>
                            </div>
                        ) : (
                            <div className='welcome-header'>
                                <h1 className='welcome-exam-title'>Examination Timetable</h1>
                                <p className='welcome-exam-subtitle'>View &amp; download published exam schedules.</p>
                                <Link to="/ViewTimetable" className='btn-light btn-sm'>View Timetable</Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className='pipeline-card'>
                    <div className='pipeline-header'>
                        <span className='pipeline-tag'>Workflow</span>
                        <span className={`pipeline-status-text ${examStatus.published > 0 ? 'pipeline-status-complete' : ''}`}>
                            {examStatus.published > 0 ? 'All stages complete' : examStatus.total > 0 ? 'In progress' : subjectCount > 0 ? 'Getting started' : 'Not started'}
                        </span>
                    </div>
                    <div className='pipeline-steps'>
                        <div className={`pipe-step ${subjectCount > 0 ? 'passed' : 'pending'}`}>
                            <div className='pipe-step-icon'>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                    <path d="M8 7h8" />
                                    <path d="M8 11h5" />
                                </svg>
                                {subjectCount > 0 && <span className='pipe-check-badge'>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </span>}
                            </div>
                            <div className='pipe-info'>
                                <span className='pipe-name'>Subjects</span>
                                <span className='pipe-meta'>{subjectCount > 0 ? `${subjectCount} loaded` : 'Awaiting data'}</span>
                            </div>
                        </div>
                        <div className='pipe-connector'>
                            <div className={`pipe-connector-line ${subjectCount > 0 ? 'active' : ''}`}></div>
                        </div>
                        <div className={`pipe-step ${examStatus.total > 0 ? 'passed' : 'pending'}`}>
                            <div className='pipe-step-icon'>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                                    <path d="M9 14l2 2 4-4" />
                                </svg>
                                {examStatus.total > 0 && <span className='pipe-check-badge'>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </span>}
                            </div>
                            <div className='pipe-info'>
                                <span className='pipe-name'>Draft</span>
                                <span className='pipe-meta'>{examStatus.total > 0 ? `${examStatus.draft} scheduled` : 'Awaiting exams'}</span>
                            </div>
                        </div>
                        <div className='pipe-connector'>
                            <div className={`pipe-connector-line ${examStatus.total > 0 ? 'active' : ''}`}></div>
                        </div>
                        <div className={`pipe-step ${examStatus.published > 0 ? 'passed' : 'pending'}`}>
                            <div className='pipe-step-icon'>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="2" y1="12" x2="22" y2="12" />
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                                {examStatus.published > 0 && <span className='pipe-check-badge'>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </span>}
                            </div>
                            <div className='pipe-info'>
                                <span className='pipe-name'>Published</span>
                                <span className='pipe-meta'>{examStatus.published > 0 ? `${examStatus.published} live` : 'Awaiting publish'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='bottom-section-grid'>
                <div className='dashboard-col wide'>
                    <div className='panel-header-sm'>Recent Activity <Link to="/ViewTimetable" className='link-xs'>View All</Link></div>
                    <div className='compact-table-container'>
                        {loading ? <div className='loading-xs'>Loading...</div> : recentExams.length === 0 ? <div className='empty-xs'>No recent exams found.</div> : (
                            <table className='compact-table rich-activity-table'>
                                <thead><tr><th>Date</th><th>Course</th><th>Sem</th></tr></thead>
                                <tbody>
                                    {recentExams.slice(0, 6).map((exam) => (
                                        <tr key={exam.id}>
                                            <td className='date-cell'>
                                                <div className='date-box'>
                                                    <span className='date-month'>{new Date(exam.examDate).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</span>
                                                    <span className='date-day'>{new Date(exam.examDate).getDate()}</span>
                                                </div>
                                            </td>
                                            <td><div className='course-row'><div className='course-meta'><div className='course-name-text'>{exam.courseName}</div><div className='course-id-text'>Dept: <span className='dept-badge'>{exam.department || 'CSE'}</span></div></div></div></td>
                                            <td><span className='badge-pill-light'>SEM {exam.semester}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div className='dashboard-col insights-col'>
                    <div className='panel-header-sm'>Insights</div>
                    <div className='insights-panel'>
                        <div className='insights-titlebar'><div className='insights-tab active'>Semester Distribution</div></div>
                        {Object.keys(semesterDistribution).length === 0 ? (
                            <div className='insights-content' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '1rem' }}>
                                <div className='insights-no-data' style={{ textAlign: 'center' }}>
                                    <p style={{ color: 'var(--textColor2)', fontSize: '0.85rem' }}>No exam data found to display charts.</p>
                                </div>
                            </div>
                        ) : (
                            <div className='insights-content' style={{ padding: '0 10px', justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                                <AnalyticsChart
                                    data={Object.entries(semesterDistribution)
                                        .sort(([a], [b]) => {
                                            const numA = parseInt(a.replace(/\D/g, '')) || 0;
                                            const numB = parseInt(b.replace(/\D/g, '')) || 0;
                                            return numA - numB;
                                        })
                                        .map(([sem, count]) => {
                                            const num = sem.replace(/\D/g, '');
                                            return { label: num || sem, value: count };
                                        })
                                    }
                                    title=""
                                />
                            </div>
                        )}
                    </div>

                    <div className='system-status-card'>
                        <div className={`status-item ${health.backend !== 'OK' ? 'error' : ''}`}>
                            <div className='status-item-left'>
                                <div className='status-icon-box server'>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                                        <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                                        <line x1="6" y1="6" x2="6.01" y2="6"></line>
                                        <line x1="6" y1="18" x2="6.01" y2="18"></line>
                                    </svg>
                                </div>
                                <span className='status-label'>System API</span>
                            </div>
                            <span className={`status-badge ${health.backend === 'OK' ? 'online' : 'offline'}`}>
                                {health.backend === 'OK' ? 'ONLINE' : 'OFFLINE'}
                            </span>
                        </div>

                        <div className={`status-item ${health.db !== 'Connected' ? 'error' : ''}`}>
                            <div className='status-item-left'>
                                <div className='status-icon-box db'>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                                        <path d="M3 5v14c0 1.66 4 3 9 3s 9-1.34 9-3V5"></path>
                                    </svg>
                                </div>
                                <span className='status-label'>Database</span>
                            </div>
                            <span className={`status-badge ${health.db === 'Connected' ? 'online' : 'offline'}`}>
                                {health.db === 'Connected' ? 'ACTIVE' : 'ERROR'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default memo(DashboardPage);
