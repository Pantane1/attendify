
import React, { useState, useRef, useEffect } from 'react';
import { Student, Course, AttendanceRecord } from '../types';
import { verifyFace } from '../services/geminiService';
import { dbService } from '../services/dbService';

interface Props {
  students: Student[];
  courses: Course[];
}

const StudentCheckIn: React.FC<Props> = ({ students, courses }) => {
  const [view, setView] = useState<'SCAN' | 'HISTORY'>('SCAN');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasInitiatedCamera, setHasInitiatedCamera] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle', message: string }>({ type: 'idle', message: '' });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Smart Course Selection Logic (Updated for Days of Week & Buffers)
  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      const now = new Date();
      const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      // Filter only courses happening today
      const todaysCourses = courses.filter(c => !c.daysOfWeek || c.daysOfWeek.length === 0 || c.daysOfWeek.includes(todayName));
      
      if (todaysCourses.length > 0) {
        const closest = todaysCourses.reduce((prev, curr) => {
          const [currH, currM] = curr.startTime.split(':').map(Number);
          const currTotal = currH * 60 + currM;
          const [prevH, prevM] = prev.startTime.split(':').map(Number);
          const prevTotal = prevH * 60 + prevM;
          
          return Math.abs(currTotal - currentMinutes) < Math.abs(prevTotal - currentMinutes) ? curr : prev;
        });
        
        setSelectedCourseId(closest.id);
      }
    }
  }, [courses, selectedCourseId]);

  const startCamera = async () => {
    setCameraError(false);
    setHasInitiatedCamera(true);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      setCameraError(true);
      setStatus({ type: 'error', message: 'Camera access denied. Please enable permissions.' });
    }
  };

  const handleCapture = async () => {
    if (!selectedStudentId || !selectedCourseId || !videoRef.current || !canvasRef.current) return;
    
    const student = students.find(s => s.id === selectedStudentId);
    const course = courses.find(c => c.id === selectedCourseId);
    if (!student || !course) return;

    // Check early buffer
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = course.startTime.split(':').map(Number);
    const startMinutesTotal = startH * 60 + startM;
    const earlyLimit = startMinutesTotal - (course.earlyBuffer || 15);
    
    if (currentMinutes < earlyLimit) {
      setStatus({ type: 'error', message: `Too early. Check-in starts ${course.earlyBuffer || 15} mins before class.` });
      return;
    }

    setIsVerifying(true);
    setStatus({ type: 'idle', message: 'Analyzing biometric tokens...' });

    const context = canvasRef.current.getContext('2d');
    if (context) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const captureData = canvasRef.current.toDataURL('image/jpeg', 0.95);
      const refImg = student.profileImage || `https://picsum.photos/seed/${student.id}/200`;
      
      try {
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('TIMEOUT')), 15000)
        );
        const result = await Promise.race([verifyFace(captureData, refImg), timeoutPromise]);

        if (result.match) {
          const isLate = currentMinutes > (startMinutesTotal + (course.lateBuffer || 10));

          const record: AttendanceRecord = {
            id: Math.random().toString(36).substr(2, 9),
            studentId: selectedStudentId,
            courseId: selectedCourseId,
            timestamp: now.toISOString(),
            status: isLate ? 'LATE' : 'PRESENT',
            confidenceScore: result.confidence
          };

          if (dbService.markAttendance(record)) {
            setStatus({ type: 'success', message: result.message });
          } else {
            setStatus({ type: 'error', message: 'Duplicate Entry: You have already checked in for this session today.' });
          }
        } else {
          setStatus({ type: 'error', message: result.message });
        }
      } catch (error: any) {
        setStatus({ type: 'error', message: 'Biometric link timed out. Please check your connection.' });
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleRetry = () => {
    setStatus({ type: 'idle', message: '' });
  };

  const myHistory = dbService.getAttendance()
    .filter(a => a.studentId === selectedStudentId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex bg-white p-1 rounded-2xl mb-8 border w-fit mx-auto shadow-sm">
        <button onClick={() => setView('SCAN')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'SCAN' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>Check-In Portal</button>
        <button onClick={() => setView('HISTORY')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'HISTORY' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>My Records</button>
      </div>

      {view === 'SCAN' ? (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white ring-1 ring-slate-200 group">
              {/* Liveness Scanning HUD */}
              {isVerifying && (
                <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-8">
                  <div className="flex justify-between items-start animate-pulse">
                    <div className="text-cyan-400 font-mono text-[10px] space-y-1">
                      <p>ANALYZING_VERTICES...</p>
                      <p>TOKEN_SEQ: {Math.random().toString(16).slice(2, 10)}</p>
                    </div>
                    <div className="w-12 h-12 border-2 border-cyan-400/40 rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] animate-[scan_2s_ease-in-out_infinite] absolute left-0"></div>
                  <div className="flex justify-between items-end">
                    <div className="w-20 h-1 bg-white/20"></div>
                    <div className="text-cyan-400 font-mono text-[10px]">SECURE_LINK_ACTIVE</div>
                  </div>
                </div>
              )}
              
              {!hasInitiatedCamera ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-800">
                  <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mb-6 border border-indigo-500/20">
                    <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  <h3 className="text-white font-bold text-xl mb-3 tracking-tight">Biometric Verification</h3>
                  <p className="text-slate-400 text-sm mb-8 max-w-sm mx-auto leading-relaxed">Identity is verified using real-time spatial analysis for maximum academic integrity.</p>
                  <button onClick={startCamera} className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-indigo-500/20">Initialize Secure Feed</button>
                </div>
              ) : (
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover grayscale-[0.1] contrast-[1.15] brightness-[1.05]" style={{ transform: 'scaleX(-1)' }} />
              )}
              
              {stream && (
                <div className="absolute inset-0 pointer-events-none border-[30px] border-black/5">
                  <div className="w-full h-full border border-white/10 relative">
                    <div className="absolute top-4 left-4 text-[10px] text-white/30 font-mono tracking-widest bg-black/20 px-2 py-1 rounded">SSL_ENCRYPTED_STREAM</div>
                  </div>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <button
              onClick={status.type === 'error' ? handleRetry : handleCapture}
              disabled={isVerifying || (!selectedStudentId && status.type !== 'error') || !stream}
              className={`w-full py-5 rounded-[2rem] font-black text-xl tracking-tight transition-all shadow-2xl ${
                isVerifying || (!selectedStudentId && status.type !== 'error') || !stream 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : status.type === 'error' 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-slate-900 text-white hover:bg-black active:scale-[0.98]'
              }`}
            >
              {isVerifying ? 'Authenticating Identity...' : status.type === 'error' ? 'Try Verification Again' : 'Confirm Presence'}
            </button>

            {status.type !== 'idle' && (
              <div className={`p-6 rounded-[2rem] animate-in fade-in slide-in-from-bottom-4 duration-500 border-2 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-red-50 text-red-800 border-red-100'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${status.type === 'success' ? 'bg-emerald-200 text-emerald-700' : 'bg-red-200 text-red-700'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d={status.type === 'success' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"}></path></svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-lg">{status.type === 'success' ? 'Verified' : 'Verification Failed'}</p>
                    <p className="text-sm font-medium opacity-80">{status.message}</p>
                  </div>
                  {status.type === 'error' && (
                    <button onClick={handleRetry} className="bg-white/50 px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-white transition-colors">Retry</button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-8">
            <section>
              <label className="block text-[11px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Verify Your Identity</label>
              <div className="relative mb-4">
                <input type="text" placeholder="Search name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-4 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700" />
              </div>
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                {students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.studentId.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
                  <button key={s.id} onClick={() => setSelectedStudentId(s.id)} className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${selectedStudentId === s.id ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50' : 'border-slate-50 hover:border-slate-200 bg-slate-50/50'}`}>
                    <img src={s.profileImage || `https://picsum.photos/seed/${s.id}/40`} className={`w-12 h-12 rounded-xl object-cover border-2 ${selectedStudentId === s.id ? 'border-indigo-500' : 'border-slate-100'}`} alt="" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-black truncate ${selectedStudentId === s.id ? 'text-indigo-900' : 'text-slate-800'}`}>{s.name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase">{s.studentId}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <label className="block text-[11px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Select Target Session</label>
              <div className="space-y-2">
                {courses.map(c => (
                  <button key={c.id} onClick={() => setSelectedCourseId(c.id)} className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${selectedCourseId === c.id ? 'border-emerald-500 bg-emerald-50/50 ring-4 ring-emerald-50' : 'border-slate-50 hover:border-slate-200 bg-slate-50/50'}`}>
                    <div>
                      <p className={`text-[10px] font-black uppercase mb-1 ${selectedCourseId === c.id ? 'text-emerald-600' : 'text-slate-400'}`}>{c.code}</p>
                      <p className="text-sm font-black text-slate-800">{c.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-slate-500 block">SCHEDULED</span>
                      <span className="text-xs font-black text-slate-900">{c.startTime}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden p-8">
          {!selectedStudentId ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Identify Yourself First</h3>
              <p className="text-slate-500 font-medium">Please select your identity in the Check-In Portal to view your records.</p>
              <button onClick={() => setView('SCAN')} className="mt-8 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm">Return to Portal</button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b pb-8">
                <div className="flex items-center gap-6">
                  <img src={students.find(s=>s.id === selectedStudentId)?.profileImage || `https://picsum.photos/seed/${selectedStudentId}/80`} className="w-20 h-20 rounded-[1.5rem] object-cover border-4 border-slate-50 shadow-sm" alt="" />
                  <div>
                    <h2 className="text-3xl font-black text-slate-900">{students.find(s=>s.id === selectedStudentId)?.name}</h2>
                    <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs">Biometric ID: {students.find(s=>s.id === selectedStudentId)?.studentId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-indigo-600">{myHistory.length}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Successful Check-ins</p>
                </div>
              </div>
              <div className="grid gap-4">
                {myHistory.map(record => {
                  const course = courses.find(c => c.id === record.courseId);
                  return (
                    <div key={record.id} className="group flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all hover:bg-white hover:shadow-md">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">{course?.code}</span>
                          <p className="font-black text-slate-900">{course?.name}</p>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">{new Date(record.timestamp).toLocaleString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">AI Confidence</p>
                          <p className="text-xs font-black text-slate-900">{(record.confidenceScore * 100).toFixed(0)}% Match</p>
                        </div>
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${record.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {record.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default StudentCheckIn;
