import React, { useState, useEffect } from 'react';
import {
  useGetFullkittingCastingDataQuery,
  useSubmitFullkittingCastingMutation,
  useSubmitChecklistItemMutation,
  useGetChecklistStatusQuery,
} from '../../features/Casting/FullkittingCastingSlice';

const Casting = () => {
  const loggedInUserType = sessionStorage.getItem('userType') || '';
  const isAdmin = loggedInUserType.trim().toUpperCase().replace(/\s+/g, '') === 'ADMIN';

  // RTK Query hooks
  const { data, isLoading, error } = useGetFullkittingCastingDataQuery();
  console.log('Fullkitting Query Status:', { data });

  const [submitFullkitting, { isLoading: isSubmitting }] = useSubmitFullkittingCastingMutation();
  const [submitChecklistItem, { isLoading: isChecklistSubmitting }] = useSubmitChecklistItemMutation();

  // Modal states - Fullkitting
  const [showForm, setShowForm] = useState(false);
  const [selectedUID, setSelectedUID] = useState('');
  const [formData, setFormData] = useState({
    status: '---- Select ----',
    admixtures: '',
    mixtureMachine: '',
  });
  const [images, setImages] = useState({
    cement: '',
    aggregate: '',
    sand: '',
    mortar: '',
    steel: '',
    bindingWire: '',
    coverBlock: '',
    shutteringMaterial: '',
    handTools: '',
    cutterMachine: '',
    grinderMachine: '',
  });

  // Modal states - Checklist
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [selectedChecklistUID, setSelectedChecklistUID] = useState('');
  const [selectedChecklistItem, setSelectedChecklistItem] = useState(null);
  const [checklistData, setChecklistData] = useState({});
  const [checklistImage, setChecklistImage] = useState({});

  // Form states for each checklist item
  const [castingForm, setCastingForm] = useState({
    status: '---- Select ----',
    daysInCasting: '',
  });
  const [deshutteringForm, setDeshutteringForm] = useState({
    status: '---- Select ----',
    repairRequired: '---- Select ----',
  });
  const [repairForm, setRepairForm] = useState({ status: '---- Select ----' });
  const [qualityForm, setQualityForm] = useState({ status: '---- Select ----' });
  const [safetyForm, setSafetyForm] = useState({ status: '---- Select ----' }); // NEW

  const DEMO_CHECKLIST_ITEMS = ['Safety Checklist', 'Casting', 'Deshuttering', 'Repair', 'Quality Check'];

  const filteredData = isAdmin
    ? (data || [])
    : (data || []).filter(
        (item) =>
          item.SiteName?.trim().toUpperCase() ===
          loggedInUserType.trim().toUpperCase()
      );

  const getCompletedItems = (uid) => {
    return checklistData[uid]?.completedItems || [];
  };

  // Checklist status fetch
  const { data: checklistStatus, isFetching: isFetchingStatus } = useGetChecklistStatusQuery(
    selectedChecklistUID,
    {
      skip: !showChecklistModal || !selectedChecklistUID,
    }
  );

  useEffect(() => {
    if (showChecklistModal && selectedChecklistUID && checklistStatus?.success) {
      const completed = checklistStatus.completedItems || [];
      const details = checklistStatus.details || {};

      setChecklistData((prev) => ({
        ...prev,
        [selectedChecklistUID]: {
          completedItems: completed,
          repairRequired: details['Repair Required'] || null,
        },
      }));
    }
  }, [showChecklistModal, selectedChecklistUID, checklistStatus]);

  const handleFullkittingAction = (uid) => {
    setSelectedUID(uid);
    setShowForm(true);
    setFormData({
      status: '---- Select ----',
      admixtures: '',
      mixtureMachine: '',
    });
    setImages({
      cement: '',
      aggregate: '',
      sand: '',
      mortar: '',
      steel: '',
      bindingWire: '',
      coverBlock: '',
      shutteringMaterial: '',
      handTools: '',
      cutterMachine: '',
      grinderMachine: '',
    });
  };

  const handleChecklistAction = (uid) => {
    console.log('Opening Checklist modal for UID:', uid);
    setSelectedChecklistUID(uid);
    setSelectedChecklistItem(null);
    setShowChecklistModal(true);
    setChecklistImage({});
    setCastingForm({ status: '---- Select ----', daysInCasting: '' });
    setDeshutteringForm({ status: '---- Select ----', repairRequired: '---- Select ----' });
    setRepairForm({ status: '---- Select ----' });
    setQualityForm({ status: '---- Select ----' });
    setSafetyForm({ status: '---- Select ----' }); // reset
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

  const handleChecklistFileChange = (e, key = 'default') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setChecklistImage((prev) => ({ ...prev, [key]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitFullkitting = async () => {
    const cleanedUID = selectedUID?.trim().toUpperCase();

    const payload = {
      CuringUID: cleanedUID,
      cementImage: images.cement || undefined,
      aggregateImage: images.aggregate || undefined,
      sandImage: images.sand || undefined,
      mortarImage: images.mortar || undefined,
      steelImage: images.steel || undefined,
      bindingWireImage: images.bindingWire || undefined,
      coverBlockImage: images.coverBlock || undefined,
      shutteringMaterialImage: images.shutteringMaterial || undefined,
      handToolsImage: images.handTools || undefined,
      cutterMachineImage: images.cutterMachine || undefined,
      grinderMachineImage: images.grinderMachine || undefined,
      admixtures: formData.admixtures,
      mixtureMachine: formData.mixtureMachine,
    };

    try {
      await submitFullkitting(payload).unwrap();
      alert('Fullkitting data सफलतापूर्वक सेव हो गया!');
      setShowForm(false);
    } catch (err) {
      alert('सबमिट फेल हो गया → ' + (err?.data?.error || 'Unknown error'));
    }
  };

  const handleSubmitChecklistItem = async () => {
    const item = selectedChecklistItem;

    // Validation
    if (item === 'Safety Checklist') {
      if (safetyForm.status === '---- Select ----') {
        alert('Safety Checklist का Status select करें');
        return;
      }
      const keys = ['helmet', 'mask', 'gloves', 'firstAidBox', 'shoes'];
      if (!keys.every((k) => checklistImage[k])) {
        alert('Safety Checklist के सभी 5 items की फोटो अपलोड करें');
        return;
      }
    } else if (item === 'Casting') {
      if (castingForm.status === '---- Select ----') {
        alert('Status select करें');
        return;
      }
      if (!castingForm.daysInCasting) {
        alert('No. of days in casting enter करें');
        return;
      }
      if (!checklistImage.default) {
        alert('Photo upload करें');
        return;
      }
    } else if (item === 'Deshuttering') {
      if (deshutteringForm.status === '---- Select ----') {
        alert('Status select करें');
        return;
      }
      if (deshutteringForm.repairRequired === '---- Select ----') {
        alert('Repair Required select करें');
        return;
      }
      if (!checklistImage.default) {
        alert('Photo upload करें');
        return;
      }
    } else if (item === 'Repair') {
      if (repairForm.status === '---- Select ----') {
        alert('Status select करें');
        return;
      }
      if (!checklistImage.default) {
        alert('Photo upload करें');
        return;
      }
    } else if (item === 'Quality Check') {
      if (qualityForm.status === '---- Select ----') {
        alert('Status select करें');
        return;
      }
      if (!checklistImage.default) {
        alert('Photo upload करें');
        return;
      }
    }

    const payload = {
      CuringUID: selectedChecklistUID,
      section: item,
    };

    if (item === 'Safety Checklist') {
      payload.status = safetyForm.status;
      payload.helmetImage = checklistImage.helmet || undefined;
      payload.maskImage = checklistImage.mask || undefined;
      payload.glovesImage = checklistImage.gloves || undefined;
      payload.firstAidBoxImage = checklistImage.firstAidBox || undefined;
      payload.shoesImage = checklistImage.shoes || undefined;
    } else {
      payload.image = checklistImage.default || undefined;

      if (item === 'Casting') {
        payload.status = castingForm.status;
        payload.daysInCasting = castingForm.daysInCasting;
      } else if (item === 'Deshuttering') {
        payload.status = deshutteringForm.status;
        payload.repairRequired = deshutteringForm.repairRequired;
      } else if (item === 'Repair') {
        payload.status = repairForm.status;
      } else if (item === 'Quality Check') {
        payload.status = qualityForm.status;
      }
    }

    try {
      await submitChecklistItem(payload).unwrap();

      setChecklistData((prev) => {
        const uid = selectedChecklistUID;
        const completed = prev[uid]?.completedItems || [];

        let newRepairRequired = prev[uid]?.repairRequired;

        if (item === 'Deshuttering') {
          newRepairRequired = deshutteringForm.repairRequired;
        }

        return {
          ...prev,
          [uid]: {
            completedItems: [...completed, item],
            repairRequired: newRepairRequired,
            items: {
              ...(prev[uid]?.items || {}),
              [item]: {
                status: item === 'Safety Checklist' ? safetyForm.status :
                        item === 'Deshuttering' ? deshutteringForm.status :
                        item === 'Casting' ? castingForm.status :
                        item === 'Repair' ? repairForm.status :
                        qualityForm.status,
                daysInCasting: item === 'Casting' ? castingForm.daysInCasting : undefined,
                repairRequired: item === 'Deshuttering' ? deshutteringForm.repairRequired : undefined,
                timestamp: new Date().toISOString(),
              },
            },
          },
        };
      });

      alert(`${item} सफलतापूर्वक सेव हो गया!`);
      setSelectedChecklistItem(null);
      setChecklistImage({});
      setCastingForm({ status: '---- Select ----', daysInCasting: '' });
      setDeshutteringForm({ status: '---- Select ----', repairRequired: '---- Select ----' });
      setRepairForm({ status: '---- Select ----' });
      setQualityForm({ status: '---- Select ----' });
      setSafetyForm({ status: '---- Select ----' });
    } catch (err) {
      console.error('Checklist submit error:', err);
      alert('सबमिशन फेल हो गया → ' + (err?.data?.error || 'Unknown error'));
    }
  };

  const renderChecklistItemForm = () => {
    const item = selectedChecklistItem;

    if (item === 'Safety Checklist') {
      return (
        <div className="space-y-5">

          {/* NEW: Status Dropdown */}
          <div>
            <label className="block mb-2 font-medium text-slate-700">Status *</label>
            <select
              value={safetyForm.status}
              onChange={(e) => setSafetyForm({ ...safetyForm, status: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="---- Select ----">---- Select ----</option>
              <option value="Done">Done</option>
              {/* <option value="Ongoing">Ongoing</option>
              <option value="Pending">Pending</option> */}
            </select>
          </div>

          {[
            { label: 'Helmet', key: 'helmet' },
            { label: 'Mask', key: 'mask' },
            { label: 'Hand Gloves', key: 'gloves' },
            { label: 'First Aid Box', key: 'firstAidBox' },
            { label: 'Safety Shoes', key: 'shoes' },
          ].map((safetyItem) => (
            <div key={safetyItem.key} className="p-4 border border-slate-200 rounded-xl bg-slate-50">
              <h5 className="font-semibold text-slate-800 mb-3">{safetyItem.label}</h5>
              {checklistImage[safetyItem.key] ? (
                <div className="relative mb-3">
                  <img src={checklistImage[safetyItem.key]} alt={safetyItem.label} className="w-full h-32 object-cover rounded-lg" />
                  <button onClick={() => setChecklistImage((prev) => ({ ...prev, [safetyItem.key]: '' }))} className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs">
                    ×
                  </button>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center bg-white border-2 border-dashed border-slate-300 rounded-lg mb-3 text-slate-400 text-sm">
                  No photo
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <label className="cursor-pointer">
                  <div className="text-center py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 text-sm font-medium">
                    Gallery
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => handleChecklistFileChange(e, safetyItem.key)} className="hidden" />
                </label>
                <label className="cursor-pointer">
                  <div className="text-center py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 text-sm font-medium">
                    Camera
                  </div>
                  <input type="file" accept="image/*" capture="environment" onChange={(e) => handleChecklistFileChange(e, safetyItem.key)} className="hidden" />
                </label>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (item === 'Casting') {
      return (
        <div className="space-y-5">
          <div>
            <label className="block mb-2 font-medium text-slate-700">Status *</label>
            <select
              value={castingForm.status}
              onChange={(e) => setCastingForm({ ...castingForm, status: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="---- Select ----">---- Select ----</option>
              <option value="Done">Done</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium text-slate-700">No. of days in casting *</label>
            <input
              type="number"
              value={castingForm.daysInCasting}
              onChange={(e) => setCastingForm({ ...castingForm, daysInCasting: e.target.value })}
              placeholder="e.g. 7"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-slate-700">Photo Evidence *</label>
            {checklistImage.default ? (
              <div className="relative">
                <img src={checklistImage.default} alt="Evidence" className="w-full h-48 object-cover rounded-xl" />
                <button onClick={() => setChecklistImage({})} className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs">
                  ×
                </button>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl text-slate-400">
                No photo
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <label className="cursor-pointer">
                <div className="py-3 text-center bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200">
                  Gallery
                </div>
                <input type="file" accept="image/*" onChange={(e) => handleChecklistFileChange(e, 'default')} className="hidden" />
              </label>
              <label className="cursor-pointer">
                <div className="py-3 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200">
                  Camera
                </div>
                <input type="file" accept="image/*" capture="environment" onChange={(e) => handleChecklistFileChange(e, 'default')} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      );
    }

    if (item === 'Deshuttering') {
      return (
        <div className="space-y-5">
          <div>
            <label className="block mb-2 font-medium text-slate-700">Status *</label>
            <select
              value={deshutteringForm.status}
              onChange={(e) => setDeshutteringForm({ ...deshutteringForm, status: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="---- Select ----">---- Select ----</option>
              <option value="Done">Done</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium text-slate-700">Repair Required *</label>
            <select
              value={deshutteringForm.repairRequired}
              onChange={(e) => setDeshutteringForm({ ...deshutteringForm, repairRequired: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="---- Select ----">---- Select ----</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium text-slate-700">Photo Evidence *</label>
            {checklistImage.default ? (
              <div className="relative">
                <img src={checklistImage.default} alt="Evidence" className="w-full h-48 object-cover rounded-xl" />
                <button onClick={() => setChecklistImage({})} className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs">
                  ×
                </button>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl text-slate-400">
                No photo
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <label className="cursor-pointer">
                <div className="py-3 text-center bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200">
                  Gallery
                </div>
                <input type="file" accept="image/*" onChange={(e) => handleChecklistFileChange(e, 'default')} className="hidden" />
              </label>
              <label className="cursor-pointer">
                <div className="py-3 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200">
                  Camera
                </div>
                <input type="file" accept="image/*" capture="environment" onChange={(e) => handleChecklistFileChange(e, 'default')} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      );
    }

    if (item === 'Repair') {
      return (
        <div className="space-y-5">
          <div>
            <label className="block mb-2 font-medium text-slate-700">Status *</label>
            <select
              value={repairForm.status}
              onChange={(e) => setRepairForm({ ...repairForm, status: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="---- Select ----">---- Select ----</option>
              <option value="Done">Done</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 font-medium text-slate-700">Photo Evidence *</label>
            {checklistImage.default ? (
              <div className="relative">
                <img src={checklistImage.default} alt="Evidence" className="w-full h-48 object-cover rounded-xl" />
                <button onClick={() => setChecklistImage({})} className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs">
                  ×
                </button>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl text-slate-400">
                No photo
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <label className="cursor-pointer">
                <div className="py-3 text-center bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200">
                  Gallery
                </div>
                <input type="file" accept="image/*" onChange={(e) => handleChecklistFileChange(e, 'default')} className="hidden" />
              </label>
              <label className="cursor-pointer">
                <div className="py-3 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200">
                  Camera
                </div>
                <input type="file" accept="image/*" capture="environment" onChange={(e) => handleChecklistFileChange(e, 'default')} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      );
    }

    if (item === 'Quality Check') {
      return (
        <div className="space-y-5">
          <div>
            <label className="block mb-2 font-medium text-slate-700">Status *</label>
            <select
              value={qualityForm.status}
              onChange={(e) => setQualityForm({ ...qualityForm, status: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="---- Select ----">---- Select ----</option>
              <option value="Done">Done</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 font-medium text-slate-700">Photo Evidence *</label>
            {checklistImage.default ? (
              <div className="relative">
                <img src={checklistImage.default} alt="Evidence" className="w-full h-48 object-cover rounded-xl" />
                <button onClick={() => setChecklistImage({})} className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs">
                  ×
                </button>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl text-slate-400">
                No photo
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <label className="cursor-pointer">
                <div className="py-3 text-center bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200">
                  Gallery
                </div>
                <input type="file" accept="image/*" onChange={(e) => handleChecklistFileChange(e, 'default')} className="hidden" />
              </label>
              <label className="cursor-pointer">
                <div className="py-3 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200">
                  Camera
                </div>
                <input type="file" accept="image/*" capture="environment" onChange={(e) => handleChecklistFileChange(e, 'default')} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Repair button दिखाने का logic
  const uidData = checklistData[selectedChecklistUID] || {};

  const showRepairButton =
    (uidData.completedItems?.includes('Deshuttering') && uidData.repairRequired === 'Yes') ||
    (selectedChecklistItem === 'Deshuttering' && deshutteringForm.repairRequired === 'Yes');

  const displayChecklistItems = DEMO_CHECKLIST_ITEMS.filter((item) => {
    if (item === 'Repair') {
      return showRepairButton;
    }
    return true;
  });

  return (
    <div className="p-5 bg-slate-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold border-l-4 border-blue-600 pl-4 text-slate-800">
          Casting / Fullkitting Portal {isAdmin ? '(Admin - All Sites)' : `(${loggedInUserType || 'Your Site'})`}
        </h2>
        {isLoading && (
          <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {isLoading ? (
        <div className="text-center mt-20">
          <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
          <p className="text-slate-600 font-medium">Loading casting records...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 mt-10">
          <p className="text-lg font-medium">Data load failed</p>
          <p className="text-sm mt-2">{error?.data?.error || 'Please try again'}</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <p className="text-xl font-medium">
            {isAdmin ? 'No casting records found' : 'No records found for your site'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1400px] text-sm">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-4 py-4 text-left font-semibold border-r border-slate-700">Casting UID</th>
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
                  const hasActualData = item.Actual && item.Actual.trim() !== '';
                  return (
                    <tr
                      key={item.CastingUID || item.UID || index}
                      className={`border-b hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                    >
                      <td className="px-4 py-4 font-medium text-slate-800 border-r">{item.CastingUID || '-'}</td>
                      <td className="px-4 py-4 border-r">{item.UID || '-'}</td>
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
                          onClick={() => handleFullkittingAction(item.CuringUID || item.CastingUID)}
                          disabled={hasActualData}
                          className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                            hasActualData ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {hasActualData ? 'Done ✓' : 'Fullkitting'}
                        </button>
                        <button
                          onClick={() => handleChecklistAction(item.CuringUID || item.CastingUID)}
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
      {showForm && (
        <div
          className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-5 border-b bg-gradient-to-r from-slate-50 to-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Fullkitting Submission</h3>
                <p className="text-sm text-slate-500 mt-0.5">UID: {selectedUID}</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-3xl text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Cement', key: 'cement' },
                  { label: 'Aggregate', key: 'aggregate' },
                  { label: 'Sand', key: 'sand' },
                  { label: 'Mortar', key: 'mortar' },
                  { label: 'Steel', key: 'steel' },
                  { label: 'Binding Wire', key: 'bindingWire' },
                  { label: 'Cover Block', key: 'coverBlock' },
                  { label: 'Shuttering Material', key: 'shutteringMaterial' },
                  { label: 'Hand Tools', key: 'handTools' },
                  { label: 'Cutter Machine', key: 'cutterMachine' },
                  { label: 'Grinder Machine', key: 'grinderMachine' },
                ].map((item) => (
                  <div key={item.key} className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">{item.label}</label>
                    {images[item.key] ? (
                      <div className="relative rounded-lg overflow-hidden border-2 border-green-300">
                        <img src={images[item.key]} alt={item.label} className="w-full h-40 object-cover" />
                        <button
                          onClick={() => setImages((p) => ({ ...p, [item.key]: '' }))}
                          className="absolute top-2 right-2 bg-red-600 text-white text-xs px-3 py-1 rounded-full"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="h-40 flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 text-sm">
                        No photo
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <label className="cursor-pointer">
                        <div className="text-center py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 text-sm">
                          Gallery
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, item.key)}
                          className="hidden"
                        />
                      </label>
                      <label className="cursor-pointer">
                        <div className="text-center py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 text-sm">
                          Camera
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => handleFileChange(e, item.key)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium text-slate-700">Admixtures</label>
                  <input
                    type="text"
                    value={formData.admixtures}
                    onChange={(e) => setFormData({ ...formData, admixtures: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                    placeholder="e.g. 500 ml"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-slate-700">Mixture Machine</label>
                  <input
                    type="text"
                    value={formData.mixtureMachine}
                    onChange={(e) => setFormData({ ...formData, mixtureMachine: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                    placeholder="e.g. 1 Nos"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleSubmitFullkitting}
                  disabled={isSubmitting}
                  className={`flex-1 py-3.5 rounded-xl font-semibold text-white ${
                    isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isSubmitting ? 'Uploading...' : 'Submit Fullkitting'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
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
                <h3 className="text-xl font-semibold text-slate-800">Casting Checklist</h3>
                <p className="text-sm text-slate-500 mt-0.5">{selectedChecklistUID}</p>
              </div>
              <button
                onClick={() => setShowChecklistModal(false)}
                className="text-3xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {isFetchingStatus ? (
                <div className="text-center py-10">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-600">Loading checklist status...</p>
                </div>
              ) : !selectedChecklistItem ? (
                <div>
                  <div className="text-center mb-8">
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">Select Item to Complete</h4>
                    <p className="text-sm text-slate-500">
                      {getCompletedItems(selectedChecklistUID).length}/{DEMO_CHECKLIST_ITEMS.length} items completed
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {displayChecklistItems.map((item) => {
                      const isCompleted = getCompletedItems(selectedChecklistUID).includes(item);
                      return (
                        <button
                          key={item}
                          onClick={() => {
                            setSelectedChecklistItem(item);
                            setChecklistImage({});
                            setSafetyForm({ status: '---- Select ----' });
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
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-5 border-b-2">
                    <h4 className="text-lg font-bold text-slate-800">{selectedChecklistItem}</h4>
                    <button
                      onClick={() => {
                        setSelectedChecklistItem(null);
                        setChecklistImage({});
                        setSafetyForm({ status: '---- Select ----' });
                      }}
                      className="px-4 py-2 text-purple-600 hover:text-purple-800 font-medium bg-purple-50 rounded-lg"
                    >
                      ← Back
                    </button>
                  </div>

                  {renderChecklistItemForm()}

                  <div className="flex gap-4 pt-6">
                    <button
                      onClick={handleSubmitChecklistItem}
                      disabled={isChecklistSubmitting}
                      className={`flex-1 py-3 rounded-xl text-white font-semibold ${
                        isChecklistSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {isChecklistSubmitting ? 'Submitting...' : `Submit ${selectedChecklistItem}`}
                    </button>
                    <button
                      onClick={() => setShowChecklistModal(false)}
                      className="flex-1 py-3 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300"
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

export default Casting;