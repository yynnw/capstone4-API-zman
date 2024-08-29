import express from "express";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const port = process.env.PORT || 8080;
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
    const dateItem = result.data.date;
    const mga = timeFormatter(sofZmanShmaMGA16Point1);
    const gra = timeFormatter(sofZmanShma);
    const date = dateFormatter(dateItem)
    console.log(date)
    res.render("index.ejs",{location:location, date:date,  mga:"Magen Avraham", mga_time:mga, gra:"Gra", gra_time:gra } );
    } catch (error) {
    res.status(404).send("Location Not Found <p><a href='/'>Home</a></p>");
    geonameid = "4833320"
    }
    
});

app.post("/submit", (req, res) => {
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

function timeFormatter(timeItem) {
    const formattedTime = timeItem.match(/T(\d{2}:\d{2}:\d{2})/)[1];
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

