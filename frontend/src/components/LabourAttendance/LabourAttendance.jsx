
import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'https://all-pms-project.onrender.com/api/Attendance';

// ==========================================
// SITES WITH COORDINATES (from AttendanceForm)
// ==========================================
const SITE_LOCATIONS = [
  { name: "Office/कार्यालय", lat: 23.19775059819785, lng: 77.41701272524529 },
  { name: "RNTU/आरएनटीयू", lat: 23.135181, lng: 77.563744 },
  { name: "Dubey Ji Site/दुबे जी साइट", lat: 23.124046, lng: 77.497393 },
  { name: "Madhav Gupta Ji/माधव गुप्ता जी", lat: 23.1714257, lng: 77.427868 },
  { name: "Dr.Shrikant Jain Site/डॉ. श्रीकांत जैन साइट", lat: 23.186214, lng: 77.428280 },
  { name: "Dr.Manish Jain Site/डॉ. मनीष जैन साइट", lat: 23.215016, lng: 77.426319 },
  { name: "Rana Ji Site/राणा जी साइट", lat: 23.182188, lng: 77.454757 },
  { name: "Rajeev Abbot. Ji Site/राजीव एबोट. जी साइट", lat: 23.263392, lng: 77.457032 },
  { name: "Piyush Goenka/ पियूष गोयनका", lat: 23.234808, lng: 77.395521 },
  { name: "Wallia Ji Commercial/वालिया जी कर्मशियल", lat: 23.184511, lng: 77.462847 },
  { name: "Wallia Ji Appartment/वालिया जी अपार्टमेन्‍ट", lat: 23.181771, lng: 77.432712 },
  { name: "Ahuja Ji Site/आहूजा जी साइट", lat: 23.214686, lng: 77.438693 },
  { name: "Scope College/स्‍कॉप कॉलेज", lat: 23.152594, lng: 77.478894 },
  { name: "Udit Agarwal JI Site", lat: 23.2540, lng: 77.4496 },
];

const LabourAttendance = () => {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [mode, setMode] = useState('attendance');
  const [attendanceStep, setAttendanceStep] = useState('capture');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [cameraOpen, setCameraOpen] = useState(false);

  // Recognized Labour Data
  const [recognizedLabour, setRecognizedLabour] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);

  // Location State
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [nearestSite, setNearestSite] = useState(null);
  const [distanceToSite, setDistanceToSite] = useState(null);
  const [isWithinRange, setIsWithinRange] = useState(false);

  const [facingMode, setFacingMode] = useState('user');
  // Attendance Selection
  const [attendanceData, setAttendanceData] = useState({
    site: '',
    labourType: '',
    category: '',
    contractorName: '',
  });

  // Registration Form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    labourType: '',
    category: '',
    site: '',
    contractorName: '',
  });

  // Dropdown Options
  const [dropdownData, setDropdownData] = useState({
    siteNames: [],
    laborTypes: [],
    categories: [],
    contractorNames: [],
  });

  // Final Result
  const [attendanceResult, setAttendanceResult] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const msgTimerRef = useRef(null);

  // ==========================================
  // EFFECTS
  // ==========================================

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((e) => console.error('Video play error:', e));
    }
  }, [cameraOpen]);

  useEffect(() => {
    if (message) {
      if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
      msgTimerRef.current = setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    }
    return () => clearTimeout(msgTimerRef.current);
  }, [message]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // ==========================================
  // LOCATION FUNCTIONS
  // ==========================================

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  };

  const findNearestSite = (userLat, userLng) => {
    let nearest = null;
    let minDistance = Infinity;

    for (const site of SITE_LOCATIONS) {
      const distance = calculateDistance(userLat, userLng, site.lat, site.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = site;
      }
    }

    return { site: nearest, distance: minDistance };
  };

  const checkSiteDistance = (userLat, userLng, selectedSiteName) => {
    // Find selected site in locations
    const selectedSite = SITE_LOCATIONS.find(
      (s) => s.name.toLowerCase() === selectedSiteName.toLowerCase()
    );

    if (selectedSite) {
      const distance = calculateDistance(userLat, userLng, selectedSite.lat, selectedSite.lng);
      return { distance, isWithin: distance <= 300 };
    }

    // If site not in predefined list, find nearest
    const { site: nearest, distance } = findNearestSite(userLat, userLng);
    return { 
      distance, 
      isWithin: distance <= 300, 
      nearestSite: nearest?.name 
    };
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          let errorMsg = 'Unable to fetch location.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Location permission denied. Please enable GPS.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Location unavailable. Please try again.';
              break;
            case error.TIMEOUT:
              errorMsg = 'Location request timed out.';
              break;
          }
          reject(new Error(errorMsg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  const fetchUserLocation = async () => {
    setLocationLoading(true);
    setLocationError('');
    
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);

      // Find nearest site
      const { site, distance } = findNearestSite(location.lat, location.lng);
      setNearestSite(site);
      setDistanceToSite(Math.round(distance));
      setIsWithinRange(distance <= 300);

      showMessage(
        distance <= 300
          ? `📍 Location captured! Nearest site: ${site?.name} (${Math.round(distance)}m away)`
          : `⚠️ You are ${Math.round(distance)}m away from nearest site (${site?.name}). Must be within 300m.`,
        distance <= 300 ? 'success' : 'error'
      );

      return location;
    } catch (error) {
      setLocationError(error.message);
      showMessage(error.message, 'error');
      return null;
    } finally {
      setLocationLoading(false);
    }
  };

  // ==========================================
  // API CALLS
  // ==========================================

  const fetchDropdownData = async () => {
    try {
      const response = await axios.get(`${API_URL}/dropdown-data`);
      if (response.data.success) {
        setDropdownData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  // ==========================================
  // CAMERA FUNCTIONS
  // ==========================================

  // const openCamera = async () => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       video: { width: 1280, height: 720, facingMode: 'user' },
  //       audio: false,
  //     });
  //     streamRef.current = stream;
  //     setCameraOpen(true);
  //   } catch (err) {
  //     showMessage('Camera access denied. Please allow camera permission.', 'error');
  //   }
  // };



  const openCamera = async (mode = facingMode) => {
  if (streamRef.current) {
    streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720, facingMode: mode },
      audio: false,
    });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((e) => console.error('Video play error:', e));
    }
    setCameraOpen(true);
    setFacingMode(mode);
  } catch (err) {
    showMessage('Camera access denied. Please allow camera permission.', 'error');
  }
};

const toggleCamera = () => {
  const newMode = facingMode === 'user' ? 'environment' : 'user';
  openCamera(newMode);
};


  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video) return null;
    const cvs = document.createElement('canvas');
    cvs.width = video.videoWidth;
    cvs.height = video.videoHeight;
    cvs.getContext('2d').drawImage(video, 0, 0);
    return cvs.toDataURL('image/jpeg', 0.9);
  }, []);

  const base64ToBlob = async (base64) => {
    const res = await fetch(base64);
    return res.blob();
  };

  // ==========================================
  // HELPERS
  // ==========================================

  const showMessage = (msg, type = '') => {
    setMessage(msg);
    setMessageType(type);
  };

  const resetAll = () => {
    stopCamera();
    setCapturedPhotos([]);
    setFormData({ name: '', phone: '', labourType: '', category: '', site: '', contractorName: '' });
    setAttendanceData({ site: '', labourType: '', category: '', contractorName: '' });
    setMessage('');
    setMessageType('');
    setRecognizedLabour(null);
    setTodayAttendance(null);
    setAttendanceResult(null);
    setAttendanceStep('capture');
    setUserLocation(null);
    setNearestSite(null);
    setDistanceToSite(null);
    setIsWithinRange(false);
    setLocationError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData((prev) => ({ ...prev, [name]: value.replace(/[^0-9]/g, '') }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAttendanceDataChange = (e) => {
    const { name, value } = e.target;
    setAttendanceData((prev) => ({ ...prev, [name]: value }));

    // Recalculate distance when site changes
    if (name === 'site' && userLocation) {
      const result = checkSiteDistance(userLocation.lat, userLocation.lng, value);
      setDistanceToSite(Math.round(result.distance));
      setIsWithinRange(result.isWithin);
    }
  };

  // ==========================================
  // ATTENDANCE FLOW
  // ==========================================

  const handleRecognizeFace = async () => {
    if (!cameraOpen) {
      showMessage('Please open camera first', 'error');
      return;
    }

    setLoading(true);
    showMessage('Recognizing face & fetching location...', '');
    setRecognizedLabour(null);
    setTodayAttendance(null);

    try {
      // Step 1: Capture photo
      const photo = captureFrame();
      if (!photo) {
        showMessage('Photo capture failed. Please try again.', 'error');
        setLoading(false);
        return;
      }

      // Step 2: Get location simultaneously
      const locationPromise = getCurrentLocation();

      // Step 3: Recognize face
      const blob = await base64ToBlob(photo);
      const fd = new FormData();
      fd.append('photo', blob, 'face.jpg');

      const [response, location] = await Promise.all([
        axios.post(`${API_URL}/recognize-face`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
        locationPromise.catch((err) => ({ error: err.message })),
      ]);

      // Handle location
      if (location.error) {
        showMessage(`Face recognized but location failed: ${location.error}`, 'error');
        setLoading(false);
        return;
      }

      setUserLocation(location);
      const { site: nearest, distance } = findNearestSite(location.lat, location.lng);
      setNearestSite(nearest);
      setDistanceToSite(Math.round(distance));
      setIsWithinRange(distance <= 300);

      // Handle face recognition
      if (response.data.success) {
        setRecognizedLabour(response.data.labour);
        setTodayAttendance(response.data.todayAttendance);

        // Pre-fill attendance data with defaults
        setAttendanceData({
          site: response.data.labour.defaultSite || '',
          labourType: response.data.labour.defaultLabourType || '',
          category: response.data.labour.defaultCategory || '',
          contractorName: response.data.labour.contractorName || '',
        });

        // Check if already checked out today
        if (response.data.todayAttendance?.checkOutTime) {
          setAttendanceResult({
            status: 'completed',
            ...response.data.todayAttendance,
          });
          setAttendanceStep('done');
          showMessage('Already checked out today', 'success');
        } else {
          setAttendanceStep('select');
          
          if (distance <= 300) {
            showMessage(
              `✅ ${response.data.labour.name} recognized! Location verified (${Math.round(distance)}m from ${nearest?.name})`,
              'success'
            );
          } else {
            showMessage(
              `⚠️ ${response.data.labour.name} recognized but you are ${Math.round(distance)}m away from nearest site. Must be within 300m.`,
              'error'
            );
          }
        }

        if (navigator.vibrate) navigator.vibrate(200);
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Face recognition failed.';
      showMessage(msg, 'error');
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAttendance = async () => {
    if (!attendanceData.site) {
      showMessage('Please select site', 'error');
      return;
    }
    if (!attendanceData.labourType) {
      showMessage('Please select labour type', 'error');
      return;
    }

    // ==========================================
    // LOCATION VERIFICATION
    // ==========================================
    if (!userLocation) {
      showMessage('❌ Location not captured. Please try again.', 'error');
      return;
    }

    // Check distance to selected site
    const locationCheck = checkSiteDistance(
      userLocation.lat,
      userLocation.lng,
      attendanceData.site
    );

    if (!locationCheck.isWithin) {
      showMessage(
        `❌ You are ${Math.round(locationCheck.distance)}m away from ${attendanceData.site}. Must be within 300 meters to mark attendance.`,
        'error'
      );
      return;
    }

    setLoading(true);
    showMessage('Marking attendance...', '');

    try {
      const response = await axios.post(`${API_URL}/mark-attendance`, {
        labourId: recognizedLabour.id,
        site: attendanceData.site,
        labourType: attendanceData.labourType,
        category: attendanceData.category,
        contractorName: attendanceData.contractorName,
        // Send location data
        location: {
          lat: userLocation.lat,
          lng: userLocation.lng,
          accuracy: userLocation.accuracy,
          distance: Math.round(locationCheck.distance),
        },
      });

      if (response.data.success) {
        setAttendanceResult(response.data);
        setAttendanceStep('done');
        showMessage(response.data.message, 'success');
        if (navigator.vibrate) navigator.vibrate(200);
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to mark attendance.';
      showMessage(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // REGISTRATION FLOW
  // ==========================================

  const captureForRegistration = () => {
    if (!cameraOpen) {
      showMessage('Please open camera first', 'error');
      return;
    }
    if (capturedPhotos.length >= 5) {
      showMessage('Maximum 5 photos allowed', 'error');
      return;
    }
    const photo = captureFrame();
    if (!photo) {
      showMessage('Photo capture failed', 'error');
      return;
    }
    setCapturedPhotos((prev) => {
      const updated = [...prev, photo];
      showMessage(`Photo ${updated.length} captured`, 'success');
      return updated;
    });
  };

  const removePhoto = (index) => {
    setCapturedPhotos((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      showMessage(`Photo removed. ${updated.length} photo(s) remaining`, 'success');
      return updated;
    });
  };

  const handleRegister = async () => {
    if (capturedPhotos.length < 3) {
      showMessage('Please capture at least 3 photos', 'error');
      return;
    }
    if (!formData.name.trim()) {
      showMessage('Please enter name', 'error');
      return;
    }
    if (formData.phone.length < 10) {
      showMessage('Please enter valid 10-digit phone number', 'error');
      return;
    }
    if (!formData.labourType) {
      showMessage('Please select labour type', 'error');
      return;
    }

    setLoading(true);
    showMessage('Registering labour... Please wait.', '');

    try {
      const fd = new FormData();
      fd.append('name', formData.name.trim());
      fd.append('phone', formData.phone.trim());
      fd.append('labourType', formData.labourType);
      fd.append('category', formData.category);
      fd.append('site', formData.site);
      fd.append('contractorName', formData.contractorName);

      for (let i = 0; i < capturedPhotos.length; i++) {
        const blob = await base64ToBlob(capturedPhotos[i]);
        fd.append('photos', blob, `photo${i}.jpg`);
      }

      const response = await axios.post(`${API_URL}/register-labour`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showMessage(`✅ ${response.data.message} | ID: ${response.data.labourId}`, 'success');
      setCapturedPhotos([]);
      setFormData({ name: '', phone: '', labourType: '', category: '', site: '', contractorName: '' });
      if (navigator.vibrate) navigator.vibrate(200);

      setTimeout(() => {
        setMode('attendance');
        resetAll();
      }, 3000);
    } catch (error) {
      const msg = error.response?.data?.error || 'Registration failed.';
      showMessage(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RENDER HELPERS
  // ==========================================

  const renderDropdown = ({ label, name, value, options, onChange, required = false, disabled = false }) => (
    <div>
      <label className="block text-gray-700 font-medium text-sm mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled || loading}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-200 outline-none transition-all disabled:opacity-50 bg-white"
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            🏗️ Labour Attendance System
          </h1>
          <p className="text-gray-500 text-lg mb-6">
            Face Recognition + Location Based Check-in / Check-out
          </p>

          {/* Mode Toggle */}
          <div className="flex justify-center gap-3 flex-wrap">
            <button
              className={`px-6 py-2.5 rounded-full font-semibold text-sm border transition-all duration-200 ${
                mode === 'attendance'
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
              }`}
              onClick={() => {
                setMode('attendance');
                resetAll();
              }}
            >
              📋 Mark Attendance
            </button>
            <button
              className={`px-6 py-2.5 rounded-full font-semibold text-sm border transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
              }`}
              onClick={() => {
                setMode('register');
                resetAll();
              }}
            >
              ➕ Register New
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Camera Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Card Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-700">
                  {mode === 'attendance' ? '📸 Face Recognition' : '📷 Capture Photos'}
                </h3>
                {cameraOpen && (
                  <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Live
                  </span>
                )}
              </div>

              {/* Camera Area */}
              {!cameraOpen ? (
                <div
                  className="flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  style={{ height: '320px' }}
                  onClick={openCamera}
                >
                  <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center text-3xl mb-3 shadow-sm">
                    📷
                  </div>
                  <p className="text-gray-600 font-medium">Click to open camera</p>
                  <p className="text-gray-400 text-sm mt-1">Camera activates on demand</p>
                </div>
              ) : (
                <div className="relative bg-black" style={{ height: '320px' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Face Guide Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div
                      className="border-2 border-green-400 rounded-full opacity-70"
                      style={{ width: '160px', height: '200px' }}
                    ></div>
                  </div>

                  {/* Processing Overlay */}
                  {loading && (
                    <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-10">
                      <div className="w-10 h-10 border-2 border-white border-opacity-30 border-t-white rounded-full animate-spin mb-3"></div>
                      <p className="text-white text-sm font-medium">Processing...</p>
                    </div>
                  )}

                  {/* Close Camera Button */}
<button
  className="absolute top-3 right-3 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-opacity-80 transition-all z-10"
  onClick={stopCamera}
>
  ✕
</button>

{/* Toggle Front/Back Camera Button — NAYA */}
<button
  className="absolute top-3 left-3 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-opacity-80 transition-all z-10"
  onClick={toggleCamera}
  title={facingMode === 'user' ? 'Switch to Back Camera' : 'Switch to Front Camera'}
>
  🔄
</button>
                </div>
              )}

              {/* Footer Button */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                {mode === 'attendance' ? (
                  attendanceStep === 'capture' ? (
                    <button
                      className={`w-full py-3 px-5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                        loading
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-800 text-white hover:bg-gray-700 active:scale-[0.98]'
                      }`}
                      onClick={handleRecognizeFace}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                          Recognizing Face & Location...
                        </>
                      ) : (
                        '📸 Capture Face + Location'
                      )}
                    </button>
                  ) : (
                    <button
                      className="w-full py-3 px-5 rounded-xl font-semibold text-sm bg-gray-200 text-gray-600"
                      onClick={() => {
                        resetAll();
                        setAttendanceStep('capture');
                      }}
                    >
                      🔄 Start New Attendance
                    </button>
                  )
                ) : (
                  <button
                    className={`w-full py-3 px-5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      loading || capturedPhotos.length >= 5
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-800 text-white hover:bg-gray-700 active:scale-[0.98]'
                    }`}
                    onClick={captureForRegistration}
                    disabled={loading || capturedPhotos.length >= 5}
                  >
                    📸 Capture Photo ({capturedPhotos.length}/5)
                  </button>
                )}
              </div>
            </div>

            {/* Location Status Card (only in attendance mode) */}
            {mode === 'attendance' && userLocation && (
              <div className={`mt-4 rounded-xl border p-4 ${
                isWithinRange 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{isWithinRange ? '📍' : '⚠️'}</span>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${isWithinRange ? 'text-green-800' : 'text-red-800'}`}>
                      {isWithinRange ? 'Location Verified' : 'Out of Range'}
                    </h4>
                    <p className={`text-sm ${isWithinRange ? 'text-green-600' : 'text-red-600'}`}>
                      {nearestSite
                        ? `${distanceToSite}m from ${nearestSite.name}`
                        : 'Calculating...'}
                    </p>
                    {!isWithinRange && (
                      <p className="text-red-700 text-xs mt-1 font-medium">
                        ❌ Must be within 300 meters of site to mark attendance
                      </p>
                    )}
                  </div>
                  <div className={`text-right ${isWithinRange ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="text-2xl font-bold">{distanceToSite}m</span>
                    <p className="text-xs">away</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 overflow-y-auto max-h-[calc(100vh-220px)]">
              {mode === 'attendance' ? (
                /* ===== ATTENDANCE PANEL ===== */
                <div className="space-y-5">
                  {attendanceStep === 'capture' && (
                    <>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">Mark Attendance</h2>
                        <p className="text-gray-500 text-sm mt-1">
                          Step 1: Capture your face & verify location
                        </p>
                      </div>

                      {/* Tips */}
                      <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-4">
                        <p className="text-blue-900 font-semibold text-sm mb-2">💡 Requirements</p>
                        <ul className="space-y-1 text-blue-800 text-xs">
                          {[
                            'Face must be clearly visible',
                            'Location/GPS must be enabled',
                            'Must be within 300m of site',
                            'Good lighting improves accuracy',
                          ].map((tip) => (
                            <li key={tip} className="flex items-start gap-1.5">
                              <span className="text-green-600 font-bold mt-0.5">✓</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Sites List */}
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                        <p className="text-gray-600 text-xs font-medium mb-2">📍 Registered Sites</p>
                        <div className="max-h-32 overflow-y-auto">
                          {SITE_LOCATIONS.map((site, idx) => (
                            <div key={idx} className="text-xs text-gray-500 py-1 border-b border-gray-100 last:border-0">
                              {site.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {attendanceStep === 'select' && recognizedLabour && (
                    <>
                      {/* Recognized Person Info */}
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          {recognizedLabour.imageUrl && recognizedLabour.imageUrl !== 'N/A' && (
                            <img
                              src={recognizedLabour.imageUrl}
                              alt={recognizedLabour.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-green-300"
                            />
                          )}
                          <div>
                            <h3 className="font-bold text-green-800">{recognizedLabour.name}</h3>
                            <p className="text-green-600 text-sm">{recognizedLabour.phone}</p>
                          </div>
                          <span className="ml-auto text-green-600 text-2xl">✅</span>
                        </div>
                        <p className="text-green-700 text-xs">
                          Match confidence: {recognizedLabour.matchConfidence?.toFixed(1)}%
                        </p>
                      </div>

                      {/* Location Warning */}
                      {!isWithinRange && (
                        <div className="bg-red-50 border border-red-300 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-red-800">
                            <span className="text-xl">🚫</span>
                            <div>
                              <p className="font-bold">Cannot Mark Attendance</p>
                              <p className="text-sm">You are {distanceToSite}m away from the nearest site.</p>
                              <p className="text-xs mt-1">Must be within 300 meters.</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Already Checked In Today */}
                      {todayAttendance?.isCheckedIn && !todayAttendance?.checkOutTime && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                          <p className="text-yellow-800 text-sm font-medium">
                            ⏰ Already checked in at {todayAttendance.checkInTime}
                          </p>
                          <p className="text-yellow-700 text-xs mt-1">
                            Site: {todayAttendance.site} | Type: {todayAttendance.labourType}
                          </p>
                        </div>
                      )}

                      {/* Select Site, Type, Category */}
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3">
                          {todayAttendance?.isCheckedIn ? 'Check Out' : 'Step 2: Select Work Details'}
                        </h3>

                        {!todayAttendance?.isCheckedIn && (
                          <div className="space-y-3">
                            {renderDropdown({
                              label: 'Site',
                              name: 'site',
                              value: attendanceData.site,
                              options: dropdownData.siteNames,
                              onChange: handleAttendanceDataChange,
                              required: true,
                            })}

                            {/* Show distance for selected site */}
                            {attendanceData.site && userLocation && (
                              <div className={`text-xs p-2 rounded-lg ${
                                isWithinRange ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {isWithinRange 
                                  ? `✅ Within range (${distanceToSite}m)` 
                                  : `❌ Out of range (${distanceToSite}m) - Must be within 300m`}
                              </div>
                            )}

                            {renderDropdown({
                              label: 'Labour Type',
                              name: 'labourType',
                              value: attendanceData.labourType,
                              options: dropdownData.laborTypes,
                              onChange: handleAttendanceDataChange,
                              required: true,
                            })}

                            {renderDropdown({
                              label: 'Category',
                              name: 'category',
                              value: attendanceData.category,
                              options: dropdownData.categories,
                              onChange: handleAttendanceDataChange,
                            })}

                            {/* Show Contractor dropdown if labour type is Contractor */}
                            {attendanceData.labourType === 'Contractor Labour' &&
                              renderDropdown({
                                label: 'Contractor Name',
                                name: 'contractorName',
                                value: attendanceData.contractorName,
                                options: dropdownData.contractorNames,
                                onChange: handleAttendanceDataChange,
                              })}
                          </div>
                        )}
                      </div>

                      {/* Submit Button */}
                      <button
                        className={`w-full py-3 px-5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                          loading || !isWithinRange
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : todayAttendance?.isCheckedIn
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                        onClick={handleSubmitAttendance}
                        disabled={loading || !isWithinRange}
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : !isWithinRange ? (
                          '🚫 Out of 300m Range'
                        ) : todayAttendance?.isCheckedIn ? (
                          '👋 Check Out'
                        ) : (
                          '✅ Check In'
                        )}
                      </button>

                      {/* Retry Location Button */}
                      {!isWithinRange && (
                        <button
                          className="w-full py-2 px-4 rounded-xl text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                          onClick={fetchUserLocation}
                          disabled={locationLoading}
                        >
                          {locationLoading ? '🔄 Refreshing...' : '📍 Refresh Location'}
                        </button>
                      )}
                    </>
                  )}

                  {attendanceStep === 'done' && attendanceResult && (
                    <>
                      {/* Success Result Card */}
                      <div
                        className={`rounded-xl p-4 border ${
                          attendanceResult.status === 'checked-in'
                            ? 'bg-green-50 border-green-200'
                            : attendanceResult.status === 'checked-out'
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-yellow-50 border-yellow-200'
                        }`}
                      >
                        <h3
                          className={`text-lg font-bold mb-3 ${
                            attendanceResult.status === 'checked-in'
                              ? 'text-green-800'
                              : attendanceResult.status === 'checked-out'
                              ? 'text-blue-800'
                              : 'text-yellow-800'
                          }`}
                        >
                          {attendanceResult.status === 'checked-in' && '✅ Check-in Successful'}
                          {attendanceResult.status === 'checked-out' && '👋 Check-out Successful'}
                          {attendanceResult.status === 'completed' && '📋 Already Completed Today'}
                        </h3>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between border-b border-gray-100 pb-1.5">
                            <span className="text-gray-500">👤 Name</span>
                            <span className="text-gray-800 font-semibold">
                              {attendanceResult.labour?.name}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 pb-1.5">
                            <span className="text-gray-500">🏗️ Site</span>
                            <span className="text-gray-800 font-semibold">
                              {attendanceResult.attendance?.site}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 pb-1.5">
                            <span className="text-gray-500">👷 Type</span>
                            <span className="text-gray-800 font-semibold">
                              {attendanceResult.attendance?.labourType}
                            </span>
                          </div>
                          {attendanceResult.attendance?.category && (
                            <div className="flex justify-between border-b border-gray-100 pb-1.5">
                              <span className="text-gray-500">📂 Category</span>
                              <span className="text-gray-800 font-semibold">
                                {attendanceResult.attendance?.category}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between border-b border-gray-100 pb-1.5">
                            <span className="text-gray-500">📍 Distance</span>
                            <span className="text-gray-800 font-semibold">
                              {attendanceResult.attendance?.distance || distanceToSite}m
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 pb-1.5">
                            <span className="text-gray-500">🕐 Check-in</span>
                            <span className="text-gray-800 font-semibold">
                              {attendanceResult.attendance?.checkInTime}
                            </span>
                          </div>
                          {attendanceResult.attendance?.checkOutTime && (
                            <>
                              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                                <span className="text-gray-500">🕐 Check-out</span>
                                <span className="text-gray-800 font-semibold">
                                  {attendanceResult.attendance?.checkOutTime}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">⏱️ Working Hours</span>
                                <span className="text-gray-800 font-bold">
                                  {attendanceResult.attendance?.workingHours}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* ===== REGISTER PANEL ===== */
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Register New Labour</h2>
                    <p className="text-gray-500 text-sm mt-1">Fill details and capture 3–5 photos</p>
                  </div>

                  {/* Form Fields */}
                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-200 outline-none transition-all disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="10-digit number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      maxLength={10}
                      disabled={loading}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-200 outline-none transition-all disabled:opacity-50"
                    />
                  </div>

                  {renderDropdown({
                    label: 'Labour Type',
                    name: 'labourType',
                    value: formData.labourType,
                    options: dropdownData.laborTypes,
                    onChange: handleInputChange,
                    required: true,
                  })}

                  {renderDropdown({
                    label: 'Default Category',
                    name: 'category',
                    value: formData.category,
                    options: dropdownData.categories,
                    onChange: handleInputChange,
                  })}

                  {renderDropdown({
                    label: 'Default Site',
                    name: 'site',
                    value: formData.site,
                    options: dropdownData.siteNames,
                    onChange: handleInputChange,
                  })}

                  {formData.labourType === 'Contractor Labour' &&
                    renderDropdown({
                      label: 'Contractor Name',
                      name: 'contractorName',
                      value: formData.contractorName,
                      options: dropdownData.contractorNames,
                      onChange: handleInputChange,
                    })}

                  {/* Captured Photos Preview */}
                  {capturedPhotos.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3 border border-dashed border-gray-300">
                      <p className="text-gray-600 text-xs font-medium mb-2">
                        Captured photos ({capturedPhotos.length})
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {capturedPhotos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={photo}
                              alt={`Capture ${index + 1}`}
                              className="w-full h-16 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow"
                              onClick={() => removePhoto(index)}
                              disabled={loading}
                            >
                              ✕
                            </button>
                            <span className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                              {index + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Register Button */}
                  <button
                    className={`w-full py-3 px-5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      loading || capturedPhotos.length < 3
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-800 text-white hover:bg-gray-700 active:scale-[0.98]'
                    }`}
                    onClick={handleRegister}
                    disabled={loading || capturedPhotos.length < 3}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                        Registering...
                      </>
                    ) : (
                      '✅ Register Labour'
                    )}
                  </button>

                  {/* Photo Guidelines */}
                  <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-3">
                    <p className="text-amber-900 font-semibold text-xs mb-1.5">📸 Photo Guidelines</p>
                    <ul className="space-y-1 text-amber-800 text-xs">
                      {[
                        'Capture minimum 3 photos',
                        'Take from different angles',
                        'Good lighting improves accuracy',
                      ].map((tip) => (
                        <li key={tip} className="flex items-start gap-1.5">
                          <span className="text-green-600 font-bold mt-0.5">✓</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Message Box */}
              {message && (
                <div
                  className={`mt-4 p-3 rounded-xl flex items-start gap-2 text-sm border ${
                    messageType === 'success'
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : messageType === 'error'
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-blue-50 border-blue-200 text-blue-800'
                  }`}
                >
                  <span className="flex-shrink-0">
                    {messageType === 'success' ? '✅' : messageType === 'error' ? '❌' : '⏳'}
                  </span>
                  <span className="font-medium">{message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>🔒 Face Recognition + GPS Location Verification • Secure Attendance System</p>
        </div>
      </div>
    </div>
  );
};

export default LabourAttendance;

//////
