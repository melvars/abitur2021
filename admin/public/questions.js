let chart;
const data = [];
let question_index = 0;

const label = document.getElementById("question");

fetch("/admin/api/percentages")
    .then((response) => response.json())
    .then((response) => {
        response.forEach((e) => {
            if (!data[e.id - 1]) data[e.id - 1] = [];
            data[e.id - 1].push(e);
        });
        render(question_index);
    });

function render(index) {
    const ctx = document.getElementById("questions").getContext("2d");
    const q = data[question_index];
    label.innerText = q[0].question;
    chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: [...new Set(q.map((a) => a.option))],
            datasets: [
                {
                    label: "# of Votes",
                    data: q.map((a) => a.count || 0),
                    backgroundColor: () => "#" + (Math.random().toString(16) + "0000000").slice(2, 8),
                    borderWidth: 1,
                },
            ],
        },
        options: {
            legend: {
                display: false,
            },
            scales: {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true,
                            precision: 0,
                        },
                    },
                ],
            },
        },
    });
}

document.getElementById("switch").addEventListener("click", () => {
    chart.destroy();
    render(++question_index);
    if (question_index + 1 < data.length) question_index++;
    else question_index = 0;
});
