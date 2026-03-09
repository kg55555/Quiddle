import { useState } from "react";
import Footer from "components/organisms/footer";
import Header from "components/organisms/header";


interface ProfileProp {
  title: string;
  answer: string;
}

function Profile() {
  const [activeTab, setActiveTab] = useState("Profile");

  const [profileData, setProfileData] = useState<ProfileProp[]>([
    { title: "First Name", answer: "current_first_name" },
    { title: "Last Name", answer: "current_last_name" },
  ]);

  const handleInputChange = (index: number, newAnswer: string) => {
    const updatedData = [...profileData];
    updatedData[index].answer = newAnswer;
    setProfileData(updatedData);
  };

  const handleUpdate = () => {
    console.log("Profile updated:", profileData);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header/>
      <main className="flex flex-col flex-1">
        <section className="flex flex-col w-full relative flex-1">
          {/* Container matching header width */}
          <div className='flex w-full justify-center'>
            <div className="w-full md:w-[80%] px-4 md:px-0">
              
              {/* Mobile: Horizontal tabs, Desktop: Vertical tabs on left */}
              <div className="w-full flex flex-col lg:flex-row">
                {/* Tab Buttons */}
                <div className="flex flex-row lg:flex-col border-b lg:border-b-0 lg:border-r w-full lg:w-48">
                  <button
                    onClick={() => setActiveTab("Profile")}
                    className={`flex-1 lg:flex-none h-12 lg:h-auto p-2 text-center lg:text-left ${
                      activeTab === "Profile" ? 
                      "border-b-2 lg:border-b-0 lg:border-r-2 border-blue-500 text-blue-500 font-semibold":
                      "text-gray-500"
                    }`}
                  >
                    Profile
                  </button>

                  <button
                    onClick={() => setActiveTab("Quiz History")}
                    className={`flex-1 lg:flex-none h-12 lg:h-auto p-2 text-center lg:text-left ${
                      activeTab === "Quiz History" ? 
                      "border-b-2 lg:border-b-0 lg:border-r-2 border-blue-500 text-blue-500 font-semibold":
                      "text-gray-500"
                    }`}
                  >
                    Quiz History
                  </button>
                    
                  <button
                    onClick={() => setActiveTab("Created Quizzes")}
                    className={`flex-1 lg:flex-none h-12 lg:h-auto p-2 text-center lg:text-left ${
                      activeTab === "Created Quizzes" ? 
                      "border-b-2 lg:border-b-0 lg:border-r-2 border-blue-500 text-blue-500 font-semibold":
                      "text-gray-500"
                    }`}
                  >
                    Created Quizzes
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-2 flex-1 flex flex-col">
                  {activeTab === "Profile" && (
                    <div className="flex flex-col flex-1">
                      <div className="flex-1">
                        <h2 className="text-lg font-bold mb-4">Profile Information</h2>
                        {profileData.map((item, index) => (
                          <div key={index} className="mb-4 p-3 ">
                            <h3 className="font-semibold text-gray-700">{item.title}</h3>
                            <input
                              type="text"
                              value={item.answer}
                              onChange={(e) => handleInputChange(index, e.target.value)}
                              className="w-full mt-2 p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        ))}
                        
                        
                      </div>

                      {/* Update Button */}
                      <div className="flex justify-center lg:justify-end mt-4 mb-4">
                        <button
                          onClick={handleUpdate}
                          className="bg-blue-500 text-white font-semibold py-2 px-6 rounded hover:bg-blue-600 transition"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === "Quiz History" && (
                    <div>
                      <h2 className="text-lg font-bold mb-2">Quiz History</h2>
                      <p>Feature coming soon!</p>
                    </div>
                  )}

                  {activeTab === "Created Quizzes" && (
                    <div>
                      <h2 className="text-lg font-bold mb-2">Created Quizzes</h2>
                      <p>Feature coming soon!</p>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer/>
    </div>
  );
}

export default Profile;