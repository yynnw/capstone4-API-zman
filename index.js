import express from "express";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const port = 3000;
const app = express();

const hebcalAPI = "https://www.hebcal.com/zmanim?cfg=json"
let geonameid = "4833320"
let zipCode = ""

//set the directory for static files (eg. css and assets) using an absolute path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.set('views', path.join(__dirname, 'views'));

// Middleware to parse application/x-www-form-urlencoded data
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
    try {
        const result = await axios.get(hebcalAPI, {params: {"sec":"1", "geonameid":geonameid, "zip":zipCode}});
    const location = result.data.location.title;
    const sofZmanShmaMGA16Point1 = result.data.times.sofZmanShmaMGA16Point1;
    const sofZmanShma = result.data.times.sofZmanShma;
    const mga = timeFormatter(sofZmanShmaMGA16Point1);
    const gra = timeFormatter(sofZmanShma);
    const date = dateFormatter("2024-08-22")
      console.log(date)
res.render("index.ejs",{location:location, date:date,  mga:"Magen Avraham", mga_time:mga, gra:"Gra", gra_time:gra } );
    } catch (error) {
    res.send("404 Location Not Found")
    }
    
});

app.post("/geonameid", (req, res) => {
    geonameid = req.body.geonameid;
    zipCode = req.body.zipCode;
    if (zipCode) {
        geonameid = "";
    }
    if (!zipCode && !geonameid) {
        geonameid = "4833320"
    }
    res.redirect("/")
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});

//TODO: Adjust for other timezones
function timeFormatter(timeItem) {
    console.log(timeItem)
    const date = new Date(timeItem);
    const options = {
        hour: 'numeric', // "1"
        minute: 'numeric', // "30"
        second: 'numeric', // "00" (optional)
        // timeZoneName: 'short'  "EDT" (optional)
      };
    const formattedTime = date.toLocaleTimeString('en-US', options);
    return formattedTime
}

function dateFormatter(dateItem) {
    const date = new Date(dateItem + 'T00:00:00');
    const options = {
        weekday: 'long', // "Tuesday"
        year: 'numeric', // "2024"
        month: 'long', // "August"
        day: 'numeric', // "21"
    };
    const formattedDate = date.toLocaleDateString('en-US', options);
    return formattedDate
}

