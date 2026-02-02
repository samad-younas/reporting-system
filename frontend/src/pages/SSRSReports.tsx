import React, { useEffect, useRef, useState } from "react";
import { Crystal } from "crystis-react";

interface Customer {
  Id: string;
  Name: string;
  Town: string;
  Country: string;
}

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

const SSRSReports: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const crystalRef = useRef(new Crystal());

  useEffect(() => {
    setCustomers([
      {
        Id: generateUUID(),
        Name: "Maria Weiss",
        Town: "Berlin",
        Country: "Germany",
      },
      {
        Id: generateUUID(),
        Name: "Pedro Alvarez",
        Town: "México D.F.",
        Country: "Mexico",
      },
      {
        Id: generateUUID(),
        Name: "Anna Tóth",
        Town: "Szeged",
        Country: "Hungary",
      },
      {
        Id: generateUUID(),
        Name: "Jan Eriksson",
        Town: "Mannheim",
        Country: "Sweden",
      },
      {
        Id: generateUUID(),
        Name: "Giulia Donatelli",
        Town: "Milano",
        Country: "Italia",
      },
    ]);
  }, []);

  const showReport = () => {
    crystalRef.current.tjsonstring = JSON.stringify({ Customers: customers });
    crystalRef.current.tcode = "DEMO1";
    crystalRef.current.tucode = "0000";
    crystalRef.current.trptfilePath = "/reports/CustomerReport.rpt";
    crystalRef.current.tDEST = "0";
    crystalRef.current.showReport();
  };
  return (
    <div className="border border-gray-100 h-96 flex items-center justify-center bg-white rounded-md shadow-sm">
      <div>
        <h2>Customer List</h2>
        <table border={1} cellPadding={10}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Town</th>
              <th>Country</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.Id}>
                <td>{c.Name}</td>
                <td>{c.Town}</td>
                <td>{c.Country}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={showReport}>Show Report</button>
      </div>
    </div>
  );
};

export default SSRSReports;
