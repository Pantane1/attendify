
import React, { useState, useEffect } from 'react';
import { Course, Student, AttendanceRecord } from '../types';
import { dbService } from '../services/dbService';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  courses: Course[];
  students: Student[];
  onDataChange: () => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const LecturerDashboard: React.FC<Props> = ({ courses, students, onDataChange }) => {
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'STUDENTS'>('ANALYTICS');
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>(courses[0]?.id || '');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [newStudent, setNewStudent] = useState({ name: '', studentId: '', email: '', profileImage: '' });
  const [newCourse, setNewCourse] = useState<Omit<Course, 'id' | 'lecturerId'>>({ 
    code: '', 
    name: '', 
    startTime: '09:00',
    daysOfWeek: [],
    earlyBuffer: 15,
    lateBuffer: 10
  });

  useEffect(() => {
    setAttendance(dbService.getAttendance());
  }, []);

  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const studentData: Student = { id: Math.random().toString(36).substr(2, 9), ...newStudent };
    dbService.saveStudent(studentData);
    onDataChange();
    setShowRegisterForm(false);
    setNewStudent({ name: '', studentId: '', email: '', profileImage: '' });
    setIsSubmitting(false);
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm("Are you sure you want to remove this student and all their records? This action cannot be undone.")) {
      dbService.deleteStudent(id);
      onDataChange();
      setAttendance(dbService.getAttendance());
    }
  };

  const handleRetakePhoto = (student: Student, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedStudent = { ...student, profileImage: reader.result as string };
      dbService.saveStudent(updatedStudent);
      onDataChange();
    };
    reader.readAsDataURL(file);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCourse.daysOfWeek.length === 0) {
      alert("Please select at least one day for the schedule.");
      return;
    }
    setIsSubmitting(true);
    const courseData: Course = { 
      id: 'c' + Math.random().toString(36).substr(2, 5), 
      lecturerId: 'l1', 
      ...newCourse 
    };
    dbService.saveCourse(courseData);
    onDataChange();
    setShowCourseForm(false);
    setNewCourse({ code: '', name: '', startTime: '09:00', daysOfWeek: [], earlyBuffer: 15, lateBuffer: 10 });
    setIsSubmitting(false);
  };

  const handleDayToggle = (day: string) => {
    setNewCourse(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day) 
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewStudent(prev => ({ ...prev, profileImage: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const courseStats = courses.map(c => {
    const count = attendance.filter(a => a.courseId === c.id).length;
    return { name: c.code, count, color: '#4f46e5' };
  });

  const riskWatch = students.map(s => {
    const records = attendance.filter(a => a.studentId === s.id);
    const rate = courses.length > 0 ? (records.length / courses.length) * 100 : 0;
    return { ...s, rate };
  }).filter(s => s.rate < 70).sort((a, b) => a.rate - b.rate);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-emerald-100 text-emerald-700';
      case 'LATE': return 'bg-amber-100 text-amber-700';
      default: return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex bg-white p-1 rounded-2xl border w-fit mx-auto shadow-sm">
        <button 
          onClick={() => setActiveTab('ANALYTICS')} 
          className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'ANALYTICS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Analytics Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('STUDENTS')} 
          className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'STUDENTS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Biometric Management
        </button>
      </div>

      {activeTab === 'ANALYTICS' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-[2rem] border shadow-sm flex flex-col justify-center">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Database Size</p>
              <p className="text-4xl font-black text-slate-900">{students.length}</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border shadow-sm flex flex-col justify-center">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Managed Courses</p>
              <p className="text-4xl font-black text-slate-900">{courses.length}</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border shadow-sm flex flex-col justify-center">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Today's Traffic</p>
              <p className="text-4xl font-black text-indigo-600">{attendance.filter(a => a.timestamp.startsWith(new Date().toISOString().split('T')[0])).length}</p>
            </div>
            <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl flex flex-col justify-center gap-3">
              <button onClick={() => setShowRegisterForm(true)} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">Add Student</button>
              <button onClick={() => setShowCourseForm(true)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">New Course</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
                <h2 className="text-xl font-black text-slate-900 mb-8">Course Engagement</h2>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={courseStats}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)'}} />
                      <Bar dataKey="count" radius={[12, 12, 12, 12]} barSize={48}>
                        {courseStats.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                <div className="p-8 border-b flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900">Attendance Stream</h2>
                  <select onChange={(e) => setSelectedCourse(e.target.value)} value={selectedCourse} className="bg-slate-50 border-none rounded-2xl text-xs font-black p-3 focus:ring-4 ring-indigo-50">
                    {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <th className="px-8 py-5">Student Identity</th>
                        <th className="px-8 py-5">Verified Status</th>
                        <th className="px-8 py-5">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {attendance.filter(a => a.courseId === selectedCourse).map(log => {
                        const student = students.find(s => s.id === log.studentId);
                        return (
                          <tr key={log.id} className="group hover:bg-slate-50/30 transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <img src={student?.profileImage || `https://picsum.photos/seed/${student?.id}/40`} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="" />
                                <div>
                                  <p className="text-sm font-black text-slate-900">{student?.name}</p>
                                  <p className="text-[10px] font-black text-slate-400">{student?.studentId}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${getStatusColor(log.status)}`}>{log.status}</span>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-3">
                                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{ width: `${log.confidenceScore * 100}%` }} />
                                  </div>
                                  <span className="text-[10px] font-black text-slate-400">{(log.confidenceScore * 100).toFixed(0)}%</span>
                               </div>
                            </td>
                          </tr>
                        );
                      })}
                      {attendance.filter(a => a.courseId === selectedCourse).length === 0 && (
                        <tr><td colSpan={3} className="px-8 py-16 text-center text-slate-400 text-sm font-medium italic">No data recorded for this session.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <h3 className="text-white text-lg font-black mb-6 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Punctuality Risk
                </h3>
                <div className="space-y-4">
                  {riskWatch.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={s.profileImage || `https://picsum.photos/seed/${s.id}/30`} className="w-8 h-8 rounded-lg object-cover grayscale" alt="" />
                        <p className="text-sm font-bold text-white truncate">{s.name}</p>
                      </div>
                      <span className="text-xs font-black text-red-400 bg-red-400/10 px-2 py-1 rounded-lg">{s.rate.toFixed(0)}%</span>
                    </div>
                  ))}
                  {riskWatch.length === 0 && <p className="text-slate-500 text-center py-6 text-sm font-medium italic">Healthy compliance rates.</p>}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-10 rounded-[2.5rem] border shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Enrolled Student Profiles</h2>
              <p className="text-slate-500 text-sm font-medium">Audit and manage biometric tokens for the student database.</p>
            </div>
            <button 
              onClick={() => setShowRegisterForm(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
              Enroll New Student
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map(student => (
              <div key={student.id} className="group p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-indigo-300 transition-all hover:bg-white hover:shadow-xl">
                <div className="flex items-start justify-between mb-6">
                  <div className="relative">
                    <img 
                      src={student.profileImage || `https://picsum.photos/seed/${student.id}/100`} 
                      className="w-20 h-20 rounded-3xl object-cover shadow-sm border-2 border-white" 
                      alt="" 
                    />
                    <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleRetakePhoto(student, file);
                        }}
                      />
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
                    </label>
                  </div>
                  <button 
                    onClick={() => handleDeleteStudent(student.id)}
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete Student"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 leading-tight">{student.name}</h4>
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">{student.studentId}</p>
                  <p className="text-[10px] font-bold text-slate-400">{student.email}</p>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-center flex-1 border-r">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Sessions</p>
                    <p className="text-sm font-black text-slate-900">{attendance.filter(a => a.studentId === student.id).length}</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Status</p>
                    <p className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">ENROLLED</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REGISTRATION MODAL */}
      {showRegisterForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-10 border-b flex items-center justify-between bg-slate-50">
               <div>
                <h3 className="text-2xl font-black text-slate-900">Biometric Enroll</h3>
                <p className="text-slate-500 text-sm font-medium">Add a new student to the verification node.</p>
               </div>
               <button onClick={() => setShowRegisterForm(false)} className="text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-full hover:bg-slate-200">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
               </button>
             </div>
             <form onSubmit={handleRegisterStudent} className="p-10 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Full Name" value={newStudent.name} onChange={e=>setNewStudent({...newStudent, name: e.target.value})} className="p-4 bg-slate-100 rounded-2xl text-sm font-bold border-none focus:ring-4 ring-indigo-50" />
                  <input required placeholder="Student ID" value={newStudent.studentId} onChange={e=>setNewStudent({...newStudent, studentId: e.target.value})} className="p-4 bg-slate-100 rounded-2xl text-sm font-bold border-none focus:ring-4 ring-indigo-50" />
               </div>
               <input required type="email" placeholder="Email Address" value={newStudent.email} onChange={e=>setNewStudent({...newStudent, email: e.target.value})} className="w-full p-4 bg-slate-100 rounded-2xl text-sm font-bold border-none focus:ring-4 ring-indigo-50" />
               <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                  {newStudent.profileImage ? (
                    <img src={newStudent.profileImage} className="w-20 h-20 rounded-2xl mx-auto object-cover mb-4" alt="" />
                  ) : (
                    <svg className="w-8 h-8 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="text-xs font-bold text-slate-500" />
               </div>
               <button disabled={isSubmitting} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">
                  {isSubmitting ? 'Processing...' : 'Register Biometrics'}
               </button>
             </form>
          </div>
        </div>
      )}

      {/* REFINED COURSE MODAL */}
      {showCourseForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-10 border-b flex items-center justify-between bg-indigo-600 text-white">
               <div>
                <h3 className="text-2xl font-black">Session Configuration</h3>
                <p className="text-indigo-100 text-sm font-medium">Define recurring schedule and buffer policies.</p>
               </div>
               <button onClick={() => setShowCourseForm(false)} className="text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
               </button>
             </div>
             <form onSubmit={handleCreateCourse} className="p-10 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Identity Code</label>
                    <input required placeholder="e.g. CS101" value={newCourse.code} onChange={e=>setNewCourse({...newCourse, code: e.target.value.toUpperCase()})} className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold border-2 border-slate-100 focus:border-indigo-500 focus:bg-white transition-all outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Start Time (24H)</label>
                    <input required type="time" value={newCourse.startTime} onChange={e=>setNewCourse({...newCourse, startTime: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold border-2 border-slate-100 focus:border-indigo-500 focus:bg-white transition-all outline-none" />
                  </div>
               </div>

               <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Course Title</label>
                <input required placeholder="Full Course Name" value={newCourse.name} onChange={e=>setNewCourse({...newCourse, name: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold border-2 border-slate-100 focus:border-indigo-500 focus:bg-white transition-all outline-none" />
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Recurring Schedule</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                          newCourse.daysOfWeek.includes(day)
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Early Buffer (Mins)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={newCourse.earlyBuffer} 
                      onChange={e=>setNewCourse({...newCourse, earlyBuffer: parseInt(e.target.value) || 0})} 
                      className="w-full p-3 bg-white rounded-xl text-sm font-bold border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500" 
                    />
                    <p className="text-[9px] text-slate-400 font-medium italic">Allow check-in before start.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Late Grace (Mins)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={newCourse.lateBuffer} 
                      onChange={e=>setNewCourse({...newCourse, lateBuffer: parseInt(e.target.value) || 0})} 
                      className="w-full p-3 bg-white rounded-xl text-sm font-bold border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500" 
                    />
                    <p className="text-[9px] text-slate-400 font-medium italic">Mark as LATE after this time.</p>
                  </div>
               </div>

               <button disabled={isSubmitting} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-black transition-all shadow-xl active:scale-[0.98]">
                  {isSubmitting ? 'Activating Hub...' : 'Finalize Session Configuration'}
               </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerDashboard;
