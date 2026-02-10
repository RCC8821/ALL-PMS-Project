
// import React, { useState, useRef, useEffect } from 'react';
// import { Camera, Plus, Trash2, X, BarChart3, LogIn, LogOut, RotateCw } from 'lucide-react';

// // Import RTK Query hooks
// import {
//   useGetLabourDropdownDataQuery,
//   useSubmitLabourInEntriesMutation,
//   useSubmitLabourOutEntriesMutation,
// } from '../../features/Labour/AttendanceSlice';

// const AttendanceForm = () => {
//   const [currentScreen, setCurrentScreen] = useState('dashboard');
//   const [selectedSite, setSelectedSite] = useState('');
//   const [selectedLaborType, setSelectedLaborType] = useState('');
//   const [laborers, setLaborers] = useState([]);
//   const [photo, setPhoto] = useState(null);
//   const [showCamera, setShowCamera] = useState(false);
//   const [stream, setStream] = useState(null);
//   const [facingMode, setFacingMode] = useState('user');

//   // OUT Form specific state
//   const [outLaborers, setOutLaborers] = useState([]);
  
//   // Get current date dynamically
//   const getCurrentDate = () => new Date().toISOString().split('T')[0];

//   // Helper functions for localStorage
//   const getInLaborersFromStorage = () => {
//     try {
//       const stored = localStorage.getItem(`inLaborers_${getCurrentDate()}`);
//       return stored ? JSON.parse(stored) : {};
//     } catch (e) {
//       console.error('Error reading from localStorage:', e);
//       return {};
//     }
//   };

//   const saveInLaborerToStorage = (name, data) => {
//     try {
//       const key = `inLaborers_${getCurrentDate()}`;
//       const existing = getInLaborersFromStorage();
//       const updated = {
//         ...existing,
//         [name]: data
//       };
//       localStorage.setItem(key, JSON.stringify(updated));
//       console.log('Saved to localStorage:', key, updated);
//     } catch (e) {
//       console.error('Error saving to localStorage:', e);
//     }
//   };

//   const getInLaborerFromStorage = (name) => {
//     try {
//       const data = getInLaborersFromStorage();
//       return data[name] || null;
//     } catch (e) {
//       console.error('Error getting from localStorage:', e);
//       return null;
//     }
//   };

//   const [newLaborer, setNewLaborer] = useState({
//     name: '',
//     designation: '',
//     category: '',
//     code: '',
//     contractorName: '',
//     shift: '',
//     dayType: '',
//     workDescription: '',
//     head: '',
//     companyPayment: '',
//     contractorDebitPayment: '',
//     amount: '',
//   });

//   // OUT Form state
//   const [newOutLaborer, setNewOutLaborer] = useState({
//     name: '',
//     siteName: '',
//     category: '',
//     inTime: '',
//     outTime: '',
//     photo: '',
//   });
//   const [outNameSearch, setOutNameSearch] = useState(''); // For searchable dropdown

//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);

//   const {
//     data: dropdownData = {},
//     isLoading: dropdownLoading,
//   } = useGetLabourDropdownDataQuery();

//   const [submitIn, { isLoading: inSubmitting }] = useSubmitLabourInEntriesMutation();
//   const [submitOut, { isLoading: outSubmitting }] = useSubmitLabourOutEntriesMutation();

//   const {
//     siteNames = [],
//     laborTypes = [],
//     categories = [],
//     contractorNames = [],
//     employeeNames = [],
//   } = dropdownData;

//   const shiftOptions = [
//     "6:00 AM - 1:00 PM",
//     "2:00 PM - 9:00 PM",
//     "9:00 AM - 5:00 PM"
//   ];

//   const dayTypeOptions = ["Half Day", "Full Day"];

//   // Column configuration for different labor types
//   const columnConfig = {
//     'Contractor Labour': {
//       name: true,
//       designation: false,
//       category: true,
//       code: true,
//       photo: true,
//       inTime: true,
//       shift: true,
//       dayType: true,
//       workDescription: false,
//       head: false,
//       contractorName: true,
//       companyPayment: false,
//       contractorDebitPayment: false,
//       amount: false,
//     },
//     'Outsource Labor': {
//       name: true,
//       designation: false,
//       category: true,
//       code: true,
//       photo: true,
//       inTime: true,
//       shift: true,
//       dayType: true,
//       workDescription: true,
//       head: true,
//       contractorName: false,
//       companyPayment: false,
//       contractorDebitPayment: false,
//       amount: false,
//     },
//     'Company Staff': {
//       name: true,
//       designation: true,
//       category: true,
//       code: true,
//       photo: true,
//       inTime: true,
//       shift: false,
//       dayType: false,
//       workDescription: false,
//       head: false,
//       contractorName: false,
//       companyPayment: false,
//       contractorDebitPayment: false,
//       amount: false,
//     },
//     'Contractor Staff': {
//       name: true,
//       designation: true,
//       category: true,
//       code: true,
//       photo: true,
//       inTime: true,
//       shift: false,
//       dayType: false,
//       workDescription: false,
//       head: false,
//       contractorName: true,
//       companyPayment: false,
//       contractorDebitPayment: false,
//       amount: false,
//     },
//   };

//   const normalizeLaborType = (type) => {
//     if (type === 'Contractor Labour') return 'Contractor Labour';
//     if (type === 'Outsource Labour') return 'Outsource Labor';
//     return type;
//   };

//   const getFieldsConfig = () => {
//     const normalizedType = normalizeLaborType(selectedLaborType);
//     const baseConfig = columnConfig[normalizedType] || {};

//     if (normalizedType === 'Outsource Labor') {
//       const isCompanyHead = newLaborer.head === 'Company Head';
//       const isContractorHead = newLaborer.head === 'Contractor Head';

//       return {
//         ...baseConfig,
//         contractorName: isContractorHead,
//         companyPayment: isContractorHead,
//         contractorDebitPayment: isContractorHead,
//         amount: isCompanyHead,
//       };
//     }

//     return baseConfig;
//   };

//   const fieldsConfig = getFieldsConfig();

//   const startCamera = async (mode = 'user') => {
//     try {
//       if (stream) {
//         stream.getTracks().forEach(track => track.stop());
//       }

//       const constraints = {
//         video: {
//           facingMode: mode,
//           width: { ideal: 1280 },
//           height: { ideal: 720 }
//         },
//         audio: false
//       };

//       const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
//       setStream(mediaStream);
//       setFacingMode(mode);
      
//       if (videoRef.current) {
//         videoRef.current.srcObject = mediaStream;
//         videoRef.current.onloadedmetadata = () => {
//           videoRef.current.play().catch(err => {
//             console.error('Play error:', err);
//           });
//         };
//       }
      
//       setShowCamera(true);
//     } catch (err) {
//       console.error('Camera error:', err);
//       alert('कैमरा एक्सेस नहीं हो पाया / Camera access failed. Please allow camera permission.');
//     }
//   };

//   const stopCamera = () => {
//     if (stream) {
//       stream.getTracks().forEach(track => track.stop());
//       setStream(null);
//     }
//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//     }
//     setShowCamera(false);
//   };

//   const toggleCamera = () => {
//     const newMode = facingMode === 'user' ? 'environment' : 'user';
//     startCamera(newMode);
//   };

//   const capturePhoto = () => {
//     if (videoRef.current && canvasRef.current) {
//       const video = videoRef.current;
//       const canvas = canvasRef.current;
      
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
      
//       const ctx = canvas.getContext('2d');
//       ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
//       const imageSrc = canvas.toDataURL('image/jpeg', 0.8);
//       setPhoto(imageSrc);
//       stopCamera();
//     }
//   };

//   useEffect(() => {
//     return () => {
//       stopCamera();
//     };
//   }, []);

//   const handleNameChange = (selectedName) => {
//     setNewLaborer(prev => ({ ...prev, name: selectedName }));
    
//     const employee = employeeNames.find(emp => emp.name === selectedName);
//     if (employee && employee.id) {
//       setNewLaborer(prev => ({ ...prev, code: employee.id }));
//     }
//   };

//   // OUT Form: Handle Name selection and fetch IN data for current date from localStorage
//   const handleOutNameChange = (selectedName) => {
//     setNewOutLaborer(prev => ({ ...prev, name: selectedName }));
//     setOutNameSearch(selectedName);
    
//     // Fetch IN data from localStorage for today
//     console.log('Fetching data for:', selectedName, 'Date:', getCurrentDate());
//     const inData = getInLaborerFromStorage(selectedName);
//     console.log('Retrieved data:', inData);
    
//     if (inData) {
//       const currentTime = new Date().toLocaleTimeString('en-IN', { hour12: false });
//       setNewOutLaborer(prev => ({
//         ...prev,
//         siteName: inData.siteName || '',
//         category: inData.category || '',
//         inTime: inData.inTime || '',
//         outTime: currentTime,
//       }));
//     } else {
//       const currentTime = new Date().toLocaleTimeString('en-IN', { hour12: false });
//       setNewOutLaborer(prev => ({
//         ...prev,
//         siteName: '',
//         category: '',
//         inTime: '',
//         outTime: currentTime,
//       }));
//       alert('⚠️ No IN record found for today for: ' + selectedName);
//     }
//   };

//   // Filter names based on search input
//   const filteredEmployeeNames = employeeNames.filter(emp =>
//     emp.name.toLowerCase().includes(outNameSearch.toLowerCase())
//   );

//   const addLaborer = () => {
//     if (!newLaborer.name.trim()) {
//       alert('नाम दर्ज करें / Enter name');
//       return;
//     }
    
//     // Photo is required for IN form
//     if (!photo) {
//       alert('📸 फोटो लेना अनिवार्य है / Photo is required');
//       return;
//     }

//     const laborerEntry = {
//       name: newLaborer.name.trim(),
//       designation: newLaborer.designation || '',
//       category: newLaborer.category || '',
//       code: newLaborer.code || '',
//       contractorName: newLaborer.contractorName || '',
//       photoBase64: photo || '',
//       inTime: new Date().toLocaleTimeString('en-IN', { hour12: false }),
//       siteName: selectedSite,
//       shift: newLaborer.shift || '',
//       dayType: newLaborer.dayType || '',
//       workDescription: newLaborer.workDescription || '',
//       head: newLaborer.head || '',
//       companyPayment: newLaborer.companyPayment || '',
//       contractorDebitPayment: newLaborer.contractorDebitPayment || '',
//       amount: newLaborer.amount || '',
//     };

//     setLaborers([...laborers, laborerEntry]);
    
//     // Save IN data to localStorage for OUT form to retrieve
//     saveInLaborerToStorage(newLaborer.name, {
//       siteName: selectedSite,
//       category: newLaborer.category,
//       inTime: laborerEntry.inTime,
//     });

//     resetNewLaborer();
//   };

//   const resetNewLaborer = () => {
//     setNewLaborer({
//       name: '',
//       designation: '',
//       category: '',
//       code: '',
//       contractorName: '',
//       shift: '',
//       dayType: '',
//       workDescription: '',
//       head: '',
//       companyPayment: '',
//       contractorDebitPayment: '',
//       amount: '',
//     });
//     setPhoto(null);
//   };

//   const deleteLaborer = (index) => {
//     setLaborers(laborers.filter((_, i) => i !== index));
//   };

//   const deleteOutLaborer = (index) => {
//     setOutLaborers(outLaborers.filter((_, i) => i !== index));
//   };

//   const addOutLaborer = () => {
//     if (!newOutLaborer.name.trim()) {
//       alert('नाम दर्ज करें / Enter name');
//       return;
//     }
//     if (!newOutLaborer.outTime.trim()) {
//       alert('आउट टाइम दर्ज करें / Enter out time');
//       return;
//     }

//     const outLaborerEntry = {
//       name: newOutLaborer.name.trim(),
//       siteName: newOutLaborer.siteName || '',
//       category: newOutLaborer.category || '',
//       inTime: newOutLaborer.inTime || '',
//       outTime: newOutLaborer.outTime || '',
//       photo: newOutLaborer.photo || '',
//     };

//     setOutLaborers([...outLaborers, outLaborerEntry]);
//     resetNewOutLaborer();
//   };

//   const resetNewOutLaborer = () => {
//     const currentTime = new Date().toLocaleTimeString('en-IN', { hour12: false });
//     setNewOutLaborer({
//       name: '',
//       siteName: '',
//       category: '',
//       inTime: '',
//       outTime: currentTime,
//       photo: '',
//     });
//     setOutNameSearch('');
//     setPhoto(null);
//   };

//   const handleSubmit = async (type) => {
//     const laborData = type === 'in' ? laborers : outLaborers;

//     if (!selectedSite && type === 'in') {
//       alert('साइट चुनें / Select site');
//       return;
//     }
//     if (!selectedLaborType && type === 'in') {
//       alert('श्रम प्रकार चुनें / Select labor type');
//       return;
//     }
//     if (laborData.length === 0) {
//       alert('कम से कम एक श्रमिक जोड़ें / Add at least one laborer');
//       return;
//     }

//     const submitFn = type === 'in' ? submitIn : submitOut;

//     const payload = {
//       submitDate: new Date().toISOString().split('T')[0],
//       submitTime: new Date().toLocaleTimeString('en-IN', { hour12: false }),
//       siteName: type === 'in' ? selectedSite : '',
//       laborType: type === 'in' ? normalizeLaborType(selectedLaborType) : 'Checkout',
//       entries: laborData,
//     };

//     try {
//       const result = await submitFn(payload).unwrap();
//       alert(result.message || `${type.toUpperCase()} सफलतापूर्वक दर्ज किया गया!`);
      
//       if (type === 'in') {
//         setLaborers([]);
//         setSelectedSite('');
//         setSelectedLaborType('');
//       } else {
//         setOutLaborers([]);
//       }
//       resetNewLaborer();
//       setCurrentScreen('dashboard');
//     } catch (err) {
//       console.error('Submit error:', err);
//       alert(err?.data?.message || 'सबमिट करने में त्रुटि / Submission failed');
//     }
//   };

//   const handleBack = () => {
//     setCurrentScreen('dashboard');
//     setSelectedSite('');
//     setSelectedLaborType('');
//     setLaborers([]);
//     setOutLaborers([]);
//     resetNewLaborer();
//     resetNewOutLaborer();
//     stopCamera();
//   };

//   // ────────────────────────────────────────────────
//   // DASHBOARD SCREEN
//   // ────────────────────────────────────────────────
//   if (currentScreen === 'dashboard') {
//     return (
//       <div className="min-h-screen bg-gray-50 py-8 px-4">
//         <div className="max-w-7xl mx-auto">
//           <h1 className="text-4xl font-bold text-center mb-2">Labour Attendance</h1>
//           <p className="text-center text-gray-600 mb-12">श्रमिक उपस्थिति प्रबंधन</p>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
//             <button
//               onClick={() => setCurrentScreen('inForm')}
//               className="p-10 bg-gradient-to-br from-green-500 to-green-700 text-white rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all flex flex-col items-center gap-4"
//             >
//               <LogIn size={48} />
//               <span className="text-2xl font-bold">IN Form</span>
//               <span className="text-sm opacity-90">चेक-इन</span>
//             </button>

//             <button
//               onClick={() => setCurrentScreen('outForm')}
//               className="p-10 bg-gradient-to-br from-red-500 to-red-700 text-white rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all flex flex-col items-center gap-4"
//             >
//               <LogOut size={48} />
//               <span className="text-2xl font-bold">OUT Form</span>
//               <span className="text-sm opacity-90">चेक-आउट</span>
//             </button>

//             <button
//               onClick={() => setCurrentScreen('addName')}
//               className="p-10 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all flex flex-col items-center gap-4"
//             >
//               <Plus size={48} />
//               <span className="text-2xl font-bold">Add Name</span>
//               <span className="text-sm opacity-90">नया नाम जोड़ें</span>
//             </button>

//             <button
//               onClick={() => setCurrentScreen('lmsDashboard')}
//               className="p-10 bg-gradient-to-br from-orange-500 to-orange-700 text-white rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all flex flex-col items-center gap-4"
//             >
//               <BarChart3 size={48} />
//               <span className="text-2xl font-bold">Dashboard</span>
//               <span className="text-sm opacity-90">विश्लेषण</span>
//             </button>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="bg-white p-6 rounded-xl shadow border text-center">
//               <div className="text-5xl mb-2">🏗️</div>
//               <p className="text-gray-600">Sites</p>
//               <p className="text-4xl font-bold text-blue-700">{siteNames.length}</p>
//             </div>
//             <div className="bg-white p-6 rounded-xl shadow border text-center">
//               <div className="text-5xl mb-2">👷</div>
//               <p className="text-gray-600">Labor Types</p>
//               <p className="text-4xl font-bold text-green-700">{laborTypes.length}</p>
//             </div>
//             <div className="bg-white p-6 rounded-xl shadow border text-center">
//               <div className="text-5xl mb-2">📅</div>
//               <p className="text-gray-600">Today</p>
//               <p className="text-3xl font-bold">{new Date().toLocaleDateString('en-IN')}</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ────────────────────────────────────────────────
//   // IN FORM SCREEN
//   // ────────────────────────────────────────────────
//   if (currentScreen === 'inForm') {
//     const isIn = true;
//     const normalizedType = normalizeLaborType(selectedLaborType);
//     const codeLabel = (normalizedType === 'Contractor Labour' || normalizedType === 'Outsource Labor') 
//       ? 'Labor Code' 
//       : 'Employee Code';

//     return (
//       <div className="min-h-screen bg-gray-50 py-8 px-4">
//         <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
//           <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
//             <div className="flex justify-between items-center">
//               <div>
//                 <h1 className="text-3xl font-bold">IN Form - चेक-इन</h1>
//                 <p className="mt-1 opacity-90">Labour Attendance Entry</p>
//               </div>
//               <button
//                 onClick={() => handleBack()}
//                 className="bg-white/20 hover:bg-white/30 px-5 py-2 rounded-lg flex items-center gap-2 transition"
//               >
//                 <X size={20} /> Back
//               </button>
//             </div>
//           </div>

//           <div className="p-6 md:p-10">
//             {/* Site & Labor Type */}
//             <div className="grid md:grid-cols-2 gap-6 mb-10">
//               <div>
//                 <label className="block text-lg font-semibold mb-2">Site Name / साइट *</label>
//                 {dropdownLoading ? (
//                   <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
//                 ) : (
//                   <select
//                     value={selectedSite}
//                     onChange={(e) => setSelectedSite(e.target.value)}
//                     className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                   >
//                     <option value="">-- Select Site --</option>
//                     {siteNames.map((site, i) => (
//                       <option key={i} value={site}>{site}</option>
//                     ))}
//                   </select>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-lg font-semibold mb-2">Labor Type / श्रम प्रकार *</label>
//                 {dropdownLoading ? (
//                   <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
//                 ) : (
//                   <select
//                     value={selectedLaborType}
//                     onChange={(e) => {
//                       setSelectedLaborType(e.target.value);
//                       resetNewLaborer();
//                     }}
//                     className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                   >
//                     <option value="">-- Select Type --</option>
//                     {laborTypes.map((type, i) => (
//                       <option key={i} value={type}>{type}</option>
//                     ))}
//                   </select>
//                 )}
//               </div>
//             </div>

//             {/* Add Laborer Form */}
//             {selectedLaborType && (
//               <div className="border border-gray-200 rounded-xl p-6 md:p-8 mb-10 bg-gray-50">
//                 <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
//                   <Plus className="text-blue-600" size={28} />
//                   Add Laborer / श्रमिक जोड़ें
//                 </h2>

//                 <div className="space-y-6">
//                   {/* Row 1: Name, Designation (text input), Category, Code */}
//                   <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//                     {fieldsConfig.name && (
//                       <div>
//                         <label className="block font-medium mb-2">👤 Name / नाम *</label>
//                         <select
//                           value={newLaborer.name}
//                           onChange={(e) => handleNameChange(e.target.value)}
//                           className="w-full p-3 border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                           required
//                         >
//                           <option value="">Select Name</option>
//                           {employeeNames.map((emp, i) => (
//                             <option key={i} value={emp.name}>{emp.name}</option>
//                           ))}
//                         </select>
//                       </div>
//                     )}

//                     {fieldsConfig.designation && (
//                       <div>
//                         <label className="block font-medium mb-2">💼 Designation / पदनाम *</label>
//                         <input
//                           type="text"
//                           value={newLaborer.designation}
//                           onChange={(e) => setNewLaborer({ ...newLaborer, designation: e.target.value })}
//                           className="w-full p-3 border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                           placeholder="Enter designation (e.g. Supervisor, Engineer)"
//                           required
//                         />
//                       </div>
//                     )}

//                     {fieldsConfig.category && (
//                       <div>
//                         <label className="block font-medium mb-2">📂 Category / श्रेणी</label>
//                         <input
//                           type="text"
//                           list="categoriesList"
//                           value={newLaborer.category}
//                           onChange={(e) => setNewLaborer({ ...newLaborer, category: e.target.value })}
//                           className="w-full p-3 border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                           placeholder="Search or enter category..."
//                         />
//                         <datalist id="categoriesList">
//                           {categories.map((cat, i) => (
//                             <option key={i} value={cat} />
//                           ))}
//                         </datalist>
//                       </div>
//                     )}

//                     {fieldsConfig.code && (
//                       <div>
//                         <label className="block font-medium mb-2">🆔 {codeLabel}</label>
//                         <input
//                           type="text"
//                           value={newLaborer.code}
//                           readOnly
//                           className="w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed"
//                           placeholder="Auto-filled from name..."
//                         />
//                       </div>
//                     )}
//                   </div>

//                   {/* Row 2: Shift, Day Type, Head, Contractor Name */}
//                   <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//                     {fieldsConfig.shift && (
//                       <div>
//                         <label className="block font-medium mb-2">🕒 Shift / पाली *</label>
//                         <select
//                           value={newLaborer.shift}
//                           onChange={(e) => setNewLaborer({ ...newLaborer, shift: e.target.value })}
//                           className="w-full p-3 border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                           required
//                         >
//                           <option value="">Select Shift</option>
//                           {shiftOptions.map((shift, i) => (
//                             <option key={i} value={shift}>{shift}</option>
//                           ))}
//                         </select>
//                       </div>
//                     )}

//                     {fieldsConfig.dayType && (
//                       <div>
//                         <label className="block font-medium mb-2">📅 Day Type / दिन प्रकार *</label>
//                         <select
//                           value={newLaborer.dayType}
//                           onChange={(e) => setNewLaborer({ ...newLaborer, dayType: e.target.value })}
//                           className="w-full p-3 border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                           required
//                         >
//                           <option value="">Select Day Type</option>
//                           {dayTypeOptions.map((type, i) => (
//                             <option key={i} value={type}>{type}</option>
//                           ))}
//                         </select>
//                       </div>
//                     )}

//                     {fieldsConfig.head && (
//                       <div>
//                         <label className="block font-medium mb-2">👨‍💼 Head / विभाग *</label>
//                         <select
//                           value={newLaborer.head}
//                           onChange={(e) => {
//                             const value = e.target.value;
//                             setNewLaborer(prev => {
//                               let updates = { head: value };
//                               if (value === 'Company Head') {
//                                 updates = {
//                                   ...updates,
//                                   contractorName: '',
//                                   companyPayment: '',
//                                   contractorDebitPayment: '',
//                                 };
//                               } else if (value === 'Contractor Head') {
//                                 updates = {
//                                   ...updates,
//                                   amount: '',
//                                 };
//                               }
//                               return { ...prev, ...updates };
//                             });
//                           }}
//                           className="w-full p-3 border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                           required
//                         >
//                           <option value="">Select Head</option>
//                           <option value="Company Head">🏢 Company Head</option>
//                           <option value="Contractor Head">👷 Contractor Head</option>
//                         </select>
//                       </div>
//                     )}

//                     {fieldsConfig.contractorName && (
//                       <div>
//                         <label className="block font-medium mb-2">🏢 Contractor / ठेकेदार *</label>
//                         <select
//                           value={newLaborer.contractorName}
//                           onChange={(e) => setNewLaborer({ ...newLaborer, contractorName: e.target.value })}
//                           className="w-full p-3 border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                           required
//                         >
//                           <option value="">Select Contractor</option>
//                           {contractorNames.map((con, i) => (
//                             <option key={i} value={con}>{con}</option>
//                           ))}
//                         </select>
//                       </div>
//                     )}
//                   </div>

//                   {/* Row 3: Company Payment, Contractor Debit Payment, Amount */}
//                   <div className="grid md:grid-cols-3 gap-6">
//                     {fieldsConfig.companyPayment && (
//                       <div>
//                         <label className="block font-medium mb-2">💰 Company Payment *</label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           value={newLaborer.companyPayment}
//                           onChange={(e) => setNewLaborer({ ...newLaborer, companyPayment: e.target.value })}
//                           className="w-full p-3 border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                           placeholder="0.00"
//                           required
//                         />
//                       </div>
//                     )}

//                     {fieldsConfig.contractorDebitPayment && (
//                       <div>
//                         <label className="block font-medium mb-2">💸 Contractor Debit Payment *</label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           value={newLaborer.contractorDebitPayment}
//                           onChange={(e) => setNewLaborer({ ...newLaborer, contractorDebitPayment: e.target.value })}
//                           className="w-full p-3 border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                           placeholder="0.00"
//                           required
//                         />
//                       </div>
//                     )}

//                     {fieldsConfig.amount && (
//                       <div>
//                         <label className="block font-medium mb-2">💵 Amount / राशि *</label>
//                         <input
//                           type="number"
//                           step="0.01"
//                           value={newLaborer.amount}
//                           onChange={(e) => setNewLaborer({ ...newLaborer, amount: e.target.value })}
//                           className="w-full p-3 border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                           placeholder="₹ 0.00"
//                           required
//                         />
//                       </div>
//                     )}
//                   </div>

//                   {/* Work Description - Full width */}
//                   {fieldsConfig.workDescription && (
//                     <div>
//                       <label className="block font-medium mb-2">📝 Work Description / कार्य विवरण *</label>
//                       <textarea
//                         value={newLaborer.workDescription}
//                         onChange={(e) => setNewLaborer({ ...newLaborer, workDescription: e.target.value })}
//                         className="w-full p-3 border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                         rows="3"
//                         placeholder="Describe the work..."
//                         required
//                       />
//                     </div>
//                   )}

//                   {/* Camera Section */}
//                   {fieldsConfig.photo && (
//                     <div>
//                       <label className="block font-medium mb-3 text-lg">📸 Photo / फोटो</label>

//                       {showCamera ? (
//                         <div className="border-4 border-blue-500 rounded-xl overflow-hidden bg-black">
//                           <div className="relative">
//                             <video
//                               ref={videoRef}
//                               autoPlay
//                               playsInline
//                               muted
//                               className="w-full h-auto"
//                               style={{ maxHeight: '500px' }}
//                             />
//                             <canvas ref={canvasRef} style={{ display: 'none' }} />
//                           </div>
//                           <div className="p-4 bg-gray-800 flex gap-4">
//                             <button
//                               type="button"
//                               onClick={capturePhoto}
//                               className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
//                             >
//                               <Camera size={20} /> Capture
//                             </button>
//                             <button
//                               type="button"
//                               onClick={toggleCamera}
//                               className="bg-blue-600 text-white px-5 py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2"
//                             >
//                               <RotateCw size={20} />
//                               {facingMode === 'user' ? 'Back' : 'Front'}
//                             </button>
//                             <button
//                               type="button"
//                               onClick={stopCamera}
//                               className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-bold hover:bg-gray-700 transition"
//                             >
//                               Cancel
//                             </button>
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="flex flex-col sm:flex-row gap-4">
//                           <button
//                             type="button"
//                             onClick={() => startCamera('user')}
//                             className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
//                           >
//                             <Camera size={20} /> Open Camera
//                           </button>

//                           {photo && (
//                             <div className="relative flex-1 max-w-xs">
//                               <img
//                                 src={photo}
//                                 alt="Preview"
//                                 className="w-full h-48 object-cover rounded-lg border-4 border-blue-400"
//                               />
//                               <button
//                                 type="button"
//                                 onClick={() => setPhoto(null)}
//                                 className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition shadow-lg"
//                               >
//                                 <X size={16} />
//                               </button>
//                               <p className="text-center mt-2 text-sm text-green-600 font-medium">✓ Photo Captured</p>
//                             </div>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 <button
//                   type="button"
//                   onClick={addLaborer}
//                   className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition"
//                 >
//                   <Plus size={24} /> Add Laborer to List
//                 </button>
//               </div>
//             )}

//             {/* Added Laborers List */}
//             {laborers.length > 0 && (
//               <div className="mb-10">
//                 <h3 className="text-xl font-bold mb-4">
//                   Added Laborers ({laborers.length})
//                 </h3>
//                 <div className="overflow-x-auto border rounded-lg">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-100">
//                       <tr>
//                         <th className="px-4 py-3 text-left text-xs font-semibold">Name</th>
//                         {fieldsConfig.designation && <th className="px-4 py-3 text-left text-xs font-semibold">Designation</th>}
//                         {fieldsConfig.category && <th className="px-4 py-3 text-left text-xs font-semibold">Category</th>}
//                         {fieldsConfig.code && <th className="px-4 py-3 text-left text-xs font-semibold">{codeLabel}</th>}
//                         {fieldsConfig.photo && <th className="px-4 py-3 text-left text-xs font-semibold">Photo</th>}
//                         <th className="px-4 py-3 text-left text-xs font-semibold">In Time</th>
//                         {fieldsConfig.shift && <th className="px-4 py-3 text-left text-xs font-semibold">Shift</th>}
//                         {fieldsConfig.dayType && <th className="px-4 py-3 text-left text-xs font-semibold">Day Type</th>}
//                         {fieldsConfig.workDescription && <th className="px-4 py-3 text-left text-xs font-semibold">Work Description</th>}
//                         {fieldsConfig.head && <th className="px-4 py-3 text-left text-xs font-semibold">Head</th>}
//                         {fieldsConfig.contractorName && <th className="px-4 py-3 text-left text-xs font-semibold">Contractor</th>}
//                         {fieldsConfig.companyPayment && <th className="px-4 py-3 text-left text-xs font-semibold">Company Payment</th>}
//                         {fieldsConfig.contractorDebitPayment && <th className="px-4 py-3 text-left text-xs font-semibold">Contractor Debit</th>}
//                         {fieldsConfig.amount && <th className="px-4 py-3 text-left text-xs font-semibold">Amount</th>}
//                         <th className="px-4 py-3 text-center text-xs font-semibold">Action</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200 bg-white">
//                       {laborers.map((lab, index) => (
//                         <tr key={index} className="hover:bg-gray-50">
//                           <td className="px-4 py-3 text-sm">{lab.name}</td>
//                           {fieldsConfig.designation && <td className="px-4 py-3 text-sm">{lab.designation || '-'}</td>}
//                           {fieldsConfig.category && <td className="px-4 py-3 text-sm">{lab.category || '-'}</td>}
//                           {fieldsConfig.code && <td className="px-4 py-3 text-sm">{lab.code || '-'}</td>}
//                           {fieldsConfig.photo && (
//                             <td className="px-4 py-3">
//                               {lab.photoBase64 ? (
//                                 <img src={lab.photoBase64} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-gray-300" />
//                               ) : (
//                                 <span className="text-sm text-gray-400">-</span>
//                               )}
//                             </td>
//                           )}
//                           <td className="px-4 py-3 text-sm">{lab.inTime}</td>
//                           {fieldsConfig.shift && <td className="px-4 py-3 text-sm">{lab.shift || '-'}</td>}
//                           {fieldsConfig.dayType && <td className="px-4 py-3 text-sm">{lab.dayType || '-'}</td>}
//                           {fieldsConfig.workDescription && <td className="px-4 py-3 text-sm max-w-xs truncate">{lab.workDescription || '-'}</td>}
//                           {fieldsConfig.head && <td className="px-4 py-3 text-sm">{lab.head || '-'}</td>}
//                           {fieldsConfig.contractorName && <td className="px-4 py-3 text-sm">{lab.contractorName || '-'}</td>}
//                           {fieldsConfig.companyPayment && <td className="px-4 py-3 text-sm">₹{lab.companyPayment || '0'}</td>}
//                           {fieldsConfig.contractorDebitPayment && <td className="px-4 py-3 text-sm">₹{lab.contractorDebitPayment || '0'}</td>}
//                           {fieldsConfig.amount && <td className="px-4 py-3 text-sm">₹{lab.amount || '0'}</td>}
//                           <td className="px-4 py-3 text-center">
//                             <button
//                               type="button"
//                               onClick={() => deleteLaborer(index)}
//                               className="text-red-600 hover:text-red-800 transition"
//                             >
//                               <Trash2 size={18} />
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             {/* Submit Buttons */}
//             <div className="flex flex-col sm:flex-row gap-4">
//               <button
//                 type="button"
//                 onClick={() => handleSubmit('in')}
//                 disabled={inSubmitting || laborers.length === 0}
//                 className="flex-1 py-4 rounded-lg text-white font-bold text-lg flex items-center justify-center gap-2 transition bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {inSubmitting ? '⏳ Submitting...' : `🚀 Submit IN (${laborers.length})`}
//               </button>

//               <button
//                 type="button"
//                 onClick={handleBack}
//                 className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-4 rounded-lg font-bold transition"
//               >
//                 🔙 Back to Dashboard
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ────────────────────────────────────────────────
//   // OUT FORM SCREEN
//   // ────────────────────────────────────────────────
//   if (currentScreen === 'outForm') {
//     return (
//       <div className="min-h-screen bg-gray-50 py-8 px-4">
//         <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
//           <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 text-white">
//             <div className="flex justify-between items-center">
//               <div>
//                 <h1 className="text-3xl font-bold">OUT Form - चेक-आउट</h1>
//                 <p className="mt-1 opacity-90">Labour Checkout Entry</p>
//               </div>
//               <button
//                 onClick={() => handleBack()}
//                 className="bg-white/20 hover:bg-white/30 px-5 py-2 rounded-lg flex items-center gap-2 transition"
//               >
//                 <X size={20} /> Back
//               </button>
//             </div>
//           </div>

//           <div className="p-6 md:p-10">
//             {/* Add Out Laborer Form */}
//             <div className="border border-gray-200 rounded-xl p-6 md:p-8 mb-10 bg-gray-50">
//               <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
//                 <Plus className="text-red-600" size={28} />
//                 Record Checkout / चेक-आउट दर्ज करें
//               </h2>

//               <div className="space-y-6">
//                 {/* Row 1: Name (searchable), Site Name, Category, In Time */}
//                 <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//                   <div className="relative">
//                     <label className="block font-medium mb-2">👤 Name / नाम *</label>
//                     <input
//                       type="text"
//                       value={outNameSearch}
//                       onChange={(e) => setOutNameSearch(e.target.value)}
//                       placeholder="Type name..."
//                       className="w-full p-3 border rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200"
//                       autoComplete="off"
//                     />
//                     {outNameSearch && filteredEmployeeNames.length > 0 && (
//                       <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
//                         {filteredEmployeeNames.map((emp, i) => (
//                           <div
//                             key={i}
//                             onClick={() => handleOutNameChange(emp.name)}
//                             className="p-3 hover:bg-red-100 cursor-pointer border-b last:border-b-0"
//                           >
//                             {emp.name}
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block font-medium mb-2">🏗️ Site Name / साइट</label>
//                     <input
//                       type="text"
//                       value={newOutLaborer.siteName}
//                       readOnly
//                       className="w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed"
//                       placeholder="Auto-filled..."
//                     />
//                   </div>

//                   <div>
//                     <label className="block font-medium mb-2">📂 Category / श्रेणी</label>
//                     <input
//                       type="text"
//                       value={newOutLaborer.category}
//                       readOnly
//                       className="w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed"
//                       placeholder="Auto-filled..."
//                     />
//                   </div>

//                   <div>
//                     <label className="block font-medium mb-2">⏰ In Time / इन टाइम</label>
//                     <input
//                       type="text"
//                       value={newOutLaborer.inTime}
//                       readOnly
//                       className="w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed"
//                       placeholder="Auto-filled..."
//                     />
//                   </div>
//                 </div>

//                 {/* Row 2: Out Time */}
//                 <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block font-medium mb-2">⏰ Out Time / आउट टाइम *</label>
//                     <div className="flex gap-2">
//                       <input
//                         type="text"
//                         value={newOutLaborer.outTime}
//                         readOnly
//                         className="flex-1 p-3 border rounded-lg bg-gray-100 cursor-not-allowed text-lg font-semibold text-red-600"
//                         placeholder="Auto-set..."
//                       />
//                       <button
//                         type="button"
//                         onClick={() => {
//                           const currentTime = new Date().toLocaleTimeString('en-IN', { hour12: false });
//                           setNewOutLaborer({ ...newOutLaborer, outTime: currentTime });
//                         }}
//                         className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
//                       >
//                         🔄 Update
//                       </button>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Photo Section - Optional */}
//                 <div>
//                   <label className="block font-medium mb-3 text-lg">📸 Photo / फोटो (Optional)</label>

//                   {showCamera ? (
//                     <div className="border-4 border-red-500 rounded-xl overflow-hidden bg-black">
//                       <div className="relative">
//                         <video
//                           ref={videoRef}
//                           autoPlay
//                           playsInline
//                           muted
//                           className="w-full h-auto"
//                           style={{ maxHeight: '500px' }}
//                         />
//                         <canvas ref={canvasRef} style={{ display: 'none' }} />
//                       </div>
//                       <div className="p-4 bg-gray-800 flex gap-4">
//                         <button
//                           type="button"
//                           onClick={capturePhoto}
//                           className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
//                         >
//                           <Camera size={20} /> Capture
//                         </button>
//                         <button
//                           type="button"
//                           onClick={toggleCamera}
//                           className="bg-blue-600 text-white px-5 py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2"
//                         >
//                           <RotateCw size={20} />
//                           {facingMode === 'user' ? 'Back' : 'Front'}
//                         </button>
//                         <button
//                           type="button"
//                           onClick={stopCamera}
//                           className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-bold hover:bg-gray-700 transition"
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="flex flex-col sm:flex-row gap-4">
//                       <button
//                         type="button"
//                         onClick={() => startCamera('user')}
//                         className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
//                       >
//                         <Camera size={20} /> Open Camera
//                       </button>

//                       {photo && (
//                         <div className="relative flex-1 max-w-xs">
//                           <img
//                             src={photo}
//                             alt="Preview"
//                             className="w-full h-48 object-cover rounded-lg border-4 border-red-400"
//                           />
//                           <button
//                             type="button"
//                             onClick={() => setPhoto(null)}
//                             className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition shadow-lg"
//                           >
//                             <X size={16} />
//                           </button>
//                           <p className="text-center mt-2 text-sm text-green-600 font-medium">✓ Photo Captured</p>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={addOutLaborer}
//                 className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition"
//               >
//                 <Plus size={24} /> Add to Checkout List
//               </button>
//             </div>

//             {/* Out Laborers List */}
//             {outLaborers.length > 0 && (
//               <div className="mb-10">
//                 <h3 className="text-xl font-bold mb-4">
//                   Checkout Records ({outLaborers.length})
//                 </h3>
//                 <div className="overflow-x-auto border rounded-lg">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-100">
//                       <tr>
//                         <th className="px-4 py-3 text-left text-xs font-semibold">👤 Name</th>
//                         <th className="px-4 py-3 text-left text-xs font-semibold">🏗️ Site</th>
//                         <th className="px-4 py-3 text-left text-xs font-semibold">📂 Category</th>
//                         <th className="px-4 py-3 text-left text-xs font-semibold">⏰ In Time</th>
//                         <th className="px-4 py-3 text-left text-xs font-semibold">⏰ Out Time</th>
//                         <th className="px-4 py-3 text-left text-xs font-semibold">📸 Photo</th>
//                         <th className="px-4 py-3 text-center text-xs font-semibold">Action</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200 bg-white">
//                       {outLaborers.map((lab, index) => (
//                         <tr key={index} className="hover:bg-gray-50">
//                           <td className="px-4 py-3 text-sm font-medium">{lab.name}</td>
//                           <td className="px-4 py-3 text-sm">{lab.siteName || '-'}</td>
//                           <td className="px-4 py-3 text-sm">{lab.category || '-'}</td>
//                           <td className="px-4 py-3 text-sm">{lab.inTime || '-'}</td>
//                           <td className="px-4 py-3 text-sm font-bold text-red-600">{lab.outTime || '-'}</td>
//                           <td className="px-4 py-3">
//                             {lab.photo ? (
//                               <img src={lab.photo} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-gray-300" />
//                             ) : (
//                               <span className="text-sm text-gray-400">-</span>
//                             )}
//                           </td>
//                           <td className="px-4 py-3 text-center">
//                             <button
//                               type="button"
//                               onClick={() => deleteOutLaborer(index)}
//                               className="text-red-600 hover:text-red-800 transition"
//                             >
//                               <Trash2 size={18} />
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             {/* Submit Buttons */}
//             <div className="flex flex-col sm:flex-row gap-4">
//               <button
//                 type="button"
//                 onClick={() => handleSubmit('out')}
//                 disabled={outSubmitting || outLaborers.length === 0}
//                 className="flex-1 py-4 rounded-lg text-white font-bold text-lg flex items-center justify-center gap-2 transition bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {outSubmitting ? '⏳ Submitting...' : `🚀 Submit OUT (${outLaborers.length})`}
//               </button>

//               <button
//                 type="button"
//                 onClick={handleBack}
//                 className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-4 rounded-lg font-bold transition"
//               >
//                 🔙 Back to Dashboard
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Placeholder screens
//   if (currentScreen === 'addName' || currentScreen === 'lmsDashboard') {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center p-10 bg-white rounded-xl shadow-lg max-w-md">
//           <h2 className="text-3xl font-bold mb-4">
//             {currentScreen === 'addName' ? 'Add Name' : 'LMS Dashboard'}
//           </h2>
//           <p className="text-gray-600 mb-6">Feature under development...</p>
//           <button
//             onClick={handleBack}
//             className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
//           >
//             Back to Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return null;
// };

// export default AttendanceForm;





import React, { useState, useRef, useEffect } from 'react';
import { Camera, Plus, Trash2, X, BarChart3, LogIn, LogOut, RotateCw } from 'lucide-react';

// Import RTK Query hooks
import {
  useGetLabourDropdownDataQuery,
  useSubmitLabourInEntriesMutation,
  useSubmitLabourOutEntriesMutation,
} from '../../features/Labour/AttendanceSlice';

const AttendanceForm = () => {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedLaborType, setSelectedLaborType] = useState('');
  const [laborers, setLaborers] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('user');

  // OUT Form specific state
  const [outLaborers, setOutLaborers] = useState([]);
  
  // Get current date dynamically
  const getCurrentDate = () => new Date().toISOString().split('T')[0];

  // Helper functions for localStorage
  const getInLaborersFromStorage = () => {
    try {
      const stored = localStorage.getItem(`inLaborers_${getCurrentDate()}`);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return {};
    }
  };

  const saveInLaborerToStorage = (name, data) => {
    try {
      const key = `inLaborers_${getCurrentDate()}`;
      const existing = getInLaborersFromStorage();
      const updated = {
        ...existing,
        [name]: data
      };
      localStorage.setItem(key, JSON.stringify(updated));
      console.log('Saved to localStorage:', key, updated);
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  };

  const getInLaborerFromStorage = (name) => {
    try {
      const data = getInLaborersFromStorage();
      return data[name] || null;
    } catch (e) {
      console.error('Error getting from localStorage:', e);
      return null;
    }
  };

  const [newLaborer, setNewLaborer] = useState({
    name: '',
    designation: '',
    category: '',
    code: '',
    contractorName: '',
    shift: '',
    dayType: '',
    workDescription: '',
    head: '',
    companyPayment: '',
    contractorDebitPayment: '',
    amount: '',
  });

  // OUT Form state
  const [newOutLaborer, setNewOutLaborer] = useState({
    name: '',
    siteName: '',
    category: '',
    inTime: '',
    outTime: '',
    photo: '',
  });
  const [outNameSearch, setOutNameSearch] = useState(''); // For searchable dropdown

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const {
    data: dropdownData = {},
    isLoading: dropdownLoading,
  } = useGetLabourDropdownDataQuery();

  const [submitIn, { isLoading: inSubmitting }] = useSubmitLabourInEntriesMutation();
  const [submitOut, { isLoading: outSubmitting }] = useSubmitLabourOutEntriesMutation();

  const {
    siteNames = [],
    laborTypes = [],
    categories = [],
    contractorNames = [],
    employeeNames = [],
  } = dropdownData;

  const shiftOptions = [
    "6:00 AM - 1:00 PM",
    "2:00 PM - 9:00 PM",
    "9:00 AM - 5:00 PM"
  ];

  const dayTypeOptions = ["Half Day", "Full Day"];

  // Column configuration for different labor types
  const columnConfig = {
    'Contractor Labour': {
      name: true,
      designation: false,
      category: true,
      code: true,
      photo: true,
      inTime: true,
      shift: true,
      dayType: true,
      workDescription: false,
      head: false,
      contractorName: true,
      companyPayment: false,
      contractorDebitPayment: false,
      amount: false,
    },
    'Outsource Labor': {
      name: true,
      designation: false,
      category: true,
      code: true,
      photo: true,
      inTime: true,
      shift: true,
      dayType: true,
      workDescription: true,
      head: true,
      contractorName: false,
      companyPayment: false,
      contractorDebitPayment: false,
      amount: false,
    },
    'Company Staff': {
      name: true,
      designation: true,
      category: true,
      code: true,
      photo: true,
      inTime: true,
      shift: false,
      dayType: false,
      workDescription: false,
      head: false,
      contractorName: false,
      companyPayment: false,
      contractorDebitPayment: false,
      amount: false,
    },
    'Contractor Staff': {
      name: true,
      designation: true,
      category: true,
      code: true,
      photo: true,
      inTime: true,
      shift: false,
      dayType: false,
      workDescription: false,
      head: false,
      contractorName: true,
      companyPayment: false,
      contractorDebitPayment: false,
      amount: false,
    },
  };

  const normalizeLaborType = (type) => {
    if (type === 'Contractor Labour') return 'Contractor Labour';
    if (type === 'Outsource Labour') return 'Outsource Labor';
    return type;
  };

  const getFieldsConfig = () => {
    const normalizedType = normalizeLaborType(selectedLaborType);
    const baseConfig = columnConfig[normalizedType] || {};

    if (normalizedType === 'Outsource Labor') {
      const isCompanyHead = newLaborer.head === 'Company Head';
      const isContractorHead = newLaborer.head === 'Contractor Head';

      return {
        ...baseConfig,
        contractorName: isContractorHead,
        companyPayment: isContractorHead,
        contractorDebitPayment: isContractorHead,
        amount: isCompanyHead,
      };
    }

    return baseConfig;
  };

  const fieldsConfig = getFieldsConfig();

  const startCamera = async (mode = 'user') => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setFacingMode(mode);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(err => {
            console.error('Play error:', err);
          });
        };
      }
      
      setShowCamera(true);
    } catch (err) {
      console.error('Camera error:', err);
      alert('कैमरा एक्सेस नहीं हो पाया / Camera access failed. Please allow camera permission.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const toggleCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    startCamera(newMode);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageSrc = canvas.toDataURL('image/jpeg', 0.8);
      setPhoto(imageSrc);
      stopCamera();
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleNameChange = (selectedName) => {
    setNewLaborer(prev => ({ ...prev, name: selectedName }));
    
    const employee = employeeNames.find(emp => emp.name === selectedName);
    if (employee && employee.id) {
      setNewLaborer(prev => ({ ...prev, code: employee.id }));
    }
  };

  // OUT Form: Handle Name selection and fetch IN data for current date from localStorage
  const handleOutNameChange = (selectedName) => {
    setNewOutLaborer(prev => ({ ...prev, name: selectedName }));
    setOutNameSearch(selectedName);
    
    // Fetch IN data from localStorage for today
    console.log('Fetching data for:', selectedName, 'Date:', getCurrentDate());
    const inData = getInLaborerFromStorage(selectedName);
    console.log('Retrieved data:', inData);
    
    if (inData) {
      const currentTime = new Date().toLocaleTimeString('en-IN', { hour12: false });
      setNewOutLaborer(prev => ({
        ...prev,
        siteName: inData.siteName || '',
        category: inData.category || '',
        inTime: inData.inTime || '',
        outTime: currentTime,
      }));
    } else {
      const currentTime = new Date().toLocaleTimeString('en-IN', { hour12: false });
      setNewOutLaborer(prev => ({
        ...prev,
        siteName: '',
        category: '',
        inTime: '',
        outTime: currentTime,
      }));
      alert('⚠️ No IN record found for today for: ' + selectedName);
    }
  };

  // Filter names based on search input
  const filteredEmployeeNames = employeeNames.filter(emp =>
    emp.name.toLowerCase().includes(outNameSearch.toLowerCase())
  );

  const addLaborer = () => {
    if (!newLaborer.name.trim()) {
      alert('नाम दर्ज करें / Enter name');
      return;
    }
    
    // Photo is required for IN form
    if (!photo) {
      alert('📸 फोटो लेना अनिवार्य है / Photo is required');
      return;
    }

    const laborerEntry = {
      name: newLaborer.name.trim(),
      designation: newLaborer.designation || '',
      category: newLaborer.category || '',
      code: newLaborer.code || '',
      contractorName: newLaborer.contractorName || '',
      photoBase64: photo || '',
      inTime: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      siteName: selectedSite,
      shift: newLaborer.shift || '',
      dayType: newLaborer.dayType || '',
      workDescription: newLaborer.workDescription || '',
      head: newLaborer.head || '',
      companyPayment: newLaborer.companyPayment || '',
      contractorDebitPayment: newLaborer.contractorDebitPayment || '',
      amount: newLaborer.amount || '',
    };

    setLaborers([...laborers, laborerEntry]);
    
    // Save IN data to localStorage for OUT form to retrieve
    saveInLaborerToStorage(newLaborer.name, {
      siteName: selectedSite,
      category: newLaborer.category,
      inTime: laborerEntry.inTime,
    });

    resetNewLaborer();
  };

  const resetNewLaborer = () => {
    setNewLaborer({
      name: '',
      designation: '',
      category: '',
      code: '',
      contractorName: '',
      shift: '',
      dayType: '',
      workDescription: '',
      head: '',
      companyPayment: '',
      contractorDebitPayment: '',
      amount: '',
    });
    setPhoto(null);
  };

  const deleteLaborer = (index) => {
    setLaborers(laborers.filter((_, i) => i !== index));
  };

  const deleteOutLaborer = (index) => {
    setOutLaborers(outLaborers.filter((_, i) => i !== index));
  };

  const addOutLaborer = () => {
    if (!newOutLaborer.name.trim()) {
      alert('नाम दर्ज करें / Enter name');
      return;
    }
    if (!newOutLaborer.outTime.trim()) {
      alert('आउट टाइम दर्ज करें / Enter out time');
      return;
    }

    const outLaborerEntry = {
      name: newOutLaborer.name.trim(),
      siteName: newOutLaborer.siteName || '',
      category: newOutLaborer.category || '',
      inTime: newOutLaborer.inTime || '',
      outTime: newOutLaborer.outTime || '',
      photo: newOutLaborer.photo || '',
    };

    setOutLaborers([...outLaborers, outLaborerEntry]);
    resetNewOutLaborer();
  };

  const resetNewOutLaborer = () => {
    const currentTime = new Date().toLocaleTimeString('en-IN', { hour12: false });
    setNewOutLaborer({
      name: '',
      siteName: '',
      category: '',
      inTime: '',
      outTime: currentTime,
      photo: '',
    });
    setOutNameSearch('');
    setPhoto(null);
  };

  const handleSubmit = async (type) => {
    const laborData = type === 'in' ? laborers : outLaborers;

    if (!selectedSite && type === 'in') {
      alert('साइट चुनें / Select site');
      return;
    }
    if (!selectedLaborType && type === 'in') {
      alert('श्रम प्रकार चुनें / Select labor type');
      return;
    }
    if (laborData.length === 0) {
      alert('कम से कम एक श्रमिक जोड़ें / Add at least one laborer');
      return;
    }

    const submitFn = type === 'in' ? submitIn : submitOut;

    // For OUT form, get siteName from first entry (all should have same siteName)
    const payloadSiteName = type === 'in' 
      ? selectedSite 
      : (laborData.length > 0 ? laborData[0].siteName : '');

    const payload = {
      submitDate: new Date().toISOString().split('T')[0],
      submitTime: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      siteName: payloadSiteName,
      laborType: type === 'in' ? normalizeLaborType(selectedLaborType) : 'Checkout',
      entries: laborData,
    };

    console.log('🚀 Submitting payload:', type === 'in' ? 'IN FORM' : 'OUT FORM');
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('First entry:', JSON.stringify(laborData[0], null, 2));

    try {
      const result = await submitFn(payload).unwrap();
      alert(result.message || `${type.toUpperCase()} सफलतापूर्वक दर्ज किया गया!`);
      
      if (type === 'in') {
        setLaborers([]);
        setSelectedSite('');
        setSelectedLaborType('');
      } else {
        setOutLaborers([]);
      }
      resetNewLaborer();
      setCurrentScreen('dashboard');
    } catch (err) {
      console.error('Submit error:', err);
      alert(err?.data?.message || 'सबमिट करने में त्रुटि / Submission failed');
    }
  };

  const handleBack = () => {
    setCurrentScreen('dashboard');
    setSelectedSite('');
    setSelectedLaborType('');
    setLaborers([]);
    setOutLaborers([]);
    resetNewLaborer();
    resetNewOutLaborer();
    stopCamera();
  };

  // ────────────────────────────────────────────────
  // DASHBOARD SCREEN
  // ────────────────────────────────────────────────
  if (currentScreen === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-2">Labour Attendance</h1>
          <p className="text-center text-gray-600 mb-12">श्रमिक उपस्थिति प्रबंधन</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <button
              onClick={() => setCurrentScreen('inForm')}
              className="p-10 bg-gradient-to-br from-green-500 to-green-700 text-white rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all flex flex-col items-center gap-4"
            >
              <LogIn size={48} />
              <span className="text-2xl font-bold">IN Form</span>
              <span className="text-sm opacity-90">चेक-इन</span>
            </button>

            <button
              onClick={() => setCurrentScreen('outForm')}
              className="p-10 bg-gradient-to-br from-red-500 to-red-700 text-white rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all flex flex-col items-center gap-4"
            >
              <LogOut size={48} />
              <span className="text-2xl font-bold">OUT Form</span>
              <span className="text-sm opacity-90">चेक-आउट</span>
            </button>

            <button
              onClick={() => setCurrentScreen('addName')}
              className="p-10 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all flex flex-col items-center gap-4"
            >
              <Plus size={48} />
              <span className="text-2xl font-bold">Add Name</span>
              <span className="text-sm opacity-90">नया नाम जोड़ें</span>
            </button>

            <button
              onClick={() => setCurrentScreen('lmsDashboard')}
              className="p-10 bg-gradient-to-br from-orange-500 to-orange-700 text-white rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all flex flex-col items-center gap-4"
            >
              <BarChart3 size={48} />
              <span className="text-2xl font-bold">Dashboard</span>
              <span className="text-sm opacity-90">विश्लेषण</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow border text-center">
              <div className="text-5xl mb-2">🏗️</div>
              <p className="text-gray-600">Sites</p>
              <p className="text-4xl font-bold text-blue-700">{siteNames.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border text-center">
              <div className="text-5xl mb-2">👷</div>
              <p className="text-gray-600">Labor Types</p>
              <p className="text-4xl font-bold text-green-700">{laborTypes.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border text-center">
              <div className="text-5xl mb-2">📅</div>
              <p className="text-gray-600">Today</p>
              <p className="text-3xl font-bold">{new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────
  // IN FORM SCREEN
  // ────────────────────────────────────────────────
  if (currentScreen === 'inForm') {
    const isIn = true;
    const normalizedType = normalizeLaborType(selectedLaborType);
    const codeLabel = (normalizedType === 'Contractor Labour' || normalizedType === 'Outsource Labor') 
      ? 'Labor Code' 
      : 'Employee Code';

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">IN Form - चेक-इन</h1>
                <p className="mt-1 opacity-90">Labour Attendance Entry</p>
              </div>
              <button
                onClick={() => handleBack()}
                className="bg-white/20 hover:bg-white/30 px-5 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <X size={20} /> Back
              </button>
            </div>
          </div>

          <div className="p-6 md:p-10">
            {/* Site & Labor Type */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div>
                <label className="block text-lg font-semibold mb-2">Site Name / साइट *</label>
                {dropdownLoading ? (
                  <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
                ) : (
                  <select
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">-- Select Site --</option>
                    {siteNames.map((site, i) => (
                      <option key={i} value={site}>{site}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-lg font-semibold mb-2">Labor Type / श्रम प्रकार *</label>
                {dropdownLoading ? (
                  <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
                ) : (
                  <select
                    value={selectedLaborType}
                    onChange={(e) => {
                      setSelectedLaborType(e.target.value);
                      resetNewLaborer();
                    }}
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">-- Select Type --</option>
                    {laborTypes.map((type, i) => (
                      <option key={i} value={type}>{type}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Add Laborer Form */}
            {selectedLaborType && (
              <div className="border border-gray-200 rounded-xl p-6 md:p-8 mb-10 bg-gray-50">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Plus className="text-blue-600" size={28} />
                  Add Laborer / श्रमिक जोड़ें
                </h2>

                <div className="space-y-6">
                  {/* Row 1: Name, Designation (text input), Category, Code */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {fieldsConfig.name && (
                      <div>
                        <label className="block font-medium mb-2">👤 Name / नाम *</label>
                        <select
                          value={newLaborer.name}
                          onChange={(e) => handleNameChange(e.target.value)}
                          className="w-full p-3 border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          required
                        >
                          <option value="">Select Name</option>
                          {employeeNames.map((emp, i) => (
                            <option key={i} value={emp.name}>{emp.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {fieldsConfig.designation && (
                      <div>
                        <label className="block font-medium mb-2">💼 Designation / पदनाम *</label>
                        <input
                          type="text"
                          value={newLaborer.designation}
                          onChange={(e) => setNewLaborer({ ...newLaborer, designation: e.target.value })}
                          className="w-full p-3 border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder="Enter designation (e.g. Supervisor, Engineer)"
                          required
                        />
                      </div>
                    )}

                    {fieldsConfig.category && (
                      <div>
                        <label className="block font-medium mb-2">📂 Category / श्रेणी</label>
                        <input
                          type="text"
                          list="categoriesList"
                          value={newLaborer.category}
                          onChange={(e) => setNewLaborer({ ...newLaborer, category: e.target.value })}
                          className="w-full p-3 border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder="Search or enter category..."
                        />
                        <datalist id="categoriesList">
                          {categories.map((cat, i) => (
                            <option key={i} value={cat} />
                          ))}
                        </datalist>
                      </div>
                    )}

                    {fieldsConfig.code && (
                      <div>
                        <label className="block font-medium mb-2">🆔 {codeLabel}</label>
                        <input
                          type="text"
                          value={newLaborer.code}
                          readOnly
                          className="w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed"
                          placeholder="Auto-filled from name..."
                        />
                      </div>
                    )}
                  </div>

                  {/* Row 2: Shift, Day Type, Head, Contractor Name */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {fieldsConfig.shift && (
                      <div>
                        <label className="block font-medium mb-2">🕒 Shift / पाली *</label>
                        <select
                          value={newLaborer.shift}
                          onChange={(e) => setNewLaborer({ ...newLaborer, shift: e.target.value })}
                          className="w-full p-3 border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          required
                        >
                          <option value="">Select Shift</option>
                          {shiftOptions.map((shift, i) => (
                            <option key={i} value={shift}>{shift}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {fieldsConfig.dayType && (
                      <div>
                        <label className="block font-medium mb-2">📅 Day Type / दिन प्रकार *</label>
                        <select
                          value={newLaborer.dayType}
                          onChange={(e) => setNewLaborer({ ...newLaborer, dayType: e.target.value })}
                          className="w-full p-3 border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          required
                        >
                          <option value="">Select Day Type</option>
                          {dayTypeOptions.map((type, i) => (
                            <option key={i} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {fieldsConfig.head && (
                      <div>
                        <label className="block font-medium mb-2">👨‍💼 Head / विभाग *</label>
                        <select
                          value={newLaborer.head}
                          onChange={(e) => {
                            const value = e.target.value;
                            setNewLaborer(prev => {
                              let updates = { head: value };
                              if (value === 'Company Head') {
                                updates = {
                                  ...updates,
                                  contractorName: '',
                                  companyPayment: '',
                                  contractorDebitPayment: '',
                                };
                              } else if (value === 'Contractor Head') {
                                updates = {
                                  ...updates,
                                  amount: '',
                                };
                              }
                              return { ...prev, ...updates };
                            });
                          }}
                          className="w-full p-3 border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          required
                        >
                          <option value="">Select Head</option>
                          <option value="Company Head">🏢 Company Head</option>
                          <option value="Contractor Head">👷 Contractor Head</option>
                        </select>
                      </div>
                    )}

                    {fieldsConfig.contractorName && (
                      <div>
                        <label className="block font-medium mb-2">🏢 Contractor / ठेकेदार *</label>
                        <select
                          value={newLaborer.contractorName}
                          onChange={(e) => setNewLaborer({ ...newLaborer, contractorName: e.target.value })}
                          className="w-full p-3 border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          required
                        >
                          <option value="">Select Contractor</option>
                          {contractorNames.map((con, i) => (
                            <option key={i} value={con}>{con}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Row 3: Company Payment, Contractor Debit Payment, Amount */}
                  <div className="grid md:grid-cols-3 gap-6">
                    {fieldsConfig.companyPayment && (
                      <div>
                        <label className="block font-medium mb-2">💰 Company Payment *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newLaborer.companyPayment}
                          onChange={(e) => setNewLaborer({ ...newLaborer, companyPayment: e.target.value })}
                          className="w-full p-3 border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    )}

                    {fieldsConfig.contractorDebitPayment && (
                      <div>
                        <label className="block font-medium mb-2">💸 Contractor Debit Payment *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newLaborer.contractorDebitPayment}
                          onChange={(e) => setNewLaborer({ ...newLaborer, contractorDebitPayment: e.target.value })}
                          className="w-full p-3 border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    )}

                    {fieldsConfig.amount && (
                      <div>
                        <label className="block font-medium mb-2">💵 Amount / राशि *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newLaborer.amount}
                          onChange={(e) => setNewLaborer({ ...newLaborer, amount: e.target.value })}
                          className="w-full p-3 border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder="₹ 0.00"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Work Description - Full width */}
                  {fieldsConfig.workDescription && (
                    <div>
                      <label className="block font-medium mb-2">📝 Work Description / कार्य विवरण *</label>
                      <textarea
                        value={newLaborer.workDescription}
                        onChange={(e) => setNewLaborer({ ...newLaborer, workDescription: e.target.value })}
                        className="w-full p-3 border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        rows="3"
                        placeholder="Describe the work..."
                        required
                      />
                    </div>
                  )}

                  {/* Camera Section */}
                  {fieldsConfig.photo && (
                    <div>
                      <label className="block font-medium mb-3 text-lg">📸 Photo / फोटो</label>

                      {showCamera ? (
                        <div className="border-4 border-blue-500 rounded-xl overflow-hidden bg-black">
                          <div className="relative">
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-auto"
                              style={{ maxHeight: '500px' }}
                            />
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                          </div>
                          <div className="p-4 bg-gray-800 flex gap-4">
                            <button
                              type="button"
                              onClick={capturePhoto}
                              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
                            >
                              <Camera size={20} /> Capture
                            </button>
                            <button
                              type="button"
                              onClick={toggleCamera}
                              className="bg-blue-600 text-white px-5 py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2"
                            >
                              <RotateCw size={20} />
                              {facingMode === 'user' ? 'Back' : 'Front'}
                            </button>
                            <button
                              type="button"
                              onClick={stopCamera}
                              className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-bold hover:bg-gray-700 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-4">
                          <button
                            type="button"
                            onClick={() => startCamera('user')}
                            className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                          >
                            <Camera size={20} /> Open Camera
                          </button>

                          {photo && (
                            <div className="relative flex-1 max-w-xs">
                              <img
                                src={photo}
                                alt="Preview"
                                className="w-full h-48 object-cover rounded-lg border-4 border-blue-400"
                              />
                              <button
                                type="button"
                                onClick={() => setPhoto(null)}
                                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition shadow-lg"
                              >
                                <X size={16} />
                              </button>
                              <p className="text-center mt-2 text-sm text-green-600 font-medium">✓ Photo Captured</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={addLaborer}
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition"
                >
                  <Plus size={24} /> Add Laborer to List
                </button>
              </div>
            )}

            {/* Added Laborers List */}
            {laborers.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xl font-bold mb-4">
                  Added Laborers ({laborers.length})
                </h3>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold">Name</th>
                        {fieldsConfig.designation && <th className="px-4 py-3 text-left text-xs font-semibold">Designation</th>}
                        {fieldsConfig.category && <th className="px-4 py-3 text-left text-xs font-semibold">Category</th>}
                        {fieldsConfig.code && <th className="px-4 py-3 text-left text-xs font-semibold">{codeLabel}</th>}
                        {fieldsConfig.photo && <th className="px-4 py-3 text-left text-xs font-semibold">Photo</th>}
                        <th className="px-4 py-3 text-left text-xs font-semibold">In Time</th>
                        {fieldsConfig.shift && <th className="px-4 py-3 text-left text-xs font-semibold">Shift</th>}
                        {fieldsConfig.dayType && <th className="px-4 py-3 text-left text-xs font-semibold">Day Type</th>}
                        {fieldsConfig.workDescription && <th className="px-4 py-3 text-left text-xs font-semibold">Work Description</th>}
                        {fieldsConfig.head && <th className="px-4 py-3 text-left text-xs font-semibold">Head</th>}
                        {fieldsConfig.contractorName && <th className="px-4 py-3 text-left text-xs font-semibold">Contractor</th>}
                        {fieldsConfig.companyPayment && <th className="px-4 py-3 text-left text-xs font-semibold">Company Payment</th>}
                        {fieldsConfig.contractorDebitPayment && <th className="px-4 py-3 text-left text-xs font-semibold">Contractor Debit</th>}
                        {fieldsConfig.amount && <th className="px-4 py-3 text-left text-xs font-semibold">Amount</th>}
                        <th className="px-4 py-3 text-center text-xs font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {laborers.map((lab, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{lab.name}</td>
                          {fieldsConfig.designation && <td className="px-4 py-3 text-sm">{lab.designation || '-'}</td>}
                          {fieldsConfig.category && <td className="px-4 py-3 text-sm">{lab.category || '-'}</td>}
                          {fieldsConfig.code && <td className="px-4 py-3 text-sm">{lab.code || '-'}</td>}
                          {fieldsConfig.photo && (
                            <td className="px-4 py-3">
                              {lab.photoBase64 ? (
                                <img src={lab.photoBase64} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-gray-300" />
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                          )}
                          <td className="px-4 py-3 text-sm">{lab.inTime}</td>
                          {fieldsConfig.shift && <td className="px-4 py-3 text-sm">{lab.shift || '-'}</td>}
                          {fieldsConfig.dayType && <td className="px-4 py-3 text-sm">{lab.dayType || '-'}</td>}
                          {fieldsConfig.workDescription && <td className="px-4 py-3 text-sm max-w-xs truncate">{lab.workDescription || '-'}</td>}
                          {fieldsConfig.head && <td className="px-4 py-3 text-sm">{lab.head || '-'}</td>}
                          {fieldsConfig.contractorName && <td className="px-4 py-3 text-sm">{lab.contractorName || '-'}</td>}
                          {fieldsConfig.companyPayment && <td className="px-4 py-3 text-sm">₹{lab.companyPayment || '0'}</td>}
                          {fieldsConfig.contractorDebitPayment && <td className="px-4 py-3 text-sm">₹{lab.contractorDebitPayment || '0'}</td>}
                          {fieldsConfig.amount && <td className="px-4 py-3 text-sm">₹{lab.amount || '0'}</td>}
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => deleteLaborer(index)}
                              className="text-red-600 hover:text-red-800 transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => handleSubmit('in')}
                disabled={inSubmitting || laborers.length === 0}
                className="flex-1 py-4 rounded-lg text-white font-bold text-lg flex items-center justify-center gap-2 transition bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inSubmitting ? '⏳ Submitting...' : `🚀 Submit IN (${laborers.length})`}
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-4 rounded-lg font-bold transition"
              >
                🔙 Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────
  // OUT FORM SCREEN
  // ────────────────────────────────────────────────
  if (currentScreen === 'outForm') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">OUT Form - चेक-आउट</h1>
                <p className="mt-1 opacity-90">Labour Checkout Entry</p>
              </div>
              <button
                onClick={() => handleBack()}
                className="bg-white/20 hover:bg-white/30 px-5 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <X size={20} /> Back
              </button>
            </div>
          </div>

          <div className="p-6 md:p-10">
            {/* Add Out Laborer Form */}
            <div className="border border-gray-200 rounded-xl p-6 md:p-8 mb-10 bg-gray-50">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Plus className="text-red-600" size={28} />
                Record Checkout / चेक-आउट दर्ज करें
              </h2>

              <div className="space-y-6">
                {/* Row 1: Name (searchable), Site Name, Category, In Time */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="relative">
                    <label className="block font-medium mb-2">👤 Name / नाम *</label>
                    <input
                      type="text"
                      value={outNameSearch}
                      onChange={(e) => setOutNameSearch(e.target.value)}
                      placeholder="Type name..."
                      className="w-full p-3 border rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      autoComplete="off"
                    />
                    {outNameSearch && filteredEmployeeNames.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                        {filteredEmployeeNames.map((emp, i) => (
                          <div
                            key={i}
                            onClick={() => handleOutNameChange(emp.name)}
                            className="p-3 hover:bg-red-100 cursor-pointer border-b last:border-b-0"
                          >
                            {emp.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium mb-2">🏗️ Site Name / साइट</label>
                    <input
                      type="text"
                      value={newOutLaborer.siteName}
                      readOnly
                      className="w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed"
                      placeholder="Auto-filled..."
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">📂 Category / श्रेणी</label>
                    <input
                      type="text"
                      value={newOutLaborer.category}
                      readOnly
                      className="w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed"
                      placeholder="Auto-filled..."
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">⏰ In Time / इन टाइम</label>
                    <input
                      type="text"
                      value={newOutLaborer.inTime}
                      readOnly
                      className="w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed"
                      placeholder="Auto-filled..."
                    />
                  </div>
                </div>

                {/* Row 2: Out Time */}
                <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-medium mb-2">⏰ Out Time / आउट टाइम *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newOutLaborer.outTime}
                        readOnly
                        className="flex-1 p-3 border rounded-lg bg-gray-100 cursor-not-allowed text-lg font-semibold text-red-600"
                        placeholder="Auto-set..."
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const currentTime = new Date().toLocaleTimeString('en-IN', { hour12: false });
                          setNewOutLaborer({ ...newOutLaborer, outTime: currentTime });
                        }}
                        className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                      >
                        🔄 Update
                      </button>
                    </div>
                  </div>
                </div>

                {/* Photo Section - Optional */}
                <div>
                  <label className="block font-medium mb-3 text-lg">📸 Photo / फोटो (Optional)</label>

                  {showCamera ? (
                    <div className="border-4 border-red-500 rounded-xl overflow-hidden bg-black">
                      <div className="relative">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-auto"
                          style={{ maxHeight: '500px' }}
                        />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                      </div>
                      <div className="p-4 bg-gray-800 flex gap-4">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
                        >
                          <Camera size={20} /> Capture
                        </button>
                        <button
                          type="button"
                          onClick={toggleCamera}
                          className="bg-blue-600 text-white px-5 py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2"
                        >
                          <RotateCw size={20} />
                          {facingMode === 'user' ? 'Back' : 'Front'}
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-bold hover:bg-gray-700 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        type="button"
                        onClick={() => startCamera('user')}
                        className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                      >
                        <Camera size={20} /> Open Camera
                      </button>

                      {photo && (
                        <div className="relative flex-1 max-w-xs">
                          <img
                            src={photo}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg border-4 border-red-400"
                          />
                          <button
                            type="button"
                            onClick={() => setPhoto(null)}
                            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition shadow-lg"
                          >
                            <X size={16} />
                          </button>
                          <p className="text-center mt-2 text-sm text-green-600 font-medium">✓ Photo Captured</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={addOutLaborer}
                className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition"
              >
                <Plus size={24} /> Add to Checkout List
              </button>
            </div>

            {/* Out Laborers List */}
            {outLaborers.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xl font-bold mb-4">
                  Checkout Records ({outLaborers.length})
                </h3>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold">👤 Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">🏗️ Site</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">📂 Category</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">⏰ In Time</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">⏰ Out Time</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">📸 Photo</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {outLaborers.map((lab, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">{lab.name}</td>
                          <td className="px-4 py-3 text-sm">{lab.siteName || '-'}</td>
                          <td className="px-4 py-3 text-sm">{lab.category || '-'}</td>
                          <td className="px-4 py-3 text-sm">{lab.inTime || '-'}</td>
                          <td className="px-4 py-3 text-sm font-bold text-red-600">{lab.outTime || '-'}</td>
                          <td className="px-4 py-3">
                            {lab.photo ? (
                              <img src={lab.photo} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-gray-300" />
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => deleteOutLaborer(index)}
                              className="text-red-600 hover:text-red-800 transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => handleSubmit('out')}
                disabled={outSubmitting || outLaborers.length === 0}
                className="flex-1 py-4 rounded-lg text-white font-bold text-lg flex items-center justify-center gap-2 transition bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {outSubmitting ? '⏳ Submitting...' : `🚀 Submit OUT (${outLaborers.length})`}
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-4 rounded-lg font-bold transition"
              >
                🔙 Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Placeholder screens
  if (currentScreen === 'addName' || currentScreen === 'lmsDashboard') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-10 bg-white rounded-xl shadow-lg max-w-md">
          <h2 className="text-3xl font-bold mb-4">
            {currentScreen === 'addName' ? 'Add Name' : 'LMS Dashboard'}
          </h2>
          <p className="text-gray-600 mb-6">Feature under development...</p>
          <button
            onClick={handleBack}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AttendanceForm;