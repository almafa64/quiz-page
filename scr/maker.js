const type = document.getElementById("type");
const hold = document.getElementById("hold");

var quizType = NaN;

function addRow(){
	if(isNaN(quizType)) return;

	const p = hold.appendChild(document.createElement("p"));
	p.append(`${hold.childElementCount}, `, document.createElement("textarea"));

	switch(quizType){
		case 0:
		case 1:
		case 3: // sorba + jelölő + választó
			break;
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
}

function changeType(){
	quizType = parseInt(type.value);
	hold.innerHTML = "";
	addRow();
}