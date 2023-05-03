const type = document.getElementById("type");
const hold = document.getElementById("hold");
const saveBut = document.getElementById("save");

var quizType = NaN;
var topicName = "minecraft";
var quizNum = 0;

function addRow(){
	if(isNaN(quizType)) return false;

	const p = hold.appendChild(document.createElement("p"));
	p.append(`${hold.childElementCount}, `, document.createElement("textarea"));

	switch(quizType){
		case 2: // párba
			p.append(" - ", document.createElement("textarea"));
			break;
		case 4: // térkép
			alert("no");
			break;
	}

	if(addRow.button == undefined){
		const button = p.appendChild(document.createElement("button"));
		button.innerText = "mégegy sor hozzáadása";
		button.type = "button";
		button.addEventListener("click", e => {
			addRow();
		});
		addRow.button = button;
	}
	else p.appendChild(addRow.button);
	return true;
}

function changeType(){
	quizType = parseInt(type.value);
	hold.innerHTML = "";
	saveBut.disabled = !addRow();
}

function save(){
	var send = "";
	const areas = hold.querySelectorAll("textarea");

	areas.forEach(e => {
		if(e.value.length != 0) send += e.value + ",";
	});
	send = send.slice(0, -1);
	
	fetch(`/save?t=${quizType}&n=${topicName}&q=${quizNum}`, {
		method: 'POST',
		headers: {
			'Accept': 'text/plain',
			'Content-Type': 'text/plain'
		},
		body: send
	})
	//.then(() => window.location.reload())
	.catch(err => console.error(err));
}

if(location.protocol == "file:"){
	alert("Ez az oldal nem elérhető szerver nélkül (és valószínűleg egy lusta programozó miatt tudtad elérni)");
	window.history.back();
}