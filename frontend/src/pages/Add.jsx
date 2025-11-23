import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./add.css"; 

const Add = () => {
  const navigate = useNavigate();

  const initialFormState = {
    firstName: "", lastName: "", middleName: "", birthday: "",
    gender: "", cellBlock: "", caseStatus: "", caseNumber: "", caseName: "",
    educationalLevel: "", admissionDate: "",     
    dateConvicted: "", sentenceYears: "",
    courtName: "", nextHearingDate: ""
  };

  const [formData, setFormData] = useState(initialFormState);
  const [workHistory, setWorkHistory] = useState([""]); 
  const [message, setMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 👇 1. NEW STATE FOR IMAGE
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // Optional: To show the image before uploading

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 👇 2. NEW HANDLER FOR FILE INPUT
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Create a temporary preview URL
    }
  };
  
  const handleWorkChange = (index, value) => {
    const newWork = [...workHistory];
    newWork[index] = value;
    setWorkHistory(newWork);
  };
  const addWorkField = () => setWorkHistory([...workHistory, ""]);
  const removeWorkField = (index) => setWorkHistory(workHistory.filter((_, i) => i !== index));

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  // ---------------------------------------------------------
  // 👇 UPDATED SAVE FUNCTION (Using FormData)
  // ---------------------------------------------------------
  const confirmSave = async () => {
    setShowConfirmModal(false); 
    setMessage("Submitting...");
    
    // 👇 A. CREATE FORMDATA OBJECT
    // We cannot use standard JSON for file uploads. We must use FormData.
    const dataToSend = new FormData();

    // Append all text fields
    Object.keys(formData).forEach(key => {
      dataToSend.append(key, formData[key]);
    });

    // Append Work Experience (Loop and append same key for array)
    workHistory.forEach(job => {
      if (job.trim() !== "") {
        dataToSend.append('workExperience', job);
      }
    });

    // Append the File (Key must be 'profile_photo' to match Multer)
    if (selectedFile) {
      dataToSend.append('profile_photo', selectedFile);
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Session expired. Please log in.");
        navigate("/"); 
        return;
      }

      // 👇 B. SEND REQUEST (Note the Headers change!)
      const response = await fetch("http://localhost:5000/api/pdl", {
        method: "POST",
        headers: { 
            // ❌ DO NOT SET 'Content-Type': 'application/json'
            // ✅ Let the browser set the boundary automatically for FormData
            "Authorization": `Bearer ${token}` 
        },
        body: dataToSend, // Send the FormData object, not JSON.stringify
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        // Reset Form
        setFormData(initialFormState);
        setWorkHistory([""]);
        setSelectedFile(null); // Clear file
        setPreviewUrl(null);   // Clear preview
        window.scrollTo(0, 0);
      } else {
        if (response.status === 401 || response.status === 403) {
            setMessage("❌ Authorization Failed. Please log in again.");
        } else {
            setMessage(`❌ Error: ${data.error}`);
        }
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to connect to server");
    }
  };

  return (
    <div className="add-container">
      <div className="form-header">
        <h2>📋 New Inmate Record</h2>
        <p>Fill in the details below. Additional fields will appear based on Case Status.</p>
      </div>

      <div className="form-content">
        <form onSubmit={handleFormSubmit} className="form-grid">
          
          {/* 👇 3. NEW IMAGE INPUT SECTION */}
          <h3 className="section-title">PDL Profile Photo</h3>
          <div className="full-width photo-upload-container">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="photo-preview" 
                />
              ) : (
                // Optional: A placeholder circle if no image is selected
                <div className="photo-preview" style={{background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8'}}>
                  <span>No Photo</span>
                </div>
              )}
              <br/>
              <input 
                type="file" 
                className="input" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
          </div>

          <h3 className="section-title">Personal Information</h3>
          <div className="form-group"><label className="label">First Name</label><input className="input" name="firstName" value={formData.firstName} onChange={handleChange} required /></div>
          <div className="form-group"><label className="label">Last Name</label><input className="input" name="lastName" value={formData.lastName} onChange={handleChange} required /></div>
          <div className="form-group"><label className="label">Middle Name</label><input className="input" name="middleName" value={formData.middleName} onChange={handleChange} /></div>
          <div className="form-group"><label className="label">Birthday</label><input type="date" className="input" name="birthday" value={formData.birthday} onChange={handleChange} required /></div>
          <div className="form-group full-width"><label className="label">Gender</label><select className="input" name="gender" value={formData.gender} onChange={handleChange} required><option value="">-- Select --</option><option value="Male">Male</option><option value="Female">Female</option></select></div>

          <h3 className="section-title">Legal & Detention Status</h3>
          <div className="form-group"><label className="label">Cell Block</label><input className="input" name="cellBlock" value={formData.cellBlock} onChange={handleChange} placeholder="e.g. Block A" required /></div>
          <div className="form-group"><label className="label">Case Number</label><input className="input" name="caseNumber" value={formData.caseNumber} onChange={handleChange} required /></div>
          <div className="form-group"><label className="label">Case Status</label><select className="input" name="caseStatus" value={formData.caseStatus} onChange={handleChange} required><option value="">-- Select Status --</option><option value="Detained">Detained (Pending)</option><option value="Sentenced">Sentenced (Convicted)</option><option value="Awaiting Transfer">Awaiting Transfer</option></select></div>
          <div className="form-group"><label className="label">Case Name / Crime</label><input className="input" name="caseName" value={formData.caseName} onChange={handleChange} placeholder="e.g. Theft" required /></div>
          <div className="form-group full-width"><label className="label">Date Admitted</label><input type="date" className="input" name="admissionDate" value={formData.admissionDate} onChange={handleChange} required /></div>

          {formData.caseStatus === "Sentenced" && (
            <div className="full-width" style={{background: '#f0f9ff', padding: '15px', borderRadius: '8px', border: '1px solid #bae6fd', marginTop: '10px'}}>
              <h4 style={{margin: '0 0 10px 0', color: '#0284c7'}}>⚖️ Conviction Details</h4>
              <div className="form-grid">
                <div className="form-group"><label className="label">Date Convicted</label><input type="date" className="input" name="dateConvicted" value={formData.dateConvicted} onChange={handleChange} required /></div>
                <div className="form-group"><label className="label">Sentence (Years)</label><input type="number" className="input" name="sentenceYears" value={formData.sentenceYears} onChange={handleChange} placeholder="e.g. 5" required /></div>
              </div>
            </div>
          )}

          {formData.caseStatus === "Detained" && (
            <div className="full-width" style={{background: '#fff7ed', padding: '15px', borderRadius: '8px', border: '1px solid #fed7aa', marginTop: '10px'}}>
              <h4 style={{margin: '0 0 10px 0', color: '#ea580c'}}>⚖️ Court Hearing Details</h4>
              <div className="form-grid">
                <div className="form-group"><label className="label">Court Name</label><input className="input" name="courtName" value={formData.courtName} onChange={handleChange} placeholder="e.g. RTC Branch 12" required /></div>
                <div className="form-group"><label className="label">Next Hearing Date</label><input type="date" className="input" name="nextHearingDate" value={formData.nextHearingDate} onChange={handleChange} required /></div>
              </div>
            </div>
          )}

          <h3 className="section-title">Background & Experience</h3>
          <div className="form-group full-width"><label className="label">Educational Level</label><select className="input" name="educationalLevel" value={formData.educationalLevel} onChange={handleChange}><option value="">-- Select Level --</option><option value="No Formal Education">No Formal Education</option><option value="Elementary Undergraduate">Elementary Undergraduate</option><option value="Elementary Graduate">Elementary Graduate</option><option value="High School Undergraduate">High School Undergraduate</option><option value="High School Graduate">High School Graduate</option><option value="College Undergraduate">College Undergraduate</option><option value="College Graduate">College Graduate</option></select></div>

          <div className="form-group full-width">
            <label className="label">Work Experience</label>
            <div style={{background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
              {workHistory.map((job, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input className="input" style={{background: 'white'}} placeholder="e.g. Carpenter" value={job} onChange={(e) => handleWorkChange(index, e.target.value)} />
                  {workHistory.length > 1 && (<button type="button" onClick={() => removeWorkField(index)} style={{background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '0 15px', cursor: 'pointer'}}>X</button>)}
                </div>
              ))}
              <button type="button" onClick={addWorkField} style={{fontSize: '14px', color: '#2563eb', fontWeight: '600', background: 'transparent', border: 'none', padding: '5px 0', cursor: 'pointer'}}>+ Add Another Job</button>
            </div>
          </div>

          <button type="submit" className="btn-submit">Save PDL Record</button>
          {message && <div className="message">{message}</div>}

        </form>
      </div>

      {/* === CUSTOM MODAL COMPONENT === */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <span className="modal-icon">📝</span>
            <div className="modal-title">Confirm Save</div>
            <p className="modal-text">
              Are you sure you want to create this PDL record? 
              <br/> This will initialize their Behavior Score to 100.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowConfirmModal(false)}>Cancel</button>
              <button className="btn-confirm" onClick={confirmSave}>Yes, Save Record</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Add;