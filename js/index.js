
const __JSON_URL__ = "https://nominal-rolls.dva.gov.au/searchAdvancedJSON.json?serviceName=ALL&specialityId=0&branchId=0&categoryId=0&pow=Y&searchType=ADVANCED&conflict=WW2";
const __intro_spd__ = 5000;
const __flash_spd__ = 300;


let inty, people;
let doDetailWrite = true;
let iterator = 0;

if (window.location.href.includes("https")) {
    document.getElementById("insecr").style.display = "block";
}

function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

fetch('pows.json').then(response => response.json()).then(data => {
    people = data
    shuffle(people)
    setTimeout(() => {
        inty = setInterval(() => {

            if (doDetailWrite) {

                let person = people[inty % people.length];
                let name = toTitleCase(person.attributes.Name.split(", ").reverse().join(" "));
                let placeofbirth = person.attributes.PlaceOfBirth;
                let infourl = `https://nominal-rolls.dva.gov.au/veteran?id=${person.attributes.id}&c=WW2`;
                let certurl = `https://nominal-rolls.dva.gov.au/certificate/${person.attributes.id}/WW2`;

                document.getElementById('advi').innerText = "";
                document.getElementById("basic-info").style.display = "block";

                if (!placeofbirth) {
                    document.getElementById("home").style.visibility = "hidden";
                } else {

                    if (placeofbirth.includes(",")) {
                        placeofbirth = toTitleCase(placeofbirth).split(", ");
                        document.getElementById("home").style.visibility = "unset";
                        placeofbirth[1] = placeofbirth[1].toUpperCase();
                        placeofbirth = placeofbirth.join(", ");
                    } else {
                        placeofbirth = toTitleCase(placeofbirth);
                    }

                    document.getElementById('home').innerText = placeofbirth;
                }

                let serviceName = person.attributes.ServiceName.toLowerCase();
                if (serviceName == "army") {
                    serviceName = "Australian Army"
                } else if (serviceName = "raaf") {
                    serviceName = "Royal Australian Air Force"
                } else if (" " in serviceName) {
                    serviceName = toTitleCase(serviceName);
                } else {
                    serviceName = serviceName.toUpperCase();
                }

                let dateOfBirth = toTitleCase(people[inty % people.length].attributes.DateOfBirth);
                let namespan = document.createElement("span");
                namespan.innerText = name;
                document.getElementById('background-names').appendChild(namespan);
            
                Array.from(document.getElementsByClassName("name")).forEach((e) => {e.innerText = name})
                document.getElementById('dob').innerText = dateOfBirth;
                document.getElementById('service').innerText = serviceName;

                document.getElementById('dbi').innerText = person.attributes.id;

                document.getElementById('info').innerText = `View ${name}'s service record`;
                document.getElementById('info').href = infourl;

                document.getElementById('cert').innerText = "Generate certificate";
                document.getElementById('cert').href = certurl;

                document.querySelectorAll('.iter, .modal-iter').forEach((e) => {
                    e.innerText = `${inty} out of ${people.length}`;
                });

                inty++;

            }
            
        }, __flash_spd__);
    }, __intro_spd__)
})

let modal = false;
let itb, interval, ftext, jparse;

function openModal(e) {

    doDetailWrite = false;
    let advDeetsWritten = false;
    
    itb = document.getElementById('modal').innerHTML;
    e.style.filter = "blur(5px)";
    document.getElementById('modal').style.top = 0;

    document.getElementById('mTitle').innerText = "We're attemping to load advanced information from the DVA nominal rolls. This uses insecure cross origin and may not work.";

    fetch(`http://cross-origin.shaunak.io/https://nominal-rolls.dva.gov.au/veteran?id=${document.getElementById('dbi').innerText}&c=WW2`).then((r) => {
        r.text().then((t) => {

            ftext = t;
            jparse = JSON.parse(t.split("var vetJSON = JSON.parse('").pop().split("');")[0]);

            document.getElementById("basic-info").style.display = "none";
            let advancedInformationTable = document.createElement("table");

            delete jparse.service;
            delete jparse.serviceNumber;
            jparse.units = jparse.units.map((i) => {return i.unitName}).join(", ");
            jparse['additionalServiceNumbers'] = jparse['additionalServiceNumbers'].map((i) => {return i.value}).join(", ");

            jparse = Object.assign(jparse, jparse.attributes);
            delete jparse['attributes'];

            Array.from(Object.keys(jparse)).forEach((key) => {

                if (jparse[key] != "") {

                    let newRow = document.createElement('tr');
                    newRow.classList.add(key == "Prisoner of War" ? "powrow" : "trow");

                    let tEntryA = document.createElement('td');
                    tEntryA.classList.add("t-key");
                    tEntryA.innerText = key;

                    let tEntryB = document.createElement('td');
                    tEntryB.classList.add("t-value");
                    tEntryB.innerText = jparse[key];

                    newRow.appendChild(tEntryA);
                    newRow.appendChild(tEntryB);
                    advancedInformationTable.appendChild(newRow);
                }

            });

            document.getElementById('advi').appendChild(advancedInformationTable);
            document.getElementById('mTitle').innerText = `Advanced information for ${jparse['Rank']} ${jparse.firstName} ${jparse.surname}`;

        })
    }).catch((err) => {
        document.getElementById("basic-info").style.display = "block";
        document.getElementById('mTitle').innerText = "Prisoner informaton (from DVA nominal rolls, click red button for advanced)";
    })

    setTimeout(() => {document.getElementById('pg1').onclick = closeModal;}, 1000)

}

function closeModal() {
    doDetailWrite = true;
    console.log("closing modal");
    document.getElementById('person_card').style.filter = "none";
    document.getElementById('modal').style.top = "-200vh";

    setTimeout(() => {document.getElementById('pg1').onclick = null;}, 1000)

}
