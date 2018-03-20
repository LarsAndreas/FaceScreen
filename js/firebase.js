function firebaseSetup() {

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyBOSZzFGmXH0HWaR4PkR2CFQuECyoi9BOA",
        authDomain: "facescreen-19ccb.firebaseapp.com",
        databaseURL: "https://facescreen-19ccb.firebaseio.com",
        projectId: "facescreen-19ccb",
        storageBucket: "facescreen-19ccb.appspot.com",
        messagingSenderId: "304607951341"
    };
    firebase.initializeApp(config);

    let database = firebase.database();


    function sendToFirebase(type, to, text, from = null) {
        var time = new Date();
        let now = time.getTime()
        if (type == "post") {
            let ref = database.ref("forum/" + to + "/post");
            ref.push({
                "brukerid": from,
                "info": text,
                "tid": now
            });
        } else if (type == "message" && from != null) {
            let ref = database.ref("message/");
        }
    }


    function mapCreatePost(buttons, i) {

        // map button to textAreas
        let textAreas = Array.from(document.getElementsByClassName("sending"));
        let connectedBox = textAreas[i].value;

        //change so you can make it a string (do in future)
        console.log(connectedBox)

        //createPost(connectedBox);
        sendToFirebase("post", "1", connectedBox, "1")
    }

    function displayPost(snapshot) {
        function createDivElement(style) {
            let name = document.createElement("div");
            name.className = style
            return name
        }

        //values
        let key = snapshot.key;
        let time = snapshot.val().tid;
        var date = new Date(time);
        let postInfo = snapshot.val().info;
        let brukerid = snapshot.val().brukerid;
        let brukerNavnRef = database.ref("bruker");
        let username;

        brukerNavnRef.once("child_added",function(snapshotBR) {
            username = snapshotBR.val().username;

            //create post
            let divCreate = createDivElement("post");
            let element = document.getElementById("feed");
            let elementLast = document.getElementById("feed").lastChild;
            element.insertBefore(divCreate, elementLast);

            //create elements for board
            let PreDiv = Array.from(element.getElementsByClassName("post")).slice(-1)[0] ;
            let boardClass = createDivElement("board");
            let dateClass = createDivElement("date");
            let fromClass = createDivElement("fromName");

            //create key element for post
            let keyClass = createDivElement("key")
            function breakTag() {
                var element = document.createElement("BR");
                return element;
            }

            function nToBr(inputString) {
                // change \n to <br> and return paragraph element or document.createTextNode(inputString)
                let array = inputString.split("\n");
                if (array.length == 1) {
                    return document.createTextNode(inputString)
                } else {
                    let paragraph = document.createElement("p");
                    let node;
                    let br;
                    for (let i = 0; i < array.length; i++) {
                        br = document.createElement("br")
                        node = document.createTextNode(array[i]);
                        paragraph.appendChild(node);
                        paragraph.appendChild(br);
                    }
                    return paragraph
                }
            }

            //create text inside board
            let node;
            node = nToBr(postInfo)
            let paragraph = document.createElement("p");
            paragraph.appendChild(node)
            boardClass.appendChild(paragraph);
            node = document.createTextNode("This is Key: ")
            keyClass.appendChild(node);
            node = document.createTextNode(key)
            keyClass.appendChild(node);
            node = document.createTextNode("Created: ")
            dateClass.appendChild(node);
            node = document.createTextNode(date)
            dateClass.appendChild(node);
            node = document.createTextNode("Posted By: ")
            fromClass.appendChild(node);
            node = document.createTextNode(username)
            fromClass.appendChild(node);
            boardClass.appendChild(dateClass);
            boardClass.appendChild(fromClass);
            PreDiv.appendChild(keyClass)
            PreDiv.appendChild(boardClass);
        });
    }

    function getInfo(type, from) {
        if (type == "forum") {
            let posts = database.ref("forum/" + from + "/post").orderByChild("tid");
            posts.on("child_added", displayPost);
        } else if (type == "message") {

        }
    }
    getInfo("forum", "1");

    //add button function

    //post button
    let buttons = Array.from(document.getElementsByClassName("pushSend"));
    buttons.forEach((button,index) => {
        button.addEventListener("click", (e) => {
            mapCreatePost(buttons,index);
        })
    })

    let inpFind = document.getElementById("sok"); // kobling til søkefeltet
    inpFind.addEventListener("keydown", finnOrd);
    //let divResultat = document.getElementById("dropdown-content"); // kobling til div#resultat

    let divResultat = Array.from(document.getElementsByClassName("dropdown-content"))[0];

    function finnOrd(e) {
        if (e.keyCode === 13) { // bruker trykket return
            let valgt = inpFind.value;
            let ref = firebase.database().ref("forum/1/post").orderByChild("info").equalTo(valgt);
            ref.once("value").then(function (snapshot) {
                let funnet = snapshot.val();
                if (funnet) {
                    // vi fant noe som matcher
                    let htm = Object.entries(funnet).map(([k,v]) => {
                      let felt = Object.entries(v).map(([k,v]) => 
                          `<li>${k} : ${v}</li>`
                      );
                      return `<div class="dropdown-content-box">${k} <ol>${felt.join('')}</ol></div>`;
                    });
                    divResultat.innerHTML = htm;
                    console.log(htm)
                } else {
                    divResultat.innerHTML = "Ingen treff (sjekk stor/liten bokstav)";
                }
            });
        }
    }
}

function styleSetup() {



    let popularUser = document.getElementById("popular-users");
    let dark = document.getElementById("dark")
    popularUser.addEventListener("mouseover", (e) => {
        //expand
        document.documentElement.style.setProperty('--user-width--', '25%');
        dark.style.width = "calc(80% - 4px - 25%)";
        dark.style.opacity = "1";
        dark.style.transition = "width 300ms";
    })

    popularUser.addEventListener("mouseleave", (e) => {
        //retract
        document.documentElement.style.setProperty('--user-width--', '15%');  //burde gjort dette for smallToolBar() og bigToolBar()
        popularUser.scrollBy(0,-popularUser.scrollTop);
        dark.style.width = "calc(80% - 4px - 15%)";
        dark.style.opacity = "0";
        dark.style.transition = "width 300ms";
    });

    //toolbar change on scroll
    let feed = document.getElementById("feed");
    let endFog = document.getElementById("endFog");
    feed.onscroll = function() {
        scrollFunction();
    };

    //toolbar change on hover
    let navbar = document.getElementById("navbar");
    navbar.addEventListener("mouseover", (e) => {
        expandFunction();
        dark.style.opacity = "1";
        dark.style.width = "calc(80% - 4px)";
        dark.style.transition = "top 300ms";
    });
    navbar.addEventListener("mouseout", (e) => {
        retractFunction();
        dark.style.opacity = "0";
        dark.style.width = "calc(80% - 4px - 15%)"
        dark.style.transition = "top 300ms";
    });


    //button event
    let buttonPop = document.getElementById("popup");
    buttonPop.addEventListener("click", clickOpen)

    let buttonClosePop = document.getElementById("exit");
    buttonClosePop.addEventListener("click", clickClose);

    let clickDark = document.getElementById("sikkerhet");
    clickDark.addEventListener("click", (e) => {
        if (e.target.id === "sikkerhet") {
            clickClose()
        }
    });

    function smallToolBar() {
        let padding = 14;
        document.getElementById("navbar").style.top = "-25px";
        document.getElementById("feed").style.top = "45px";
        document.getElementById("popular-users").style.top = "45px";
        document.getElementById("dark").style.top = "45px";
        let navbarLinks = Array.from(document.getElementsByClassName("navbarLink"));
        navbarLinks.forEach((a) => {
            a.style.height = String(45 - 2 * padding) + "px";
            a.style.paddingTop = String(padding + (25 / 2)) + "px";
            a.style.paddingBottom = String(padding + (25 / 2)) + "px";
        });
    }

    function bigToolBar() {
        let padding = 14;
        document.getElementById("navbar").style.top = "0px";
        document.getElementById("feed").style.top = "70px";
        document.getElementById("popular-users").style.top = "70px";
        document.getElementById("dark").style.top = "70px";
        let navbarLinks = Array.from(document.getElementsByClassName("navbarLink"));
        navbarLinks.forEach((a) => {
            a.style.height = String(70 - (2 * padding)) + "px";
            a.style.paddingTop = String(padding) + "px";
            a.style.paddingBottom = String(padding) + "px";
        });
    }


    function retractFunction() {
        if (feed.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            smallToolBar()
        }
    }

    function expandFunction() {
        bigToolBar()
    }
    function scrollFunction() {
        if (feed.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            smallToolBar()
        } else {
            bigToolBar()
        }
    }


    function clickOpen() {
        let sikkerhet = document.getElementById("sikkerhet");
        let sikkerhetContent = document.getElementById("sikkerhet-content");
        let animation = document.getElementById("animation");
        animation.style.opacity = "0.3";
        sikkerhet.style.opacity = "1";
        sikkerhetContent.style.opacity = "1";
        sikkerhet.style.pointerEvents = "all";
        sikkerhetContent.style.pointerEvents = "all";
    }

    function clickClose(e){
        let sikkerhet = document.getElementById("sikkerhet");
        let sikkerhetContent = document.getElementById("sikkerhet-content");
        let animation = document.getElementById("animation");
            animation.style.opacity = "0";
            sikkerhet.style.opacity = "0";
            sikkerhetContent.style.opacity = "0";
            sikkerhet.style.pointerEvents = "none";
            sikkerhetContent.style.pointerEvents = "none";
            sikkerhetContent.scrollTop = 0;
    }
}