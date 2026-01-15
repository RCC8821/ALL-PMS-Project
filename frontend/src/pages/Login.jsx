// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { loginUser, clearError } from '../../src/features/Auth/AuthSlice';
// import { Mail, Lock, Loader2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

// const Login = () => {
//   const [formData, setFormData] = useState({ email: '', password: '' });
//   const [mounted, setMounted] = useState(false);

//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { isLoading, error, token } = useSelector((state) => state.auth);

//   useEffect(() => {
//     setMounted(true);
//     dispatch(clearError());
//   }, [dispatch]);

//   useEffect(() => {
//     if (token) navigate('/dashboard');
//   }, [token, navigate]);

//   const handleInputChange = useCallback((e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (error) dispatch(clearError());
//   }, [error, dispatch]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.email.trim() || !formData.password.trim()) return;
//     const result = await dispatch(loginUser({ email: formData.email.trim(), password: formData.password }));
//     if (loginUser.fulfilled.match(result)) navigate('/dashboard');
//   };

//   return (
//     <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
//       {/* --- Background Decorative Elements --- */}
//       <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
//         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[100px]" />
//         <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px]" />
//       </div>

//       {/* --- Login Card --- */}
//       <div className={`relative z-10 w-full max-w-[440px] transition-all duration-700 ease-out transform 
//         ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
//         <div className="bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden p-10">
          
//           {/* Header */}
//           <div className="mb-10 text-center">
//              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200 mb-6">
//                 <ShieldCheck className="w-8 h-8 text-white" />
//              </div>
//             <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">ALL PMS LOGIN</h1>
//             <p className="text-slate-500 mt-2 font-medium">Please enter your credentials</p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Email Input */}
//             <div className="space-y-2">
//               <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
//               <div className="relative group">
//                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
//                   <Mail size={20} />
//                 </div>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   placeholder="hello@example.com"
//                   className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Password Input */}
//             <div className="space-y-2">
//               <div className="flex justify-between items-center px-1">
//                 <label className="text-sm font-semibold text-slate-700">Password</label>
//                 <button type="button" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition">Forgot?</button>
//               </div>
//               <div className="relative group">
//                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
//                   <Lock size={20} />
//                 </div>
//                 <input
//                   type="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleInputChange}
//                   placeholder="••••••••"
//                   className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Error Message */}
//             {error && (
//               <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl animate-in fade-in slide-in-from-top-1">
//                 <AlertCircle className="w-5 h-5 shrink-0" />
//                 <p className="text-sm font-semibold">{error}</p>
//               </div>
//             )}

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="group relative w-full flex items-center justify-center py-4 px-6 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
//             >
//               {isLoading ? (
//                 <Loader2 className="w-6 h-6 animate-spin text-white" />
//               ) : (
//                 <div className="flex items-center gap-2">
//                   <span>Sign In</span>
//                   <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//                 </div>
//               )}
//             </button>
//           </form>

//           {/* Footer */}
        
//         </div>

//         {/* Bottom Tagline */}
        
//       </div>
//     </div>
//   );
// };

// export default Login;


/////////////////////////////////////////////

// import React, { useState, useEffect } from 'react';
// import { Mail, Lock, Loader2, AlertCircle, ArrowRight, User, Sparkles, Star, Zap } from 'lucide-react';

// const Login = () => {
//   const [formData, setFormData] = useState({ email: '', password: '' });
//   const [showRobot, setShowRobot] = useState(false);
//   const [showForm, setShowForm] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [robotWaving, setRobotWaving] = useState(false);

//   useEffect(() => {
//     // Robot left se aayega
//     setTimeout(() => setShowRobot(true), 300);
    
//     // Robot wave karega
//     setTimeout(() => setRobotWaving(true), 1500);
//     setTimeout(() => setRobotWaving(false), 2500);
    
//     // Form niche se popup
//     setTimeout(() => setShowForm(true), 1800);
//   }, []);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (error) setError('');
//   };

//   const handleSubmit = () => {
//     if (!formData.email.trim() || !formData.password.trim()) {
//       setError('Please fill in all fields');
//       return;
//     }
    
//     setIsLoading(true);
//     setTimeout(() => {
//       setIsLoading(false);
//       if (formData.email === 'demo@example.com' && formData.password === 'demo123') {
//         alert('Login successful! 🎉');
//       } else {
//         setError('Invalid email or password');
//       }
//     }, 2000);
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter') {
//       handleSubmit();
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      
//       {/* Animated Stars Background */}
//       <div className="absolute inset-0">
//         {[...Array(50)].map((_, i) => (
//           <div
//             key={i}
//             className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
//             style={{
//               left: `${Math.random() * 100}%`,
//               top: `${Math.random() * 100}%`,
//               animationDelay: `${Math.random() * 3}s`,
//               animationDuration: `${2 + Math.random() * 3}s`
//             }}
//           />
//         ))}
//       </div>

//       {/* Glowing Orbs */}
//       <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
//       <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />

//       {/* Advanced 3D Robot - Left se aayega */}
//       <div 
//         className={`absolute transition-all duration-[1800ms] ease-out ${
//           showRobot 
//             ? 'left-1/2 -translate-x-1/2' 
//             : 'left-[-300px]'
//         }`}
//         style={{
//           top: '35%',
//           transform: showRobot ? 'translate(-50%, -50%) scale(0.75)' : 'translate(0, -50%) scale(0.75)',
//           zIndex: 1
//         }}
//       >
//         <div className="relative">
//           {/* Robot Container */}
//           <div className={`relative transition-all duration-700 ${showRobot ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            
//             {/* Antenna */}
//             <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
//               <div className="w-1 h-6 bg-gradient-to-t from-cyan-400 to-transparent"></div>
//               <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
//             </div>

//             {/* Head */}
//             <div className="relative w-32 h-28 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 rounded-3xl mx-auto mb-3 shadow-2xl border-4 border-cyan-300/30">
//               {/* Visor/Screen */}
//               <div className="absolute top-4 left-4 right-4 h-12 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 rounded-2xl overflow-hidden">
//                 <div className="w-full h-full bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-scan"></div>
                
//                 {/* Eyes */}
//                 <div className="absolute top-2 left-6 w-4 h-4 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/70 animate-pulse"></div>
//                 <div className="absolute top-2 right-6 w-4 h-4 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/70 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
//               </div>
              
//               {/* Mouth/Speaker */}
//               <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
//                 <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full"></div>
//                 <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full"></div>
//                 <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full"></div>
//                 <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full"></div>
//               </div>

//               {/* Head Glow */}
//               <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-400/20 to-transparent"></div>
//             </div>

//             {/* Neck */}
//             <div className="w-10 h-4 bg-gradient-to-b from-gray-600 to-gray-700 rounded-lg mx-auto mb-1 shadow-inner"></div>

//             {/* Body */}
//             <div className="relative w-40 h-48 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 rounded-[2rem] mx-auto shadow-2xl border-4 border-slate-500/30">
//               {/* Chest Panel */}
//               <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-32 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl border-2 border-indigo-500/30 p-2">
//                 {/* Power Core */}
//                 <div className="w-full h-12 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-xl flex items-center justify-center relative overflow-hidden">
//                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-slide"></div>
//                   <Zap className="w-6 h-6 text-white animate-pulse" />
//                 </div>
                
//                 {/* Status Lights */}
//                 <div className="mt-3 flex justify-center gap-2">
//                   <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
//                   <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50" style={{ animationDelay: '0.3s' }}></div>
//                   <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse shadow-lg shadow-red-400/50" style={{ animationDelay: '0.6s' }}></div>
//                 </div>

//                 {/* Display Lines */}
//                 <div className="mt-3 space-y-1">
//                   <div className="h-1 bg-cyan-500/50 rounded w-3/4"></div>
//                   <div className="h-1 bg-cyan-500/30 rounded w-1/2"></div>
//                   <div className="h-1 bg-cyan-500/50 rounded w-2/3"></div>
//                 </div>
//               </div>

//               {/* Body Glow */}
//               <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-cyan-400/10 to-transparent"></div>
//             </div>

//             {/* Arms */}
//             <div className={`absolute top-24 -left-12 w-10 h-28 bg-gradient-to-b from-slate-600 to-slate-700 rounded-2xl shadow-xl border-2 border-slate-500/30 transition-all duration-500 ${robotWaving ? '-rotate-45 origin-top' : 'rotate-12'}`}>
//               <div className="absolute bottom-0 w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg left-1 shadow-lg"></div>
//             </div>
//             <div className="absolute top-24 -right-12 w-10 h-28 bg-gradient-to-b from-slate-600 to-slate-700 rounded-2xl shadow-xl border-2 border-slate-500/30 -rotate-12">
//               <div className="absolute bottom-0 w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg left-1 shadow-lg"></div>
//             </div>

//             {/* Legs */}
//             <div className="flex gap-6 justify-center mt-2">
//               <div className="w-12 h-24 bg-gradient-to-b from-slate-700 to-slate-800 rounded-2xl shadow-xl border-2 border-slate-600/30">
//                 <div className="mt-auto w-10 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-b-xl mx-auto shadow-lg"></div>
//               </div>
//               <div className="w-12 h-24 bg-gradient-to-b from-slate-700 to-slate-800 rounded-2xl shadow-xl border-2 border-slate-600/30">
//                 <div className="mt-auto w-10 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-b-xl mx-auto shadow-lg"></div>
//               </div>
//             </div>

//             {/* Shadow */}
//             <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-8 bg-black/50 rounded-full blur-xl"></div>
//           </div>

//           {/* Floating Elements */}
//           {showRobot && (
//             <>
//               <Sparkles className="absolute -top-12 -right-8 w-8 h-8 text-cyan-400 animate-bounce" style={{ animationDelay: '0s' }} />
//               <Star className="absolute top-16 -left-10 w-6 h-6 text-yellow-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
//               <Zap className="absolute bottom-12 -right-10 w-6 h-6 text-purple-400 animate-bounce" style={{ animationDelay: '0.6s' }} />
//             </>
//           )}
//         </div>
//       </div>

//       {/* Login Form - Niche se popup */}
//       <div 
//         className={`relative z-10 w-full max-w-[460px] transition-all duration-[1200ms] ease-out ${
//           showForm 
//             ? 'translate-y-0 opacity-100 scale-100' 
//             : 'translate-y-[100vh] opacity-0 scale-90'
//         }`}
//         style={{ marginTop: showRobot ? '200px' : '0' }}
//       >
//         <div className="bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.6)] rounded-[3rem] overflow-hidden p-10 relative">
          
//           {/* Animated Border */}
//           <div className="absolute inset-0 rounded-[3rem] overflow-hidden">
//             <div className="absolute inset-[-2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-50 blur-sm animate-spin-slow"></div>
//           </div>
          
//           <div className="relative">
//             {/* Header */}
//             <div className="mb-6 text-center">
//               <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-2xl shadow-cyan-500/50 mb-4 animate-pulse">
//                 <User className="w-8 h-8 text-white" />
//               </div>
//               <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2 drop-shadow-2xl">
//                 ALL PMS LOGIN
//               </h1>
//               <p className="text-cyan-200 text-xs font-medium">
//                 🤖 Secured by AI Authentication
//               </p>
//             </div>

//             <div className="space-y-5">
//               {/* Email Input */}
//               <div className="space-y-2">
//                 <label className="text-sm font-semibold text-cyan-200 ml-1">Email Address</label>
//                 <div className="relative group">
//                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300 group-focus-within:text-cyan-400 transition-all">
//                     <Mail size={20} />
//                   </div>
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleInputChange}
//                     onKeyPress={handleKeyPress}
//                     placeholder="hello@example.com"
//                     className="w-full pl-12 pr-4 py-3.5 bg-white/5 backdrop-blur-sm border border-cyan-500/20 rounded-2xl text-white placeholder-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-white/10 transition-all shadow-lg"
//                   />
//                 </div>
//               </div>

//               {/* Password Input */}
//               <div className="space-y-2">
//                 <div className="flex justify-between items-center px-1">
//                   <label className="text-sm font-semibold text-cyan-200">Password</label>
//                   <button type="button" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
//                     Forgot?
//                   </button>
//                 </div>
//                 <div className="relative group">
//                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300 group-focus-within:text-cyan-400 transition-all">
//                     <Lock size={20} />
//                   </div>
//                   <input
//                     type="password"
//                     name="password"
//                     value={formData.password}
//                     onChange={handleInputChange}
//                     onKeyPress={handleKeyPress}
//                     placeholder="••••••••"
//                     className="w-full pl-12 pr-4 py-3.5 bg-white/5 backdrop-blur-sm border border-cyan-500/20 rounded-2xl text-white placeholder-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-white/10 transition-all shadow-lg"
//                   />
//                 </div>
//               </div>

//               {/* Error Message */}
//               {error && (
//                 <div className="flex items-center gap-3 bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-200 p-4 rounded-2xl animate-shake">
//                   <AlertCircle className="w-5 h-5 shrink-0" />
//                   <p className="text-sm font-semibold">{error}</p>
//                 </div>
//               )}

//               {/* Submit Button */}
//               <button
//                 onClick={handleSubmit}
//                 disabled={isLoading}
//                 className="group relative w-full flex items-center justify-center py-4 px-6 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-2xl shadow-cyan-500/50 transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
//               >
//                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                
//                 {isLoading ? (
//                   <Loader2 className="w-6 h-6 animate-spin text-white" />
//                 ) : (
//                   <div className="flex items-center gap-2">
//                     <span>Access System</span>
//                     <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
//                   </div>
//                 )}
//               </button>
//             </div>

//             {/* Footer */}
//             <div className="mt-6 text-center">
//               <p className="text-cyan-300 text-sm">
//                 New user?{' '}
//                 <button className="font-bold text-white hover:text-cyan-300 transition-colors">
//                   Register now
//                 </button>
//               </p>
//             </div>
//           </div>
//         </div>

       
//       </div>

//       <style>{`
//         @keyframes shake {
//           0%, 100% { transform: translateX(0); }
//           25% { transform: translateX(-8px); }
//           75% { transform: translateX(8px); }
//         }
        
//         @keyframes scan {
//           0% { transform: translateX(-100%); }
//           100% { transform: translateX(100%); }
//         }
        
//         @keyframes slide {
//           0% { transform: translateX(-100%); }
//           100% { transform: translateX(100%); }
//         }
        
//         @keyframes spin-slow {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
        
//         .animate-shake {
//           animation: shake 0.4s ease-in-out;
//         }
        
//         .animate-scan {
//           animation: scan 2s ease-in-out infinite;
//         }
        
//         .animate-slide {
//           animation: slide 2s ease-in-out infinite;
//         }
        
//         .animate-spin-slow {
//           animation: spin-slow 8s linear infinite;
//         }
//       `}</style>
//     </div>
//   );
// }

// export default Login;



import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../src/features/Auth/AuthSlice'; // ← Change path according to your project structure
import { 
  Mail, Lock, Loader2, AlertCircle, ArrowRight, User, 
  Zap, Shield, Sparkles, Star 
} from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isLoading, error, token } = useSelector((state) => state.auth);

  // Animation states
  const [showRobot, setShowRobot] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [robotWaving, setRobotWaving] = useState(false);

  // Clear error on mount + animations
  useEffect(() => {
    dispatch(clearError());

    // Robot animation sequence
    setTimeout(() => setShowRobot(true), 300);
    setTimeout(() => setRobotWaving(true), 1500);
    setTimeout(() => setRobotWaving(false), 2500);
    setTimeout(() => setShowForm(true), 1800);
  }, [dispatch]);

  // Redirect when we have token (successful login)
  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) dispatch(clearError());
  }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password.trim()) {
      dispatch(clearError());
      // You can set local error or use redux error
      return;
    }

    dispatch(loginUser({
      email: formData.email.trim(),
      password: formData.password
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${Math.random() * 3}px`,
              height: `${Math.random() * 3}px`,
              background: 'rgba(255, 255, 255, 0.8)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              boxShadow: `0 0 ${Math.random() * 10}px rgba(100, 200, 255, 0.5)`
            }}
          />
        ))}
      </div>

      {/* Enhanced Glowing Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '5s' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '7s' }} />

      {/* Robot Animation */}
      <div 
        className={`absolute transition-all duration-[1800ms] ease-out ${
          showRobot 
            ? 'left-1/2 -translate-x-1/2' 
            : 'left-[-300px]'
        }`}
        style={{
          top: '35%',
          transform: showRobot ? 'translate(-50%, -50%) scale(0.75)' : 'translate(0, -50%) scale(0.75)',
          zIndex: 1
        }}
      >
        <div className="relative">
          {/* Antenna */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="w-1 h-6 bg-gradient-to-t from-cyan-400 to-transparent"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
          </div>

          {/* Head */}
          <div className="relative w-32 h-28 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 rounded-3xl mx-auto mb-3 shadow-2xl border-4 border-cyan-300/30">
            <div className="absolute top-4 left-4 right-4 h-12 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 rounded-2xl overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-scan"></div>
              <div className="absolute top-2 left-6 w-4 h-4 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/70 animate-pulse"></div>
              <div className="absolute top-2 right-6 w-4 h-4 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/70 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full"></div>
            </div>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-400/20 to-transparent"></div>
          </div>

          {/* Neck */}
          <div className="w-10 h-4 bg-gradient-to-b from-gray-600 to-gray-700 rounded-lg mx-auto mb-1 shadow-inner"></div>

          {/* Body */}
          <div className="relative w-40 h-48 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 rounded-[2rem] mx-auto shadow-2xl border-4 border-slate-500/30">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-32 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl border-2 border-indigo-500/30 p-2">
              <div className="w-full h-12 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-slide"></div>
                <Zap className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div className="mt-3 flex justify-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse shadow-lg shadow-red-400/50" style={{ animationDelay: '0.6s' }}></div>
              </div>
              <div className="mt-3 space-y-1">
                <div className="h-1 bg-cyan-500/50 rounded w-3/4"></div>
                <div className="h-1 bg-cyan-500/30 rounded w-1/2"></div>
                <div className="h-1 bg-cyan-500/50 rounded w-2/3"></div>
              </div>
            </div>
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-cyan-400/10 to-transparent"></div>
          </div>

          {/* Arms */}
          <div className={`absolute top-24 -left-12 w-10 h-28 bg-gradient-to-b from-slate-600 to-slate-700 rounded-2xl shadow-xl border-2 border-slate-500/30 transition-all duration-500 ${robotWaving ? '-rotate-45 origin-top' : 'rotate-12'}`}>
            <div className="absolute bottom-0 w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg left-1 shadow-lg"></div>
          </div>
          <div className="absolute top-24 -right-12 w-10 h-28 bg-gradient-to-b from-slate-600 to-slate-700 rounded-2xl shadow-xl border-2 border-slate-500/30 -rotate-12">
            <div className="absolute bottom-0 w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg left-1 shadow-lg"></div>
          </div>

          {/* Legs */}
          <div className="flex gap-6 justify-center mt-2">
            <div className="w-12 h-24 bg-gradient-to-b from-slate-700 to-slate-800 rounded-2xl shadow-xl border-2 border-slate-600/30">
              <div className="mt-auto w-10 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-b-xl mx-auto shadow-lg"></div>
            </div>
            <div className="w-12 h-24 bg-gradient-to-b from-slate-700 to-slate-800 rounded-2xl shadow-xl border-2 border-slate-600/30">
              <div className="mt-auto w-10 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-b-xl mx-auto shadow-lg"></div>
            </div>
          </div>

          {/* Shadow */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-8 bg-black/50 rounded-full blur-xl"></div>

          {/* Floating Elements */}
          {showRobot && (
            <>
              <Sparkles className="absolute -top-12 -right-8 w-8 h-8 text-cyan-400 animate-bounce" style={{ animationDelay: '0s' }} />
              <Star className="absolute top-16 -left-10 w-6 h-6 text-yellow-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
              <Zap className="absolute bottom-12 -right-10 w-6 h-6 text-purple-400 animate-bounce" style={{ animationDelay: '0.6s' }} />
            </>
          )}
        </div>
      </div>

      {/* Login Form */}
      <div 
        className={`relative z-10 w-full max-w-[460px] transition-all duration-[1200ms] ease-out ${
          showForm 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-[100vh] opacity-0 scale-90'
        }`}
        style={{ marginTop: showRobot ? '200px' : '0' }}
      >
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.8)] rounded-[3rem] overflow-hidden p-10 relative group">
          
          <div className="absolute inset-0 rounded-[3rem] overflow-hidden">
            <div className="absolute inset-[-2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-60 blur-md animate-spin-slow"></div>
          </div>
          
          <div className="relative">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-2xl shadow-cyan-500/50 mb-4 animate-bounce" style={{ animationDelay: '0.1s' }}>
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter mb-2 drop-shadow-2xl">
                PMS LOGIN
              </h1>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <p className="text-cyan-300 text-sm font-bold">Enterprise Security</p>
                <Shield className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-cyan-200/70 text-xs font-medium">✨ Next-Gen Authentication</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2 group">
                <label className="text-sm font-bold text-cyan-300 ml-1 flex items-center gap-2">
                  <Mail size={16} className="text-cyan-400" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="admin@company.com"
                    className="w-full pl-4 pr-4 py-4 bg-white/5 backdrop-blur-sm border border-cyan-500/30 rounded-2xl text-white placeholder-cyan-300/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-white/10 transition-all shadow-lg font-medium"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2 group">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                    <Lock size={16} className="text-cyan-400" />
                    Password
                  </label>
                  <button type="button" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:scale-110 transition-all duration-200">
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="••••••••••••"
                    className="w-full pl-4 pr-4 py-4 bg-white/5 backdrop-blur-sm border border-cyan-500/30 rounded-2xl text-white placeholder-cyan-300/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-white/10 transition-all shadow-lg font-medium"
                    required
                  />
                </div>
              </div>

              {/* Security Info */}
              <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                <Shield className="w-4 h-4 text-green-400 shrink-0" />
                <span className="text-xs text-green-300 font-semibold">256-bit encrypted connection</span>
              </div>

              {/* Error from Redux */}
              {error && (
                <div className="flex items-center gap-3 bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-200 p-4 rounded-2xl animate-shake">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-semibold">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex items-center justify-center py-4 px-6 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-2xl shadow-cyan-500/50 transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden hover:shadow-3xl hover:shadow-purple-500/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin text-white mr-2" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    <span>Access System</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </div>
                )}
              </button>
            </form>

            <div className="mt-6 text-center space-y-4">
              <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
              <p className="text-cyan-300/80 text-sm">
                New user?{' '}
                <button className="font-bold text-cyan-300 hover:text-white transition-colors hover:underline">
                  Request Access
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        @keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes scan { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-scan { animation: scan 2s ease-in-out infinite; }
        .animate-slide { animation: slide 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Login;