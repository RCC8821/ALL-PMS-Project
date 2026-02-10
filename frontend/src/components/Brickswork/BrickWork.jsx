// // src/pages/BrickWork.jsx  (या जहाँ भी तुम रखना चाहो)

// import React, { useState, useMemo } from 'react';
// import {
//   useGetFullkittingBrickDataQuery,
//   useSubmitFullkittingBrickMutation,
//   useSubmitBrickChecklistItemMutation,
//   useGetBrickChecklistStatusQuery,
// } from '../../features/BrickWork/BrickWorkSlice'; // अपना सही path डालना

// const BrickWork = () => {
//   const loggedInUserType = sessionStorage.getItem('userType') || '';

//   const isAdmin = loggedInUserType.trim().toUpperCase().replace(/\s+/g, '') === 'ADMIN';

//   // Fullkitting List
//   const { data, isLoading, error } = useGetFullkittingBrickDataQuery();

//   const [submitFullkitting, { isLoading: isSubmitting }] = useSubmitFullkittingBrickMutation();
//   const [submitChecklistItem, { isLoading: isChecklistSubmitting }] = useSubmitBrickChecklistItemMutation();

//   // Fullkitting Modal States (12 images)
//   const [showFullkittingForm, setShowFullkittingForm] = useState(false);
//   const [selectedBrickworkUID, setSelectedBrickworkUID] = useState('');
//   const [fullkittingFormData, setFullkittingFormData] = useState({ status: '---- Select ----' });
//   const [fullkittingImages, setFullkittingImages] = useState({
//     img1: '', img2: '', img3: '', img4: '', img5: '', img6: '',
//     img7: '', img8: '', img9: '', img10: '', img11: '', img12: '',
//   });

//   // Checklist Modal States
//   const [showChecklistModal, setShowChecklistModal] = useState(false);
//   const [selectedChecklistUID, setSelectedChecklistUID] = useState('');
//   const [selectedSection, setSelectedSection] = useState(null);

//   const [checklistFormData, setChecklistFormData] = useState({
//     status: '---- Select ----',
//     remark: '',
//   });

//   const [checklistImages, setChecklistImages] = useState({
//     image: '', helmet: '', mask: '', gloves: '', firstAidBox: '', shoes: '',
//     jointingProper: '', columnBimDhar: '', guniyaTesting: '', plumbBobTesting: '',
//   });

//   // Checklist Status API
//   const {
//     data: checklistStatus,
//     isLoading: statusLoading,
//     isFetching: statusFetching,
//   } = useGetBrickChecklistStatusQuery(selectedChecklistUID || undefined, {
//     skip: !selectedChecklistUID || !showChecklistModal,
//     refetchOnMountOrArgChange: true,
//   });

//   const completedSections = useMemo(() => {
//     return checklistStatus?.completedItems || [];
//   }, [checklistStatus]);

//   const filteredData = isAdmin
//     ? (data || [])
//     : (data || []).filter(
//         (item) => item.SiteName?.trim().toUpperCase() === loggedInUserType.trim().toUpperCase()
//       );

//   const handleFullkittingAction = (uid) => {
//     setSelectedBrickworkUID(uid);
//     setShowFullkittingForm(true);
//   };

//   const handleChecklistAction = (uid) => {
//     setSelectedChecklistUID(uid);
//     setShowChecklistModal(true);
//     setSelectedSection(null);
//   };

//   const handleFileChange = (e, key, setState) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setState((prev) => ({ ...prev, [key]: reader.result }));
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleFullkittingSubmit = async () => {
//     if (Object.values(fullkittingImages).some((img) => !img)) {
//       alert('कृपया सभी १२ फोटो अपलोड करें');
//       return;
//     }
//     if (fullkittingFormData.status === '---- Select ----') {
//       alert('कृपया वैध स्टेटस चुनें');
//       return;
//     }

//     try {
//       await submitFullkitting({
//         BrcikworkUID: selectedBrickworkUID, // backend में BrcikworkUID इस्तेमाल हो रहा है (typo वाला नाम)
//         image1: fullkittingImages.img1,
//         image2: fullkittingImages.img2,
//         image3: fullkittingImages.img3,
//         image4: fullkittingImages.img4,
//         image5: fullkittingImages.img5,
//         image6: fullkittingImages.img6,
//         image7: fullkittingImages.img7,
//         image8: fullkittingImages.img8,
//         image9: fullkittingImages.img9,
//         image10: fullkittingImages.img10,
//         image11: fullkittingImages.img11,
//         image12: fullkittingImages.img12,
//       }).unwrap();

//       alert('BrickWork Full Kitting सफलतापूर्वक सेव हो गया!');
//       setShowFullkittingForm(false);
//       setFullkittingImages({
//         img1: '', img2: '', img3: '', img4: '', img5: '', img6: '',
//         img7: '', img8: '', img9: '', img10: '', img11: '', img12: '',
//       });
//     } catch (err) {
//       alert('Fullkitting submit फेल हो गया!');
//       console.error(err);
//     }
//   };

//   const handleChecklistSubmit = async () => {
//     // तुम्हारे backend के हिसाब से section के अनुसार fields अलग-अलग भेजने पड़ेंगे
//     // यहाँ basic version दिया है — तुम्हें section के अनुसार conditional logic जोड़ना पड़ेगा

//     const payload = {
//       BrickworkUID: selectedChecklistUID,
//       section: selectedSection,
//       status: checklistFormData.status,
//       remark: checklistFormData.remark,
//     };

//     // Safety Checklist के लिए
//     if (selectedSection === 'Safety Checklist') {
//       payload.helmetImage = checklistImages.helmet;
//       payload.maskImage = checklistImages.mask;
//       payload.glovesImage = checklistImages.gloves;
//       payload.firstAidBoxImage = checklistImages.firstAidBox;
//       payload.shoesImage = checklistImages.shoes;
//     }
//     // Quality Check के लिए
//     else if (selectedSection === 'Quality Check') {
//       payload.jointingProperImage = checklistImages.jointingProper;
//       payload.columnBimDharImage = checklistImages.columnBimDhar;
//       payload.guniyaTestingImage = checklistImages.guniyaTesting;
//       payload.plumbBobTestingImage = checklistImages.plumbBobTesting;
//     }
//     // Normal sections के लिए
//     else {
//       payload.image = checklistImages.image;
//     }

//     try {
//       await submitChecklistItem(payload).unwrap();
//       alert(`${selectedSection} सफलतापूर्वक सेव हो गया!`);
//       setSelectedSection(null);
//     } catch (err) {
//       alert('Checklist submit फेल हो गया!');
//       console.error(err);
//     }
//   };

//   const sections = [
//     'Safety Checklist',
//     'Brick Layout',
//     'Start Brick Work',
//     'Sill Level DPC',
//     'Brick Wall & Window Opening',
//     'Lintel Level DPC',
//     'Above Lintel Brick Work Ventilate',
//     'Joint Filling',
//     'Quality Check',
//   ];

//   return (
//     <div className="p-5 bg-slate-50 min-h-screen">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//         <h2 className="text-2xl md:text-3xl font-bold border-l-4 border-blue-600 pl-4 text-slate-800">
//           Brick Work Portal: {isAdmin ? 'All Sites (Admin View)' : (loggedInUserType || 'Unknown Site')}
//         </h2>
//         {isLoading && (
//           <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
//         )}
//       </div>

//       {isLoading ? (
//         <div className="text-center mt-20">
//           <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
//           <p className="text-slate-600 font-medium">Loading brickwork records...</p>
//         </div>
//       ) : error ? (
//         <div className="text-center text-red-600 mt-10">
//           <p className="text-lg font-medium">Failed to load data</p>
//           <p className="text-sm mt-2">{error?.data?.message || 'Please try again later'}</p>
//         </div>
//       ) : filteredData.length === 0 ? (
//         <div className="text-center py-20 text-slate-600">
//           <p className="text-xl font-medium">
//             {isAdmin ? 'No records found in the system' : 'No records found for your site'}
//           </p>
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl shadow overflow-hidden border border-slate-200">
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[1400px] text-sm">
//               <thead>
//                 <tr className="bg-slate-800 text-white">
//                   <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Brickwork UID</th>
//                   <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">UID</th>
//                   <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Zone</th>
//                   <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Activity</th>
//                   <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Sub Activity</th>
//                   <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Planned</th>
//                   <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Actual Start</th>
//                   <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Actual End</th>
//                   <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Site Name</th>
//                   <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Status</th>
//                   <th className="px-4 py-4 text-left font-semibold">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredData.map((item, index) => {
//                   const isDone = item.status?.toLowerCase().includes('done');

//                   return (
//                     <tr
//                       key={item.BrcikworkUID || item.UID}
//                       className={`border-b hover:bg-slate-50 transition-colors ${
//                         index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
//                       }`}
//                     >
//                       <td className="px-4 py-4 font-medium text-slate-800 border-r">{item.BrcikworkUID || '-'}</td>
//                       <td className="px-4 py-4 border-r">{item.UID || '-'}</td>
//                       <td className="px-4 py-4 border-r">{item.Zone || '-'}</td>
//                       <td className="px-4 py-4 border-r">{item.Activity || '-'}</td>
//                       <td className="px-4 py-4 border-r">{item.SubActivity || '-'}</td>
//                       <td className="px-4 py-4 border-r">{item.Planned || '-'}</td>
//                       <td className="px-4 py-4 text-slate-700 border-r">{item.ActualStart || '-'}</td>
//                       <td className="px-4 py-4 text-slate-700 border-r">{item.ActualEnd || '-'}</td>
//                       <td className="px-4 py-4 border-r font-medium">{item.SiteName || '-'}</td>
//                       <td className="px-4 py-4 border-r">
//                         <span
//                           className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
//                             isDone
//                               ? 'bg-green-100 text-green-700'
//                               : item.status === 'Ongoing'
//                               ? 'bg-blue-100 text-blue-700'
//                               : 'bg-amber-100 text-amber-700'
//                           }`}
//                         >
//                           {item.status || 'Pending'}
//                         </span>
//                       </td>
//                       <td className="px-4 py-4 whitespace-nowrap">
//                         <button
//                           onClick={() => handleFullkittingAction(item.BrcikworkUID)}
//                           disabled={isDone}
//                           className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors mr-2 ${
//                             isDone ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
//                           }`}
//                         >
//                           {isDone ? 'Done ✓' : 'FullKitting'}
//                         </button>
//                         <button
//                           onClick={() => handleChecklistAction(item.BrcikworkUID)}
//                           className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
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

//       {/* Fullkitting Modal (12 images) */}
//       {showFullkittingForm && (
//         <div
//           className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
//           onClick={(e) => e.target === e.currentTarget && setShowFullkittingForm(false)}
//         >
//           <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl">
//             <div className="px-6 py-5 border-b bg-gradient-to-r from-slate-50 to-white flex items-center justify-between sticky top-0 z-10">
//               <div>
//                 <h3 className="text-xl font-semibold text-slate-800">BrickWork Full Kitting Evidence</h3>
//                 <p className="text-sm text-slate-500 mt-0.5">{selectedBrickworkUID}</p>
//               </div>
//               <button
//                 onClick={() => setShowFullkittingForm(false)}
//                 className="text-3xl text-slate-400 hover:text-slate-600 transition-colors"
//               >
//                 ×
//               </button>
//             </div>

//             <div className="p-6 space-y-6">
//               {/* Status */}
//               <div>
//                 <label className="block mb-2 font-medium text-slate-700">Status</label>
//                 <select
//                   value={fullkittingFormData.status}
//                   onChange={(e) => setFullkittingFormData({ ...fullkittingFormData, status: e.target.value })}
//                   className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option>---- Select ----</option>
//                   <option value="Done">Done</option>
                 
//                 </select>
//               </div>

//               {/* 12 Images Grid */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => {
//                   const key = `img${num}`;
//                   return (
//                     <div key={key} className="space-y-3">
//                       <label className="block text-sm font-medium text-slate-700">Image {num}</label>
//                       {fullkittingImages[key] ? (
//                         <div className="relative rounded-xl overflow-hidden border-2 border-green-300">
//                           <img src={fullkittingImages[key]} alt={`Preview ${num}`} className="w-full h-44 object-cover" />
//                           <button
//                             onClick={() => setFullkittingImages((prev) => ({ ...prev, [key]: '' }))}
//                             className="absolute top-2 right-2 bg-red-600 text-white text-xs px-3 py-1 rounded-full"
//                           >
//                             Remove
//                           </button>
//                         </div>
//                       ) : (
//                         <div className="h-44 flex items-center justify-center text-slate-500 bg-slate-50 border-2 border-dashed rounded-xl">
//                           No photo
//                         </div>
//                       )}
//                       <div className="grid grid-cols-2 gap-3">
//                         <label className="cursor-pointer">
//                           <div className="flex justify-center py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200">
//                             Gallery
//                           </div>
//                           <input
//                             type="file"
//                             accept="image/*"
//                             onChange={(e) => handleFileChange(e, key, setFullkittingImages)}
//                             className="hidden"
//                           />
//                         </label>
//                         <label className="cursor-pointer">
//                           <div className="flex justify-center py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200">
//                             Camera
//                           </div>
//                           <input
//                             type="file"
//                             accept="image/*"
//                             capture="environment"
//                             onChange={(e) => handleFileChange(e, key, setFullkittingImages)}
//                             className="hidden"
//                           />
//                         </label>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               <div className="flex gap-4 pt-6">
//                 <button
//                   onClick={handleFullkittingSubmit}
//                   disabled={isSubmitting}
//                   className={`flex-1 py-3.5 rounded-xl font-semibold text-white ${
//                     isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
//                   }`}
//                 >
//                   {isSubmitting ? 'Uploading...' : 'Submit FullKitting'}
//                 </button>
//                 <button
//                   onClick={() => setShowFullkittingForm(false)}
//                   className="flex-1 py-3.5 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300"
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
//           <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
//             <div className="px-6 py-5 border-b bg-gradient-to-r from-slate-50 to-white flex items-center justify-between sticky top-0 z-10">
//               <div>
//                 <h3 className="text-xl font-semibold text-slate-800">BrickWork Checklist</h3>
//                 <p className="text-sm text-slate-500 mt-0.5">{selectedChecklistUID}</p>
//               </div>
//               <button
//                 onClick={() => setShowChecklistModal(false)}
//                 className="text-3xl text-slate-400 hover:text-slate-600"
//               >
//                 ×
//               </button>
//             </div>

//             <div className="p-6">
//               {statusLoading || statusFetching ? (
//                 <div className="text-center py-12">
//                   <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent animate-spin rounded-full mx-auto"></div>
//                   <p className="mt-4">Loading checklist progress...</p>
//                 </div>
//               ) : (
//                 <>
//                   {!selectedSection ? (
//                     <div>
//                       <h4 className="text-lg font-semibold mb-6 text-center">
//                         Select Section to Update
//                       </h4>
//                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
//                         {sections.map((section) => {
//                           const isCompleted = completedSections.includes(section);
//                           return (
//                             <button
//                               key={section}
//                               onClick={() => setSelectedSection(section)}
//                               disabled={isCompleted}
//                               className={`p-5 rounded-xl border-2 text-center transition-all ${
//                                 isCompleted
//                                   ? 'bg-green-50 border-green-300 cursor-not-allowed opacity-70'
//                                   : 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-400 hover:scale-105'
//                               }`}
//                             >
//                               <div className="font-medium">{section}</div>
//                               {isCompleted && (
//                                 <div className="mt-2 text-green-600 text-sm font-medium">✓ Completed</div>
//                               )}
//                             </button>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="space-y-6">
//                       {/* Back button + Title */}
//                       <div className="flex items-center justify-between">
//                         <h4 className="text-xl font-bold text-slate-800">{selectedSection}</h4>
//                         <button
//                           onClick={() => setSelectedSection(null)}
//                           className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
//                         >
//                           Back to Sections
//                         </button>
//                       </div>

//                       {/* Status */}
//                       <div>
//                         <label className="block mb-2 font-medium">Status</label>
//                         <select
//                           value={checklistFormData.status}
//                           onChange={(e) =>
//                             setChecklistFormData({ ...checklistFormData, status: e.target.value })
//                           }
//                           className="w-full px-4 py-3 border rounded-xl"
//                         >
//                           <option>---- Select ----</option>
//                           <option value="Done">Done</option>
                        
//                         </select>
//                       </div>

//                       {/* Remark (common) */}
//                       <div>
//                         <label className="block mb-2 font-medium">Remark / Comment</label>
//                         <textarea
//                           value={checklistFormData.remark}
//                           onChange={(e) =>
//                             setChecklistFormData({ ...checklistFormData, remark: e.target.value })
//                           }
//                           className="w-full px-4 py-3 border rounded-xl h-24"
//                           placeholder="Any remarks or observations..."
//                         />
//                       </div>

//                       {/* Images - section के अनुसार conditionally render कर सकते हो */}
//                       {/* अभी basic common image field रखा है — तुम्हें और fields जोड़ने हैं */}
//                       <div>
//                         <label className="block mb-2 font-medium">Upload Image (if required)</label>
//                         {checklistImages.image ? (
//                           <div className="relative">
//                             <img src={checklistImages.image} alt="preview" className="w-full h-48 object-cover rounded-xl" />
//                             <button
//                               onClick={() => setChecklistImages((p) => ({ ...p, image: '' }))}
//                               className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs"
//                             >
//                               Remove
//                             </button>
//                           </div>
//                         ) : (
//                           <div className="h-48 flex items-center justify-center border-2 border-dashed rounded-xl bg-slate-50">
//                             No photo
//                           </div>
//                         )}
//                         <div className="grid grid-cols-2 gap-3 mt-3">
//                           <label className="cursor-pointer">
//                             <div className="py-3 bg-blue-50 text-blue-700 text-center rounded-lg border">
//                               Gallery
//                             </div>
//                             <input
//                               type="file"
//                               accept="image/*"
//                               onChange={(e) => handleFileChange(e, 'image', setChecklistImages)}
//                               className="hidden"
//                             />
//                           </label>
//                           <label className="cursor-pointer">
//                             <div className="py-3 bg-indigo-50 text-indigo-700 text-center rounded-lg border">
//                               Camera
//                             </div>
//                             <input
//                               type="file"
//                               accept="image/*"
//                               capture="environment"
//                               onChange={(e) => handleFileChange(e, 'image', setChecklistImages)}
//                               className="hidden"
//                             />
//                           </label>
//                         </div>
//                       </div>

//                       <div className="flex gap-4 pt-6">
//                         <button
//                           onClick={handleChecklistSubmit}
//                           disabled={isChecklistSubmitting}
//                           className={`flex-1 py-3 rounded-xl text-white font-medium ${
//                             isChecklistSubmitting ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
//                           }`}
//                         >
//                           {isChecklistSubmitting ? 'Submitting...' : 'Submit Section'}
//                         </button>
//                         <button
//                           onClick={() => setSelectedSection(null)}
//                           className="flex-1 py-3 bg-slate-200 rounded-xl"
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BrickWork;





// src/pages/BrickWork.jsx

import React, { useState, useMemo } from 'react';
import {
  useGetFullkittingBrickDataQuery,
  useSubmitFullkittingBrickMutation,
  useSubmitBrickChecklistItemMutation,
  useGetBrickChecklistStatusQuery,
} from '../../features/BrickWork/BrickWorkSlice'; // अपना सही path डालना

const BrickWork = () => {
  const loggedInUserType = sessionStorage.getItem('userType') || '';
  const isAdmin = loggedInUserType.trim().toUpperCase().replace(/\s+/g, '') === 'ADMIN';

  // Fullkitting List
  const { data, isLoading, error } = useGetFullkittingBrickDataQuery();

  const [submitFullkitting, { isLoading: isSubmitting }] = useSubmitFullkittingBrickMutation();
  const [submitChecklistItem, { isLoading: isChecklistSubmitting }] = useSubmitBrickChecklistItemMutation();

  // Fullkitting Modal States
  const [showFullkittingForm, setShowFullkittingForm] = useState(false);
  const [selectedBrickworkUID, setSelectedBrickworkUID] = useState('');
  const [fullkittingFormData, setFullkittingFormData] = useState({ status: '---- Select ----' });
  const [fullkittingImages, setFullkittingImages] = useState({
    img1: '', img2: '', img3: '', img4: '', img5: '', img6: '',
    img7: '', img8: '', img9: '', img10: '', img11: '', img12: '',
  });

  // Checklist Modal States
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [selectedChecklistUID, setSelectedChecklistUID] = useState('');
  const [selectedSection, setSelectedSection] = useState(null);

  const [checklistFormData, setChecklistFormData] = useState({
    status: '---- Select ----',
    remark: '',
  });

  const [checklistImages, setChecklistImages] = useState({
    image: '',
    helmet: '', mask: '', gloves: '', firstAidBox: '', shoes: '',
    jointingProper: '', columnBimDhar: '', guniyaTesting: '', plumbBobTesting: '',
  });

  // Checklist Status
  const {
    data: checklistStatus,
    isLoading: statusLoading,
    isFetching: statusFetching,
  } = useGetBrickChecklistStatusQuery(selectedChecklistUID || undefined, {
    skip: !selectedChecklistUID || !showChecklistModal,
    refetchOnMountOrArgChange: true,
  });

  const completedSections = useMemo(() => {
    return checklistStatus?.completedItems || [];
  }, [checklistStatus]);

  const filteredData = isAdmin
    ? (data || [])
    : (data || []).filter(
        (item) => item.SiteName?.trim().toUpperCase() === loggedInUserType.trim().toUpperCase()
      );

  const handleFullkittingAction = (uid) => {
    setSelectedBrickworkUID(uid);
    setShowFullkittingForm(true);
  };

  const handleChecklistAction = (uid) => {
    setSelectedChecklistUID(uid);
    setShowChecklistModal(true);
    setSelectedSection(null);
  };

  const handleFileChange = (e, key, setState) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setState((prev) => ({ ...prev, [key]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleFullkittingSubmit = async () => {
    if (Object.values(fullkittingImages).some((img) => !img)) {
      alert('कृपया सभी १२ फोटो अपलोड करें');
      return;
    }
    if (fullkittingFormData.status === '---- Select ----') {
      alert('कृपया वैध स्टेटस चुनें');
      return;
    }

    try {
      await submitFullkitting({
        BrcikworkUID: selectedBrickworkUID,
        image1: fullkittingImages.img1,
        image2: fullkittingImages.img2,
        image3: fullkittingImages.img3,
        image4: fullkittingImages.img4,
        image5: fullkittingImages.img5,
        image6: fullkittingImages.img6,
        image7: fullkittingImages.img7,
        image8: fullkittingImages.img8,
        image9: fullkittingImages.img9,
        image10: fullkittingImages.img10,
        image11: fullkittingImages.img11,
        image12: fullkittingImages.img12,
      }).unwrap();

      alert('BrickWork Full Kitting सफलतापूर्वक सेव हो गया!');
      setShowFullkittingForm(false);
      setFullkittingImages({
        img1: '', img2: '', img3: '', img4: '', img5: '', img6: '',
        img7: '', img8: '', img9: '', img10: '', img11: '', img12: '',
      });
      setFullkittingFormData({ status: '---- Select ----' });
    } catch (err) {
      console.error('Fullkitting error:', err);
      alert('Fullkitting submit फेल हो गया! ' + (err?.data?.error || err.message || ''));
    }
  };

  const handleChecklistSubmit = async () => {
    if (checklistFormData.status === '---- Select ----') {
      alert('कृपया स्टेटस चुनें');
      return;
    }

    const payload = {
      BrickworkUID: selectedChecklistUID,
      section: selectedSection,
      status: checklistFormData.status,
      remark: checklistFormData.remark.trim(),
    };

    if (selectedSection === 'Safety Checklist') {
      payload.helmetImage = checklistImages.helmet || '';
      payload.maskImage = checklistImages.mask || '';
      payload.glovesImage = checklistImages.gloves || '';
      payload.firstAidBoxImage = checklistImages.firstAidBox || '';
      payload.shoesImage = checklistImages.shoes || '';
    } else if (selectedSection === 'Quality Check') {
      payload.jointingProperImage = checklistImages.jointingProper || '';
      payload.columnBimDharImage = checklistImages.columnBimDhar || '';
      payload.guniyaTestingImage = checklistImages.guniyaTesting || '';
      payload.plumbBobTestingImage = checklistImages.plumbBobTesting || '';
    } else {
      payload.image = checklistImages.image || '';
    }

    try {
      const result = await submitChecklistItem(payload).unwrap();
      console.log('Checklist submit success:', result);

      alert(`${selectedSection} सफलतापूर्वक सेव हो गया!`);
      
      // Reset
      setChecklistFormData({ status: '---- Select ----', remark: '' });
      setChecklistImages({
        image: '', helmet: '', mask: '', gloves: '', firstAidBox: '', shoes: '',
        jointingProper: '', columnBimDhar: '', guniyaTesting: '', plumbBobTesting: '',
      });
      setSelectedSection(null);
    } catch (err) {
      console.error('Checklist submit error:', err);
      alert('Submit फेल हो गया! ' + (err?.data?.error || err.message || 'Unknown error'));
    }
  };

  const sections = [
    'Safety Checklist',
    'Brick Layout',
    'Start Brick Work',
    'Sill Level DPC',
    'Brick Wall & Window Opening',
    'Lintel Level DPC',
    'Above Lintel Brick Work Ventilate',
    'Joint Filling',
    'Quality Check',
  ];

  const renderImageUpload = (key, label, state, setState) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {state[key] ? (
        <div className="relative rounded-xl overflow-hidden border-2 border-green-300">
          <img src={state[key]} alt={label} className="w-full h-40 object-cover" />
          <button
            onClick={() => setState((p) => ({ ...p, [key]: '' }))}
            className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs shadow"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="h-40 flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl text-slate-500">
          No photo selected
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <label className="cursor-pointer">
          <div className="py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 text-center transition">
            Gallery
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, key, setState)}
            className="hidden"
          />
        </label>
        <label className="cursor-pointer">
          <div className="py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 text-center transition">
            Camera
          </div>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFileChange(e, key, setState)}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className="p-5 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold border-l-4 border-blue-600 pl-4 text-slate-800">
          Brick Work Portal: {isAdmin ? 'All Sites (Admin View)' : (loggedInUserType || 'Unknown Site')}
        </h2>
        {isLoading && (
          <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Table - same as before */}
      {isLoading ? (
        <div className="text-center mt-20">
          <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
          <p className="text-slate-600 font-medium">Loading brickwork records...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 mt-10">
          <p className="text-lg font-medium">Failed to load data</p>
          <p className="text-sm mt-2">{error?.data?.message || 'Please try again later'}</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <p className="text-xl font-medium">
            {isAdmin ? 'No records found in the system' : 'No records found for your site'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1400px] text-sm">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Brickwork UID</th>
                  <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">UID</th>
                  <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Zone</th>
                  <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Activity</th>
                  <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Sub Activity</th>
                  <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Planned</th>
                  <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Actual Start</th>
                  <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Actual End</th>
                  <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Site Name</th>
                  <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Status</th>
                  <th className="px-4 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => {
                  const isDone = item.status?.toLowerCase().includes('done');

                  return (
                    <tr
                      key={item.BrcikworkUID || item.UID || index}
                      className={`border-b hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                    >
                      <td className="px-4 py-4 font-medium text-slate-800 border-r">{item.BrcikworkUID || '-'}</td>
                      <td className="px-4 py-4 border-r">{item.UID || '-'}</td>
                      <td className="px-4 py-4 border-r">{item.Zone || '-'}</td>
                      <td className="px-4 py-4 border-r">{item.Activity || '-'}</td>
                      <td className="px-4 py-4 border-r">{item.SubActivity || '-'}</td>
                      <td className="px-4 py-4 border-r">{item.Planned || '-'}</td>
                      <td className="px-4 py-4 text-slate-700 border-r">{item.ActualStart || '-'}</td>
                      <td className="px-4 py-4 text-slate-700 border-r">{item.ActualEnd || '-'}</td>
                      <td className="px-4 py-4 border-r font-medium">{item.SiteName || '-'}</td>
                      <td className="px-4 py-4 border-r">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            isDone ? 'bg-green-100 text-green-700' : item.status === 'Ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {item.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleFullkittingAction(item.BrcikworkUID)}
                          disabled={isDone}
                          className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors mr-2 ${
                            isDone ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {isDone ? 'Done ✓' : 'FullKitting'}
                        </button>
                        <button
                          onClick={() => handleChecklistAction(item.BrcikworkUID)}
                          className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
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
      {showFullkittingForm && (
        <div
          className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowFullkittingForm(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-5 border-b bg-gradient-to-r from-slate-50 to-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">BrickWork Full Kitting Evidence</h3>
                <p className="text-sm text-slate-500 mt-0.5">{selectedBrickworkUID}</p>
              </div>
              <button onClick={() => setShowFullkittingForm(false)} className="text-3xl text-slate-400 hover:text-slate-600">
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block mb-2 font-medium text-slate-700">Status</label>
                <select
                  value={fullkittingFormData.status}
                  onChange={(e) => setFullkittingFormData({ ...fullkittingFormData, status: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="---- Select ----">---- Select ----</option>
                  <option value="Done">Done</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => {
                  const key = `img${num}`;
                  return (
                    <div key={key} className="space-y-3">
                      <label className="block text-sm font-medium text-slate-700">Image {num}</label>
                      {fullkittingImages[key] ? (
                        <div className="relative rounded-xl overflow-hidden border-2 border-green-300 bg-green-50/30">
                          <img src={fullkittingImages[key]} alt={`Preview ${num}`} className="w-full h-44 object-cover" />
                          <button
                            onClick={() => setFullkittingImages((prev) => ({ ...prev, [key]: '' }))}
                            className="absolute top-2 right-2 bg-red-600 text-white text-xs px-3 py-1 rounded-full shadow-md hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="h-44 flex items-center justify-center text-slate-500 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl">
                          No photo selected yet
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <label className="cursor-pointer">
                          <div className="flex justify-center py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition">
                            Gallery
                          </div>
                          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, key, setFullkittingImages)} className="hidden" />
                        </label>
                        <label className="cursor-pointer">
                          <div className="flex justify-center py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 transition">
                            Camera
                          </div>
                          <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileChange(e, key, setFullkittingImages)} className="hidden" />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleFullkittingSubmit}
                  disabled={isSubmitting}
                  className={`flex-1 py-3.5 rounded-xl font-semibold text-white transition-all ${isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {isSubmitting ? 'Uploading...' : 'Submit Evidence'}
                </button>
                <button
                  onClick={() => setShowFullkittingForm(false)}
                  className="flex-1 py-3.5 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-all"
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
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-5 border-b bg-gradient-to-r from-slate-50 to-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">BrickWork Checklist</h3>
                <p className="text-sm text-slate-500 mt-0.5">{selectedChecklistUID}</p>
              </div>
              <button onClick={() => setShowChecklistModal(false)} className="text-3xl text-slate-400 hover:text-slate-600">
                ×
              </button>
            </div>

            <div className="p-6">
              {statusLoading || statusFetching ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent animate-spin rounded-full mx-auto"></div>
                  <p className="mt-4 text-slate-600">Loading checklist progress...</p>
                </div>
              ) : (
                <>
                  {!selectedSection ? (
                    <div>
                      <h4 className="text-lg font-semibold mb-6 text-center text-slate-800">
                        Select Section to Update
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {sections.map((section) => {
                          const isCompleted = completedSections.includes(section);
                          return (
                            <button
                              key={section}
                              onClick={() => setSelectedSection(section)}
                              disabled={isCompleted}
                              className={`p-5 rounded-xl border-2 text-center transition-all duration-200 ${
                                isCompleted
                                  ? 'bg-green-50 border-green-300 cursor-not-allowed opacity-70'
                                  : 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-400 hover:scale-105'
                              }`}
                            >
                              <div className="font-medium text-slate-800">{section}</div>
                              {isCompleted && <div className="mt-2 text-green-600 text-sm font-medium">✓ Completed</div>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b">
                        <h4 className="text-xl font-bold text-slate-800">{selectedSection}</h4>
                        <button
                          onClick={() => setSelectedSection(null)}
                          className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        >
                          Back to Sections
                        </button>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="block mb-2 font-medium text-slate-700">Status</label>
                        <select
                          value={checklistFormData.status}
                          onChange={(e) => setChecklistFormData({ ...checklistFormData, status: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="---- Select ----">---- Select ----</option>
                          <option value="Done">Done</option>
                         
                        </select>
                      </div>

                      {/* Remark */}
                      {/* <div>
                        <label className="block mb-2 font-medium text-slate-700">Remark / Comment (optional)</label>
                        <textarea
                          value={checklistFormData.remark}
                          onChange={(e) => setChecklistFormData({ ...checklistFormData, remark: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl h-24 resize-none"
                          placeholder="Any observations or notes..."
                        />
                      </div> */}

                      {/* Conditional Images */}
                      <div className="space-y-6">
                        {selectedSection === 'Safety Checklist' ? (
                          <>
                            <h5 className="font-medium text-slate-700">Safety Equipment Photos (all required)</h5>
                            {renderImageUpload('helmet', 'Helmet', checklistImages, setChecklistImages)}
                            {renderImageUpload('mask', 'Mask', checklistImages, setChecklistImages)}
                            {renderImageUpload('gloves', 'Gloves', checklistImages, setChecklistImages)}
                            {renderImageUpload('firstAidBox', 'First Aid Box', checklistImages, setChecklistImages)}
                            {renderImageUpload('shoes', 'Safety Shoes', checklistImages, setChecklistImages)}
                          </>
                        ) : selectedSection === 'Quality Check' ? (
                          <>
                            <h5 className="font-medium text-slate-700">Quality Check Photos</h5>
                            {renderImageUpload('jointingProper', 'Jointing Proper', checklistImages, setChecklistImages)}
                            {renderImageUpload('columnBimDhar', 'Column Beam Dhar', checklistImages, setChecklistImages)}
                            {renderImageUpload('guniyaTesting', 'Guniya Testing', checklistImages, setChecklistImages)}
                            {renderImageUpload('plumbBobTesting', 'Plumb Bob Testing', checklistImages, setChecklistImages)}
                          </>
                        ) : (
                          <>
                            <h5 className="font-medium text-slate-700">Section Photo (if required)</h5>
                            {renderImageUpload('image', 'Upload Image', checklistImages, setChecklistImages)}
                          </>
                        )}
                      </div>

                      <div className="flex gap-4 pt-6">
                        <button
                          onClick={handleChecklistSubmit}
                          disabled={isChecklistSubmitting}
                          className={`flex-1 py-3.5 rounded-xl text-white font-semibold transition-all ${
                            isChecklistSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {isChecklistSubmitting ? 'Submitting...' : `Submit ${selectedSection}`}
                        </button>
                        <button
                          onClick={() => setSelectedSection(null)}
                          className="flex-1 py-3.5 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrickWork;