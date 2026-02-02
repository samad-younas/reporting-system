import React, { useEffect, useRef, useState } from "react";
import { Crystal } from "crystis-react";

interface Customer {
  Id: string;
  Name: string;
  Town: string;
  Country: string;
}
const SSRSReports: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const crystalRef = useRef(new Crystal());

  useEffect(() => {
    setCustomers([
      {
        Id: "1",
        Name: "Maria Weiss",
        Town: "Berlin",
        Country: "Germany",
      },
      {
        Id: "2",
        Name: "Pedro Alvarez",
        Town: "México D.F.",
        Country: "Mexico",
      },
      {
        Id: "3",
        Name: "Anna Tóth",
        Town: "Szeged",
        Country: "Hungary",
      },
      {
        Id: "4",
        Name: "Jan Eriksson",
        Town: "Mannheim",
        Country: "Sweden",
      },
      {
        Id: "5",
        Name: "Giulia Donatelli",
        Town: "Milano",
        Country: "Italia",
      },
    ]);
  }, []);

  const showReport = () => {
    crystalRef.current.tjsonstring = JSON.stringify({ Customers: customers });
    crystalRef.current.tcode = "CF9269";
    crystalRef.current.tucode = "20AD";
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
