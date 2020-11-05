let date;
let chart;

fetch("/admin/api/votes")
    .then((response) => response.json())
    .then((response) => {
        data = response;
        render("pie");
    });

function render(type) {
    const ctx = document.getElementById("votes").getContext("2d");
    chart = new Chart(ctx, {
        type,
        data: {
            labels: data.map((v) => v.name),
            datasets: [
                {
                    label: "# of Votes",
                    data: data.map((v) => v.votes || 0),
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

let index = 0;
const types = ["doughnut", "bar", "polarArea", "radar", "line", "pie"];
document.getElementById("switch").addEventListener("click", () => {
    chart.destroy();
    render(types[index]);
    if (index + 1 < types.length) index++;
    else index = 0;
});
