
// import React, { useState, useEffect } from 'react';
// import {
//   useGetElectricalDataQuery,
//   useSubmitElectricalFullkittingMutation,
//   useSubmitElectricalChecklistItemMutation,
//   useGetElectricalChecklistStatusQuery,
// } from '../../features/Electrical/Electrical_Slice';

// const ElectricalWork = () => {
//   const loggedInUserType = sessionStorage.getItem('userType') || '';
//   const isAdmin = loggedInUserType.trim().toUpperCase().replace(/\s+/g, '') === 'ADMIN';

//   // RTK Query hooks
//   const { data, isLoading, error } = useGetElectricalDataQuery();
//   const [submitFullkitting, { isLoading: isSubmitting }] = useSubmitElectricalFullkittingMutation();
//   const [submitChecklistItem, { isLoading: isChecklistSubmitting }] = useSubmitElectricalChecklistItemMutation();

//   // Fullkitting states
//   const [showFullkittingModal, setShowFullkittingModal] = useState(false);
//   const [selectedElectricalID, setSelectedElectricalID] = useState('');
//   const [selectedWorkType, setSelectedWorkType] = useState('');
//   const [fullkittingImages, setFullkittingImages] = useState({});

//   // Checklist states
//   const [showChecklistModal, setShowChecklistModal] = useState(false);
//   const [selectedChecklistID, setSelectedChecklistID] = useState('');
//   const [selectedSection, setSelectedSection] = useState(null);
//   const [checklistData, setChecklistData] = useState({});
//   const [checklistFormData, setChecklistFormData] = useState({
//     images: {},
//     remark: '',
//     status: 'Done',
//   });

//   const CHECKLIST_SECTIONS = [
//     "Safety Checklist",
//     "Slab Conduit Layout",
//     "Wall Conduit Layout",
//     "Chiselling / Cutting",
//     "Wire Pulling",
//     "Board & DB Fitting",
//     "Accessories Fitting",
//     "Circuit Testing & Load Testing",
//     "Quality Check",
//   ];

//   const FULL_KITTING_FIELDS = {
//     'Internal Electrical Work': [
//       { param: 'drawing_pdf', displayName: 'Drawing PDF' },
//       ...Array.from({ length: 19 }, (_, i) => ({
//         param: `conduit_material_${i + 1}`,
//         displayName: `Conduit Material ${i + 1}`,
//       })),
//     ],
//     'External Electrical Work': [
//       { param: 'drawing_pdf', displayName: 'Drawing PDF' },
//       ...Array.from({ length: 19 }, (_, i) => ({
//         param: `conduit_material_${i + 1}`,
//         displayName: `Conduit Material ${i + 1}`,
//       })),
//     ],
//   };

//   const currentFields = FULL_KITTING_FIELDS[selectedWorkType] || [];

//   const filteredData = isAdmin
//     ? (data || [])
//     : (data || []).filter(item =>
//         item.SiteName?.trim().toUpperCase() === loggedInUserType.trim().toUpperCase()
//       );

//   const getCompletedItems = (id) => checklistData[id]?.completedItems || [];

//   const { data: checklistStatus, isFetching: isFetchingStatus } = useGetElectricalChecklistStatusQuery(
//     { electricalID: selectedChecklistID },
//     { skip: !showChecklistModal || !selectedChecklistID }
//   );

//   useEffect(() => {
//     if (showChecklistModal && selectedChecklistID && checklistStatus?.success) {
//       setChecklistData(prev => ({
//         ...prev,
//         [selectedChecklistID]: {
//           completedItems: checklistStatus.completedItems || [],
//         },
//       }));
//     }
//   }, [showChecklistModal, selectedChecklistID, checklistStatus]);

//   // Fullkitting handlers
//   const handleFullkittingOpen = (id) => {
//     setSelectedElectricalID(id);
//     setSelectedWorkType('');
//     setFullkittingImages({});
//     setShowFullkittingModal(true);
//   };

//   const handleFullkittingImageChange = (e, param) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setFullkittingImages(prev => ({ ...prev, [param]: reader.result }));
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleRemoveFullkittingImage = (param) => {
//     setFullkittingImages(prev => {
//       const updated = { ...prev };
//       delete updated[param];
//       return updated;
//     });
//   };

//   const handleSubmitFullkitting = async () => {
//     if (!selectedWorkType) {
//       alert("कृपया Internal या External Electrical Work चुनें!");
//       return;
//     }

//     const cleanedID = selectedElectricalID.trim().toUpperCase();

//     const fieldToImageIndex = {
//       'drawing_pdf': 1,
//       ...Object.fromEntries(Array.from({ length: 19 }, (_, i) => [`conduit_material_${i + 1}`, i + 2])),
//     };

//     const payload = {
//       electricalID: cleanedID,
//       Typeofelectrical: selectedWorkType,
//     };

//     Object.entries(fullkittingImages).forEach(([param, base64]) => {
//       const index = fieldToImageIndex[param];
//       if (index) payload[`image${index}`] = base64;
//     });

//     try {
//       await submitFullkitting(payload).unwrap();
//       alert('Fullkitting सफलतापूर्वक सेव हो गया!');
//       setShowFullkittingModal(false);
//       // Optional: data refetch कर सकते हो अगर auto-update चाहिए
//       // refetch();  ← अगर useGetElectricalDataQuery से refetch function आ रहा हो
//     } catch (err) {
//       alert('Fullkitting submit failed: ' + (err?.data?.error || err?.message || 'Unknown error'));
//     }
//   };

//   // Checklist handlers
//   const handleChecklistOpen = (id) => {
//     setSelectedChecklistID(id);
//     setSelectedSection(null);
//     setChecklistFormData({ images: {}, remark: '', status: 'Done' });
//     setShowChecklistModal(true);
//   };

//   const handleChecklistImageChange = (e, key) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setChecklistFormData(prev => ({
//         ...prev,
//         images: { ...prev.images, [key]: reader.result }
//       }));
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleChecklistRemarkChange = (e) => {
//     setChecklistFormData(prev => ({ ...prev, remark: e.target.value }));
//   };

//   const handleChecklistStatusChange = (e) => {
//     setChecklistFormData(prev => ({ ...prev, status: e.target.value }));
//   };

//   const handleSubmitChecklist = async () => {
//     if (!selectedSection) return;

//     const payload = {
//       electricalID: selectedChecklistID.trim().toUpperCase(),
//       section: selectedSection,
//     };

//     if (selectedSection === "Safety Checklist") {
//       payload.helmetImage        = checklistFormData.images.helmet       || "";
//       payload.safetyShoesImage   = checklistFormData.images.safetyShoes  || "";
//       payload.safetyGogglesImage = checklistFormData.images.safetyGoggles || "";
//       payload.maskImage          = checklistFormData.images.mask         || "";
//       payload.glovesImage        = checklistFormData.images.gloves       || "";
//       payload.firstAidBoxImage   = checklistFormData.images.firstAidBox  || "";
//     } else if (selectedSection === "Quality Check") {
//       payload.image              = checklistFormData.images.default      || "";
//       payload.pondingTestImage   = checklistFormData.images.ponding      || "";
//       payload.insulationTestImage = checklistFormData.images.insulation  || "";
//       payload.continuityTestImage = checklistFormData.images.continuity  || "";
//       payload.remark             = checklistFormData.remark              || "";
//     } else {
//       payload.image  = checklistFormData.images.default || "";
//       payload.remark = checklistFormData.remark        || "";
//       payload.status = checklistFormData.status        || "Done";
//     }

//     try {
//       await submitChecklistItem(payload).unwrap();
//       alert(`${selectedSection} सेव हो गया!`);

//       setChecklistData(prev => {
//         const id = selectedChecklistID;
//         const completed = [...new Set([...(prev[id]?.completedItems || []), selectedSection])];
//         return { ...prev, [id]: { ...prev[id], completedItems: completed } };
//       });

//       setSelectedSection(null);
//       setChecklistFormData({ images: {}, remark: '', status: 'Done' });
//     } catch (err) {
//       alert('Checklist submit failed: ' + (err?.data?.error || 'Unknown error'));
//     }
//   };

//   const renderChecklistForm = () => {
//     if (!selectedSection) return null;
//     const isSafety = selectedSection === "Safety Checklist";
//     const isQuality = selectedSection === "Quality Check";

//     return (
//       <div className="space-y-6">
//         <div className="flex items-center justify-between pb-4 border-b">
//           <h4 className="text-lg font-bold text-slate-800">{selectedSection}</h4>
//           <button onClick={() => setSelectedSection(null)} className="px-4 py-2 text-purple-600 hover:text-purple-800 bg-purple-50 rounded-lg">← Back</button>
//         </div>

//         {isSafety ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//             {[
//               { key: 'helmet', label: 'Helmet' },
//               { key: 'safetyShoes', label: 'Safety Shoes' },
//               { key: 'safetyGoggles', label: 'Safety Goggles' },
//               { key: 'mask', label: 'Mask' },
//               { key: 'gloves', label: 'Gloves' },
//               { key: 'firstAidBox', label: 'First Aid Box' },
//             ].map(({ key, label }) => (
//               <div key={key} className="p-4 border rounded-xl bg-slate-50">
//                 <h5 className="font-medium mb-3">{label}</h5>
//                 {checklistFormData.images[key] ? (
//                   <div className="relative mb-3">
//                     <img src={checklistFormData.images[key]} alt={label} className="w-full h-32 object-cover rounded-lg" />
//                     <button onClick={() => setChecklistFormData(p => ({ ...p, images: { ...p.images, [key]: '' } }))} className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs">×</button>
//                   </div>
//                 ) : (
//                   <div className="h-32 flex items-center justify-center bg-white border-2 border-dashed border-slate-300 rounded-lg mb-3 text-slate-400 text-sm">No photo</div>
//                 )}
//                 <div className="grid grid-cols-2 gap-3">
//                   <label className="cursor-pointer">
//                     <div className="text-center py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm">Gallery</div>
//                     <input type="file" accept="image/*" onChange={e => handleChecklistImageChange(e, key)} className="hidden" />
//                   </label>
//                   <label className="cursor-pointer">
//                     <div className="text-center py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm">Camera</div>
//                     <input type="file" accept="image/*" capture="environment" onChange={e => handleChecklistImageChange(e, key)} className="hidden" />
//                   </label>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : isQuality ? (
//           <div className="space-y-6">
//             {/* Main Photo */}
//             <div>
//               <label className="block font-medium mb-2">Main Photo</label>
//               {checklistFormData.images.default ? (
//                 <div className="relative">
//                   <img src={checklistFormData.images.default} alt="Main" className="w-full h-48 object-cover rounded-xl" />
//                   <button onClick={() => setChecklistFormData(p => ({ ...p, images: { ...p.images, default: '' } }))} className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs">×</button>
//                 </div>
//               ) : (
//                 <div className="h-48 flex items-center justify-center bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl text-slate-400">No photo</div>
//               )}
//               <div className="grid grid-cols-2 gap-3 mt-3">
//                 <label className="cursor-pointer"><div className="py-3 text-center bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg">Gallery</div><input type="file" accept="image/*" onChange={e => handleChecklistImageChange(e, 'default')} className="hidden" /></label>
//                 <label className="cursor-pointer"><div className="py-3 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg">Camera</div><input type="file" accept="image/*" capture="environment" onChange={e => handleChecklistImageChange(e, 'default')} className="hidden" /></label>
//               </div>
//             </div>

//             {/* Test Photos */}
//             {[
//               { key: 'ponding', label: 'Ponding Test' },
//               { key: 'insulation', label: 'Insulation Test' },
//               { key: 'continuity', label: 'Continuity Test' },
//             ].map(({ key, label }) => (
//               <div key={key}>
//                 <label className="block font-medium mb-2">{label} Photo</label>
//                 {checklistFormData.images[key] ? (
//                   <div className="relative">
//                     <img src={checklistFormData.images[key]} alt={label} className="w-full h-40 object-cover rounded-xl" />
//                     <button onClick={() => setChecklistFormData(p => ({ ...p, images: { ...p.images, [key]: '' } }))} className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs">×</button>
//                   </div>
//                 ) : (
//                   <div className="h-40 flex items-center justify-center bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl text-slate-400">No photo</div>
//                 )}
//                 <div className="grid grid-cols-2 gap-3 mt-3">
//                   <label className="cursor-pointer"><div className="py-2.5 text-center bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm">Gallery</div><input type="file" accept="image/*" onChange={e => handleChecklistImageChange(e, key)} className="hidden" /></label>
//                   <label className="cursor-pointer"><div className="py-2.5 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm">Camera</div><input type="file" accept="image/*" capture="environment" onChange={e => handleChecklistImageChange(e, key)} className="hidden" /></label>
//                 </div>
//               </div>
//             ))}

//             <div>
//               <label className="block font-medium mb-2">Remark / Observation</label>
//               <textarea value={checklistFormData.remark} onChange={handleChecklistRemarkChange} placeholder="कोई विशेष नोट, समस्या या माप..." className="w-full px-4 py-3 border border-slate-300 rounded-xl min-h-[100px]" />
//             </div>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             <div>
//               <label className="block font-medium mb-2">Status</label>
//               <select value={checklistFormData.status} onChange={handleChecklistStatusChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl">
//                 <option value="Done">Done</option>
//                 <option value="Ongoing">Ongoing</option>
//                 <option value="Pending">Pending</option>
//               </select>
//             </div>

//             <div>
//               <label className="block font-medium mb-2">Photo Evidence</label>
//               {checklistFormData.images.default ? (
//                 <div className="relative">
//                   <img src={checklistFormData.images.default} alt="Evidence" className="w-full h-48 object-cover rounded-xl" />
//                   <button onClick={() => setChecklistFormData(p => ({ ...p, images: { ...p.images, default: '' } }))} className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs">×</button>
//                 </div>
//               ) : (
//                 <div className="h-48 flex items-center justify-center bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl text-slate-400">No photo</div>
//               )}
//               <div className="grid grid-cols-2 gap-3 mt-3">
//                 <label className="cursor-pointer"><div className="py-3 text-center bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg">Gallery</div><input type="file" accept="image/*" onChange={e => handleChecklistImageChange(e, 'default')} className="hidden" /></label>
//                 <label className="cursor-pointer"><div className="py-3 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg">Camera</div><input type="file" accept="image/*" capture="environment" onChange={e => handleChecklistImageChange(e, 'default')} className="hidden" /></label>
//               </div>
//             </div>

//             <div>
//               <label className="block font-medium mb-2">Remark</label>
//               <textarea value={checklistFormData.remark} onChange={handleChecklistRemarkChange} placeholder="कोई नोट या समस्या..." className="w-full px-4 py-3 border border-slate-300 rounded-xl min-h-[100px]" />
//             </div>
//           </div>
//         )}

//         <div className="flex gap-4 pt-6">
//           <button onClick={handleSubmitChecklist} disabled={isChecklistSubmitting} className={`flex-1 py-3.5 rounded-xl text-white font-semibold ${isChecklistSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
//             {isChecklistSubmitting ? 'Submitting...' : 'Submit'}
//           </button>
//           <button onClick={() => setShowChecklistModal(false)} className="flex-1 py-3.5 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300">
//             Cancel
//           </button>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="p-5 bg-slate-50 min-h-screen">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//         <h2 className="text-2xl md:text-3xl font-bold border-l-4 border-blue-600 pl-4 text-slate-800">
//           Electrical Work Portal {isAdmin ? '(Admin - All Sites)' : `(${loggedInUserType || 'Your Site'})`}
//         </h2>
//         {isLoading && <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />}
//       </div>

//       {isLoading ? (
//         <div className="text-center mt-20">
//           <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
//           <p className="text-slate-600 font-medium">Loading electrical records...</p>
//         </div>
//       ) : error ? (
//         <div className="text-center text-red-600 mt-10">
//           <p className="text-lg font-medium">Data load failed</p>
//           <p className="text-sm mt-2">{error?.data?.error || 'Please try again'}</p>
//         </div>
//       ) : filteredData.length === 0 ? (
//         <div className="text-center py-20 text-slate-600">
//           <p className="text-xl font-medium">{isAdmin ? 'No electrical records found' : 'No records found for your site'}</p>
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl shadow overflow-hidden border border-slate-200">
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[1400px] text-sm">
//               <thead>
//                 <tr className="bg-slate-800 text-white">
//                   <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Electrical ID</th>
//                   <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">UID</th>
//                   <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Zone</th>
//                   <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Activity</th>
//                   <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Sub Activity</th>
//                   <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Actual Start</th>
//                   <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Actual End</th>
//                   <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Site Name</th>
//                   <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Planned</th>
//                   <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Actual</th>
//                   <th className="px-4 py-4 text-left font-semibold">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredData.map((item, index) => {
//                   const electricalID = item.electricalID || item.ElectricalID || item.ID || item.UID || '-';

//                   // Status check – अगर API में status फील्ड अलग नाम का है तो यहाँ बदल दो
//                   const fullkittingDone = (item.status || '').trim().toUpperCase() === 'DONE';

//                   return (
//                     <tr
//                       key={electricalID + index}
//                       className={`border-b hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
//                     >
//                       <td className="px-4 py-4 font-medium text-slate-800 border-r">{electricalID}</td>
//                       <td className="px-4 py-4 border-r">{item.UID || '-'}</td>
//                       <td className="px-4 py-4 border-r">{item.Zone || '-'}</td>
//                       <td className="px-4 py-4 border-r">{item.Activity || '-'}</td>
//                       <td className="px-4 py-4 border-r">{item.SubActivity || '-'}</td>
//                       <td className="px-4 py-4 text-slate-700 border-r">{item.ActualStart || '-'}</td>
//                       <td className="px-4 py-4 text-slate-700 border-r">{item.ActualEnd || '-'}</td>
//                       <td className="px-4 py-4 border-r font-medium">{item.SiteName || '-'}</td>
//                       <td className="px-4 py-4 border-r">{item.Planned || '-'}</td>
//                       <td className="px-4 py-4 border-r">{item.Actual || '-'}</td>
//                       <td className="px-4 py-4 whitespace-nowrap space-x-2">
//                         <button
//                           onClick={() => handleFullkittingOpen(electricalID)}
//                           disabled={fullkittingDone}
//                           className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
//                             fullkittingDone ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
//                           }`}
//                         >
//                           {fullkittingDone ? 'Done ✓' : 'Fullkitting'}
//                         </button>
//                         <button
//                           onClick={() => handleChecklistOpen(electricalID)}
//                           className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
//                         >
//                           Checklist
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Fullkitting Modal */}
//       {showFullkittingModal && (
//         <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl">
//             <div className="px-6 py-5 border-b bg-gradient-to-r from-slate-50 to-white flex items-center justify-between sticky top-0 z-10">
//               <div>
//                 <h3 className="text-xl font-semibold text-slate-800">Electrical Fullkitting Submission</h3>
//                 <p className="text-sm text-slate-500 mt-0.5">ID: {selectedElectricalID}</p>
//               </div>
//               <button onClick={() => setShowFullkittingModal(false)} className="text-3xl text-slate-400 hover:text-slate-600">×</button>
//             </div>

//             <div className="p-6 space-y-8">
//               <div className="max-w-md">
//                 <label className="block mb-2 font-medium text-slate-700">
//                   Type of Electrical Work <span className="text-red-600">*</span>
//                 </label>
//                 <select
//                   value={selectedWorkType}
//                   onChange={(e) => {
//                     setSelectedWorkType(e.target.value);
//                     setFullkittingImages({});
//                   }}
//                   className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 >
//                   <option value="">---- Select ----</option>
//                   <option value="Internal Electrical Work">Internal Electrical Work</option>
//                   <option value="External Electrical Work">External Electrical Work</option>
//                 </select>
//               </div>

//               {selectedWorkType && (
//                 <div>
//                   <h4 className="text-lg font-medium text-slate-700 mb-4">Upload Supporting Documents/Images (All Optional)</h4>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                     {currentFields.map((field) => (
//                       <div key={field.param} className="space-y-2">
//                         <label className="block text-sm font-medium text-slate-700">{field.displayName}</label>
//                         {fullkittingImages[field.param] ? (
//                           <div className="relative rounded-lg overflow-hidden border-2 border-green-300">
//                             <img src={fullkittingImages[field.param]} alt={field.displayName} className="w-full h-40 object-cover" />
//                             <button onClick={() => handleRemoveFullkittingImage(field.param)} className="absolute top-2 right-2 bg-red-600 text-white text-xs px-3 py-1 rounded-full">×</button>
//                           </div>
//                         ) : (
//                           <div className="h-40 flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 text-sm">
//                             No file
//                           </div>
//                         )}
//                         <div className="grid grid-cols-2 gap-2">
//                           <label className="cursor-pointer">
//                             <div className="text-center py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 text-sm">
//                               Gallery
//                             </div>
//                             <input
//                               type="file"
//                               accept={field.param.includes('pdf') ? "application/pdf,image/*" : "image/*"}
//                               onChange={(e) => handleFullkittingImageChange(e, field.param)}
//                               className="hidden"
//                             />
//                           </label>
//                           <label className="cursor-pointer">
//                             <div className="text-center py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 text-sm">
//                               {field.param.includes('pdf') ? 'Choose PDF' : 'Camera'}
//                             </div>
//                             <input
//                               type="file"
//                               accept="image/*"
//                               capture="environment"
//                               onChange={(e) => handleFullkittingImageChange(e, field.param)}
//                               className="hidden"
//                               disabled={field.param.includes('pdf')}
//                             />
//                           </label>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div className="flex gap-4 pt-6">
//                 <button
//                   onClick={handleSubmitFullkitting}
//                   disabled={isSubmitting || !selectedWorkType}
//                   className={`flex-1 py-3.5 rounded-xl font-semibold text-white ${isSubmitting || !selectedWorkType ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
//                 >
//                   {isSubmitting ? 'Uploading...' : 'Submit Fullkitting'}
//                 </button>
//                 <button
//                   onClick={() => setShowFullkittingModal(false)}
//                   className="flex-1 py-3.5 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Checklist Modal */}
//       {showChecklistModal && (
//         <div
//           className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
//           onClick={(e) => e.target === e.currentTarget && setShowChecklistModal(false)}
//         >
//           <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
//             <div className="px-6 py-5 border-b bg-gradient-to-r from-slate-50 to-white flex items-center justify-between sticky top-0 z-10">
//               <div>
//                 <h3 className="text-xl font-semibold text-slate-800">Electrical Checklist</h3>
//                 <p className="text-sm text-slate-500 mt-0.5">{selectedChecklistID}</p>
//               </div>
//               <button onClick={() => setShowChecklistModal(false)} className="text-3xl text-slate-400 hover:text-slate-600">×</button>
//             </div>

//             <div className="p-6">
//               {isFetchingStatus ? (
//                 <div className="text-center py-10">
//                   <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
//                   <p className="text-slate-600">Loading checklist status...</p>
//                 </div>
//               ) : !selectedSection ? (
//                 <div>
//                   <div className="text-center mb-8">
//                     <h4 className="text-lg font-semibold text-slate-800 mb-2">Select Item to Complete</h4>
//                     <p className="text-sm text-slate-500">
//                       {getCompletedItems(selectedChecklistID).length}/{CHECKLIST_SECTIONS.length} items completed
//                     </p>
//                   </div>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     {CHECKLIST_SECTIONS.map((item) => {
//                       const isCompleted = getCompletedItems(selectedChecklistID).includes(item);
//                       return (
//                         <button
//                           key={item}
//                           onClick={() => {
//                             setSelectedSection(item);
//                             setChecklistFormData({ images: {}, remark: '', status: 'Done' });
//                           }}
//                           disabled={isCompleted}
//                           className={`p-6 rounded-2xl border-2 text-center transition-all duration-300 ${
//                             isCompleted
//                               ? 'bg-green-50 border-green-400 cursor-not-allowed opacity-80'
//                               : 'bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-300 hover:border-purple-400 hover:shadow-xl'
//                           }`}
//                         >
//                           <div className="flex flex-col items-center gap-2">
//                             <span className="text-3xl">{isCompleted ? '✓' : '📋'}</span>
//                             <span className="font-semibold">{item}</span>
//                           </div>
//                           {isCompleted && <div className="mt-2 text-green-700 text-sm">Done</div>}
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>
//               ) : (
//                 renderChecklistForm()
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ElectricalWork;





/////////////////////////////////////////////////////////////////////////


import React, { useState, useEffect } from 'react';
import {
  useGetElectricalDataQuery,
  useSubmitElectricalFullkittingMutation,
  useSubmitElectricalChecklistItemMutation,
  useGetElectricalChecklistStatusQuery,
} from '../../features/Electrical/Electrical_Slice';

const ElectricalWork = () => {
  const loggedInUserType = sessionStorage.getItem('userType') || '';
  const isAdmin = loggedInUserType.trim().toUpperCase().replace(/\s+/g, '') === 'ADMIN';

  // RTK Query hooks
  const { data, isLoading, error } = useGetElectricalDataQuery();
  const [submitFullkitting, { isLoading: isSubmitting }] = useSubmitElectricalFullkittingMutation();
  const [submitChecklistItem, { isLoading: isChecklistSubmitting }] = useSubmitElectricalChecklistItemMutation();

  // Fullkitting states
  const [showFullkittingModal, setShowFullkittingModal] = useState(false);
  const [selectedElectricalID, setSelectedElectricalID] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState('');
  const [fullkittingImages, setFullkittingImages] = useState({});

  // Checklist states
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [selectedChecklistID, setSelectedChecklistID] = useState('');
  const [selectedChecklistUID, setSelectedChecklistUID] = useState(''); // UID के लिए state
  const [selectedSection, setSelectedSection] = useState(null);
  const [checklistData, setChecklistData] = useState({});
  const [checklistFormData, setChecklistFormData] = useState({
    images: {},
    remark: '',
    status: 'Done',
  });

  const CHECKLIST_SECTIONS = [
    "Safety Checklist",
    "Slab Conduit Layout",
    "Wall Conduit Layout",
    "Chiselling / Cutting",
    "Wire Pulling",
    "Board & DB Fitting",
    "Accessories Fitting",
    "Circuit Testing & Load Testing",
    "Quality Check",
  ];

  const FULL_KITTING_FIELDS = {
    'Internal Electrical Work': [
      { param: 'drawing_pdf', displayName: 'Drawing PDF' },
      ...Array.from({ length: 19 }, (_, i) => ({
        param: `conduit_material_${i + 1}`,
        displayName: `Conduit Material ${i + 1}`,
      })),
    ],
    'External Electrical Work': [
      { param: 'drawing_pdf', displayName: 'Drawing PDF' },
      ...Array.from({ length: 19 }, (_, i) => ({
        param: `conduit_material_${i + 1}`,
        displayName: `Conduit Material ${i + 1}`,
      })),
    ],
  };

  const currentFields = FULL_KITTING_FIELDS[selectedWorkType] || [];

  const filteredData = isAdmin
    ? (data || [])
    : (data || []).filter(item =>
        item.SiteName?.trim().toUpperCase() === loggedInUserType.trim().toUpperCase()
      );

  const getCompletedItems = (id) => checklistData[id]?.completedItems || [];

  // Checklist status query - electricalID और UID दोनों भेजेंगे
  const { data: checklistStatus, isFetching: isFetchingStatus } = useGetElectricalChecklistStatusQuery(
    { 
      electricalID: selectedChecklistID,
      uid: selectedChecklistUID 
    },
    { skip: !showChecklistModal || !selectedChecklistID || !selectedChecklistUID }
  );

  useEffect(() => {
    if (showChecklistModal && selectedChecklistID && checklistStatus?.success) {
      setChecklistData(prev => ({
        ...prev,
        [selectedChecklistID]: {
          completedItems: checklistStatus.completedItems || [],
        },
      }));
    }
  }, [showChecklistModal, selectedChecklistID, checklistStatus]);

  // Fullkitting handlers
  const handleFullkittingOpen = (id) => {
    setSelectedElectricalID(id);
    setSelectedWorkType('');
    setFullkittingImages({});
    setShowFullkittingModal(true);
  };

  const handleFullkittingImageChange = (e, param) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFullkittingImages(prev => ({ ...prev, [param]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFullkittingImage = (param) => {
    setFullkittingImages(prev => {
      const updated = { ...prev };
      delete updated[param];
      return updated;
    });
  };

  const handleSubmitFullkitting = async () => {
    if (!selectedWorkType) {
      alert("कृपया Internal या External Electrical Work चुनें!");
      return;
    }

    const cleanedID = selectedElectricalID.trim().toUpperCase();

    const fieldToImageIndex = {
      'drawing_pdf': 1,
      ...Object.fromEntries(Array.from({ length: 19 }, (_, i) => [`conduit_material_${i + 1}`, i + 2])),
    };

    const payload = {
      electricalID: cleanedID,
      Typeofelectrical: selectedWorkType,
    };

    Object.entries(fullkittingImages).forEach(([param, base64]) => {
      const index = fieldToImageIndex[param];
      if (index) payload[`image${index}`] = base64;
    });

    try {
      await submitFullkitting(payload).unwrap();
      alert('Fullkitting सफलतापूर्वक सेव हो गया!');
      setShowFullkittingModal(false);
    } catch (err) {
      alert('Fullkitting submit failed: ' + (err?.data?.error || err?.message || 'Unknown error'));
    }
  };

  // Checklist handlers - UID भी pass करेंगे
  const handleChecklistOpen = (electricalID, uid) => {
    setSelectedChecklistID(electricalID);
    setSelectedChecklistUID(uid); // UID set करें
    setSelectedSection(null);
    setChecklistFormData({ images: {}, remark: '', status: 'Done' });
    setShowChecklistModal(true);
  };

  const handleChecklistImageChange = (e, key) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setChecklistFormData(prev => ({
        ...prev,
        images: { ...prev.images, [key]: reader.result }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleChecklistRemarkChange = (e) => {
    setChecklistFormData(prev => ({ ...prev, remark: e.target.value }));
  };

  const handleChecklistStatusChange = (e) => {
    setChecklistFormData(prev => ({ ...prev, status: e.target.value }));
  };

  const handleSubmitChecklist = async () => {
    if (!selectedSection) return;

    const payload = {
      electricalID: selectedChecklistID.trim().toUpperCase(),
      uid: selectedChecklistUID, // UID add करें
      section: selectedSection,
    };

    if (selectedSection === "Safety Checklist") {
      payload.helmetImage        = checklistFormData.images.helmet       || "";
      payload.safetyShoesImage   = checklistFormData.images.safetyShoes  || "";
      payload.safetyGogglesImage = checklistFormData.images.safetyGoggles || "";
      payload.maskImage          = checklistFormData.images.mask         || "";
      payload.glovesImage        = checklistFormData.images.gloves       || "";
      payload.firstAidBoxImage   = checklistFormData.images.firstAidBox  || "";
    } else if (selectedSection === "Quality Check") {
      payload.image              = checklistFormData.images.default      || "";
      payload.pondingTestImage   = checklistFormData.images.ponding      || "";
      payload.insulationTestImage = checklistFormData.images.insulation  || "";
      payload.continuityTestImage = checklistFormData.images.continuity  || "";
      payload.remark             = checklistFormData.remark              || "";
    } else {
      payload.image  = checklistFormData.images.default || "";
      payload.remark = checklistFormData.remark        || "";
      payload.status = checklistFormData.status        || "Done";
    }

    try {
      await submitChecklistItem(payload).unwrap();
      alert(`${selectedSection} सेव हो गया!`);

      setChecklistData(prev => {
        const id = selectedChecklistID;
        const completed = [...new Set([...(prev[id]?.completedItems || []), selectedSection])];
        return { ...prev, [id]: { ...prev[id], completedItems: completed } };
      });

      setSelectedSection(null);
      setChecklistFormData({ images: {}, remark: '', status: 'Done' });
    } catch (err) {
      alert('Checklist submit failed: ' + (err?.data?.error || 'Unknown error'));
    }
  };

  const renderChecklistForm = () => {
    if (!selectedSection) return null;
    const isSafety = selectedSection === "Safety Checklist";
    const isQuality = selectedSection === "Quality Check";

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b">
          <h4 className="text-lg font-bold text-slate-800">{selectedSection}</h4>
          <button onClick={() => setSelectedSection(null)} className="px-4 py-2 text-purple-600 hover:text-purple-800 bg-purple-50 rounded-lg">← Back</button>
        </div>

        {isSafety ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { key: 'helmet', label: 'Helmet' },
              { key: 'safetyShoes', label: 'Safety Shoes' },
              { key: 'safetyGoggles', label: 'Safety Goggles' },
              { key: 'mask', label: 'Mask' },
              { key: 'gloves', label: 'Gloves' },
              { key: 'firstAidBox', label: 'First Aid Box' },
            ].map(({ key, label }) => (
              <div key={key} className="p-4 border rounded-xl bg-slate-50">
                <h5 className="font-medium mb-3">{label}</h5>
                {checklistFormData.images[key] ? (
                  <div className="relative mb-3">
                    <img src={checklistFormData.images[key]} alt={label} className="w-full h-32 object-cover rounded-lg" />
                    <button onClick={() => setChecklistFormData(p => ({ ...p, images: { ...p.images, [key]: '' } }))} className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs">×</button>
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center bg-white border-2 border-dashed border-slate-300 rounded-lg mb-3 text-slate-400 text-sm">No photo</div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <label className="cursor-pointer">
                    <div className="text-center py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm">Gallery</div>
                    <input type="file" accept="image/*" onChange={e => handleChecklistImageChange(e, key)} className="hidden" />
                  </label>
                  <label className="cursor-pointer">
                    <div className="text-center py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm">Camera</div>
                    <input type="file" accept="image/*" capture="environment" onChange={e => handleChecklistImageChange(e, key)} className="hidden" />
                  </label>
                </div>
              </div>
            ))}
          </div>
        ) : isQuality ? (
          <div className="space-y-6">
            {/* Main Photo */}
            <div>
              <label className="block font-medium mb-2">Main Photo</label>
              {checklistFormData.images.default ? (
                <div className="relative">
                  <img src={checklistFormData.images.default} alt="Main" className="w-full h-48 object-cover rounded-xl" />
                  <button onClick={() => setChecklistFormData(p => ({ ...p, images: { ...p.images, default: '' } }))} className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs">×</button>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl text-slate-400">No photo</div>
              )}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <label className="cursor-pointer"><div className="py-3 text-center bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg">Gallery</div><input type="file" accept="image/*" onChange={e => handleChecklistImageChange(e, 'default')} className="hidden" /></label>
                <label className="cursor-pointer"><div className="py-3 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg">Camera</div><input type="file" accept="image/*" capture="environment" onChange={e => handleChecklistImageChange(e, 'default')} className="hidden" /></label>
              </div>
            </div>

            {/* Test Photos */}
            {[
              { key: 'ponding', label: 'Ponding Test' },
              { key: 'insulation', label: 'Insulation Test' },
              { key: 'continuity', label: 'Continuity Test' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block font-medium mb-2">{label} Photo</label>
                {checklistFormData.images[key] ? (
                  <div className="relative">
                    <img src={checklistFormData.images[key]} alt={label} className="w-full h-40 object-cover rounded-xl" />
                    <button onClick={() => setChecklistFormData(p => ({ ...p, images: { ...p.images, [key]: '' } }))} className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs">×</button>
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl text-slate-400">No photo</div>
                )}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <label className="cursor-pointer"><div className="py-2.5 text-center bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm">Gallery</div><input type="file" accept="image/*" onChange={e => handleChecklistImageChange(e, key)} className="hidden" /></label>
                  <label className="cursor-pointer"><div className="py-2.5 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm">Camera</div><input type="file" accept="image/*" capture="environment" onChange={e => handleChecklistImageChange(e, key)} className="hidden" /></label>
                </div>
              </div>
            ))}

            <div>
              <label className="block font-medium mb-2">Remark / Observation</label>
              <textarea value={checklistFormData.remark} onChange={handleChecklistRemarkChange} placeholder="कोई विशेष नोट, समस्या या माप..." className="w-full px-4 py-3 border border-slate-300 rounded-xl min-h-[100px]" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block font-medium mb-2">Status</label>
              <select value={checklistFormData.status} onChange={handleChecklistStatusChange} className="w-full px-4 py-3 border border-slate-300 rounded-xl">
                <option value="Done">Done</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">Photo Evidence</label>
              {checklistFormData.images.default ? (
                <div className="relative">
                  <img src={checklistFormData.images.default} alt="Evidence" className="w-full h-48 object-cover rounded-xl" />
                  <button onClick={() => setChecklistFormData(p => ({ ...p, images: { ...p.images, default: '' } }))} className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs">×</button>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl text-slate-400">No photo</div>
              )}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <label className="cursor-pointer"><div className="py-3 text-center bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg">Gallery</div><input type="file" accept="image/*" onChange={e => handleChecklistImageChange(e, 'default')} className="hidden" /></label>
                <label className="cursor-pointer"><div className="py-3 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg">Camera</div><input type="file" accept="image/*" capture="environment" onChange={e => handleChecklistImageChange(e, 'default')} className="hidden" /></label>
              </div>
            </div>

            <div>
              <label className="block font-medium mb-2">Remark</label>
              <textarea value={checklistFormData.remark} onChange={handleChecklistRemarkChange} placeholder="कोई नोट या समस्या..." className="w-full px-4 py-3 border border-slate-300 rounded-xl min-h-[100px]" />
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-6">
          <button onClick={handleSubmitChecklist} disabled={isChecklistSubmitting} className={`flex-1 py-3.5 rounded-xl text-white font-semibold ${isChecklistSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
            {isChecklistSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <button onClick={() => setShowChecklistModal(false)} className="flex-1 py-3.5 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300">
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-5 bg-slate-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold border-l-4 border-blue-600 pl-4 text-slate-800">
          Electrical Work Portal {isAdmin ? '(Admin - All Sites)' : `(${loggedInUserType || 'Your Site'})`}
        </h2>
        {isLoading && <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />}
      </div>

      {isLoading ? (
        <div className="text-center mt-20">
          <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
          <p className="text-slate-600 font-medium">Loading electrical records...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 mt-10">
          <p className="text-lg font-medium">Data load failed</p>
          <p className="text-sm mt-2">{error?.data?.error || 'Please try again'}</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <p className="text-xl font-medium">{isAdmin ? 'No electrical records found' : 'No records found for your site'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1400px] text-sm">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Electrical ID</th>
                  <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">UID</th>
                  <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Zone</th>
                  <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Activity</th>
                  <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Sub Activity</th>
                  <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Actual Start</th>
                  <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Actual End</th>
                  <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Site Name</th>
                  <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Planned</th>
                  <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Actual</th>
                  <th className="px-4 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => {
                  const electricalID = item.electricalID || item.ElectricalID || item.ID || item.UID || '-';
                  const uid = item.UID || item.uid || '';

                  const fullkittingDone = (item.status || '').trim().toUpperCase() === 'DONE';

                  return (
                    <tr
                      key={electricalID + index}
                      className={`border-b hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                    >
                      <td className="px-4 py-4 font-medium text-slate-800 border-r">{electricalID}</td>
                      <td className="px-4 py-4 border-r">{uid || '-'}</td>
                      <td className="px-4 py-4 border-r">{item.Zone || '-'}</td>
                      <td className="px-4 py-4 border-r">{item.Activity || '-'}</td>
                      <td className="px-4 py-4 border-r">{item.SubActivity || '-'}</td>
                      <td className="px-4 py-4 text-slate-700 border-r">{item.ActualStart || '-'}</td>
                      <td className="px-4 py-4 text-slate-700 border-r">{item.ActualEnd || '-'}</td>
                      <td className="px-4 py-4 border-r font-medium">{item.SiteName || '-'}</td>
                      <td className="px-4 py-4 border-r">{item.Planned || '-'}</td>
                      <td className="px-4 py-4 border-r">{item.Actual || '-'}</td>
                      <td className="px-4 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleFullkittingOpen(electricalID)}
                          disabled={fullkittingDone}
                          className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                            fullkittingDone ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {fullkittingDone ? 'Done ✓' : 'Fullkitting'}
                        </button>
                        <button
                          onClick={() => handleChecklistOpen(electricalID, uid)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Checklist
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fullkitting Modal */}
      {showFullkittingModal && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-5 border-b bg-gradient-to-r from-slate-50 to-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Electrical Fullkitting Submission</h3>
                <p className="text-sm text-slate-500 mt-0.5">ID: {selectedElectricalID}</p>
              </div>
              <button onClick={() => setShowFullkittingModal(false)} className="text-3xl text-slate-400 hover:text-slate-600">×</button>
            </div>

            <div className="p-6 space-y-8">
              <div className="max-w-md">
                <label className="block mb-2 font-medium text-slate-700">
                  Type of Electrical Work <span className="text-red-600">*</span>
                </label>
                <select
                  value={selectedWorkType}
                  onChange={(e) => {
                    setSelectedWorkType(e.target.value);
                    setFullkittingImages({});
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">---- Select ----</option>
                  <option value="Internal Electrical Work">Internal Electrical Work</option>
                  <option value="External Electrical Work">External Electrical Work</option>
                </select>
              </div>

              {selectedWorkType && (
                <div>
                  <h4 className="text-lg font-medium text-slate-700 mb-4">Upload Supporting Documents/Images (All Optional)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {currentFields.map((field) => (
                      <div key={field.param} className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">{field.displayName}</label>
                        {fullkittingImages[field.param] ? (
                          <div className="relative rounded-lg overflow-hidden border-2 border-green-300">
                            <img src={fullkittingImages[field.param]} alt={field.displayName} className="w-full h-40 object-cover" />
                            <button onClick={() => handleRemoveFullkittingImage(field.param)} className="absolute top-2 right-2 bg-red-600 text-white text-xs px-3 py-1 rounded-full">×</button>
                          </div>
                        ) : (
                          <div className="h-40 flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 text-sm">
                            No file
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <label className="cursor-pointer">
                            <div className="text-center py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 text-sm">
                              Gallery
                            </div>
                            <input
                              type="file"
                              accept={field.param.includes('pdf') ? "application/pdf,image/*" : "image/*"}
                              onChange={(e) => handleFullkittingImageChange(e, field.param)}
                              className="hidden"
                            />
                          </label>
                          <label className="cursor-pointer">
                            <div className="text-center py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 text-sm">
                              {field.param.includes('pdf') ? 'Choose PDF' : 'Camera'}
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={(e) => handleFullkittingImageChange(e, field.param)}
                              className="hidden"
                              disabled={field.param.includes('pdf')}
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleSubmitFullkitting}
                  disabled={isSubmitting || !selectedWorkType}
                  className={`flex-1 py-3.5 rounded-xl font-semibold text-white ${isSubmitting || !selectedWorkType ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {isSubmitting ? 'Uploading...' : 'Submit Fullkitting'}
                </button>
                <button
                  onClick={() => setShowFullkittingModal(false)}
                  className="flex-1 py-3.5 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Modal */}
      {showChecklistModal && (
        <div
          className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowChecklistModal(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-5 border-b bg-gradient-to-r from-slate-50 to-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Electrical Checklist</h3>
                <p className="text-sm text-slate-500 mt-0.5">{selectedChecklistID}</p>
              </div>
              <button onClick={() => setShowChecklistModal(false)} className="text-3xl text-slate-400 hover:text-slate-600">×</button>
            </div>

            <div className="p-6">
              {isFetchingStatus ? (
                <div className="text-center py-10">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-600">Loading checklist status...</p>
                </div>
              ) : !selectedSection ? (
                <div>
                  <div className="text-center mb-8">
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">Select Item to Complete</h4>
                    <p className="text-sm text-slate-500">
                      {getCompletedItems(selectedChecklistID).length}/{CHECKLIST_SECTIONS.length} items completed
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {CHECKLIST_SECTIONS.map((item) => {
                      const isCompleted = getCompletedItems(selectedChecklistID).includes(item);
                      return (
                        <button
                          key={item}
                          onClick={() => {
                            setSelectedSection(item);
                            setChecklistFormData({ images: {}, remark: '', status: 'Done' });
                          }}
                          disabled={isCompleted}
                          className={`p-6 rounded-2xl border-2 text-center transition-all duration-300 ${
                            isCompleted
                              ? 'bg-green-50 border-green-400 cursor-not-allowed opacity-80'
                              : 'bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-300 hover:border-purple-400 hover:shadow-xl'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl">{isCompleted ? '✓' : '📋'}</span>
                            <span className="font-semibold">{item}</span>
                          </div>
                          {isCompleted && <div className="mt-2 text-green-700 text-sm">Done</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                renderChecklistForm()
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectricalWork;