import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "components/organisms/footer";
import Header from "components/organisms/header";
import { useAuth } from "../context/AuthContext";


interface ProfileProp {
    title: string;
    key: string;
    answer: string;
}

function Profile() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState("Profile");
    const [fetchLoading, setFetchLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [profileData, setProfileData] = useState<ProfileProp[]>([
        { title: "First Name", key: "first_name", answer: "" },
		{ title: "Middle Name", key: "middle_name", answer: "" },
        { title: "Last Name", key: "last_name", answer: "" },
    ]);

    // Fetch real user data on mount
    useEffect(() => {
		
		if (!token) return; // don't fetch if not logged in

		
        fetch('/api/user/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => {
                setProfileData([
                    { title: "First Name", key: "first_name", answer: data.first_name ?? "" },
					{ title: "Middle Name", key: "middle_name", answer: data.middle_name ?? "" },
                    { title: "Last Name", key: "last_name", answer: data.last_name ?? "" },
                ]);
            })
            .catch(() => alert("Failed to load profile"))
            .finally(() => setFetchLoading(false));
    }, [token]);

    const handleInputChange = (index: number, newAnswer: string) => {
        const updatedData = [...profileData];
        updatedData[index].answer = newAnswer;
        setProfileData(updatedData);
    };

    // Send updated name fields to the API
    const handleUpdate = async () => {
        const body = Object.fromEntries(profileData.map(item => [item.key, item.answer]));

        try {
            setSaving(true);
            const res = await fetch('/api/user/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error('Failed to update');
            alert("Profile updated!");
        } catch {
            alert("Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
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
                                                {fetchLoading ? (
                                                    <p className="text-gray-500">Loading profile...</p>
                                                ) : (
                                                    profileData.map((item, index) => (
                                                        <div key={index} className="mb-4 p-3">
                                                            <h3 className="font-semibold text-gray-700">{item.title}</h3>
                                                            <input
                                                                type="text"
                                                                value={item.answer}
                                                                onChange={(e) => handleInputChange(index, e.target.value)}
                                                                className="w-full mt-2 p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                                            />
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            {/* Update Button */}
                                            <div className="flex justify-center lg:justify-end mt-4 mb-4">
                                                <button
                                                    onClick={handleUpdate}
                                                    disabled={saving || fetchLoading}
                                                    className="bg-blue-500 text-white font-semibold py-2 px-6 rounded hover:bg-blue-600 transition disabled:opacity-50"
                                                >
                                                    {saving ? "Updating..." : "Update"}
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
                                            <p className="text-gray-500">
                                                Manage your quizzes from the <Link to="/hub" className="text-blue-500 underline">Hub</Link>.
                                            </p>
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
