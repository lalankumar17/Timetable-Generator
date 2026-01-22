import { memo } from 'react';
import '../../Style/Pages/AboutUs.css';
import Github from '../../Icons/Github';
import Linkedin from '../../Icons/Linkedin';

function AboutUsPage() {
    return (
        <div className='page aboutus-page'>
            <div className='aboutus-content'>

                {/* Hero Section */}
                <div className='aboutus-hero'>
                    <div className='aboutus-hero-badge'>ABOUT TIMETABLE GENERATION</div>
                    <h1 className='aboutus-hero-title'>
                        Timetable <span className='aboutus-hero-highlight'>Generation</span>
                    </h1>
                    <p className='aboutus-hero-subtitle'>
                        A modern, cloud-based platform to effortlessly create, organize, and publish exam schedules.
                    </p>
                </div>

                <div className='aboutus-section'>

                    {/* Mission Card */}
                    <div className='aboutus-mission-card'>
                        <div className='aboutus-mission-icon'>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <div className='aboutus-mission-content'>
                            <h2>From the Developers</h2>
                            <p>
                                Manually creating exam timetables is a complex and time-consuming process, often resulting in scheduling conflicts, overlapping exams, and wasted effort.
                            </p>
                            <p>
                                To solve this, we built a <strong>Timetable Generator</strong> that completely automates this process, instantly creating fair, conflict-free schedules that can be easily shared with students and staff.
                            </p>
                        </div>
                    </div>

                    {/* Features */}
                    <div className='aboutus-features-section'>
                        <div className='aboutus-section-header'>
                            <h2>Core Features</h2>
                            <div className='aboutus-section-line'></div>
                        </div>
                        <div className='aboutus-features-grid'>
                            <div className='aboutus-feature' data-accent='blue'>
                                <div className='aboutus-feature-icon'>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                                </div>
                                <h3>Create & Manage</h3>
                                <p>Instantly build perfect, clash-free exam timetables.</p>
                            </div>
                            <div className='aboutus-feature' data-accent='green'>
                                <div className='aboutus-feature-icon'>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                </div>
                                <h3>Secure Access</h3>
                                <p>Log in safely and easily reset passwords via email.</p>
                            </div>
                            <div className='aboutus-feature' data-accent='purple'>
                                <div className='aboutus-feature-icon'>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                </div>
                                <h3>Export as PDF</h3>
                                <p>Download clean, print-ready schedules in one click.</p>
                            </div>
                            <div className='aboutus-feature' data-accent='orange'>
                                <div className='aboutus-feature-icon'>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                                </div>
                                <h3>Data Management</h3>
                                <p>Keep teachers, subjects, and student groups organized.</p>
                            </div>
                        </div>
                    </div>

                    {/* Contributors Section */}
                    <div className='contributors-section'>
                        <div className='contributors-card-container'>
                            <div className='contributors-header'>
                                <div className='contributors-icon-box'>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                </div>
                                <div className='contributors-title-web'>
                                    <h2>Contributors</h2>
                                    <p>Meet the team behind this project</p>
                                </div>
                            </div>
                            <div className='contributors-grid'>
                                {/* Developer 1 */}
                                <div className='developer-card'>
                                    <div className='dev-avatar-wrapper'>
                                        <div className='dev-avatar gradient-blue'>LM</div>
                                    </div>
                                    <h3 className='dev-name'>Lalan Mahato</h3>
                                    <div className='dev-role'>FULL STACK DEVELOPER</div>
                                    <a href="mailto:imlalan7@gmail.com" className='dev-email'>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                        imlalan7@gmail.com
                                    </a>
                                    <div className='dev-socials'>
                                        <a href="https://github.com/lalankumar17" target="_blank" rel="noopener noreferrer" className='dev-social-link'>
                                            <Github width={18} height={18} />
                                            GitHub
                                        </a>
                                        <a href="https://www.linkedin.com/in/lalan-mahato" target="_blank" rel="noopener noreferrer" className='dev-social-link'>
                                            <Linkedin width={18} height={18} />
                                            LinkedIn
                                        </a>
                                    </div>
                                </div>

                                {/* Developer 2 */}
                                <div className='developer-card'>
                                    <div className='dev-avatar-wrapper'>
                                        <div className='dev-avatar gradient-orange'>KA</div>
                                    </div>
                                    <h3 className='dev-name'>K. Aswini</h3>
                                    <div className='dev-role'>FULL STACK DEVELOPER</div>
                                    <a href="mailto:kotaloaswini@gmail.com" className='dev-email'>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                        kotaloaswini@gmail.com
                                    </a>
                                    <div className='dev-socials'>
                                        <a href="https://github.com/KotaloAswini" target="_blank" rel="noopener noreferrer" className='dev-social-link'>
                                            <Github width={18} height={18} />
                                            GitHub
                                        </a>
                                        <a href="https://www.linkedin.com/in/kotaloaswini/" target="_blank" rel="noopener noreferrer" className='dev-social-link'>
                                            <Linkedin width={18} height={18} />
                                            LinkedIn
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>

            {/* Footer */}
            <div className='aboutus-footer'>
                <div className='aboutus-footer-inner'>
                    <p>&copy; 2026 Nitte, Bangalore | Powered by <span className='aboutus-footer-name chillipages-brand'>CSE Students</span></p>
                </div>
            </div>
        </div>
    );
}

export default memo(AboutUsPage);
