import React, { useState, useEffect } from 'react';
import { 
  Users, CalendarDays, Wallet, Bell, Settings, LogOut, UserPlus, AlertTriangle, X, 
  ChevronLeft, ChevronRight, CheckCircle, XCircle, Banknote, Receipt, MessageCircle, 
  Search, Phone, Trash2, ArrowRight, Activity, MapPin, TrendingUp, Award
} from 'lucide-react';
import './index.css';

// Mock Initial Data
const initialStudents = [
  { id: 1, name: "Ali Khan", age: 24, phone: "555-0101", belt: "Black", joinDate: "2024-01-15", status: "Active", admissionPaid: "2024-01", paidMonths: { "2026-05": true }, batch: "Evening", schedule: "Mon-Thu", performanceScore: 92 },
  { id: 2, name: "Sarah Ahmed", age: 19, phone: "555-0102", belt: "Blue", joinDate: "2025-06-20", status: "Active", admissionPaid: "2025-06", paidMonths: {}, batch: "Morning", schedule: "Tue-Fri", performanceScore: 78 },
  { id: 3, name: "Omar Farooq", age: 22, phone: "555-0103", belt: "White", joinDate: "2026-05-02", status: "Active", admissionPaid: false, paidMonths: {}, batch: "Night", schedule: "Wed-Sat", performanceScore: 45 },
  { id: 4, name: "Zara Ali", age: 21, phone: "555-0104", belt: "Green", joinDate: "2025-11-05", status: "Active", admissionPaid: "2025-11", paidMonths: { "2026-05": true }, batch: "Evening", schedule: "Mon-Thu", performanceScore: 85 }
];

function App() {
  const [appMode, setAppMode] = useState('website'); // 'website' or 'admin'
  const [currentView, setCurrentView] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  
  // Persistent State
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('umai_students');
    let parsed = saved ? JSON.parse(saved) : initialStudents;

    // Auto-inject requested students if they don't exist
    const requiredStudents = [
      { name: "Fanajir", age: 20, phone: "555-1001", belt: "White", joinDate: "2026-05-10", status: "Active", admissionPaid: "2026-05", paidMonths: { "2026-05": true }, batch: "Morning", schedule: "Mon-Thu", performanceScore: 50 },
      { name: "Ashiq 14", age: 14, phone: "555-1002", belt: "White", joinDate: "2026-05-10", status: "Active", admissionPaid: "2026-05", paidMonths: { "2026-05": true }, batch: "Evening", schedule: "Tue-Fri", performanceScore: 50 },
      { name: "Riswan pk", age: 22, phone: "555-1003", belt: "White", joinDate: "2026-05-10", status: "Active", admissionPaid: "2026-05", paidMonths: { "2026-05": true }, batch: "Night", schedule: "Wed-Sat", performanceScore: 50 },
      { name: "Shafnas", age: 25, phone: "555-1004", belt: "White", joinDate: "2026-05-10", status: "Active", admissionPaid: "2026-05", paidMonths: { "2026-05": true }, batch: "Morning", schedule: "Mon-Thu", performanceScore: 50 }
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
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // May 2026
  const [feeMonth, setFeeMonth] = useState(new Date().toISOString().slice(0, 7)); // "YYYY-MM"
  
  // Attendance Marking State
  const [markingDate, setMarkingDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceBatchFilter, setAttendanceBatchFilter] = useState('All');
  const [attendanceScheduleFilter, setAttendanceScheduleFilter] = useState('All');
  
  // Form State
  const [newStudent, setNewStudent] = useState({
    name: '', age: '', phone: '', belt: 'White', joinDate: new Date().toISOString().split('T')[0], batch: 'Morning', schedule: 'Mon-Thu'
  });

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  
  const searchedStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.phone.includes(searchQuery)
  );

  const getBeltColorClass = (belt) => {
    switch(belt.toLowerCase()) {
      case 'white': return 'badge-white';
      case 'yellow': return 'badge-yellow';
      case 'orange': return 'badge-orange';
      case 'green': return 'badge-green';
      case 'blue': return 'badge-blue';
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
    const student = {
      id: students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1,
      ...newStudent,
      status: "Active",
      admissionPaid: false,
      paidMonths: {},
      performanceScore: 50
    };
    setStudents([...students, student]);
    setIsAddModalOpen(false);
    setNewStudent({ name: '', age: '', phone: '', belt: 'White', joinDate: new Date().toISOString().split('T')[0], batch: 'Morning', schedule: 'Mon-Thu' });
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
          <span className="brand-accent">UMAI</span> Academy
        </div>
        <div className="nav-links">
          <a href="#schedule" className="nav-link">Schedule</a>
          <a href="#instructors" className="nav-link">Instructors</a>
          <a href="#gallery" className="nav-link">Gallery</a>
          <a href="#contact" className="nav-link">Contact</a>
          <button className="btn-outline-primary" onClick={() => setAppMode('admin')}>
            Admin Login
          </button>
        </div>
      </nav>

      <section className="hero-section">
        <img src="https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80" alt="Martial Arts" className="hero-bg" />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-subtitle">Master Your Mind & Body</span>
          <h1 className="hero-title">United Martial Arts <span>Academy</span></h1>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}><span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>IG</span> @umai_academy</div>
          </div>
        </div>
      </section>
    </div>
  );

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
      const hasRealData = totalMarked > 0;

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
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
            <span style={{color: 'var(--color-text-muted)', width: '80px', fontSize: '0.85rem'}}>Batch:</span>
            <button className={`btn-small ${attendanceScheduleFilter === 'All' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttendanceScheduleFilter('All')}>All Batches</button>
            <button className={`btn-small ${attendanceScheduleFilter === 'Mon-Thu' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttendanceScheduleFilter('Mon-Thu')}>Batch 1 (Mon-Thu)</button>
            <button className={`btn-small ${attendanceScheduleFilter === 'Tue-Fri' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttendanceScheduleFilter('Tue-Fri')}>Batch 2 (Tue-Fri)</button>
            <button className={`btn-small ${attendanceScheduleFilter === 'Wed-Sat' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAttendanceScheduleFilter('Wed-Sat')}>Batch 3 (Wed-Sat)</button>
          </div>
          
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

        {renderBatchTable('Mon-Thu')}
        {renderBatchTable('Tue-Fri')}
        {renderBatchTable('Wed-Sat')}
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
                      <button className="btn-small" style={{ background: '#25D366', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MessageCircle size={14} /> WhatsApp
                      </button>
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

  if (appMode === 'website') {
    return renderPublic();
  }

  // --- Main Admin Dashboard Template ---
  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="brand" style={{ cursor: 'pointer' }} onClick={() => setAppMode('website')}>
            <span className="brand-accent">UMAI</span> Admin
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
          <a className="nav-item">
            <Settings className="nav-icon" /> <span>Settings</span>
          </a>
          <a className="nav-item" onClick={() => setAppMode('website')}>
            <LogOut className="nav-icon" /> <span>Exit Admin</span>
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
          </h1>
          <div className="header-actions">
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search students..." 
                className="form-control"
                style={{ paddingLeft: '36px', width: '250px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="user-profile">
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: 500 }}>Admin Panel</span>
              <div className="avatar">A</div>
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
                    <p className="stat-value">{students.length}</p>
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
                    <p className="stat-value" style={{ color: '#FFD700' }}>{students.filter(s => !s.paidMonths || !s.paidMonths[new Date().toISOString().slice(0, 7)]).length}</p>
                  </div>
                </div>
              </div>

              <div className="panel" style={{ overflowX: 'auto' }}>
                <div className="panel-header">
                  <h3 className="panel-title">Academy Roster</h3>
                  <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
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
                          <td 
                            style={{ fontWeight: 500, color: '#E50914', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => setSelectedStudent(student)}
                          >
                            {student.name}
                          </td>
                          <td><span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>{student.schedule} • {student.batch}</span></td>
                          <td><span className={`badge ${getBeltColorClass(student.belt)}`}>{student.belt}</span></td>
                          <td style={{ color: 'var(--color-text-muted)' }}>{student.phone}</td>
                          <td>
                            <button className="btn-icon" onClick={() => handleDeleteStudent(student.id)} style={{ color: '#F44336' }} title="Delete">
                              <Trash2 size={18} />
                            </button>
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
        </div>
      </main>

      {/* Profile Modal */}
      {selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="panel-header">
              <h2 className="panel-title">Student Profile</h2>
              <button className="btn-icon" onClick={() => setSelectedStudent(null)}><X size={24} /></button>
            </div>
            <div style={{ padding: '1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{selectedStudent.name}</h3>
                <span className={`badge ${getBeltColorClass(selectedStudent.belt)}`}>{selectedStudent.belt}</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <div><span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Age</span><div style={{ fontWeight: 600 }}>{selectedStudent.age} Years</div></div>
                <div><span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Phone</span><div style={{ fontWeight: 600 }}>{selectedStudent.phone}</div></div>
                <div><span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Join Date</span><div style={{ fontWeight: 600 }}>{selectedStudent.joinDate}</div></div>
                <div><span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Status</span><div style={{ fontWeight: 600, color: '#4CAF50' }}>{selectedStudent.status}</div></div>
              </div>

              <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Batch Details</h4>
                <div style={{ display: 'flex', gap: '1rem' }}>
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', gap: '1rem' }}>
              <button className="btn-secondary" onClick={() => setSelectedStudent(null)}>Close</button>
            </div>
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
                  <label>Initial Belt</label>
                  <select className="form-control" value={newStudent.belt} onChange={(e) => setNewStudent({...newStudent, belt: e.target.value})}>
                    <option value="White">White Belt</option>
                    <option value="Yellow">Yellow Belt</option>
                    <option value="Green">Green Belt</option>
                    <option value="Blue">Blue Belt</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Joining Date</label>
                  <input type="date" className="form-control" required value={newStudent.joinDate} onChange={(e) => setNewStudent({...newStudent, joinDate: e.target.value})}/>
                </div>
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
