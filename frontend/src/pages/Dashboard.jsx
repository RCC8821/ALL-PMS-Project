
// import React, { useState, useMemo, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useSearchParams } from 'react-router-dom'; // ← added this

// import { 
//   LayoutDashboard, Droplets, Hammer, ShieldCheck, 
//   Pickaxe, Landmark, Lock, LogOut,
// } from 'lucide-react';

// // Components
// import Curing from '../components/Curing/Curing';
// import Casting from '../components/Casting/Casting';
// import Waterproofing from '../components/WaterProofing/waterproofing';
// import BrickWork from '../components/Brickswork/BrickWork';
// import ElectricalWork from '../components/Electrical/ElectricalWork';

// import { logout } from '../../src/features/Auth/AuthSlice'; // adjust path if needed

// const ROLE_PERMISSIONS = {
//   ADMIN: [
//     'overview', 
//     'curing', 
//     'casting',
//     'waterproofing', 
//     'BrickWork',
//     'ElectricalWork'
//   ],
//   AHUJA: ['overview', 'curing', 'casting'],
//   ABBOTT: ['overview', 'curing', 'casting'],
//   RANA: ['overview', 'curing', 'casting'],
//   RNTU: ['overview', 'curing', 'casting'],
//   SCOPE: ['overview', 'curing', 'casting'],
//   NEWSCOPE: ['overview', 'curing', 'casting'],
//   GUPTA_JI_C: ['overview', 'curing', 'casting'],
//   GUPTA_JI_B: ['overview', 'curing', 'casting'],
//   GUPTA_JI_D: ['overview', 'curing', 'casting'],
//   Scope_Adjusting: ['overview', 'curing', 'casting'],
// };

// const DEFAULT_PERMISSIONS = ['overview'];

// const MODULE_CONFIG = [
//   { id: 'overview',      label: 'Overview',       icon: LayoutDashboard, color: 'blue'    },
//   { id: 'curing',        label: 'Curing',         icon: Droplets,        color: 'cyan'    },
//   { id: 'casting',       label: 'Casting',        icon: Hammer,          color: 'indigo'  },
//   { id: 'waterproofing', label: 'Waterproofing',  icon: ShieldCheck,     color: 'teal'    },
//   { id: 'BrickWork',    label: 'BrickWork',     icon: Pickaxe,         color: 'amber'   },
//   { id: 'ElectricalWork',    label: 'ElectricalWork',     icon: Landmark,        color: 'violet'  },
// ];

// const Dashboard = () => {
//   const dispatch = useDispatch();
//   const { userType: rawUserType, token } = useSelector((state) => state.auth);

//   // ── URL Sync ───────────────────────────────────────
//   const [searchParams, setSearchParams] = useSearchParams();
//   const urlTab = searchParams.get('tab') || 'overview';

//   // Normalize userType
//   const normalizedUserType = (rawUserType || '')
//     .trim()
//     .toUpperCase()
//     .replace(/\s+/g, '');

//   console.log('=== Dashboard Debug ===');
//   console.log('Raw userType:', rawUserType);
//   console.log('Normalized userType:', normalizedUserType);
//   console.log('URL tab:', urlTab);

//   // Allowed modules based on role
//   const allowedModules = useMemo(() => {
//     if (normalizedUserType === 'ADMIN') {
//       console.log('Admin detected → Full access');
//       return MODULE_CONFIG;
//     }

//     const permissions = ROLE_PERMISSIONS[normalizedUserType] || DEFAULT_PERMISSIONS;
//     const modules = MODULE_CONFIG.filter(module => permissions.includes(module.id));

//     console.log('Allowed modules for', normalizedUserType, ':', modules.map(m => m.id));
//     return modules;
//   }, [normalizedUserType]);

//   // Decide initial tab: prefer URL → but only if allowed
//   const getInitialTab = () => {
//     if (allowedModules.some(m => m.id === urlTab)) {
//       return urlTab;
//     }
//     return allowedModules[0]?.id || 'overview';
//   };

//   const [activeTab, setActiveTab] = useState(getInitialTab);

//   // Keep URL in sync when tab changes (and guard against invalid tabs)
//   const handleTabChange = (newTab) => {
//     if (!allowedModules.some(m => m.id === newTab)) return;
//     setActiveTab(newTab);
//     setSearchParams({ tab: newTab }, { replace: true });
//   };

//   // If permissions change (very rare), protect current tab
//   useEffect(() => {
//     if (!allowedModules.some(m => m.id === activeTab)) {
//       handleTabChange(allowedModules[0]?.id || 'overview');
//     }
//   }, [allowedModules]);

//   const handleLogout = () => {
//     dispatch(logout());
//     setTimeout(() => window.location.href = '/', 300);
//   };

//   if (!token) {
//     window.location.href = '/';
//     return null;
//   }

//   const hasAccess = allowedModules.length > 0;

//   // Implemented modules (add more here when you create them)
//   const implementedModules = ['overview', 'curing', 'casting', 'waterproofing','BrickWork','ElectricalWork'];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
//       {/* Navbar */}
//       <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm">
//         <div className="max-w-7xl mx-auto px-5 sm:px-8">
//           <div className="flex items-center justify-between h-16">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-white from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
//                 <img src="/rcc-logo.png" alt="RCC" className="w-7 h-7" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-gray-800">RCC Infra</h1>
//                 <p className="text-xs text-gray-500 -mt-1">Construction Dashboard</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-5">
//               <div className="hidden sm:block text-right">
//                 <p className="font-medium capitalize">
//                   {normalizedUserType || 'User'}
//                 </p>
//                 <div className="flex items-center gap-1.5 justify-end">
//                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
//                   <span className="text-xs text-green-600">Online</span>
//                 </div>
//               </div>

//               <button
//                 onClick={handleLogout}
//                 className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//               >
//                 <LogOut size={18} />
//                 <span className="hidden sm:inline">Logout</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Main Content */}
//       <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
//         {!hasAccess ? (
//           <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
//             <Lock size={64} className="text-red-500 mb-6" />
//             <h2 className="text-2xl font-bold text-gray-800 mb-3">Access Restricted</h2>
//             <p className="text-gray-600 max-w-md">
//               Your account ({normalizedUserType}) does not have permission to access any modules.<br/>
//               Please contact administrator.
//             </p>
//           </div>
//         ) : (
//           <>
//             {/* Tabs */}
//             <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 mb-8 sticky top-4 z-40">
//               <div className="flex overflow-x-auto gap-2 py-1 no-scrollbar">
//                 {allowedModules.map((module) => {
//                   const isActive = activeTab === module.id;
//                   return (
//                     <button
//                       key={module.id}
//                       onClick={() => handleTabChange(module.id)}
//                       className={`
//                         flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 min-w-[100px]
//                         ${isActive 
//                           ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30 ring-1 ring-cyan-700/20' 
//                           : 'text-gray-700 hover:bg-gray-100 hover:text-cyan-700'
//                         }
//                       `}
//                     >
//                       <module.icon 
//                         size={18} 
//                         className={isActive ? 'text-white' : 'text-cyan-600'}
//                       />
//                       <span>{module.label}</span>
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Content Area */}
//             <div className="bg-white rounded-2xl shadow-xl border border-gray-100 min-h-[70vh]">
//               <div className="p-6 md:p-10">
//                 {activeTab === 'overview' && (
//                   <div className="space-y-8">
//                     <h2 className="text-3xl font-bold text-gray-800">
//                       Welcome, <span className="text-blue-700 capitalize">{normalizedUserType}</span>!
//                     </h2>

//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                       {allowedModules
//                         .filter(m => m.id !== 'overview')
//                         .map(m => (
//                           <div
//                             key={m.id}
//                             onClick={() => handleTabChange(m.id)}
//                             className="group p-6 rounded-xl border hover:border-cyan-200 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all cursor-pointer"
//                           >
//                             <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${m.color}-100 to-${m.color}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
//                               <m.icon className={`text-${m.color}-600`} size={24} />
//                             </div>
//                             <h4 className="font-semibold text-gray-800">{m.label}</h4>
//                             <p className="text-sm text-gray-500 mt-1">Manage & Monitor</p>
//                           </div>
//                         ))}
//                     </div>
//                   </div>
//                 )}

//                 {activeTab === 'curing' && <Curing />}
//                 {activeTab === 'casting' && <Casting />}
//                 {activeTab === 'waterproofing' && <Waterproofing />}
//                 {activeTab === 'BrickWork' && <BrickWork />}
//                 {activeTab === 'ElectricalWork' && <ElectricalWork />}

//                 {/* Coming soon for unimplemented modules */}
//                 {!implementedModules.includes(activeTab) && activeTab !== 'overview' && (
//                   <div className="flex flex-col items-center justify-center py-20 text-gray-500">
//                     <Hammer size={64} className="mb-6 opacity-70" />
//                     <h3 className="text-2xl font-semibold text-gray-700 mb-2">
//                       {MODULE_CONFIG.find(m => m.id === activeTab)?.label || activeTab}
//                     </h3>
//                     <p>Module coming soon...</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </>
//         )}
//       </main>

//       <style jsx global>{`
//         .no-scrollbar::-webkit-scrollbar { display: none; }
//         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//       `}</style>
//     </div>
//   );
// };

// export default Dashboard;





import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import {
  LayoutDashboard, Droplets, Hammer, ShieldCheck,
  Pickaxe, Landmark, Lock, LogOut, Users, HardHat, Clock, DollarSign,
} from 'lucide-react';

// Existing components
import Curing from '../components/Curing/Curing';
import Casting from '../components/Casting/Casting';
import Waterproofing from '../components/WaterProofing/waterproofing';
import BrickWork from '../components/Brickswork/BrickWork';
import ElectricalWork from '../components/Electrical/ElectricalWork';

// Labour sub-components (create these files!)
import LabourAttendance from '../components/LabourForm/Attendance';


import { logout } from '../../src/features/Auth/AuthSlice'; // adjust path if needed

const ROLE_PERMISSIONS = {
  ADMIN: [
    'overview', 'curing', 'casting', 'waterproofing', 'BrickWork', 'ElectricalWork', 'LabourAttendance'
  ],
  AHUJA:       ['overview', 'curing', 'casting', 'labour'],
  ABBOTT:      ['overview', 'curing', 'casting'],
  RANA:        ['overview', 'curing', 'casting'],
  RNTU:        ['overview', 'curing', 'casting'],
  SCOPE:       ['overview', 'curing', 'casting'],
  NEWSCOPE:    ['overview', 'curing', 'casting'],
  GUPTA_JI_C:  ['overview', 'curing', 'casting'],
  GUPTA_JI_B:  ['overview', 'curing', 'casting'],
  GUPTA_JI_D:  ['overview', 'curing', 'casting'],
  Scope_Adjusting: ['overview', 'curing', 'casting'],
  // Add 'labour' to other roles if needed
};

const DEFAULT_PERMISSIONS = ['overview'];

const MODULE_CONFIG = [
  { id: 'overview',       label: 'Overview',       icon: LayoutDashboard, color: 'blue'    },
  { id: 'curing',         label: 'Curing',         icon: Droplets,        color: 'cyan'    },
  { id: 'casting',        label: 'Casting',        icon: Hammer,          color: 'indigo'  },
  { id: 'waterproofing',  label: 'Waterproofing',  icon: ShieldCheck,     color: 'teal'    },
  { id: 'BrickWork',      label: 'Brick Work',     icon: Pickaxe,         color: 'amber'   },
  { id: 'ElectricalWork', label: 'Electrical',     icon: Landmark,        color: 'violet'  },
  { id: 'labour',         label: 'Labour',         icon: Users,           color: 'orange'  },
];

const LABOUR_SUB_MODULES = [
  { id: 'LabourAttendance', label: 'LabourAttendance', icon: Clock,     component: LabourAttendance },

  // Add more sub-modules later if needed
];

const Dashboard = () => {
  const dispatch = useDispatch();
  const { userType: rawUserType, token } = useSelector((state) => state.auth);

  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab') || 'overview';
  const urlSub = searchParams.get('sub') || null;

  // Normalize user type
  const normalizedUserType = (rawUserType || '').trim().toUpperCase().replace(/\s+/g, '');

  // Allowed main modules
  const allowedModules = useMemo(() => {
    if (normalizedUserType === 'ADMIN') {
      return MODULE_CONFIG;
    }
    const perms = ROLE_PERMISSIONS[normalizedUserType] || DEFAULT_PERMISSIONS;
    return MODULE_CONFIG.filter(m => perms.includes(m.id));
  }, [normalizedUserType]);

  // Active main tab
  const getInitialTab = () => {
    if (allowedModules.some(m => m.id === urlTab)) return urlTab;
    return allowedModules[0]?.id || 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  const handleTabChange = (newTab) => {
    if (!allowedModules.some(m => m.id === newTab)) return;
    setActiveTab(newTab);
    setSearchParams({ tab: newTab }, { replace: true });
  };

  // Labour sub-tab logic
  const isLabourTab = activeTab === 'labour';

  const [activeSub, setActiveSub] = useState(null);

  useEffect(() => {
    if (isLabourTab) {
      const validSubs = LABOUR_SUB_MODULES.map(s => s.id);
      const initialSub = urlSub && validSubs.includes(urlSub) ? urlSub : LABOUR_SUB_MODULES[0]?.id || null;
      setActiveSub(initialSub);
    } else {
      setActiveSub(null);
    }
  }, [isLabourTab, urlSub]);

  const handleSubChange = (newSub) => {
    if (!LABOUR_SUB_MODULES.some(s => s.id === newSub)) return;
    setActiveSub(newSub);
    setSearchParams({ tab: 'labour', sub: newSub }, { replace: true });
  };

  // Protect if permissions change
  useEffect(() => {
    if (!allowedModules.some(m => m.id === activeTab)) {
      handleTabChange(allowedModules[0]?.id || 'overview');
    }
  }, [allowedModules]);

  const handleLogout = () => {
    dispatch(logout());
    setTimeout(() => window.location.href = '/', 300);
  };

  if (!token) {
    window.location.href = '/';
    return null;
  }

  const hasAccess = allowedModules.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
                <img src="/rcc-logo.png" alt="RCC" className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">RCC Infra</h1>
                <p className="text-xs text-gray-500 -mt-1">Construction Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="hidden sm:block text-right">
                <p className="font-medium capitalize">{normalizedUserType || 'User'}</p>
                <div className="flex items-center gap-1.5 justify-end">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-600">Online</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {!hasAccess ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <Lock size={64} className="text-red-500 mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Access Restricted</h2>
            <p className="text-gray-600 max-w-md">
              Your account ({normalizedUserType}) does not have permission to access any modules.<br />
              Please contact administrator.
            </p>
          </div>
        ) : (
          <>
            {/* Main Tabs */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 mb-6 sticky top-[4.5rem] z-40">
              <div className="flex overflow-x-auto gap-2 py-1 no-scrollbar">
                {allowedModules.map((module) => {
                  const isActive = activeTab === module.id;
                  return (
                    <button
                      key={module.id}
                      onClick={() => handleTabChange(module.id)}
                      className={`
                        flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 min-w-[100px]
                        ${isActive
                          ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30 ring-1 ring-cyan-700/20'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-cyan-700'
                        }
                      `}
                    >
                      <module.icon 
                        size={18} 
                        className={isActive ? 'text-white' : 'text-cyan-600'}
                      />
                      <span>{module.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          

            {/* Content Area */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 min-h-[70vh]">
              <div className="p-6 md:p-10">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <h2 className="text-3xl font-bold text-gray-800">
                      Welcome, <span className="text-blue-700 capitalize">{normalizedUserType}</span>!
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {allowedModules
                        .filter(m => m.id !== 'overview')
                        .map(m => (
                          <div
                            key={m.id}
                            onClick={() => handleTabChange(m.id)}
                            className="group p-6 rounded-xl border hover:border-cyan-200 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all cursor-pointer"
                          >
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${m.color}-100 to-${m.color}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                              <m.icon className={`text-${m.color}-600`} size={24} />
                            </div>
                            <h4 className="font-semibold text-gray-800">{m.label}</h4>
                            <p className="text-sm text-gray-500 mt-1">Manage & Monitor</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {activeTab === 'curing'        && <Curing />}
                {activeTab === 'casting'       && <Casting />}
                {activeTab === 'waterproofing' && <Waterproofing />}
                {activeTab === 'BrickWork'     && <BrickWork />}
                {activeTab === 'ElectricalWork'&& <ElectricalWork />}

                {/* Labour Content */}
                {isLabourTab && (
                  <>
                    {activeSub === 'LabourAttendance' && <LabourAttendance />}
                   

                    {!activeSub && LABOUR_SUB_MODULES.length > 0 && (
                      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <Users size={64} className="mb-6 opacity-70" />
                        <h3 className="text-2xl font-semibold text-gray-700 mb-2">Select a Labour Module</h3>
                        <p>Choose from Attendance, Advances, or Payments</p>
                      </div>
                    )}
                  </>
                )}

                {/* Unknown / future module */}
                {activeTab !== 'overview' &&
                 !['curing','casting','waterproofing','BrickWork','ElectricalWork','labour'].includes(activeTab) && (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <Hammer size={64} className="mb-6 opacity-70" />
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                      {MODULE_CONFIG.find(m => m.id === activeTab)?.label || activeTab}
                    </h3>
                    <p>Module coming soon...</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Dashboard;