import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  th: {
    // Brand & General
    brand: 'UniWork',
    role_student: 'นิสิต',
    role_company: 'สถานประกอบการ',
    role_professor: 'อาจารย์ที่ปรึกษา',
    signOut: 'ออกจากระบบ',
    signIn: 'เข้าสู่ระบบ',
    register: 'สมัครสมาชิก',
    language: 'ภาษา',
    th: 'ไทย',
    en: 'English',

    // Sidebar Navigation
    dashboard: 'แดชบอร์ด',
    findInternships: 'ค้นหาที่ฝึกงาน',
    applicationStatus: 'สถานะการสมัคร',
    weeklyReports: 'รายงานประจำสัปดาห์',
    profileResume: 'โปรไฟล์ & เอกสาร',
    myJobListings: 'ตำแหน่งงานของฉัน',
    applicants: 'ผู้สมัครงาน',
    postNewJob: 'ลงประกาศงานใหม่',
    companyProfile: 'โปรไฟล์บริษัท',
    studentList: 'รายชื่อนิสิต',
    reviewReports: 'ตรวจรายงาน',

    // Actions & Buttons
    search: 'ค้นหา...',
    filter: 'ตัวกรอง',
    all: 'ทั้งหมด',
    cancel: 'ยกเลิก',
    submit: 'บันทึก / ส่ง',
    save: 'บันทึกการเปลี่ยนแปลง',
    delete: 'ลบ',
    download: 'ดาวน์โหลด',
    upload: 'อัปโหลด',
    details: 'ดูรายละเอียด',
    applyNow: 'สมัครทันที',
    viewAll: 'ดูทั้งหมด',
    close: 'ปิด',
    back: 'ย้อนกลับ',
    applied: 'สมัครแล้ว',
    reset: 'รีเซ็ต',
    uploadDoc: 'อัปโหลดเอกสาร',
    writeReport: 'เขียนรายงาน',

    // Status Badges
    status_accepted: 'ผ่านการคัดเลือก',
    status_interviewing: 'นัดสัมภาษณ์',
    status_reviewing: 'กำลังพิจารณา',
    status_rejected: 'ไม่ผ่านการคัดเลือก',
    status_open: 'เปิดรับสมัคร',
    status_closed: 'ปิดรับสมัคร',
    status_placed: 'ได้ที่ฝึกงานแล้ว',
    status_searching: 'กำลังหาที่ฝึกงาน',
    status_pending: 'รอดำเนินการ',
    status_reviewed: 'ตรวจแล้ว',
    status_verified: 'ตรวจสอบแล้ว',

    // Landing Page
    heroTitle1: 'เชื่อมต่ออนาคตของคุณ',
    heroTitle2: 'กับที่ฝึกงานที่ใช่',
    heroSub: 'ระบบบริหารจัดการฝึกงานที่เชื่อมโยงนิสิต บริษัท และอาจารย์ เข้าด้วยกันอย่างราบรื่นและมีประสิทธิภาพ',
    forStudents: 'สำหรับนิสิต',
    forCompanies: 'สำหรับบริษัท',
    forProfessors: 'สำหรับอาจารย์',
    feature1Title: 'ค้นหางานที่ตรงใจ',
    feature1Desc: 'นิสิตสามารถค้นหาตำแหน่งฝึกงานที่ตรงกับสาขา พร้อมส่ง Resume สมัครงานได้ทันที',
    feature2Title: 'สรรหาบุคลากรง่ายดาย',
    feature2Desc: 'บริษัทโพสต์ประกาศงานได้ในไม่กี่นาที และจัดการผู้สมัครผ่านแดชบอร์ดเฉพาะ',
    feature3Title: 'ติดตามผลแบบ Real-time',
    feature3Desc: 'อาจารย์ติดตามสถานะฝึกงาน ตรวจรายงานประจำสัปดาห์ และให้คำแนะนำได้ในที่เดียว',
    statStudents: 'นิสิตในระบบ',
    statCompanies: 'บริษัทพันธมิตร',
    statPositions: 'ตำแหน่งที่เปิดรับ',
    whyUniwork: 'ทำไมต้องใช้ UniWork?',
    whyUniworkSub: 'แพลตฟอร์มที่ออกแบบมาเพื่อการฝึกงานของมหาวิทยาลัยยุคใหม่',

    // Login & Register
    loginTitle: 'เข้าสู่ระบบเพื่อเริ่มใช้งาน',
    registerTitle: 'สร้างบัญชีผู้ใช้ใหม่และเริ่มใช้งานทันที',
    emailLabel: 'อีเมล',
    passwordLabel: 'รหัสผ่าน',
    fullNameLabel: 'ชื่อ - นามสกุล',
    studentCodeLabel: 'รหัสนิสิต',
    majorLabel: 'สาขาวิชา / ภาควิชา',
    facultyLabel: 'คณะ',
    loginBtn: 'เข้าสู่ระบบ',
    registerBtn: 'สร้างบัญชี',
    noAccount: 'ยังไม่มีบัญชีผู้ใช้?',
    haveAccount: 'มีบัญชีผู้ใช้อยู่แล้ว?',
    signUpNow: 'สมัครสมาชิกเลย',
    signInNow: 'เข้าสู่ระบบเลย',
    role_student_desc: 'ค้นหางาน ส่งรายงาน ติดตามสถานะ',
    role_company_desc: 'โพสต์ตำแหน่งงาน คัดเลือกผู้สมัคร',
    role_professor_desc: 'ติดตามและประเมินผลนิสิต',

    // Student Dashboard
    welcomeGreeting: 'ยินดีต้อนรับ',
    applicationsSent: 'ใบสมัครที่ส่งแล้ว',
    interviewsScheduled: 'นัดสัมภาษณ์แล้ว',
    reportsSubmitted: 'รายงานที่ส่งแล้ว',
    nextDue: 'กำหนดส่งถัดไป',
    recentApplications: 'ประวัติการสมัครงานล่าสุด',
    noApplications: 'ยังไม่มีการสมัครงาน',
    findInternshipsNow: 'ค้นหาที่ฝึกงานตอนนี้ →',

    // Cut-off Reminders
    cutoffToday: 'ตัดรอบวันนี้! (ก่อน 23:59 น.)',
    cutoffTomorrow: 'เหลืออีก 1 วัน (ตัดรอบวันอาทิตย์นี้)',
    cutoffDaysLeft: 'เหลืออีก {days} วัน (ตัดรอบวันอาทิตย์)',
  },
  en: {
    // Brand & General
    brand: 'UniWork',
    role_student: 'Student',
    role_company: 'Company',
    role_professor: 'Professor',
    signOut: 'Sign Out',
    signIn: 'Sign In',
    register: 'Create Account',
    language: 'Language',
    th: 'ไทย',
    en: 'English',

    // Sidebar Navigation
    dashboard: 'Dashboard',
    findInternships: 'Find Internships',
    applicationStatus: 'Application Status',
    weeklyReports: 'Weekly Reports',
    profileResume: 'Profile & Resume',
    myJobListings: 'My Job Listings',
    applicants: 'Applicants',
    postNewJob: 'Post New Job',
    companyProfile: 'Company Profile',
    studentList: 'Student List',
    reviewReports: 'Review Reports',

    // Actions & Buttons
    search: 'Search...',
    filter: 'Filter',
    all: 'All',
    cancel: 'Cancel',
    submit: 'Submit',
    save: 'Save Changes',
    delete: 'Delete',
    download: 'Download',
    upload: 'Upload',
    details: 'Details',
    applyNow: 'Apply Now',
    viewAll: 'View All',
    close: 'Close',
    back: 'Back',
    applied: 'Applied',
    reset: 'Reset',
    uploadDoc: 'Upload Document',
    writeReport: 'Write Report',

    // Status Badges
    status_accepted: 'Accepted',
    status_interviewing: 'Interview Scheduled',
    status_reviewing: 'Under Review',
    status_rejected: 'Rejected',
    status_open: 'Open',
    status_closed: 'Closed',
    status_placed: 'Placed / Interning',
    status_searching: 'Searching / Pending',
    status_pending: 'Pending',
    status_reviewed: 'Reviewed',
    status_verified: 'Verified',

    // Landing Page
    heroTitle1: 'Connect Your Future',
    heroTitle2: 'with the Right Internship',
    heroSub: 'An internship portal connecting students, companies, and professors seamlessly for the best experience.',
    forStudents: 'For Students',
    forCompanies: 'For Companies',
    forProfessors: 'For Professors',
    feature1Title: 'Find the Right Job',
    feature1Desc: 'Students can quickly search for internships that match their major and interests, with one-click resume submission.',
    feature2Title: 'Easy Recruitment',
    feature2Desc: "Companies post listings in minutes and manage every applicant's status through a clean, dedicated dashboard.",
    feature3Title: 'Real-time Tracking',
    feature3Desc: 'Professors monitor student placement status, review weekly reports, and provide guidance — all in one place.',
    statStudents: 'Students in System',
    statCompanies: 'Partner Companies',
    statPositions: 'Open Positions',
    whyUniwork: 'Why UniWork?',
    whyUniworkSub: 'A modern platform tailored for university internship workflows.',

    // Login & Register
    loginTitle: 'Sign in to access your workspace',
    registerTitle: 'Create an account and start right away',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    fullNameLabel: 'Full Name',
    studentCodeLabel: 'Student ID',
    majorLabel: 'Major / Field of Study',
    facultyLabel: 'Faculty',
    loginBtn: 'Sign In',
    registerBtn: 'Create Account',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    signUpNow: 'Sign up now',
    signInNow: 'Sign in now',
    role_student_desc: 'Find jobs, submit reports, track status',
    role_company_desc: 'Post positions, review applicants',
    role_professor_desc: 'Monitor & evaluate student progress',

    // Student Dashboard
    welcomeGreeting: 'Welcome',
    applicationsSent: 'Applications Sent',
    interviewsScheduled: 'Interviews Scheduled',
    reportsSubmitted: 'Reports Submitted',
    nextDue: 'Next due',
    recentApplications: 'Recent Application History',
    noApplications: 'No internship applications yet',
    findInternshipsNow: 'Find Internships Now →',

    // Cut-off Reminders
    cutoffToday: 'Due today! (Before 23:59)',
    cutoffTomorrow: '1 day left (Due this Sunday)',
    cutoffDaysLeft: '{days} days left (Sunday cut-off)',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('uniwork_lang') || 'th';
    } catch {
      return 'th';
    }
  });

  const setLanguage = (newLang) => {
    if (newLang === 'th' || newLang === 'en') {
      setLanguageState(newLang);
      try {
        localStorage.setItem('uniwork_lang', newLang);
      } catch {
        // ignore
      }
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'th' ? 'en' : 'th');
  };

  const t = (key, fallback = '') => {
    return translations[language]?.[key] || translations['en']?.[key] || fallback || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
