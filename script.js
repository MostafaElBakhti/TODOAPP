let myInput = document.getElementById("myInput");
let button = document.getElementById("button");
let add = document.getElementById("add");

// function to check if input is empty
function checkInput() {
    if (myInput.value.trim() === "") {
        myInput.focus();
        myInput.style.border = "1px solid red";
        return false;
    } else {
        myInput.style.border = "1px solid black";
        return true;
    }
}

button.addEventListener("click", function () {
    if (checkInput()) {
        // create main div
        let myDiv = document.createElement("div");
        myDiv.classList.add("myDiv");

        // create span for task text
        let taskText = document.createElement("span");
        taskText.textContent = myInput.value;
        myDiv.appendChild(taskText);

        // create right div for buttons
        let right = document.createElement("div");
        right.classList.add("right");
        myDiv.appendChild(right);

        // create Remove button
        let remove = document.createElement("button");
        remove.classList.add("remove");
        remove.textContent = "Remove";
        right.appendChild(remove);

        // create Done button
        let done = document.createElement("button");
        done.classList.add("done");
        done.textContent = "Done";
        right.appendChild(done);

        // add task to the list
        add.appendChild(myDiv);
        myInput.value = ""; // clear input

        // event remove
        remove.addEventListener("click", function () {
            myDiv.remove();
        });

        // event done
        done.addEventListener("click", function () {
            taskText.style.textDecoration = "line-through";
        });
    }
});
