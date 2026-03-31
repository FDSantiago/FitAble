import React, { useState, useEffect } from "react";
import {
  Camera,
  Home,
  Activity,
  User,
  Settings,
  Play,
  Mic,
  ShieldAlert,
  CheckCircle2,
  BarChart3,
  Clock,
  ChevronRight,
  LogOut,
  Volume2,
  Video,
  ArrowLeft,
  Mail,
  Lock,
  UserCheck,
  Edit3,
  Target,
  ShieldCheck,
} from "lucide-react";

const App = () => {
  const [currentView, setCurrentView] = useState("login");

  // App-wide state
  const [workoutStats, setWorkoutStats] = useState({
    reps: 0,
    formScore: 0,
    duration: "00:00",
  });
  const [selectedExercise, setSelectedExercise] = useState("Squats");

  // Navigation Helper
  const navigateTo = (view) => setCurrentView(view);

  // --- MODULE 1: LOGIN PAGE ---
  const renderLogin = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 text-slate-900 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <Activity size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">FitAble</h1>
          <p className="text-slate-500 text-sm">
            Smart Exercise Tracking & Form Correction
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Student ID / Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-3.5 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="user@student.edu"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-3.5 text-slate-400"
                size={18}
              />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>
          <button
            onClick={() => navigateTo("dashboard")}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg px-4 py-3 mt-6 transition-colors flex justify-center items-center shadow-md shadow-emerald-200"
          >
            Login to Account
          </button>
          <div className="text-center mt-6">
            <span className="text-slate-500 text-sm">New to FitAble? </span>
            <button
              onClick={() => navigateTo("register")}
              className="text-emerald-600 font-semibold text-sm hover:underline"
            >
              Create a Student Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // --- MODULE 2: REGISTRATION PAGE ---
  const renderRegistration = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 text-slate-900 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200 relative">
        <button
          onClick={() => navigateTo("login")}
          className="absolute top-6 left-6 text-slate-400 hover:text-slate-700"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="text-center mb-8 mt-4">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Student Registration
          </h1>
          <p className="text-slate-500 text-sm">
            Join FitAble to track your progress
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <UserCheck
                className="absolute left-3 top-3.5 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Juan Dela Cruz"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Student ID Number
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-3.5 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="2024-XXXXX"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Create Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-3.5 text-slate-400"
                size={18}
              />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
          <button
            onClick={() => navigateTo("dashboard")}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg px-4 py-3 mt-6 transition-colors shadow-md shadow-emerald-200"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );

  // --- MODULE 3: DASHBOARD ---
  const renderDashboard = () => (
    <div className="pb-24 pt-8 px-6 max-w-md mx-auto h-full overflow-y-auto bg-slate-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-slate-500 text-sm font-medium">Welcome back,</p>
          <h2 className="text-2xl font-bold text-slate-900">Harold B.</h2>
        </div>
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-emerald-500 shadow-sm">
          <User className="text-emerald-600" />
        </div>
      </div>

      {/* Quick Start Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 mb-8 shadow-lg shadow-emerald-200 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-white mb-2">Ready to train?</h3>
          <p className="text-emerald-100 text-sm mb-4">
            Start your AI-assisted workout now.
          </p>
          <button
            onClick={() => navigateTo("camera-prep")}
            className="bg-white text-emerald-700 px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Play size={18} fill="currentColor" /> Quick Start
          </button>
        </div>
        <Camera className="absolute -right-6 -bottom-6 w-32 h-32 text-white opacity-20" />
      </div>

      {/* Mini Stats */}
      <h3 className="text-lg font-bold text-slate-900 mb-4">Weekly Overview</h3>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs mb-1 uppercase tracking-wider font-semibold">
            Workouts
          </div>
          <div className="text-2xl font-black text-slate-900">4</div>
          <div className="text-emerald-600 text-xs mt-1 font-medium">
            On track
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs mb-1 uppercase tracking-wider font-semibold">
            Avg Form Score
          </div>
          <div className="text-2xl font-black text-slate-900">88%</div>
          <div className="text-emerald-600 text-xs mt-1 font-medium">
            +2% from last week
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
        <button
          onClick={() => navigateTo("history")}
          className="text-emerald-600 font-medium text-sm"
        >
          View All
        </button>
      </div>
      <div className="space-y-3">
        {[
          { name: "Lower Body (Squats)", date: "Today, 8:00 AM", score: "92%" },
          { name: "Upper Body (Pushups)", date: "Yesterday", score: "85%" },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Activity size={18} />
              </div>
              <div>
                <div className="text-slate-900 font-bold text-sm">
                  {item.name}
                </div>
                <div className="text-slate-500 text-xs">{item.date}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-emerald-600 font-black">{item.score}</div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">
                Form
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // --- MODULE 4: CAMERA SETUP / PREP PAGE ---
  const renderCameraPrep = () => (
    <div className="flex flex-col h-screen bg-slate-100 max-w-md mx-auto">
      <div className="p-6 bg-white border-b border-slate-200 flex items-center gap-4">
        <button
          onClick={() => navigateTo("dashboard")}
          className="text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-slate-900">Workout Setup</h2>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {/* Mock Camera Preview */}
        <div className="w-full h-64 bg-slate-200 rounded-2xl border-2 border-slate-300 border-dashed flex flex-col items-center justify-center relative overflow-hidden mb-6">
          <User size={80} className="text-slate-400 mb-2 opacity-50" />
          <p className="text-slate-500 font-medium">
            Position your full body in the frame
          </p>
          <div className="absolute top-4 right-4 bg-slate-800/60 backdrop-blur text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
            <Video size={12} /> Front Camera
          </div>
        </div>

        {/* Exercise Selection */}
        <div className="mb-auto">
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Select Exercise to Track
          </label>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {["Squats", "Pushups", "Lunges", "Jumping Jacks"].map((ex) => (
              <button
                key={ex}
                onClick={() => setSelectedExercise(ex)}
                className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${
                  selectedExercise === ex
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {ex}
              </button>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 shadow-sm">
            <Mic className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-amber-800">
              <strong>Voice Alerts are ON.</strong> Ensure your device volume is
              turned up to hear form corrections and rep counts.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigateTo("workout")}
          className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors text-lg"
        >
          START TRACKING
        </button>
      </div>
    </div>
  );

  // --- MODULE 5: MAIN FEATURE (AI LIVE WORKOUT) ---
  const renderWorkout = () => {
    // Simulated live state
    const [reps, setReps] = useState(0);
    const [warning, setWarning] = useState(false);

    useEffect(() => {
      // Simulate real-time tracking behavior
      const repInterval = setInterval(() => {
        setReps((prev) => prev + 1);
      }, 3000);

      const warningInterval = setInterval(() => {
        setWarning((prev) => !prev);
      }, 7000);

      return () => {
        clearInterval(repInterval);
        clearInterval(warningInterval);
      };
    }, []);

    const endWorkout = () => {
      setWorkoutStats({
        reps,
        formScore: warning ? 78 : 94,
        duration: "12:45",
      });
      navigateTo("results");
    };

    return (
      <div className="h-screen bg-slate-900 flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 w-full p-6 flex justify-between items-center z-20 bg-gradient-to-b from-slate-900/80 to-transparent">
          <div className="bg-white/10 backdrop-blur border border-white/20 px-4 py-1.5 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-white text-sm font-medium tracking-wide">
              {selectedExercise} Tracking
            </span>
          </div>
          <button
            onClick={() => navigateTo("dashboard")}
            className="text-white bg-white/10 p-2 rounded-full backdrop-blur"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Simulated Camera View / Pose Analysis Overlay */}
        <div className="flex-1 relative flex items-center justify-center bg-black">
          {/* Mock Video Feed Background */}
          <div className="absolute inset-0 opacity-50 mix-blend-luminosity flex items-center justify-center">
            <User size={300} className="text-slate-500" />
          </div>

          {/* Mock Pose Skeleton Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-64 border-4 border-emerald-500 border-dashed rounded-lg relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg tracking-widest uppercase">
                Target Area
              </div>
            </div>
          </div>

          {/* Real-time metrics overlay */}
          <div className="absolute left-6 bottom-32">
            <div className="text-white/70 text-sm font-bold mb-1 tracking-widest uppercase">
              REPS
            </div>
            <div className="text-8xl font-black text-white drop-shadow-2xl">
              {reps}
            </div>
          </div>

          {/* Real-Time Voice / Safety Alert Simulation */}
          <div
            className={`absolute top-24 left-1/2 -translate-x-1/2 w-[85%] max-w-sm rounded-2xl p-4 flex gap-3 shadow-2xl transition-all duration-300 ${
              warning
                ? "bg-red-500 border border-red-400"
                : "bg-emerald-500 border border-emerald-400"
            }`}
          >
            <div className="mt-0.5 bg-white/20 p-2 rounded-full h-fit">
              {warning ? (
                <ShieldAlert className="text-white" size={20} />
              ) : (
                <Mic className="text-white" size={20} />
              )}
            </div>
            <div>
              <div className="text-white font-black text-sm uppercase tracking-wide">
                {warning ? "Safety Alert (Voice)" : "Virtual Coach"}
              </div>
              <div className="text-white/95 text-sm leading-snug mt-1 font-medium">
                {warning
                  ? "Keep your back straight! You are leaning too far forward."
                  : "Good posture. Keep your core tight. Counting reps..."}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="absolute bottom-0 w-full bg-slate-900/90 backdrop-blur p-6 flex justify-center items-center pb-10">
          <button
            onClick={endWorkout}
            className="w-full max-w-xs bg-red-500 hover:bg-red-600 text-white font-black text-lg tracking-wider py-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-colors"
          >
            END WORKOUT
          </button>
        </div>
      </div>
    );
  };

  // --- MODULE 6: RESULTS / OUTPUT PAGE ---
  const renderResults = () => (
    <div className="pb-24 pt-8 px-6 max-w-md mx-auto h-full overflow-y-auto bg-slate-100 min-h-screen">
      <div className="text-center mb-8 mt-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-sm">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">
          Workout Complete!
        </h2>
        <p className="text-slate-500 text-sm font-medium">
          Data successfully synced to your profile.
        </p>
      </div>

      {/* Main Score Card */}
      <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200 shadow-lg shadow-slate-200/50 relative overflow-hidden text-center">
        <div className="text-slate-500 text-sm font-bold mb-2 uppercase tracking-widest">
          Overall Form Score
        </div>
        <div className="text-7xl font-black text-emerald-500 mb-2">
          {workoutStats.formScore}%
        </div>
        <div className="text-slate-600 font-medium text-sm">
          Excellent control and posture.
        </div>

        {/* Background decorative element */}
        <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-50 rounded-full blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <Activity className="text-emerald-500 mb-2" size={24} />
          <div className="text-3xl font-black text-slate-900">
            {workoutStats.reps}
          </div>
          <div className="text-slate-500 font-semibold text-xs mt-1 uppercase tracking-wide">
            Total Reps
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <Clock className="text-emerald-500 mb-2" size={24} />
          <div className="text-3xl font-black text-slate-900">
            {workoutStats.duration}
          </div>
          <div className="text-slate-500 font-semibold text-xs mt-1 uppercase tracking-wide">
            Duration
          </div>
        </div>
      </div>

      {/* AI Feedback Analysis */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-8">
        <h3 className="text-slate-900 font-bold flex items-center gap-2 mb-4 text-lg">
          <Activity size={20} className="text-emerald-600" />
          AI Pose Analysis Report
        </h3>
        <ul className="space-y-4">
          <li className="flex gap-3 text-sm border-b border-slate-100 pb-4">
            <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
            <span className="text-slate-700 font-medium">
              Depth on squats was consistently within the ideal range.
            </span>
          </li>
          <li className="flex gap-3 text-sm">
            <ShieldAlert className="text-amber-500 shrink-0" size={20} />
            <span className="text-slate-700 font-medium">
              Slight forward lean detected in the last 3 reps. Focus on keeping
              chest up to prevent lower back strain.
            </span>
          </li>
        </ul>
      </div>

      <button
        onClick={() => navigateTo("dashboard")}
        className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-md shadow-emerald-200 hover:bg-emerald-700 transition-colors text-lg"
      >
        Return to Dashboard
      </button>
    </div>
  );

  // --- MODULE 7: REPORTS / HISTORY PAGE ---
  const renderHistory = () => (
    <div className="pb-24 pt-8 px-6 max-w-md mx-auto h-full overflow-y-auto bg-slate-100 min-h-screen">
      <h2 className="text-2xl font-black text-slate-900 mb-6">
        Progress Reports
      </h2>

      {/* Mock Chart representation */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">
              Average Form Score
            </div>
            <div className="text-3xl font-black text-slate-900">86.4%</div>
          </div>
          <div className="text-emerald-600 text-sm font-bold bg-emerald-50 px-2 py-1 rounded-md">
            +4.2% this month
          </div>
        </div>

        {/* Simple Bar Chart Mockup */}
        <div className="flex justify-between items-end h-32 gap-2 mt-4">
          {[60, 75, 68, 85, 82, 90, 88].map((height, i) => (
            <div key={i} className="w-full flex flex-col items-center gap-2">
              <div
                className={`w-full rounded-t-md ${
                  i === 6 ? "bg-emerald-500" : "bg-slate-200"
                }`}
                style={{ height: `${height}%` }}
              ></div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">
                M{i + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-4">Workout Log</h3>
      <div className="space-y-3">
        {[
          { type: "Squats", reps: 45, date: "Mar 24, 2026", score: 94 },
          { type: "Pushups", reps: 30, date: "Mar 22, 2026", score: 82 },
          { type: "Lunges", reps: 40, date: "Mar 20, 2026", score: 88 },
          { type: "Plank", reps: 1, date: "Mar 18, 2026", score: 75 },
        ].map((log, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div>
              <div className="text-slate-900 font-bold">{log.type}</div>
              <div className="text-slate-500 text-xs font-medium mt-0.5">
                {log.date} • {log.reps} Reps
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`font-black text-lg ${
                  log.score > 85 ? "text-emerald-500" : "text-amber-500"
                }`}
              >
                {log.score}%
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // --- MODULE 8: PROFILE PAGE (UPDATED) ---
  const renderProfile = () => (
    <div className="pb-24 pt-8 px-6 max-w-md mx-auto h-full overflow-y-auto bg-slate-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-900">Student Profile</h2>
        <button className="text-emerald-600 bg-emerald-100 p-2 rounded-full hover:bg-emerald-200 transition-colors">
          <Edit3 size={18} />
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border-4 border-white shadow-lg mb-4">
          <User size={48} />
        </div>
        <h3 className="text-2xl font-black text-slate-900">Harold Bermudez</h3>
        <p className="text-slate-500 font-medium">BS Information Technology</p>
        <p className="text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1 rounded-full mt-2 border border-emerald-100">
          ID: 2024-00123
        </p>
      </div>

      {/* NEW: Body Metrics Section */}
      <h3 className="text-lg font-bold text-slate-900 mb-3">Body Metrics</h3>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">
            Weight
          </div>
          <div className="text-xl font-black text-slate-900">
            68
            <span className="text-xs text-slate-500 font-normal ml-0.5">
              kg
            </span>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">
            Height
          </div>
          <div className="text-xl font-black text-slate-900">
            175
            <span className="text-xs text-slate-500 font-normal ml-0.5">
              cm
            </span>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">
            BMI
          </div>
          <div className="text-xl font-black text-slate-900">22.2</div>
          <div className="text-[9px] text-emerald-600 font-bold uppercase">
            Normal
          </div>
        </div>
      </div>

      {/* NEW: Fitness Goals Section */}
      <h3 className="text-lg font-bold text-slate-900 mb-3">Current Goals</h3>
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex items-center gap-4">
        <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
          <Target size={24} />
        </div>
        <div>
          <div className="font-bold text-slate-900">Workout 3x a Week</div>
          <div className="text-sm text-slate-500 font-medium">
            Currently at 2/3 this week
          </div>
          {/* Mini progress bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full w-2/3 rounded-full"></div>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-3">
        Lifetime Statistics
      </h3>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-3xl font-black text-slate-900 mb-1">24</div>
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            Total Workouts
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-3xl font-black text-slate-900 mb-1">12h</div>
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            Time Trained
          </div>
        </div>
      </div>

      <button
        onClick={() => navigateTo("login")}
        className="w-full bg-white text-red-500 font-bold py-4 rounded-xl border border-slate-200 shadow-sm hover:bg-red-50 hover:border-red-100 transition-colors flex justify-center items-center gap-2 mb-4"
      >
        <LogOut size={20} /> Log Out of Account
      </button>
    </div>
  );

  // --- MODULE 9: SETTINGS PAGE (UPDATED) ---
  const renderSettings = () => (
    <div className="pb-24 pt-8 px-6 max-w-md mx-auto h-full overflow-y-auto bg-slate-100 min-h-screen">
      <h2 className="text-2xl font-black text-slate-900 mb-6">App Settings</h2>

      <div className="space-y-8">
        {/* Coach Settings */}
        <div>
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">
            Virtual Coach Settings
          </h4>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <Volume2 size={18} className="text-emerald-600" />
                </div>
                <span className="text-slate-900 text-sm font-bold">
                  Real-Time Voice Alerts
                </span>
              </div>
              <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer shadow-inner">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow"></div>
              </div>
            </div>

            {/* NEW: Real-Time Form Correction Toggle */}
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <ShieldCheck size={18} className="text-emerald-600" />
                </div>
                <span className="text-slate-900 text-sm font-bold">
                  Real-Time Form Correction
                </span>
              </div>
              <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer shadow-inner">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow"></div>
              </div>
            </div>

            <div className="flex justify-between items-center p-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <Activity size={18} className="text-emerald-600" />
                </div>
                <span className="text-slate-900 text-sm font-bold">
                  Gesture Auto-Counting
                </span>
              </div>
              <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer shadow-inner">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Hardware Settings */}
        <div>
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">
            Hardware & Camera
          </h4>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center p-4">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-lg">
                  <Video size={18} className="text-slate-600" />
                </div>
                <span className="text-slate-900 text-sm font-bold">
                  Default Camera
                </span>
              </div>
              <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-lg">
                Front Camera
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // --- BOTTOM NAVIGATION BAR ---
  const renderBottomNav = () => {
    // Hide navigation on login, registration, prep, live workout, or results screens
    if (
      ["login", "register", "camera-prep", "workout", "results"].includes(
        currentView
      )
    )
      return null;

    return (
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe z-50">
        <div className="max-w-md mx-auto flex justify-around items-center h-16">
          <button
            onClick={() => navigateTo("dashboard")}
            className={`flex flex-col items-center gap-1 w-16 transition-colors ${
              currentView === "dashboard"
                ? "text-emerald-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Home
              size={22}
              className={currentView === "dashboard" ? "fill-emerald-100" : ""}
            />
            <span className="text-[10px] font-bold">Home</span>
          </button>
          <button
            onClick={() => navigateTo("history")}
            className={`flex flex-col items-center gap-1 w-16 transition-colors ${
              currentView === "history"
                ? "text-emerald-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <BarChart3 size={22} />
            <span className="text-[10px] font-bold">Reports</span>
          </button>

          {/* Main Action Button -> Goes to Camera Prep now */}
          <div className="relative -top-6">
            <button
              onClick={() => navigateTo("camera-prep")}
              className="bg-emerald-500 hover:bg-emerald-600 transition-colors text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-emerald-300 border-4 border-white"
            >
              <Camera size={26} />
            </button>
          </div>

          <button
            onClick={() => navigateTo("profile")}
            className={`flex flex-col items-center gap-1 w-16 transition-colors ${
              currentView === "profile"
                ? "text-emerald-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <User
              size={22}
              className={currentView === "profile" ? "fill-emerald-100" : ""}
            />
            <span className="text-[10px] font-bold">Profile</span>
          </button>
          <button
            onClick={() => navigateTo("settings")}
            className={`flex flex-col items-center gap-1 w-16 transition-colors ${
              currentView === "settings"
                ? "text-emerald-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Settings
              size={22}
              className={currentView === "settings" ? "fill-emerald-100" : ""}
            />
            <span className="text-[10px] font-bold">Settings</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-200 min-h-screen font-sans selection:bg-emerald-200">
      <div className="max-w-md mx-auto bg-slate-50 min-h-screen shadow-2xl relative">
        {currentView === "login" && renderLogin()}
        {currentView === "register" && renderRegistration()}
        {currentView === "dashboard" && renderDashboard()}
        {currentView === "camera-prep" && renderCameraPrep()}
        {currentView === "workout" && renderWorkout()}
        {currentView === "results" && renderResults()}
        {currentView === "history" && renderHistory()}
        {currentView === "profile" && renderProfile()}
        {currentView === "settings" && renderSettings()}

        {renderBottomNav()}
      </div>
    </div>
  );
};

export default App;
