export const TIME_SLOTS = [
    { label: 'Morning (09:30 AM - 11:00 AM)', start: '09:30', end: '11:00', duration: 90 },
    { label: 'Afternoon (01:30 PM - 03:00 PM)', start: '13:30', end: '15:00', duration: 90 }
];

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export const DEPARTMENTS = ['CSE', 'AE', 'CE', 'ECE', 'EEE', 'ME', 'ISE', 'AI&DS', 'AI&ML'];

const ALLOWED_SCHEDULER_EMAILS = [
    'nagaratna.p@nmit.ac.in',
    'uma.r@nmit.ac.in',
    '1nt22cs098.lalan@nmit.ac.in',
    '1nt22cs092.kotalo@nmit.ac.in'
];

export const canScheduleTimetable = (email) => {
    if (!email) return false;
    return ALLOWED_SCHEDULER_EMAILS.includes(String(email).toLowerCase().trim());
};
