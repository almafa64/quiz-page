const test = document.getElementById("test");

function alphaSort(a, b){
	return (a.name > b.name) ? 1 : -1;
}

function createListItem(data, currentOl, newText = ""){
	const newList = currentOl.appendChild(document.createElement("li"));
	const newerText = newText + data.name;

	const a = newList.appendChild(document.createElement("a"));
	a.innerText = data.name;

	if(data.no == undefined || data.no == 0) a.href = `quizes/${newerText}/index.html`;
	
	if(data.subs.length != 0){
		const ol = document.createElement("ol");
		ol.style.display = "none";

		const borderButton = newList.appendChild(document.createElement("span"));
		borderButton.classList = "borderArrow";
		const button = borderButton.appendChild(document.createElement("span"));
		button.classList = "down arrow";
		borderButton.onclick = (e) => {
			if(button.classList == "down arrow"){
				borderButton.nextElementSibling.style.display = "";
				button.classList = "up arrow";
			}
			else{
				borderButton.nextElementSibling.style.display = "none";
				button.classList = "down arrow";
			}
		};

		newList.appendChild(ol);
		data.subs.sort(alphaSort).forEach(e => {
			createListItem(e, newList.lastChild, `${newerText}_`);
		}); 
	}
}

files.sort(alphaSort).forEach(e => {
	createListItem(e, test);
})