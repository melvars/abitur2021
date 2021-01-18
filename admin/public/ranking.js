const classes = ["teacher", "TGM13.1", "TGM13.2", "TGTM13.1", "TGI13.1", "TGI13.2"];

fetch("api/questions")
    .then((questions) => questions.json())
    .then((questions) => {
        fetch("api/answers")
            .then((answers) => answers.json())
            .then((answers) => {
                questions.forEach((question) => (question.answers = []));
                answers.forEach((answer) => questions[answer.question_id - 1].answers.push(answer));
                render(questions);
            });
    });

function render(questions) {
    const list = document.querySelectorAll("#list ul");

    list.forEach((elem) => {
        elem.style.display = "none";
        elem.previousElementSibling.addEventListener("click", () => {
            elem.style.display = elem.style.display === "none" ? "block" : "none";
            console.log(elem.nextElementSibling);
        });
    });

    questions.forEach((question) => {
        let answers = ["", "", "", "", "", ""];
        question.answers.forEach((answer) => {
            answers[classes.indexOf(answer.class)] += `<li>${answer.name} ${
                answer.middlename ? answer.middlename + " " : ""
            }${answer.surname}: ${answer.count}</li>`;
        });

        answers.forEach((elem, ind) => {
            if ((question.type != "teacher" || ind == 0) && (question.type == "teacher" || ind != 0))
                list[ind].insertAdjacentHTML("beforeend", `<li>${question.question}<br><ol>${answers[ind]}</ol></li>`);
        });
    });
}
