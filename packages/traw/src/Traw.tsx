import React from "react";
import { Header } from "./components/Header";
import { Panel } from "./components/Panel";
import { Slide } from "./components/Slide";
import { TrawContext } from "./hooks/useTrawApp";
import "./index.css";
import { TrawApp } from "./state/TrawApp";
import { Record } from "./types";

export interface TrawProps {
  app?: TrawApp;
  id?: string;
  records?: Record[];
  onAddRecord?: (record: Record) => void;
}

const Traw = ({ app, id, records = [], onAddRecord }: TrawProps) => {
  const [sId, setSId] = React.useState(id);

  // Create a new app when the component mounts.
  const [trawApp, setTrawApp] = React.useState(() => {
    if (app) return app;

    const a = new TrawApp();
    return a;
  });

  React.useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.document?.fonts) return;

    function refreshBoundingBoxes() {
      trawApp.app.refreshBoundingBoxes();
    }
    window.document.fonts.addEventListener("loadingdone", refreshBoundingBoxes);
    return () => {
      window.document.fonts.removeEventListener(
        "loadingdone",
        refreshBoundingBoxes
      );
    };
  }, [trawApp]);

  // Use the `key` to ensure that new selector hooks are made when the id changes
  return (
    <TrawContext.Provider value={trawApp}>
      <div
        id="traw"
        data-testid="traw"
        className="flex flex-1 flex-col overflow-hidden bg-traw-sky"
      >
        <div className="h-14 m-0 sm:m-2 mb-0">
          <div className="flex flex-row h-14 pl-3 bg-white items-center rounded:none sm:rounded-2xl shadow-[0_10px_60px_rgba(189,188,249,0.5)]">
            <Header
              title={"Test Document"}
              canEdit={true}
              handleChangeTitle={() => null}
              Room={<div />}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col sm:flex-row">
          <div className="flex flex-1 ">
            <Slide />
          </div>
          <div className="flex basis-[269px] m-2 sm:ml-0  ">
            <Panel handlePlayClick={() => null} />
          </div>
        </div>
      </div>
    </TrawContext.Provider>
  );
};

export { Traw };
