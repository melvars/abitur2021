fetch("api/votes")
    .then((response) => response.json())
    .then((response) => {
        const ctx = document.getElementById("votes").getContext("2d");
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: response.map((v) => v.name),
                datasets: [
                    {
                        label: "# of Votes",
                        data: response.map((v) => v.votes || 0),
                        backgroundColor: () => "#" + (Math.random().toString(16) + "0000000").slice(2, 8),
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                legend: {
                    display: false,
                },
                tooltips: {
                    enabled: false,
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
    });
