
import React, { useState, useEffect } from "react";
import {
  useGetFullKittingDataQuery,
  useSubmitFullKittingMutation,
  useSubmitChecklistItemMutation,
  useGetChecklistStatusQuery,
} from "../../features/WaterProffing/WaterFullKittingSlice";

const Waterproofing = () => {
  const loggedInUserType = sessionStorage.getItem("userType") || "";
  const isAdmin =
    loggedInUserType.trim().toUpperCase().replace(/\s+/g, "") === "ADMIN";

  const { data, isLoading, isError, error } = useGetFullKittingDataQuery();

  const [submitFullKitting, { isLoading: isSubmitting }] =
    useSubmitFullKittingMutation();
  const [submitChecklistItem, { isLoading: isChecklistSubmitting }] =
    useSubmitChecklistItemMutation();

  // Fullkitting states
  const [showForm, setShowForm] = useState(false);
  const [selectedUID, setSelectedUID] = useState("");
  const [formData, setFormData] = useState({
    typeOfWaterproofing: "---- Select ----",
  });
  const [images, setImages] = useState({});
  const [activeFields, setActiveFields] = useState([]);

  // Checklist states
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [selectedChecklistUID, setSelectedChecklistUID] = useState("");
  const [selectedChecklistItem, setSelectedChecklistItem] = useState(null);
  const [checklistData, setChecklistData] = useState({});

  // Common inputs
  const [status, setStatus] = useState("---- Select ----");
  const [remark, setRemark] = useState("");

  // Normal section photo
  const [singleImage, setSingleImage] = useState("");

  // Quality Check photos
  const [waterPondingTestImage, setWaterPondingTestImage] = useState("");
  const [coatingTestImage, setCoatingTestImage] = useState("");
  const [covaTestImage, setCovaTestImage] = useState("");

  const DEMO_CHECKLIST_ITEMS = [
    "Area cleaning",
    "Surface Preparation",
    "First Coat",
    "Second / Final Coat",
    "Curing Periods",
    "Handover",
    "Observation Period",
    "Quality Check",
  ];

  const WATERPROOFING_CATEGORIES = {
    "Box Waterproofing": {
      label: "Box Waterproofing Images",
      fields: [
        { label: "Cement Image", key: "cement" },
        {
          label: "Waterproofing Compound/Chemical Image",
          key: "waterproofingCompound",
        },
        { label: "Surface Cleaning Image", key: "surfaceCleaning" },
        { label: "Kota Image", key: "kota" },
        { label: "Sand Image", key: "sand" },
        { label: "Honey Combining Repair Image", key: "honeyCombiningRepair" },
      ],
    },
    "Bathroom & Balcony Waterproofing": {
      label: "Bathroom & Balcony Waterproofing Images",
      fields: [
        { label: "Cement Image", key: "cement" },
        { label: "Waterproofing Image", key: "waterproofing" },
        { label: "Fiber Mesh Image", key: "fiberMesh" },
        { label: "Bricks Bats Image", key: "bricksBats" },
        { label: "Sand Image", key: "sand" },
        { label: "Brush and Wire Image", key: "brushAndWire" },
        { label: "Base Cleaning Image", key: "baseCleaning" },
        { label: "Pipe Joint Sealing Image", key: "pipeJointSealing" },
        { label: "Sleeve Fixing Image", key: "sleeveFixing" },
        {
          label: "2 Coats Polymer Cement (Coating) Image",
          key: "twoCoatsPolymerCement",
        },
        { label: "Aggregate Image", key: "aggregate" },
      ],
    },
    "Terrace Waterproofing": {
      label: "Terrace Waterproofing Images",
      fields: [
        { label: "Cement Image", key: "cement" },
        { label: "Bricks Bats Image", key: "bricksBats" },
        { label: "Waterproofing Chemical Image", key: "waterproofingChemical" },
        {
          label: "Expansion Joint Sealant Image",
          key: "expansionJointSealant",
        },
        { label: "Slab Cleaning Image", key: "slabCleaning" },
        { label: "Crack Treatment Image", key: "crackTreatment" },
        { label: "China Mosaic Image", key: "chinaMosaic" },
      ],
    },
  };

  // ============ CHECKLIST STATUS QUERIES ============
  const {
    data: checklistApiData,
    isFetching: isFetchingStatus,
    refetch: refetchChecklistStatus,
  } = useGetChecklistStatusQuery(selectedChecklistUID, {
    skip: !showChecklistModal || !selectedChecklistUID,
  });

  // ============ GET COMPLETED ITEMS ============
  const getCompletedItems = (uid) => {
    const items = checklistData[uid]?.completedItems || [];
    return items;
  };

  // ============ UPDATE CHECKLIST DATA WHEN API RESPONSE COMES ============
  useEffect(() => {
    if (checklistApiData?.success && selectedChecklistUID) {
      setChecklistData((prev) => ({
        ...prev,
        [selectedChecklistUID]: {
          completedItems: Array.isArray(checklistApiData.completedItems)
            ? checklistApiData.completedItems
            : [],
          statusMap: checklistApiData.statusMap || {},
          details: checklistApiData.details || {},
          completedCount: checklistApiData.completedCount || 0,
          totalSections: checklistApiData.totalSections || 8,
        },
      }));
    }
  }, [checklistApiData, selectedChecklistUID]);

  // ============ RESET FORM WHEN ITEM CHANGES ============
  useEffect(() => {
    setStatus("---- Select ----");
    setRemark("");
    setSingleImage("");
    setWaterPondingTestImage("");
    setCoatingTestImage("");
    setCovaTestImage("");
  }, [selectedChecklistItem]);

  // ============ UPDATE ACTIVE FIELDS WHEN WATERPROOFING TYPE CHANGES ============
  useEffect(() => {
    if (
      formData.typeOfWaterproofing &&
      formData.typeOfWaterproofing !== "---- Select ----"
    ) {
      const categoryKey = formData.typeOfWaterproofing;
      const category = WATERPROOFING_CATEGORIES[categoryKey];
      if (category) {
        setActiveFields(category.fields);
      }
    } else {
      setActiveFields([]);
    }
  }, [formData.typeOfWaterproofing]);

  // ============ HELPER FUNCTIONS ============
  const ensureArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value?.data && Array.isArray(value.data)) return value.data;
    if (value?.records && Array.isArray(value.records)) return value.records;
    return [];
  };

  // Fullkitting Done check - IMPORTANT PART
  const isFullKittingDone = (item) => {
    // API में status field का नाम बदल सकते हो अगर अलग है
    // उदाहरण: item?.fullKittingStatus, item?.isFullKitted, item?.fullkitting_status आदि
    const statusValue = item?.Status || item?.status || "";
    return statusValue?.toString().trim().toUpperCase() === "DONE";
  };

  const records = ensureArray(data);
  const filteredData = isAdmin
    ? records
    : records.filter(
        (item) =>
          item?.SiteName?.trim?.()?.toUpperCase() ===
          loggedInUserType.trim().toUpperCase(),
      );

  // ============ ACTIONS ============
  const handleFullkittingAction = (uid) => {
    setSelectedUID(uid);
    setShowForm(true);
    setFormData({ typeOfWaterproofing: "---- Select ----" });
    setImages({});
    setActiveFields([]);
  };

  const handleChecklistAction = (uid) => {
    setSelectedChecklistUID(uid);
    setSelectedChecklistItem(null);
    setShowChecklistModal(true);
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

  const handleChecklistFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "single") setSingleImage(reader.result);
      if (type === "ponding") setWaterPondingTestImage(reader.result);
      if (type === "coating") setCoatingTestImage(reader.result);
      if (type === "cova") setCovaTestImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitFullkitting = async () => {
    if (formData.typeOfWaterproofing === "---- Select ----") {
      alert("Type of Waterproofing चुनना जरूरी है");
      return;
    }

    const missingImages = activeFields.filter((f) => !images[f.key]);
    if (missingImages.length > 0) {
      alert("कृपया सभी images upload करें");
      return;
    }

    const cleanedUID = selectedUID?.trim().toUpperCase();
    const imageArray = activeFields
      .map((f) => images[f.key] || "")
      .slice(0, 10);

    const payload = {
      WaterProffingUID: cleanedUID,
      TypeofWaterproofing: formData.typeOfWaterproofing.trim(),
      image1: imageArray[0] || "",
      image2: imageArray[1] || "",
      image3: imageArray[2] || "",
      image4: imageArray[3] || "",
      image5: imageArray[4] || "",
      image6: imageArray[5] || "",
      image7: imageArray[6] || "",
      image8: imageArray[7] || "",
      image9: imageArray[8] || "",
      image10: imageArray[9] || "",
    };

    try {
      await submitFullKitting(payload).unwrap();
      alert("Fullkitting सेव हो गया!");
      setShowForm(false);
      // Optional: refetch data after submit
      // refetch(); // अगर आपने useGetFullKittingDataQuery में refetch export किया है
    } catch (err) {
      alert("Fullkitting फेल → " + (err?.data?.error || "Unknown error"));
    }
  };

  const handleSubmitChecklistItem = async () => {
    if (status === "---- Select ----") {
      alert("Status चुनें");
      return;
    }

    const payload = {
      WaterProffingUID: selectedChecklistUID,
      section: selectedChecklistItem,
      status,
      remark: remark.trim() || undefined,
    };

    if (selectedChecklistItem !== "Quality Check") {
      if (!singleImage) {
        alert("Photo अपलोड करें");
        return;
      }
      payload.image = singleImage;
    } else {
      if (!waterPondingTestImage && !coatingTestImage && !covaTestImage) {
        alert("कम से कम एक Quality Check photo अपलोड करें");
        return;
      }
      if (waterPondingTestImage)
        payload.waterPondingTestImage = waterPondingTestImage;
      if (coatingTestImage) payload.coatingTestImage = coatingTestImage;
      if (covaTestImage) payload.covaTestImage = covaTestImage;
    }

    try {
      await submitChecklistItem(payload).unwrap();

      if (status === "Done") {
        setChecklistData((prev) => ({
          ...prev,
          [selectedChecklistUID]: {
            ...prev[selectedChecklistUID],
            completedItems: [
              ...(prev[selectedChecklistUID]?.completedItems || []),
              selectedChecklistItem,
            ],
            completedCount:
              (prev[selectedChecklistUID]?.completedCount || 0) + 1,
          },
        }));
      }

      alert(`${selectedChecklistItem} सेव हो गया!`);

      setSelectedChecklistItem(null);
      setStatus("---- Select ----");
      setRemark("");
      setSingleImage("");
      setWaterPondingTestImage("");
      setCoatingTestImage("");
      setCovaTestImage("");
    } catch (err) {
      alert("सबमिशन फेल → " + (err?.data?.error || "Unknown error"));
    }
  };

  const renderChecklistItemForm = () => {
    const isQualityCheck = selectedChecklistItem === "Quality Check";

    const renderPhotoInput = (label, value, setter, type) => (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        {value ? (
          <div className="relative inline-block">
            <img
              src={value}
              alt={label}
              className="w-40 h-40 object-cover rounded-lg"
            />
            <button
              onClick={() => setter("")}
              className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs hover:bg-red-700"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
            No photo
          </div>
        )}
        <div className="mt-3 flex gap-3">
          <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer text-sm hover:bg-blue-700">
            Gallery
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleChecklistFileChange(e, type)}
              className="hidden"
            />
          </label>
          <label className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer text-sm hover:bg-green-700">
            Camera
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleChecklistFileChange(e, type)}
              className="hidden"
            />
          </label>
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status *
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option>---- Select ----</option>
            <option>Done</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Remark (optional)
          </label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={3}
            placeholder="कोई टिप्पणी..."
          />
        </div>

        {!isQualityCheck && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo Evidence *
            </label>
            {renderPhotoInput("Photo", singleImage, setSingleImage, "single")}
          </div>
        )}

        {isQualityCheck && (
          <div className="space-y-6">
            {renderPhotoInput(
              "Water Ponding Test (24 hour Check) Image",
              waterPondingTestImage,
              setWaterPondingTestImage,
              "ponding",
            )}
            {renderPhotoInput(
              "Coating Test Image",
              coatingTestImage,
              setCoatingTestImage,
              "coating",
            )}
            {renderPhotoInput(
              "Cova Test Image",
              covaTestImage,
              setCovaTestImage,
              "cova",
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Waterproofing Portal{" "}
        <span className="text-xl font-normal text-gray-600">
          {isAdmin
            ? "(Admin - All Sites)"
            : `(${loggedInUserType || "Your Site"})`}
        </span>
      </h1>

      {isLoading && (
        <p className="text-center text-blue-600">Loading records...</p>
      )}
      {isError && (
        <div className="text-red-600 text-center">Error loading data</div>
      )}
      {!isLoading && !isError && filteredData.length === 0 && (
        <p className="text-center text-gray-600 py-10">No records found</p>
      )}

      {/* Table */}
      {filteredData.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Waterproofing UID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  UID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Zone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Sub Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actual Start
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actual End
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Site Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Planned
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item, index) => {
                const isDone = isFullKittingDone(item);

                return (
                  <tr key={index} className={`border-b hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.WaterProffingUID || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.UID || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.Zone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.Activity || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.SubActivity || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.ActualStart || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.ActualEnd || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.SiteName || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.Planned || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.Actual || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      <button
                        onClick={() =>
                          handleFullkittingAction(
                            item.WaterProffingUID || item.UID,
                          )
                        }
                        disabled={isDone}
                        className={`px-5 py-2.5 rounded-lg font-medium text-white min-w-[110px] transition-all ${
                          isDone
                            ? "bg-green-600 cursor-not-allowed shadow-green-100"
                            : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
                        }`}
                      >
                        {isDone ? (
                          <span className="flex items-center justify-center gap-1.5">
                            Done <span className="text-lg">✓</span>
                          </span>
                        ) : (
                          "Fullkitting"
                        )}
                      </button>

                      <button
                        onClick={() =>
                          handleChecklistAction(
                            item.WaterProffingUID || item.UID,
                          )
                        }
                        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all shadow-purple-100 min-w-[110px]"
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
      )}

      {/* Fullkitting Modal - same as before */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 border-b px-8 py-5 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Waterproofing Fullkitting
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-4xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="p-8">
              <p className="text-lg font-medium text-gray-700 mb-6">
                UID: <span className="font-bold">{selectedUID}</span>
              </p>

              <div className="mb-8">
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Type of Waterproofing *
                </label>
                <select
                  value={formData.typeOfWaterproofing}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      typeOfWaterproofing: e.target.value,
                    })
                  }
                  className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                >
                  <option value="---- Select ----">---- Select ----</option>
                  <option value="Box Waterproofing">Box Waterproofing</option>
                  <option value="Bathroom & Balcony Waterproofing">
                    Bathroom & Balcony Waterproofing
                  </option>
                  <option value="Terrace Waterproofing">
                    Terrace Waterproofing
                  </option>
                </select>
              </div>

              {activeFields.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-amber-700 text-lg font-medium">
                    कृपया पहले Type of Waterproofing चुनें
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeFields.map((item) => (
                    <div
                      key={item.key}
                      className="bg-gray-50 p-5 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <label className="block text-base font-semibold text-gray-700 mb-3">
                        {item.label} *
                      </label>

                      {images[item.key] ? (
                        <div className="relative">
                          <img
                            src={images[item.key]}
                            alt={item.label}
                            className="w-full h-48 object-cover rounded-lg shadow-sm"
                          />
                          <button
                            onClick={() =>
                              setImages((p) => ({ ...p, [item.key]: "" }))
                            }
                            className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-full text-sm shadow-md transition-colors"
                          >
                            × Remove
                          </button>
                        </div>
                      ) : (
                        <div className="h-48 bg-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-500 text-sm border-2 border-dashed border-gray-400">
                          <span className="text-4xl mb-2">📸</span>
                          Click to take photo or upload
                        </div>
                      )}

                      <div className="mt-4 flex gap-4">
                        <label className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg cursor-pointer transition-colors text-sm font-medium">
                          Camera
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleFileChange(e, item.key)}
                            className="hidden"
                          />
                        </label>
                        <label className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-lg cursor-pointer transition-colors text-sm font-medium">
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, item.key)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-6 mt-10">
                <button
                  onClick={handleSubmitFullkitting}
                  disabled={isSubmitting || activeFields.length === 0}
                  className={`flex-1 py-4 rounded-xl font-bold text-lg transition-colors ${
                    isSubmitting || activeFields.length === 0
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {isSubmitting ? "Uploading..." : "Submit Fullkitting"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Modal - same as before */}
      {showChecklistModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={(e) =>
            e.target === e.currentTarget && setShowChecklistModal(false)
          }
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 border-b px-8 py-5 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Waterproofing Checklist
              </h2>
              <button
                onClick={() => setShowChecklistModal(false)}
                className="text-4xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="p-8">
              <p className="text-lg font-medium text-gray-700 mb-6">
                UID: <span className="font-bold">{selectedChecklistUID}</span>
              </p>

              {isFetchingStatus ? (
                <p className="text-center text-blue-600 py-10">
                  Loading checklist status...
                </p>
              ) : !selectedChecklistItem ? (
                <div>
                  <div className="text-center mb-8">
                    <div className="inline-block bg-gradient-to-r from-purple-100 to-blue-100 px-6 py-4 rounded-2xl">
                      <p className="text-3xl font-bold text-purple-600">
                        {getCompletedItems(selectedChecklistUID).length}{" "}
                        <span className="text-lg text-gray-600">
                          / {DEMO_CHECKLIST_ITEMS.length}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        items completed
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {DEMO_CHECKLIST_ITEMS.map((item) => {
                      const completedList =
                        getCompletedItems(selectedChecklistUID);
                      const isCompleted = completedList.includes(item);

                      return (
                        <button
                          key={item}
                          onClick={() => setSelectedChecklistItem(item)}
                          disabled={isCompleted}
                          className={`p-8 rounded-2xl border-2 text-center transition-all duration-300 ${
                            isCompleted
                              ? "bg-green-50 border-green-400 cursor-not-allowed opacity-80"
                              : "bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-xl border-blue-300 hover:border-purple-400"
                          }`}
                        >
                          <div className="text-4xl mb-4">
                            {isCompleted ? "✅" : "📋"}
                          </div>
                          <div className="text-lg font-semibold text-gray-800">
                            {item}
                          </div>
                          {isCompleted && (
                            <div className="mt-3 text-green-600 font-medium text-sm">
                              ✓ Done
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-gray-800">
                      {selectedChecklistItem}
                    </h3>
                    <button
                      onClick={() => setSelectedChecklistItem(null)}
                      className="px-6 py-3 text-purple-600 hover:text-purple-800 font-medium bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      ← Back to List
                    </button>
                  </div>

                  {renderChecklistItemForm()}

                  <div className="flex gap-6 mt-12">
                    <button
                      onClick={handleSubmitChecklistItem}
                      disabled={isChecklistSubmitting}
                      className={`flex-1 py-4 rounded-xl font-bold text-lg transition-colors ${
                        isChecklistSubmitting
                          ? "bg-gray-400 cursor-not-allowed text-white"
                          : "bg-purple-600 hover:bg-purple-700 text-white"
                      }`}
                    >
                      {isChecklistSubmitting
                        ? "Submitting..."
                        : `Submit ${selectedChecklistItem}`}
                    </button>

                    <button
                      onClick={() => setShowChecklistModal(false)}
                      className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-lg transition-colors"
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

export default Waterproofing;
