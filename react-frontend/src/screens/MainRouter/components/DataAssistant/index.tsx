import { useState } from "react";
import FileTree from "./components/FileTree/index";

const DataAssistant = () => {
  return (
    <div className="mb-4">
      <header className="bg-indigo-100 shadow">
        <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900 mr-4">
              Data assistant
            </h1>
          </div>
        </div>
      </header>

      <div className="grid grid-rows-7 grid-cols-3 gap-4 h-75">
        <div
          className="px-4 py-2 col-span-2"
          style={{ gridRow: "span 7 / span 7" }}
        >
          <FileTree />
        </div>
        <div
          className="flex justify-center items-center border rounded-lg shadow m-2"
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            console.log(JSON.parse(e.dataTransfer.getData("text")));
          }}
        >
          Assembly
        </div>
        <div
          className="flex justify-center items-center border rounded-lg shadow m-2"
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            console.log(JSON.parse(e.dataTransfer.getData("text")));
          }}
        >
          Annotation
        </div>
        <div
          className="flex justify-center items-center border rounded-lg shadow m-2"
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            console.log(JSON.parse(e.dataTransfer.getData("text")));
          }}
        >
          Mapping
        </div>
        <div
          className="flex justify-center items-center border rounded-lg shadow m-2"
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            console.log(JSON.parse(e.dataTransfer.getData("text")));
          }}
        >
          Taxonomic assignment (Milts)
        </div>
        <div
          className="flex justify-center items-center border rounded-lg shadow m-2"
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            console.log(JSON.parse(e.dataTransfer.getData("text")));
          }}
        >
          Annotation completeness (Busco)
        </div>
        <div
          className="flex justify-center items-center border rounded-lg shadow m-2"
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            console.log(JSON.parse(e.dataTransfer.getData("text")));
          }}
        >
          Annotation completeness (fCat)
        </div>
        <div
          className="flex justify-center items-center border rounded-lg shadow m-2"
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            console.log(JSON.parse(e.dataTransfer.getData("text")));
          }}
        >
          Repeat masking (Repeatmasker)
        </div>
      </div>
    </div>
  );
};

export default DataAssistant;
