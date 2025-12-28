
import React, { useState, useEffect } from 'react';
import { UserRole, Student, Course } from './types';
import { dbService } from './services/dbService';
import Header from './components/Header';
import LecturerDashboard from './components/LecturerDashboard';
import StudentCheckIn from './components/StudentCheckIn';
import LandingPage from './components/LandingPage';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const loadData = () => {
    setCourses(dbService.getCourses());
    setStudents(dbService.getStudents());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => setUserRole(null);

  if (!userRole) {
    return <LandingPage onSelectRole={setUserRole} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        role={userRole} 
        onLogout={handleLogout} 
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {userRole === UserRole.LECTURER ? (
          <LecturerDashboard 
            courses={courses} 
            students={students} 
            onDataChange={loadData}
          />
        ) : (
          <StudentCheckIn students={students} courses={courses} />
        )}
      </main>

      <footer className="py-12 text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] border-t mt-12 bg-white">
        &copy; {new Date().getFullYear()} Attendify Biometric Systems. Powered by Gemini Vision Engine.
      </footer>
    </div>
  );
};

export default App;
