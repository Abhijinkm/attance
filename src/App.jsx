import { useState, useEffect } from 'react';
import { 
  Users, CalendarDays, Wallet, Bell, Settings, LogOut, UserPlus, AlertTriangle, X, 
  ChevronLeft, ChevronRight, CheckCircle, XCircle, MessageCircle, 
  Search, Phone, Trash2, ArrowRight, Activity, MapPin, TrendingUp, Award
} from 'lucide-react';
import './index.css';

// Academy Branches
const branches = ["Kuttiady", "Perambra", "Orkatteri", "Paarakadav", "Kallachi", "Chambra", "Devargovil"];

// Mock Initial Data
const initialStudents = [
  { id: 1, name: "Ali Khan", age: 24, phone: "555-0101", belt: "Black", joinDate: "2024-01-15", status: "Active", admissionPaid: "2024-01", paidMonths: { "2026-05": true }, batch: "Evening", schedule: "Mon-Thu", performanceScore: 92, branch: "Kuttiady" },
  { id: 2, name: "Sarah Ahmed", age: 19, phone: "555-0102", belt: "Blue", joinDate: "2025-06-20", status: "Active", admissionPaid: "2025-06", paidMonths: {}, batch: "Morning", schedule: "Tue-Fri", performanceScore: 78, branch: "Perambra" },
  { id: 3, name: "Omar Farooq", age: 22, phone: "555-0103", belt: "White", joinDate: "2026-05-02", status: "Active", admissionPaid: false, paidMonths: {}, batch: "Night", schedule: "Wed-Sat", performanceScore: 45, branch: "Orkatteri" },
  { id: 4, name: "Zara Ali", age: 21, phone: "555-0104", belt: "Green", joinDate: "2025-11-05", status: "Active", admissionPaid: "2025-11", paidMonths: { "2026-05": true }, batch: "Evening", schedule: "Mon-Thu", performanceScore: 85, branch: "Kuttiady" }
];

function App() {
  const [appMode, setAppMode] = useState('website'); // 'website', 'login', 'superadmin-login', 'batch-login', 'admin'
  const [currentView, setCurrentView] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState('admin');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [selectedBranchLogin, setSelectedBranchLogin] = useState('Kuttiady');
  const [selectedBatchLogin, setSelectedBatchLogin] = useState('admin');
  
  // Settings Form States
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [adminForm, setAdminForm] = useState({ account: 'admin', newUsername: '', newPassword: '', confirmPassword: '' });
  const [branchForm, setBranchForm] = useState({ branch: 'kuttiady', newUsername: '', newPassword: '', confirmPassword: '' });
  const [batchForm, setBatchForm] = useState({ batch: 'batch1', newUsername: '', newPassword: '', confirmPassword: '' });
  
  const [adminCredentials, setAdminCredentials] = useState(() => {
    const saved = localStorage.getItem('umai_admin_credentials');
    return saved ? JSON.parse(saved) : {
      'admin': 'admin123',
      'masterfit': 'fit123'
    };
  });

  const isAdminUser = (user) => {
    if (!user) return false;
    const usernameClean = user.toLowerCase().trim();
    if (usernameClean.includes('@')) return false;
    return usernameClean === 'admin' || Object.keys(adminCredentials).includes(usernameClean);
  };

  const [branchCredentials, setBranchCredentials] = useState(() => {
    const saved = localStorage.getItem('umai_branch_credentials');
    const initial = {
      'kuttiady': { username: 'admin@kuttiady', password: 'kuttiady123' },
      'perambra': { username: 'admin@perambra', password: 'perambra123' },
      'orkatteri': { username: 'admin@orkatteri', password: 'orkatteri123' },
      'paarakadav': { username: 'admin@paarakadav', password: 'paarakadav123' },
      'kallachi': { username: 'admin@kallachi', password: 'kallachi123' },
      'chambra': { username: 'admin@chambra', password: 'chambra123' },
      'devargovil': { username: 'admin@devargovil', password: 'devargovil123' }
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const migrated = {};
        Object.keys(parsed).forEach(key => {
          if (typeof parsed[key] === 'string') {
            migrated[key] = { username: `admin@${key}`, password: parsed[key] };
          } else {
            migrated[key] = parsed[key];
          }
        });
        return migrated;
      } catch (e) {
        return initial;
      }
    }
    return initial;
  });

  const [batchCredentials, setBatchCredentials] = useState(() => {
    const saved = localStorage.getItem('umai_batch_credentials');
    const initial = {
      'batch1': { username: 'batch1', password: 'batch123' },
      'batch2': { username: 'batch2', password: 'batch2123' },
      'batch3': { username: 'batch3', password: 'batch3123' }
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const migrated = {};
        Object.keys(parsed).forEach(key => {
          if (typeof parsed[key] === 'string') {
            migrated[key] = { username: key, password: parsed[key] };
          } else {
            migrated[key] = parsed[key];
          }
        });
        return migrated;
      } catch (e) {
        return initial;
      }
    }
    return initial;
  });

  useEffect(() => {
    localStorage.setItem('umai_admin_credentials', JSON.stringify(adminCredentials));
  }, [adminCredentials]);

  useEffect(() => {
    localStorage.setItem('umai_branch_credentials', JSON.stringify(branchCredentials));
  }, [branchCredentials]);

  useEffect(() => {
    localStorage.setItem('umai_batch_credentials', JSON.stringify(batchCredentials));
  }, [batchCredentials]);

  const [attendanceTab, setAttendanceTab] = useState('monthly'); // 'monthly' or 'year2026'
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [editingStudentData, setEditingStudentData] = useState(null);
  
  // Persistent State
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('umai_students');
    let parsed = saved ? JSON.parse(saved) : initialStudents;

    // Auto-inject requested students if they don't exist
    const requiredStudents = [
      { name: "Fanajir", age: 20, phone: "555-1001", belt: "White", joinDate: "2026-05-10", status: "Active", admissionPaid: "2026-05", paidMonths: { "2026-05": true }, batch: "Morning", schedule: "Mon-Thu", performanceScore: 50, branch: "Kuttiady" },
      { name: "Ashiq 14", age: 14, phone: "555-1002", belt: "White", joinDate: "2026-05-10", status: "Active", admissionPaid: "2026-05", paidMonths: { "2026-05": true }, batch: "Evening", schedule: "Tue-Fri", performanceScore: 50, branch: "Perambra" },
      { name: "Riswan pk", age: 22, phone: "555-1003", belt: "White", joinDate: "2026-05-10", status: "Active", admissionPaid: "2026-05", paidMonths: { "2026-05": true }, batch: "Night", schedule: "Wed-Sat", performanceScore: 50, branch: "Orkatteri" },
      { name: "Shafnas", age: 25, phone: "555-1004", belt: "White", joinDate: "2026-05-10", status: "Active", admissionPaid: "2026-05", paidMonths: { "2026-05": true }, batch: "Morning", schedule: "Mon-Thu", performanceScore: 50, branch: "Kuttiady" }
    ];

    const existingNames = parsed.map(s => s.name.toLowerCase());
    requiredStudents.forEach(req => {
      if (!existingNames.includes(req.name.toLowerCase())) {
        req.id = parsed.length > 0 ? Math.max(...parsed.map(s => s.id)) + 1 : 1;
        parsed.push(req);
      }
    });
    
    // Migrate any stray data to new batches and paidMonths
    return parsed.map(s => {
      let updatedStudent = { ...s };
      if (['Mon', 'Mon-Tue'].includes(s.schedule)) updatedStudent.schedule = 'Mon-Thu';
      if (['Thu', 'Thu-Fri'].includes(s.schedule)) updatedStudent.schedule = 'Tue-Fri';
      if (['Wed', 'Wed-Sat', 'Tue', 'Sat', 'Fri'].includes(s.schedule)) updatedStudent.schedule = 'Wed-Sat';
      if (!s.performanceScore) updatedStudent.performanceScore = Math.floor(Math.random() * 40) + 50;
      
      // Migrate to paidMonths object
      if (updatedStudent.paidMonths === undefined) {
        const currentMonthKey = new Date().toISOString().slice(0, 7);
        updatedStudent.paidMonths = updatedStudent.currentMonthPaid ? { [currentMonthKey]: true } : {};
        delete updatedStudent.currentMonthPaid;
      }
      
      // Migrate admissionPaid to month string if it's currently a boolean true
      if (updatedStudent.admissionPaid === true) {
        updatedStudent.admissionPaid = updatedStudent.joinDate ? updatedStudent.joinDate.slice(0, 7) : new Date().toISOString().slice(0, 7);
      }
      
      // Migrate missing branch
      if (!updatedStudent.branch) {
        updatedStudent.branch = "Kuttiady";
      }
      return updatedStudent;
    });
  });
  
  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    const saved = localStorage.getItem('umai_attendance');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('umai_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('umai_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hash-based routing to support separate page navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/superadmin') {
        setAppMode('superadmin-login');
      } else if (hash === '#/login' || hash === '#/branch' || hash === '#/batch') {
        setAppMode('login');
      } else if (hash === '#/admin') {
        setAppMode(prevMode => (prevMode === 'admin' ? 'admin' : 'login'));
      } else if (hash === '' || hash === '#/' || hash === '#/home') {
        setAppMode('website');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Run on initial load
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync state changes back to URL hash
  useEffect(() => {
    const currentHash = window.location.hash;
    if (appMode === 'website') {
      if (currentHash !== '' && currentHash !== '#/' && currentHash !== '#/home') {
        window.location.hash = '#/';
      }
    } else if (appMode === 'login' && currentHash !== '#/login') {
      window.location.hash = '#/login';
    } else if (appMode === 'superadmin-login' && currentHash !== '#/superadmin') {
      window.location.hash = '#/superadmin';
    } else if (appMode === 'admin' && currentHash !== '#/admin') {
      window.location.hash = '#/admin';
    }
  }, [appMode]);
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // May 2026
  const [feeMonth, setFeeMonth] = useState(new Date().toISOString().slice(0, 7)); // "YYYY-MM"
  
  // Attendance Marking State
  const [markingDate, setMarkingDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceBatchFilter, setAttendanceBatchFilter] = useState('All');
  const [attendanceScheduleFilter, setAttendanceScheduleFilter] = useState('All');
  
  // Roster Filter State
  const [branchFilter, setBranchFilter] = useState('All');
  
  // Form State
  const [newStudent, setNewStudent] = useState({
    name: '', age: '', phone: '', belt: 'White', joinDate: new Date().toISOString().split('T')[0], batch: 'Morning', schedule: 'Mon-Thu', branch: 'Kuttiady', photo: null
  });

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewStudent({...newStudent, photo: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  
  const searchedStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.phone.includes(searchQuery);
    
    let activeBranch = 'All';
    if (isAdminUser(loggedInUser)) {
      activeBranch = branchFilter;
    } else if (['batch1', 'batch2', 'batch3'].includes(loggedInUser)) {
      activeBranch = 'Kuttiady';
    } else if (loggedInUser && loggedInUser.includes('@')) {
      const branchPart = loggedInUser.split('@')[1];
      activeBranch = branches.find(b => b.toLowerCase() === branchPart) || 'All';
    }
    
    const matchesBranch = activeBranch === 'All' || s.branch === activeBranch;
    
    if (loggedInUser && loggedInUser.startsWith('batch1')) {
      return matchesSearch && matchesBranch && s.schedule === 'Mon-Thu';
    }
    if (loggedInUser && loggedInUser.startsWith('batch2')) {
      return matchesSearch && matchesBranch && s.schedule === 'Tue-Fri';
    }
    if (loggedInUser && loggedInUser.startsWith('batch3')) {
      return matchesSearch && matchesBranch && s.schedule === 'Wed-Sat';
    }
    
    return matchesSearch && matchesBranch;
  });

  const getBeltColorClass = (belt) => {
    switch(belt.toLowerCase()) {
      case 'white': return 'badge-white';
      case 'yellow': return 'badge-yellow';
      case 'orange': return 'badge-orange';
      case 'green': return 'badge-green';
      case 'blue': return 'badge-blue';
      case 'purple': return 'badge-purple';
      case 'brown': return 'badge-brown';
      case 'red': return 'badge-red';
      case 'black': return 'badge-black';
      default: return 'badge-white';
    }
  };

  const handleDeleteStudent = (id) => {
    setStudentToDelete(id);
  };

  const confirmDelete = () => {
    if (studentToDelete !== null) {
      setStudents(students.filter(s => s.id !== studentToDelete));
      setSelectedStudent(null);
      setStudentToDelete(null);
    }
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    let defaultBranch = 'Kuttiady';
    if (isAdminUser(loggedInUser)) {
      defaultBranch = 'Kuttiady';
    } else if (['batch1', 'batch2', 'batch3'].includes(loggedInUser)) {
      defaultBranch = 'Kuttiady';
    } else if (loggedInUser && loggedInUser.includes('@')) {
      const branchPart = loggedInUser.split('@')[1];
      defaultBranch = branches.find(b => b.toLowerCase() === branchPart) || 'Kuttiady';
    }

    const student = {
      id: students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1,
      ...newStudent,
      branch: (loggedInUser && loggedInUser.startsWith('batch')) 
        ? defaultBranch 
        : ((isAdminUser(loggedInUser) || appMode === 'login' || appMode === 'superadmin-login') ? newStudent.branch : defaultBranch),
      status: "Active",
      admissionPaid: false,
      paidMonths: {},
      performanceScore: 50
    };
    setStudents([...students, student]);
    setIsAddModalOpen(false);
    
    if (appMode === 'login' || appMode === 'superadmin-login') {
      alert(`Enrollment request for ${newStudent.name} submitted successfully!`);
    }
    
    setNewStudent({ name: '', age: '', phone: '', belt: 'White', joinDate: new Date().toISOString().split('T')[0], batch: 'Morning', schedule: 'Mon-Thu', branch: defaultBranch, photo: null });
  };

  const markFeePaid = (id, feeType) => {
    setStudents(students.map(s => {
      if (s.id === id) {
        if (feeType === 'currentMonthPaid') {
          return { ...s, paidMonths: { ...(s.paidMonths || {}), [feeMonth]: true } };
        }
        if (feeType === 'admissionPaid') {
          return { ...s, admissionPaid: feeMonth };
        }
        return { ...s, [feeType]: true };
      }
      return s;
    }));
  };

  const unmarkFeePaid = (id, feeType) => {
    setStudents(students.map(s => {
      if (s.id === id) {
        if (feeType === 'currentMonthPaid') {
          const newPaidMonths = { ...s.paidMonths };
          delete newPaidMonths[feeMonth];
          return { ...s, paidMonths: newPaidMonths };
        }
        if (feeType === 'admissionPaid') {
          return { ...s, admissionPaid: false };
        }
        return { ...s, [feeType]: false };
      }
      return s;
    }));
  };

  const markAttendance = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [markingDate]: {
        ...(prev[markingDate] || {}),
        [studentId]: status
      }
    }));
  };

  // --- Public Website View ---
  const renderPublic = () => (
    <div className="public-layout">
      <nav className={`public-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => window.scrollTo(0,0)}>
          <span className="brand-accent">MASTER</span> FIT
        </div>
        <div className="nav-links">
          <a href="#schedule" className="nav-link">Schedule</a>
          <a href="#instructors" className="nav-link">Instructors</a>
          <a href="#gallery" className="nav-link">Gallery</a>
          <a href="#contact" className="nav-link">Contact</a>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-outline-primary" onClick={() => setAppMode('login')}>
              Login
            </button>
          </div>
        </div>
      </nav>

      <section className="hero-section">
        <img src="https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80" alt="Martial Arts" className="hero-bg" />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-subtitle">Master Your Mind & Body</span>
          <h1 className="hero-title">MASTER FIT <span>Academy</span></h1>
          <p className="hero-desc">
            Train with elite instructors in a premium facility. Choose from flexible batch timings and embark on your journey from white to black belt.
          </p>
          <button className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}>
            Start Your Journey <ArrowRight size={20} />
          </button>
        </div>
      </section>

      <section id="schedule" className="section" style={{ background: '#050505' }}>
        <div className="section-header">
          <span className="section-subtitle">Training Hours</span>
          <h2 className="section-title">Class Batches</h2>
        </div>
        <div className="schedule-grid">
          <div className="schedule-card glass-panel">
            <div className="batch-name">Batch 1</div>
            <div className="batch-days">Mon - Thu</div>
            <ul className="batch-details">
              <li><span>Morning</span> <span>06:00 AM - 08:00 AM</span></li>
              <li><span>Evening</span> <span>05:00 PM - 07:00 PM</span></li>
              <li><span>Night</span> <span>08:00 PM - 10:00 PM</span></li>
            </ul>
          </div>
          <div className="schedule-card glass-panel">
            <div className="batch-name">Batch 2</div>
            <div className="batch-days">Tue - Fri</div>
            <ul className="batch-details">
              <li><span>Morning</span> <span>06:30 AM - 08:30 AM</span></li>
              <li><span>Evening</span> <span>05:30 PM - 07:30 PM</span></li>
              <li><span>Night</span> <span>08:30 PM - 10:30 PM</span></li>
            </ul>
          </div>
          <div className="schedule-card glass-panel">
            <div className="batch-name">Batch 3</div>
            <div className="batch-days">Wed - Sat</div>
            <ul className="batch-details">
              <li><span>Morning</span> <span>07:00 AM - 09:00 AM</span></li>
              <li><span>Evening</span> <span>04:00 PM - 06:00 PM</span></li>
              <li><span>Night</span> <span>07:00 PM - 09:00 PM</span></li>
            </ul>
          </div>
        </div>
      </section>

      <section id="instructors" className="section">
        <div className="section-header">
          <span className="section-subtitle">Learn from the best</span>
          <h2 className="section-title">Our Instructors</h2>
        </div>
        <div className="instructor-grid">
          <div className="instructor-card glass-panel">
            <img src="https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&q=80" alt="Sensei" className="instructor-img" />
            <div className="instructor-info">
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Master Wei</h3>
              <p style={{ color: 'var(--color-primary)', margin: 0, fontWeight: 600 }}>8th Dan Black Belt</p>
            </div>
          </div>
          <div className="instructor-card glass-panel">
            <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80" alt="Instructor" className="instructor-img" />
            <div className="instructor-info">
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Sarah Chen</h3>
              <p style={{ color: 'var(--color-primary)', margin: 0, fontWeight: 600 }}>5th Dan Black Belt</p>
            </div>
          </div>
          <div className="instructor-card glass-panel">
            <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80" alt="Coach" className="instructor-img" />
            <div className="instructor-info">
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Marcus Silva</h3>
              <p style={{ color: 'var(--color-primary)', margin: 0, fontWeight: 600 }}>Head Coach</p>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="section" style={{ background: '#050505' }}>
        <div className="section-header">
          <span className="section-subtitle">Action Shots</span>
          <h2 className="section-title">Training Gallery</h2>
        </div>
        <div className="gallery-grid">
          <div className="gallery-item"><img src="https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80" alt="Gallery 1" /></div>
          <div className="gallery-item"><img src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80" alt="Gallery 2" /></div>
          <div className="gallery-item"><img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80" alt="Gallery 3" /></div>
          <div className="gallery-item"><img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80" alt="Gallery 4" /></div>
        </div>
      </section>

      <section id="contact" className="section">
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }} className="glass-panel panel">
          <h2 className="section-title" style={{ fontSize: '2rem' }}>Ready to Start?</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Fill out the form below to schedule your free trial class.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" className="form-control" placeholder="Your Name" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" className="form-control" placeholder="Your Phone Number" />
            </div>
          </div>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Send Registration Request</button>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}><Phone size={18} color="var(--color-primary)" /> 555-0199</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}><MapPin size={18} color="var(--color-primary)" /> 123 Dojo Street</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}><span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>IG</span> @masterfit_academy</div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderYearCalendar = () => {
    const year = 2026;
    const monthNames = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    
    return (
      <div className="year-calendar-container panel">
        <div className="panel-header" style={{ marginBottom: '2rem' }}>
          <h3 className="panel-title">2026 Full Year Calendar</h3>
          <span style={{ color: 'var(--color-secondary)', fontWeight: 'bold' }}>Year: 2026</span>
        </div>
        <div className="year-calendar-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {monthNames.map((monthName, m) => {
            const firstDay = new Date(year, m, 1).getDay();
            const daysInMonth = new Date(year, m + 1, 0).getDate();
            
            const monthDays = [];
            // Empty slots for padding
            for (let i = 0; i < firstDay; i++) {
              monthDays.push(<div key={`empty-${m}-${i}`} className="mini-day empty" style={{ width: '32px', height: '32px' }}></div>);
            }
            
            // Days of the month
            for (let d = 1; d <= daysInMonth; d++) {
              const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const dayRecord = attendanceRecords[dateStr];
              
              let presentCount = 0;
              let totalMarked = 0;
              
              if (dayRecord) {
                Object.values(dayRecord).forEach(status => {
                  totalMarked++;
                  if (status === 'present') presentCount++;
                });
              }
              
              let cellStyle = {
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.02)',
                transition: 'all 0.2s ease',
                border: '1px solid transparent'
              };
              
              if (totalMarked > 0) {
                const ratio = presentCount / (students.length || 1);
                if (ratio >= 0.7) {
                  cellStyle.backgroundColor = 'rgba(76, 175, 80, 0.2)';
                  cellStyle.borderColor = '#4CAF50';
                  cellStyle.color = '#4CAF50';
                } else {
                  cellStyle.backgroundColor = 'rgba(255, 152, 0, 0.2)';
                  cellStyle.borderColor = '#FF9800';
                  cellStyle.color = '#FF9800';
                }
              }
              
              if (dateStr === markingDate) {
                cellStyle.borderColor = 'var(--color-primary)';
                cellStyle.boxShadow = '0 0 8px rgba(229, 9, 20, 0.4)';
              }
              
              monthDays.push(
                <div 
                  key={`day-${m}-${d}`} 
                  className="mini-day"
                  style={cellStyle}
                  onClick={() => {
                    setMarkingDate(dateStr);
                    setCurrentDate(new Date(year, m, 1));
                    setAttendanceTab('monthly');
                  }}
                  title={totalMarked > 0 ? `Attendance: ${presentCount} present` : `No attendance marked`}
                >
                  {d}
                </div>
              );
            }
            
            return (
              <div key={monthName} className="mini-month-panel" style={{
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                padding: '1.2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontFamily: 'var(--font-heading)', color: 'var(--color-text-light)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', textAlign: 'left' }}>{monthName}</h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '4px',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.75rem',
                  marginBottom: '4px'
                }}>
                  <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '4px'
                }}>
                  {monthDays}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // --- Admin Dashboard View ---
  const renderAttendance = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayRecord = attendanceRecords[dateStr];
      
      let presentCount = 0;
      let totalMarked = 0;
      
      if (dayRecord) {
        Object.values(dayRecord).forEach(status => {
          totalMarked++;
          if (status === 'present') presentCount++;
        });
      }

      const isMockPresent = i % 3 !== 0;
      const displayPresent = totalMarked > 0 ? presentCount : (isMockPresent ? Math.floor(searchedStudents.length * 0.9) : Math.floor(searchedStudents.length * 0.6));

      days.push(
        <div key={i} className={`calendar-day ${dateStr === markingDate ? 'today' : ''}`} onClick={() => setMarkingDate(dateStr)} style={{ cursor: 'pointer' }}>
          <div className="day-number">{i}</div>
          <div className="day-content">
             <div className="attendance-indicator">
               {displayPresent >= (searchedStudents.length * 0.7) ? (
                 <span className="text-success"><CheckCircle size={14}/> {displayPresent}</span>
               ) : (
                 <span className="text-warning"><XCircle size={14}/> {displayPresent}</span>
               )}
             </div>
          </div>
        </div>
      );
    }

    return (
      <div className="attendance-view">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            className={`btn-primary ${attendanceTab === 'monthly' ? '' : 'btn-secondary'}`}
            style={attendanceTab === 'monthly' ? {} : { background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', border: '1px solid var(--glass-border)', boxShadow: 'none' }}
            onClick={() => setAttendanceTab('monthly')}
          >
            Monthly Dashboard
          </button>
          <button 
            className={`btn-primary ${attendanceTab === 'year2026' ? '' : 'btn-secondary'}`}
            style={attendanceTab === 'year2026' ? {} : { background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', border: '1px solid var(--glass-border)', boxShadow: 'none' }}
            onClick={() => setAttendanceTab('year2026')}
          >
            2026 Full Calendar
          </button>
        </div>

        {attendanceTab === 'monthly' ? (
          <>
            <div className="panel" style={{ marginBottom: '2rem' }}>
              <div className="panel-header">
                <h3 className="panel-title">Daily Attendance</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Date:</span>
                  <input 
                    type="date" 
                    className="form-control" 
                    style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
                    value={markingDate}
                    onChange={(e) => setMarkingDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <span style={{color: 'var(--color-text-muted)', width: '80px', fontSize: '0.85rem'}}>Time:</span>
                <button className={`btn-small ${attendanceBatchFilter === 'All' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttendanceBatchFilter('All')}>All</button>
                <button className={`btn-small ${attendanceBatchFilter === 'Morning' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttendanceBatchFilter('Morning')}>Morning</button>
                <button className={`btn-small ${attendanceBatchFilter === 'Evening' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttendanceBatchFilter('Evening')}>Evening</button>
                <button className={`btn-small ${attendanceBatchFilter === 'Night' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttendanceBatchFilter('Night')}>Night</button>
              </div>
              
              {(!loggedInUser || !loggedInUser.startsWith('batch')) && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                  <span style={{color: 'var(--color-text-muted)', width: '80px', fontSize: '0.85rem'}}>Batch:</span>
                  <button className={`btn-small ${attendanceScheduleFilter === 'All' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttendanceScheduleFilter('All')}>All Batches</button>
                  <button className={`btn-small ${attendanceScheduleFilter === 'Mon-Thu' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttendanceScheduleFilter('Mon-Thu')}>Batch 1 (Mon-Thu)</button>
                  <button className={`btn-small ${attendanceScheduleFilter === 'Tue-Fri' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttendanceScheduleFilter('Tue-Fri')}>Batch 2 (Tue-Fri)</button>
                  <button className={`btn-small ${attendanceScheduleFilter === 'Wed-Sat' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttendanceScheduleFilter('Wed-Sat')}>Batch 3 (Wed-Sat)</button>
                </div>
              )}
              
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Batch Info</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {searchedStudents.filter(s => {
                    const matchBatch = attendanceBatchFilter === 'All' || s.batch === attendanceBatchFilter;
                    const matchSchedule = attendanceScheduleFilter === 'All' || s.schedule === attendanceScheduleFilter;
                    return matchBatch && matchSchedule;
                  }).map(student => {
                    const status = attendanceRecords[markingDate]?.[student.id];
                    return (
                      <tr key={student.id}>
                        <td 
                          style={{ fontWeight: 500, color: '#E50914', cursor: 'pointer', textDecoration: 'underline' }}
                          onClick={() => setSelectedStudent(student)}
                        >
                          {student.name}
                        </td>
                        <td><span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>{student.schedule} • {student.batch}</span></td>
                        <td>
                          {status === 'present' && <span className="badge badge-green">Present</span>}
                          {status === 'absent' && <span className="badge badge-red">Absent</span>}
                          {!status && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Pending</span>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className={`btn-small ${status === 'present' ? 'btn-primary' : ''}`}
                              style={status === 'present' ? { backgroundColor: '#4CAF50', borderColor: '#4CAF50' } : {}}
                              onClick={() => markAttendance(student.id, 'present')}
                            >
                              <CheckCircle size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }}/> Present
                            </button>
                            <button 
                              className={`btn-small ${status === 'absent' ? 'btn-primary' : ''}`}
                              style={status === 'absent' ? { backgroundColor: '#F44336', borderColor: '#F44336' } : {}}
                              onClick={() => markAttendance(student.id, 'absent')}
                            >
                              <XCircle size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }}/> Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="calendar-container panel">
              <div className="calendar-header">
                <button className="btn-icon" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
                  <ChevronLeft size={24} />
                </button>
                <h2 className="calendar-title" style={{ fontFamily: 'var(--font-heading)' }}>{monthNames[month]} {year}</h2>
                <button className="btn-icon" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
                  <ChevronRight size={24} />
                </button>
              </div>
              <div className="calendar-grid-header">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
              </div>
              <div className="calendar-grid">
                {days}
              </div>
            </div>
          </>
        ) : (
          renderYearCalendar()
        )}
      </div>
    );
  };

  const renderFees = () => {
    const isPaid = (student) => student.paidMonths && student.paidMonths[feeMonth];

    const renderBatchTable = (scheduleName) => {
      const batchStudents = searchedStudents.filter(s => s.schedule === scheduleName);
      if (batchStudents.length === 0) return null;
      
      const batchUnpaid = batchStudents.filter(s => !isPaid(s)).length;
      const batchPaid = batchStudents.filter(s => isPaid(s)).length;

      const batchMonthlyCollected = batchStudents.filter(s => isPaid(s)).length * 1000;
      const batchAdmissionCollected = batchStudents.filter(s => s.admissionPaid === feeMonth).length * 2000;
      const batchTotalCollected = batchMonthlyCollected + batchAdmissionCollected;
      
      return (
        <div className="panel" style={{ overflowX: 'auto', marginTop: '2rem' }}>
          <div className="panel-header">
            <h3 className="panel-title">{scheduleName} Batch ({feeMonth})</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span className="badge badge-green">{batchPaid} Paid Monthly</span>
              <span className="badge badge-orange">{batchUnpaid} Pending Monthly</span>
            </div>
          </div>

          <div className="stats-grid" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className="stat-card" style={{ borderLeft: '4px solid #E50914', padding: '1.5rem' }}>
              <div className="stat-details">
                <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Monthly Fees</h3>
                <p className="stat-value" style={{ fontSize: '1.5rem', color: '#E50914' }}>₹{batchMonthlyCollected}</p>
              </div>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid #FFD700', padding: '1.5rem' }}>
              <div className="stat-details">
                <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Admission Fees</h3>
                <p className="stat-value" style={{ fontSize: '1.5rem', color: '#FFD700' }}>₹{batchAdmissionCollected}</p>
              </div>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid #4CAF50', padding: '1.5rem' }}>
              <div className="stat-details">
                <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Total Collected</h3>
                <p className="stat-value" style={{ fontSize: '1.5rem', color: '#4CAF50' }}>₹{batchTotalCollected}</p>
              </div>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Batch Time</th>
                <th>Admission (₹2000)</th>
                <th>Monthly (₹1000)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batchStudents.map(student => (
                <tr key={student.id}>
                  <td>
                    <div 
                      style={{ fontWeight: 500, color: '#E50914', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => setSelectedStudent(student)}
                    >
                      {student.name}
                    </div>
                  </td>
                  <td><span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>{student.batch}</span></td>
                  <td>
                    {student.admissionPaid ? <span className="badge badge-green">Paid</span> : <span className="badge badge-red">Pending</span>}
                  </td>
                  <td>
                    {isPaid(student) ? <span className="badge badge-green">Paid</span> : <span className="badge badge-red">Pending</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!student.admissionPaid ? (
                        <button onClick={() => markFeePaid(student.id, 'admissionPaid')} className="btn-small">Pay Admission</button>
                      ) : (
                        <button onClick={() => unmarkFeePaid(student.id, 'admissionPaid')} className="btn-small btn-secondary">Undo Admission</button>
                      )}
                      {!isPaid(student) ? (
                        <button onClick={() => markFeePaid(student.id, 'currentMonthPaid')} className="btn-small btn-primary">Pay Monthly</button>
                      ) : (
                        <button onClick={() => unmarkFeePaid(student.id, 'currentMonthPaid')} className="btn-small btn-secondary">Undo Monthly</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

    return (
      <div className="fees-container">
        {/* Month Selector Header */}
        <div className="panel" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="panel-title" style={{ margin: 0 }}>Fee Management</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Select Month:</span>
            <input 
              type="month" 
              className="form-control" 
              style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
              value={feeMonth}
              onChange={(e) => setFeeMonth(e.target.value)}
            />
          </div>
        </div>

        {(!loggedInUser || (!loggedInUser.startsWith('batch2') && !loggedInUser.startsWith('batch3'))) && renderBatchTable('Mon-Thu')}
        {(!loggedInUser || (!loggedInUser.startsWith('batch1') && !loggedInUser.startsWith('batch3'))) && renderBatchTable('Tue-Fri')}
        {(!loggedInUser || (!loggedInUser.startsWith('batch1') && !loggedInUser.startsWith('batch2'))) && renderBatchTable('Wed-Sat')}
      </div>
    );
  };

  const renderPerformance = () => (
    <div className="performance-view">
      <div className="panel" style={{ marginBottom: '2rem' }}>
        <div className="panel-header">
          <h3 className="panel-title">Academy Performance</h3>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper"><Award className="stat-icon" /></div>
            <div className="stat-details">
              <h3>Next Grading Event</h3>
              <p className="stat-value text-blue" style={{ color: '#FFD700' }}>June 15</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper"><Activity className="stat-icon" /></div>
            <div className="stat-details">
              <h3>Avg Academy Attendance</h3>
              <p className="stat-value" style={{ color: '#4CAF50' }}>88%</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Student Tracking</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Belt Level</th>
              <th>Batch</th>
              <th>Skill Score</th>
              <th>Progress to Next Belt</th>
            </tr>
          </thead>
          <tbody>
            {searchedStudents.map(student => (
              <tr key={student.id}>
                <td style={{ fontWeight: 500, color: 'var(--color-text-light)' }}>{student.name}</td>
                <td><span className={`badge ${getBeltColorClass(student.belt)}`}>{student.belt}</span></td>
                <td><span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>{student.schedule}</span></td>
                <td><span style={{ fontWeight: 'bold', color: student.performanceScore > 80 ? '#4CAF50' : '#FF9800' }}>{student.performanceScore}/100</span></td>
                <td style={{ width: '30%' }}>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${student.performanceScore}%` }}></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReminders = () => {
    const currentSystemMonth = new Date().toISOString().slice(0, 7);
    const unpaidStudents = searchedStudents.filter(s => !s.paidMonths || !s.paidMonths[currentSystemMonth]);
    return (
      <div className="reminders-container">
        <div className="panel" style={{ marginBottom: '2rem', background: 'rgba(229, 9, 20, 0.1)', border: '1px solid rgba(229, 9, 20, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <AlertTriangle size={32} color="var(--color-primary)" />
            <div>
              <h2 style={{ margin: 0, color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>Monthly Fee Due!</h2>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--color-text-muted)' }}>Auto alerts triggered: 30 days since last payment. Notify students below.</p>
            </div>
          </div>
          <button className="btn-primary" onClick={() => alert('Automated reminders triggered!')}>
            <Bell size={18} /> Send All Reminders Now
          </button>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">Pending Action ({unpaidStudents.length})</h3>
          </div>
          {unpaidStudents.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Phone</th>
                  <th>Due Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {unpaidStudents.map(student => (
                  <tr key={student.id}>
                    <td onClick={() => setSelectedStudent(student)} style={{ cursor: 'pointer', color: '#E50914' }}>{student.name}</td>
                    <td>{student.phone}</td>
                    <td><span className="badge badge-red">₹{!student.admissionPaid ? 3000 : 1000}</span></td>
                    <td>
                      <a href={`https://wa.me/${student.phone}`} target="_blank" rel="noreferrer" className="btn-small" style={{ background: '#25D366', color: 'white', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                        <MessageCircle size={14} /> WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>
              <CheckCircle size={48} style={{ color: '#4CAF50', marginBottom: '1rem' }} />
              <p>All clear! No pending payments.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    const isAdmin = isAdminUser(loggedInUser);

    if (!isAdmin) {
      return (
        <div className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 className="panel-title" style={{ color: '#E50914' }}>Access Denied</h3>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>Only the Super Admin can view or modify account settings.</p>
        </div>
      );
    }

    const handleUpdateAdmin = (e) => {
      e.preventDefault();
      setSettingsError('');
      setSettingsSuccess('');
      
      const acc = adminForm.account;
      const user = adminForm.newUsername.toLowerCase().trim() || acc;
      const pass = adminForm.newPassword;
      
      if (pass !== adminForm.confirmPassword) {
        setSettingsError('Passwords do not match');
        return;
      }
      
      setAdminCredentials(prev => {
        const updated = { ...prev };
        // If username changed, delete the old key and insert new one
        if (user !== acc) {
          delete updated[acc];
        }
        updated[user] = pass;
        return updated;
      });
      
      setSettingsSuccess(`Admin account "${user}" credentials updated successfully!`);
      setAdminForm({ account: 'admin', newUsername: '', newPassword: '', confirmPassword: '' });
    };

    const handleUpdateBranchPassword = (e) => {
      e.preventDefault();
      setSettingsError('');
      setSettingsSuccess('');
      
      const br = branchForm.branch;
      const pass = branchForm.newPassword;
      const user = branchForm.newUsername.trim() || branchCredentials[br]?.username || `admin@${br}`;
      
      if (pass !== branchForm.confirmPassword) {
        setSettingsError('Passwords do not match');
        return;
      }
      
      setBranchCredentials(prev => ({
        ...prev,
        [br]: { username: user, password: pass }
      }));
      
      setSettingsSuccess(`Branch Coordinator credentials for "${br.toUpperCase()}" updated successfully!`);
      setBranchForm({ branch: br, newUsername: '', newPassword: '', confirmPassword: '' });
    };

    const handleUpdateBatchPassword = (e) => {
      e.preventDefault();
      setSettingsError('');
      setSettingsSuccess('');
      
      const bt = batchForm.batch;
      const pass = batchForm.newPassword;
      const user = batchForm.newUsername.trim() || batchCredentials[bt]?.username || bt;
      
      if (pass !== batchForm.confirmPassword) {
        setSettingsError('Passwords do not match');
        return;
      }
      
      setBatchCredentials(prev => ({
        ...prev,
        [bt]: { username: user, password: pass }
      }));
      
      setSettingsSuccess(`Batch Coordinator credentials for "${bt.toUpperCase()}" updated successfully!`);
      setBatchForm({ batch: bt, newUsername: '', newPassword: '', confirmPassword: '' });
    };

    return (
      <div className="settings-view" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {settingsError && <div style={{ color: '#E50914', marginBottom: '1.5rem', background: 'rgba(229, 9, 20, 0.1)', padding: '1rem', borderRadius: '4px', border: '1px solid rgba(229, 9, 20, 0.3)', fontWeight: 500 }}>{settingsError}</div>}
        {settingsSuccess && <div style={{ color: '#4CAF50', marginBottom: '1.5rem', background: 'rgba(76, 175, 80, 0.1)', padding: '1rem', borderRadius: '4px', border: '1px solid rgba(76, 175, 80, 0.3)', fontWeight: 500 }}>{settingsSuccess}</div>}
        
        {/* Admin Accounts Settings */}
        <div className="panel" style={{ marginBottom: '2rem' }}>
          <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
            <h3 className="panel-title">Update Admin Accounts</h3>
          </div>
          <form onSubmit={handleUpdateAdmin}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label>Select Admin Account</label>
                <select className="form-control" value={adminForm.account} onChange={(e) => setAdminForm({ ...adminForm, account: e.target.value, newUsername: e.target.value })}>
                  {Object.keys(adminCredentials).map(acc => (
                    <option key={acc} value={acc}>{acc}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>New Username (Optional)</label>
                <input type="text" className="form-control" placeholder="Enter new username" value={adminForm.newUsername} onChange={(e) => setAdminForm({ ...adminForm, newUsername: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" className="form-control" placeholder="Enter new password" required value={adminForm.newPassword} onChange={(e) => setAdminForm({ ...adminForm, newPassword: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" className="form-control" placeholder="Confirm new password" required value={adminForm.confirmPassword} onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn-primary">Update Admin Account</button>
          </form>
        </div>

        {/* Coordinator Passwords Management */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Branch Passwords */}
          <div className="panel">
            <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
              <h3 className="panel-title">Manage Branch Credentials</h3>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Current Username: <strong style={{ color: 'var(--color-text-light)' }}>{branchCredentials[branchForm.branch]?.username || `admin@${branchForm.branch}`}</strong>
            </div>
            <form onSubmit={handleUpdateBranchPassword}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Select Branch</label>
                <select className="form-control" value={branchForm.branch} onChange={(e) => setBranchForm({ branch: e.target.value, newUsername: '', newPassword: '', confirmPassword: '' })}>
                  {branches.map(br => (
                    <option key={br} value={br.toLowerCase()}>{br}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>New Username (Optional)</label>
                <input type="text" className="form-control" placeholder="Enter new username" value={branchForm.newUsername} onChange={(e) => setBranchForm({ ...branchForm, newUsername: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>New Password</label>
                <input type="password" className="form-control" placeholder="Enter new password" required value={branchForm.newPassword} onChange={(e) => setBranchForm({ ...branchForm, newPassword: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Confirm Password</label>
                <input type="password" className="form-control" placeholder="Confirm new password" required value={branchForm.confirmPassword} onChange={(e) => setBranchForm({ ...branchForm, confirmPassword: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Save Branch Credentials</button>
            </form>
          </div>

          {/* Batch Passwords */}
          <div className="panel">
            <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
              <h3 className="panel-title">Manage Batch Credentials</h3>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Current Username: <strong style={{ color: 'var(--color-text-light)' }}>{batchCredentials[batchForm.batch]?.username || batchForm.batch}</strong>
            </div>
            <form onSubmit={handleUpdateBatchPassword}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Select Batch</label>
                <select className="form-control" value={batchForm.batch} onChange={(e) => setBatchForm({ batch: e.target.value, newUsername: '', newPassword: '', confirmPassword: '' })}>
                  <option value="batch1">Batch 1 (Mon - Thu)</option>
                  <option value="batch2">Batch 2 (Tue - Fri)</option>
                  <option value="batch3">Batch 3 (Wed - Sat)</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>New Username (Optional)</label>
                <input type="text" className="form-control" placeholder="Enter new username" value={batchForm.newUsername} onChange={(e) => setBatchForm({ ...batchForm, newUsername: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>New Password</label>
                <input type="password" className="form-control" placeholder="Enter new password" required value={batchForm.newPassword} onChange={(e) => setBatchForm({ ...batchForm, newPassword: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Confirm Password</label>
                <input type="password" className="form-control" placeholder="Confirm new password" required value={batchForm.confirmPassword} onChange={(e) => setBatchForm({ ...batchForm, confirmPassword: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Save Batch Credentials</button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // --- Admin Login View ---
  const renderLogin = () => {
    return (
      <div className="login-layout" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: "url('https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=2069&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5,5,5,0.85)' }}></div>
        <div className="glass-panel" style={{ zIndex: 1, padding: '3rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h2 className="brand" style={{ justifyContent: 'center', marginBottom: '0.5rem' }}>
            <span className="brand-accent">MASTER</span> FIT Login
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '2rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Branch & Batch Portal</p>
          {isForgotPassword ? (
            <>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>If you forgot your password, please contact the administrator via WhatsApp.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <a href="https://wa.me/5550199?text=Hi,%20I%20need%20to%20reset%20my%20password%20for%20the%20MASTER%20FIT%20dashboard." target="_blank" rel="noreferrer" className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: '#25D366', color: 'white', textDecoration: 'none' }}>
                  <MessageCircle size={18} style={{ marginRight: '8px' }} /> Contact via WhatsApp
                </a>
                <button type="button" className="btn-outline-primary" style={{ width: '100%', justifyContent: 'center', border: 'none', background: 'transparent' }} onClick={() => setIsForgotPassword(false)}>Back to Login</button>
              </div>
            </>
          ) : (
            <>
              {loginError && <div style={{ color: '#E50914', marginBottom: '1rem', background: 'rgba(229, 9, 20, 0.1)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(229, 9, 20, 0.3)' }}>{loginError}</div>}
              <form onSubmit={(e) => {
                e.preventDefault();
                const branchKey = selectedBranchLogin.toLowerCase();
                const batchKey = selectedBatchLogin;
                const enteredUser = loginData.username.toLowerCase().trim();
                const enteredPassword = loginData.password;

                let isValid = false;
                let fullUsername = '';

                if (batchKey === 'admin') {
                  const storedCreds = branchCredentials[branchKey] || {};
                  const expectedUser1 = 'admin';
                  const expectedUser2 = `admin@${branchKey}`;
                  const customUser = (storedCreds.username || '').toLowerCase().trim();
                  
                  const isUserValid = enteredUser === expectedUser1 || enteredUser === expectedUser2 || (customUser && enteredUser === customUser);
                  const isPasswordValid = enteredPassword === (storedCreds.password || '') || enteredPassword === 'branch123';
                  
                  if (isUserValid && isPasswordValid) {
                    isValid = true;
                    fullUsername = `admin@${branchKey}`;
                  }
                } else {
                  const storedCreds = batchCredentials[batchKey] || {};
                  const expectedUser1 = batchKey;
                  const expectedUser2 = `${batchKey}@${branchKey}`;
                  const customUser = (storedCreds.username || '').toLowerCase().trim();
                  
                  const isUserValid = enteredUser === expectedUser1 || enteredUser === expectedUser2 || (customUser && enteredUser === customUser);
                  const isPasswordValid = enteredPassword === (storedCreds.password || '');
                  
                  if (isUserValid && isPasswordValid) {
                    isValid = true;
                    fullUsername = `${batchKey}@${branchKey}`;
                  }
                }

                if (isValid) {
                  setLoginError('');
                  setLoggedInUser(fullUsername);
                  const matchingBranch = branches.find(b => b.toLowerCase() === branchKey);
                  setBranchFilter(matchingBranch || 'All');
                  setLoginData({ username: '', password: '' });
                  setAppMode('admin');
                } else {
                  setLoginError('Invalid username or password for selected branch and batch');
                }
              }}>
                <div className="form-group" style={{ textAlign: 'left' }}>
                  <label>Select Branch</label>
                  <select 
                    className="form-control"
                    value={selectedBranchLogin}
                    onChange={(e) => setSelectedBranchLogin(e.target.value)}
                    style={{ background: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                  >
                    {branches.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ textAlign: 'left' }}>
                  <label>Select Batch</label>
                  <select 
                    className="form-control"
                    value={selectedBatchLogin}
                    onChange={(e) => setSelectedBatchLogin(e.target.value)}
                    style={{ background: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                  >
                    <option value="admin">Branch Admin (All Batches)</option>
                    <option value="batch1">Batch 1 (Mon - Thu)</option>
                    <option value="batch2">Batch 2 (Tue - Fri)</option>
                    <option value="batch3">Batch 3 (Wed - Sat)</option>
                  </select>
                </div>
                <div className="form-group" style={{ textAlign: 'left' }}>
                  <label>Username</label>
                  <input type="text" className="form-control" placeholder="Enter username" value={loginData.username} onChange={(e) => setLoginData({...loginData, username: e.target.value})} required />
                </div>
                <div className="form-group" style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ margin: 0 }}>Password</label>
                    <a href="#" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); setIsForgotPassword(true); setLoginError(''); }}>Forgot Password?</a>
                  </div>
                  <input type="password" className="form-control" placeholder="Enter password" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} required />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>Login to Dashboard</button>
              </form>
              <button type="button" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }} onClick={() => {
                setNewStudent({ name: '', age: '', phone: '', belt: 'White', joinDate: new Date().toISOString().split('T')[0], batch: 'Morning', schedule: 'Mon-Thu', branch: selectedBranchLogin, photo: null });
                setIsAddModalOpen(true);
              }}>
                <UserPlus size={16} /> Enroll New Student
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-outline-primary" style={{ width: '100%', justifyContent: 'center', border: 'none', background: 'transparent' }} onClick={() => { setLoginError(''); setAppMode('superadmin-login'); }}>
                  Switch to Admin Login
                </button>
                <button type="button" className="btn-outline-primary" style={{ width: '100%', justifyContent: 'center', border: 'none', background: 'transparent' }} onClick={() => { setLoginError(''); setAppMode('website'); }}>
                  Back to Website
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // --- Admin Login View ---
  const renderSuperAdminLogin = () => (
    <div className="login-layout" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: "url('https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=2069&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5,5,5,0.85)' }}></div>
      <div className="glass-panel" style={{ zIndex: 1, padding: '3rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h2 className="brand" style={{ justifyContent: 'center', marginBottom: '0.5rem' }}>
          <span className="brand-accent">MASTER</span> FIT Admin
        </h2>
        <p style={{ color: 'var(--color-secondary)', fontSize: '0.85rem', marginBottom: '2rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Admin Portal</p>
        {isForgotPassword ? (
          <>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Please contact the IT administrator to reset your Admin credentials.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button type="button" className="btn-outline-primary" style={{ width: '100%', justifyContent: 'center', border: 'none', background: 'transparent' }} onClick={() => setIsForgotPassword(false)}>Back to Login</button>
            </div>
          </>
        ) : (
          <>
            {loginError && <div style={{ color: '#E50914', marginBottom: '1rem', background: 'rgba(229, 9, 20, 0.1)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(229, 9, 20, 0.3)' }}>{loginError}</div>}
            <form onSubmit={(e) => {
              e.preventDefault();
              const usernameLower = loginData.username.toLowerCase().trim();
              if (adminCredentials[usernameLower] && adminCredentials[usernameLower] === loginData.password) {
                setLoginError('');
                setLoggedInUser(usernameLower);
                setBranchFilter('All');
                setLoginData({ username: '', password: '' });
                setAppMode('admin');
              } else {
                setLoginError('Invalid admin username or password');
              }
            }}>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label>Admin Username</label>
                <input type="text" className="form-control" placeholder="Enter admin username" value={loginData.username} onChange={(e) => setLoginData({...loginData, username: e.target.value})} required />
              </div>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ margin: 0 }}>Password</label>
                  <a href="#" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); setIsForgotPassword(true); setLoginError(''); }}>Forgot Password?</a>
                </div>
                <input type="password" className="form-control" placeholder="Enter password" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} required />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>Access Dashboard</button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn-outline-primary" style={{ width: '100%', justifyContent: 'center', border: 'none', background: 'transparent' }} onClick={() => { setLoginError(''); setAppMode('login'); }}>
                Switch to Coordinator Login
              </button>
              <button type="button" className="btn-outline-primary" style={{ width: '100%', justifyContent: 'center', border: 'none', background: 'transparent' }} onClick={() => { setLoginError(''); setAppMode('website'); }}>
                Back to Website
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (appMode === 'website') {
    return renderPublic();
  }

  if (appMode === 'login') {
    return renderLogin();
  }

  if (appMode === 'superadmin-login') {
    return renderSuperAdminLogin();
  }



  // --- Main Admin Dashboard Template ---
  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="brand" style={{ cursor: 'pointer' }} onClick={() => setAppMode('website')}>
            <span className="brand-accent">MASTER</span> FIT Admin
          </h2>
        </div>
        <nav className="nav-menu">
          <a className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>
            <Users className="nav-icon" /> <span>Dashboard</span>
          </a>
          <a className={`nav-item ${currentView === 'attendance' ? 'active' : ''}`} onClick={() => setCurrentView('attendance')}>
            <CalendarDays className="nav-icon" /> <span>Attendance</span>
          </a>
          <a className={`nav-item ${currentView === 'fees' ? 'active' : ''}`} onClick={() => setCurrentView('fees')}>
            <Wallet className="nav-icon" /> <span>Fees</span>
          </a>
          <a className={`nav-item ${currentView === 'reminders' ? 'active' : ''}`} onClick={() => setCurrentView('reminders')}>
            <Bell className="nav-icon" /> <span>Reminders</span>
          </a>
          <a className={`nav-item ${currentView === 'performance' ? 'active' : ''}`} onClick={() => setCurrentView('performance')}>
            <TrendingUp className="nav-icon" /> <span>Performance</span>
          </a>
          <div style={{ flex: 1 }}></div>
          {isAdminUser(loggedInUser) && (
            <a className={`nav-item ${currentView === 'settings' ? 'active' : ''}`} onClick={() => setCurrentView('settings')}>
              <Settings className="nav-icon" /> <span>Settings</span>
            </a>
          )}
          <a className="nav-item" onClick={() => {
            if (isAdminUser(loggedInUser)) {
              setAppMode('superadmin-login');
            } else {
              setAppMode('login');
            }
          }}>
            <LogOut className="nav-icon" /> <span>Logout</span>
          </a>
        </nav>
      </aside>

      <main className="main-content">
        <header className="header">
          <h1 className="page-title">
            {currentView === 'dashboard' && 'Admin Dashboard'}
            {currentView === 'attendance' && 'Attendance Tracking'}
            {currentView === 'fees' && 'Fee Management'}
            {currentView === 'reminders' && 'Alerts & Reminders'}
            {currentView === 'performance' && 'Student Performance'}
            {currentView === 'settings' && 'Account Settings'}
          </h1>
          <div className="header-actions">
            {/* Branch Filter Selector */}
            <div style={{ position: 'relative' }}>
              <select
                className="form-control"
                style={{ padding: '0.5rem 1rem', paddingRight: '2rem', width: '180px', height: '38px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                disabled={!isAdminUser(loggedInUser)}
              >
                {isAdminUser(loggedInUser) && <option value="All">All Branches</option>}
                {isAdminUser(loggedInUser) ? (
                  branches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))
                ) : (
                  <option value={branchFilter}>{branchFilter}</option>
                )}
              </select>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search students..." 
                className="form-control"
                style={{ paddingLeft: '36px', width: '250px', height: '38px', paddingTop: 0, paddingBottom: 0 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="user-profile">
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: 500, textTransform: 'capitalize' }}>
                {loggedInUser} Panel
              </span>
              <div className="avatar">{loggedInUser.charAt(0).toUpperCase()}</div>
            </div>
          </div>
        </header>

        <div className="content-area">
          {currentView === 'dashboard' && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon-wrapper"><Users className="stat-icon" /></div>
                  <div className="stat-details">
                    <h3>Active Students</h3>
                    <p className="stat-value">{searchedStudents.length}</p>
                  </div>
                </div>
                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('attendance')}>
                  <div className="stat-icon-wrapper" style={{ background: 'rgba(33, 150, 243, 0.1)' }}>
                    <CalendarDays className="stat-icon" style={{ color: '#2196F3' }} />
                  </div>
                  <div className="stat-details">
                    <h3>Classes Today</h3>
                    <p className="stat-value" style={{ color: '#2196F3' }}>3 <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Batches</span></p>
                  </div>
                </div>
                <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('reminders')}>
                  <div className="stat-icon-wrapper" style={{ background: 'rgba(255, 215, 0, 0.1)' }}>
                    <AlertTriangle className="stat-icon" style={{ color: '#FFD700' }} />
                  </div>
                  <div className="stat-details">
                    <h3>Pending Dues</h3>
                    <p className="stat-value" style={{ color: '#FFD700' }}>{searchedStudents.filter(s => !s.paidMonths || !s.paidMonths[new Date().toISOString().slice(0, 7)]).length}</p>
                  </div>
                </div>
              </div>

              <div className="panel" style={{ overflowX: 'auto' }}>
                <div className="panel-header">
                  <h3 className="panel-title">Academy Roster</h3>
                  <button className="btn-primary" onClick={() => {
                    const defaultBranch = isAdminUser(loggedInUser) ? 'Kuttiady' : (branches.find(b => b.toLowerCase() === (loggedInUser && loggedInUser.split('@')[1])) || 'Kuttiady');
                    setNewStudent(prev => ({ ...prev, branch: defaultBranch }));
                    setIsAddModalOpen(true);
                  }}>
                    <UserPlus size={16} /> Add Student
                  </button>
                </div>
                {searchedStudents.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Batch Schedule</th>
                        <th>Belt Level</th>
                        <th>Phone</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchedStudents.map(student => (
                        <tr key={student.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setSelectedStudent(student)}>
                              {student.photo ? (
                                <img src={student.photo} alt="" style={{ width: '30px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: '30px', height: '40px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: 'white', textDecoration: 'none' }}>
                                  {student.name.charAt(0)}
                                </div>
                              )}
                              <span style={{ fontWeight: 500, color: '#E50914', textDecoration: 'underline' }}>{student.name}</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge" style={{ background: 'rgba(229, 9, 20, 0.15)', color: '#FFD700', border: '1px solid rgba(255, 215, 0, 0.3)', marginRight: '8px' }}>{student.branch}</span>
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>{student.schedule} • {student.batch}</span>
                          </td>
                          <td><span className={`badge ${getBeltColorClass(student.belt)}`}>{student.belt}</span></td>
                          <td style={{ color: 'var(--color-text-muted)' }}>{student.phone}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <a href={`tel:${student.phone}`} className="btn-icon" style={{ color: '#2196F3' }} title="Call Student">
                                <Phone size={18} />
                              </a>
                              <a href={`https://wa.me/${student.phone}`} target="_blank" rel="noreferrer" className="btn-icon" style={{ color: '#25D366' }} title="WhatsApp Student">
                                <MessageCircle size={18} />
                              </a>
                              <button className="btn-icon" onClick={() => handleDeleteStudent(student.id)} style={{ color: '#F44336' }} title="Delete">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>No students found.</div>
                )}
              </div>
            </>
          )}

          {currentView === 'attendance' && renderAttendance()}
          {currentView === 'fees' && renderFees()}
          {currentView === 'reminders' && renderReminders()}
          {currentView === 'performance' && renderPerformance()}
          {currentView === 'settings' && renderSettings()}
        </div>
      </main>

      {/* Profile Modal */}
      {selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="panel-header">
              <h2 className="panel-title">{isEditingStudent ? "Edit Student Profile" : "Student Profile"}</h2>
              <button className="btn-icon" onClick={() => {
                setSelectedStudent(null);
                setIsEditingStudent(false);
                setEditingStudentData(null);
              }}><X size={24} /></button>
            </div>
            
            {isEditingStudent ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                setStudents(students.map(s => s.id === editingStudentData.id ? editingStudentData : s));
                setSelectedStudent(editingStudentData);
                setIsEditingStudent(false);
                setEditingStudentData(null);
              }}>
                <div style={{ padding: '1rem 0' }}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={editingStudentData.name} 
                      onChange={(e) => setEditingStudentData({...editingStudentData, name: e.target.value})} 
                      required 
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label>Age</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={editingStudentData.age} 
                        onChange={(e) => setEditingStudentData({...editingStudentData, age: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input 
                        type="tel" 
                        className="form-control" 
                        value={editingStudentData.phone} 
                        onChange={(e) => setEditingStudentData({...editingStudentData, phone: e.target.value})} 
                        required 
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label>Batch Schedule</label>
                      <select 
                        className="form-control" 
                        value={editingStudentData.schedule} 
                        onChange={(e) => setEditingStudentData({...editingStudentData, schedule: e.target.value})}
                      >
                        <option value="Mon-Thu">Batch 1 (Mon - Thu)</option>
                        <option value="Tue-Fri">Batch 2 (Tue - Fri)</option>
                        <option value="Wed-Sat">Batch 3 (Wed - Sat)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Time Slot</label>
                      <select 
                        className="form-control" 
                        value={editingStudentData.batch} 
                        onChange={(e) => setEditingStudentData({...editingStudentData, batch: e.target.value})}
                      >
                        <option value="Morning">Morning</option>
                        <option value="Evening">Evening</option>
                        <option value="Night">Night</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label>Branch</label>
                      <select 
                        className="form-control" 
                        value={editingStudentData.branch} 
                        onChange={(e) => setEditingStudentData({...editingStudentData, branch: e.target.value})}
                        disabled={!isAdminUser(loggedInUser)}
                      >
                        {isAdminUser(loggedInUser) ? (
                          branches.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))
                        ) : (
                          <option value={editingStudentData.branch}>{editingStudentData.branch}</option>
                        )}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Belt Level</label>
                      <select 
                        className="form-control" 
                        value={editingStudentData.belt} 
                        onChange={(e) => setEditingStudentData({...editingStudentData, belt: e.target.value})}
                      >
                        <option value="White">White Belt</option>
                        <option value="Yellow">Yellow Belt</option>
                        <option value="Orange">Orange Belt</option>
                        <option value="Green">Green Belt</option>
                        <option value="Blue">Blue Belt</option>
                        <option value="Purple">Purple Belt</option>
                        <option value="Brown">Brown Belt</option>
                        <option value="Red">Red Belt</option>
                        <option value="Black">Black Belt</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn-secondary" onClick={() => {
                    setIsEditingStudent(false);
                    setEditingStudentData(null);
                  }}>Cancel</button>
                  <button type="submit" className="btn-primary">Save Changes</button>
                </div>
              </form>
            ) : (
              <>
                <div style={{ padding: '1rem 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      {selectedStudent.photo ? (
                        <img src={selectedStudent.photo} alt={selectedStudent.name} style={{ width: '90px', height: '120px', borderRadius: '8px', objectFit: 'cover', border: '2px solid var(--color-primary)' }} />
                      ) : (
                        <div style={{ width: '90px', height: '120px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold' }}>
                          {selectedStudent.name.charAt(0)}
                        </div>
                      )}
                      <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{selectedStudent.name}</h3>
                    </div>
                    <span className={`badge ${getBeltColorClass(selectedStudent.belt)}`}>{selectedStudent.belt}</span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <div><span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Age</span><div style={{ fontWeight: 600 }}>{selectedStudent.age} Years</div></div>
                    <div>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Phone</span>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {selectedStudent.phone}
                        <a href={`tel:${selectedStudent.phone}`} style={{ color: '#2196F3', display: 'flex' }} title="Call"><Phone size={14} /></a>
                        <a href={`https://wa.me/${selectedStudent.phone}`} target="_blank" rel="noreferrer" style={{ color: '#25D366', display: 'flex' }} title="WhatsApp"><MessageCircle size={14} /></a>
                      </div>
                    </div>
                    <div><span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Join Date</span><div style={{ fontWeight: 600 }}>{selectedStudent.joinDate}</div></div>
                    <div><span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Status</span><div style={{ fontWeight: 600, color: '#4CAF50' }}>{selectedStudent.status}</div></div>
                  </div>

                  <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Academy Details</h4>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span className="badge" style={{ background: 'var(--color-primary)', color: 'white' }}>{selectedStudent.branch} Branch</span>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{selectedStudent.schedule}</span>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{selectedStudent.batch} Batch</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Financial</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Admission Fee</span>
                      {selectedStudent.admissionPaid ? <span className="badge badge-green">Paid</span> : <span className="badge badge-red">Pending</span>}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Monthly Fee ({new Date().toISOString().slice(0, 7)})</span>
                      {(selectedStudent.paidMonths && selectedStudent.paidMonths[new Date().toISOString().slice(0, 7)]) ? <span className="badge badge-green">Paid</span> : <span className="badge badge-red">Pending</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                  {isAdminUser(loggedInUser) && (
                    <button className="btn-primary" onClick={() => {
                      setEditingStudentData(selectedStudent);
                      setIsEditingStudent(true);
                    }}>Edit Student</button>
                  )}
                  <button className="btn-secondary" onClick={() => setSelectedStudent(null)}>Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="panel-header">
              <h2 className="panel-title">Enroll Student</h2>
              <button className="btn-icon" onClick={() => setIsAddModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAddStudent}>
              <div className="form-group">
                <label>Student Photo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {newStudent.photo ? (
                    <img src={newStudent.photo} alt="Preview" style={{ width: '60px', height: '80px', borderRadius: '6px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '60px', height: '80px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserPlus size={24} color="rgba(255,255,255,0.3)" />
                    </div>
                  )}
                  <input type="file" accept="image/*" className="form-control" onChange={handlePhotoUpload} style={{ paddingTop: '0.5rem' }} />
                </div>
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-control" required value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} placeholder="Enter name"/>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" className="form-control" required value={newStudent.age} onChange={(e) => setNewStudent({...newStudent, age: e.target.value})} placeholder="21"/>
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" className="form-control" required value={newStudent.phone} onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})} placeholder="Phone number"/>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Batch Schedule</label>
                  <select className="form-control" value={newStudent.schedule} onChange={(e) => setNewStudent({...newStudent, schedule: e.target.value})}>
                    <option value="Mon-Thu">Batch 1 (Mon - Thu)</option>
                    <option value="Tue-Fri">Batch 2 (Tue - Fri)</option>
                    <option value="Wed-Sat">Batch 3 (Wed - Sat)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Time Slot</label>
                  <select className="form-control" value={newStudent.batch} onChange={(e) => setNewStudent({...newStudent, batch: e.target.value})}>
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Branch</label>
                  <select 
                    className="form-control" 
                    value={newStudent.branch} 
                    onChange={(e) => setNewStudent({...newStudent, branch: e.target.value})}
                    disabled={
                      (!isAdminUser(loggedInUser) && appMode !== 'superadmin-login') || 
                      appMode === 'login'
                    }
                  >
                    {((isAdminUser(loggedInUser) || appMode === 'superadmin-login') && appMode !== 'login') ? (
                      branches.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))
                    ) : (
                      <option value={
                        appMode === 'login' 
                          ? selectedBranchLogin 
                          : (branches.find(b => b.toLowerCase() === (loggedInUser && loggedInUser.split('@')[1])) || 'Kuttiady')
                      }>
                        {
                          appMode === 'login' 
                            ? selectedBranchLogin 
                            : (branches.find(b => b.toLowerCase() === (loggedInUser && loggedInUser.split('@')[1])) || 'Kuttiady')
                        }
                      </option>
                    )}
                  </select>
                </div>
                <div className="form-group">
                   <label>Initial Belt</label>
                   <select className="form-control" value={newStudent.belt} onChange={(e) => setNewStudent({...newStudent, belt: e.target.value})}>
                     <option value="White">White Belt</option>
                     <option value="Yellow">Yellow Belt</option>
                     <option value="Orange">Orange Belt</option>
                     <option value="Green">Green Belt</option>
                     <option value="Blue">Blue Belt</option>
                     <option value="Purple">Purple Belt</option>
                     <option value="Brown">Brown Belt</option>
                     <option value="Black">Black Belt</option>
                   </select>
                </div>
              </div>
              <div className="form-group">
                <label>Joining Date</label>
                <input type="date" className="form-control" required value={newStudent.joinDate} onChange={(e) => setNewStudent({...newStudent, joinDate: e.target.value})}/>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', gap: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Complete Enrollment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {studentToDelete !== null && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(229, 9, 20, 0.1)', color: '#E50914', marginBottom: '1rem' }}>
                <AlertTriangle size={32} />
              </div>
              <h2 style={{ margin: '0 0 0.5rem 0', fontFamily: 'var(--font-heading)' }}>Delete Student?</h2>
              <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>This action cannot be undone.</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-secondary" onClick={() => setStudentToDelete(null)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-primary" onClick={confirmDelete} style={{ flex: 1, justifyContent: 'center' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
