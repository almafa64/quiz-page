const next = document.getElementById("next");
next.style.display = "none";

const prev = document.getElementById("prev");

const link = decodeURI(window.location.href);
const startIndex = link.lastIndexOf("/") + 1;
const endIndex = link.lastIndexOf(".html");
const curNum = parseInt(link.substring(startIndex, endIndex)) - 1;

const startIndex2 = link.indexOf("quizes/") + "quizes/".length;
const endIndex2 = link.indexOf("/", startIndex2);
const curName = link.substring(startIndex2, endIndex2);

const curElement = data;//data.find(e => e.name == curName);

const answers = curElement.good[curNum];

const curNumTooBig = (curElement.max_page == curNum+1);
const curNumTooSmall = (curNum) <= 0;

const quiz = document.getElementById("quiz");
const quizType = parseInt(quiz.getAttribute("t"));

const jump = document.getElementById("jump");

function nextLink(){
	window.location.href = `../../quizes/${curName}/${curNum+2}.html`;
}
function prevLink(){
	window.location.href = `../../quizes/${curName}/${curNum}.html`;
}

function shuffle(base){
	for (var i = base.children.length; i >= 0; i--) { //https://stackoverflow.com/a/11972692
		base.appendChild(base.children[Math.random() * i | 0]);
	}
}

function check(e){
	function goodFinish(){
		alert("jó válasz");
		e.style.display = "none";
		next.style.display = "";
	}

	var good = false;

	switch(quizType){
		case 0: // jelölő gombok
			const checks = quiz.querySelectorAll("input:checked");
			if(checks.length == answers.length){
				good = true;
				checks.forEach(e => {
					if(!answers.includes(parseInt(e.id))) {
						good = false;
						return;
					}
				});
			}
			break;
		case 1: // rádió gombok
			const radio = quiz.querySelector("input:checked");
			good = (radio != undefined && radio.id == answers);
			break;
		case 3: //sorba rakós
		case 2: //párba rakós
			good = true;
			const rows = quiz.children;
			for(var i = 1; i < rows.length; i++){
				const row = rows[i];
				const child = row.lastElementChild;
				if(child.childElementCount == 0 || answers[row.id] != child.firstElementChild.innerText){
					good = false;
					break;
				}
			}
			break;
		case 4:
			break;
		case 5:
			break;
	}
	
	if(good) goodFinish();
	else if(confirm("Rossz válasz!\nSzabad a gazda?")){
		switch(quizType){
			case 0:
				const checks = quiz.querySelectorAll("input");
				checks.forEach(e => e.checked = answers.includes(parseInt(e.id)));
				break;
			case 1:
				const radios = quiz.querySelectorAll("input");
				radios.forEach(e => {
					if(e.id == answers){
						e.checked = true;
						return;
					}
				});
				break;
			case 2: // holdHeight stored in check.holdHeight
				const rowsPair = quiz.children;
				const first = rowsPair[0].firstElementChild
				first.innerHTML = "";
				first.style.height = check.holdHeight;

				for(var i = 1; i < rowsPair.length; i++){
					const row = rowsPair[i];
					const last = row.lastElementChild;
					if(last.childElementCount == 0) last.appendChild(document.createElement("p")).innerText = answers[row.id];
					else last.firstElementChild.innerText = answers[row.id];
				}
			case 3:
				const rowsSort = quiz.children;

				for(var i = 1; i < rowsSort.length; i++){
					const row = rowsSort[i];
					const last = row.lastElementChild;
					last.firstElementChild.innerText = answers[row.id];
				}
				break;
			case 4: // map stored in check.map
				L.geoJSON(answers).addTo(check.map);
				break;
		}
		setTimeout(goodFinish, 50);
	}
}

if(curNumTooBig) next.disabled = true;
else next.addEventListener("click", nextLink);

if(curNumTooSmall) prev.disabled = true;
else prev.addEventListener("click", prevLink);

for(var i = 1; i <= curElement.max_page; i++){
	const div = jump.appendChild(document.createElement("div"));
	div.classList.value = "p-sm-2 px-sm-3 p-1 px-2 mx-sm-2 mx-1";
	const a = div.appendChild(document.createElement("a"));
	a.href = `../../quizes/${curName}/${i}.html`;
	a.innerText = `${i}.`;
}

switch(quizType){
	case 3: //sorrendbe rakós megkeverése
		var drags = quiz.querySelectorAll(".drag");
		var parents = [];
		for (var i = 0, n = drags.length; i < n; i++) {
			answers.push(drags[i].innerText);
			parents.push(drags[i].parentElement);
			drags[i].remove();
		}
		for (var i = 0; i < n; i++) {
			while(true){
				const parent = parents[Math.random() * n | 0]
				if(!parent.lastElementChild.classList.contains("drag")){
					parent.appendChild(drags[i]);
					break;
				}
			}
		}
	case 2: //párosítos + sorrendbe rakós
		function removeRun(){
			if(onpointermove.run != undefined){
				clearTimeout(onpointermove.run);
				onpointermove.run = undefined;
			}
		}
		
		const isSotring = drags != undefined; // false: pairing, true: sorting
		const hold = document.getElementById("hold");
		const holdBaseHeight = isSotring ? "" : (check.holdHeight = window.getComputedStyle(hold.firstElementChild).height);
		var activeE = null;
		var lastPlace = "";

		onpointermove = e => {
			function loopAfterNoMove(newUpDownScrool){
				//newUpDownScrool = -1: up / 1: down
				onpointermove.run = setTimeout(function run() {
					window.scrollBy(0, 3 * newUpDownScrool);
					onpointermove.run = setTimeout(run, 1);
				}, 1);
				
			}

			if(activeE != null){
				removeRun();

				activeE.style.top = `${parseFloat(activeE.style.top) + e.movementY}px`;
				activeE.style.left = `${parseFloat(activeE.style.left) + e.movementX}px`;

				if(e.clientY < (window.innerHeight/10)) loopAfterNoMove(-1);
				else if(e.clientY > (window.innerHeight/1.112)) loopAfterNoMove(1);
			}
		};
		onpointerup = e => {
			if(activeE != null){
				removeRun();

				activeE.remove();
				var under = document.elementFromPoint(e.clientX, e.clientY);

				activeE.style.position = activeE.style.top = activeE.style.left = activeE.style.width = activeE.style.height = "";
				
				const underUndifned = under == undefined;
				switch(underUndifned ? "" : under.tagName){
					case "IMG":
					case "P":
						under = under.parentElement;
					case "DIV":
						if(under.classList.contains("drag")){
							const parent = under.parentElement;
							const tmpCLassList = activeE.classList.value;

							activeE.classList = under.classList;

							under.remove();

							if(under.childElementCount > 0){
								under.classList.value = tmpCLassList;

								const lastCard = document.getElementById(lastPlace);
								if(lastPlace != "hold") lastCard.lastElementChild.remove();
								lastCard.appendChild(under);
							}
							parent.appendChild(activeE);
							break;
						}
					default:
						if(lastPlace == "hold" || (!underUndifned && under.id == "hold")){
							activeE.classList.value = "m";
							hold.appendChild(activeE);
						}
						else{
							const row = document.getElementById(lastPlace);
							const lastCard = row.lastElementChild;
							activeE.classList = lastCard.classList;
							
							lastCard.remove();
							row.appendChild(activeE);
						}
						break;
				}

				activeE = null;
				lastPlace = document.body.style.userSelect = "";
			}
		};

		const draggables = isSotring ? drags : quiz.querySelectorAll(".m");
		draggables.forEach(e => {
			e.addEventListener("pointerdown", ev => {
				if(ev.button != 0) return;
				const parent = e.parentElement;
				lastPlace = parent.id;

				activeE = e;
				
				const width = window.getComputedStyle(e).width;
				const height = window.getComputedStyle(e).height;

				activeE.style.position = "fixed";
				activeE.style.top = `${ev.clientY - (parseFloat(height)/2)}px`;
				activeE.style.left = `${ev.clientX - (parseFloat(width)/2)}px`;
				activeE.style.width = width;
				activeE.style.height = height;
				quiz.appendChild(activeE);

				if(lastPlace == "hold"){
					if(hold.childElementCount == 0) hold.style.height = holdBaseHeight;
				}
				else parent.appendChild(document.createElement("div")).classList.value = `col-${(isSotring?"11":"5")} mx-auto drag`;

				document.body.style.userSelect = "none";
			});
		});
		break;
	case 1: // rádió és
	case 0: // jelölő randomizálása
		shuffle(quiz);
		break;
	case 4:
		const map = new L.map('quiz', {
			center: [47.487667, 19.080785],
			zoom: 11.2,
			worldCopyJump: true,
		});

		check.map = map;

		/*L.geoJSON(coordsJSON, {
			onEachFeature: onEachFeature,
			pointToLayer: pointToLayer
		}).addTo(map);*/
		
		const domainNum = quiz.getAttribute("d");
		var tileDomain;
		switch(domainNum){
			case "0": tileDomain = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'; break;
			case "1": tileDomain = 'https://tile.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'; break;
			case "2": tileDomain = 'https://tile.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png'; break;
		}

		new L.tileLayer(tileDomain, {
			attribution: `${((domainNum != "0")?'&copy; <a href="https://carto.com/attributions">CARTO</a>':'')} &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`,
		}).addTo(map);
		break;
}