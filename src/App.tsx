import { useState, useEffect, DragEvent } from "react";

import fs from "vite-plugin-fs/browser";

const ProjectCategories = [
  "Asset Management & Portfolio Tools",
  "Data Analytics & Insights",
  "Blockchain News & Media",
  "Cross-Chain Interoperability",
  "Governance Tools",
  "DeFi, Decentralized Finance",
  "DAOs, ReFi, and DAO Tooling",
  "Exchanges, DEX, Trading & Liquidity",
  "Developer Education & Mentoring",
  "Explorers, Security & Node Deployment Tools",
  "Wallet and wallet tools",
  "Developer Tools - Smart Contracts",
  "Blockchain Developer Hub",
  "Gaming & Entertainment",
  "NFTs, POAPs & Collectibles",
  "Grants, Capital Allocation & Onboarding",
  "Web3 Community Engagement",
  "Web3 Education & Skill Development",
  "Digital Identity & Social Privacy Innovations",
  "Local Blockchain Communities",
  "Community Building",
  "Ethereum Core Tech Foundations",
];

const individualCategories = [
  "Development & Infrastructure",
  "Blockchain Development",
  "Layer 2 & Cross-Chain Solutions",
  "Governance Tokenomics and Analytics",
  "Security & Auditing",
  "Community Building",
  "Onboarding",
  "Awarness",
  "NFTs",
  "Education",
  "User Experience & Adoption",
  "Content Creation & Media",
  "Blockchain Education",
  "International & Multilingual Support",
];

interface ContributionLink {
  type: string;
  url: string;
  description: string;
}

interface ImpactMetric {
  description: string;
  number: number;
  url: string;
}

interface FundingSource {
  type: string;
  currency: string;
  amount: number;
  description: string;
}

interface Application {
  applicantType: string;
  websiteUrl: string;
  bio: string;
  contributionDescription: string;
  contributionLinks: ContributionLink[];
  impactCategory: string[];
  impactDescription: string;
  impactMetrics: ImpactMetric[];
  fundingSources: FundingSource[];
  payoutAddress: string;
  understoodKYCRequirements: boolean;
  understoodFundClaimPeriod: boolean;
  certifiedNotDesignatedOrSanctionedOrBlocked: boolean;
  certifiedNotSponsoredByPoliticalFigureOrGovernmentEntity: boolean;
  certifiedNotBarredFromParticipating: boolean;
  displayName: string;
  applicantName: string;
  profileImageUrl: string;
  bannerImageUrl: string;
  applicationMetadataPtr: string;
  RPGF3_Application_UID: string;
  applicantAddress: string;
  pwIsFlagged?: boolean;
  pwApplicantTypeChecked?: boolean;
  pwCategorySuggestions?: string;
  pwCategory?: string;
  pwFlaggedReason?: string;
  pwRecategorizeToType?: string;
  pwRecategorizeReason?: string;
}

type ApplicationType = "PROJECT" | "INDIVIDUAL";

const dataDir = "pw-retropgf3-categorize/data";

export default function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [applicationType, setApplicationType] =
    useState<ApplicationType>("PROJECT");
  const [flagReason, setFlagReason] = useState<string>("");
  const [filter, setFilter] = useState<string>("");

  const [categories, setCategories] = useState<string[]>([]);

  // Load applications from JSON files
  useEffect(() => {
    (async () => {
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

  useEffect(() => {
    if (applicationType === "PROJECT") {
      setCategories(ProjectCategories);
    } else {
      setCategories(individualCategories);
    }
  }, [applicationType]);

  const handleDragStart = (e: DragEvent, id: string) => {
    e.dataTransfer.setData("appId", id);
  };

  const saveApp = async (app: Application) => {
    await fs.writeFile(
      `${dataDir}/${app.applicantAddress}.json`,
      JSON.stringify(app, null, 2)
    );
  };

  const handleFlag = async () => {
    if (selectedApp) {
      delete selectedApp.pwCategory;
      selectedApp.pwIsFlagged = true;
      selectedApp.pwFlaggedReason = flagReason;
      await saveApp(selectedApp);
      setApplications(
        applications.map((app) =>
          app.applicantAddress === selectedApp.applicantAddress
            ? selectedApp
            : app
        )
      );
      setFlagReason("");
      closePopup();
    }
  };

  const handleDrop = (e: DragEvent, category: string | undefined) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData("appId");
    const app = applications.find((app) => app.applicantAddress === appId);
    if (app) {
      if (category === undefined) {
        delete app.pwCategory;
      } else {
        app.pwCategory = category;
      }
      saveApp(app);
      setApplications([...applications]);
    }
  };

  const handleSwitchApplicantType = async (app: Application) => {
    if (app.applicantType === "PROJECT") {
      app.applicantType = "INDIVIDUAL";
    } else {
      app.applicantType = "PROJECT";
    }
    delete app.pwCategory;
    await saveApp(app);
    setApplications(
      applications.map((a) =>
        a.applicantAddress === app.applicantAddress ? app : a
      )
    );
  };

  const handleClick = (app: Application) => {
    setSelectedApp(app);
  };

  const closePopup = () => {
    setSelectedApp(null);
  };

  return (
    <>
      <div className="fixed z-10 w-full p-10 bg-black">
        <div className="flex items-center justify-start gap-5">
          <h1 className="mb-4 ml-4 text-4xl">Organise projects</h1>
          Application type:{" "}
          <button
            onClick={() =>
              applicationType === "PROJECT"
                ? setApplicationType("INDIVIDUAL")
                : setApplicationType("PROJECT")
            }
            className="px-4 py-2 bg-green-800 border rounded"
          >
            {applicationType}
          </button>
          <input
            type="text"
            className="p-2 bg-gray-800 w-96"
            placeholder="Filter…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>
      <div className="container w-full">
        <div className="flex">
          <div
            className="flex-1 p-4"
            key={undefined}
            onDrop={(e) => handleDrop(e, undefined)}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="sticky top-0 flex items-end w-56 pb-3 mb-4 text-2xl bg-black h-60">
              Uncategorized
            </div>
            {applications
              .filter(
                (app) =>
                  !app.pwCategory &&
                  app.applicantType === applicationType &&
                  !app.pwIsFlagged
              )
              .map((app) => (
                <div
                  className="p-2 mb-2 bg-orange-800 border cursor-pointer"
                  key={app.applicantAddress}
                  draggable
                  onDragStart={(e) => handleDragStart(e, app.applicantAddress)}
                  onClick={() => handleClick(app)}
                >
                  <img
                    src={app.profileImageUrl}
                    className="w-10 h-10 rounded-full"
                    loading="lazy"
                  />
                  {app.displayName}
                </div>
              ))}
          </div>
          {categories.map((category) => (
            <div
              className="flex-1 p-4"
              key={category}
              onDrop={(e) => handleDrop(e, category)}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="sticky top-0 flex items-end w-56 pb-3 mb-4 text-2xl bg-black h-60">
                {category}
              </div>
              {applications
                .filter((app) =>
                  filter
                    ? app.displayName
                        .toLowerCase()
                        .includes(filter.toLowerCase()) &&
                      app.pwCategory === category &&
                      app.applicantType === applicationType
                    : app.pwCategory === category &&
                      app.applicantType === applicationType
                )
                .map((app) => (
                  <div
                    className="p-2 mb-2 bg-gray-800 border cursor-pointer active:text-gray-500 active:bg-gray-700"
                    key={app.applicantAddress}
                    draggable
                    onDragStart={(e) =>
                      handleDragStart(e, app.applicantAddress)
                    }
                    onClick={() => handleClick(app)}
                  >
                    <img
                      src={app.profileImageUrl}
                      className="w-10 h-10 rounded-full"
                      loading="lazy"
                    />
                    {app.displayName}
                  </div>
                ))}
            </div>
          ))}
        </div>
        {selectedApp && (
          <div className="fixed top-0 left-0 z-20 flex flex-col items-center justify-center w-full h-full gap-2 bg-gray-500 bg-opacity-50">
            <div className="w-[900px] text-right">
              <button
                className="px-4 py-2 rounded-full bg-slate-400"
                onClick={closePopup}
              >
                X
              </button>
            </div>
            <div className="w-[900px] p-5 overflow-scroll text-white bg-black rounded max-h-[600px] z-20">
              <div className="flex flex-col gap-5">
                <h2 className="text-xl">{selectedApp.displayName}</h2>
                <p>Applicant address: {selectedApp.applicantAddress}</p>
                <p>Application UID: {selectedApp.RPGF3_Application_UID}</p>
                <p>{selectedApp.contributionDescription}</p>
                <p>{selectedApp.impactDescription}</p>
                <p>
                  <a href={selectedApp.websiteUrl} target="_blank">
                    {selectedApp.websiteUrl}
                  </a>
                </p>
                <h2 className="text-xl">Contribution links</h2>
                {selectedApp.contributionLinks.map((link) => (
                  <div key={link.url}>
                    <a href={link.url} target="_blank">
                      {link.type} - {link.description}
                    </a>
                  </div>
                ))}
                <h2 className="text-xl">Impact metrics</h2>
                {selectedApp.impactMetrics.map((metric) => (
                  <div key={metric.url}>
                    <a href={metric.url} target="_blank">
                      {metric.description} - {metric.number}
                    </a>
                  </div>
                ))}
                <h2 className="text-xl">Funding sources</h2>
                {selectedApp.fundingSources.map((source) => (
                  <div key={source.description}>
                    {source.type} - {source.currency} - {source.amount} -{" "}
                    {source.description}
                  </div>
                ))}
                <div className="flex flex-col gap-2 p-5 bg-red-800">
                  <h2 className="text-xl">Switch applicant type</h2>
                  <button
                    className="p-2 mt-2 border rounded"
                    onClick={() => handleSwitchApplicantType(selectedApp)}
                  >
                    {selectedApp.applicantType === "PROJECT"
                      ? "Switch to individual"
                      : "Switch to project"}
                  </button>
                  <h2 className="text-xl">Flag this application</h2>
                  <div>
                    <label htmlFor="flagReason" className="block mt-2">
                      Flag reason
                    </label>
                    <textarea
                      id="flagReason"
                      value={flagReason}
                      onChange={(e) => setFlagReason(e.target.value)}
                      className="w-full p-2 mt-1 bg-red-900 border rounded "
                    ></textarea>
                  </div>
                  <button
                    onClick={handleFlag}
                    className="p-2 mt-2 border rounded"
                  >
                    Flag
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
