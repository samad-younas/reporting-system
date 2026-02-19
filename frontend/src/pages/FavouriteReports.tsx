import React from "react";

const FavouriteReports: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Favourites</h1>
      <p className="text-muted-foreground mb-2">
        This page will display your favourite reports for quick access.
      </p>
      {/* TODO: Implement favourite reports list */}
      <div className="bg-card p-4 rounded shadow text-center text-muted-foreground">
        No favourite reports yet.
      </div>
    </div>
  );
};

export default FavouriteReports;
