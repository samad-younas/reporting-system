import React from "react";

const Profile: React.FC = () => {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
        <h1 className="text-2xl text-primary sm:text-3xl font-bold tracking-tight">
          Profile Section
        </h1>
        <div className="flex flex-col items-center">
          <img
            src="https://cdn-icons-png.freepik.com/512/8608/8608769.png"
            alt="Profile"
            className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover"
          />
          <span className="text-sm md:text-base text-muted-foreground">
            Joined: Jan 2023
          </span>
        </div>
      </div>
      <p className="text-sm md:text-base text-muted-foreground mt-1">
        User profile details will be shown here.
      </p>
      {/* Profile Pic and content */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full">
        <section className="border rounded-lg p-4 md:p-6 md:w-1/2 w-full">
          <h2 className="text-lg font-semibold mb-4">User Information</h2>
          <p className="mb-2">
            <strong>Email:</strong> abc@example.com
          </p>
          <p className="mb-2">
            <strong>Location:</strong> New York
          </p>
          <p className="mb-2">
            <strong>Role:</strong> Admin
          </p>
        </section>
        <section className="border rounded-lg p-4 md:p-6 md:w-1/2 w-full">
          <h2 className="text-lg font-semibold mb-4">Settings</h2>
          <p className="mb-2">
            User settings and preferences will be shown here.
          </p>
          <div className="mt-4">
            <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
              Edit Profile
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
