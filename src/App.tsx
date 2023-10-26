import React, { useState, useEffect, DragEvent } from "react";

import fs from "vite-plugin-fs/browser";

type Application = {
  applicantAddress: string;
  displayName: string;
  pwCategory: string;
  contributionDescription: string;
  impactDescription: string;
  websiteUrl: string;
};

const categories = [
  "AI, Artificial Intelligence & Security",
  "Asset Management & Portfolio Tools",
  "Data Analytics & Insights",
  "Blockchain News & Media",
  "Cross-Chain Interoperability",
  "DAO Tooling",
  "Governance Tools",
  "DeFi, Decentralized Finance",
  "ReFi, Regenerative Finance",
  "Exchanges, DEX, Trading & Liquidity",
  "Developer Education & Mentoring",
  "Developer Tools - Nodes",
  "Developer Tools - Wallets",
  "Developer Tools - Smart Contracts",
  "Developer Tools - Other",
  "Gaming & Entertainment",
  "NFTs, POAPs & Collectibles",
  "Wallet & Key Management",
  "Fundraising & Capital",
  "Music & Creative NFTs",
  "Web3 Education & Adoption",
  "Reputations & Rewards",
  "Local Blockchain Communities",
  "Grants & Retroactive Funding",
  "Identity & Privacy",
  "Community Building",
  "Donations & Public Goods",
  "Bridges & Swaps",
  "Oracles",
  "Decentralized Storage",
  "Ethereum Infrastructure",
  "Messaging & Social Networks",
  "Smart Contract Auditing & Security",
  "DAOs",
  "Marketplaces & Auctions",
  "Banking & Payments",
];

export default function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Load applications from JSON files
  useEffect(() => {
    (async () => {
      const dataDir = "../data";
      const files = await fs.readdir(dataDir);
      console.log(files);

      const apps: Application[] = [];

      for (const fileName of files) {
        const filePath = `${dataDir}/${fileName}`;
        const file = await fs.readFile(filePath);
        apps.push(JSON.parse(file.toString()));
      }

      setApplications(apps);
    })();
  }, []);

  const handleDragStart = (e: DragEvent, id: string) => {
    e.dataTransfer.setData("appId", id);
  };

  const saveApp = async (app: Application) => {
    await fs.writeFile(
      `../data/${app.applicantAddress}.json`,
      JSON.stringify(app, null, 2)
    );
  };

  const handleDrop = (e: DragEvent, category: string) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData("appId");
    const app = applications.find((app) => app.applicantAddress === appId);
    if (app) {
      app.pwCategory = category;
      saveApp(app);
      setApplications([...applications]);
    }
  };

  const handleClick = (app: Application) => {
    setSelectedApp(app);
  };

  const closePopup = () => {
    setSelectedApp(null);
  };

  return (
    <div className="container w-full p-10">
      <h1 className="mb-4 ml-4 text-4xl">Organise projects</h1>
      <div className="flex">
        {categories.map((category) => (
          <div
            className="flex-1 p-4"
            key={category}
            onDrop={(e) => handleDrop(e, category)}
            onDragOver={(e) => e.preventDefault()}
          >
            <h2 className="mb-4 text-2xl">{category}</h2>
            {applications
              .filter((app) => app.pwCategory === category)
              .map((app) => (
                <div
                  className="p-2 mb-2 bg-gray-800 border cursor-pointer"
                  key={app.applicantAddress}
                  draggable
                  onDragStart={(e) => handleDragStart(e, app.applicantAddress)}
                  onClick={() => handleClick(app)}
                >
                  {app.displayName}
                </div>
              ))}
          </div>
        ))}
      </div>
      {selectedApp && (
        <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-gray-500 bg-opacity-50">
          <div className="max-w-2xl p-4 text-white bg-black rounded">
            <button className="float-right" onClick={closePopup}>
              X
            </button>
            <div className="flex flex-col gap-5">
              <h2>{selectedApp.displayName}</h2>
              <p>{selectedApp.contributionDescription}</p>
              <p>{selectedApp.impactDescription}</p>
              <p>
                <a href={selectedApp.websiteUrl} target="_blank">
                  {selectedApp.websiteUrl}
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
