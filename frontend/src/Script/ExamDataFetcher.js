import { url as API_URL } from './fetchUrl';
import jsPDF from 'jspdf';

function getActorEmail() {
    try {
        const raw = sessionStorage.getItem('user');
        if (!raw) return '';
        const user = JSON.parse(raw);
        return user?.email || '';
    } catch {
        return '';
    }
}

// Helper to format time to 12-hour format
export function formatTo12Hour(timeStr) {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    let hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '12'
    return `${hour}:${minutes} ${ampm}`;
}

// Get all exams (optionally filter by semester and department)
export async function getExams(semester, department, status) {
    const params = new URLSearchParams();
    if (semester) params.append('semester', semester.toString());
    if (department) params.append('department', department);
    if (status) params.append('status', status);

    const url = `${API_URL}/api/exams${params.toString() ? '?' + params.toString() : ''}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch exams');
        return await response.json();
    } catch (error) {
        console.error('Error fetching exams:', error);
        return [];
    }
}

// Schedule new exam
export async function scheduleExam(
    exam,
    onSuccess,
    onError
) {
    try {
        const actorEmail = getActorEmail();
        const endpoint = `${API_URL}/api/exams${actorEmail ? `?actorEmail=${encodeURIComponent(actorEmail)}` : ''}`;
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(exam)
        });


        if (!response.ok) {
            const error = await response.json();
            console.error("Schedule failed:", error);
            throw new Error(error.error || 'Failed to schedule');
        }

        const data = await response.json();
        onSuccess(data);
    } catch (error) {
        console.error("Schedule error (catch):", error);
        onError(error instanceof Error ? error.message : 'Failed to schedule exam');
    }
}

// Update exam (manual adjustment)
export async function updateExam(
    id,
    updates,
    onSuccess,
    onError
) {
    try {
        const actorEmail = getActorEmail();
        const endpoint = `${API_URL}/api/exams/${id}${actorEmail ? `?actorEmail=${encodeURIComponent(actorEmail)}` : ''}`;
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update');
        }

        const data = await response.json();
        onSuccess(data);
    } catch (error) {
        console.error('Update exam error:', error);
        onError(error instanceof Error ? error.message : 'Failed to update exam');
    }
}

// Delete exam
export async function deleteExam(
    id,
    onSuccess,
    onError
) {
    try {
        const actorEmail = getActorEmail();
        const endpoint = `${API_URL}/api/exams/${id}${actorEmail ? `?actorEmail=${encodeURIComponent(actorEmail)}` : ''}`;
        const response = await fetch(endpoint, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete');
        }

        onSuccess();
    } catch (error) {
        console.error('Delete exam error:', error);
        onError(error instanceof Error ? error.message : 'Failed to delete exam');
    }
}

// Check for conflicts
export async function checkConflicts(semester, department) {
    const params = new URLSearchParams();
    if (semester) params.append('semester', semester.toString());
    if (department) params.append('department', department);

    const url = `${API_URL}/api/exams/conflicts${params.toString() ? '?' + params.toString() : ''}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to check conflicts');
        return await response.json();
    } catch (error) {
        console.error('Error checking conflicts:', error);
        return { conflictFree: true, conflicts: [] };
    }
}

// Auto-resolve conflicts
export async function autoResolveConflicts(
    semester,
    department,
    onSuccess = () => { },
    onError = () => { }
) {
    const params = new URLSearchParams();
    if (semester) params.append('semester', semester.toString());
    if (department) params.append('department', department);
    const actorEmail = getActorEmail();
    if (actorEmail) params.append('actorEmail', actorEmail);

    const url = `${API_URL}/api/exams/auto-resolve${params.toString() ? '?' + params.toString() : ''}`;

    try {
        const response = await fetch(url, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to auto-resolve conflicts');
        const data = await response.json();
        onSuccess(data);
    } catch (error) {
        onError(error instanceof Error ? error.message : 'Failed to auto-resolve');
    }
}

// Publish timetable
export async function publishTimetable(
    semester,
    department,
    onSuccess = () => { },
    onError = () => { }
) {
    const params = new URLSearchParams();
    if (semester) params.append('semester', semester.toString());
    if (department) params.append('department', department);
    const actorEmail = getActorEmail();
    if (actorEmail) params.append('actorEmail', actorEmail);

    const url = `${API_URL}/api/exams/publish${params.toString() ? '?' + params.toString() : ''}`;

    try {
        const response = await fetch(url, { method: 'PUT' });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to publish');
        }
        const data = await response.json();
        onSuccess(data);
    } catch (error) {
        onError(error instanceof Error ? error.message : 'Failed to publish');
    }
}

// Get status
export async function getExamStatus() {
    try {
        const response = await fetch(`${API_URL}/api/exams/status`);
        if (!response.ok) throw new Error('Failed to get status');
        return await response.json();
    } catch (error) {
        console.error('Error getting status:', error);
        return { total: 0, published: 0, draft: 0, isFullyPublished: false };
    }
}



// Generate printable timetable HTML
function generatePrintableHTML(exams, subjects, title) {
    // Sort exams by date and time
    const sortedExams = [...exams].sort((a, b) => {
        const dateA = new Date(a.examDate + 'T' + a.startTime);
        const dateB = new Date(b.examDate + 'T' + b.startTime);
        return dateA.getTime() - dateB.getTime();
    });

    // Helper to get subject code
    const getSubjectCode = (courseName, semester) => {
        const subject = subjects.find(s => s.name === courseName && s.semester === semester);
        return subject ? subject.subjectCode : 'N/A';
    };

    // Helper to format date dd-mm-yyyy
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const rows = sortedExams.map((exam, index) => {
        const subjectCode = getSubjectCode(exam.courseName, exam.semester);
        return `
            <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td style="text-align: center; font-weight: bold;">${subjectCode}</td>
                <td style="font-weight: bold; text-transform: uppercase;">${exam.courseName}</td>
                <td style="text-align: center; font-weight: bold;">${formatDate(exam.examDate)}</td>
                <td style="text-align: center; font-weight: bold;">
                    ${formatTo12Hour(exam.startTime)} – ${formatTo12Hour(exam.endTime)}
                </td>
            </tr>
        `;
    }).join('');

    // Department name mapping
    const departmentNames = {
        'CSE': 'Computer Science & Engineering',
        'AE': 'Aeronautical Engineering',
        'CE': 'Civil Engineering',
        'ECE': 'Electronics & Communication Engineering',
        'EEE': 'Electrical & Electronics Engineering',
        'ME': 'Mechanical Engineering',
        'ISE': 'Information Science & Engineering',
        'AI&DS': 'Artificial Intelligence & Data Science',
        'AI&ML': 'Artificial Intelligence & Machine Learning'
    };

    const departments = Array.from(new Set(exams.map(e => e.department)))
        .map(dept => departmentNames[dept] || dept)
        .join(' & ');

    // Helper function to convert number to ordinal (1st, 2nd, 3rd, 4th, etc.)
    const toOrdinal = (n) => {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    // Convert semesters to ordinal format
    const semesterNumbers = Array.from(new Set(exams.map(e => e.semester))).sort();
    const semesters = semesterNumbers.map(toOrdinal).join(', ');

    // Get exam type (MSE I or MSE II) - use the first exam's type or default
    const examType = exams.length > 0 && exams[0].examType ? exams[0].examType : 'MSE';

    // Get test coordinator - use the first non-empty value or default
    const testCoordinator = exams.find(e => e.testCoordinator)?.testCoordinator || 'N/A';

    // Get Dept codes for signature
    const deptCodes = Array.from(new Set(exams.map(e => e.department))).join(' & ');
    // Enforce (Dept. of <Code>) format
    const hod = `(Dept. of ${deptCodes || 'CSE'})`;

    // Calculate academic years based on exam dates
    let minYear = Infinity;
    let maxYear = -Infinity;

    if (exams.length === 0) {
        const y = new Date().getFullYear();
        minYear = y;
        maxYear = y;
    } else {
        exams.forEach(e => {
            const y = new Date(e.examDate).getFullYear();
            if (y < minYear) minYear = y;
            if (y > maxYear) maxYear = y;
        });
    }

    const academicYear = (minYear === maxYear)
        ? `${minYear}-${minYear + 1}`
        : `${minYear}-${maxYear}`;

    // Format Exam Type Description
    let examTitlePart = 'EXAMINATION';
    if (examType === 'MSE I') {
        examTitlePart = 'FIRST MID-SEM EXAM [MSE-I]';
    } else if (examType === 'MSE II') {
        examTitlePart = 'SECOND MID-SEM EXAM [MSE-II]';
    } else if (examType.includes('Retest')) {
        examTitlePart = 'RETEST';
    } else {
        examTitlePart = `${examType}`;
    }

    return `
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <style>
        body { 
            font-family: "Times New Roman", Times, serif; 
            padding: 20px; 
            max-width: 1000px; 
            margin: 0 auto; 
            color: #000;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 0px solid #000;
            padding-bottom: 10px;
        }
        .logo-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin-bottom: 10px;
        }
        .logo-text {
            font-size: 24px;
            font-weight: bold;
            font-family: Arial, sans-serif;
            letter-spacing: 1px;
        }
        .logo-sub {
            font-size: 14px;
            font-weight: normal;
            display: block;
        }
        .department-title {
            font-size: 22px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 40px 0 5px;
            font-family: Arial, sans-serif;
        }
        .exam-title {
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
            font-family: Arial, sans-serif;
            margin-bottom: 5px;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
            font-family: Arial, sans-serif;
            font-size: 14px;
        }
        th, td { 
            border: 1px solid #000; 
            padding: 8px 10px; 
            text-align: left; 
            vertical-align: middle;
        }
        th { 
            background: #d1d5db;
            color: #000; 
            font-weight: bold;
            text-align: center;
        }
        .footer {
            margin-top: 100px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            font-family: Arial, sans-serif;
            font-weight: bold;
            font-size: 14px;
            padding: 0 20px;
        }
        .signature {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
            padding-top: 40px;
        }

        @media print { 
            @page { size: landscape; margin: 10mm; }
            body { margin: 0; } 
            .no-print { display: none; }
            th { background-color: #d1d5db !important; -webkit-print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo-row">
            <img src="/nitte-logo.png" alt="Nitte Logo" style="max-width: 100%; height: auto; max-height: 80px;" />
        </div>
        
        <div class="department-title">
            DEPARTMENT OF ${departments ? departments : 'COMPUTER SCIENCE & ENGINEERING'}
        </div>
        <div class="exam-title">
             ${semesters ? semesters : ''} SEMESTER – ${examTitlePart.includes('RETEST') ? 'RETEST TIMETABLE' : examTitlePart + ' TIMETABLE'} (${academicYear})
        </div>
    </div>

    <div style="text-align: right; margin-bottom: 5px; font-weight: bold; font-family: Arial, sans-serif; font-size: 14px;">
        ${new Date().toLocaleDateString('en-GB').split('/').join('-')}
    </div>

    <table>
            ${examTitlePart.includes('RETEST') ? `
        <colgroup>
            <col style="width: 5%;">
            <col style="width: 12%;">
            <col style="width: 33%;">
            <col style="width: 15%;">
            <col style="width: 10%;">
            <col style="width: 25%;">
        </colgroup>
        <thead>
            <tr>
                <th>Sl.no</th>
                <th>Sub-code</th>
                <th>Subject</th>
                <th>Date</th>
                <th>MSE</th>
                <th>Time</th>
            </tr>
        </thead>
        <tbody>
            ${(() => {
                // Group exams by subject and semester
                const examsBySubject = {};
                sortedExams.forEach(exam => {
                    const key = exam.courseName + '_' + exam.semester;
                    if (!examsBySubject[key]) examsBySubject[key] = [];
                    examsBySubject[key].push(exam);
                });

                return Object.values(examsBySubject).map((subjectExams, index) => {
                    const subjectCode = getSubjectCode(subjectExams[0].courseName, subjectExams[0].semester);

                    // Sort to ensure MSE I (MSE-1) comes before MSE II (MSE-2)
                    // We look for 'MSE I' or 'MSE II' in the string
                    const sortedSubjectExams = subjectExams.sort((a, b) => {
                        const typeA = a.examType || '';
                        const typeB = b.examType || '';
                        // Explicit precedence
                        const scoreA = typeA.includes('MSE I') && !typeA.includes('MSE II') ? 1 : (typeA.includes('MSE II') ? 2 : 3);
                        const scoreB = typeB.includes('MSE I') && !typeB.includes('MSE II') ? 1 : (typeB.includes('MSE II') ? 2 : 3);
                        return scoreA - scoreB;
                    });

                    const rowSpan = sortedSubjectExams.length;

                    return sortedSubjectExams.map((ex, i) => {
                        // Determine label based on exam type content
                        let label = 'MSE';
                        if (ex.examType && ex.examType.includes('MSE I') && !ex.examType.includes('MSE II')) label = 'MSE-1';
                        if (ex.examType && ex.examType.includes('MSE II')) label = 'MSE-2';

                        const isFirst = i === 0;

                        if (isFirst) {
                            return `
                                <tr>
                                    <td rowSpan="${rowSpan}" style="text-align: center;">${index + 1}</td>
                                    <td rowSpan="${rowSpan}" style="text-align: center; font-weight: bold;">${subjectCode}</td>
                                    <td rowSpan="${rowSpan}" style="font-weight: bold; text-transform: uppercase;">${ex.courseName}</td>
                                    <td rowSpan="${rowSpan}" style="text-align: center; font-weight: bold;">${formatDate(ex.examDate)}</td>
                                    <td style="text-align: center; font-weight: bold;">${label}</td>
                                    <td style="text-align: center; font-weight: bold;">${formatTo12Hour(ex.startTime)} - ${formatTo12Hour(ex.endTime)}</td>
                                </tr>
                            `;
                        } else {
                            return `
                                <tr>
                                    <td style="text-align: center; font-weight: bold;">${label}</td>
                                    <td style="text-align: center; font-weight: bold;">${formatTo12Hour(ex.startTime)} - ${formatTo12Hour(ex.endTime)}</td>
                                </tr>
                            `;
                        }
                    }).join('');
                }).join('');
            })()}
        </tbody>
        ` : `
        <colgroup>
            <col style="width: 8%;">
            <col style="width: 15%;">
            <col style="width: 42%;">
            <col style="width: 15%;">
            <col style="width: 20%;">
        </colgroup>
        <thead>
            <tr>
                <th>Sl.no</th>
                <th>Sub-code</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Time</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
        </tbody>
        `}
    </table>

    <div class="footer">
        <div class="signature">
            <div style="border-top: 1px solid #000; width: 200px; margin-bottom: 5px;"></div>
            <span style="font-weight: bold; font-family: Arial, sans-serif; font-size: 22px;">Test Coordinator</span>
            <span style="font-size: 18px; font-weight: normal; margin-top: 5px;">${testCoordinator}</span>
        </div>
        
        <div class="signature">
             <div style="border-top: 1px solid #000; width: 200px; margin-bottom: 5px;"></div>
             <span style="font-weight: bold; font-family: Arial, sans-serif; font-size: 22px;">HOD</span>
             <span style="font-size: 18px; font-weight: normal;">${hod}</span>
        </div>
    </div>
</body>
</html>`;
}

// Print timetable
export function printTimetable(exams, subjects, title = 'Examination Timetable') {
    const html = generatePrintableHTML(exams, subjects, title);

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        // On mobile, printing an iframe often prints the parent page or fails. 
        // Opening a new window works well unless popups are strictly blocked.
        try {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.open();
                printWindow.document.write(html);
                printWindow.document.close();
                printWindow.focus();

                // Increase timeout to give mobile browsers time to render before invoking print
                setTimeout(() => {
                    printWindow.print();
                    // Don't auto-close on mobile, it interrupts the print dialog on Android/iOS
                }, 1000);
                return;
            }
        } catch (e) {
            console.warn('Popup blocked or failed, falling back to iframe print', e);
        }
    }

    // Fallback for desktop or if popup blocked
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
        doc.open();
        doc.write(html);
        doc.close();

        iframe.contentWindow?.focus();
        setTimeout(() => {
            iframe.contentWindow?.print();
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 2000);
        }, 800);
    }
}

// Download timetable as PDF (exact same as print preview)
export async function downloadTimetable(exams, subjects, title = 'Examination Timetable') {
    const html = generatePrintableHTML(exams, subjects, title);

    const iframe = document.createElement('iframe');
    // For mobile, off-screen elements (-9999px) might not get rendered.
    // Use fixed positioning behind the main content instead.
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '800px';
    iframe.style.height = '1000px';
    iframe.style.zIndex = '-9999';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
        document.body.removeChild(iframe);
        throw new Error('Could not access iframe document');
    }

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    // Wait for content to render and resources (like images) to load
    await new Promise(resolve => setTimeout(resolve, 500));

    const contentHeight = Math.max(iframeDoc.body.scrollHeight, 1000);
    iframe.style.height = contentHeight + 'px';

    const html2canvas = (await import('html2canvas')).default;

    const canvas = await html2canvas(iframeDoc.body, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 800,
        height: contentHeight,
        windowWidth: 800
    });

    document.body.removeChild(iframe);

    const imgData = canvas.toDataURL('image/png');
    const pdfDoc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = pdfDoc.internal.pageSize.getWidth();
    const pageHeight = pdfDoc.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= pageHeight - 20) {
        pdfDoc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    } else {
        const scaleFactor = (pageHeight - 20) / imgHeight;
        const scaledWidth = imgWidth * scaleFactor;
        const scaledHeight = imgHeight * scaleFactor;
        const xOffset = (pageWidth - scaledWidth) / 2;
        pdfDoc.addImage(imgData, 'PNG', xOffset, 10, scaledWidth, scaledHeight);
    }

    const dept = exams[0]?.department || 'Exam';
    const sem = exams[0]?.semester || '';
    const examTypeVal = (exams[0]?.examType || 'Timetable').replace(' ', '_');
    pdfDoc.save(`${dept}_Sem${sem}_${examTypeVal}_Timetable.pdf`);
}
