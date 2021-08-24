import React, {useRef, useEffect, useState} from 'react';
import { MapContainer, TileLayer, Popup, Polyline } from 'react-leaflet'
import './App.css';
import axios from 'axios';
import polyline from '@mapbox/polyline'

function App() {

  interface Node {
    activityPositions: any;
    activityName: string;
    activityDistance: any;
    activityType: string;
  }

  const [activities, setActivities] = useState<Node[]>([]);

  const clientID = "31973";
  const clientSecret = "9763e3d072bcddee2e2da4cd062b945114af6633";
  const refreshToken = "f727208ddb97f5667c94632d450fbbdfcae3365a";
  const auth_link = "https://www.strava.com/oauth/token";
  const activities_link = `https://www.strava.com/api/v3/athlete/activities`;

  useEffect(() => {
    async function fetchData() {
      const stravaAuthResponse = await axios.all([
        axios.post(`${auth_link}?client_id=${clientID}&client_secret=${clientSecret}&refresh_token=${refreshToken}&grant_type=refresh_token`)
      ]);

      
      const stravaActivityResponse = await axios.get(`${activities_link}?access_token=${stravaAuthResponse[0].data.access_token}`);
    console.log(stravaActivityResponse.data);
      
    const polylines = [];


    for (let i = 0; i < stravaActivityResponse.data.length; i ++) {
      if (stravaActivityResponse.data[i].map.summary_polyline !== null) {
        const activity_polyline = polyline.decode(stravaActivityResponse.data[i].map.summary_polyline);
        const activity_name = stravaActivityResponse.data[i].name;
        const activity_distance = (stravaActivityResponse.data[i].distance / 1000).toFixed(2);
        const activity_type = stravaActivityResponse.data[i].type;
        polylines.push({activityPositions: activity_polyline, activityName: activity_name, activityDistance: activity_distance, activityType: activity_type});
    } 
    }
    
    //console.log(polylines)
    setActivities(polylines);
    


    }

    fetchData();
  }, []);

  return (
   
    <MapContainer center={[-37.8322305,144.9910983]} zoom={10} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {activities.map((activity, i) => (
        <Polyline key = {i} positions={activity.activityPositions}>
          <Popup>
            <div>
              <h2>{"Name: " + activity.activityName}</h2>
              <h2>{"Distance: " + activity.activityDistance + " km"}</h2>
              <h2>{"Type: " + activity.activityType}</h2>


            </div>
          </Popup>
        </Polyline>
      ))}
    </MapContainer>
  );
}

export default App;
