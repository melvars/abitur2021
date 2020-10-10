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
    console.log(questions);
    const teacher = document.querySelector("ul#teacher");
    const pupil = document.querySelector("ul#pupil");
    questions.forEach((question) => {
        const list = question.type === "teacher" ? teacher : pupil;
        let answers = "";
        question.answers.forEach((answer) => {
            answers += `<li>${answer.name} ${answer.middlename ? answer.middlename + " " : ""}${answer.surname}: ${
                answer.count
            }</li>`;
        });
        list.insertAdjacentHTML("beforeend", `<li>${question.question}<br><ol>${answers}</ol></li>`);
    });
}
