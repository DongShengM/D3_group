
/*
 *  StationMap - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all stations of the bike-sharing network
 */

class StationMap {

	/*
	 *  Constructor method
	 */
	constructor(parentElement, displayData) {
		this.parentElement = parentElement;
		this.displayData = displayData;

		this.initVis();
	}


	/*
	 *  Initialize station map
	 */
	initVis () {
		let vis = this;

		vis.map = L.map('station-map').setView([40.712784, -74.005941], 13);
		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		 attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	 }).addTo(vis.map);

		vis.wrangleData();
	}


	/*
	 *  Data wrangling
	 */
	wrangleData () {
		let vis = this;

		// No data wrangling/filtering needed

		// Update the visualization
		vis.updateVis();
	}

	updateVis() {
		let vis = this;
		let popupContent =  "<strong>One World Trade Center</strong><br/>";
		popupContent += "New York City";
	
		// Create a marker and bind a popup with a particular HTML content
		let marker = L.marker([40.713008, -74.013169])
			.bindPopup(popupContent)
			.addTo(vis.map);

	}
}

