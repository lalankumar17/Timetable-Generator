import { useState, useEffect, useRef } from 'react';
import '../../Style/Pages/DocsPage.css';

const DocsPage = () => {
    const [activeSection, setActiveSection] = useState('introduction');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const contentRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getScrollRoot = () => document.querySelector('.app');

    const scrollToSection = (id) => {
        if (isMobile) {
            setActiveSection(id);
            const scrollRoot = getScrollRoot();
            if (scrollRoot) {
                scrollRoot.scrollTo({ top: 0, behavior: 'auto' });
            }
        } else {
            const element = document.getElementById(id);
            const scrollRoot = getScrollRoot();
            if (element && scrollRoot) {
                const rootTop = scrollRoot.getBoundingClientRect().top;
                const elementTop = element.getBoundingClientRect().top;
                const offset = elementTop - rootTop + scrollRoot.scrollTop;

                scrollRoot.scrollTo({
                    top: Math.max(0, offset - 84),
                    behavior: 'auto'
                });
                setActiveSection(id);
            }
        }
    };

    useEffect(() => {
        if (isMobile) return; // Scroll spy disabled on mobile (Tabs mode)

        const handleScroll = () => {
            const mobileViewport = window.innerWidth <= 1024;
            const sections = document.querySelectorAll('.docs-section');
            const scrollRoot = getScrollRoot();
            if (!scrollRoot) return;

            let scrollPosition;
            let rootTop = 0;

            if (mobileViewport) {
                scrollPosition = scrollRoot.scrollTop;
            } else {
                scrollPosition = scrollRoot.scrollTop;
                rootTop = scrollRoot.getBoundingClientRect().top;
            }

            // Default to introduction if at top
            if (scrollPosition < 50) {
                setActiveSection('introduction');
                return;
            }

            // Check if we hit the bottom of the page
            const isBottom = Math.ceil(scrollRoot.scrollTop + scrollRoot.clientHeight) >= scrollRoot.scrollHeight;
            if (isBottom && !mobileViewport) {
                // If we're at the very bottom, always select the last visible link
                setActiveSection('built-with');
                return;
            }

            let current = '';
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();

                if (mobileViewport) {
                    if (rect.top <= 250 && rect.bottom >= 250) {
                        current = section.getAttribute('id');
                    }
                } else {
                    const sectionTop = rect.top - rootTop + scrollPosition;
                    if (scrollPosition >= sectionTop - 160) {
                        current = section.getAttribute('id');
                    }
                }
            });

            if (current && current !== 'technology-stack') {
                setActiveSection(current);
            }
        };

        const scrollRoot = getScrollRoot();
        if (scrollRoot) {
            scrollRoot.addEventListener('scroll', handleScroll);
        }

        handleScroll(); // Initial check

        return () => {
            if (scrollRoot) {
                scrollRoot.removeEventListener('scroll', handleScroll);
            }
        };
    }, [isMobile]);

    const sidebarLinks = [
        { id: 'introduction', label: 'Overview' },
        { id: 'getting-started', label: 'Getting Started' },
        { id: 'authentication', label: 'User Authentication' },
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'exam-timetable', label: 'Exam Timetable' },
        { id: 'published-timetable', label: 'Published Timetable' },
        { id: 'profile', label: 'Profile' },
        { id: 'settings', label: 'Settings' },
        { id: 'built-with', label: 'Built With' }
    ];

    return (
        <div className="docs-container">
            <aside className="docs-sidebar">
                <div className="docs-sidebar-header">
                    <h3>Guide</h3>
                </div>
                <nav className="docs-nav">
                    <ul>
                        {sidebarLinks.map(link => (
                            <li key={link.id}>
                                <button
                                    className={activeSection === link.id ? 'active' : ''}
                                    onClick={() => scrollToSection(link.id)}
                                >
                                    {link.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            <main className="docs-content" ref={contentRef}>


                <section id="introduction" className={`docs-section ${activeSection === 'introduction' ? 'active' : ''}`}>
                    <div className="docs-hero">
                        <div className="docs-hero-badge">ABOUT AEMS</div>
                        <h1 className="docs-hero-title">
                            Automated Examination<br />
                            <span className="docs-hero-highlight">Management System</span>
                        </h1>
                        <p className="docs-hero-subtitle">
                            A modern, cloud-based platform that helps institutions seamlessly create, organize, and publish exam schedules.
                        </p>
                    </div>

                    <p>AEMS is designed to automate manual, time-consuming tasks through the following core modules:</p>
                    <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li><strong>Timetable Generation:</strong> Creates exam schedules with no overlaps or conflicts.</li>
                        <li><strong>Seating Allotment:</strong> Smartly arranges students in exam halls to prevent cheating.</li>
                        <li><strong>Invigilation Duty:</strong> Evenly assigns exam duty to teachers and sends out automatic alerts.</li>
                        <li><strong>B-Form Generation:</strong> Instantly prepares printable classroom forms with student lists and attendance tracking.</li>
                        <li><strong>Duty Exchange:</strong> Gives teachers a simple way to trade duties with automatic approval steps.</li>
                    </ul>

                    <p>By connecting everything into one unified platform, any changes made are instantly updated everywhere for a smooth, error-free experience.</p>

                    <div className="alert-box caution" style={{ marginTop: '1.5rem' }}>
                        <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        <div>
                            <strong>Platform Availability:</strong> Please note that currently, only the <strong>Timetable Generation</strong> module is actively available for use on this platform. The other modules are still in development.
                        </div>
                    </div>

                    <div className="alert-box important">
                        <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <div>
                            <strong>Important:</strong> Before scheduling exams, please ensure that all Course and Department data is up-to-date to avoid scheduling conflicts.
                        </div>
                    </div>


                    <div className="docs-info-card">
                        <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(45deg)' }}>
                            <line x1="12" y1="17" x2="12" y2="22"></line>
                            <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
                        </svg>
                        <div className="docs-info-card-content">
                            <h4>Secure Access Control</h4>
                            <p>
                                Only authorized <strong>Coordinators</strong> can create exams, manage users, and publish schedules. This keeps all system data safe and secure.
                            </p>
                        </div>
                    </div>
                </section>

                <section id="getting-started" className={`docs-section ${activeSection === 'getting-started' ? 'active' : ''}`}>
                    <h2>Getting Started</h2>
                    <p>To get started with AEMS, ensure you have the necessary credentials provided by your Coordinator. The system is accessible via any modern web browser.</p>



                    <div className="alert-box info">
                        <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <div>
                            <strong>System Requirements:</strong> AEMS is optimized for <strong>Desktop</strong> use. We recommend using <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> on a laptop or desktop for the best experience when managing exam schedules.
                        </div>
                    </div>

                    <div className="alert-box tip">
                        <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <div>
                            <strong>Pro Tip:</strong> Personalize your workspace with <strong>Default</strong> or <strong>Lights out</strong> backgrounds and custom UI <strong>Colors</strong> in the <strong>Settings</strong> page.
                        </div>
                    </div>
                </section>

                <section id="authentication" className={`docs-section ${activeSection === 'authentication' ? 'active' : ''}`}>
                    <h2>User Authentication</h2>
                    <p>Secure access to the AEMS platform is managed through a robust authentication system.</p>

                    <h3>1. Login</h3>
                    <p>Registered users can access their accounts using the login form:</p>
                    <ul>
                        <li><strong>Email:</strong> Enter your registered email address.</li>
                        <li><strong>Password:</strong> Enter your secure password.</li>
                        <li><strong>Visibility Toggle:</strong> Click the eye icon to reveal your password while typing.</li>
                    </ul>

                    <div className="docs-info-card">
                        <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(45deg)' }}>
                            <line x1="12" y1="17" x2="12" y2="22"></line>
                            <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
                        </svg>
                        <div className="docs-info-card-content">
                            <p>
                                <strong>Password Security:</strong> Passwords are encrypted for your safety. We <strong>strongly recommend</strong> using a mix of letters, numbers, and symbols (e.g., <code>Pass@123</code>) to protect your account.
                            </p>
                        </div>
                    </div>
                    <div className="alert-box warning">
                        <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <div>
                            <strong>Error Handling:</strong> If credentials are incorrect, an &quot;Invalid login, please try again&quot; message will appear.
                        </div>
                    </div>

                    <h3>2. Create Account (Sign Up)</h3>
                    <p>New users can register for an account by providing the following details:</p>
                    <ul>
                        <li><strong>Full Name:</strong> Your official name as it should appear on records.</li>
                        <li><strong>Email:</strong> A valid email address for communication and recovery.</li>
                        <li><strong>Password:</strong> Create a strong password and confirm it in the &quot;Repeat your password&quot; field.</li>
                    </ul>

                    <h3>3. Forgot Password</h3>
                    <p>If you lose access to your account, follow these steps to recover it:</p>
                    <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li><strong>Step 1:</strong> Click <strong>Forgot password?</strong> on the login page, enter your email, and click <strong>Send Reset Link</strong>.</li>
                        <li><strong>Step 2:</strong> Enter the 6-digit verification code sent to your email and click <strong>Verify OTP</strong>.</li>
                        <li><strong>Step 3:</strong> Provide a new password, confirm it, and click <strong>Update Password</strong>.</li>
                        <li><strong>Step 4:</strong> Once successful, click <strong>Go to Login</strong> to access your account.</li>
                    </ul>

                    <div className="alert-box caution">
                        <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        <div>
                            <strong>Security:</strong> You can update your password at any time via your registered email address.
                        </div>
                    </div>
                </section>

                <section id="dashboard" className={`docs-section ${activeSection === 'dashboard' ? 'active' : ''}`}>
                    <h2>Dashboard</h2>

                    <p>The Dashboard serves as the central hub of the application. It provides a quick overview of system status, upcoming exams, and recent activities.</p>

                    <h3>1. Header & Workflow</h3>
                    <ul>
                        <li><strong>Welcome Card:</strong> Shows the title, a short summary, and the <strong>+ New Schedule</strong> button.</li>
                        <li><strong>Workflow Panel:</strong> Shows three stages: <strong>Subjects</strong>, <strong>Draft</strong>, and <strong>Published</strong>.</li>
                        <li><strong>Stage Metrics:</strong> Displays live counts for subjects, drafts, and published timetables.</li>
                    </ul>

                    <div className="docs-info-card">
                        <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(45deg)' }}>
                            <line x1="12" y1="17" x2="12" y2="22"></line>
                            <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
                        </svg>
                        <div className="docs-info-card-content">
                            <h4>Workflow Status</h4>
                            <p>
                                The status indicator summarizes pipeline progress (for example, <strong>All stages complete</strong>) based on current publishing state.
                            </p>
                        </div>
                    </div>

                    <h3>2. Recent Activity</h3>
                    <ul>
                        <li><strong>Activity Table:</strong> Lists recently updated exams in a compact view.</li>
                        <li><strong>Columns:</strong> Shows key fields like <strong>Date</strong>, <strong>Course</strong>, and <strong>Sem</strong>.</li>
                        <li><strong>View All:</strong> Quick access to the full timetable activity list.</li>
                    </ul>

                    <h3>3. Insights & System Health</h3>
                    <ul>
                        <li><strong>Insights:</strong> Graphical chart for <strong>Semester Distribution</strong> based on current exam data.</li>
                        <li><strong>System API:</strong> Live connectivity indicator (for example, <strong>ONLINE</strong> or <strong>OFFLINE</strong>).</li>
                        <li><strong>Database:</strong> Live database state indicator (for example, <strong>ACTIVE</strong> or <strong>ERROR</strong>).</li>
                    </ul>


                </section>

                <section id="exam-timetable" className={`docs-section ${activeSection === 'exam-timetable' ? 'active' : ''}`}>
                    <h2>Exam Timetable</h2>

                    <p>The <strong>Examination Timetable</strong> section allows administrators to schedule exams, manage conflicts, and finalize the timetable before publishing.</p>

                    <h3>1. Schedule Exam Form</h3>
                    <p>To schedule a new exam, fill out the following fields:</p>
                    <ul>
                        <li><strong>Department & Semester:</strong> Select the target student group (e.g., CSE, SEM 1).</li>
                        <li><strong>Course:</strong> Choose the specific subject for the exam.</li>
                        <li><strong>Exam Type:</strong> Specify the assessment category (e.g., MSE I).</li>
                        <li><strong>Date & Time Slot:</strong> Set the exam schedule (e.g., Morning 09:30 AM - 11:00 AM).</li>
                        <li><strong>Test Coordinator & HOD:</strong> Assign responsible faculty members.</li>
                    </ul>
                    <p>Click <strong>Add Exam</strong> to add it to the draft list.</p>

                    <h3>2. Conflict Management</h3>
                    <p>The system automatically detects various scheduling conflicts (e.g., student/faculty time overlaps and daily limits):</p>
                    <ul>
                        <li><strong>Visual Alerts:</strong> A &quot;Conflicts Detected&quot; banner details the specific scheduling issues preventing a valid schedule.</li>
                        <li><strong>Auto-Resolve:</strong> Click the <strong>Auto-Resolve Conflicts</strong> button to let the system automatically adjust schedules.</li>
                        <li><strong>Conflict Counter:</strong> A status badge (e.g., &quot;1 Conflict(s)&quot;) indicates the total number of unresolved issues.</li>
                    </ul>

                    <div className="alert-box note">
                        <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <div>
                            <strong>Note:</strong> The system provides <strong>Automatic Conflict Resolution</strong> to optimize schedules. However, Coordinators must verify that the final timetable is conflict-free before publishing.
                        </div>
                    </div>

                    <h3>3. Draft Timetable View</h3>
                    <p>Exams are initially added as drafts:</p>
                    <ul>
                        <li><strong>Status:</strong> Marked as <strong>DRAFT</strong> until published.</li>
                        <li><strong>Actions:</strong> Use the <strong>Edit</strong> (pencil) or <strong>Delete</strong> (trash) icons to modify entries.</li>
                        <li><strong>Publish:</strong> Click <strong>Publish Timetable</strong> to finalize and make the schedule visible to students.</li>
                    </ul>
                </section>

                <section id="published-timetable" className={`docs-section ${activeSection === 'published-timetable' ? 'active' : ''}`}>
                    <h2>Published Timetable</h2>
                    <p>The <strong>Published Examination Timetable</strong> allows users to view, search, and manage confirmed exam schedules.</p>

                    <div className="alert-box caution">
                        <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        <div>
                            <strong>Live Updates:</strong> Changes to the published timetable are instantly visible to all students and faculty. Please proceed with caution.
                        </div>
                    </div>

                    <h3>1. Filters & Search</h3>
                    <p>Techniques to refine the displayed timetable:</p>
                    <ul>
                        <li><strong>Department:</strong> Filter exams by specific departments (e.g., CSE).</li>
                        <li><strong>Semester:</strong> View exams for a particular semester.</li>
                        <li><strong>Exam Type:</strong> Filter by exam category (e.g., MSE I, MSE II).</li>
                        <li><strong>Search Bar:</strong> Quickly find exams by name or date.</li>
                    </ul>

                    <h3>2. Timetable View</h3>
                    <p>The data table presents the following information:</p>
                    <ul>
                        <li><strong>Date & Time:</strong> When the exam is scheduled.</li>
                        <li><strong>Exam Type:</strong> The category of the assessment.</li>
                        <li><strong>Department & Semester:</strong> The target student group.</li>
                        <li><strong>Course:</strong> The subject of the exam (e.g., Database Management System).</li>
                    </ul>

                    <h3>3. Actions</h3>
                    <p>Authorized users can perform the following actions:</p>
                    <ul>
                        <li><strong>Edit (Pencil Icon):</strong> Modify exam details.
                            <br /><em>Note:</em> A confirmation modal will appear: &quot;<strong>Edit published exam? May affect schedules.</strong>&quot;
                        </li>
                        <li><strong>Delete (Trash Icon):</strong> Permanently remove an exam.
                            <br /><em>Warning:</em> You will be asked to confirm: &quot;<strong>Permanently delete this exam?</strong>&quot;
                        </li>
                    </ul>
                </section>

                <section id="profile" className={`docs-section ${activeSection === 'profile' ? 'active' : ''}`}>
                    <h2>Profile</h2>
                    <p>The Profile page lets you view and edit your personal account information.</p>

                    <h3>1. Profile Overview</h3>
                    <ul>
                        <li><strong>Cover & Avatar:</strong> Your cover photo and profile photo are shown at the top.</li>
                        <li><strong>Identity:</strong> Displays your name, bio, and profile badges like designation and department.</li>
                        <li><strong>Edit Profile Button:</strong> Switches the page into <strong>Editing Mode</strong>.</li>
                    </ul>

                    <h3>2. Editing Mode</h3>
                    <ul>
                        <li><strong>Cover Photo:</strong> Add, upload, remove, and reposition the cover image.</li>
                        <li><strong>Profile Photo:</strong> Upload or remove your profile photo and adjust its position.</li>
                        <li><strong>Bio Editing:</strong> Update your bio with a character limit counter.</li>
                    </ul>

                    <h3>3. Account Details Form</h3>
                    <ul>
                        <li><strong>Fields:</strong> Name, Designation, Department, Phone Number, and Email Address.</li>
                        <li><strong>Required:</strong> Name and Email are mandatory fields.</li>
                        <li><strong>Actions:</strong> Use <strong>Cancel</strong> or <strong>Save Changes</strong> to discard or apply updates.</li>
                    </ul>

                    <div className="alert-box tip">
                        <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <div>
                            <strong>Tip:</strong> Add your 10-digit phone number to receive a blue verification tick next to your name.
                        </div>
                    </div>
                </section>

                <section id="settings" className={`docs-section ${activeSection === 'settings' ? 'active' : ''}`}>
                    <h2>Settings</h2>
                    <p>Customize the application&apos;s look and feel to suit your preferences.</p>
                    <ul>
                        <li><strong>Background:</strong> Switch between <strong>Default</strong>, <strong>Lights out</strong>, or toggle <strong>Use system setting</strong>.</li>
                        <li><strong>Color:</strong> Select your preferred user interface color from options like Blue, Yellow, Pink, Purple, Orange, or Green.</li>
                    </ul>
                </section>

                <section id="built-with" className={`docs-section ${activeSection === 'built-with' ? 'active' : ''}`}>
                    <h2>Built With</h2>
                    <p>The AEMS project leverages modern web technologies to ensure performance, scalability, and developer experience.</p>
                    <div className="built-with-grid">
                        <div className="tech-card javascript">
                            <svg className="brand-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F7DF1E">
                                <rect width="24" height="24" rx="2" />
                                <path d="M11 17.5c0 1.5-.9 2.5-2.5 2.5-1.1 0-2-.5-2.4-1.2l1.5-1c.2.4.5.7 1 .7.4 0 .8-.2.8-.7v-5.6h1.7v5.3zm6.5 2.5c-1.6 0-2.8-.6-3.4-1.5l1.4-1.1c.4.6 1 .9 1.8.9.7 0 1.2-.3 1.2-.8 0-.5-.5-.8-1.5-1.1-1.6-.5-2.5-1.1-2.5-2.3 0-1.4 1.1-2.3 2.6-2.3 1.3 0 2.3.5 2.9 1.3l-1.3 1c-.3-.5-.8-.7-1.4-.7-.6 0-1 .3-1 .7 0 .5.5.7 1.5 1 1.7.5 2.5 1.1 2.5 2.4-.1 1.4-1.2 2.4-2.8 2.4z" fill="#000"/>
                            </svg>
                            <h4>JavaScript</h4>
                            <p className="tech-tag" style={{ backgroundColor: 'rgba(202, 138, 4, 0.1)', color: '#ca8a04' }}>Frontend Language</p>
                        </div>
                        <div className="tech-card react">
                            <svg className="brand-icon" xmlns="http://www.w3.org/2000/svg" viewBox="-11.5 -10.23174 23 20.46348">
                                <circle cx="0" cy="0" r="2.05" fill="#61dafb" />
                                <g stroke="#61dafb" strokeWidth="1" fill="none">
                                    <ellipse rx="11" ry="4.2" />
                                    <ellipse rx="11" ry="4.2" transform="rotate(60)" />
                                    <ellipse rx="11" ry="4.2" transform="rotate(120)" />
                                </g>
                            </svg>
                            <h4>React</h4>
                            <p className="tech-tag react">Frontend UI</p>
                        </div>
                        <div className="tech-card vite">
                            <svg className="brand-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                                <defs>
                                    <linearGradient id="viteGradient" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#41d1ff" />
                                        <stop offset="1" stopColor="#bd34fe" />
                                    </linearGradient>
                                    <linearGradient id="viteBolt" x1="16" y1="2" x2="16" y2="28" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#ffea83" />
                                        <stop offset="1" stopColor="#ffdd35" />
                                    </linearGradient>
                                </defs>
                                <path fill="url(#viteGradient)" d="M30.7 2.3c.6-1.1-.1-2.3-1.3-2.3H2.6C1.4 0 .7 1.2 1.3 2.3l14.1 29.1c.3.6 1.2.6 1.5 0L30.7 2.3z" />
                                <path fill="url(#viteBolt)" d="M21.5 2h-4L12.7 13.9h5L15 28.5l9.2-16.1h-4.8L21.5 2z" />
                            </svg>
                            <h4>Vite</h4>
                            <p className="tech-tag vite">Build Tool</p>
                        </div>

                        <div className="tech-card java">
                            <svg className="brand-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path fill="#007396" d="M14.6 13c-.1-.1-2.9-.6-6.1-.2 0 0-2.3.4-1.2 1.4 1.1 1 5 .8 5 .8s1.6-.2 2.3-.6c0 0 .5-.3 0-1.4zm-1.8.8c-.8.3-2.1.2-2.1.2s-2.1.2-2.5 0c-.5-.1-.3-.6-.3-.6s1-.4 2.8-.2c1.7.2 2.1.6 2.1.6zm2.3 2s-.1-1.2-1.9-1c-1.8.2-5.4.1-5.7-.3-.3-.4-1.5-1.4 1.8-2 0 0-3.3-.4-5.2.4-1.9.8-1 2.3-1 2.3s1.2 1.4 4.3 1.9c3.1.5 5.8 0 7.7-1.3zm.5-6s.3-1.4-2-1.6c-2.3-.2-5.3 0-5.7-.3-.4-.4-1.2-1.3 2-1.8 0 0-3.3-.4-5.2.5C2.8 8 3.7 9.4 3.7 9.4s1 1.4 4.1 1.8c3.1.5 6-.1 7.8-1.4z"/>
                                <path fill="#ED2224" d="M12.9 5.5s1.9-2.2.6-4.3c0 0 2 1.9.2 4.3 0 0 .9-.5 1-1.3 0 0 .3 1.4-.9 2zM9 4.3C8.5 2 11.2.6 11.2.6s-.8.6-1.1 1.3c0 0-.2.9.2 1.6.4.7.7 1.2.3 2 0 0 1-.7.6-1.9z"/>
                            </svg>
                            <h4>Java</h4>
                            <p className="tech-tag" style={{ backgroundColor: 'rgba(0, 115, 150, 0.1)', color: '#007396' }}>Backend Language</p>
                        </div>
                        <div className="tech-card springboot">
                            <svg className="brand-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
                                <path fill="#6db33f" d="M116.2 25.6L68.8 3.2c-2.9-1.4-6.2-1.4-9.1 0L11.8 25.6C7.5 27.6 5 32 5 36.8v46.1c0 4.8 2.5 9.2 6.8 11.2l47.9 22.4c1.3.6 2.8 1 4.3 1 1.5 0 2.9-.3 4.3-1l47.9-22.4c4.3-2 6.8-6.4 6.8-11.2V36.8c0-4.8-2.6-9.2-6.8-11.2z" />
                                <path fill="#fff" d="M64 35.8c-2.7 0-4.9 2.2-4.9 4.9v23.6c0 2.7 2.2 4.9 4.9 4.9s4.9-2.2 4.9-4.9V40.7c0-2.7-2.1-4.9-4.9-4.9z" />
                                <path fill="#fff" d="M64 92.4C48.8 92.4 36.4 80 36.4 64.9c0-8.6 4-16.2 10.3-21.3 2.1-1.7 5.2-1.4 6.9.7 1.7 2.1 1.4 5.2-.7 6.9-4.3 3.5-7 8.7-7 14.6 0 10.4 8.5 18.9 18.9 18.9 10.4 0 18.9-8.5 18.9-18.9 0-5.9-2.7-11.1-7-14.6-2.1-1.7-2.4-4.8-.7-6.9 1.7-2.1 4.8-2.4 6.9-.7 6.3 5.1 10.3 12.7 10.3 21.3.1 15.1-12.3 27.4-27.5 27.4z" />
                            </svg>
                            <h4>Spring Boot</h4>
                            <p className="tech-tag springboot">Backend API</p>
                        </div>
                        <div className="tech-card security">
                            <svg className="brand-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6db33f">
                                <path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4zm0 2.18l7 3.12v4.7c0 4.67-2.93 8.9-7 10.02-4.07-1.12-7-5.35-7-10.02V7.3l7-3.12z" />
                                <path d="M12 15s1.5-1.5 2-2.5c.27-.53.5-1.25.5-2 0-1.38-1.12-2.5-2.5-2.5S9.5 9.12 9.5 10.5c0 .75.23 1.47.5 2 .5 1 2 2.5 2 2.5z" />
                            </svg>
                            <h4>Spring Security</h4>
                            <p className="tech-tag" style={{ backgroundColor: 'rgba(109, 179, 63, 0.1)', color: '#6db33f' }}>Authentication</p>
                        </div>

                        <div className="tech-card mongodb">
                            <svg className="brand-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#00ED64">
                                <path d="M17.193 11.23c-1.63-3.69-5.18-5.99-5.18-5.99s-3.55 2.3-5.18 5.99c-1.12 2.53-.94 5.37-.1 7.22 1.34 2.96 4 4.5 5.23 4.5.01 0 .01 0 .02 0 .01 0 .01 0 .02 0 1.22 0 3.89-1.54 5.23-4.5.84-1.85 1.02-4.69-.1-7.22l-.12-.27c.01.07.02.14.02.21v.07c0 .16-.01.32-.01.48 0 0 .15-.65.17-.79z" fill="#00ED64" />
                                <path d="M12.44 8.79c1.928 2.128 2.296 4.3 1.254 5.308-1.042 1.008-2.585.5-3.033-.654-.448-1.154.264-2.696 1.779-4.654z" fill="#ffffff" />
                                <path d="M11.66 8.35c.13-.3.4-.44 1.02.06 1.23.77 3.03 2.7 3.07 6.27.02 1.19-.37 1.92-.91 2.17-.54.25-1.31-.22-1.52-.43-.3-.3-1.64-1.88-1.64-1.88-.18-.15-.29-.29-.14-.58.4-.78.54-1.61.2-2.3-.34-.68-1.13-.95-1.81-.55-.67.39-.9 1.32-.48 1.89.16.21.38.35.65.39.42.07.96-.08 1.34-.49.09-.1.23-.1.38-.1-.82 1.84-1.56 2.32-2.54 1.67-.98-.66-1.06-1.84-.24-3.5.67-1.36 1.58-2.12 2.62-2.63z" fill="#00ED64" />
                            </svg>
                            <h4>MongoDB</h4>
                            <p className="tech-tag mongodb">Database</p>
                        </div>
                        <div className="tech-card docker">
                            <svg className="brand-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2496ED">
                                <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.185m-2.95 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.184-.185h-2.12a.185.185 0 00-.184.185v1.887c0 .102.083.185.184.185m0 2.715h2.12a.186.186 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.184.185m-2.954-2.715h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185h-2.119a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.185m0 2.715h2.119a.187.187 0 00.185-.185V9.006a.186.186 0 00-.185-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.953 0h2.119a.186.186 0 00.185-.185V9.006a.186.186 0 00-.185-.186H2.172a.186.186 0 00-.185.185v1.888c0 .102.082.185.185.185m21.758-1.503a4.966 4.966 0 00-1.545-3.082L20.895.03c-.02-.02-.053-.02-.072 0l-1.391 1.341c-.01.01-.013.024-.006.036l.245.45c.01.017.034.015.042-.002.32-.619 1.134-1.218 2.052-1.121a2.808 2.808 0 012.302 1.62c.432.966.275 2.124-.316 2.97a.035.035 0 00.03.056c.664.085 1.25.502 1.554 1.12.305.618.32 1.344.041 1.972-.28.628-.847 1.077-1.516 1.205-.008.002-.011.014-.003.02A1.916 1.916 0 0023.75 14.5a1.91 1.91 0 001.353-.561 1.905 1.905 0 00.56-1.354 1.914 1.914 0 00-1.733-1.892zM12.986 12.015c-3.13 0-5.83.676-5.83 1.506 0 .83 2.7 1.506 5.83 1.506s5.83-.676 5.83-1.506c0-.83-2.7-1.506-5.83-1.506zM7.106 13.52c0 2.228 3.824 4.032 8.536 4.032s8.536-1.804 8.536-4.032V8.924c0-.987-.132-1.932-.375-2.812l-1.542 1.487c.224.78.345 1.62.345 2.483v4.596C22.606 16.906 18.782 18.71 14.1 18.71S5.594 16.906 5.594 14.636V9.92h1.512v4.716z" />
                            </svg>
                            <h4>Docker</h4>
                            <p className="tech-tag" style={{ backgroundColor: 'rgba(36, 150, 237, 0.1)', color: '#2496ED' }}>Containerization</p>
                        </div>
                        <div className="tech-card netlify">
                            <svg className="brand-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00C7B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                                <polyline points="2 17 12 22 22 17"></polyline>
                                <polyline points="2 12 17 22 12"></polyline>
                            </svg>
                            <h4>Netlify</h4>
                            <p className="tech-tag netlify">Frontend Hosting</p>
                        </div>
                        <div className="tech-card render">
                            <svg className="brand-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.263.007c-3.121-.147-5.744 2.109-6.192 5.082-.018.138-.045.272-.067.405-.696 3.703-3.936 6.507-7.827 6.507-1.388 0-2.691-.356-3.825-.979a.2024.2024 0 0 0-.302.178V24H12v-8.999c0-1.656 1.338-3 2.987-3h2.988c3.382 0 6.103-2.817 5.97-6.244-.12-3.084-2.61-5.603-5.682-5.75" />
                            </svg>
                            <h4>Render</h4>
                            <p className="tech-tag render">Backend Hosting</p>
                        </div>
                    </div>

                </section>

                <section id="technology-stack" className={`docs-section ${activeSection === 'built-with' ? 'active' : ''}`}>
                    <div className="alert-box tip">
                        <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <div>
                            <strong>Technology Stack:</strong> AEMS uses <strong>React</strong> & <strong>JavaScript</strong> for the frontend (built with <strong>Vite</strong> and deployed to <strong>Netlify</strong>), and <strong>Spring Boot</strong> & <strong>Java</strong> for the backend API (containerized with <strong>Docker</strong> and deployed to <strong>Render</strong>). Data is managed via <strong>MongoDB</strong>, with <strong>Spring Security</strong> ensuring secure access.
                            <br /><br />
                            <em>* <strong>Vite</strong> prepares the website&apos;s code behind the scenes so it loads super fast on your screen.</em><br />
                            <em>* <strong>Spring Boot</strong> is the engine that powers the backend logic and connects to the database.</em><br />
                            <em>* <strong>Spring Security</strong> acts as the security guard that handles logins and keeps private data safe.</em><br />
                            <em>* <strong>Docker</strong> packs the app into a single box so it runs smoothly on any cloud server without breaking.</em>
                        </div>
                    </div>
                </section>

            </main >
        </div >
    );
};

export default DocsPage;
