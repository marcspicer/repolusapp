import { Layer } from 'leaflet';

export class LeafletLayersDemoModel {

	constructor(
		public baseLayers: {
			id: string,
			name: string,
			enabled: boolean,
			layer: Layer
		}[],

		public baseLayer: string,

		public overlayLayers: {
			id: string,
			name: string,
			enabled: boolean,
			layer: Layer
		}[] = []
	) { 
		console.log('constructor callled');
	 };

	updateLeaflet(arg){
		console.log('updateLeaflet callled',arg);
		this.overlayLayers = arg;
	}

} 