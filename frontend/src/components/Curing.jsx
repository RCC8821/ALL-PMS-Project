
import React, { useState } from 'react';
import {
  useGetFullkittingDataQuery,
  useSubmitFullkittingMutation,
  useGetCuringProgressQuery,
  useSubmitDayCuringMutation,
} from '../../src/features/Curing/fullkittingSlice'; // अपना सही path डालना

const Curing = () => {
  const loggedInUserType = sessionStorage.getItem('userType') || '';

  // Admin detection (case-insensitive + spaces remove)
  const isAdmin = loggedInUserType.trim().toUpperCase().replace(/\s+/g, '') === 'ADMIN';

  // Fullkitting List
  const { data, isLoading, error } = useGetFullkittingDataQuery();

  const [submitFullkitting, { isLoading: isSubmitting }] = useSubmitFullkittingMutation();
  const [submitDayCuring, { isLoading: isDaySubmitting }] = useSubmitDayCuringMutation();

  // Fullkitting Modal States
  const [showForm, setShowForm] = useState(false);
  const [selectedUID, setSelectedUID] = useState('');
  const [formData, setFormData] = useState({ status: '---- Select ----' });
  const [images, setImages] = useState({
    ponding: '',
    gunnyBag: '',
    motorPipe: '',
    waterAvail: '',
    chowkidar: '',
  });

  // Days Modal States
  const [showDaysModal, setShowDaysModal] = useState(false);
  const [selectedDaysCuringUID, setSelectedDaysCuringUID] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);

  const [dayFormData, setDayFormData] = useState({
    status: '---- Select ----',
    doneBy: ''
  });
  const [dayImages, setDayImages] = useState({
    morning: '',
    afternoon: '',
    evening: ''
  });

  // Progress API - only when Days modal is open
  const {
    data: progressData,
    isLoading: progressLoading,
    isFetching: progressFetching
  } = useGetCuringProgressQuery(selectedDaysCuringUID, {
    skip: !selectedDaysCuringUID || !showDaysModal,
  });

  const completedDays = progressData?.progress?.completedDays || [];

  // Data filtering logic
  const filteredData = isAdmin 
    ? (data || []) 
    : (data || []).filter(item => 
        item.SiteName?.trim().toUpperCase() === loggedInUserType.trim().toUpperCase()
      );

  const handleFullkittingAction = (uid) => {
    setSelectedUID(uid);
    setShowForm(true);
  };

  const handleDaysAction = (uid) => {
    setSelectedDaysCuringUID(uid);
    setShowDaysModal(true);
    setSelectedDay(null);
  };

  const handleDaySelection = (day) => {
    if (completedDays.includes(day)) return;
    setSelectedDay(day);
    setDayFormData({ status: '---- Select ----', doneBy: '' });
    setDayImages({ morning: '', afternoon: '', evening: '' });
  };

  const handleFileChange = (e, key) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImages((prev) => ({ ...prev, [key]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDayFileChange = (e, key) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setDayImages((prev) => ({ ...prev, [key]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitFullkitting = async () => {
    if (Object.values(images).some(img => !img)) {
      alert('कृपया सभी ५ फोटो अपलोड करें');
      return;
    }
    if (formData.status === '---- Select ----') {
      alert('कृपया वैध स्टेटस चुनें');
      return;
    }

    try {
      await submitFullkitting({
        CuringUID: selectedUID,
        status: formData.status,
        pondingImage: images.ponding,
        gunnyBagImage: images.gunnyBag,
        motorWaterPipeImage: images.motorPipe,
        waterAvailabilityImage: images.waterAvail,
        chowkidarImage: images.chowkidar,
      }).unwrap();

      alert('Full Kitting डेटा सफलतापूर्वक सेव हो गया!');
      setShowForm(false);
      setImages({ ponding: '', gunnyBag: '', motorPipe: '', waterAvail: '', chowkidar: '' });
      setFormData({ status: '---- Select ----' });
    } catch (err) {
      alert('सबमिशन फेल हो गया!');
      console.error(err);
    }
  };

  const handleDaySubmit = async () => {
    if (Object.values(dayImages).some(img => !img)) {
      alert('कृपया Morning, Afternoon और Evening सभी ३ फोटो अपलोड करें');
      return;
    }
    if (dayFormData.status === '---- Select ----') {
      alert('कृपया वैध स्टेटस चुनें');
      return;
    }
    if (!dayFormData.doneBy.trim()) {
      alert('कृपया "Done By" का नाम लिखें');
      return;
    }

    try {
      await submitDayCuring({
        CuringUID: selectedDaysCuringUID,
        day: selectedDay,
        status: dayFormData.status,
        morningImage: dayImages.morning,
        afternoonImage: dayImages.afternoon,
        eveningImage: dayImages.evening,
        doneBy: dayFormData.doneBy,
      }).unwrap();

      alert(`Day ${selectedDay} सफलतापूर्वक सेव हो गया!`);
      setSelectedDay(null);
    } catch (err) {
      alert('Day submit फेल हो गया!');
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const isDayCompleted = (day) => completedDays.includes(day);

  return (
    <div className="p-5 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold border-l-4 border-blue-600 pl-4 text-slate-800">
          Curing Portal: {isAdmin ? 'All Sites (Admin View)' : (loggedInUserType || 'Unknown Site')}
        </h2>
        {isLoading && (
          <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {isLoading ? (
        <div className="text-center mt-20">
          <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
          <p className="text-slate-600 font-medium">Loading curing records...</p>
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
                  <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Curing UID</th>
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
                  const isDone = item.status === 'Done';

                  return (
                    <tr
                      key={item.CuringUID}
                      className={`border-b hover:bg-slate-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      <td className="px-4 py-4 font-medium text-slate-800 border-r">{item.CuringUID}</td>
                     
                      <td className="px-4 py-4 border-r">{item.UID || '-'}</td>
                      <td className="px-4 py-4 border-r">{item.Zone || '-'}</td>
                      <td className="px-4 py-4 border-r">{item.Activity || '-'}</td>
                      <td className="px-4 py-4 border-r">{item.SubActivity || '-'}</td>
                      <td className="px-4 py-4 border-r">{item.Planned || '-'}</td>
                      <td className="px-4 py-4 text-slate-700 border-r">{(item.ActualStart)}</td>
                      <td className="px-4 py-4 text-slate-700 border-r">{(item.ActualEnd)}</td>
                       <td className="px-4 py-4 border-r font-medium">{item.SiteName || '-'}</td>
                      <td className="px-4 py-4 border-r">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            isDone
                              ? 'bg-green-100 text-green-700'
                              : item.status === 'Ongoing'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {item.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleFullkittingAction(item.CuringUID)}
                          disabled={isDone}
                          className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors mr-2 ${
                            isDone ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {isDone ? 'Done ✓' : 'FullKitting'}
                        </button>
                        <button
                          onClick={() => handleDaysAction(item.CuringUID)}
                          className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Days
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
      {showForm && (
        <div
          className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-5 border-b bg-gradient-to-r from-slate-50 to-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Full Kitting Evidence</h3>
                <p className="text-sm text-slate-500 mt-0.5">{selectedUID}</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-3xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <label className="block mb-2 font-medium text-slate-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="---- Select ----">---- Select ----</option>
                  <option value="Done">Done</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              {/* Images Grid */}
              <div className="grid gap-6">
                {[
                  { label: '1. Ponding', key: 'ponding' },
                  { label: '2. Gunny Bag Covering', key: 'gunnyBag' },
                  { label: '3. Motor & Pipe Arrangement', key: 'motorPipe' },
                  { label: '4. Water Availability', key: 'waterAvail' },
                  { label: '5. Chowkidar / Security', key: 'chowkidar' },
                ].map((item) => (
                  <div key={item.key} className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">{item.label}</label>

                    {images[item.key] ? (
                      <div className="relative rounded-xl overflow-hidden border-2 border-green-300 bg-green-50/30">
                        <img
                          src={images[item.key]}
                          alt={`Preview of ${item.label}`}
                          className="w-full h-44 object-cover"
                        />
                        <button
                          onClick={() => setImages((prev) => ({ ...prev, [item.key]: '' }))}
                          className="absolute top-2 right-2 bg-red-600 text-white text-xs px-3 py-1 rounded-full shadow-md hover:bg-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="h-44 flex items-center justify-center text-slate-500 text-sm bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl">
                        No photo selected yet
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <label className="cursor-pointer">
                        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg border border-blue-200 transition-colors">
                          Gallery
                        </div>
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, item.key)} className="hidden" />
                      </label>

                      <label className="cursor-pointer">
                        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg border border-indigo-200 transition-colors">
                          Camera
                        </div>
                        <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileChange(e, item.key)} className="hidden" />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleSubmitFullkitting}
                  disabled={isSubmitting}
                  className={`flex-1 py-3.5 rounded-xl font-semibold text-white transition-all ${
                    isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isSubmitting ? 'Uploading...' : 'Submit Evidence'}
                </button>

                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3.5 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Days Modal */}
      {showDaysModal && (
        <div
          className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowDaysModal(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-5 border-b bg-gradient-to-r from-slate-50 to-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Curing Days Progress</h3>
                <p className="text-sm text-slate-500 mt-0.5">{selectedDaysCuringUID}</p>
              </div>
              <button
                onClick={() => setShowDaysModal(false)}
                className="text-3xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {progressLoading || progressFetching ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-slate-600">Loading curing progress...</p>
                </div>
              ) : !selectedDay ? (
                <div>
                  <div className="text-center mb-8">
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">
                      Select Day to Record Curing
                    </h4>
                    <p className="text-sm text-slate-500">
                      {completedDays.length}/15 days completed
                    </p>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                    {Array.from({ length: 15 }, (_, i) => i + 1).map((day) => {
                      const isCompleted = isDayCompleted(day);
                      return (
                        <button
                          key={day}
                          onClick={() => handleDaySelection(day)}
                          disabled={isCompleted}
                          className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-center
                            ${isCompleted
                              ? 'bg-green-50 border-green-300 cursor-not-allowed opacity-75'
                              : 'bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-500 hover:to-indigo-600 border-blue-200 hover:border-blue-500 hover:scale-105 hover:shadow-lg'}
                          `}
                        >
                          <div className="text-xs font-medium text-blue-600 mb-1">Day</div>
                          <div className={`text-3xl font-bold ${isCompleted ? 'text-green-700' : 'text-blue-700'}`}>
                            {day}
                          </div>

                          {isCompleted && (
                            <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                              ✓ Complete
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-5 border-b-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl font-bold text-white">{selectedDay}</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-800">Day {selectedDay} Details</h4>
                        <p className="text-xs text-slate-500">Complete all fields and upload images</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedDay(null)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
                    >
                      Back
                    </button>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block mb-2 font-medium text-slate-700">Curing Status</label>
                    <select
                      value={dayFormData.status}
                      onChange={(e) => setDayFormData({ ...dayFormData, status: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="---- Select ----">---- Select Status ----</option>
                      <option value="Done">Done</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  {/* Photos */}
                  <div className="space-y-6">
                    {[
                      { label: 'Morning Image', key: 'morning' },
                      { label: 'Afternoon Image', key: 'afternoon' },
                      { label: 'Evening Image', key: 'evening' },
                    ].map((item) => (
                      <div key={item.key}>
                        <label className="block mb-2 font-medium text-slate-700">{item.label}</label>
                        {dayImages[item.key] ? (
                          <div className="relative">
                            <img
                              src={dayImages[item.key]}
                              alt={item.label}
                              className="w-full h-48 object-cover rounded-xl"
                            />
                            <button
                              onClick={() => setDayImages(prev => ({ ...prev, [item.key]: '' }))}
                              className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="h-48 flex items-center justify-center bg-slate-100 rounded-xl border-2 border-dashed border-slate-300">
                            No photo
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleDayFileChange(e, item.key)}
                          className="mt-2"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Done By */}
                  <div>
                    <label className="block mb-2 font-medium text-slate-700">Done By</label>
                    <input
                      type="text"
                      value={dayFormData.doneBy}
                      onChange={(e) => setDayFormData({ ...dayFormData, doneBy: e.target.value })}
                      placeholder="Enter name"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleDaySubmit}
                      disabled={isDaySubmitting}
                      className={`flex-1 py-3 rounded-xl text-white ${
                        isDaySubmitting ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {isDaySubmitting ? 'Submitting...' : `Submit Day ${selectedDay}`}
                    </button>
                    <button
                      onClick={() => setSelectedDay(null)}
                      className="flex-1 py-3 bg-slate-200 rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Curing;