import classNames from "classnames";
import { ReactNode, useState } from "react";

interface TabContent {
  label: string;
  content: ReactNode;
}

const TabWorkspace = ({ tabs }: { tabs: TabContent[] }) => {
  const [activeTab, setActiveTab] = useState<TabContent>(tabs[0]);

  const activeTabClass = (tab: string) =>
    classNames(
      "px-8 py-1 text-xs rounded-t-lg mx-3 transition duration-300 text-white select-none shadow z-10",
      {
        "bg-gray-400 hover:bg-gray-500 cursor-pointer": activeTab.label !== tab,
        "transform scale-110 bg-gray-500 -translate-y-px": activeTab.label === tab,
      }
    );

  return (
    <div className="animate-grow-y">
      <div>
        <div className="flex">
          {tabs &&
            tabs.length > 0 &&
            tabs.map((tab, index) => (
              <div
                key={tab.label + "(" + index + ")"}
                onClick={() => setActiveTab(tab)}
                className={activeTabClass(tab.label)}
              >
                {tab.label}
              </div>
            ))}
        </div>
        <div className="border-t-2 border-gray-500">
          {tabs &&
            tabs.length > 0 &&
            tabs.map(
              (tab, index) =>
                tab.label === activeTab.label && (
                  <div key={tab.label + "_content (" + index + ")"}>{tab.content}</div>
                )
            )}
        </div>
      </div>
    </div>
  );
};

export default TabWorkspace;
