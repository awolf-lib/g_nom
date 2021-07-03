import React, { Component } from "react";
import "../../../../App.css";

import API from "../../../../api/genomes";

import { Link } from "react-router-dom";

import SpeciesProfilePictureViewer from "../../../../components/SpeciesProfilePictureViewer";
import LoadingSpinner from "../../../../components/LoadingSpinner";

export default class AllAssembliesList extends Component {
  constructor(props) {
    super();
    this.state = {
      genomes: [],
      showDetails: null,
      genomeSearch: "",
      loadingAssemblies: false,
    };

    this.timeout = undefined;
  }

  componentDidMount() {
    this.setState({ loadingAssemblies: true });
    this.timeout = setTimeout(() => {
      this.fetchAssemblies();
    }, 500);
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  async fetchAssemblies() {
    var api = new API();
    let response = await api.fetchAllAssemblies();

    if (response && response.payload) {
      this.setState({ genomes: response.payload, loadingAssemblies: false });
    } else {
      this.setState({ loadingAssemblies: false });
    }
  }

  render() {
    const { loadingAssemblies, genomes, genomeSearch } = this.state;
    return (
      <div>
        {/* HEADER */}
        <header className="bg-indigo-100 shadow">
          <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900 mr-4">
                All assemblies
              </h1>
            </div>
            <input
              onChange={(e) => this.setState({ genomeSearch: e.target.value })}
              className="border-2 border-gray-300 bg-white h-10 px-5 rounded-lg text-sm focus:outline-none"
              type="search"
              name="search"
              placeholder="Search..."
            />
          </div>
        </header>

        {/* LIST */}
        <main className="mb-8">
          <div className="mx-auto py-6 sm:px-6 lg:px-8 mt-4">
            <div className="px-4 sm:px-0">
              <div className="">
                {/* HEADERS */}
                <div className="bg-indigo-100 my-2 flex shadow truncate font-semibold text-lg items-center">
                  <div className="w-1/12 px-4 py-2">Image</div>
                  <div className="w-4/12 px-4 py-2">Scientific name</div>
                  <div className="w-3/12 px-4 py-2">Taxon ID</div>
                  <div className="w-4/12 px-4 py-2">Assembly name</div>
                </div>

                <hr className="shadow my-2" />

                {/* ELEMENTS */}
                {!loadingAssemblies ? (
                  <div>
                    {genomes && genomes.length > 0 ? (
                      genomes.map((genome) => {
                        if (
                          genome.scientificName
                            .toLowerCase()
                            .includes(genomeSearch.toLowerCase()) ||
                          genome.assemblyName
                            .toLowerCase()
                            .includes(genomeSearch.toLowerCase()) ||
                          genome.taxonID
                            .toString()
                            .toLowerCase()
                            .includes(genomeSearch.toLowerCase()) ||
                          genomeSearch === ""
                        ) {
                          return (
                            <Link
                              to={
                                "/g-nom/assemblies/assembly:" +
                                genome.assemblyID
                              }
                              className="even:bg-gray-100 odd:bg-indigo-50 my-2 flex shadow-lg bg-gradient-to-b hover:from-blue-500 hover:to-blue-300 hover:text-white rounded-lg truncate items-center hover:ring-2 ring-offset-2"
                              key={genome.assemblyID}
                            >
                              <div className="w-1/12 px-4 py-2">
                                <div className="w-16 h-16 object-contain">
                                  <SpeciesProfilePictureViewer
                                    taxonID={genome.taxonID}
                                  />
                                </div>
                              </div>
                              <div className="w-4/12 px-4 py-2">
                                {genome.scientificName}
                              </div>
                              <div className="w-3/12 px-4 py-2">
                                {genome.taxonID}
                              </div>
                              <div className="w-4/12 px-4 py-2">
                                {genome.assemblyName}
                              </div>
                            </Link>
                          );
                        } else {
                          return <div />;
                        }
                      })
                    ) : (
                      <div className="my-2 py-4 px-2 text-center shadow rounded-lg">
                        <Link
                          to="/g-nom/assemblies/manageAssemblies"
                          className="mx-2 text-blue-600 hover:text-blue-400"
                        >
                          Import new assembly...
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-center h-16">
                    <LoadingSpinner label="Loading..." />
                  </div>
                )}
                <hr className="shadow my-2" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}
