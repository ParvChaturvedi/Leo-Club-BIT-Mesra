import React, { useState } from "react";
import { db } from "../../firebase-config";
import { collection, addDoc } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import takeshiBg from "./takeshisbg.jpg";
import mismatchedBg from "./mismatched-bg.jpg";


const RegistrationForm = () => {
  const location = useLocation();
  const eventName = new URLSearchParams(location.search).get("event"); // Get event from URL

  // Ensure the correct collection name
  const eventCollection =
    eventName === "takeshi" ? "takeshi" : eventName === "mismatched" ? "mismatched" : null;

  // Properly format event name for display
  const formattedEventName =
    eventName === "mismatched"
      ? "Mismatched"
      : eventName === "takeshi"
      ? "Takeshi's Castle"
      : eventName
      ? eventName.charAt(0).toUpperCase() + eventName.slice(1)
      : "Unknown Event";

  const [formData, setFormData] = useState({
    teamName: "",
    teamID: "",
    leaderName: "",
    leaderPhone: "",
    leaderEmail: "",
    leaderBranch: "",
    member2Name: "",
    member2Email: "",
    member2Phone: "",
    member3Name: "",
    member4Name: "",
  });

  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState("team");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ""
      });
    }
  };

  // Function to validate team section
  const validateTeamSection = () => {
    const newErrors = {};
    if (!formData.teamName.trim()) {
      newErrors.teamName = "Team name is required";
    }
    if (!formData.teamID.trim()) {
      newErrors.teamID = "Team ID is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to validate leader section
  const validateLeaderSection = () => {
    const newErrors = {};
    if (!formData.leaderName.trim()) {
      newErrors.leaderName = "Leader name is required";
    }
    if (!formData.leaderPhone.trim()) {
      newErrors.leaderPhone = "Leader phone is required";
    }
    if (!formData.leaderEmail.trim()) {
      newErrors.leaderEmail = "Leader email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.leaderEmail)) {
      newErrors.leaderEmail = "Please enter a valid email";
    }
    if (!formData.leaderBranch.trim()) {
      newErrors.leaderBranch = "Leader branch is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to handle navigation to next section
  const handleNextSection = (currentSection, nextSection) => {
    let isValid = false;
    
    if (currentSection === "team") {
      isValid = validateTeamSection();
    } else if (currentSection === "leader") {
      isValid = validateLeaderSection();
    }
    
    if (isValid) {
      setActiveSection(nextSection);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation before submission
    let teamValid = validateTeamSection();
    let leaderValid = validateLeaderSection();
    
    if (!teamValid) {
      setActiveSection("team");
      return;
    }
    
    if (!leaderValid) {
      setActiveSection("leader");
      return;
    }
    
    // Member 2 validation (assuming Member 2 is required)
    const memberErrors = {};
    if (!formData.member2Name.trim()) {
      memberErrors.member2Name = "Member 2 name is required";
    }
    
    if (Object.keys(memberErrors).length > 0) {
      setErrors({...errors, ...memberErrors});
      return;
    }
    
    setIsSubmitting(true);

    if (!eventCollection) {
      setMessage("❌ Invalid event name. Cannot submit.");
      setIsSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, eventCollection), formData);
      setMessage("✅ Registration Successful!");
      setFormData({
        teamName: "",
        teamID: "",
        leaderName: "",
        leaderPhone: "",
        leaderEmail: "",
        leaderBranch: "",
        member2Name: "",
        member2Email: "",
        member2Phone: "",
        member3Name: "",
        member4Name: "",
      }); // Reset form
      setErrors({});
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage("");
      }, 5000);
    } catch (error) {
      console.error("Error adding document: ", error);
      setMessage("❌ Registration Failed. Please try again.");
    }
    setIsSubmitting(false);
  };

  // Theme configurations
  const themes = {
    takeshi: {
      primaryColor: "yellow",
      secondaryColor: "black",
      accentColor: "yellow",
      backgroundImage: `url(${takeshiBg})`, 
      overlayColor: "rgba(0, 0, 0, 0.75)",
      logo: "TC",
      tagline: "Conquer the Castle!",
      buttonColor: "bg-yellow-500 hover:bg-yellow-600 text-black",
      borderColor: "border-yellow-500",
      textHighlight: "text-yellow-400",
    },
    mismatched: {
      primaryColor: "pink",
      secondaryColor: "purple",
      accentColor: "purple",
      backgroundImage:`url(${mismatchedBg})`,
      overlayColor: "rgba(25, 0, 50, 0.8)",
      logo: "MM",
      tagline: "Find Your Perfect Match!",
      buttonColor: "bg-pink-500 hover:bg-pink-600 text-white",
      borderColor: "border-pink-500",
      textHighlight: "text-pink-400",
    }
  };

  // Set current theme based on event name
  const currentTheme = eventName === "mismatched" ? themes.mismatched : themes.takeshi;

  // Generate tailwind classes dynamically based on theme
  const getThemeClasses = () => {
    if (eventName === "mismatched") {
      return {
        headerBg: "bg-pink-600",
        headerText: "text-white",
        formBg: "bg-purple-900/60",
        formBorder: "border-pink-500",
        highlightText: "text-pink-400",
        buttonBg: "bg-pink-500 hover:bg-pink-600",
        buttonText: "text-white",
        inputBorder: "border-purple-600 hover:border-pink-500",
        inputFocus: "focus:ring-pink-500",
        activeStep: "border-pink-400 bg-pink-500",
        sectionTitle: "text-pink-400",
        cardBg: "bg-purple-900/30",
        cardBorder: "border-purple-800 hover:border-pink-500",
        errorText: "text-red-300",
      };
    } else {
      return {
        headerBg: "bg-yellow-600",
        headerText: "text-black",
        formBg: "bg-black/60",
        formBorder: "border-yellow-500",
        highlightText: "text-yellow-400",
        buttonBg: "bg-yellow-500 hover:bg-yellow-600",
        buttonText: "text-black",
        inputBorder: "border-gray-600 hover:border-yellow-500",
        inputFocus: "focus:ring-yellow-500",
        activeStep: "border-yellow-400 bg-yellow-500",
        sectionTitle: "text-yellow-400",
        cardBg: "bg-gray-800/30",
        cardBorder: "border-gray-700 hover:border-yellow-500",
        errorText: "text-red-300",
      };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <div 
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-fixed transition-all duration-500"
      style={{
        backgroundImage: `linear-gradient(${currentTheme.overlayColor}, ${currentTheme.overlayColor}), ${currentTheme.backgroundImage}`,
        backgroundSize: 'cover'
      }}
    >
      <div className="max-w-xl mx-auto">
        {/* Banner with logo */}
        <div className="text-center transform -rotate-2 mb-0 mt-6">
          <div className={`${themeClasses.headerBg} ${themeClasses.headerText} py-2 px-8 inline-block rounded-lg shadow-lg`}>
            <h1 className="text-2xl font-extrabold tracking-wider">{formattedEventName.toUpperCase()}</h1>
          </div>
          <p className={`${themeClasses.highlightText} text-md mt-2 font-semibold`}>TEAM REGISTRATION</p>
        </div>

        {/* Form Card */}
        <div className={`backdrop-blur-md ${themeClasses.formBg} p-8 shadow-2xl rounded-lg border-t-4 ${themeClasses.formBorder}`}>
          {message && (
            <div
              className={`mb-6 p-4 rounded-md animate-pulse ${
                message.startsWith("✅")
                  ? "bg-green-900/70 text-green-300 border-l-4 border-green-500"
                  : "bg-red-900/70 text-red-300 border-l-4 border-red-500"
              }`}
            >
              <p className="text-center font-medium">{message}</p>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="flex justify-between mb-8">
            <div 
              onClick={() => setActiveSection("team")}
              className={`cursor-pointer rounded-full w-10 h-10 flex items-center justify-center border-2 ${
                activeSection === "team" ? themeClasses.activeStep : "border-gray-500 text-gray-400 hover:text-gray-200"
              } transition-all duration-300`}
            >
              1
            </div>
            <div className="flex-1 h-1 self-center mx-1 bg-gray-600"></div>
            <div 
              onClick={() => validateTeamSection() && setActiveSection("leader")}
              className={`cursor-pointer rounded-full w-10 h-10 flex items-center justify-center border-2 ${
                activeSection === "leader" ? themeClasses.activeStep : "border-gray-500 text-gray-400 hover:text-gray-200"
              } transition-all duration-300`}
            >
              2
            </div>
            <div className="flex-1 h-1 self-center mx-1 bg-gray-600"></div>
            <div 
              onClick={() => {
                if (validateTeamSection() && validateLeaderSection()) {
                  setActiveSection("members");
                } else if (validateTeamSection()) {
                  setActiveSection("leader");
                }
              }}
              className={`cursor-pointer rounded-full w-10 h-10 flex items-center justify-center border-2 ${
                activeSection === "members" ? themeClasses.activeStep : "border-gray-500 text-gray-400 hover:text-gray-200"
              } transition-all duration-300`}
            >
              3
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Team Information Section */}
            <div className={`transition-all duration-500 ${activeSection === "team" ? "block" : "hidden"}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold ${themeClasses.sectionTitle}`}>Team Details</h3>
              </div>
              
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-gray-300 mb-1 text-sm group-hover:text-gray-100 transition-colors duration-200">Team Name</label>
                  <input
                    type="text"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleChange}
                    required
                    className={`w-full p-3 bg-gray-800/70 border ${errors.teamName ? "border-red-500" : themeClasses.inputBorder} rounded-lg text-white 
                    focus:outline-none focus:ring-2 ${themeClasses.inputFocus} focus:border-transparent
                    transition-all duration-300`}
                    placeholder="Enter your team name"
                  />
                  {errors.teamName && <p className={`mt-1 text-sm ${themeClasses.errorText}`}>{errors.teamName}</p>}
                </div>
                
                <div className="group">
                  <label className="block text-gray-300 mb-1 text-sm group-hover:text-gray-100 transition-colors duration-200">Team ID</label>
                  <input
                    type="text"
                    name="teamID"
                    value={formData.teamID}
                    onChange={handleChange}
                    required
                    className={`w-full p-3 bg-gray-800/70 border ${errors.teamID ? "border-red-500" : themeClasses.inputBorder} rounded-lg text-white 
                    focus:outline-none focus:ring-2 ${themeClasses.inputFocus} focus:border-transparent
                    transition-all duration-300`}
                    placeholder="Enter your team ID"
                  />
                  {errors.teamID && <p className={`mt-1 text-sm ${themeClasses.errorText}`}>{errors.teamID}</p>}
                </div>
                
                <div className="flex justify-end mt-6">
                  <button 
                    type="button" 
                    onClick={() => handleNextSection("team", "leader")}
                    className={`${themeClasses.buttonBg} ${themeClasses.buttonText} font-bold py-2 px-6 rounded-lg
                    transition duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Leader Information Section */}
            <div className={`transition-all duration-500 ${activeSection === "leader" ? "block" : "hidden"}`}>
              <h3 className={`text-xl font-bold ${themeClasses.sectionTitle} mb-4`}>Team Leader</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-gray-300 mb-1 text-sm group-hover:text-gray-100 transition-colors duration-200">Full Name</label>
                    <input
                      type="text"
                      name="leaderName"
                      value={formData.leaderName}
                      onChange={handleChange}
                      required
                      className={`w-full p-3 bg-gray-800/70 border ${errors.leaderName ? "border-red-500" : themeClasses.inputBorder} rounded-lg text-white 
                      focus:outline-none focus:ring-2 ${themeClasses.inputFocus} focus:border-transparent
                      transition-all duration-300`}
                      placeholder="Enter leader's name"
                    />
                    {errors.leaderName && <p className={`mt-1 text-sm ${themeClasses.errorText}`}>{errors.leaderName}</p>}
                  </div>
                  
                  <div className="group">
                    <label className="block text-gray-300 mb-1 text-sm group-hover:text-gray-100 transition-colors duration-200">Phone Number</label>
                    <input
                      type="tel"
                      name="leaderPhone"
                      value={formData.leaderPhone}
                      onChange={handleChange}
                      required
                      className={`w-full p-3 bg-gray-800/70 border ${errors.leaderPhone ? "border-red-500" : themeClasses.inputBorder} rounded-lg text-white 
                      focus:outline-none focus:ring-2 ${themeClasses.inputFocus} focus:border-transparent
                      transition-all duration-300`}
                      placeholder="Enter phone number"
                    />
                    {errors.leaderPhone && <p className={`mt-1 text-sm ${themeClasses.errorText}`}>{errors.leaderPhone}</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-gray-300 mb-1 text-sm group-hover:text-gray-100 transition-colors duration-200">Email Address</label>
                    <input
                      type="email"
                      name="leaderEmail"
                      value={formData.leaderEmail}
                      onChange={handleChange}
                      required
                      className={`w-full p-3 bg-gray-800/70 border ${errors.leaderEmail ? "border-red-500" : themeClasses.inputBorder} rounded-lg text-white 
                      focus:outline-none focus:ring-2 ${themeClasses.inputFocus} focus:border-transparent
                      transition-all duration-300`}
                      placeholder="Enter email address"
                    />
                    {errors.leaderEmail && <p className={`mt-1 text-sm ${themeClasses.errorText}`}>{errors.leaderEmail}</p>}
                  </div>
                  
                  <div className="group">
                    <label className="block text-gray-300 mb-1 text-sm group-hover:text-gray-100 transition-colors duration-200">Branch</label>
                    <input
                      type="text"
                      name="leaderBranch"
                      value={formData.leaderBranch}
                      onChange={handleChange}
                      required
                      className={`w-full p-3 bg-gray-800/70 border ${errors.leaderBranch ? "border-red-500" : themeClasses.inputBorder} rounded-lg text-white 
                      focus:outline-none focus:ring-2 ${themeClasses.inputFocus} focus:border-transparent
                      transition-all duration-300`}
                      placeholder="Enter branch"
                    />
                    {errors.leaderBranch && <p className={`mt-1 text-sm ${themeClasses.errorText}`}>{errors.leaderBranch}</p>}
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <button 
                    type="button" 
                    onClick={() => setActiveSection("team")}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg
                    transition duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Back
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => handleNextSection("leader", "members")}
                    className={`${themeClasses.buttonBg} ${themeClasses.buttonText} font-bold py-2 px-6 rounded-lg
                    transition duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Team Members Section */}
            <div className={`transition-all duration-500 ${activeSection === "members" ? "block" : "hidden"}`}>
              <h3 className={`text-xl font-bold ${themeClasses.sectionTitle} mb-4`}>Team Members</h3>
              
              {/* Member 2 */}
              <div className={`mb-6 p-4 ${themeClasses.cardBg} rounded-lg border ${errors.member2Name ? "border-red-500" : themeClasses.cardBorder} transition-all duration-300`}>
                <h4 className={`${themeClasses.highlightText} mb-3 border-b border-gray-700 pb-2`}>Member 2</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="group">
                    <input
                      type="text"
                      name="member2Name"
                      placeholder="Full Name"
                      value={formData.member2Name}
                      onChange={handleChange}
                      required
                      className={`w-full p-3 bg-gray-800/70 border ${errors.member2Name ? "border-red-500" : themeClasses.inputBorder} rounded-lg text-white 
                      focus:outline-none focus:ring-2 ${themeClasses.inputFocus} focus:border-transparent
                      transition-all duration-300`}
                    />
                    {errors.member2Name && <p className={`mt-1 text-sm ${themeClasses.errorText}`}>{errors.member2Name}</p>}
                  </div>
                  <div className="group">
                    <input
                      type="email"
                      name="member2Email"
                      placeholder="Email"
                      value={formData.member2Email}
                      onChange={handleChange}
                      className={`w-full p-3 bg-gray-800/70 border ${errors.member2Email ? "border-red-500" : themeClasses.inputBorder} rounded-lg text-white 
                      focus:outline-none focus:ring-2 ${themeClasses.inputFocus} focus:border-transparent
                      transition-all duration-300`}
                    />
                    {errors.member2Email && <p className={`mt-1 text-sm ${themeClasses.errorText}`}>{errors.member2Email}</p>}
                  </div>
                  <div className="group">
                    <input
                      type="tel"
                      name="member2Phone"
                      placeholder="Phone"
                      value={formData.member2Phone}
                      onChange={handleChange}
                      className={`w-full p-3 bg-gray-800/70 border ${errors.member2Phone ? "border-red-500" : themeClasses.inputBorder} rounded-lg text-white 
                      focus:outline-none focus:ring-2 ${themeClasses.inputFocus} focus:border-transparent
                      transition-all duration-300`}
                    />
                    {errors.member2Phone && <p className={`mt-1 text-sm ${themeClasses.errorText}`}>{errors.member2Phone}</p>}
                  </div>
                </div>
              </div>

              {/* Member 3 */}
              <div className={`mb-6 p-4 ${themeClasses.cardBg} rounded-lg border ${themeClasses.cardBorder} transition-all duration-300`}>
                <h4 className={`${themeClasses.highlightText} mb-3 border-b border-gray-700 pb-2`}>Member 3</h4>
                <div className="group">
                  <input
                    type="text"
                    name="member3Name"
                    placeholder="Full Name"
                    value={formData.member3Name}
                    onChange={handleChange}
                    className={`w-full p-3 bg-gray-800/70 border ${errors.member3Name ? "border-red-500" : themeClasses.inputBorder} rounded-lg text-white 
                    focus:outline-none focus:ring-2 ${themeClasses.inputFocus} focus:border-transparent
                    transition-all duration-300`}
                  />
                  {errors.member3Name && <p className={`mt-1 text-sm ${themeClasses.errorText}`}>{errors.member3Name}</p>}
                </div>
              </div>

              {/* Member 4 */}
              <div className={`p-4 ${themeClasses.cardBg} rounded-lg border ${themeClasses.cardBorder} transition-all duration-300`}>
                <h4 className={`${themeClasses.highlightText} mb-3 border-b border-gray-700 pb-2`}>Member 4</h4>
                <div className="group">
                  <input
                    type="text"
                    name="member4Name"
                    placeholder="Full Name"
                    value={formData.member4Name}
                    onChange={handleChange}
                    className={`w-full p-3 bg-gray-800/70 border ${errors.member4Name ? "border-red-500" : themeClasses.inputBorder} rounded-lg text-white 
                    focus:outline-none focus:ring-2 ${themeClasses.inputFocus} focus:border-transparent
                    transition-all duration-300`}
                  />
                  {errors.member4Name && <p className={`mt-1 text-sm ${themeClasses.errorText}`}>{errors.member4Name}</p>}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button 
                  type="button" 
                  onClick={() => setActiveSection("leader")}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg
                  transition duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Back
                </button>
                
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`${themeClasses.buttonBg} ${themeClasses.buttonText} font-bold py-3 px-6 rounded-lg
                  transition duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50
                  ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {isSubmitting ? "Submitting..." : "Submit Registration"}
                </button>
              </div>
            </div>
          </form>

          {/* Event-specific tagline */}
          <div className="mt-8 pt-4 border-t border-gray-700 text-center text-gray-400 text-sm">
            <p>{eventName === "mismatched" ? "Find your perfect match with us!" : "Prepare for the challenge! Only the strongest teams will conquer the castle."}</p>
            <p className={`${themeClasses.highlightText} mt-2 text-sm font-semibold`}>{currentTheme.tagline}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
