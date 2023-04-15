const start = document.getElementById("start");

start.addEventListener("click", () => {
	const link = window.location.href;
	const startIndex = link.indexOf("quizes/") + "quizes/".length;
	const endIndex = link.indexOf("/", startIndex);

	/*const endIndex2 = startIndex - "quizes".length-2;
	window.location.href = `${link.substring(0, endIndex2)}/quizes/${link.substring(startIndex, endIndex)}/1.html`;*/
	window.location.href = `/quizes/${link.substring(startIndex, endIndex)}/1.html`;
});