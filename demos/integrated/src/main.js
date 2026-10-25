// Recovery integration: reuse the one streaming implementation, never fork city data.
// This is a technical preview, not Doubao's unavailable original main.js.
import {mountCityViewer} from '../../city-viewer/src/main.js';
mountCityViewer({integrated:true});
